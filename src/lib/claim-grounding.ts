import type { AuditSourceChainItem, ClaimAuditItem } from "@/lib/schema";
import { canonicalUrlKey } from "@/lib/web-sources";
import type { ExternalSourceItem } from "@/lib/schema";

export type ClaimGrounding = "verifie" | "partiel" | "non_verifiable";

/**
 * Indexe les sources de recherche par clé canonique d'URL. Tout URL citée
 * par le modèle qui n'est pas dans cet index est potentiellement une
 * hallucination.
 */
function buildSearchKeyMap(sources: ExternalSourceItem[]) {
  const map = new Map<string, ExternalSourceItem>();
  for (const source of sources) {
    const key = canonicalUrlKey(source.url);
    if (key) map.set(key, source);
  }
  return map;
}

function hasVerifiedPassage(
  urls: string[],
  searchMap: Map<string, ExternalSourceItem>,
) {
  return urls.some((url) => {
    const source = searchMap.get(canonicalUrlKey(url));
    return source?.verification?.status === "extrait_verifie";
  });
}

function normalizeUrlList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
}

/**
 * Marque chaque item de la chaîne de confiance :
 * - verifiedInSearch: true si l'URL citée figure dans les résultats de recherche,
 * - verifiedInSearch: false si une URL est citée mais absente des résultats
 *   (risque d'hallucination ou de source non consultée),
 * - undefined si aucune URL n'est citée.
 */
export function crossCheckTrustChain(
  items: AuditSourceChainItem[],
  sources: ExternalSourceItem[],
): AuditSourceChainItem[] {
  const searchMap = buildSearchKeyMap(sources);

  return items.map((item) => {
    if (!item.url) return { ...item };

    const found = searchMap.has(canonicalUrlKey(item.url));
    return { ...item, verifiedInSearch: found };
  });
}

/**
 * Attache à chaque claim auditée :
 * - sourceUrls restreintes aux URLs réellement présentes dans les résultats
 *   de recherche (les autres sont écartées : non traçables),
 * - un statut d'étayage :
 *   - "verifie" : au moins une URL citée figure dans les résultats de recherche,
 *   - "partiel" : des URLs sont citées mais aucune n'a été retrouvée,
 *   - "non_verifiable" : aucune URL citée (ou pas de recherche externe),
 * - passageVerified : true si l'extrait d'au moins une source citée a été
 *   confirmé dans le contenu de la page (vérification au niveau du passage).
 */
export function attachClaimGrounding(
  claimAudit: {
    claimId: string;
    status: ClaimAuditItem["status"];
    basis: string;
    sourceUrls?: string[];
  }[],
  sources: ExternalSourceItem[],
): ClaimAuditItem[] {
  const searchMap = buildSearchKeyMap(sources);

  return claimAudit.map((item) => {
    const cited = normalizeUrlList(item.sourceUrls);
    const matched = cited.filter((url) =>
      searchMap.has(canonicalUrlKey(url)),
    );

    let grounding: ClaimGrounding;
    if (cited.length === 0) {
      grounding = "non_verifiable";
    } else if (matched.length > 0) {
      grounding = "verifie";
    } else {
      grounding = "partiel";
    }

    return {
      claimId: item.claimId,
      status: item.status,
      basis: item.basis,
      sourceUrls: matched,
      grounding,
      ...(grounding === "verifie"
        ? { passageVerified: hasVerifiedPassage(matched, searchMap) }
        : {}),
    };
  });
}
