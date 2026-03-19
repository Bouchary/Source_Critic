import type { ExternalSourceItem } from "@/lib/schema";
import { extractExternalSources } from "@/lib/web-sources";

interface ExternalStructuredResponse<T> {
  result: T;
  sources: ExternalSourceItem[];
  rawResponse: unknown;
}

function extractOutputText(data: unknown): string {
  if (!data || typeof data !== "object") return "";

  const obj = data as Record<string, unknown>;

  if (typeof obj.output_text === "string" && obj.output_text.trim()) {
    return obj.output_text.trim();
  }

  const output = obj.output;
  if (!Array.isArray(output)) return "";

  const chunks: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== "object") continue;

    const content = (item as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (!part || typeof part !== "object") continue;

      const partObj = part as Record<string, unknown>;
      if (
        partObj.type === "output_text" &&
        typeof partObj.text === "string" &&
        partObj.text.trim()
      ) {
        chunks.push(partObj.text);
      }
    }
  }

  return chunks.join("\n").trim();
}

function safeParseJson(raw: string, contextLabel: string): unknown {
  const trimmed = raw.trim();

  if (!trimmed) {
    throw new Error(`${contextLabel} : réponse vide.`);
  }

  if (trimmed.startsWith("<")) {
    throw new Error(
      `${contextLabel} : une réponse HTML a été reçue à la place du JSON attendu. Début : ${trimmed.slice(0, 300)}`,
    );
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(
      `${contextLabel} : réponse non JSON valide. Début : ${trimmed.slice(0, 300)}`,
    );
  }
}

export async function createExternalStructuredResponse<T>(params: {
  instructions: string;
  input: string;
  schema: unknown;
  name: string;
}): Promise<ExternalStructuredResponse<T>> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY manquant côté serveur.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5",
      instructions: params.instructions,
      input: params.input,
      tools: [{ type: "web_search_preview" }],
      tool_choice: "required",
      include: ["web_search_call.action.sources"],
      text: {
        format: {
          type: "json_schema",
          name: params.name,
          schema: params.schema,
          strict: true,
        },
      },
    }),
  });

  const contentType = response.headers.get("content-type") || "";
  const rawHttpBody = await response.text();

  if (!response.ok) {
    if (!contentType.includes("application/json")) {
      throw new Error(
        `Erreur OpenAI côté recherche externe : HTTP ${response.status}. Réponse non JSON reçue (${contentType || "content-type inconnu"}). Début : ${rawHttpBody.slice(0, 300)}`,
      );
    }

    const errorData = safeParseJson(
      rawHttpBody,
      "Erreur OpenAI côté recherche externe",
    ) as Record<string, unknown>;

    const message =
      typeof (errorData.error as Record<string, unknown> | undefined)?.message ===
      "string"
        ? ((errorData.error as Record<string, unknown>).message as string)
        : `HTTP ${response.status} côté recherche externe.`;

    throw new Error(message);
  }

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Réponse OpenAI non JSON reçue (${contentType || "content-type inconnu"}). Début : ${rawHttpBody.slice(0, 300)}`,
    );
  }

  const data = safeParseJson(
    rawHttpBody,
    "Réponse OpenAI recherche externe",
  );

  const raw = extractOutputText(data);

  if (!raw) {
    throw new Error(
      "Aucune sortie JSON exploitable n’a été générée en mode externe.",
    );
  }

  let result: T;
  try {
    result = JSON.parse(raw) as T;
  } catch {
    throw new Error(
      `La réponse du mode externe n’est pas un JSON valide conforme au schéma attendu. Début : ${raw.slice(0, 300)}`,
    );
  }

  const sources = extractExternalSources(data);

  if (!sources.length) {
    throw new Error(
      "Mode externe refusé : aucune source exploitable n’a été récupérée. Résultat non restitué pour éviter une synthèse non traçable.",
    );
  }

  return {
    result,
    sources,
    rawResponse: data,
  };
}