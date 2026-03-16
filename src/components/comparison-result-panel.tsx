"use client";

import type { ComparisonResult } from "@/lib/schema";
import { SectionCard } from "@/components/section-card";
import { ScoreBadge } from "@/components/score-badge";
import { ExportReportButton } from "@/components/export-report-button";
import { ReportTabs, type ReportTabItem } from "@/components/report-tabs";
import {
  FileDiff,
  GitCompareArrows,
  Layers3,
  ScanSearch,
  ShieldAlert,
} from "lucide-react";

interface ComparisonResultPanelProps {
  result: ComparisonResult;
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

export function ComparisonResultPanel({
  result,
}: ComparisonResultPanelProps) {
  const tabs: ReportTabItem[] = [
    {
      id: "overview",
      label: "Résumé",
      content: (
        <SectionCard
          title="Résumé comparatif"
          icon={<GitCompareArrows className="h-5 w-5" />}
        >
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <p className="break-words text-sm leading-7 text-slate-200 [overflow-wrap:anywhere]">
                {result.executiveSummary}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <h3 className="mb-2 text-sm font-medium text-white">Document A</h3>
                <p className="break-words text-sm text-slate-300 [overflow-wrap:anywhere]">
                  {result.comparisonProfile.documentATitle || "Non fourni"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <h3 className="mb-2 text-sm font-medium text-white">Document B</h3>
                <p className="break-words text-sm text-slate-300 [overflow-wrap:anywhere]">
                  {result.comparisonProfile.documentBTitle || "Non fourni"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-400/20 bg-sky-400/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-100">
                Portée de la comparaison
              </h3>
              <p className="break-words text-sm leading-6 text-sky-50/90 [overflow-wrap:anywhere]">
                {result.comparisonProfile.analysisScope}
              </p>
            </div>
          </div>
        </SectionCard>
      ),
    },
    {
      id: "method",
      label: "Notice",
      content: (
        <SectionCard
          title="Notice méthodologique"
          icon={<GitCompareArrows className="h-5 w-5" />}
        >
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <p className="break-words text-sm leading-6 text-slate-300 [overflow-wrap:anywhere]">
              {result.methodologyNotice}
            </p>
          </div>
        </SectionCard>
      ),
    },
    {
      id: "scores",
      label: "Évaluation",
      content: (
        <SectionCard title="Évaluation globale" icon={<Layers3 className="h-5 w-5" />}>
          <div className="grid gap-3 md:grid-cols-2">
            <ScoreRow
              label="Niveau de convergence"
              score={result.overallAssessment.convergenceLevel}
            />
            <ScoreRow
              label="Intensité des divergences"
              score={result.overallAssessment.divergenceIntensity}
            />
            <ScoreRow
              label="Écart de cadrage"
              score={result.overallAssessment.framingGap}
            />
            <ScoreRow
              label="Asymétrie d’étayage"
              score={result.overallAssessment.supportAsymmetry}
            />
            <ScoreRow
              label="Comparabilité"
              score={result.overallAssessment.comparability}
            />
          </div>
        </SectionCard>
      ),
    },
    {
      id: "common",
      label: "Points communs",
      content: (
        <SectionCard title="Points communs" icon={<FileDiff className="h-5 w-5" />}>
          <ul className="space-y-2 text-sm leading-6 text-slate-300">
            {result.commonPoints.map((item, index) => (
              <li key={index} className="break-words [overflow-wrap:anywhere]">
                • {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      ),
    },
    {
      id: "divergences",
      label: "Divergences",
      content: (
        <SectionCard title="Divergences" icon={<FileDiff className="h-5 w-5" />}>
          <ul className="space-y-2 text-sm leading-6 text-slate-300">
            {result.divergences.map((item, index) => (
              <li key={index} className="break-words [overflow-wrap:anywhere]">
                • {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      ),
    },
    {
      id: "framing",
      label: "Cadrage / étayage",
      content: (
        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard
            title="Différences de cadrage"
            icon={<ScanSearch className="h-5 w-5" />}
          >
            <ul className="space-y-2 text-sm leading-6 text-slate-300">
              {result.framingDifferences.map((item, index) => (
                <li key={index} className="break-words [overflow-wrap:anywhere]">
                  • {item}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Différences d’étayage"
            icon={<ScanSearch className="h-5 w-5" />}
          >
            <ul className="space-y-2 text-sm leading-6 text-slate-300">
              {result.supportDifferences.map((item, index) => (
                <li key={index} className="break-words [overflow-wrap:anywhere]">
                  • {item}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      ),
    },
    {
      id: "limits",
      label: "Angles morts",
      content: (
        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard
            title="Angles morts du document A"
            icon={<ShieldAlert className="h-5 w-5" />}
          >
            <ul className="space-y-2 text-sm leading-6 text-slate-300">
              {result.blindSpots.documentA.map((item, index) => (
                <li key={index} className="break-words [overflow-wrap:anywhere]">
                  • {item}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Angles morts du document B"
            icon={<ShieldAlert className="h-5 w-5" />}
          >
            <ul className="space-y-2 text-sm leading-6 text-slate-300">
              {result.blindSpots.documentB.map((item, index) => (
                <li key={index} className="break-words [overflow-wrap:anywhere]">
                  • {item}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      ),
    },
    {
      id: "recommendations",
      label: "Réserves",
      content: (
        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard title="Réserves" icon={<ShieldAlert className="h-5 w-5" />}>
            <ul className="space-y-2 text-sm leading-6 text-slate-300">
              {result.caveats.map((item, index) => (
                <li key={index} className="break-words [overflow-wrap:anywhere]">
                  • {item}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Recommandations de lecture"
            icon={<ShieldAlert className="h-5 w-5" />}
          >
            <ul className="space-y-2 text-sm leading-6 text-slate-300">
              {result.recommendations.map((item, index) => (
                <li key={index} className="break-words [overflow-wrap:anywhere]">
                  • {item}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="flex justify-end" data-no-print>
        <ExportReportButton
          targetId="comparison-report-export"
          fileTitle="rapport-comparatif"
        />
      </div>

      <div id="comparison-report-export" className="report-content grid gap-6">
        <ReportTabs tabs={tabs} />
      </div>
    </div>
  );
}