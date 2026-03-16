import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
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
import { clampScore } from "@/lib/utils";
import { saveAnalysisToDb } from "@/lib/history-db";
import { createExternalStructuredResponse } from "@/lib/openai-external";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeScores(result: AnalysisResult): AnalysisResult {
  return {
    ...result,
    scores: {
      traceability: {
        ...result.scores.traceability,
        score: clampScore(result.scores.traceability.score),
      },
      factualRobustness: {
        ...result.scores.factualRobustness,
        score: clampScore(result.scores.factualRobustness.score),
      },
      interpretiveLoad: {
        ...result.scores.interpretiveLoad,
        score: clampScore(result.scores.interpretiveLoad.score),
      },
      contradictionHandling: {
        ...result.scores.contradictionHandling,
        score: clampScore(result.scores.contradictionHandling.score),
      },
      sourceTransparency: {
        ...result.scores.sourceTransparency,
        score: clampScore(result.scores.sourceTransparency.score),
      },
      biasRisk: {
        ...result.scores.biasRisk,
        score: clampScore(result.scores.biasRisk.score),
      },
    },
  };
}

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
        await createExternalStructuredResponse<AnalysisResult>({
          instructions: EXTERNAL_SYSTEM_PROMPT,
          input: buildUserPrompt(payload),
          schema: ANALYSIS_JSON_SCHEMA,
          name: "source_critic_analysis_v31",
        });

      result = normalizeScores(externalResponse.result);
      sources = externalResponse.sources;
    } else {
      const response = await openai.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5",
        instructions: INTERNAL_SYSTEM_PROMPT,
        input: buildUserPrompt(payload),
        text: {
          format: {
            type: "json_schema",
            name: "source_critic_analysis_v31_internal",
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

      result = normalizeScores(JSON.parse(raw) as AnalysisResult);
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