import type { ComparisonResult, ComparisonInput } from "@/lib/schema";

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
    thesisConflict: ComparisonSignal;
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

function extractYears(text: string) {
  const matches = text.match(/\b(19\d{2}|20\d{2}|21\d{2})\b/g) || [];
  const years = matches
    .map((item) => Number(item))
    .filter((year) => year >= 1900 && year <= 2199);

  return [...new Set(years)].sort((a, b) => a - b);
}

function temporalSignalFromInputs(input: ComparisonInput): ComparisonSignal {
  const corpusA = [
    input.documentA.title,
    input.documentA.publicationContext,
    input.documentA.text,
  ]
    .filter(Boolean)
    .join("\n");

  const corpusB = [
    input.documentB.title,
    input.documentB.publicationContext,
    input.documentB.text,
  ]
    .filter(Boolean)
    .join("\n");

  const yearsA = extractYears(corpusA);
  const yearsB = extractYears(corpusB);

  if (!yearsA.length && !yearsB.length) {
    return {
      level: 2,
      rationale:
        "Aucune date explicite stable n’a été détectée dans les deux documents ; la distance temporelle est fixée à un niveau intermédiaire par défaut.",
    };
  }

  if (!yearsA.length || !yearsB.length) {
    return {
      level: 2,
      rationale:
        "Un seul des deux documents contient des années explicites ; la distance temporelle ne peut pas être tranchée finement et est fixée à un niveau intermédiaire.",
    };
  }

  let minDiff = Number.POSITIVE_INFINITY;
  for (const yearA of yearsA) {
    for (const yearB of yearsB) {
      const diff = Math.abs(yearA - yearB);
      if (diff < minDiff) minDiff = diff;
    }
  }

  let level: 0 | 1 | 2 | 3 | 4;
  if (minDiff <= 1) level = 0;
  else if (minDiff <= 3) level = 1;
  else if (minDiff <= 7) level = 2;
  else if (minDiff <= 15) level = 3;
  else level = 4;

  return {
    level,
    rationale: `Années détectées A : ${yearsA.join(", ")} ; B : ${yearsB.join(
      ", ",
    )}. Écart minimal observé : ${minDiff} an(s).`,
  };
}

function countMatches(text: string, regex: RegExp) {
  return (text.match(regex) || []).length;
}

function evidenceProfile(text: string) {
  const numbers = countMatches(text, /\b\d+(?:[.,]\d+)?\b/g);
  const percentages = countMatches(text, /%|pour cent/gi);
  const urls = countMatches(text, /https?:\/\/\S+/gi);
  const quotes = countMatches(text, /[«“"][^«“"”]{8,}[»”"]/g);
  const citationLike = countMatches(text, /\([^)]{3,80}\)/g);
  const sourceMarkers = countMatches(
    text,
    /\b(selon|d'après|rapport|étude|données|source|sources|chiffres|statistique|statistiques|enquête|indice|publication|observatoire|ocde|unesco|insee|eurostat|banque mondiale|unicef|cnrs|université)\b/gi,
  );

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
    weighted,
  };
}

function evidenceSignalFromInputs(input: ComparisonInput): ComparisonSignal {
  const textA = input.documentA.text || "";
  const textB = input.documentB.text || "";

  const profileA = evidenceProfile(textA);
  const profileB = evidenceProfile(textB);

  const totalA = profileA.weighted;
  const totalB = profileB.weighted;
  const maxTotal = Math.max(totalA, totalB);
  const minTotal = Math.min(totalA, totalB);

  if (maxTotal <= 4) {
    return {
      level: 1,
      rationale:
        "Les deux documents présentent très peu de marqueurs d’étayage explicites (chiffres, sources, citations, URL) ; l’asymétrie est donc fixée à un niveau faible.",
    };
  }

  const gapRatio = (maxTotal - minTotal) / maxTotal;

  let level: 0 | 1 | 2 | 3 | 4;
  if (gapRatio < 0.15) level = 0;
  else if (gapRatio < 0.3) level = 1;
  else if (gapRatio < 0.5) level = 2;
  else if (gapRatio < 0.7) level = 3;
  else level = 4;

  return {
    level,
    rationale:
      `Étendue des marqueurs d’étayage A=${totalA}, B=${totalB}. ` +
      `Écart relatif=${gapRatio.toFixed(2)}. ` +
      `Le calcul repose sur des indices textuels observables : chiffres, citations, références et marqueurs de source.`,
  };
}

function framingProfile(input: {
  text: string;
  documentType?: string;
  publicationContext?: string;
  title?: string;
}) {
  const corpus = [
    input.title || "",
    input.documentType || "",
    input.publicationContext || "",
    input.text || "",
  ].join("\n");

  const precaution = countMatches(
    corpus,
    /\b(prudence|prudent|encadré|encadrée|encadrement|risque|risques|limite|limites|garde-fou|garde-fous|surveillance|protection|vérification|transparence|données|dépendance|triche|inégalité|inégalités)\b/gi,
  );

  const transformation = countMatches(
    corpus,
    /\b(urgence|transformer|transformation|intégrer pleinement|au cœur|inévitable|inéluctable|pleinement|central|centrale|adapter|préparer|monde réel|opportunité|gains considérables|acculturation)\b/gi,
  );

  const normative = countMatches(
    corpus,
    /\b(il faut|doit|doivent|nécessaire|responsabilité|obligation|bonne réponse|il convient|il importe)\b/gi,
  );

  const analytical = countMatches(
    corpus,
    /\b(analyse|synthèse|perspective|constat|question|enjeu|enjeux|contexte|cadre|approche|observation)\b/gi,
  );

  const marketOperational = countMatches(
    corpus,
    /\b(scénario|coût|coûts|marché|investisseur|investisseurs|risque géopolitique|impact immédiat|logistique|opérationnel|procédure|traçabilité)\b/gi,
  );

  const academicInstitutional = countMatches(
    corpus,
    /\b(institutionnel|académique|pédagogique|éducatif|école|enseignant|enseignants|élève|élèves|apprentissage|formation|politique éducative)\b/gi,
  );

  return {
    precaution,
    transformation,
    normative,
    analytical,
    marketOperational,
    academicInstitutional,
  };
}

function framingSignalFromInputs(input: ComparisonInput): ComparisonSignal {
  const a = framingProfile({
    text: input.documentA.text,
    documentType: input.documentA.documentType,
    publicationContext: input.documentA.publicationContext,
    title: input.documentA.title,
  });

  const b = framingProfile({
    text: input.documentB.text,
    documentType: input.documentB.documentType,
    publicationContext: input.documentB.publicationContext,
    title: input.documentB.title,
  });

  const poleA = a.transformation - a.precaution;
  const poleB = b.transformation - b.precaution;

  const normGap = Math.abs(a.normative - b.normative);
  const analyticGap = Math.abs(a.analytical - b.analytical);
  const operationalGap = Math.abs(a.marketOperational - b.marketOperational);
  const institutionalGap = Math.abs(
    a.academicInstitutional - b.academicInstitutional,
  );
  const poleGap = Math.abs(poleA - poleB);

  const raw =
    poleGap * 1.3 +
    normGap * 0.5 +
    analyticGap * 0.3 +
    operationalGap * 0.9 +
    institutionalGap * 0.4;

  let level: 0 | 1 | 2 | 3 | 4;
  if (raw < 2) level = 0;
  else if (raw < 4) level = 1;
  else if (raw < 7) level = 2;
  else if (raw < 11) level = 3;
  else level = 4;

  return {
    level,
    rationale:
      `Indice de cadrage calculé sur des marqueurs observables. ` +
      `A(prudence=${a.precaution}, transformation=${a.transformation}, normatif=${a.normative}) ; ` +
      `B(prudence=${b.precaution}, transformation=${b.transformation}, normatif=${b.normative}). ` +
      `Écart de pôle=${poleGap}, écart opérationnel=${operationalGap}.`,
  };
}

export function buildDeterministicComparisonResult(
  model: ComparisonModelOutput,
  input: ComparisonInput,
): ComparisonResult {
  const topicOverlap = clamp0to4(model.scoreSignals.topicOverlap.level);
  const thesisConflict = clamp0to4(model.scoreSignals.thesisConflict.level);
  const genreDistance = clamp0to4(model.scoreSignals.genreDistance.level);

  const temporalSignal = temporalSignalFromInputs(input);
  const evidenceSignal = evidenceSignalFromInputs(input);
  const framingSignal = framingSignalFromInputs(input);

  const temporalDistance = clamp0to4(temporalSignal.level);
  const evidenceAsymmetry = clamp0to4(evidenceSignal.level);
  const framingDistance = clamp0to4(framingSignal.level);

  const temporalAlignment = 4 - temporalDistance;
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
          temporalSignal.rationale,
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
          temporalSignal.rationale,
          framingSignal.rationale,
        ].join(" "),
      },
      framingGap: {
        score: framingGapScore,
        label: labelFromScore(framingGapScore),
        rationale: [
          `Distance de cadrage : ${framingDistance}/4.`,
          framingSignal.rationale,
        ].join(" "),
      },
      supportAsymmetry: {
        score: supportAsymmetryScore,
        label: labelFromScore(supportAsymmetryScore),
        rationale: [
          `Asymétrie d’étayage : ${evidenceAsymmetry}/4.`,
          evidenceSignal.rationale,
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
          evidenceSignal.rationale,
          temporalSignal.rationale,
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