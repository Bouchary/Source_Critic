import type {
  ComparisonInput,
  ComparisonResult,
  AuditSourceChainItem,
} from "@/lib/schema";

export interface ComparisonSignal {
  level: 0 | 1 | 2 | 3 | 4;
  rationale: string;
}

export interface ComparisonModelOutput {
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
    convergenceLevel: { score: number; label: string; rationale: string };
    divergenceIntensity: { score: number; label: string; rationale: string };
    framingGap: { score: number; label: string; rationale: string };
    supportAsymmetry: { score: number; label: string; rationale: string };
    comparability: { score: number; label: string; rationale: string };
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

function mean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeIntensity(
  value: string,
): "faible" | "moyenne" | "forte" {
  if (value === "faible" || value === "forte") return value;
  return "moyenne";
}

function countMatches(text: string, regex: RegExp) {
  return (text.match(regex) || []).length;
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

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const FRENCH_STOPWORDS = new Set([
  "alors",
  "au",
  "aucun",
  "aussi",
  "autre",
  "avant",
  "avec",
  "avoir",
  "bon",
  "car",
  "ce",
  "cela",
  "ces",
  "ceux",
  "chaque",
  "ci",
  "comme",
  "comment",
  "dans",
  "des",
  "du",
  "dedans",
  "dehors",
  "depuis",
  "devrait",
  "doit",
  "donc",
  "dos",
  "droite",
  "de",
  "elle",
  "elles",
  "en",
  "encore",
  "essai",
  "est",
  "et",
  "eu",
  "fait",
  "faites",
  "fois",
  "font",
  "force",
  "haut",
  "hors",
  "ici",
  "il",
  "ils",
  "je",
  "juste",
  "la",
  "le",
  "les",
  "leur",
  "là",
  "ma",
  "maintenant",
  "mais",
  "mes",
  "mine",
  "moins",
  "mon",
  "mot",
  "même",
  "ni",
  "nommés",
  "notre",
  "nous",
  "nouveaux",
  "ou",
  "où",
  "par",
  "parce",
  "parole",
  "pas",
  "personnes",
  "peut",
  "peu",
  "pièce",
  "plupart",
  "pour",
  "pourquoi",
  "quand",
  "que",
  "quel",
  "quelle",
  "quelles",
  "quels",
  "qui",
  "sa",
  "sans",
  "ses",
  "seulement",
  "si",
  "sien",
  "son",
  "sont",
  "sous",
  "soyez",
  "sujet",
  "sur",
  "ta",
  "tandis",
  "tellement",
  "tels",
  "tes",
  "ton",
  "tous",
  "tout",
  "trop",
  "très",
  "tu",
  "valeur",
  "voie",
  "voient",
  "vont",
  "votre",
  "vous",
  "vu",
  "ça",
  "étaient",
  "état",
  "étions",
  "été",
  "être",
]);

function tokenizeForOverlap(text: string) {
  return normalizeText(text)
    .split(" ")
    .filter((token) => token.length >= 4 && !FRENCH_STOPWORDS.has(token));
}

function topicOverlapSignalFromInputs(input: ComparisonInput): ComparisonSignal {
  const corpusA = [
    input.documentA.title || "",
    input.documentA.documentType || "",
    input.documentA.publicationContext || "",
    input.documentA.text || "",
  ].join("\n");

  const corpusB = [
    input.documentB.title || "",
    input.documentB.documentType || "",
    input.documentB.publicationContext || "",
    input.documentB.text || "",
  ].join("\n");

  const setA = new Set(tokenizeForOverlap(corpusA));
  const setB = new Set(tokenizeForOverlap(corpusB));

  if (setA.size === 0 || setB.size === 0) {
    return {
      level: 2,
      rationale:
        "Le recouvrement thématique ne peut pas être mesuré finement à partir des seuls tokens significatifs ; un niveau intermédiaire est retenu par prudence.",
    };
  }

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }

  const union = new Set([...setA, ...setB]).size;
  const ratio = union > 0 ? intersection / union : 0;

  let level: 0 | 1 | 2 | 3 | 4;
  if (ratio < 0.08) level = 0;
  else if (ratio < 0.16) level = 1;
  else if (ratio < 0.28) level = 2;
  else if (ratio < 0.42) level = 3;
  else level = 4;

  return {
    level,
    rationale:
      `Recouvrement lexical significatif calculé sur les deux corpus : intersection=${intersection}, union=${union}, ratio=${ratio.toFixed(
        2,
      )}.`,
  };
}

function genreSignalFromInputs(input: ComparisonInput): ComparisonSignal {
  const typeA = normalizeText(
    `${input.documentA.documentType || ""} ${input.documentA.publicationContext || ""}`,
  );
  const typeB = normalizeText(
    `${input.documentB.documentType || ""} ${input.documentB.publicationContext || ""}`,
  );

  const sameTypeTokens =
    typeA && typeB
      ? typeA
          .split(" ")
          .filter((token) => token.length >= 4 && typeB.includes(token)).length
      : 0;

  const profileA = framingProfile({
    text: input.documentA.text,
    documentType: input.documentA.documentType,
    publicationContext: input.documentA.publicationContext,
    title: input.documentA.title,
  });

  const profileB = framingProfile({
    text: input.documentB.text,
    documentType: input.documentB.documentType,
    publicationContext: input.documentB.publicationContext,
    title: input.documentB.title,
  });

  const operationalGap = Math.abs(
    profileA.marketOperational - profileB.marketOperational,
  );
  const institutionalGap = Math.abs(
    profileA.academicInstitutional - profileB.academicInstitutional,
  );
  const normativeGap = Math.abs(profileA.normative - profileB.normative);

  const raw =
    operationalGap * 1 +
    institutionalGap * 0.8 +
    normativeGap * 0.3 -
    sameTypeTokens * 0.6;

  let level: 0 | 1 | 2 | 3 | 4;
  if (raw < 1.5) level = 0;
  else if (raw < 3) level = 1;
  else if (raw < 5) level = 2;
  else if (raw < 8) level = 3;
  else level = 4;

  return {
    level,
    rationale:
      `Distance de genre/finalité estimée à partir des métadonnées et marqueurs textuels. ` +
      `Tokens communs de type/contexte=${sameTypeTokens}, écart opérationnel=${operationalGap}, écart institutionnel=${institutionalGap}.`,
  };
}

function thesisConflictSignalFromInputs(input: ComparisonInput): ComparisonSignal {
  const frame = framingSignalFromInputs(input);
  const temporal = temporalSignalFromInputs(input);

  const profileA = framingProfile({
    text: input.documentA.text,
    documentType: input.documentA.documentType,
    publicationContext: input.documentA.publicationContext,
    title: input.documentA.title,
  });
  const profileB = framingProfile({
    text: input.documentB.text,
    documentType: input.documentB.documentType,
    publicationContext: input.documentB.publicationContext,
    title: input.documentB.title,
  });

  const poleA = profileA.transformation - profileA.precaution;
  const poleB = profileB.transformation - profileB.precaution;
  const polarityGap = Math.abs(poleA - poleB);

  const raw = polarityGap * 0.8 + frame.level * 0.9 + temporal.level * 0.3;

  let level: 0 | 1 | 2 | 3 | 4;
  if (raw < 1.5) level = 0;
  else if (raw < 3) level = 1;
  else if (raw < 5) level = 2;
  else if (raw < 7) level = 3;
  else level = 4;

  return {
    level,
    rationale:
      `Distance de thèse estimée à partir des pôles de cadrage et de la distance contextuelle. ` +
      `Écart de polarité=${polarityGap}, distance de cadrage=${frame.level}/4, distance temporelle=${temporal.level}/4.`,
  };
}

function auditFallback(input: ComparisonInput) {
  const aLength = input.documentA.text.length;
  const bLength = input.documentB.text.length;
  const gap = Math.abs(aLength - bLength);

  return [
    `Longueur texte A : ${aLength} caractères.`,
    `Longueur texte B : ${bLength} caractères.`,
    `Écart brut de longueur : ${gap} caractères.`,
  ];
}

export function buildDeterministicComparisonResult(
  model: ComparisonModelOutput,
  input: ComparisonInput,
): ComparisonResult {
  const topicOverlap = topicOverlapSignalFromInputs(input);
  const thesisConflict = thesisConflictSignalFromInputs(input);
  const genreDistance = genreSignalFromInputs(input);
  const temporalSignal = temporalSignalFromInputs(input);
  const evidenceSignal = evidenceSignalFromInputs(input);
  const framingSignal = framingSignalFromInputs(input);

  const temporalDistance = clamp0to4(temporalSignal.level);
  const evidenceAsymmetry = clamp0to4(evidenceSignal.level);
  const framingDistance = clamp0to4(framingSignal.level);
  const topicOverlapLevel = clamp0to4(topicOverlap.level);
  const thesisConflictLevel = clamp0to4(thesisConflict.level);
  const genreDistanceLevel = clamp0to4(genreDistance.level);

  const temporalAlignment = 4 - temporalDistance;
  const thesisAlignment = 4 - thesisConflictLevel;
  const genreAlignment = 4 - genreDistanceLevel;
  const evidenceSymmetry = 4 - evidenceAsymmetry;

  const convergenceRaw = mean([
    topicOverlapLevel,
    thesisAlignment,
    temporalAlignment,
  ]);

  const divergenceRaw = mean([
    thesisConflictLevel,
    temporalDistance,
    framingDistance,
  ]);

  const framingGapRaw = framingDistance;
  const supportAsymmetryRaw = evidenceAsymmetry;

  const comparabilityRaw = mean([
    topicOverlapLevel,
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
      documentATitle:
        model.comparisonProfile.documentATitle ||
        input.documentA.title ||
        "Document A",
      documentBTitle:
        model.comparisonProfile.documentBTitle ||
        input.documentB.title ||
        "Document B",
      documentAType:
        model.comparisonProfile.documentAType ||
        input.documentA.documentType ||
        "",
      documentBType:
        model.comparisonProfile.documentBType ||
        input.documentB.documentType ||
        "",
      comparisonScope:
        model.comparisonProfile.comparisonScope ||
        "Comparaison critique de deux documents à partir de leurs contenus, de leurs cadrages et de leurs niveaux d’étayage observables.",
      mode:
        model.comparisonProfile.mode === "external_research"
          ? "external_research"
          : "internal_only",
    },
    executiveSummary: model.executiveSummary,
    methodologyNotice: model.methodologyNotice,
    overallAssessment: {
      convergenceLevel: {
        score: clampScore(convergenceScore),
        label: labelFromScore(convergenceScore),
        rationale: [
          `Recouvrement thématique : ${topicOverlapLevel}/4.`,
          `Alignement des thèses : ${thesisAlignment}/4.`,
          `Proximité temporelle : ${temporalAlignment}/4.`,
          topicOverlap.rationale,
          thesisConflict.rationale,
          temporalSignal.rationale,
        ].join(" "),
      },
      divergenceIntensity: {
        score: clampScore(divergenceScore),
        label: labelFromScore(divergenceScore),
        rationale: [
          `Conflit de thèse : ${thesisConflictLevel}/4.`,
          `Distance temporelle : ${temporalDistance}/4.`,
          `Distance de cadrage : ${framingDistance}/4.`,
          thesisConflict.rationale,
          temporalSignal.rationale,
          framingSignal.rationale,
        ].join(" "),
      },
      framingGap: {
        score: clampScore(framingGapScore),
        label: labelFromScore(framingGapScore),
        rationale: [
          `Distance de cadrage : ${framingDistance}/4.`,
          framingSignal.rationale,
        ].join(" "),
      },
      supportAsymmetry: {
        score: clampScore(supportAsymmetryScore),
        label: labelFromScore(supportAsymmetryScore),
        rationale: [
          `Asymétrie d’étayage : ${evidenceAsymmetry}/4.`,
          evidenceSignal.rationale,
        ].join(" "),
      },
      comparability: {
        score: clampScore(comparabilityScore),
        label: labelFromScore(comparabilityScore),
        rationale: [
          `Recouvrement thématique : ${topicOverlapLevel}/4.`,
          `Proximité temporelle : ${temporalAlignment}/4.`,
          `Proximité de genre/finalité : ${genreAlignment}/4.`,
          `Symétrie d’étayage : ${evidenceSymmetry}/4.`,
          genreSignalFromInputs(input).rationale,
          evidenceSignal.rationale,
          temporalSignal.rationale,
        ].join(" "),
      },
    },
    commonGround: model.commonGround || [],
    divergences:
      model.divergences?.map((item) => ({
        ...item,
        intensity: normalizeIntensity(item.intensity),
      })) || [],
    framingAnalysis: model.framingAnalysis,
    evidenceAnalysis: model.evidenceAnalysis,
    blindSpots: model.blindSpots || [],
    reservations: model.reservations || [],
    auditTrail: {
      confidenceBoundary:
        model.auditTrail.confidenceBoundary ||
        "Le rapport compare les documents sans prétendre trancher au-delà de ce que les textes et les sources permettent réellement d’établir.",
      sourceTrustChain: model.auditTrail.sourceTrustChain || [],
      evidenceAlerts:
        model.auditTrail.evidenceAlerts?.length > 0
          ? model.auditTrail.evidenceAlerts
          : auditFallback(input),
      comparabilityJudgement:
        comparabilityScore >= 75
          ? "haute"
          : comparabilityScore >= 40
            ? "moyenne"
            : "faible",
      comparabilityRationale:
        model.auditTrail.comparabilityRationale ||
        [
          `La comparabilité est calculée sur quatre axes semi-déterministes : recouvrement thématique, proximité temporelle, proximité de genre/finalité et symétrie d’étayage.`,
          `Score final de comparabilité : ${comparabilityScore}/100.`,
        ].join(" "),
    },
  };
}