import Link from "next/link";
import { Briefcase, Building2, LibraryBig, Users } from "lucide-react";

function UseCaseCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
      <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3">
        {icon}
      </div>
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-300">
        {items.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function UseCasesPage() {
  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Cas d’usage
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
            Source Critic est utile dès que l’enjeu est de comparer des documents,
            expliciter une lecture, garder une trace de travail et préparer une
            relecture ou une validation.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <UseCaseCard
            icon={<Briefcase className="h-5 w-5 text-slate-100" />}
            title="Cabinets et conseil"
            items={[
              "Analyser une note client ou un document source.",
              "Comparer deux versions d’un cadrage.",
              "Préparer une lecture argumentée avant restitution.",
            ]}
          />
          <UseCaseCard
            icon={<Building2 className="h-5 w-5 text-slate-100" />}
            title="Institutions"
            items={[
              "Lire des documents de position ou de doctrine.",
              "Comparer un texte officiel et une analyse externe.",
              "Archiver un run commenté dans un espace de travail.",
            ]}
          />
          <UseCaseCard
            icon={<LibraryBig className="h-5 w-5 text-slate-100" />}
            title="Recherche / enseignement"
            items={[
              "Comparer deux documents argumentatifs.",
              "Identifier les limites d’inférence.",
              "Travailler la méthode de lecture critique.",
            ]}
          />
          <UseCaseCard
            icon={<Users className="h-5 w-5 text-slate-100" />}
            title="Équipes analystes"
            items={[
              "Passer de brouillon à validé.",
              "Commenter un run figé.",
              "Rattacher les travaux à un workspace.",
            ]}
          />
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Valeur transversale
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
              <h3 className="text-base font-semibold text-white">Relire plus proprement</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Le produit aide à mieux voir ce qui est tenu, fragile ou encore à relire.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
              <h3 className="text-base font-semibold text-white">Comparer sans perdre le contexte</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Les documents restent rattachés à leur mode, à leurs sources et à leur historique.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
              <h3 className="text-base font-semibold text-white">Préparer une restitution</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Replay, commentaires et export rendent l’outil utile avant une note, une réunion ou une validation.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap gap-3" data-no-print>
          <Link
            href="/product"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Voir le produit
          </Link>
          <Link
            href="/method"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Voir la méthode
          </Link>
        </section>
      </div>
    </main>
  );
}