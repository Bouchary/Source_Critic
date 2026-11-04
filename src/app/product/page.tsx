import Link from "next/link";
import {
  FileSearch2,
  FolderKanban,
  GitCompareArrows,
  History,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function Card({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

export default function ProductPage() {
  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-4">
              <ShieldCheck className="h-6 w-6 text-slate-100" />
            </div>

            <div className="max-w-4xl">
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Produit
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Source Critic est un poste de travail d’analyse critique et de
                comparaison documentaire. Son rôle est d’aider à structurer une
                lecture, à conserver les éléments utiles et à rendre le résultat
                plus traçable et plus rejouable.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card
            title="Analyse simple"
            description="Analyse un texte ou un PDF en mode interne ou externe encadré, avec rendu structuré, scores, claims, réserves et audit."
          />
          <Card
            title="Comparaison documentaire"
            description="Compare deux textes ou deux PDF sur la convergence, la divergence, le cadrage, l’asymétrie d’étayage et la comparabilité."
          />
          <Card
            title="Historique et replay"
            description="Conserve les runs, permet de rejouer un résultat stocké et de revenir sur un travail sans relancer le moteur."
          />
          <Card
            title="Collaboration progressive"
            description="Ajoute workspaces, statuts, commentaires et rattachement des runs à un espace de travail."
          />
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Ce que le produit fait
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3">
                <FileSearch2 className="h-5 w-5 text-slate-100" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Lire un document avec méthode
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                L’outil organise un rendu critique, au lieu de produire seulement une réponse libre.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3">
                <GitCompareArrows className="h-5 w-5 text-slate-100" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Comparer deux documents
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                La comparaison fait partie du cœur produit, avec une logique plus explicite que celle d’un simple moteur de réponse.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3">
                <Sparkles className="h-5 w-5 text-slate-100" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Rendre le rapport plus défendable
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Traçabilité, replay, audit et commentaires servent à mieux assumer ce qui est solide, discutable ou indéterminé.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3">
                <History className="h-5 w-5 text-slate-100" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Garder une mémoire de travail
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Un run peut être rouvert, relu, commenté, exporté et reclassé sans repartir de zéro.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3">
                <FolderKanban className="h-5 w-5 text-slate-100" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Préparer un usage d’équipe
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Les workspaces permettent déjà de préparer une organisation collaborative cohérente autour des runs.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Ce que le produit ne prétend pas faire
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card
              title="Pas une vérité automatique"
              description="Le produit ne remplace pas un jugement humain final et ne doit pas être présenté comme un arbitre absolu."
            />
            <Card
              title="Pas un moteur générique de réponses"
              description="Sa valeur est dans la structure, la comparaison, la traçabilité et le travail rejouable."
            />
            <Card
              title="Pas encore un produit commercial finalisé"
              description="Le socle fonctionnel est là, mais la calibration, la preuve comparative et les offres viendront après."
            />
          </div>
        </section>

        <section className="flex flex-wrap gap-3" data-no-print>
          <Link
            href="/method"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Voir la méthode
          </Link>
          <Link
            href="/use-cases"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Voir les cas d’usage
          </Link>
        </section>
      </div>
    </main>
  );
}