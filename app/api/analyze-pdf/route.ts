import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { extractTextFromPdfBuffer } from "@/lib/pdf";
import {
  ANALYSIS_JSON_SCHEMA,
  INTERNAL_SYSTEM_PROMPT,
  EXTERNAL_SYSTEM_PROMPT,
  buildUserPrompt,
} from "@/lib/prompts";
import {
  analysisInputSchema,
  type AnalysisResult,
  type ExternalSourceItem,
} from "@/lib/schema";
import { saveAnalysisToDb } from "@/lib/history-db";
import { createExternalStructuredResponse } from "@/lib/openai-external";
import {
  buildDeterministicAnalysisResult,
  type AnalysisModelOutput,
} from "@/lib/analyze-scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const mode = String(formData.get("mode") || "internal_only");
    const title = String(formData.get("title") || "");
    const author = String(formData.get("author") || "");
    const documentType = String(formData.get("documentType") || "");
    const publicationContext = String(formData.get("publicationContext") || "");
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier PDF valide reçu." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extracted = await extractTextFromPdfBuffer(buffer);

    const parsed = analysisInputSchema.safeParse({
      mode,
      title,
      author,
      documentType,
      publicationContext,
      text: extracted.text,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Le texte extrait du PDF est invalide.",
        },
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
          name: "source_critic_analysis_pdf_v37",
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
            name: "source_critic_analysis_pdf_v37_internal",
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
      inputMode: "pdf",
      title: payload.title,
      author: payload.author,
      documentType: payload.documentType,
      publicationContext: payload.publicationContext,
      sourceFileName: file.name,
      rawText: extracted.text,
      result,
      sources,
    });

    return NextResponse.json({
      extractedText: extracted.text,
      fileName: file.name,
      pageCount: extracted.pages,
      result,
      sources,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue côté serveur.";

    return NextResponse.json(
      { error: "Analyse PDF impossible pour le moment. Détail : " + message },
      { status: 500 },
    );
  }
}