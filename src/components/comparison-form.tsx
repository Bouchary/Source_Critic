"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  FileText,
  FileUp,
  GitCompareArrows,
  Loader2,
} from "lucide-react";
import type {
  AnalysisMode,
  ComparisonResult,
  ExternalSourceItem,
} from "@/lib/schema";
import { ComparisonResultPanel } from "@/components/comparison-result-panel";
import { ModeToggle } from "@/components/mode-toggle";
import { SourcesPanel } from "@/components/sources-panel";

interface CompareResponse {
  result: ComparisonResult;
  sources: ExternalSourceItem[];
  error?: string;
}

export function ComparisonForm() {
  const [mode, setMode] = useState<AnalysisMode>("internal_only");

  const [titleA, setTitleA] = useState("");
  const [authorA, setAuthorA] = useState("");
  const [documentTypeA, setDocumentTypeA] = useState("");
  const [publicationContextA, setPublicationContextA] = useState("");
  const [textA, setTextA] = useState("");
  const [fileA, setFileA] = useState<File | null>(null);

  const [titleB, setTitleB] = useState("");
  const [authorB, setAuthorB] = useState("");
  const [documentTypeB, setDocumentTypeB] = useState("");
  const [publicationContextB, setPublicationContextB] = useState("");
  const [textB, setTextB] = useState("");
  const [fileB, setFileB] = useState<File | null>(null);

  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [sources, setSources] = useState<ExternalSourceItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const countA = useMemo(() => textA.length, [textA]);
  const countB = useMemo(() => textB.length, [textB]);

  async function handleTextCompare(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResult(null);
    setSources([]);
    setLoading(true);

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          documentA: { title: titleA, author: authorA, documentType: documentTypeA, publicationContext: publicationContextA, text: textA },
          documentB: { title: titleB, author: authorB, documentType: documentTypeB, publicationContext: publicationContextB, text: textB },
        }),
      });

      const data = (await response.json()) as CompareResponse;
      if (!response.ok) throw new Error(data.error || "Erreur serveur.");

      setResult(data.result);
      setSources(data.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePdfCompare() {
    setError("");
    setResult(null);
    setSources([]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("mode", mode);

      formData.append("titleA", titleA);
      formData.append("authorA", authorA);
      formData.append("documentTypeA", documentTypeA);
      formData.append("publicationContextA", publicationContextA);
      formData.append("textA", textA);

      formData.append("titleB", titleB);
      formData.append("authorB", authorB);
      formData.append("documentTypeB", documentTypeB);
      formData.append("publicationContextB", publicationContextB);
      formData.append("textB", textB);

      if (fileA) formData.append("fileA", fileA);
      if (fileB) formData.append("fileB", fileB);

      const response = await fetch("/api/compare-pdf", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as CompareResponse & {
        textA?: string;
        textB?: string;
      };

      if (!response.ok) throw new Error(data.error || "Erreur serveur.");

      if (data.textA) setTextA(data.textA);
      if (data.textB) setTextB(data.textB);
      setResult(data.result);
      setSources(data.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  function resetForNewComparison() {
    setMode("internal_only");
    setTitleA("");
    setAuthorA("");
    setDocumentTypeA("");
    setPublicationContextA("");
    setTextA("");
    setFileA(null);

    setTitleB("");
    setAuthorB("");
    setDocumentTypeB("");
    setPublicationContextB("");
    setTextB("");
    setFileB(null);

    setResult(null);
    setSources([]);
    setError("");
  }

  if (result) {
    return (
      <div className="grid gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Rapport comparatif
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Consultez la comparaison en plein format, puis revenez à l’édition si nécessaire.
              </p>
            </div>

            <div className="flex flex-wrap gap-3" data-no-print>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à l’édition
              </button>

              <button
                type="button"
                onClick={resetForNewComparison}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-950/50"
              >
                <FileText className="h-4 w-4" />
                Nouvelle comparaison
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="grid gap-6">
            <ComparisonResultPanel result={result} />
            <SourcesPanel sources={sources} />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
        <div className="mb-6">
          <ModeToggle value={mode} onChange={setMode} />
        </div>

        <form className="grid gap-6" onSubmit={handleTextCompare}>
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/20 p-4">
              <h3 className="text-base font-semibold text-white">Document A</h3>
              <input className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none" value={titleA} onChange={(e) => setTitleA(e.target.value)} placeholder="Titre" />
              <input className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none" value={authorA} onChange={(e) => setAuthorA(e.target.value)} placeholder="Auteur" />
              <input className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none" value={documentTypeA} onChange={(e) => setDocumentTypeA(e.target.value)} placeholder="Type de document" />
              <input className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none" value={publicationContextA} onChange={(e) => setPublicationContextA(e.target.value)} placeholder="Contexte de publication" />
              <textarea className="min-h-[320px] rounded-3xl border border-white/10 bg-slate-950/40 px-4 py-4 text-sm leading-7 outline-none" value={textA} onChange={(e) => setTextA(e.target.value)} placeholder="Texte A..." />
              <div className="text-xs text-slate-400">{countA} caractères</div>
              <input type="file" accept="application/pdf" onChange={(e) => setFileA(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950" />
            </div>

            <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/20 p-4">
              <h3 className="text-base font-semibold text-white">Document B</h3>
              <input className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none" value={titleB} onChange={(e) => setTitleB(e.target.value)} placeholder="Titre" />
              <input className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none" value={authorB} onChange={(e) => setAuthorB(e.target.value)} placeholder="Auteur" />
              <input className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none" value={documentTypeB} onChange={(e) => setDocumentTypeB(e.target.value)} placeholder="Type de document" />
              <input className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none" value={publicationContextB} onChange={(e) => setPublicationContextB(e.target.value)} placeholder="Contexte de publication" />
              <textarea className="min-h-[320px] rounded-3xl border border-white/10 bg-slate-950/40 px-4 py-4 text-sm leading-7 outline-none" value={textB} onChange={(e) => setTextB(e.target.value)} placeholder="Texte B..." />
              <div className="text-xs text-slate-400">{countB} caractères</div>
              <input type="file" accept="application/pdf" onChange={(e) => setFileB(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950" />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300/15 bg-slate-100 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-white disabled:opacity-60">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Comparaison</> : <><GitCompareArrows className="h-4 w-4" />Comparer les textes</>}
            </button>

            <button type="button" onClick={handlePdfCompare} disabled={loading} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300/15 bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100 disabled:opacity-60">
              <FileUp className="h-4 w-4" />
              Comparer avec PDF
            </button>
          </div>

          {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}
        </form>
      </section>
    </div>
  );
}