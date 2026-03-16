import type { ComparisonResult } from "@/lib/schema";

export interface ComparisonSignal {
  level: 0 | 1 | 2 | 3 | 4;
  rationale: string;
}

export interface ComparisonModelOutput {
  comparisonProfile: {
    documentATitle: string;
    documentBTitle: string;
    analysisScope: string;
    mode: string;
  };
  executiveSummary: string;
  methodologyNotice: string;
  scoreSignals: {
    topicOverlap: ComparisonSignal;
    temporalDistance: ComparisonSignal;
    framingDistance: ComparisonSignal;
    thesisConflict: ComparisonSignal;
    evidenceAsymmetry: ComparisonSignal;
    genreDistance: ComparisonSignal;
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

function clamp0to4(value: number): 0 | 1 | 2 | 3 | 4 {
  const rounded = Math.round(value);
  if (rounded <= 0) return 0;
  if (rounded === 1) return 1;
  if (rounded === 2) return 2;
  if (rounded === 3) return 3;
  return 4;
}

function to100From4(value: number) {
  const safe = clamp0to4(value);
  return Math.round((safe / 4) * 100);
}

function labelFromScore(score: number) {
  if (score >= 75) return "élevé";
  if (score >= 50) return "forte";
  if (score >= 25) return "moyenne";
  return "faible";
}

function mean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildDeterministicComparisonResult(
  model: ComparisonModelOutput,
): ComparisonResult {
  const topicOverlap = clamp0to4(model.scoreSignals.topicOverlap.level);
  const temporalDistance = clamp0to4(model.scoreSignals.temporalDistance.level);
  const framingDistance = clamp0to4(model.scoreSignals.framingDistance.level);
  const thesisConflict = clamp0to4(model.scoreSignals.thesisConflict.level);
  const evidenceAsymmetry = clamp0to4(model.scoreSignals.evidenceAsymmetry.level);
  const genreDistance = clamp0to4(model.scoreSignals.genreDistance.level);

  const temporalAlignment = 4 - temporalDistance;
  const framingAlignment = 4 - framingDistance;
  const thesisAlignment = 4 - thesisConflict;
  const genreAlignment = 4 - genreDistance;
  const evidenceSymmetry = 4 - evidenceAsymmetry;

  const convergenceRaw = mean([
    topicOverlap,
    thesisAlignment,
    temporalAlignment,
  ]);

  const divergenceRaw = mean([
    thesisConflict,
    temporalDistance,
    framingDistance,
  ]);

  const framingGapRaw = framingDistance;
  const supportAsymmetryRaw = evidenceAsymmetry;

  const comparabilityRaw = mean([
    topicOverlap,
    temporalAlignment,
    genreAlignment,
    evidenceSymmetry,
  ]);

  const convergenceScore = to100From4(convergenceRaw);
  const divergenceScore = to100From4(divergenceRaw);
  const framingGapScore = to100From4(framingGapRaw);
  const supportAsymmetryScore = to100From4(supportAsymmetryRaw);
  const comparabilityScore = to100From4(comparabilityRaw);

  return {
    comparisonProfile: {
      documentATitle: model.comparisonProfile.documentATitle,
      documentBTitle: model.comparisonProfile.documentBTitle,
      analysisScope: model.comparisonProfile.analysisScope,
      mode:
        model.comparisonProfile.mode === "external_research"
          ? "external_research"
          : "internal_only",
    },
    executiveSummary: model.executiveSummary,
    methodologyNotice: model.methodologyNotice,
    overallAssessment: {
      convergenceLevel: {
        score: convergenceScore,
        label: labelFromScore(convergenceScore),
        rationale: [
          `Recouvrement thématique : ${topicOverlap}/4.`,
          `Alignement des thèses : ${thesisAlignment}/4.`,
          `Proximité temporelle : ${temporalAlignment}/4.`,
          model.scoreSignals.topicOverlap.rationale,
          model.scoreSignals.thesisConflict.rationale,
          model.scoreSignals.temporalDistance.rationale,
        ].join(" "),
      },
      divergenceIntensity: {
        score: divergenceScore,
        label: labelFromScore(divergenceScore),
        rationale: [
          `Conflit de thèse : ${thesisConflict}/4.`,
          `Distance temporelle : ${temporalDistance}/4.`,
          `Distance de cadrage : ${framingDistance}/4.`,
          model.scoreSignals.thesisConflict.rationale,
          model.scoreSignals.temporalDistance.rationale,
          model.scoreSignals.framingDistance.rationale,
        ].join(" "),
      },
      framingGap: {
        score: framingGapScore,
        label: labelFromScore(framingGapScore),
        rationale: [
          `Distance de cadrage : ${framingDistance}/4.`,
          model.scoreSignals.framingDistance.rationale,
        ].join(" "),
      },
      supportAsymmetry: {
        score: supportAsymmetryScore,
        label: labelFromScore(supportAsymmetryScore),
        rationale: [
          `Asymétrie d’étayage : ${evidenceAsymmetry}/4.`,
          model.scoreSignals.evidenceAsymmetry.rationale,
        ].join(" "),
      },
      comparability: {
        score: comparabilityScore,
        label: labelFromScore(comparabilityScore),
        rationale: [
          `Recouvrement thématique : ${topicOverlap}/4.`,
          `Proximité temporelle : ${temporalAlignment}/4.`,
          `Proximité de genre/finalité : ${genreAlignment}/4.`,
          `Symétrie d’étayage : ${evidenceSymmetry}/4.`,
          model.scoreSignals.genreDistance.rationale,
          model.scoreSignals.evidenceAsymmetry.rationale,
        ].join(" "),
      },
    },
    commonPoints: model.commonPoints,
    divergences: model.divergences,
    framingDifferences: model.framingDifferences,
    supportDifferences: model.supportDifferences,
    blindSpots: model.blindSpots,
    caveats: model.caveats,
    recommendations: model.recommendations,
  };
}