import { NextResponse } from "next/server";
import {
  analysisInputSchema,
  type AnalysisResult,
  type ExternalSourceItem,
} from "@/lib/schema";
import {
  ANALYSIS_JSON_SCHEMA,
  INTERNAL_SYSTEM_PROMPT,
  EXTERNAL_SYSTEM_PROMPT,
  buildUserPrompt,
} from "@/lib/prompts";
import { saveAnalysisToDb } from "@/lib/history-db";
import { createExternalStructuredResponse } from "@/lib/openai-external";
import { openai } from "@/lib/openai";
import {
  buildDeterministicAnalysisResult,
  type AnalysisModelOutput,
} from "@/lib/analyze-scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = analysisInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Entrée invalide." },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const external = payload.mode === "external_research";

    let result: AnalysisResult;
    let sources: ExternalSourceItem[] = [];

    if (external) {
      const externalResponse =
        await createExternalStructuredResponse<AnalysisModelOutput>({
          instructions: EXTERNAL_SYSTEM_PROMPT,
          input: buildUserPrompt(payload),
          schema: ANALYSIS_JSON_SCHEMA,
          name: "source_critic_analysis_v37",
        });

      result = buildDeterministicAnalysisResult(externalResponse.result, payload);
      sources = externalResponse.sources;
    } else {
      const response = await openai.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5",
        instructions: INTERNAL_SYSTEM_PROMPT,
        input: buildUserPrompt(payload),
        text: {
          format: {
            type: "json_schema",
            name: "source_critic_analysis_v37_internal",
            schema: ANALYSIS_JSON_SCHEMA,
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

      result = buildDeterministicAnalysisResult(
        JSON.parse(raw) as AnalysisModelOutput,
        payload,
      );
    }

    await saveAnalysisToDb({
      mode: payload.mode,
      inputMode: "text",
      title: payload.title,
      author: payload.author,
      documentType: payload.documentType,
      publicationContext: payload.publicationContext,
      rawText: payload.text,
      result,
      sources,
    });

    return NextResponse.json({ result, sources });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue côté serveur.";

    return NextResponse.json(
      { error: "Analyse impossible pour le moment. Détail : " + message },
      { status: 500 },
    );
  }
}