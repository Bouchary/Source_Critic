import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  FileSearch2,
  FolderKanban,
  GitCompareArrows,
  History,
  LayoutPanelTop,
  LibraryBig,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { HomeNewsSection } from "@/components/home-news-section";
import { getHomepageNews } from "@/lib/home-news";
import { getOptionalUser } from "@/lib/auth-helpers";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
      {children}
    </span>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
      <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

function AudienceCard({
  icon,
  title,
  points,
}: {
  icon: React.ReactNode;
  title: string;
  points: string[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
      <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-300">
        {points.map((point, index) => (
          <li key={index}>• {point}</li>
        ))}
      </ul>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
      <div className="inline-flex rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-medium text-sky-200">
        {step}
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

function HighlightCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

function PublicCtaCard({
  icon,
  title,
  description,
  href,
  linkLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-5">
      <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-200"
      >
        {linkLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const [{ france, world }, user] = await Promise.all([
    getHomepageNews(),
    getOptionalUser(),
  ]);

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="flex flex-wrap gap-2">
                <Pill>Analyse critique</Pill>
                <Pill>Comparaison structurée</Pill>
                <Pill>Traçabilité</Pill>
                <Pill>Replay</Pill>
                <Pill>Collaboration</Pill>
              </div>

              <div className="mt-6 flex items-start gap-4">
                <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-4">
                  <ShieldCheck className="h-6 w-6 text-slate-100" />
                </div>

                <div className="max-w-4xl">
                  <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                    Source Critic
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
                    Poste de travail pour lire, comparer et documenter des sources
                    de manière plus rigoureuse. L’outil aide à produire un rapport
                    structuré, traçable et rejouable, sans masquer les zones
                    d’incertitude.
                  </p>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
                    Source Critic ne se présente pas comme un moteur qui “dit la vérité”.
                    Il sert à organiser une lecture critique, à comparer des documents,
                    à conserver les sources et à rendre le résultat plus défendable.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3" data-no-print>
                <Link
                  href="/product"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <LayoutPanelTop className="h-4 w-4" />
                  Découvrir le produit
                </Link>

                <Link
                  href="/method"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <ScrollText className="h-4 w-4" />
                  Comprendre la méthode
                </Link>

                <Link
                  href="/use-cases"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <Target className="h-4 w-4" />
                  Voir les cas d’usage
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-3" data-no-print>
                {user ? (
                  <>
                    <Link
                      href="/analyze"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >
                      <FileSearch2 className="h-4 w-4" />
                      Lancer une analyse
                    </Link>
                    <Link
                      href="/compare"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/10"
                    >
                      <GitCompareArrows className="h-4 w-4" />
                      Comparer deux documents
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >
                      Créer un compte
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/10"
                    >
                      Se connecter
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <HighlightCard
                  title="Lecture critique"
                  description="Analyse un texte ou un PDF en séparant mieux les éléments observables, les inférences et les points non déterminables."
                />
                <HighlightCard
                  title="Comparaison argumentée"
                  description="Compare deux documents avec une grille plus stable : convergence, divergence, cadrage, asymétrie d’étayage et comparabilité."
                />
                <HighlightCard
                  title="Traçabilité et replay"
                  description="Conserve l’historique, rejoue les runs, ajoute des commentaires et rattache les travaux à des espaces de travail."
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-950/20 p-6">
              <div className="mb-5 flex items-center gap-2">
                <LayoutPanelTop className="h-5 w-5 text-slate-200" />
                <h2 className="text-lg font-semibold text-white">
                  Positionnement produit
                </h2>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Promesse
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Aider un analyste, un cabinet, une institution ou un
                    chercheur à produire une lecture critique plus structurée,
                    plus traçable et plus présentable.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Différence
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Source Critic n’est pas un simple moteur de réponse. Il met
                    l’accent sur la comparaison documentaire, le cadrage, la
                    traçabilité, l’auditabilité et le travail rejouable.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Maturité actuelle
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Authentification, préférences, historique, replay,
                    workspaces, statuts, commentaires et export sont déjà
                    présents. La suite logique porte sur la mise en scène
                    commerciale et la calibration.
                  </p>
                </div>

                <div className="rounded-2xl border border-sky-300/15 bg-sky-300/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-sky-200">
                    État de session
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-100">
                    {user
                      ? `Connecté en tant que ${user.email ?? user.name ?? "utilisateur"}.`
                      : "Session non connectée. Les pages Produit, Méthode et Cas d’usage sont consultables avant connexion."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Explorer Source Critic
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
              La homepage donne une vue d’ensemble. Les détails produit,
              méthodologiques et métier sont volontairement répartis sur des
              pages dédiées pour garder une lecture plus claire.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <PublicCtaCard
              icon={<LayoutPanelTop className="h-5 w-5 text-slate-100" />}
              title="Produit"
              description="Fonctionnalités, périmètre, logique générale et place de l’outil dans un workflow professionnel."
              href="/product"
              linkLabel="Ouvrir la page Produit"
            />
            <PublicCtaCard
              icon={<ScrollText className="h-5 w-5 text-slate-100" />}
              title="Méthode"
              description="Traçabilité, posture, limites, logique d’analyse, séparation entre fait, inférence et incertitude."
              href="/method"
              linkLabel="Ouvrir la page Méthode"
            />
            <PublicCtaCard
              icon={<Target className="h-5 w-5 text-slate-100" />}
              title="Cas d’usage"
              description="Cabinets, institutions, recherche, équipes analystes : où l’outil apporte une vraie valeur."
              href="/use-cases"
              linkLabel="Ouvrir les cas d’usage"
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Ce que fait concrètement l’outil
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
              La valeur du produit ne repose pas sur une promesse de vérité
              automatique, mais sur un cadre de travail plus discipliné pour
              l’analyse de sources et la comparaison de documents.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FeatureCard
              icon={<FileSearch2 className="h-5 w-5 text-slate-100" />}
              title="Analyser un document"
              description="Texte ou PDF, en mode interne ou avec recherche externe encadrée, avec restitution structurée et exportable."
            />
            <FeatureCard
              icon={<GitCompareArrows className="h-5 w-5 text-slate-100" />}
              title="Comparer deux documents"
              description="Comparer les convergences, divergences, cadrages, angles morts et niveaux d’étayage sur une base plus stable."
            />
            <FeatureCard
              icon={<History className="h-5 w-5 text-slate-100" />}
              title="Rejouer un run"
              description="Revenir sur une analyse ou une comparaison déjà produite, sans relancer le moteur, pour garder une base de travail figée."
            />
            <FeatureCard
              icon={<FolderKanban className="h-5 w-5 text-slate-100" />}
              title="Travailler en espace"
              description="Rattacher les runs à des workspaces, gérer leur statut, commenter et préparer un usage d’équipe."
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Pour quels usages
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
              La plateforme a de la valeur lorsque l’enjeu n’est pas seulement de
              “trouver une réponse”, mais de défendre une lecture, comparer des
              versions, documenter une analyse et conserver une trace rejouable.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AudienceCard
              icon={<Briefcase className="h-5 w-5 text-slate-100" />}
              title="Cabinets et conseil"
              points={[
                "Préparer une note de lecture critique.",
                "Comparer deux documents de position.",
                "Structurer une revue avant restitution client.",
              ]}
            />
            <AudienceCard
              icon={<Building2 className="h-5 w-5 text-slate-100" />}
              title="Institutions et affaires publiques"
              points={[
                "Analyser des prises de position.",
                "Comparer documents officiels et analyses externes.",
                "Conserver une piste de travail plus traçable.",
              ]}
            />
            <AudienceCard
              icon={<LibraryBig className="h-5 w-5 text-slate-100" />}
              title="Recherche et enseignement"
              points={[
                "Comparer deux corpus argumentatifs.",
                "Rendre visibles les limites d’inférence.",
                "Travailler la méthode autant que le contenu.",
              ]}
            />
            <AudienceCard
              icon={<Users className="h-5 w-5 text-slate-100" />}
              title="Équipes analystes"
              points={[
                "Passer d’un brouillon à un run validé.",
                "Commenter un résultat figé.",
                "Centraliser les travaux dans un espace.",
              ]}
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Workflow simple
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
              Le produit est pensé comme un flux de travail, pas comme une seule
              réponse instantanée.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StepCard
              step="Étape 1"
              title="Importer"
              description="Charger un texte ou un PDF, seul ou en paire, avec les métadonnées utiles."
            />
            <StepCard
              step="Étape 2"
              title="Analyser ou comparer"
              description="Obtenir un rapport structuré avec scores, claims, audit, réserves et points non déterminables."
            />
            <StepCard
              step="Étape 3"
              title="Relire et commenter"
              description="Rejouer le run, ajouter des commentaires, changer le statut et rattacher le travail à un workspace."
            />
            <StepCard
              step="Étape 4"
              title="Restituer"
              description="Exporter, archiver, réutiliser pour une note, une démonstration, une revue ou une validation interne."
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-slate-200" />
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Pourquoi Source Critic se distingue
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <HighlightCard
              title="Moins de magie, plus de méthode"
              description="Le produit gagne en crédibilité lorsqu’il montre ce qu’il sait, ce qu’il infère et ce qu’il ne peut pas conclure."
            />
            <HighlightCard
              title="Comparaison documentaire native"
              description="La comparaison est un bloc cœur du produit, avec cadrage, asymétrie d’étayage et comparabilité."
            />
            <HighlightCard
              title="Résultat rejouable"
              description="L’historique et le replay permettent de conserver un run figé, d’y revenir, de le commenter et de le faire évoluer."
            />
            <HighlightCard
              title="Préparation d’un usage d’équipe"
              description="Workspaces, statuts et commentaires posent la base d’un workflow collaboratif sans casser le socle existant."
            />
          </div>
        </section>

        <HomeNewsSection france={france} world={world} />

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Base produit prête pour les prochaines étapes
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                La prochaine logique n’est pas d’empiler des écrans, mais de
                renforcer encore la crédibilité, la calibration et la démonstration
                du produit.
              </p>
            </div>

            <div className="flex flex-wrap gap-3" data-no-print>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/10"
              >
                <BadgeCheck className="h-4 w-4" />
                Voir le dashboard
              </Link>

              <Link
                href="/history"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <History className="h-4 w-4" />
                Ouvrir l’historique
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}