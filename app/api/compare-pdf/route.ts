import { NextResponse } from "next/server";
import { extractTextFromPdfBuffer } from "@/lib/pdf";
import {
  comparisonInputSchema,
  type ComparisonResult,
  type ExternalSourceItem,
} from "@/lib/schema";
import { openai } from "@/lib/openai";
import {
  buildCompareUserPrompt,
  COMPARE_INTERNAL_SYSTEM_PROMPT,
  COMPARE_EXTERNAL_SYSTEM_PROMPT,
  COMPARISON_JSON_SCHEMA,
} from "@/lib/compare-prompts";
import { saveComparisonToDb } from "@/lib/history-db";
import { createExternalStructuredResponse } from "@/lib/openai-external";
import {
  buildDeterministicComparisonResult,
  type ComparisonModelOutput,
} from "@/lib/compare-scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const mode = String(formData.get("mode") || "internal_only");

    const fileA = formData.get("fileA");
    const fileB = formData.get("fileB");

    const titleA = String(formData.get("titleA") || "");
    const authorA = String(formData.get("authorA") || "");
    const documentTypeA = String(formData.get("documentTypeA") || "");
    const publicationContextA = String(formData.get("publicationContextA") || "");
    const textAOverride = String(formData.get("textA") || "");

    const titleB = String(formData.get("titleB") || "");
    const authorB = String(formData.get("authorB") || "");
    const documentTypeB = String(formData.get("documentTypeB") || "");
    const publicationContextB = String(formData.get("publicationContextB") || "");
    const textBOverride = String(formData.get("textB") || "");

    let textA = textAOverride;
    let textB = textBOverride;
    let fileNameA = "";
    let fileNameB = "";

    if (fileA instanceof File) {
      const bufferA = Buffer.from(await fileA.arrayBuffer());
      const extractedA = await extractTextFromPdfBuffer(bufferA);
      textA = extractedA.text;
      fileNameA = fileA.name;
    }

    if (fileB instanceof File) {
      const bufferB = Buffer.from(await fileB.arrayBuffer());
      const extractedB = await extractTextFromPdfBuffer(bufferB);
      textB = extractedB.text;
      fileNameB = fileB.name;
    }

    const parsed = comparisonInputSchema.safeParse({
      mode,
      documentA: {
        title: titleA || fileNameA,
        author: authorA,
        documentType: documentTypeA,
        publicationContext: publicationContextA,
        text: textA,
      },
      documentB: {
        title: titleB || fileNameB,
        author: authorB,
        documentType: documentTypeB,
        publicationContext: publicationContextB,
        text: textB,
      },
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Entrée de comparaison invalide.",
        },
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
          name: "source_critic_comparison_pdf_v33",
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
            name: "source_critic_comparison_pdf_v33_internal",
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

    const inputMode: "text" | "pdf" | "mixed" =
      fileA && fileB ? "pdf" : fileA || fileB ? "mixed" : "text";

    await saveComparisonToDb({
      mode: payload.mode,
      inputMode,
      documentATitle: payload.documentA.title || "Document A",
      documentBTitle: payload.documentB.title || "Document B",
      rawTextA: textA,
      rawTextB: textB,
      sourceFileNameA: fileNameA || undefined,
      sourceFileNameB: fileNameB || undefined,
      result,
      sources,
    });

    return NextResponse.json({
      textA,
      textB,
      fileNameA,
      fileNameB,
      result,
      sources,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue côté serveur.";

    return NextResponse.json(
      {
        error: "Comparaison PDF impossible pour le moment. Détail : " + message,
      },
      { status: 500 },
    );
  }
}