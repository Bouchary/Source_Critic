"use client";

import { useState } from "react";
import type { ComparisonResult } from "@/lib/schema";
import { ExportReportButton } from "@/components/export-report-button";

type TabKey =
  | "resume"
  | "assessment"
  | "common"
  | "divergences"
  | "audit"
  | "blindspots";

function tabClass(active: boolean) {
  return active
    ? "rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white"
    : "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10";
}

function scoreTone(score: number) {
  if (score >= 75) return "text-emerald-200";
  if (score >= 50) return "text-sky-200";
  if (score >= 25) return "text-amber-200";
  return "text-rose-200";
}

export function ComparisonResultPanel({ result }: { result: ComparisonResult }) {
  const [tab, setTab] = useState<TabKey>("resume");

  return (
    <section
      id="comparison-report"
      className="report-content rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Rapport de comparaison
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {result.comparisonProfile.documentATitle || "Document A"} vs{" "}
              {result.comparisonProfile.documentBTitle || "Document B"}
            </p>
            <p className="text-xs text-slate-400">
              Types : {result.comparisonProfile.documentAType || "non précisé"} /{" "}
              {result.comparisonProfile.documentBType || "non précisé"}
            </p>
          </div>

          <div data-no-print>
            <ExportReportButton
              targetId="comparison-report"
              filename={`source-critic-comparaison-${(result.comparisonProfile.documentATitle || "document-a")
                .toLowerCase()
                .replace(/[^a-z0-9]+/gi, "-")}-vs-${(result.comparisonProfile.documentBTitle || "document-b")
                .toLowerCase()
                .replace(/[^a-z0-9]+/gi, "-")}`}
              label="Exporter"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3" data-no-print>
          <button type="button" onClick={() => setTab("resume")} className={tabClass(tab === "resume")}>
            Résumé
          </button>
          <button type="button" onClick={() => setTab("assessment")} className={tabClass(tab === "assessment")}>
            Évaluation
          </button>
          <button type="button" onClick={() => setTab("common")} className={tabClass(tab === "common")}>
            Points communs
          </button>
          <button type="button" onClick={() => setTab("divergences")} className={tabClass(tab === "divergences")}>
            Divergences
          </button>
          <button type="button" onClick={() => setTab("audit")} className={tabClass(tab === "audit")}>
            Audit
          </button>
          <button type="button" onClick={() => setTab("blindspots")} className={tabClass(tab === "blindspots")}>
            Angles morts
          </button>
        </div>

        {tab === "resume" ? (
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <h3 className="text-sm font-semibold text-white">Résumé exécutif</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{result.executiveSummary}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <h3 className="text-sm font-semibold text-white">Notice méthodologique</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{result.methodologyNotice}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                <h3 className="text-sm font-semibold text-white">Cadrage du document A</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {result.framingAnalysis.documentAFrame}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                <h3 className="text-sm font-semibold text-white">Cadrage du document B</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {result.framingAnalysis.documentBFrame}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "assessment" ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(result.overallAssessment).map(([key, score]) => (
              <div key={key} className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">{key}</p>
                <p className={`mt-2 text-2xl font-semibold ${scoreTone(score.score)}`}>
                  {score.score}/100
                </p>
                <p className="mt-1 text-sm text-slate-200">{score.label}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{score.rationale}</p>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "common" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4 md:col-span-2">
              <h3 className="text-sm font-semibold text-white">Points communs</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                {result.commonGround.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <h3 className="text-sm font-semibold text-white">Écart de cadrage</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {result.framingAnalysis.framingGapSummary}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <h3 className="text-sm font-semibold text-white">Asymétrie d’étayage</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {result.evidenceAnalysis.asymmetrySummary}
              </p>
            </div>
          </div>
        ) : null}

        {tab === "divergences" ? (
          <div className="grid gap-4">
            {result.divergences.map((item, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                    {item.theme}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                    intensité {item.intensity}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Équilibre d’étayage</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.evidenceBalance}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "audit" ? (
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <h3 className="text-sm font-semibold text-white">Frontière de confiance</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {result.auditTrail.confidenceBoundary}
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                <h3 className="text-sm font-semibold text-white">Chaîne de confiance des sources</h3>
                {result.auditTrail.sourceTrustChain.length === 0 ? (
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Aucune chaîne de confiance exploitable n’a été restituée pour ce run.
                  </p>
                ) : (
                  <div className="mt-3 grid gap-3">
                    {result.auditTrail.sourceTrustChain.map((item, index) => (
                      <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-200">
                            {item.sourceType}
                          </span>
                          <span className="rounded-full border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-200">
                            fiabilité {item.reliability}
                          </span>
                          {item.domain ? (
                            <span className="rounded-full border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-200">
                              {item.domain}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 text-sm font-medium text-white">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.rationale}</p>
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-3 inline-block break-all text-sm text-sky-200 underline"
                          >
                            {item.url}
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                <h3 className="text-sm font-semibold text-white">Audit de comparabilité</h3>
                <p className="mt-3 text-sm text-slate-200">
                  Jugement : {result.auditTrail.comparabilityJudgement}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {result.auditTrail.comparabilityRationale}
                </p>

                <h4 className="mt-5 text-sm font-semibold text-white">Alertes d’étayage</h4>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                  {result.auditTrail.evidenceAlerts.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "blindspots" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <h3 className="text-sm font-semibold text-white">Angles morts</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                {result.blindSpots.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <h3 className="text-sm font-semibold text-white">Réserves</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                {result.reservations.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}