import { TopNav } from "@/components/top-nav";
import { HistoryList } from "@/components/history-list";

export default function HistoryPage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <TopNav />

        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Historique local
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
            Les analyses sont conservées dans le navigateur courant. Elles ne
            constituent pas une base distante et ne sont pas partagées entre
            appareils.
          </p>
        </header>

        <HistoryList />
      </div>
    </main>
  );
}