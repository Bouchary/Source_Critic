import { FileSearch2 } from "lucide-react";
import { AnalysisForm } from "@/components/analysis-form";

export default function AnalyzePage() {
  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
              <FileSearch2 className="h-5 w-5 text-slate-200" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Analyse
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Espace de travail dédié à l’analyse d’un texte ou d’un PDF.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <AnalysisForm />
        </section>
      </div>
    </main>
  );
}