import type { AnalysisInput } from "@/lib/schema";

export const INTERNAL_SYSTEM_PROMPT = `
Tu es un analyste méthodologique spécialisé dans l’analyse critique des sources.

MODE
Lecture interne uniquement.

RÈGLES
- Tu travailles uniquement sur le texte fourni.
- N’utilise aucune source externe.
- N’invente jamais aucun fait, aucune source, aucune date, aucune identité, aucun contexte.
- N’extrapole jamais au-delà des informations fournies.
- Si une information manque, indique explicitement qu’elle est non déterminable.
- Ne produis jamais de verdict de vérité absolue.
- Ne dis jamais qui ment.
- Distingue strictement le texte, l’inférence prudente et l’inconnu.
- Tous les scores doivent être justifiés par le texte fourni.
- Chaque biais signalé doit être relié à un extrait ou à un trait textuel observable.
- Si le texte provient d’un PDF extrait, ne suppose pas que toute la structure originale est conservée.

FORMAT
Réponds uniquement en JSON valide conforme au schéma attendu.
`;

export const EXTERNAL_SYSTEM_PROMPT = `
Tu es un analyste méthodologique spécialisé dans l’analyse critique des sources.

MODE
Recherche externe encadrée.

RÈGLES
- Tu peux utiliser la recherche web intégrée si nécessaire.
- N’invente jamais aucun fait, aucune date, aucune source, aucune identité.
- Appuie-toi prioritairement sur des sources documentées et fiables.
- Distingue clairement :
  1. ce qui est confirmé par des sources,
  2. ce qui reste contesté,
  3. ce qui est non déterminable.
- Ne produis jamais de verdict de vérité absolue.
- Ne dis jamais qui ment.
- Ne masque jamais les incertitudes.
- Tous les scores doivent être justifiés.
- Si les sources ne suffisent pas, dis-le explicitement.

FORMAT
Réponds uniquement en JSON valide conforme au schéma attendu.
`;

export function buildUserPrompt(input: AnalysisInput) {
  const modeLabel =
    input.mode === "external_research"
      ? "Recherche externe encadrée"
      : "Lecture interne";

  return `
ANALYSE DU DOCUMENT

Mode demandé : ${modeLabel}

Métadonnées fournies :
- Titre : ${input.title || "non fourni"}
- Auteur : ${input.author || "non fourni"}
- Type de document : ${input.documentType || "non fourni"}
- Contexte de publication : ${input.publicationContext || "non fourni"}

Texte à analyser :
"""
${input.text}
"""

Consignes :
- Le champ analysisScope doit préciser la portée réelle de l’analyse selon le mode.
- documentProfile.mode doit être "${input.mode}".
- executiveSummary : 120 à 180 mots.
- methodologyNotice : 60 à 100 mots.
- observableElements : uniquement des éléments déductibles du texte ou des métadonnées.
- nonInferableElements : ce qui ne peut pas être établi sans sources externes.
- keyClaims : entre 6 et 10 items.
- biasMap : entre 4 et 8 items.
- unknowns : entre 4 et 10 items.
- recommendations : entre 4 et 8 items.
- caveats : entre 3 et 6 items.
- Les extraits doivent être courts, fidèles et tirés du texte.
`;
}

export const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    documentProfile: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        author: { type: "string" },
        documentType: { type: "string" },
        publicationContext: { type: "string" },
        analysisScope: { type: "string" },
        mode: { type: "string" },
      },
      required: [
        "title",
        "author",
        "documentType",
        "publicationContext",
        "analysisScope",
        "mode",
      ],
    },
    executiveSummary: { type: "string" },
    methodologyNotice: { type: "string" },
    scores: {
      type: "object",
      additionalProperties: false,
      properties: {
        traceability: {
          type: "object",
          additionalProperties: false,
          properties: {
            score: { type: "number" },
            label: { type: "string" },
            rationale: { type: "string" },
          },
          required: ["score", "label", "rationale"],
        },
        factualRobustness: {
          type: "object",
          additionalProperties: false,
          properties: {
            score: { type: "number" },
            label: { type: "string" },
            rationale: { type: "string" },
          },
          required: ["score", "label", "rationale"],
        },
        interpretiveLoad: {
          type: "object",
          additionalProperties: false,
          properties: {
            score: { type: "number" },
            label: { type: "string" },
            rationale: { type: "string" },
          },
          required: ["score", "label", "rationale"],
        },
        contradictionHandling: {
          type: "object",
          additionalProperties: false,
          properties: {
            score: { type: "number" },
            label: { type: "string" },
            rationale: { type: "string" },
          },
          required: ["score", "label", "rationale"],
        },
        sourceTransparency: {
          type: "object",
          additionalProperties: false,
          properties: {
            score: { type: "number" },
            label: { type: "string" },
            rationale: { type: "string" },
          },
          required: ["score", "label", "rationale"],
        },
        biasRisk: {
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
        "traceability",
        "factualRobustness",
        "interpretiveLoad",
        "contradictionHandling",
        "sourceTransparency",
        "biasRisk",
      ],
    },
    authorPositioning: {
      type: "object",
      additionalProperties: false,
      properties: {
        observableElements: {
          type: "array",
          items: { type: "string" },
        },
        nonInferableElements: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["observableElements", "nonInferableElements"],
    },
    keyClaims: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          excerpt: { type: "string" },
          claimType: { type: "string" },
          assessment: { type: "string" },
          rationale: { type: "string" },
        },
        required: ["id", "excerpt", "claimType", "assessment", "rationale"],
      },
    },
    biasMap: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: { type: "string" },
          level: { type: "string" },
          evidence: { type: "string" },
          explanation: { type: "string" },
        },
        required: ["type", "level", "evidence", "explanation"],
      },
    },
    unknowns: {
      type: "array",
      items: { type: "string" },
    },
    recommendations: {
      type: "array",
      items: { type: "string" },
    },
    caveats: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "documentProfile",
    "executiveSummary",
    "methodologyNotice",
    "scores",
    "authorPositioning",
    "keyClaims",
    "biasMap",
    "unknowns",
    "recommendations",
    "caveats",
  ],
} as const;