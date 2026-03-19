import { Bell, Database, Settings, SlidersHorizontal } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { getOrCreateUserPreference } from "@/lib/user-preferences";
import { PreferencesForm } from "@/components/preferences-form";

function SettingInfo({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();
  const preference = await getOrCreateUserPreference(user.id);

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
                Réglez les préférences métier et le comportement par défaut de votre compte.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <PreferencesForm initialPreference={preference} />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SettingInfo
            title="Réglages d’analyse"
            description="La page est désormais branchée à la base utilisateur. Les préférences serviront de socle aux profils métier."
          />
          <SettingInfo
            title="Stockage et replay"
            description="Les runs restent liés à votre compte. Les règles d’affichage et de sauvegarde deviennent personnalisables."
          />
          <SettingInfo
            title="Évolution"
            description="Ces préférences serviront ensuite aux profils, à la traçabilité avancée, puis aux espaces collaboratifs."
          />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-200" />
              <h2 className="text-sm font-semibold text-white">
                Profils d’analyse
              </h2>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Prépare la différenciation académique, géopolitique, médiatique et institutionnelle.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-200" />
              <h2 className="text-sm font-semibold text-white">
                Préférences persistées
              </h2>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Les choix sont enregistrés en base et rattachés au compte utilisateur.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-200" />
              <h2 className="text-sm font-semibold text-white">
                Suite logique
              </h2>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Étape suivante : traçabilité avancée des scores et des justifications.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}