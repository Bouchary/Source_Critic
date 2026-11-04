import type { ExternalSourceItem } from "@/lib/schema";
import { canonicalUrlKey } from "@/lib/web-sources";

export type SourceVerificationStatus =
  | "extrait_verifie"
  | "extrait_non_trouve"
  | "page_inaccessible"
  | "contenu_non_verifiable";

export interface SourceVerification {
  status: SourceVerificationStatus;
  checkedAt: string;
}

export interface PassageVerificationOptions {
  /** Nombre maximum de sources à vérifier (priorité aux sources citées). */
  maxSources?: number;
  /** Timeout par page. */
  timeoutMs?: number;
  /** Taille maximum lue par page (octets). */
  maxBytes?: number;
}

const DEFAULT_MAX_SOURCES = 8;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_BYTES = 2_000_000;

/** Durée de validité du cache de vérification (1 h). */
const CACHE_TTL_MS = 60 * 60 * 1000;
/** Taille maximum du cache (les entrées les plus anciennes sont évacuées). */
const CACHE_MAX_ENTRIES = 100;

const cache = new Map<
  string,
  { verification: SourceVerification; expiresAt: number }
>();

/**
 * Extrait les URLs citées par le modèle (claimAudit + chaîne de confiance),
 * afin de donner la priorité de vérification aux sources réellement utilisées.
 */
export function collectCitedUrls(modelOutput: {
  auditTrail?: {
    claimAudit?: { sourceUrls?: string[] }[];
    sourceTrustChain?: { url?: string }[];
  };
}): string[] {
  const urls: string[] = [];

  for (const item of modelOutput.auditTrail?.claimAudit ?? []) {
    for (const url of item.sourceUrls ?? []) {
      if (typeof url === "string" && url.trim()) urls.push(url);
    }
  }

  for (const item of modelOutput.auditTrail?.sourceTrustChain ?? []) {
    if (typeof item.url === "string" && item.url.trim()) urls.push(item.url);
  }

  return urls;
}

/* -------------------------------------------------------------- */
/* Normalisation pour la comparaison                              */
/* -------------------------------------------------------------- */

/**
 * Normalisation agressive (accents, casse, ponctuation) : conçue pour
 * tolérer les différences d'entités HTML, de guillemets et d'espacement
 * entre un extrait de moteur de recherche et le contenu de la page.
 */
export function normalizeForMatch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Découpe un extrait de moteur de recherche en fragments comparables :
 * les moteurs insèrent souvent des ellipses, des dates ou des tirets.
 */
export function splitSnippetFragments(snippet: string) {
  return snippet
    .split(/\.{3,}|…|\s[—–|]\s|\s-\s/g)
    .map((fragment) => normalizeForMatch(fragment))
    .filter((fragment) => fragment.length >= 25);
}

/* -------------------------------------------------------------- */
/* Extraction du texte d'une page HTML                            */
/* -------------------------------------------------------------- */

function decodeEntities(html: string) {
  return html
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(Number(dec)),
    )
    .replace(/&nbsp;/gi, " ")
    .replace(/&/gi, "&")
    .replace(/</gi, "<")
    .replace(/>/gi, ">")
    .replace(/"/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/'/gi, "'")
    .replace(/&laquo;/gi, "«")
    .replace(/&raquo;/gi, "»")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&hellip;/gi, "…");
}

function htmlToText(html: string) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " "),
  )
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Vérifie qu'un extrait de recherche figure bien dans le contenu d'une page.
 * La recherche porte à la fois sur le texte visible et sur le HTML brut
 * (les extraits proviennent parfois de la meta description).
 */
export function verifySnippetInHtml(snippet: string, html: string): {
  status: SourceVerificationStatus;
} {
  const fragments = splitSnippetFragments(snippet);
  if (!fragments.length) return { status: "contenu_non_verifiable" };

  const pageNorm = normalizeForMatch(`${htmlToText(html)} ${html}`);
  if (pageNorm.length < 200) return { status: "contenu_non_verifiable" };

  const matched = fragments.some((fragment) => pageNorm.includes(fragment));
  return { status: matched ? "extrait_verifie" : "extrait_non_trouve" };
}

/* -------------------------------------------------------------- */
/* Fetch sécurisé                                                 */
/* -------------------------------------------------------------- */

const BLOCKED_HOST_PATTERNS = [/^localhost$/i, /\.local$/i, /\.internal$/i];

function isPrivateHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(host))) return true;
  if (host === "::1" || host === "0.0.0.0") return true;

  const match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (match) {
    const a = Number(match[1]);
    const b = Number(match[2]);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true;
  }

  return false;
}

async function readCappedBody(
  response: Response,
  maxBytes: number,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return response.text();

  const decoder = new TextDecoder("utf-8", { fatal: false });
  const chunks: string[] = [];
  let received = 0;

  while (received < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    chunks.push(decoder.decode(value, { stream: true }));
    if (received >= maxBytes) break;
  }

  chunks.push(decoder.decode());
  return chunks.join("");
}

async function verifyOneSource(
  source: ExternalSourceItem,
  options: Required<PassageVerificationOptions>,
): Promise<SourceVerification> {
  const now = new Date().toISOString();

  if (!source.snippet || !source.snippet.trim()) {
    return { status: "contenu_non_verifiable", checkedAt: now };
  }

  let url: URL;
  try {
    url = new URL(source.url);
  } catch {
    return { status: "contenu_non_verifiable", checkedAt: now };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { status: "contenu_non_verifiable", checkedAt: now };
  }
  if (isPrivateHost(url.hostname)) {
    return { status: "page_inaccessible", checkedAt: now };
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs,
  );

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SourceCritic/1.0; +https://github.com/Bouchary/Source_Critic)",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
      },
    });

    if (!response.ok) {
      return { status: "page_inaccessible", checkedAt: now };
    }

    const contentType = response.headers.get("content-type") || "";
    const looksHtml =
      contentType.includes("text/html") ||
      contentType.includes("application/xhtml") ||
      contentType === "";

    if (!looksHtml) {
      return { status: "contenu_non_verifiable", checkedAt: now };
    }

    const html = await readCappedBody(response, options.maxBytes);
    const { status } = verifySnippetInHtml(source.snippet, html);
    return { status, checkedAt: now };
  } catch {
    return { status: "page_inaccessible", checkedAt: now };
  } finally {
    clearTimeout(timeout);
  }
}

function cacheGet(key: string): SourceVerification | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.verification;
}

function cacheSet(key: string, verification: SourceVerification) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, {
    verification,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

/**
 * Vérifie les extraits des sources externes directement dans les pages
 * citées : fetch de la page, extraction du texte, contrôle que l'extrait
 * retourné par la recherche s'y trouve réellement.
 *
 * Les sources citées par le modèle (claimAudit, chaîne de confiance) sont
 * vérifiées en priorité ; les autres suivent dans la limite `maxSources`.
 */
export async function verifySourcePassages(
  sources: ExternalSourceItem[],
  citedUrls: string[],
  options: PassageVerificationOptions = {},
): Promise<ExternalSourceItem[]> {
  const resolved = {
    maxSources: options.maxSources ?? DEFAULT_MAX_SOURCES,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    maxBytes: options.maxBytes ?? DEFAULT_MAX_BYTES,
  };

  const citedKeys = new Set(
    citedUrls.map((url) => canonicalUrlKey(url)).filter(Boolean),
  );

  const targets = sources
    .map((source, index) => ({ source, index }))
    .sort(
      (a, b) =>
        Number(citedKeys.has(canonicalUrlKey(b.source.url))) -
          Number(citedKeys.has(canonicalUrlKey(a.source.url))) ||
        a.index - b.index,
    )
    .slice(0, resolved.maxSources);

  const verifiedByIndex = new Map<number, SourceVerification>();

  await Promise.allSettled(
    targets.map(async ({ source, index }) => {
      const key = canonicalUrlKey(source.url);
      const cached = cacheGet(key);
      const verification =
        cached ?? (await verifyOneSource(source, resolved));
      if (!cached) cacheSet(key, verification);
      verifiedByIndex.set(index, verification);
    }),
  );

  return sources.map((source, index) => {
    const verification = verifiedByIndex.get(index);
    return verification ? { ...source, verification } : source;
  });
}
