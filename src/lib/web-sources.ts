import type { ExternalSourceItem } from "@/lib/schema";

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    return new URL(trimmed).toString();
  } catch {
    return trimmed;
  }
}

function hostnameFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function pushSource(
  acc: ExternalSourceItem[],
  candidate: Partial<ExternalSourceItem> | null | undefined,
) {
  if (!candidate) return;

  const url = typeof candidate.url === "string" ? normalizeUrl(candidate.url) : "";
  if (!url) return;

  const title =
    typeof candidate.title === "string" ? candidate.title.trim() : "";
  const snippet =
    typeof candidate.snippet === "string" ? candidate.snippet.trim() : "";
  const domain =
    typeof candidate.domain === "string" && candidate.domain.trim()
      ? candidate.domain.trim()
      : hostnameFromUrl(url);

  acc.push({
    title,
    url,
    snippet,
    domain,
  });
}

function extractFromSourcesArray(value: unknown, acc: ExternalSourceItem[]) {
  if (!Array.isArray(value)) return;

  for (const source of value) {
    if (!source || typeof source !== "object") continue;

    const s = source as Record<string, unknown>;

    pushSource(acc, {
      title: typeof s.title === "string" ? s.title : "",
      url: typeof s.url === "string" ? s.url : "",
      snippet:
        typeof s.snippet === "string"
          ? s.snippet
          : typeof s.description === "string"
            ? s.description
            : "",
      domain: typeof s.domain === "string" ? s.domain : "",
    });
  }
}

function extractFromAnnotations(value: unknown, acc: ExternalSourceItem[]) {
  if (!Array.isArray(value)) return;

  for (const annotation of value) {
    if (!annotation || typeof annotation !== "object") continue;

    const a = annotation as Record<string, unknown>;

    const url =
      typeof a.url === "string"
        ? a.url
        : typeof a.source_url === "string"
          ? a.source_url
          : "";

    const title =
      typeof a.title === "string"
        ? a.title
        : typeof a.source_title === "string"
          ? a.source_title
          : "";

    const snippet =
      typeof a.snippet === "string"
        ? a.snippet
        : typeof a.text === "string"
          ? a.text
          : "";

    const domain =
      typeof a.domain === "string"
        ? a.domain
        : typeof a.source_domain === "string"
          ? a.source_domain
          : "";

    pushSource(acc, { title, url, snippet, domain });
  }
}

function walk(value: unknown, acc: ExternalSourceItem[]) {
  if (!value) return;

  if (Array.isArray(value)) {
    for (const item of value) walk(item, acc);
    return;
  }

  if (typeof value !== "object") return;

  const obj = value as Record<string, unknown>;

  // Cas documenté le plus direct via include: web_search_call.action.sources
  if (Array.isArray(obj.sources)) {
    extractFromSourcesArray(obj.sources, acc);
  }

  // Cas fréquent dans les sorties message/output_text enrichies
  if (Array.isArray(obj.annotations)) {
    extractFromAnnotations(obj.annotations, acc);
  }

  // Cas plus tolérant : certains objets portent directement url/title/domain/snippet
  if (
    (typeof obj.url === "string" || typeof obj.source_url === "string") &&
    (typeof obj.title === "string" ||
      typeof obj.source_title === "string" ||
      typeof obj.domain === "string" ||
      typeof obj.source_domain === "string")
  ) {
    pushSource(acc, {
      title:
        typeof obj.title === "string"
          ? obj.title
          : typeof obj.source_title === "string"
            ? obj.source_title
            : "",
      url:
        typeof obj.url === "string"
          ? obj.url
          : typeof obj.source_url === "string"
            ? obj.source_url
            : "",
      snippet:
        typeof obj.snippet === "string"
          ? obj.snippet
          : typeof obj.text === "string"
            ? obj.text
            : "",
      domain:
        typeof obj.domain === "string"
          ? obj.domain
          : typeof obj.source_domain === "string"
            ? obj.source_domain
            : "",
    });
  }

  for (const key of Object.keys(obj)) {
    walk(obj[key], acc);
  }
}

export function extractExternalSources(response: unknown): ExternalSourceItem[] {
  const acc: ExternalSourceItem[] = [];
  walk(response, acc);

  const seen = new Set<string>();

  return acc.filter((item) => {
    const normalized = normalizeUrl(item.url);
    if (!normalized) return false;
    if (seen.has(normalized)) return false;
    seen.add(normalized);

    item.url = normalized;
    item.domain = item.domain?.trim() || hostnameFromUrl(normalized);

    return true;
  });
}