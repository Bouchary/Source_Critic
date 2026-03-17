export interface HomeNewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  tag: string;
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  eacute: "é",
  egrave: "è",
  ecirc: "ê",
  euml: "ë",
  agrave: "à",
  acirc: "â",
  auml: "ä",
  ugrave: "ù",
  ucirc: "û",
  uuml: "ü",
  icirc: "î",
  iuml: "ï",
  ocirc: "ô",
  ouml: "ö",
  ccedil: "ç",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  ndash: "–",
  mdash: "—",
  hellip: "…",
};

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) =>
      String.fromCodePoint(parseInt(dec, 10)),
    )
    .replace(/&([a-zA-Z]+);/g, (_, name) => NAMED_ENTITIES[name] ?? `&${name};`);
}

function stripHtml(value: string) {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

function getTagFromText(text: string) {
  const corpus = text.toLowerCase();

  if (/(iran|gaza|ukraine|liban|isra[eë]l|russie|otan|ormuz|afghanistan|soudan)/i.test(corpus)) {
    return "Conflit";
  }
  if (/(énergie|gaz|pétrole|nucléaire|ormuz)/i.test(corpus)) {
    return "Énergie";
  }
  if (/(europe|union européenne|g7|onu|cour internationale|ciJ|diplomatie)/i.test(corpus)) {
    return "Diplomatie";
  }
  if (/(élection|président|gouvernement|parlement|sanction)/i.test(corpus)) {
    return "Politique";
  }
  return "Géopolitique";
}

function extractItemsFromRss(xml: string, source: string, maxItems: number): HomeNewsItem[] {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  return items
    .slice(0, maxItems)
    .map((item) => {
      const title = stripHtml(item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");
      const url = stripHtml(item.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || "");
      const description = item.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || "";
      const encoded = item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i)?.[1] || "";
      const summary = truncate(stripHtml(encoded || description), 320);
      const publishedAt = stripHtml(
        item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] ||
          item.match(/<dc:date>([\s\S]*?)<\/dc:date>/i)?.[1] ||
          "",
      );

      return {
        title,
        url,
        source,
        publishedAt,
        summary,
        tag: getTagFromText(`${title} ${summary}`),
      };
    })
    .filter((item) => item.title && item.url);
}

async function fetchRss(url: string) {
  const response = await fetch(url, {
    next: { revalidate: 1800 },
    headers: {
      "User-Agent": "SourceCritic/1.0 (+homepage-news)",
      Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Flux indisponible: ${url}`);
  }

  return response.text();
}

export async function getHomepageNews() {
  const [franceXml, worldXml] = await Promise.allSettled([
    fetchRss("https://www.diplomatie.gouv.fr/spip.php?page=backend-fd"),
    fetchRss("https://www.lemonde.fr/international/rss_full.xml"),
  ]);

  const france =
    franceXml.status === "fulfilled"
      ? extractItemsFromRss(franceXml.value, "France Diplomatie", 6)
      : [];

  const world =
    worldXml.status === "fulfilled"
      ? extractItemsFromRss(worldXml.value, "Le Monde International", 6)
      : [];

  return { france, world };
}