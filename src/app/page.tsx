import { LayoutPanelTop, ShieldCheck } from "lucide-react";
import { HomeNewsSection } from "@/components/home-news-section";
import { getHomepageNews } from "@/lib/home-news";

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

export default async function HomePage() {
  const { france, world } = await getHomepageNews();

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
                  <ShieldCheck className="h-5 w-5 text-slate-200" />
                </div>

                <div className="max-w-4xl">
                  <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                    Source Critic
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-slate-300 md:text-base">
                    Plateforme d’analyse critique des sources, de comparaison argumentée,
                    de traçabilité et de replay. La page d’accueil sert ici d’entrée
                    produit et de point de veille, tandis que les pages métier restent
                    dédiées au travail.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <FeatureCard
                  title="Analyse critique"
                  description="Évaluer un texte ou un PDF avec une grille plus stable et un rapport structuré."
                />
                <FeatureCard
                  title="Comparaison"
                  description="Comparer deux documents avec un scoring semi-déterministe et des sources traçables."
                />
                <FeatureCard
                  title="Replay"
                  description="Relire un run sauvegardé sans relancer le moteur ni perdre son contexte."
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
              <div className="mb-4 flex items-center gap-2">
                <LayoutPanelTop className="h-5 w-5 text-slate-200" />
                <h2 className="text-lg font-semibold text-white">
                  Positionnement produit
                </h2>
              </div>

              <p className="text-sm leading-6 text-slate-300">
                La homepage ne lance pas d’analyse. Elle présente le produit,
                organise la navigation et expose une veille géopolitique sourcée.
              </p>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Navigation
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Le header est global sur toutes les pages pour une expérience plus fluide.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Veille
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Les articles sont restitués sans interprétation ni relecture libre.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <HomeNewsSection france={france} world={world} />
      </div>
    </main>
  );
}