import { z } from "zod";

export const analysisModeSchema = z.enum(["internal_only", "external_research"]);
export type AnalysisMode = z.infer<typeof analysisModeSchema>;

export const externalSourceItemSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string().optional().default(""),
  domain: z.string().optional().default(""),
});
export type ExternalSourceItem = z.infer<typeof externalSourceItemSchema>;

export const analysisInputSchema = z.object({
  mode: analysisModeSchema,
  title: z.string().trim().max(200).default(""),
  author: z.string().trim().max(200).default(""),
  documentType: z.string().trim().max(120).default(""),
  publicationContext: z.string().trim().max(200).default(""),
  text: z.string().trim().min(50).max(120_000),
});
export type AnalysisInput = z.infer<typeof analysisInputSchema>;

export const comparisonDocumentSchema = z.object({
  title: z.string().trim().max(200).default(""),
  author: z.string().trim().max(200).default(""),
  documentType: z.string().trim().max(120).default(""),
  publicationContext: z.string().trim().max(200).default(""),
  text: z.string().trim().min(50).max(120_000),
});

export const comparisonInputSchema = z.object({
  mode: analysisModeSchema,
  documentA: comparisonDocumentSchema,
  documentB: comparisonDocumentSchema,
});
export type ComparisonInput = z.infer<typeof comparisonInputSchema>;

export interface ScoreBlock {
  score: number;
  label: string;
  rationale: string;
}

export interface AuditSourceChainItem {
  title: string;
  domain: string;
  url?: string;
  sourceType: "primaire" | "secondaire" | "tertiaire" | "indéterminé";
  reliability: "élevée" | "moyenne" | "faible";
  rationale: string;
}

export interface ClaimAuditItem {
  claimId: string;
  status: "soutenu" | "contesté" | "non déterminable";
  basis: string;
}

export interface AnalysisResult {
  documentProfile: {
    title: string;
    author: string;
    documentType: string;
    publicationContext: string;
    analysisScope: string;
    mode: string;
  };
  executiveSummary: string;
  methodologyNotice: string;
  scores: {
    traceability: ScoreBlock;
    factualRobustness: ScoreBlock;
    interpretiveLoad: ScoreBlock;
    contradictionHandling: ScoreBlock;
    sourceTransparency: ScoreBlock;
    biasRisk: ScoreBlock;
  };
  authorPositioning: {
    observableElements: string[];
    nonInferableElements: string[];
  };
  keyClaims: {
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
  }[];
  biasMap: {
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
  }[];
  unknowns: string[];
  recommendations: string[];
  caveats: string[];
  auditTrail: {
    confidenceBoundary: string;
    sourceTrustChain: AuditSourceChainItem[];
    claimAudit: ClaimAuditItem[];
    evidenceAlerts: string[];
  };
}

export interface ComparisonResult {
  comparisonProfile: {
    documentATitle: string;
    documentBTitle: string;
    documentAType: string;
    documentBType: string;
    comparisonScope: string;
    mode: string;
  };
  executiveSummary: string;
  methodologyNotice: string;
  overallAssessment: {
    convergenceLevel: ScoreBlock;
    divergenceIntensity: ScoreBlock;
    framingGap: ScoreBlock;
    supportAsymmetry: ScoreBlock;
    comparability: ScoreBlock;
  };
  commonGround: string[];
  divergences: {
    theme: string;
    description: string;
    intensity: "faible" | "moyenne" | "forte";
    evidenceBalance: string;
  }[];
  framingAnalysis: {
    documentAFrame: string;
    documentBFrame: string;
    framingGapSummary: string;
  };
  evidenceAnalysis: {
    documentASupport: string;
    documentBSupport: string;
    asymmetrySummary: string;
  };
  blindSpots: string[];
  reservations: string[];
  auditTrail: {
    confidenceBoundary: string;
    sourceTrustChain: AuditSourceChainItem[];
    evidenceAlerts: string[];
    comparabilityJudgement: "haute" | "moyenne" | "faible";
    comparabilityRationale: string;
  };
}