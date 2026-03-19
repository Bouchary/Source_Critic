import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, History, RefreshCcw } from "lucide-react";
import { getHistoryEntryById } from "@/lib/history-db";
import { ResultPanel } from "@/components/result-panel";
import { ComparisonResultPanel } from "@/components/comparison-result-panel";
import { SourcesPanel } from "@/components/sources-panel";
import { requireUser } from "@/lib/auth-helpers";
import { RunStatusControl } from "@/components/run-status-control";
import { RunComments } from "@/components/run-comments";
import { RunWorkspaceControl } from "@/components/run-workspace-control";

interface ReplayPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default async function ReplayPage({ params }: ReplayPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const entry = await getHistoryEntryById(id, user.id);

  if (!entry) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
                <History className="h-5 w-5 text-slate-200" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  Replay d’un run sauvegardé
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Ce rapport est rejoué à partir du résultat stocké, sans relancer l’analyse.
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Run enregistré le {formatDate(entry.createdAt)} — mode{" "}
                  {entry.mode === "external_research" ? "externe" : "interne"} — entrée{" "}
                  {entry.inputMode}
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <RunStatusControl runId={entry.id} initialStatus={entry.status} />
              <RunWorkspaceControl
                runId={entry.id}
                initialWorkspaceId={entry.workspaceId ?? null}
              />

              <div className="flex flex-wrap gap-3 lg:justify-end" data-no-print>
                <Link
                  href="/history"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour à l’historique
                </Link>

                <Link
                  href={entry.kind === "analysis" ? "/analyze" : "/compare"}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Nouveau run
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6">
          {entry.kind === "analysis" ? (
            <ResultPanel result={entry.result} />
          ) : (
            <ComparisonResultPanel result={entry.result} />
          )}

          <RunComments runId={entry.id} />
          <SourcesPanel sources={entry.sources} />
        </section>
      </div>
    </main>
  );
}