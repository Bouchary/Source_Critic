import { GitCompareArrows } from "lucide-react";
import { ComparisonForm } from "@/components/comparison-form";
import { requireUser } from "@/lib/auth-helpers";

export default async function ComparePage() {
  await requireUser();

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
              <GitCompareArrows className="h-5 w-5 text-slate-200" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Comparer
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Espace de travail dédié à la comparaison de deux textes ou de deux PDF.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <ComparisonForm />
        </section>
      </div>
    </main>
  );
}