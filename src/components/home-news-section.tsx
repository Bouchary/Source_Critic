import { Globe2, Newspaper } from "lucide-react";
import type { HomeNewsItem } from "@/lib/home-news";

function formatDate(value: string) {
  if (!value) return "Date non disponible";

  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function NewsColumn({
  title,
  icon,
  items,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  items: HomeNewsItem[];
  emptyText: string;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">
            Articles restitués tels qu’identifiés dans les flux publics, sans interprétation.
          </p>
        </div>
      </div>

      {!items.length ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/20 p-4 text-sm leading-6 text-slate-300">
          {emptyText}
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item, index) => (
            <article
              key={`${item.url}-${index}`}
              className="rounded-2xl border border-white/10 bg-slate-950/20 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                  {item.source}
                </span>
                <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-xs text-sky-100">
                  {item.tag}
                </span>
              </div>

              <h3 className="text-base font-semibold leading-6 text-white">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="break-words hover:underline"
                >
                  {item.title}
                </a>
              </h3>

              <p className="mt-2 text-xs text-slate-400">{formatDate(item.publishedAt)}</p>

              <p className="mt-3 break-words text-sm leading-6 text-slate-300 [overflow-wrap:anywhere]">
                {item.summary || "Résumé non disponible."}
              </p>

              <div className="mt-4">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  Lire l’article
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function HomeNewsSection({
  france,
  world,
}: {
  france: HomeNewsItem[];
  world: HomeNewsItem[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <NewsColumn
        title="Veille France"
        icon={<Newspaper className="h-5 w-5 text-slate-200" />}
        items={france}
        emptyText="Impossible de charger la veille France pour le moment."
      />

      <NewsColumn
        title="Veille Monde"
        icon={<Globe2 className="h-5 w-5 text-slate-200" />}
        items={world}
        emptyText="Impossible de charger la veille Monde pour le moment."
      />
    </div>
  );
}