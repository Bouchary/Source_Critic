import Link from "next/link";
import { ScrollText, ShieldCheck } from "lucide-react";

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

export default function MethodPage() {
  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-4">
              <ScrollText className="h-6 w-6 text-slate-100" />
            </div>

            <div className="max-w-4xl">
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Méthode
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                La méthode de Source Critic repose sur une idée simple : mieux
                distinguer ce qui est observable, ce qui relève d’une
                interprétation prudente, et ce qui reste non déterminable.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card
            title="Traçabilité"
            description="Le produit cherche à conserver les appuis, les sources et le contexte qui rendent un rapport plus défendable."
          />
          <Card
            title="Comparaison structurée"
            description="La comparaison n’est pas une simple juxtaposition : elle repose sur des axes explicités, comme le cadrage ou l’asymétrie d’étayage."
          />
          <Card
            title="Replay"
            description="Un run stocké peut être rejoué sans relancer le moteur, afin de garder un point de référence stable pour la discussion."
          />
          <Card
            title="Réserves"
            description="Le produit doit pouvoir dire quand une conclusion est fragile, partielle ou impossible à établir."
          />
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Principes de travail
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card
              title="Séparer les niveaux de certitude"
              description="Le rapport doit rendre visibles les écarts entre fait, interprétation, hypothèse, cadrage et point non déterminable."
            />
            <Card
              title="Rendre la lecture plus explicite"
              description="La valeur ne vient pas d’une réponse instantanée, mais d’une lecture mieux structurée, plus relisible et plus discutable."
            />
            <Card
              title="Conserver le contexte"
              description="Les métadonnées, les sources externes et le contexte de publication participent à la robustesse globale du travail."
            />
            <Card
              title="Accepter les limites"
              description="Le produit gagne en crédibilité quand il n’invente pas ce qu’il ne peut pas démontrer."
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-4">
              <ShieldCheck className="h-6 w-6 text-slate-100" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Ce que cette méthode apporte
              </h2>
              <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
                Elle ne supprime pas le jugement humain. Elle rend le travail plus
                lisible, plus argumentable, plus rejouable et plus compatible avec
                une relecture d’équipe.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap gap-3" data-no-print>
          <Link
            href="/product"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Retour au produit
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