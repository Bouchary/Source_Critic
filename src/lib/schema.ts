import { z } from "zod";

export const analysisModeSchema = z.enum(["internal_only", "external_research"]);
export type AnalysisMode = z.infer<typeof analysisModeSchema>;

export interface ExternalSourceItem {
  title: string;
  url: string;
  snippet?: string;
  domain?: string;
}

export const analysisInputSchema = z.object({
  mode: analysisModeSchema.default("internal_only"),
  title: z.string().trim().max(200).optional().default(""),
  author: z.string().trim().max(200).optional().default(""),
  documentType: z.string().trim().max(100).optional().default(""),
  publicationContext: z.string().trim().max(300).optional().default(""),
  text: z
    .string()
    .trim()
    .min(500, "Le texte doit contenir au moins 500 caractères.")
    .max(50000, "Le texte est trop long pour cette V3.0."),
});

export const comparisonInputSchema = z.object({
  mode: analysisModeSchema.default("internal_only"),
  documentA: z.object({
    title: z.string().trim().max(200).optional().default(""),
    author: z.string().trim().max(200).optional().default(""),
    documentType: z.string().trim().max(100).optional().default(""),
    publicationContext: z.string().trim().max(300).optional().default(""),
    text: z
      .string()
      .trim()
      .min(500, "Le document A doit contenir au moins 500 caractères.")
      .max(50000, "Le document A est trop long pour cette V3.0."),
  }),
  documentB: z.object({
    title: z.string().trim().max(200).optional().default(""),
    author: z.string().trim().max(200).optional().default(""),
    documentType: z.string().trim().max(100).optional().default(""),
    publicationContext: z.string().trim().max(300).optional().default(""),
    text: z
      .string()
      .trim()
      .min(500, "Le document B doit contenir au moins 500 caractères.")
      .max(50000, "Le document B est trop long pour cette V3.0."),
  }),
});

export type AnalysisInput = z.infer<typeof analysisInputSchema>;
export type ComparisonInput = z.infer<typeof comparisonInputSchema>;

export type ScoreLevel = "faible" | "moyenne" | "forte" | "élevé" | "modéré";

export interface AnalysisScore {
  score: number;
  label: ScoreLevel;
  rationale: string;
}

export interface ClaimItem {
  id: string;
  excerpt: string;
  claimType:
    | "fait"
    | "interprétation"
    | "jugement"
    | "causalité"
    | "généralisation"
    | "prévision";
  assessment:
    | "clairement étayé dans le texte"
    | "partiellement étayé dans le texte"
    | "affirmé sans étayage suffisant"
    | "non déterminable";
  rationale: string;
}

export interface BiasItem {
  type:
    | "biais de sélection"
    | "biais de cadrage"
    | "biais d’omission possible"
    | "charge morale"
    | "téléologie possible"
    | "sur-généralisation"
    | "autre";
  level: "faible" | "modéré" | "élevé";
  evidence: string;
  explanation: string;
}

export interface AnalysisResult {
  documentProfile: {
    title: string;
    author: string;
    documentType: string;
    publicationContext: string;
    analysisScope: string;
    mode: AnalysisMode;
  };
  executiveSummary: string;
  methodologyNotice: string;
  scores: {
    traceability: AnalysisScore;
    factualRobustness: AnalysisScore;
    interpretiveLoad: AnalysisScore;
    contradictionHandling: AnalysisScore;
    sourceTransparency: AnalysisScore;
    biasRisk: AnalysisScore;
  };
  authorPositioning: {
    observableElements: string[];
    nonInferableElements: string[];
  };
  keyClaims: ClaimItem[];
  biasMap: BiasItem[];
  unknowns: string[];
  recommendations: string[];
  caveats: string[];
}

export interface ComparisonResult {
  comparisonProfile: {
    documentATitle: string;
    documentBTitle: string;
    analysisScope: string;
    mode: AnalysisMode;
  };
  executiveSummary: string;
  methodologyNotice: string;
  overallAssessment: {
    convergenceLevel: AnalysisScore;
    divergenceIntensity: AnalysisScore;
    framingGap: AnalysisScore;
    supportAsymmetry: AnalysisScore;
    comparability: AnalysisScore;
  };
  commonPoints: string[];
  divergences: string[];
  framingDifferences: string[];
  supportDifferences: string[];
  blindSpots: {
    documentA: string[];
    documentB: string[];
  };
  caveats: string[];
  recommendations: string[];
}