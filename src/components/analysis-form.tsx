"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, FileText, Loader2, Sparkles } from "lucide-react";
import { ResultPanel } from "@/components/result-panel";
import { PdfUpload } from "@/components/pdf-upload";
import { ModeToggle } from "@/components/mode-toggle";
import { SourcesPanel } from "@/components/sources-panel";
import type {
  AnalysisMode,
  AnalysisResult,
  ExternalSourceItem,
} from "@/lib/schema";

interface ApiAnalysisResponse {
  result: AnalysisResult;
  sources: ExternalSourceItem[];
  error?: string;
}

export function AnalysisForm() {
  const [mode, setMode] = useState<AnalysisMode>("internal_only");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [publicationContext, setPublicationContext] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [sources, setSources] = useState<ExternalSourceItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const charCount = useMemo(() => text.length, [text]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setSources([]);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, title, author, documentType, publicationContext, text }),
      });

      const data = (await response.json()) as ApiAnalysisResponse;
      if (!response.ok) throw new Error(data.error || "Erreur serveur.");

      setResult(data.result);
      setSources(data.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  function resetForNewAnalysis() {
    setResult(null);
    setSources([]);
    setError("");
    setText("");
    setTitle("");
    setAuthor("");
    setDocumentType("");
    setPublicationContext("");
    setMode("internal_only");
  }

  if (result) {
    return (
      <div className="grid gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Rapport d’analyse
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Consultez le rapport en plein format, puis revenez à l’édition si nécessaire.
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
                onClick={resetForNewAnalysis}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-950/50"
              >
                <FileText className="h-4 w-4" />
                Nouvelle analyse
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="grid gap-6">
            <ResultPanel result={result} />
            <SourcesPanel sources={sources} />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight">Nouveau document à analyser</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Préparez votre texte ou votre PDF, choisissez le mode, puis lancez l’analyse.
          </p>
        </div>

        <div className="mb-6">
          <ModeToggle value={mode} onChange={setMode} />
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" />
            <input className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Auteur" />
            <input className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none" value={documentType} onChange={(e) => setDocumentType(e.target.value)} placeholder="Type de document" />
            <input className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none" value={publicationContext} onChange={(e) => setPublicationContext(e.target.value)} placeholder="Contexte de publication" />
          </div>

          <textarea
            className="min-h-[360px] rounded-3xl border border-white/10 bg-slate-950/40 px-4 py-4 text-sm leading-7 outline-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Collez ici le texte à analyser..."
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-400">{charCount} caractères - minimum recommandé : 500</div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300/15 bg-slate-100 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-white disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyse en cours
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Lancer l’analyse
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <PdfUpload
            mode={mode}
            title={title}
            author={author}
            documentType={documentType}
            publicationContext={publicationContext}
            onError={setError}
            onSuccess={({ extractedText, result, sources }) => {
              setError("");
              setText(extractedText);
              setResult(result);
              setSources(sources);
            }}
          />
        </div>

        {error ? <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}
      </section>
    </div>
  );
}