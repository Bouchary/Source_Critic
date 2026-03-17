import type { AnalysisInput, AnalysisResult } from "@/lib/schema";

export interface AnalysisSignal {
  level: 0 | 1 | 2 | 3 | 4;
  rationale: string;
}

export interface AnalysisModelOutput {
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
  scoreSignals: {
    interpretiveLoad: AnalysisSignal;
    contradictionHandling: AnalysisSignal;
    biasRisk: AnalysisSignal;
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
}

function clamp0to4(value: number): 0 | 1 | 2 | 3 | 4 {
  const rounded = Math.round(value);
  if (rounded <= 0) return 0;
  if (rounded === 1) return 1;
  if (rounded === 2) return 2;
  if (rounded === 3) return 3;
  return 4;
}

function clampScore(value: number) {
  const rounded = Math.round(value);
  if (rounded < 0) return 0;
  if (rounded > 100) return 100;
  return rounded;
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

function countMatches(text: string, regex: RegExp) {
  return (text.match(regex) || []).length;
}

function evidenceProfile(input: AnalysisInput) {
  const corpus = [
    input.title || "",
    input.author || "",
    input.documentType || "",
    input.publicationContext || "",
    input.text || "",
  ].join("\n");

  const numbers = countMatches(corpus, /\b\d+(?:[.,]\d+)?\b/g);
  const percentages = countMatches(corpus, /%|pour cent/gi);
  const urls = countMatches(corpus, /https?:\/\/\S+/gi);
  const quotes = countMatches(corpus, /[«“"][^«“"”]{8,}[»”"]/g);
  const citationLike = countMatches(corpus, /\([^)]{3,120}\)/g);
  const sourceMarkers = countMatches(
    corpus,
    /\b(selon|d'après|rapport|étude|données|source|sources|chiffres|statistique|statistiques|enquête|indice|publication|observatoire|ocde|unesco|insee|eurostat|banque mondiale|unicef|cnrs|université|revue|revues|ouvrage|ouvrages|article|articles)\b/gi,
  );

  const metadataCount = [
    input.title,
    input.author,
    input.documentType,
    input.publicationContext,
  ].filter((item) => (item || "").trim().length > 0).length;

  const weighted =
    numbers * 1 +
    percentages * 2 +
    urls * 4 +
    quotes * 1 +
    citationLike * 2 +
    sourceMarkers * 2;

  return {
    numbers,
    percentages,
    urls,
    quotes,
    citationLike,
    sourceMarkers,
    metadataCount,
    weighted,
  };
}

function traceabilitySignal(input: AnalysisInput): AnalysisSignal {
  const profile = evidenceProfile(input);

  const metadataLevel =
    profile.metadataCount >= 4
      ? 2
      : profile.metadataCount === 3
        ? 1.5
        : profile.metadataCount === 2
          ? 1
          : profile.metadataCount === 1
            ? 0.5
            : 0;

  const sourcingLevel =
    profile.urls >= 1
      ? 2
      : profile.sourceMarkers + profile.citationLike >= 4
        ? 2
        : profile.sourceMarkers + profile.citationLike >= 2
          ? 1
          : 0;

  const raw = Math.min(4, metadataLevel + sourcingLevel);

  return {
    level: clamp0to4(raw),
    rationale:
      `Métadonnées renseignées : ${profile.metadataCount}/4. ` +
      `Marqueurs de traçabilité détectés : URL=${profile.urls}, citations=${profile.citationLike}, marqueurs de source=${profile.sourceMarkers}.`,
  };
}

function sourceTransparencySignal(input: AnalysisInput): AnalysisSignal {
  const profile = evidenceProfile(input);

  let raw = 0;
  if (profile.urls >= 2) raw += 2;
  else if (profile.urls === 1) raw += 1.5;

  if (profile.citationLike >= 3) raw += 1.5;
  else if (profile.citationLike >= 1) raw += 1;

  if (profile.sourceMarkers >= 4) raw += 1;
  else if (profile.sourceMarkers >= 2) raw += 0.5;

  return {
    level: clamp0to4(Math.min(4, raw)),
    rationale:
      `Indices de transparence détectés : URL=${profile.urls}, citations=${profile.citationLike}, marqueurs de source=${profile.sourceMarkers}. ` +
      `Le score repose sur la visibilité explicite des appuis mentionnés dans le texte.`,
  };
}

function factualRobustnessSignal(input: AnalysisInput): AnalysisSignal {
  const profile = evidenceProfile(input);

  let raw = 0;

  if (profile.numbers >= 4) raw += 1;
  else if (profile.numbers >= 2) raw += 0.5;

  if (profile.percentages >= 1) raw += 0.5;
  if (profile.urls >= 1) raw += 1;
  if (profile.citationLike >= 2) raw += 1;
  else if (profile.citationLike >= 1) raw += 0.5;

  if (profile.sourceMarkers >= 4) raw += 1;
  else if (profile.sourceMarkers >= 2) raw += 0.5;

  return {
    level: clamp0to4(Math.min(4, raw)),
    rationale:
      `Indices d’étayage observables : nombres=${profile.numbers}, pourcentages=${profile.percentages}, URL=${profile.urls}, citations=${profile.citationLike}, marqueurs de source=${profile.sourceMarkers}.`,
  };
}

export function buildDeterministicAnalysisResult(
  model: AnalysisModelOutput,
  input: AnalysisInput,
): AnalysisResult {
  const traceability = traceabilitySignal(input);
  const factualRobustness = factualRobustnessSignal(input);
  const sourceTransparency = sourceTransparencySignal(input);

  const interpretiveLoad = clamp0to4(model.scoreSignals.interpretiveLoad.level);
  const contradictionHandling = clamp0to4(
    model.scoreSignals.contradictionHandling.level,
  );
  const biasRisk = clamp0to4(model.scoreSignals.biasRisk.level);

  return {
    documentProfile: {
      title: model.documentProfile.title,
      author: model.documentProfile.author,
      documentType: model.documentProfile.documentType,
      publicationContext: model.documentProfile.publicationContext,
      analysisScope: model.documentProfile.analysisScope,
      mode:
        model.documentProfile.mode === "external_research"
          ? "external_research"
          : "internal_only",
    },
    executiveSummary: model.executiveSummary,
    methodologyNotice: model.methodologyNotice,
    scores: {
      traceability: {
        score: clampScore(to100From4(traceability.level)),
        label: labelFromScore(to100From4(traceability.level)),
        rationale: traceability.rationale,
      },
      factualRobustness: {
        score: clampScore(to100From4(factualRobustness.level)),
        label: labelFromScore(to100From4(factualRobustness.level)),
        rationale: factualRobustness.rationale,
      },
      interpretiveLoad: {
        score: clampScore(to100From4(interpretiveLoad)),
        label: labelFromScore(to100From4(interpretiveLoad)),
        rationale: model.scoreSignals.interpretiveLoad.rationale,
      },
      contradictionHandling: {
        score: clampScore(to100From4(contradictionHandling)),
        label: labelFromScore(to100From4(contradictionHandling)),
        rationale: model.scoreSignals.contradictionHandling.rationale,
      },
      sourceTransparency: {
        score: clampScore(to100From4(sourceTransparency.level)),
        label: labelFromScore(to100From4(sourceTransparency.level)),
        rationale: sourceTransparency.rationale,
      },
      biasRisk: {
        score: clampScore(to100From4(biasRisk)),
        label: labelFromScore(to100From4(biasRisk)),
        rationale: model.scoreSignals.biasRisk.rationale,
      },
    },
    authorPositioning: model.authorPositioning,
    keyClaims: model.keyClaims,
    biasMap: model.biasMap,
    unknowns: model.unknowns,
    recommendations: model.recommendations,
    caveats: model.caveats,
  };
}