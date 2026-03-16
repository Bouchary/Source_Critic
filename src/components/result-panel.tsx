import type { AnalysisResult } from "@/lib/schema";
import { ScoreBadge } from "@/components/score-badge";
import { SectionCard } from "@/components/section-card";
import { ExportReportButton } from "@/components/export-report-button";
import {
  AlertTriangle,
  BadgeInfo,
  FileText,
  Scale,
  Search,
  ShieldAlert,
  Waypoints,
} from "lucide-react";

interface ResultPanelProps {
  result: AnalysisResult;
}

function ScoreRow({
  label,
  score,
}: {
  label: string;
  score: { score: number; label: string; rationale: string };
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-white">{label}</h3>
        <ScoreBadge score={score.score} label={score.label} />
      </div>
      <p className="break-words text-sm leading-6 text-slate-300 [overflow-wrap:anywhere]">
        {score.rationale}
      </p>
    </div>
  );
}

export function ResultPanel({ result }: ResultPanelProps) {
  return (
    <div className="grid gap-6">
      <div className="flex justify-end" data-no-print>
        <ExportReportButton
          targetId="analysis-report-export"
          fileTitle={result.documentProfile.title || "rapport-analyse"}
        />
      </div>

      <div id="analysis-report-export" className="report-content grid gap-6">
        <SectionCard title="Résumé exécutif" icon={<FileText className="h-5 w-5" />}>
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <p className="break-words text-sm leading-7 text-slate-200 [overflow-wrap:anywhere]">
                {result.executiveSummary}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <h3 className="mb-2 text-sm font-medium text-white">
                Notice méthodologique
              </h3>
              <p className="break-words text-sm leading-6 text-slate-300 [overflow-wrap:anywhere]">
                {result.methodologyNotice}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <h3 className="mb-2 text-sm font-medium text-white">Titre</h3>
                <p className="break-words text-sm text-slate-300 [overflow-wrap:anywhere]">
                  {result.documentProfile.title || "Non fourni"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <h3 className="mb-2 text-sm font-medium text-white">Auteur</h3>
                <p className="break-words text-sm text-slate-300 [overflow-wrap:anywhere]">
                  {result.documentProfile.author || "Non fourni"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <h3 className="mb-2 text-sm font-medium text-white">Type</h3>
                <p className="break-words text-sm text-slate-300 [overflow-wrap:anywhere]">
                  {result.documentProfile.documentType || "Non fourni"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <h3 className="mb-2 text-sm font-medium text-white">Contexte</h3>
                <p className="break-words text-sm text-slate-300 [overflow-wrap:anywhere]">
                  {result.documentProfile.publicationContext || "Non fourni"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-400/20 bg-sky-400/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-100">
                Portée de l’analyse
              </h3>
              <p className="break-words text-sm leading-6 text-sky-50/90 [overflow-wrap:anywhere]">
                {result.documentProfile.analysisScope}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Scores" icon={<Scale className="h-5 w-5" />}>
          <div className="grid gap-3 md:grid-cols-2">
            <ScoreRow label="Traçabilité" score={result.scores.traceability} />
            <ScoreRow
              label="Robustesse factuelle"
              score={result.scores.factualRobustness}
            />
            <ScoreRow
              label="Charge interprétative"
              score={result.scores.interpretiveLoad}
            />
            <ScoreRow
              label="Gestion de la contradiction"
              score={result.scores.contradictionHandling}
            />
            <ScoreRow
              label="Transparence des sources"
              score={result.scores.sourceTransparency}
            />
            <ScoreRow
              label="Risque global de biais"
              score={result.scores.biasRisk}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Positionnement de l’auteur"
          icon={<BadgeInfo className="h-5 w-5" />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <h3 className="mb-3 text-sm font-medium text-white">
                Éléments observables
              </h3>
              <ul className="space-y-2 text-sm leading-6 text-slate-300">
                {result.authorPositioning.observableElements.map((item, index) => (
                  <li key={index} className="break-words [overflow-wrap:anywhere]">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <h3 className="mb-3 text-sm font-medium text-white">
                Éléments non inférables
              </h3>
              <ul className="space-y-2 text-sm leading-6 text-slate-300">
                {result.authorPositioning.nonInferableElements.map((item, index) => (
                  <li key={index} className="break-words [overflow-wrap:anywhere]">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Énoncés clés" icon={<Search className="h-5 w-5" />}>
          <div className="grid gap-3">
            {result.keyClaims.map((claim) => (
              <div
                key={claim.id}
                className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                    {claim.id}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200 capitalize">
                    {claim.claimType}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                    {claim.assessment}
                  </span>
                </div>

                <blockquote className="break-words border-l border-white/15 pl-4 text-sm italic leading-6 text-slate-200 [overflow-wrap:anywhere]">
                  “{claim.excerpt}”
                </blockquote>

                <p className="mt-3 break-words text-sm leading-6 text-slate-300 [overflow-wrap:anywhere]">
                  {claim.rationale}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Cartographie des biais possibles"
          icon={<Waypoints className="h-5 w-5" />}
        >
          <div className="grid gap-3">
            {result.biasMap.map((bias, index) => (
              <div
                key={`${bias.type}-${index}`}
                className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                    {bias.type}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                    {bias.level}
                  </span>
                </div>
                <p className="break-words text-sm leading-6 text-slate-200 [overflow-wrap:anywhere]">
                  <span className="font-medium">Indice textuel : </span>
                  {bias.evidence}
                </p>
                <p className="mt-2 break-words text-sm leading-6 text-slate-300 [overflow-wrap:anywhere]">
                  {bias.explanation}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard
            title="Inconnues et angles morts"
            icon={<AlertTriangle className="h-5 w-5" />}
          >
            <ul className="space-y-2 text-sm leading-6 text-slate-300">
              {result.unknowns.map((item, index) => (
                <li key={index} className="break-words [overflow-wrap:anywhere]">
                  • {item}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Précautions de lecture"
            icon={<ShieldAlert className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <ul className="space-y-2 text-sm leading-6 text-slate-300">
                {result.recommendations.map((item, index) => (
                  <li key={index} className="break-words [overflow-wrap:anywhere]">
                    • {item}
                  </li>
                ))}
              </ul>

              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <h3 className="mb-2 text-sm font-medium text-white">Réserves</h3>
                <ul className="space-y-2 text-sm leading-6 text-slate-300">
                  {result.caveats.map((item, index) => (
                    <li key={index} className="break-words [overflow-wrap:anywhere]">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}