import type { ComparisonInput } from "@/lib/schema";

export const COMPARE_INTERNAL_SYSTEM_PROMPT = `
Tu es un analyste méthodologique spécialisé dans la comparaison critique de documents.

MODE
Lecture interne uniquement.

RÈGLES
- Travaille uniquement à partir des deux documents fournis.
- N’utilise aucune source externe.
- N’invente aucun fait, aucune source, aucune date.
- Ne conclus jamais à une vérité absolue.
- N’attribue pas d’intention psychologique sans base textuelle solide.
- Les scores doivent rester cohérents avec les justifications.
- Tu dois produire aussi :
  - une frontière de confiance,
  - une chaîne de confiance des sources,
  - des alertes d’étayage,
  - un jugement explicite de comparabilité.

FORMAT
Réponds uniquement en JSON valide conforme au schéma attendu.
`;

export const COMPARE_EXTERNAL_SYSTEM_PROMPT = `
Tu es un analyste méthodologique spécialisé dans la comparaison critique de documents.

MODE
Recherche externe encadrée.

RÈGLES
- Tu peux utiliser la recherche web intégrée si nécessaire.
- N’invente aucun fait, aucune source, aucune date.
- Appuie-toi prioritairement sur des sources documentées et fiables.
- Ne conclus jamais à une vérité absolue.
- Les scores doivent rester cohérents avec les justifications.
- Tu dois produire aussi :
  - une frontière de confiance,
  - une chaîne de confiance des sources,
  - des alertes d’étayage,
  - un jugement explicite de comparabilité.

FORMAT
Réponds uniquement en JSON valide conforme au schéma attendu.
`;

export function buildCompareUserPrompt(input: ComparisonInput) {
  const modeLabel =
    input.mode === "external_research"
      ? "Recherche externe encadrée"
      : "Lecture interne";

  return `
COMPARAISON CRITIQUE DE DEUX DOCUMENTS

Mode demandé : ${modeLabel}

DOCUMENT A
- Titre : ${input.documentA.title || "non fourni"}
- Auteur : ${input.documentA.author || "non fourni"}
- Type : ${input.documentA.documentType || "non fourni"}
- Contexte : ${input.documentA.publicationContext || "non fourni"}

Texte A :
"""
${input.documentA.text}
"""

DOCUMENT B
- Titre : ${input.documentB.title || "non fourni"}
- Auteur : ${input.documentB.author || "non fourni"}
- Type : ${input.documentB.documentType || "non fourni"}
- Contexte : ${input.documentB.publicationContext || "non fourni"}

Texte B :
"""
${input.documentB.text}
"""

Consignes :
- comparisonProfile.mode doit être "${input.mode}".
- executiveSummary : 120 à 180 mots.
- methodologyNotice : 60 à 100 mots.
- commonGround : entre 4 et 8 items.
- divergences : entre 4 et 8 items.
- blindSpots : entre 4 et 8 items.
- reservations : entre 3 et 6 items.
- sourceTrustChain : entre 0 et 8 items ; si mode interne sans source explicite, rester prudent.
- Chaque item de sourceTrustChain doit toujours contenir :
  - title
  - domain
  - url (mettre chaîne vide si inconnu)
  - sourceType
  - reliability
  - rationale
- evidenceAlerts : entre 3 et 8 items.
- comparabilityJudgement doit être haute, moyenne ou faible.
- L’analyse de cadrage doit être nette mais prudente.
`;
}

const scoreSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    score: { type: "number" },
    label: { type: "string" },
    rationale: { type: "string" },
  },
  required: ["score", "label", "rationale"],
} as const;

const auditSourceSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    domain: { type: "string" },
    url: { type: "string" },
    sourceType: { type: "string" },
    reliability: { type: "string" },
    rationale: { type: "string" },
  },
  required: ["title", "domain", "url", "sourceType", "reliability", "rationale"],
} as const;

export const COMPARISON_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    comparisonProfile: {
      type: "object",
      additionalProperties: false,
      properties: {
        documentATitle: { type: "string" },
        documentBTitle: { type: "string" },
        documentAType: { type: "string" },
        documentBType: { type: "string" },
        comparisonScope: { type: "string" },
        mode: { type: "string" },
      },
      required: [
        "documentATitle",
        "documentBTitle",
        "documentAType",
        "documentBType",
        "comparisonScope",
        "mode",
      ],
    },
    executiveSummary: { type: "string" },
    methodologyNotice: { type: "string" },
    overallAssessment: {
      type: "object",
      additionalProperties: false,
      properties: {
        convergenceLevel: scoreSchema,
        divergenceIntensity: scoreSchema,
        framingGap: scoreSchema,
        supportAsymmetry: scoreSchema,
        comparability: scoreSchema,
      },
      required: [
        "convergenceLevel",
        "divergenceIntensity",
        "framingGap",
        "supportAsymmetry",
        "comparability",
      ],
    },
    commonGround: {
      type: "array",
      items: { type: "string" },
    },
    divergences: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          theme: { type: "string" },
          description: { type: "string" },
          intensity: { type: "string" },
          evidenceBalance: { type: "string" },
        },
        required: ["theme", "description", "intensity", "evidenceBalance"],
      },
    },
    framingAnalysis: {
      type: "object",
      additionalProperties: false,
      properties: {
        documentAFrame: { type: "string" },
        documentBFrame: { type: "string" },
        framingGapSummary: { type: "string" },
      },
      required: ["documentAFrame", "documentBFrame", "framingGapSummary"],
    },
    evidenceAnalysis: {
      type: "object",
      additionalProperties: false,
      properties: {
        documentASupport: { type: "string" },
        documentBSupport: { type: "string" },
        asymmetrySummary: { type: "string" },
      },
      required: ["documentASupport", "documentBSupport", "asymmetrySummary"],
    },
    blindSpots: {
      type: "array",
      items: { type: "string" },
    },
    reservations: {
      type: "array",
      items: { type: "string" },
    },
    auditTrail: {
      type: "object",
      additionalProperties: false,
      properties: {
        confidenceBoundary: { type: "string" },
        sourceTrustChain: {
          type: "array",
          items: auditSourceSchema,
        },
        evidenceAlerts: {
          type: "array",
          items: { type: "string" },
        },
        comparabilityJudgement: { type: "string" },
        comparabilityRationale: { type: "string" },
      },
      required: [
        "confidenceBoundary",
        "sourceTrustChain",
        "evidenceAlerts",
        "comparabilityJudgement",
        "comparabilityRationale",
      ],
    },
  },
  required: [
    "comparisonProfile",
    "executiveSummary",
    "methodologyNotice",
    "overallAssessment",
    "commonGround",
    "divergences",
    "framingAnalysis",
    "evidenceAnalysis",
    "blindSpots",
    "reservations",
    "auditTrail",
  ],
} as const;