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
- Tu ne calcules pas des notes libres de 0 à 100.
- Tu ne notes pas :
  1. la traçabilité,
  2. la robustesse factuelle,
  3. la transparence des sources.
- Ces trois dimensions seront calculées côté application à partir d’indices textuels observables.
- À la place, tu fournis seulement des signaux bornés de 0 à 4 pour :
  1. charge interprétative,
  2. gestion de la contradiction,
  3. risque de biais.
- Échelle :
  0 = très faible
  1 = faible
  2 = intermédiaire
  3 = élevé
  4 = très élevé
- Distingue strictement le texte, l’inférence prudente et l’inconnu.
- Chaque biais signalé doit être relié à un extrait ou à un trait textuel observable.
- Pour chaque claim clé, tu dois fournir un statut d’audit :
  - soutenu
  - contesté
  - non déterminable
- Tu dois aussi produire :
  - une frontière de confiance,
  - une chaîne de confiance des sources,
  - des alertes d’étayage.

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
- Tu ne calcules pas des notes libres de 0 à 100.
- Tu ne notes pas :
  1. la traçabilité,
  2. la robustesse factuelle,
  3. la transparence des sources.
- Ces trois dimensions seront calculées côté application à partir d’indices textuels observables.
- À la place, tu fournis seulement des signaux bornés de 0 à 4 pour :
  1. charge interprétative,
  2. gestion de la contradiction,
  3. risque de biais.
- Échelle :
  0 = très faible
  1 = faible
  2 = intermédiaire
  3 = élevé
  4 = très élevé
- Si les sources ne suffisent pas, dis-le explicitement.
- Pour chaque claim clé, tu dois fournir un statut d’audit :
  - soutenu
  - contesté
  - non déterminable
- Tu dois aussi produire :
  - une frontière de confiance,
  - une chaîne de confiance des sources,
  - des alertes d’étayage.

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
- scoreSignals.interpretiveLoad : niveau de charge interprétative.
- scoreSignals.contradictionHandling : capacité du texte à prendre en charge ou non la contradiction.
- scoreSignals.biasRisk : niveau global de risque de biais.
- observableElements : uniquement des éléments déductibles du texte ou des métadonnées.
- nonInferableElements : ce qui ne peut pas être établi sans sources externes.
- keyClaims : entre 6 et 10 items.
- claimAudit : un item par keyClaim, avec claimId cohérent.
- sourceTrustChain : entre 0 et 8 items ; si mode interne sans source explicite, rester prudent.
- Chaque item de sourceTrustChain doit toujours contenir :
  - title
  - domain
  - url (mettre chaîne vide si inconnu)
  - sourceType
  - reliability
  - rationale
- evidenceAlerts : entre 3 et 8 items.
- biasMap : entre 4 et 8 items.
- unknowns : entre 4 et 10 items.
- recommendations : entre 4 et 8 items.
- caveats : entre 3 et 6 items.
- Les extraits doivent être courts, fidèles et tirés du texte.
`;
}

const signalSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    level: {
      type: "integer",
      minimum: 0,
      maximum: 4,
    },
    rationale: {
      type: "string",
    },
  },
  required: ["level", "rationale"],
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
    scoreSignals: {
      type: "object",
      additionalProperties: false,
      properties: {
        interpretiveLoad: signalSchema,
        contradictionHandling: signalSchema,
        biasRisk: signalSchema,
      },
      required: ["interpretiveLoad", "contradictionHandling", "biasRisk"],
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
    auditTrail: {
      type: "object",
      additionalProperties: false,
      properties: {
        confidenceBoundary: { type: "string" },
        sourceTrustChain: {
          type: "array",
          items: auditSourceSchema,
        },
        claimAudit: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              claimId: { type: "string" },
              status: { type: "string" },
              basis: { type: "string" },
            },
            required: ["claimId", "status", "basis"],
          },
        },
        evidenceAlerts: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["confidenceBoundary", "sourceTrustChain", "claimAudit", "evidenceAlerts"],
    },
  },
  required: [
    "documentProfile",
    "executiveSummary",
    "methodologyNotice",
    "scoreSignals",
    "authorPositioning",
    "keyClaims",
    "biasMap",
    "unknowns",
    "recommendations",
    "caveats",
    "auditTrail",
  ],
} as const;