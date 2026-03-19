import type {
  AnalysisInput,
  AnalysisResult,
  AuditSourceChainItem,
} from "@/lib/schema";

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
  auditTrail: {
    confidenceBoundary: string;
    sourceTrustChain: AuditSourceChainItem[];
    claimAudit: {
      claimId: string;
      status: "soutenu" | "contesté" | "non déterminable";
      basis: string;
    }[];
    evidenceAlerts: string[];
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

function countMatches(text: string, regex: RegExp) {
  return (text.match(regex) || []).length;
}

function buildCorpus(input: AnalysisInput) {
  return [
    input.title || "",
    input.author || "",
    input.documentType || "",
    input.publicationContext || "",
    input.text || "",
  ].join("\n");
}

function evidenceProfile(input: AnalysisInput) {
  const corpus = buildCorpus(input);

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

  return {
    numbers,
    percentages,
    urls,
    quotes,
    citationLike,
    sourceMarkers,
    metadataCount,
  };
}

function interpretiveProfile(input: AnalysisInput) {
  const corpus = buildCorpus(input);

  const hedges = countMatches(
    corpus,
    /\b(semble|semblerait|paraît|paraîtrait|pourrait|pourraient|suggère|suggèrent|laisse penser|on peut penser|probable|probablement|possible|possiblement|il est plausible|on dirait)\b/gi,
  );

  const causalClaims = countMatches(
    corpus,
    /\b(parce que|car|donc|entraîne|provoque|cause|explique|démontre|prouve|conduit à|résulte de)\b/gi,
  );

  const generalisations = countMatches(
    corpus,
    /\b(toujours|jamais|tous|toutes|nul|aucun|inévitable|nécessairement|forcément|en général|de manière générale)\b/gi,
  );

  const prescriptive = countMatches(
    corpus,
    /\b(il faut|doit|doivent|il convient|nécessaire|indispensable|impératif|obligation|responsabilité)\b/gi,
  );

  const evaluative = countMatches(
    corpus,
    /\b(grave|excellent|inacceptable|catastrophique|salutaire|dangereux|urgent|essentiel|majeur|mineur|décisif)\b/gi,
  );

  return {
    hedges,
    causalClaims,
    generalisations,
    prescriptive,
    evaluative,
  };
}

function contradictionProfile(input: AnalysisInput) {
  const corpus = buildCorpus(input);

  const contrastMarkers = countMatches(
    corpus,
    /\b(mais|cependant|toutefois|pourtant|néanmoins|en revanche|d'un côté|de l'autre|or|bien que|quoique|alors que)\b/gi,
  );

  const concessionMarkers = countMatches(
    corpus,
    /\b(certes|il est vrai que|même si|bien que|quoique|tout en)\b/gi,
  );

  const uncertaintyMarkers = countMatches(
    corpus,
    /\b(non déterminable|incertain|incertaine|inconnu|inconnue|on ignore|il manque|reste à établir|reste inconnu)\b/gi,
  );

  const absolutistMarkers = countMatches(
    corpus,
    /\b(sans aucun doute|certainement|à l'évidence|de façon indiscutable|incontestable|prouve que)\b/gi,
  );

  return {
    contrastMarkers,
    concessionMarkers,
    uncertaintyMarkers,
    absolutistMarkers,
  };
}

function biasProfile(input: AnalysisInput) {
  const corpus = buildCorpus(input);

  const loadedTerms = countMatches(
    corpus,
    /\b(scandale|propagande|manipulation|mensonge|trahison|honte|dérive|abus|désastre|catastrophe|héroïque|toxique|illégitime)\b/gi,
  );

  const binaryMarkers = countMatches(
    corpus,
    /\b(eux|nous|camp|ennemi|traîtres|les vrais|les seuls|contre nous|contre eux)\b/gi,
  );

  const omissionMarkers = countMatches(
    corpus,
    /\b(uniquement|seulement|rien que|sans mentionner|sans évoquer|omettant|omission)\b/gi,
  );

  const teleologyMarkers = countMatches(
    corpus,
    /\b(inévitable|destiné à|avait vocation à|devait nécessairement|fin naturelle|aboutissement logique)\b/gi,
  );

  const moralCharge = countMatches(
    corpus,
    /\b(bien|mal|moral|immoral|vertueux|condamnable|juste|injuste)\b/gi,
  );

  return {
    loadedTerms,
    binaryMarkers,
    omissionMarkers,
    teleologyMarkers,
    moralCharge,
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

function interpretiveLoadSignal(input: AnalysisInput): AnalysisSignal {
  const profile = interpretiveProfile(input);

  const raw =
    profile.hedges * 0.2 +
    profile.causalClaims * 0.5 +
    profile.generalisations * 0.8 +
    profile.prescriptive * 0.6 +
    profile.evaluative * 0.5;

  let level: 0 | 1 | 2 | 3 | 4;
  if (raw < 2) level = 0;
  else if (raw < 4) level = 1;
  else if (raw < 7) level = 2;
  else if (raw < 10) level = 3;
  else level = 4;

  return {
    level,
    rationale:
      `Charge interprétative estimée à partir de marqueurs observables : prudence=${profile.hedges}, causalité=${profile.causalClaims}, généralisations=${profile.generalisations}, prescriptif=${profile.prescriptive}, évaluatif=${profile.evaluative}.`,
  };
}

function contradictionHandlingSignal(input: AnalysisInput): AnalysisSignal {
  const profile = contradictionProfile(input);

  const positive =
    profile.contrastMarkers * 0.7 +
    profile.concessionMarkers * 0.8 +
    profile.uncertaintyMarkers * 0.8;

  const negative = profile.absolutistMarkers * 0.8;

  const raw = positive - negative;

  let level: 0 | 1 | 2 | 3 | 4;
  if (raw < 1) level = 0;
  else if (raw < 2.5) level = 1;
  else if (raw < 4.5) level = 2;
  else if (raw < 7) level = 3;
  else level = 4;

  return {
    level,
    rationale:
      `Prise en charge de la contradiction estimée à partir des marqueurs observables : contrastes=${profile.contrastMarkers}, concessions=${profile.concessionMarkers}, incertitude explicite=${profile.uncertaintyMarkers}, absolutisation=${profile.absolutistMarkers}.`,
  };
}

function biasRiskSignal(input: AnalysisInput): AnalysisSignal {
  const profile = biasProfile(input);

  const raw =
    profile.loadedTerms * 0.8 +
    profile.binaryMarkers * 0.8 +
    profile.omissionMarkers * 0.5 +
    profile.teleologyMarkers * 0.7 +
    profile.moralCharge * 0.4;

  let level: 0 | 1 | 2 | 3 | 4;
  if (raw < 1.5) level = 0;
  else if (raw < 3) level = 1;
  else if (raw < 5.5) level = 2;
  else if (raw < 8) level = 3;
  else level = 4;

  return {
    level,
    rationale:
      `Risque de biais estimé à partir de marqueurs observables : charge lexicale=${profile.loadedTerms}, opposition binaire=${profile.binaryMarkers}, omissions explicites=${profile.omissionMarkers}, téléologie=${profile.teleologyMarkers}, charge morale=${profile.moralCharge}.`,
  };
}

function normalizeSourceTrustChain(items: AuditSourceChainItem[] | undefined) {
  return (items || []).map((item) => ({
    title: item.title || "",
    domain: item.domain || "",
    url: item.url || "",
    sourceType: item.sourceType || "indéterminé",
    reliability: item.reliability || "moyenne",
    rationale: item.rationale || "",
  }));
}

function normalizeAuditTrail(
  auditTrail: AnalysisModelOutput["auditTrail"],
  input: AnalysisInput,
) {
  const profile = evidenceProfile(input);

  const fallbackAlerts =
    auditTrail.evidenceAlerts?.length > 0
      ? auditTrail.evidenceAlerts
      : [
          `Le document contient ${profile.urls} URL explicites.`,
          `Le document contient ${profile.citationLike} marqueurs de citation.`,
          `Le document contient ${profile.sourceMarkers} marqueurs de source.`,
        ];

  return {
    confidenceBoundary:
      auditTrail.confidenceBoundary ||
      "Le rapport distingue ce qui est directement observable dans le texte, ce qui relève d’une inférence prudente et ce qui reste non déterminable.",
    sourceTrustChain: normalizeSourceTrustChain(auditTrail.sourceTrustChain),
    claimAudit: auditTrail.claimAudit || [],
    evidenceAlerts: fallbackAlerts,
  };
}

export function buildDeterministicAnalysisResult(
  model: AnalysisModelOutput,
  input: AnalysisInput,
): AnalysisResult {
  const traceability = traceabilitySignal(input);
  const factualRobustness = factualRobustnessSignal(input);
  const sourceTransparency = sourceTransparencySignal(input);
  const interpretiveLoad = interpretiveLoadSignal(input);
  const contradictionHandling = contradictionHandlingSignal(input);
  const biasRisk = biasRiskSignal(input);

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
        score: clampScore(to100From4(interpretiveLoad.level)),
        label: labelFromScore(to100From4(interpretiveLoad.level)),
        rationale: interpretiveLoad.rationale,
      },
      contradictionHandling: {
        score: clampScore(to100From4(contradictionHandling.level)),
        label: labelFromScore(to100From4(contradictionHandling.level)),
        rationale: contradictionHandling.rationale,
      },
      sourceTransparency: {
        score: clampScore(to100From4(sourceTransparency.level)),
        label: labelFromScore(to100From4(sourceTransparency.level)),
        rationale: sourceTransparency.rationale,
      },
      biasRisk: {
        score: clampScore(to100From4(biasRisk.level)),
        label: labelFromScore(to100From4(biasRisk.level)),
        rationale: biasRisk.rationale,
      },
    },
    authorPositioning: model.authorPositioning,
    keyClaims: model.keyClaims,
    biasMap: model.biasMap,
    unknowns: model.unknowns,
    recommendations: model.recommendations,
    caveats: model.caveats,
    auditTrail: normalizeAuditTrail(model.auditTrail, input),
  };
}