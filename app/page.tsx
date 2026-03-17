import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  LayoutPanelTop,
  ShieldCheck,
} from "lucide-react";
import { ProductNav } from "@/components/product-nav";
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
          <div className="flex flex-col gap-5">
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
                  de traçabilité et de replay. La page d’accueil devient ici une vraie
                  entrée produit, tandis que les pages métiers restent dédiées au travail.
                </p>
              </div>
            </div>

            <ProductNav />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <LayoutPanelTop className="h-5 w-5 text-slate-200" />
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Une entrée claire, un moteur sérieux
                </h2>
              </div>

              <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                Analysez un document, comparez deux textes, relisez un run figé,
                ou explorez une veille géopolitique courte et sourcée. L’objectif
                est de séparer proprement la vitrine, la lecture du monde et les
                espaces de production.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <FeatureCard
                  title="Analyser"
                  description="Évaluer un texte ou un PDF avec une grille de lecture critique plus stable."
                />
                <FeatureCard
                  title="Comparer"
                  description="Comparer deux documents avec un scoring semi-déterministe et des sources traçables."
                />
                <FeatureCard
                  title="Rejouer"
                  description="Relire un run sauvegardé sans relancer le moteur ni perdre son contexte."
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3" data-no-print>
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300/15 bg-slate-100 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-white"
                >
                  Commencer une analyse
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  Ouvrir le dashboard
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-slate-200" />
                <h2 className="text-lg font-semibold text-white">
                  Veille géopolitique
                </h2>
              </div>

              <p className="text-sm leading-6 text-slate-300">
                Encarts courts et sourcés, mis à jour à partir de flux publics,
                pour donner à la homepage un rôle éditorial clair.
              </p>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    France
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Diplomatie, énergie, Europe, positions officielles françaises.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Monde
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Conflits, équilibres régionaux, tensions internationales et enjeux globaux.
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