import { AnalysisForm } from "@/components/analysis-form";
import { TopNav } from "@/components/top-nav";
import { ShieldCheck, Files, Scale, SearchCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <TopNav />

        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
          <div className="flex flex-col gap-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-wide text-white/80">
              <ShieldCheck className="h-4 w-4" />
              V2.0 — Analyse critique des sources
            </div>

            <div className="max-w-4xl">
              <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                Source Critic
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                Assistant de lecture argumentée, cartographie de robustesse des
                énoncés, aide à l’étude historique, géopolitique et médiatique.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Files className="h-4 w-4" />
                  Analyse texte + PDF
                </div>
                <p className="text-sm text-slate-300">
                  Analyse d’un texte collé ou extrait d’un PDF texte.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Scale className="h-4 w-4" />
                  Robustesse
                </div>
                <p className="text-sm text-slate-300">
                  Qualifie le niveau de solidité du propos sans prétendre
                  trancher une vérité absolue.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <SearchCheck className="h-4 w-4" />
                  Historique local
                </div>
                <p className="text-sm text-slate-300">
                  Conserve localement les analyses pour les rouvrir plus tard.
                </p>
              </div>
            </div>
          </div>
        </header>

        <AnalysisForm />
      </div>
    </main>
  );
}