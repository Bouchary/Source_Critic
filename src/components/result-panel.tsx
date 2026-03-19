"use client";

import { useMemo, useState } from "react";
import type { AnalysisResult } from "@/lib/schema";
import { ExportReportButton } from "@/components/export-report-button";

type TabKey =
  | "resume"
  | "scores"
  | "claims"
  | "audit"
  | "biases"
  | "unknowns";

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

function statusTone(status: string) {
  if (status === "soutenu") return "text-emerald-200 border-emerald-400/20 bg-emerald-400/10";
  if (status === "contesté") return "text-amber-200 border-amber-400/20 bg-amber-400/10";
  return "text-rose-200 border-rose-400/20 bg-rose-400/10";
}

export function ResultPanel({ result }: { result: AnalysisResult }) {
  const [tab, setTab] = useState<TabKey>("resume");

  const claimAuditMap = useMemo(() => {
    const map = new Map<string, { status: string; basis: string }>();
    for (const item of result.auditTrail.claimAudit) {
      map.set(item.claimId, { status: item.status, basis: item.basis });
    }
    return map;
  }, [result.auditTrail.claimAudit]);

  return (
    <section
      id="analysis-report"
      className="report-content rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Rapport d’analyse
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {result.documentProfile.title || "Document sans titre"} —{" "}
              {result.documentProfile.documentType || "type non précisé"}
            </p>
            <p className="text-xs text-slate-400">
              Auteur : {result.documentProfile.author || "non fourni"} — Contexte :{" "}
              {result.documentProfile.publicationContext || "non fourni"}
            </p>
          </div>

          <div data-no-print>
            <ExportReportButton
              targetId="analysis-report"
              filename={`source-critic-analyse-${(result.documentProfile.title || "rapport")
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
          <button type="button" onClick={() => setTab("scores")} className={tabClass(tab === "scores")}>
            Scores
          </button>
          <button type="button" onClick={() => setTab("claims")} className={tabClass(tab === "claims")}>
            Claims
          </button>
          <button type="button" onClick={() => setTab("audit")} className={tabClass(tab === "audit")}>
            Audit
          </button>
          <button type="button" onClick={() => setTab("biases")} className={tabClass(tab === "biases")}>
            Biais
          </button>
          <button type="button" onClick={() => setTab("unknowns")} className={tabClass(tab === "unknowns")}>
            Inconnues
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
                <h3 className="text-sm font-semibold text-white">Éléments observables</h3>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                  {result.authorPositioning.observableElements.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                <h3 className="text-sm font-semibold text-white">Non inférable</h3>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                  {result.authorPositioning.nonInferableElements.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "scores" ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(result.scores).map(([key, score]) => (
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

        {tab === "claims" ? (
          <div className="grid gap-4">
            {result.keyClaims.map((claim) => {
              const audit = claimAuditMap.get(claim.id);
              return (
                <div key={claim.id} className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                      {claim.id}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                      {claim.claimType}
                    </span>
                    {audit ? (
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs ${statusTone(
                          audit.status,
                        )}`}
                      >
                        {audit.status}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 text-sm font-medium text-white">{claim.excerpt}</p>
                  <p className="mt-2 text-sm text-slate-200">{claim.assessment}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{claim.rationale}</p>

                  {audit ? (
                    <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Base d’audit</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{audit.basis}</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
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
                <h3 className="text-sm font-semibold text-white">Alertes d’étayage</h3>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                  {result.auditTrail.evidenceAlerts.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "biases" ? (
          <div className="grid gap-4">
            {result.biasMap.map((item, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                    {item.type}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                    {item.level}
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium text-white">{item.evidence}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.explanation}</p>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "unknowns" ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <h3 className="text-sm font-semibold text-white">Inconnues</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                {result.unknowns.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <h3 className="text-sm font-semibold text-white">Recommandations</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                {result.recommendations.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <h3 className="text-sm font-semibold text-white">Réserves</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                {result.caveats.map((item, index) => (
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