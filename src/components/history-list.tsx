"use client";

import Link from "next/link";
import { Clock3, FileSearch2, GitCompareArrows, Trash2 } from "lucide-react";
import type { HistoryEntry } from "@/types/history";

interface HistoryListProps {
  items: HistoryEntry[];
  onClear?: () => void;
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

export function HistoryList({ items, onClear }: HistoryListProps) {
  return (
    <div className="grid gap-4">
      {onClear ? (
        <div className="flex justify-end" data-no-print>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <Trash2 className="h-4 w-4" />
            Vider l’historique
          </button>
        </div>
      ) : null}

      {!items.length ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/20 p-6 text-sm leading-6 text-slate-300">
          Aucun run enregistré pour le moment.
        </div>
      ) : (
        items.map((entry) => {
          const title =
            entry.kind === "analysis"
              ? entry.title || "Analyse sans titre"
              : `${entry.documentATitle || "Document A"} vs ${
                  entry.documentBTitle || "Document B"
                }`;

          return (
            <div
              key={entry.id}
              className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
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
                      {entry.inputMode}
                    </span>
                  </div>

                  <h2 className="break-words text-lg font-semibold text-white">
                    {title}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatDate(entry.createdAt)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3" data-no-print>
                  <Link
                    href={`/replay/${entry.id}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
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
  );
}