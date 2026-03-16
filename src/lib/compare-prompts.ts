import type { ComparisonInput } from "@/lib/schema";

export const COMPARE_INTERNAL_SYSTEM_PROMPT = `
Tu es un analyste méthodologique spécialisé dans la comparaison critique de deux sources.

MODE
Lecture interne uniquement.

RÈGLES
- Tu compares uniquement les textes fournis.
- N’utilise aucune source externe.
- N’invente jamais aucun fait, aucune source, aucune date, aucune identité, aucun contexte.
- N’extrapole jamais au-delà des informations fournies.
- Si une information manque, indique explicitement qu’elle est non déterminable.
- Ne produis jamais de verdict de vérité absolue.
- Ne dis jamais qui ment.
- Distingue strictement :
  1. convergences observables,
  2. divergences observables,
  3. différences de cadrage,
  4. asymétries d’étayage,
  5. angles morts,
  6. limites de comparabilité.
- Tous les scores doivent être justifiés par les deux textes fournis.
- Si les documents sont peu comparables, indique-le clairement.

FORMAT
Réponds uniquement en JSON valide conforme au schéma attendu.
`;

export const COMPARE_EXTERNAL_SYSTEM_PROMPT = `
Tu es un analyste méthodologique spécialisé dans la comparaison critique de deux sources.

MODE
Recherche externe encadrée.

RÈGLES
- Tu peux utiliser la recherche web intégrée si nécessaire.
- N’invente jamais aucun fait, aucune source, aucune date, aucune identité, aucun contexte.
- N’extrapole jamais au-delà des informations disponibles.
- Si une information manque, indique explicitement qu’elle est non déterminable.
- Ne produis jamais de verdict de vérité absolue.
- Ne dis jamais qui ment.
- Distingue strictement :
  1. convergences observables,
  2. divergences observables,
  3. différences de cadrage,
  4. asymétries d’étayage,
  5. angles morts,
  6. limites de comparabilité.
- Si les sources externes ne suffisent pas, dis-le explicitement.
- Tous les scores doivent être justifiés.

FORMAT
Réponds uniquement en JSON valide conforme au schéma attendu.
`;

export function buildCompareUserPrompt(input: ComparisonInput) {
  const modeLabel =
    input.mode === "external_research"
      ? "Recherche externe encadrée"
      : "Lecture interne";

  return `
COMPARAISON DE DEUX DOCUMENTS

Mode demandé : ${modeLabel}

Document A :
- Titre : ${input.documentA.title || "non fourni"}
- Auteur : ${input.documentA.author || "non fourni"}
- Type : ${input.documentA.documentType || "non fourni"}
- Contexte : ${input.documentA.publicationContext || "non fourni"}

Texte A :
"""
${input.documentA.text}
"""

Document B :
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
- comparisonProfile.analysisScope doit expliciter la portée réelle de la comparaison selon le mode.
- executiveSummary : 140 à 220 mots.
- methodologyNotice : 70 à 120 mots.
- commonPoints : 4 à 8 items.
- divergences : 4 à 8 items.
- framingDifferences : 4 à 8 items.
- supportDifferences : 4 à 8 items.
- blindSpots.documentA : 3 à 6 items.
- blindSpots.documentB : 3 à 6 items.
- caveats : 3 à 6 items.
- recommendations : 4 à 8 items.
- Les formulations doivent rester prudentes et comparatives.
- Ne pas conclure qu’un document est vrai ou faux au sens absolu.
`;
}

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
        analysisScope: { type: "string" },
        mode: { type: "string" },
      },
      required: ["documentATitle", "documentBTitle", "analysisScope", "mode"],
    },
    executiveSummary: { type: "string" },
    methodologyNotice: { type: "string" },
    overallAssessment: {
      type: "object",
      additionalProperties: false,
      properties: {
        convergenceLevel: {
          type: "object",
          additionalProperties: false,
          properties: {
            score: { type: "number" },
            label: { type: "string" },
            rationale: { type: "string" },
          },
          required: ["score", "label", "rationale"],
        },
        divergenceIntensity: {
          type: "object",
          additionalProperties: false,
          properties: {
            score: { type: "number" },
            label: { type: "string" },
            rationale: { type: "string" },
          },
          required: ["score", "label", "rationale"],
        },
        framingGap: {
          type: "object",
          additionalProperties: false,
          properties: {
            score: { type: "number" },
            label: { type: "string" },
            rationale: { type: "string" },
          },
          required: ["score", "label", "rationale"],
        },
        supportAsymmetry: {
          type: "object",
          additionalProperties: false,
          properties: {
            score: { type: "number" },
            label: { type: "string" },
            rationale: { type: "string" },
          },
          required: ["score", "label", "rationale"],
        },
        comparability: {
          type: "object",
          additionalProperties: false,
          properties: {
            score: { type: "number" },
            label: { type: "string" },
            rationale: { type: "string" },
          },
          required: ["score", "label", "rationale"],
        },
      },
      required: [
        "convergenceLevel",
        "divergenceIntensity",
        "framingGap",
        "supportAsymmetry",
        "comparability",
      ],
    },
    commonPoints: {
      type: "array",
      items: { type: "string" },
    },
    divergences: {
      type: "array",
      items: { type: "string" },
    },
    framingDifferences: {
      type: "array",
      items: { type: "string" },
    },
    supportDifferences: {
      type: "array",
      items: { type: "string" },
    },
    blindSpots: {
      type: "object",
      additionalProperties: false,
      properties: {
        documentA: {
          type: "array",
          items: { type: "string" },
        },
        documentB: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["documentA", "documentB"],
    },
    caveats: {
      type: "array",
      items: { type: "string" },
    },
    recommendations: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "comparisonProfile",
    "executiveSummary",
    "methodologyNotice",
    "overallAssessment",
    "commonPoints",
    "divergences",
    "framingDifferences",
    "supportDifferences",
    "blindSpots",
    "caveats",
    "recommendations",
  ],
} as const;