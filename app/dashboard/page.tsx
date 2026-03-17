import Link from "next/link";
import {
  ArrowRight,
  FileSearch2,
  GitCompareArrows,
  History,
  LayoutDashboard,
  Settings,
  UserCircle2,
} from "lucide-react";

function DashboardCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-white/10 bg-slate-950/20 p-5 transition hover:bg-slate-950/30"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>

      <p className="text-sm leading-6 text-slate-300">{description}</p>

      <div className="mt-4 inline-flex items-center gap-2 text-sm text-slate-200">
        Ouvrir
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
              <LayoutDashboard className="h-5 w-5 text-slate-200" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Dashboard
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Point d’entrée produit pour piloter vos analyses, comparaisons,
                historiques et futurs espaces utilisateur.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DashboardCard
            href="/analyze"
            title="Analyse"
            description="Lancer une analyse simple à partir d’un texte ou d’un PDF."
            icon={<FileSearch2 className="h-5 w-5 text-slate-200" />}
          />

          <DashboardCard
            href="/compare"
            title="Comparer"
            description="Comparer deux textes ou deux PDF avec un rapport structuré."
            icon={<GitCompareArrows className="h-5 w-5 text-slate-200" />}
          />

          <DashboardCard
            href="/history"
            title="Historique"
            description="Accéder aux runs sauvegardés et rejouer un résultat figé."
            icon={<History className="h-5 w-5 text-slate-200" />}
          />

          <DashboardCard
            href="/profile"
            title="Profil"
            description="Préparer l’espace utilisateur et les métadonnées de compte."
            icon={<UserCircle2 className="h-5 w-5 text-slate-200" />}
          />

          <DashboardCard
            href="/settings"
            title="Paramètres"
            description="Centraliser les réglages produit et les options futures."
            icon={<Settings className="h-5 w-5 text-slate-200" />}
          />
        </section>
      </div>
    </main>
  );
}