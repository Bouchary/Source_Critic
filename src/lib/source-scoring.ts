import type { ExternalSourceItem } from "@/lib/schema";
import { canonicalUrlKey } from "@/lib/web-sources";

export type SourceQualityTier = "elevee" | "moyenne" | "faible";
export type ScoredSourceType =
  | "primaire"
  | "secondaire"
  | "tertiaire"
  | "indetermine";

export interface SourceQuality {
  /** Score composite 0-100. */
  score: number;
  tier: SourceQualityTier;
  sourceType: ScoredSourceType;
  /** Explications lisibles des critères retenus. */
  signals: string[];
}

export interface SourceScoringContext {
  /** Nombre de claims citant chaque URL (clé canonique). */
  claimCitations?: Map<string, number>;
  now?: Date;
}

/* -------------------------------------------------------------- */
/* Catégories de domaines                                          */
/* -------------------------------------------------------------- */

interface DomainCategory {
  /** Score de départ avant bonus/malus. */
  base: number;
  sourceType: ScoredSourceType;
  signal: string;
}

/**
 * Institutions et organismes officiels, recherche académique :
 * publications originales, données primaires.
 */
const INSTITUTIONAL_DOMAINS = [
  // France — administration et institutions
  "gouv.fr",
  "service-public.fr",
  "data.gouv.fr",
  "insee.fr",
  "ined.fr",
  "inrs.fr",
  "cnrs.fr",
  "inrae.fr",
  "ifri.org",
  "senat.fr",
  "assemblee-nationale.fr",
  "courdecassation.fr",
  "conseil-constitutionnel.fr",
  "conseil-etat.fr",
  "justice.fr",
  "cnil.fr",
  "ameli.fr",
  "ansm.sante.fr",
  "anses.fr",
  "has-sante.fr",
  "inpi.fr",
  "legifrance.gouv.fr",
  "vie-publique.fr",
  "banque-france.fr",
  "igf.finances.gouv.fr",
  "education.gouv.fr",
  "sante.gouv.fr",
  "interieur.gouv.fr",
  "diplomatie.gouv.fr",
  // Union européenne et organisations internationales
  "europa.eu",
  "ecb.europa.eu",
  "oecd.org",
  "who.int",
  "un.org",
  "unesco.org",
  "imf.org",
  "worldbank.org",
  "fao.org",
  "iea.org",
  "nato.int",
  "iom.int",
  "unhcr.org",
  "oie.int",
  "wto.org",
  // Recherche et publications scientifiques
  "nih.gov",
  "cdc.gov",
  "pubmed.ncbi.nlm.nih.gov",
  "ncbi.nlm.nih.gov",
  "nature.com",
  "science.org",
  "arxiv.org",
  "hal.science",
  "cairn.info",
  "openedition.org",
  "persee.fr",
  "elsevier.com",
  "springer.com",
  "thelancet.com",
  "bmj.com",
  "nejm.org",
];

/** Médias de référence : traitement secondaire d'informations primaires. */
const REFERENCE_MEDIA_DOMAINS = [
  "lemonde.fr",
  "lefigaro.fr",
  "liberation.fr",
  "lesechos.fr",
  "lexpress.fr",
  "lhumanite.fr",
  "la-croix.com",
  "mediapart.fr",
  "france24.com",
  "rfi.fr",
  "francetvinfo.fr",
  "franceinfo.fr",
  "courrierinternational.com",
  "arretsurimages.net",
  "factuel.afp.com",
  "reuters.com",
  "apnews.com",
  "afp.com",
  "bbc.com",
  "theguardian.com",
  "nytimes.com",
  "washingtonpost.com",
  "wsj.com",
  "ft.com",
  "economist.com",
  "bloomberg.com",
  "dw.com",
  "aljazeera.com",
  "spiegel.de",
  "corriere.it",
  "elpais.com",
];

/** Encyclopédies et wikis : tertiaire, point d'entrée mais pas étai final. */
const ENCYCLOPEDIC_DOMAINS = [
  "wikipedia.org",
  "wiktionary.org",
  "wikimedia.org",
  "britannica.com",
  "larousse.fr",
  "universalis.fr",
  "encyclopaediauniversalis.com",
];

/** Réseaux sociaux, plateformes de blogs et agrégateurs. */
const PLATFORM_DOMAINS = [
  "facebook.com",
  "instagram.com",
  "x.com",
  "twitter.com",
  "tiktok.com",
  "youtube.com",
  "reddit.com",
  "quora.com",
  "medium.com",
  "substack.com",
  "blogspot.com",
  "wordpress.com",
  "overblog.com",
  "linkedin.com",
  "tumblr.com",
  "pinterest.com",
  "scribd.com",
  "slideshare.net",
];

const CATEGORY_INSTITUTIONAL: DomainCategory = {
  base: 45,
  sourceType: "primaire",
  signal: "Domaine institutionnel, officiel ou scientifique",
};

const CATEGORY_MEDIA: DomainCategory = {
  base: 35,
  sourceType: "secondaire",
  signal: "Média de référence",
};

const CATEGORY_ENCYCLOPEDIA: DomainCategory = {
  base: 25,
  sourceType: "tertiaire",
  signal: "Encyclopédie (source tertiaire)",
};

const CATEGORY_PLATFORM: DomainCategory = {
  base: 15,
  sourceType: "tertiaire",
  signal: "Plateforme, réseau social ou blog",
};

const CATEGORY_UNKNOWN: DomainCategory = {
  base: 30,
  sourceType: "indetermine",
  signal: "Domaine non répertorié",
};

function normalizeHost(value: string) {
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return value.replace(/^www\./, "").toLowerCase();
  }
}

function matchDomain(host: string, domains: string[]) {
  return domains.some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
}

function categoryForHost(host: string): DomainCategory {
  if (matchDomain(host, INSTITUTIONAL_DOMAINS)) return CATEGORY_INSTITUTIONAL;
  if (matchDomain(host, REFERENCE_MEDIA_DOMAINS)) return CATEGORY_MEDIA;
  if (matchDomain(host, ENCYCLOPEDIC_DOMAINS)) return CATEGORY_ENCYCLOPEDIA;
  if (matchDomain(host, PLATFORM_DOMAINS)) return CATEGORY_PLATFORM;
  return CATEGORY_UNKNOWN;
}

/* -------------------------------------------------------------- */
/* Fraîcheur                                                      */
/* -------------------------------------------------------------- */

const CURRENT_YEAR = new Date().getFullYear();

function detectYear(source: ExternalSourceItem): number | null {
  const candidates: number[] = [];

  for (const text of [source.snippet || "", source.url]) {
    const matches = text.match(/\b(19\d{2}|20\d{2})\b/g) || [];
    for (const match of matches) {
      const year = Number(match);
      if (year >= 1995 && year <= CURRENT_YEAR) candidates.push(year);
    }
  }

  if (!candidates.length) return null;
  return Math.max(...candidates);
}

function freshnessAdjustment(year: number, now: Date) {
  const age = now.getFullYear() - year;
  if (age < 0) return null;
  if (age <= 2) return { delta: 10, signal: `Source récente (${year})` };
  if (age >= 6) return { delta: -10, signal: `Source ancienne (${year})` };
  return null;
}

/* -------------------------------------------------------------- */
/* Score composite                                                 */
/* -------------------------------------------------------------- */

function clampScore(value: number) {
  const rounded = Math.round(value);
  if (rounded < 0) return 0;
  if (rounded > 100) return 100;
  return rounded;
}

function tierFromScore(score: number): SourceQualityTier {
  if (score >= 60) return "elevee";
  if (score >= 30) return "moyenne";
  return "faible";
}

function citationAdjustment(
  source: ExternalSourceItem,
  claimCitations: Map<string, number> | undefined,
) {
  if (!claimCitations) return null;
  const citations = claimCitations.get(canonicalUrlKey(source.url)) ?? 0;
  if (citations >= 2) {
    return {
      delta: 15,
      signal: `Étayage de ${citations} claims`,
    };
  }
  if (citations === 1) {
    return {
      delta: 10,
      signal: "Étayage d'un claim",
    };
  }
  return null;
}

function verificationAdjustment(source: ExternalSourceItem) {
  switch (source.verification?.status) {
    case "extrait_verifie":
      return { delta: 15, signal: "Extrait confirmé dans la page" };
    case "extrait_non_trouve":
      return { delta: -10, signal: "Extrait non retrouvé dans la page" };
    case "page_inaccessible":
      return { delta: -5, signal: "Page inaccessible au contrôle" };
    default:
      return null;
  }
}

/**
 * Attribue à chaque source externe un score de qualité composite, explicable :
 * - catégorie du domaine (institutionnel / média de référence / encyclopédie /
 *   plateforme / non répertorié) ;
 * - vérification de l'extrait dans la page (si disponible) ;
 * - nombre de claims qu'elle étaye ;
 * - fraîcheur (année détectée dans l'extrait ou l'URL).
 */
export function scoreExternalSources(
  sources: ExternalSourceItem[],
  context: SourceScoringContext = {},
): ExternalSourceItem[] {
  const now = context.now ?? new Date();

  return sources.map((source) => {
    const host = normalizeHost(source.domain?.trim() || source.url);
    const category = categoryForHost(host);

    let score = category.base;
    const signals: string[] = [category.signal];

    const verification = verificationAdjustment(source);
    if (verification) {
      score += verification.delta;
      signals.push(verification.signal);
    }

    const citation = citationAdjustment(source, context.claimCitations);
    if (citation) {
      score += citation.delta;
      signals.push(citation.signal);
    }

    const year = detectYear(source);
    if (year) {
      const freshness = freshnessAdjustment(year, now);
      if (freshness) {
        score += freshness.delta;
        signals.push(freshness.signal);
      }
    }

    const finalScore = clampScore(score);

    return {
      ...source,
      quality: {
        score: finalScore,
        tier: tierFromScore(finalScore),
        sourceType: category.sourceType,
        signals,
      },
    };
  });
}

/**
 * Classe les sources : score de qualité décroissant, puis nombre de citations,
 * puis ordre alphabétique de domaine. Les sources non notées (historique
 * antérieur au scoring) restent en fin de liste, ordre inchangé.
 */
export function rankByQuality(sources: ExternalSourceItem[]) {
  return [...sources].sort((a, b) => {
    const scoreA = a.quality?.score ?? -1;
    const scoreB = b.quality?.score ?? -1;
    if (scoreA !== scoreB) return scoreB - scoreA;

    const citationsA = a.quality?.signals.length ?? 0;
    const citationsB = b.quality?.signals.length ?? 0;
    if (citationsA !== citationsB) return citationsB - citationsA;

    const domainA = normalizeHost(a.domain?.trim() || a.url);
    const domainB = normalizeHost(b.domain?.trim() || b.url);
    return domainA.localeCompare(domainB);
  });
}

/**
 * Construit la carte des citations par claim, clé = URL canonique.
 * Sert de contexte au scoring (une source citée par plusieurs claims
 * est un signal de corroboration).
 */
export function buildClaimCitationMap(
  claimAudit: { sourceUrls?: string[] }[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of claimAudit) {
    for (const url of item.sourceUrls ?? []) {
      const key = canonicalUrlKey(url);
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return map;
}
