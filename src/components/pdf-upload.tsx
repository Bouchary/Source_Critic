"use client";

import { useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import type { AnalysisMode, AnalysisResult, ExternalSourceItem } from "@/lib/schema";

interface PdfUploadProps {
  mode: AnalysisMode;
  title: string;
  author: string;
  documentType: string;
  publicationContext: string;
  onSuccess: (payload: {
    fileName: string;
    extractedText: string;
    result: AnalysisResult;
    sources: ExternalSourceItem[];
  }) => void;
  onError: (message: string) => void;
}

interface PdfApiResponse {
  fileName: string;
  extractedText: string;
  result: AnalysisResult;
  sources: ExternalSourceItem[];
  error?: string;
}

export function PdfUpload({
  mode,
  title,
  author,
  documentType,
  publicationContext,
  onSuccess,
  onError,
}: PdfUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) {
      onError("Sélectionnez un fichier PDF.");
      return;
    }

    setLoading(true);
    onError("");

    try {
      const formData = new FormData();
      formData.append("mode", mode);
      formData.append("title", title);
      formData.append("author", author);
      formData.append("documentType", documentType);
      formData.append("publicationContext", publicationContext);
      formData.append("file", file);

      const response = await fetch("/api/analyze-pdf", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as PdfApiResponse;
      if (!response.ok) throw new Error(data.error || "Erreur serveur lors de l’analyse PDF.");

      onSuccess({
        fileName: data.fileName,
        extractedText: data.extractedText,
        result: data.result,
        sources: data.sources || [],
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-white">Analyse depuis un PDF</h3>
        <p className="mt-1 text-sm leading-6 text-slate-300">
          PDF texte recommandé. Le mode actif sera appliqué à l’analyse du PDF.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950"
        />

        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !file}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300/15 bg-slate-100 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-white disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyse PDF
            </>
          ) : (
            <>
              <FileUp className="h-4 w-4" />
              Importer et analyser
            </>
          )}
        </button>
      </div>
    </div>
  );
}