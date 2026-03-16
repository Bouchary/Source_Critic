import type { ExternalSourceItem } from "@/lib/schema";
import { SectionCard } from "@/components/section-card";
import { ExternalLink, Link2 } from "lucide-react";

interface SourcesPanelProps {
  sources: ExternalSourceItem[];
}

const HIGH_TRUST_DOMAINS = [
  "gouv.fr",
  "service-public.fr",
  "europa.eu",
  "who.int",
  "un.org",
  "worldbank.org",
  "oecd.org",
  "imf.org",
  "data.gouv.fr",
  "insee.fr",
  "legifrance.gouv.fr",
  "vie-publique.fr",
  "senat.fr",
  "assemblee-nationale.fr",
  "courdecassation.fr",
  "conseil-constitutionnel.fr",
  "justice.fr",
  "editions-legislatives.fr",
  "cnil.fr",
  "ameli.fr",
  "hauteautorite.fr",
  "ansm.sante.fr",
  "pubmed.ncbi.nlm.nih.gov",
  "nih.gov",
  "nature.com",
  "science.org",
  "arxiv.org",
  "hal.science",
  "persee.fr",
  "cairn.info",
  "openedition.org",
  "academie-francaise.fr",
  "bbc.com",
  "reuters.com",
  "apnews.com",
  "ft.com",
  "lemonde.fr",
  "france24.com",
];

function normalizeDomain(domainOrUrl: string) {
  try {
    const value = domainOrUrl.startsWith("http")
      ? new URL(domainOrUrl).hostname
      : domainOrUrl;
    return value.replace(/^www\./, "").toLowerCase();
  } catch {
    return domainOrUrl.replace(/^www\./, "").toLowerCase();
  }
}

function getDomain(source: ExternalSourceItem) {
  if (source.domain?.trim()) return normalizeDomain(source.domain);
  return normalizeDomain(source.url);
}

function getDisplayTitle(source: ExternalSourceItem) {
  if (source.title?.trim()) return source.title.trim();
  return getDomain(source) || "Source externe";
}

function isHighTrustSource(source: ExternalSourceItem) {
  const domain = getDomain(source);
  return HIGH_TRUST_DOMAINS.some(
    (trusted) => domain === trusted || domain.endsWith(`.${trusted}`),
  );
}

function shortenText(text: string, maxLength: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trimEnd()}…`;
}

function sortSources(sources: ExternalSourceItem[]) {
  return [...sources].sort((a, b) => {
    const trustA = isHighTrustSource(a) ? 1 : 0;
    const trustB = isHighTrustSource(b) ? 1 : 0;

    if (trustA !== trustB) return trustB - trustA;

    const domainA = getDomain(a);
    const domainB = getDomain(b);
    return domainA.localeCompare(domainB);
  });
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
  if (!sources.length) return null;

  const sortedSources = sortSources(sources);

  return (
    <SectionCard
      title="Sources externes consultées"
      icon={<Link2 className="h-5 w-5" />}
    >
      <div className="grid gap-4">
        {sortedSources.map((source, index) => {
          const domain = getDomain(source);
          const trusted = isHighTrustSource(source);
          const title = shortenText(getDisplayTitle(source), 140);
          const snippet = source.snippet
            ? shortenText(source.snippet, 280)
            : "";

          return (
            <div
              key={`${source.url}-${index}`}
              className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      className={
                        trusted
                          ? "inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200"
                          : "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300"
                      }
                    >
                      {domain}
                    </span>

                    <span
                      className={
                        trusted
                          ? "inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-1 text-[11px] font-medium text-sky-200"
                          : "inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-200"
                      }
                    >
                      {trusted ? "Source prioritaire" : "Source secondaire"}
                    </span>
                  </div>

                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block break-words text-base font-semibold leading-6 text-white hover:underline"
                    title={source.url}
                  >
                    {title}
                  </a>
                </div>

                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10"
                  title="Ouvrir la source dans un nouvel onglet"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ouvrir
                </a>
              </div>

              {snippet ? (
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {snippet}
                </p>
              ) : null}

              <div className="mt-3 rounded-xl border border-white/10 bg-black/10 px-3 py-2">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block break-all text-xs leading-5 text-slate-400 hover:text-slate-200"
                  title={source.url}
                >
                  {source.url}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}