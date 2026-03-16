import { NextResponse } from "next/server";
import {
  comparisonInputSchema,
  type ComparisonResult,
  type ExternalSourceItem,
} from "@/lib/schema";
import {
  buildCompareUserPrompt,
  COMPARE_INTERNAL_SYSTEM_PROMPT,
  COMPARE_EXTERNAL_SYSTEM_PROMPT,
  COMPARISON_JSON_SCHEMA,
} from "@/lib/compare-prompts";
import { saveComparisonToDb } from "@/lib/history-db";
import { createExternalStructuredResponse } from "@/lib/openai-external";
import { openai } from "@/lib/openai";
import {
  buildDeterministicComparisonResult,
  type ComparisonModelOutput,
} from "@/lib/compare-scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = comparisonInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Entrée invalide." },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const external = payload.mode === "external_research";

    let result: ComparisonResult;
    let sources: ExternalSourceItem[] = [];

    if (external) {
      const externalResponse =
        await createExternalStructuredResponse<ComparisonModelOutput>({
          instructions: COMPARE_EXTERNAL_SYSTEM_PROMPT,
          input: buildCompareUserPrompt(payload),
          schema: COMPARISON_JSON_SCHEMA,
          name: "source_critic_compare_v33",
        });

      result = buildDeterministicComparisonResult(externalResponse.result);
      sources = externalResponse.sources;
    } else {
      const response = await openai.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5",
        instructions: COMPARE_INTERNAL_SYSTEM_PROMPT,
        input: buildCompareUserPrompt(payload),
        text: {
          format: {
            type: "json_schema",
            name: "source_critic_compare_v33_internal",
            schema: COMPARISON_JSON_SCHEMA,
            strict: true,
          },
        },
      });

      const raw = response.output_text;

      if (!raw) {
        return NextResponse.json(
          { error: "Aucune sortie exploitable n’a été générée." },
          { status: 502 },
        );
      }

      result = buildDeterministicComparisonResult(
        JSON.parse(raw) as ComparisonModelOutput,
      );
    }

    await saveComparisonToDb({
      mode: payload.mode,
      inputMode: "text",
      documentATitle: payload.documentA.title || "Document A",
      documentBTitle: payload.documentB.title || "Document B",
      rawTextA: payload.documentA.text,
      rawTextB: payload.documentB.text,
      result,
      sources,
    });

    return NextResponse.json({ result, sources });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue côté serveur.";

    return NextResponse.json(
      { error: "Comparaison impossible pour le moment. Détail : " + message },
      { status: 500 },
    );
  }
}