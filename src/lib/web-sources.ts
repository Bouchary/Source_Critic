import type { ExternalSourceItem } from "@/lib/schema";

function walk(value: unknown, acc: ExternalSourceItem[]) {
  if (!value) return;

  if (Array.isArray(value)) {
    for (const item of value) walk(item, acc);
    return;
  }

  if (typeof value !== "object") return;

  const obj = value as Record<string, unknown>;

  if (Array.isArray(obj.sources)) {
    for (const source of obj.sources) {
      if (source && typeof source === "object") {
        const s = source as Record<string, unknown>;
        const title = typeof s.title === "string" ? s.title : "";
        const url = typeof s.url === "string" ? s.url : "";
        const snippet = typeof s.snippet === "string" ? s.snippet : "";
        const domain = typeof s.domain === "string" ? s.domain : "";

        if (url) {
          acc.push({ title, url, snippet, domain });
        }
      }
    }
  }

  for (const key of Object.keys(obj)) {
    walk(obj[key], acc);
  }
}

export function extractExternalSources(response: unknown): ExternalSourceItem[] {
  const acc: ExternalSourceItem[] = [];
  walk(response, acc);

  const seen = new Set<string>();
  return acc.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}