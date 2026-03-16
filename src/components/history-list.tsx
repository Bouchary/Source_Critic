"use client";

import { useEffect, useState } from "react";
import type { StoredHistoryEntry } from "@/types/history";
import { Trash2, RotateCcw } from "lucide-react";
import { ResultPanel } from "@/components/result-panel";
import { ComparisonResultPanel } from "@/components/comparison-result-panel";
import { SourcesPanel } from "@/components/sources-panel";

function isValidComparisonResult(result: unknown): boolean {
  return !!result && typeof result === "object" && "comparisonProfile" in result;
}

export function HistoryList() {
  const [items, setItems] = useState<StoredHistoryEntry[]>([]);
  const [selected, setSelected] = useState<StoredHistoryEntry | null>(null);

  async function load() {
    const response = await fetch("/api/history");
    const data = (await response.json()) as StoredHistoryEntry[];
    setItems(data);
    setSelected(data[0] ?? null);
  }

  async function clearAll() {
    await fetch("/api/history", { method: "DELETE" });
    setItems([]);
    setSelected(null);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.3fr]">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Historique persistant</h2>
          <button type="button" onClick={clearAll} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-950/50">
            <Trash2 className="h-4 w-4" />
            Vider
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/20 p-5 text-sm text-slate-300">
            Aucun historique en base pour le moment.
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <button type="button" onClick={() => setSelected(item)} className="w-full text-left">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium text-white">
                      {item.kind === "analysis"
                        ? item.title || item.sourceFileName || "Document sans titre"
                        : `${item.documentATitle || "Document A"} ↔ ${item.documentBTitle || "Document B"}`}
                    </h3>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                      {item.mode === "external_research" ? "externe" : "interne"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("fr-FR")}</p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">
                    {item.kind === "analysis" ? item.rawText : `${item.rawTextA}\n${item.rawTextB}`}
                  </p>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
        {!selected ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-950/20 p-8 text-center">
            <div className="max-w-md">
              <h2 className="text-lg font-semibold">Aucun rapport sélectionné</h2>
            </div>
          </div>
        ) : selected.kind === "analysis" ? (
          <div className="grid gap-6">
            <ResultPanel result={selected.result} />
            <SourcesPanel sources={selected.sources} />
          </div>
        ) : isValidComparisonResult(selected.result) ? (
          <div className="grid gap-6">
            <ComparisonResultPanel result={selected.result} />
            <SourcesPanel sources={selected.sources} />
          </div>
        ) : null}
      </section>
    </div>
  );
}