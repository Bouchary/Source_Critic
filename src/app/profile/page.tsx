import { BadgeInfo, Mail, ShieldCheck, UserCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { getOrCreateUserPreference } from "@/lib/user-preferences";

function InfoCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-200">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">{helper}</p>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await requireUser();
  const preference = await getOrCreateUserPreference(user.id);

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
              <UserCircle2 className="h-5 w-5 text-slate-200" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Profil
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Votre espace personnel Source Critic.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoCard
            title="Identité"
            value={user.name || "Nom non renseigné"}
            helper="Le nom affiché de votre compte."
          />
          <InfoCard
            title="Email"
            value={user.email || "Email non renseigné"}
            helper="Adresse utilisée pour la connexion."
          />
          <InfoCard
            title="Rôle"
            value="Utilisateur standard"
            helper="La gestion des rôles avancés viendra plus tard."
          />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoCard
            title="Mode par défaut"
            value={
              preference.defaultMode === "external_research"
                ? "Recherche externe encadrée"
                : "Lecture interne"
            }
            helper="Préférence actuellement enregistrée pour vos nouveaux runs."
          />
          <InfoCard
            title="Profil d’analyse"
            value={
              preference.analysisProfile === "academic"
                ? "Académique"
                : preference.analysisProfile === "media"
                  ? "Médiatique"
                  : preference.analysisProfile === "institutional"
                    ? "Institutionnel"
                    : "Géopolitique"
            }
            helper="Profil métier par défaut de votre compte."
          />
          <InfoCard
            title="Politique de sources"
            value={
              preference.sourcePolicy === "strict_reliable"
                ? "Strict fiable"
                : preference.sourcePolicy === "broad"
                  ? "Large"
                  : "Équilibré"
            }
            helper="Niveau d’ouverture documentaire souhaité."
          />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-200" />
                <h2 className="text-sm font-semibold text-white">Compte</h2>
              </div>
              <p className="text-sm leading-6 text-slate-300">
                L’utilisateur dispose désormais d’un vrai profil et de préférences persistées.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-200" />
                <h2 className="text-sm font-semibold text-white">Sécurité</h2>
              </div>
              <p className="text-sm leading-6 text-slate-300">
                Authentification réelle active. Les routes privées sont protégées.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <BadgeInfo className="h-4 w-4 text-slate-200" />
                <h2 className="text-sm font-semibold text-white">Préférences</h2>
              </div>
              <p className="text-sm leading-6 text-slate-300">
                Les réglages utilisateur servent maintenant de base au comportement produit.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}