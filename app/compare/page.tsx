import { TopNav } from "@/components/top-nav";
import { ComparisonForm } from "@/components/comparison-form";

export default function ComparePage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <TopNav />

        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Comparaison critique de deux documents
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
            Compare deux textes ou deux PDF en termes de cadrage, d’étayage,
            d’angles morts et de convergences textuelles, sans prétendre
            arbitrer une vérité absolue.
          </p>
        </header>

        <ComparisonForm />
      </div>
    </main>
  );
}