import { BadgeInfo, Mail, ShieldCheck, UserCircle2 } from "lucide-react";

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

export default function ProfilePage() {
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
                Écran de préparation du futur espace utilisateur. Cette version
                pose le cadre visuel sans introduire encore l’authentification.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoCard
            title="Identité"
            value="Compte local non activé"
            helper="Le système d’authentification réelle sera ajouté au release suivant."
          />
          <InfoCard
            title="Email"
            value="Non renseigné"
            helper="Les informations de compte seront reliées à la future base utilisateur."
          />
          <InfoCard
            title="Rôle"
            value="Utilisateur standard"
            helper="La gestion des rôles et espaces de travail viendra plus tard."
          />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-200" />
                <h2 className="text-sm font-semibold text-white">Email et accès</h2>
              </div>
              <p className="text-sm leading-6 text-slate-300">
                À brancher sur le vrai système de connexion.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-200" />
                <h2 className="text-sm font-semibold text-white">Sécurité</h2>
              </div>
              <p className="text-sm leading-6 text-slate-300">
                Cookies, sessions et protection des routes au release suivant.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <BadgeInfo className="h-4 w-4 text-slate-200" />
                <h2 className="text-sm font-semibold text-white">Préférences</h2>
              </div>
              <p className="text-sm leading-6 text-slate-300">
                Les préférences personnelles seront centralisées avec les paramètres.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}