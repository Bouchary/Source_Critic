import { Bell, Database, Settings, SlidersHorizontal } from "lucide-react";

function SettingBlock({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      <p className="mt-3 text-xs text-slate-400">État actuel : {value}</p>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
              <Settings className="h-5 w-5 text-slate-200" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Paramètres
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Base des futurs réglages produit : moteur, sources, comportements
                par défaut et préférences utilisateur.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SettingBlock
            title="Mode par défaut"
            description="Préparer un choix utilisateur entre analyse interne et recherche externe encadrée."
            value="Non personnalisable pour l’instant"
          />
          <SettingBlock
            title="Sources externes"
            description="Préparer les futures politiques de citation, de filtrage ou de confiance documentaire."
            value="Pilotage système uniquement"
          />
          <SettingBlock
            title="Exports"
            description="Préparer la configuration des exports PDF et des rapports rejouables."
            value="Export via impression ciblée"
          />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-200" />
              <h2 className="text-sm font-semibold text-white">
                Réglages d’analyse
              </h2>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              À connecter plus tard aux profils d’analyse et aux pondérations métier.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-200" />
              <h2 className="text-sm font-semibold text-white">
                Stockage et replay
              </h2>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Les runs sont déjà stockés. Les politiques de conservation viendront ensuite.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-200" />
              <h2 className="text-sm font-semibold text-white">
                Notifications
              </h2>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Prévu plus tard pour les espaces utilisateurs et les workflows équipe.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}