import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  FileSearch2,
  FolderKanban,
  GitCompareArrows,
  MessageSquare,
} from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { getWorkspaceDetailForUser } from "@/lib/workspace-runs";

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

function statusLabel(status: "draft" | "in_review" | "validated") {
  if (status === "in_review") return "À relire";
  if (status === "validated") return "Validé";
  return "Brouillon";
}

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const workspace = await getWorkspaceDetailForUser(id, user.id);

  if (!workspace) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
                <FolderKanban className="h-5 w-5 text-slate-200" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  {workspace.name}
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {workspace.description || "Aucune description."}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Créé le {formatDate(workspace.createdAt)}
                </p>
              </div>
            </div>

            <div data-no-print>
              <Link
                href="/workspaces"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour aux espaces
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <h2 className="text-lg font-semibold text-white">Runs de l’espace</h2>

          <div className="mt-4 grid gap-4">
            {workspace.runs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/20 p-4 text-sm text-slate-300">
                Aucun run rattaché à cet espace pour le moment.
              </div>
            ) : (
              workspace.runs.map((entry) => {
                const title =
                  entry.kind === "analysis"
                    ? entry.title || "Analyse sans titre"
                    : `${entry.documentATitle || "Document A"} vs ${
                        entry.documentBTitle || "Document B"
                      }`;

                return (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/20 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                            {entry.kind === "analysis" ? (
                              <FileSearch2 className="h-3.5 w-3.5" />
                            ) : (
                              <GitCompareArrows className="h-3.5 w-3.5" />
                            )}
                            {entry.kind === "analysis" ? "Analyse" : "Comparaison"}
                          </span>

                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                            {entry.mode === "external_research" ? "Externe" : "Interne"}
                          </span>

                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                            {statusLabel(entry.status)}
                          </span>
                        </div>

                        <h3 className="break-words text-base font-semibold text-white">
                          {title}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-2">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatDate(entry.createdAt)}
                          </span>

                          <span className="inline-flex items-center gap-2">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {entry.commentCount} commentaire(s)
                          </span>
                        </div>
                      </div>

                      <div data-no-print>
                        <Link
                          href={`/replay/${entry.id}`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        >
                          Ouvrir le run figé
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}