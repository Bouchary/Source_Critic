import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type {
  AnalysisMode,
  AnalysisResult,
  ComparisonResult,
  ExternalSourceItem,
} from "@/lib/schema";
import type { StoredHistoryEntry } from "@/types/history";

function mapMode(mode: AnalysisMode) {
  return mode === "external_research" ? "EXTERNAL_RESEARCH" : "INTERNAL_ONLY";
}

function mapInputMode(mode: "text" | "pdf" | "mixed") {
  if (mode === "pdf") return "PDF";
  if (mode === "mixed") return "MIXED";
  return "TEXT";
}

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function saveAnalysisToDb(params: {
  mode: AnalysisMode;
  inputMode: "text" | "pdf";
  title: string;
  author: string;
  documentType: string;
  publicationContext: string;
  sourceFileName?: string;
  rawText: string;
  result: AnalysisResult;
  sources: ExternalSourceItem[];
}) {
  return prisma.historyEntry.create({
    data: {
      kind: "ANALYSIS",
      mode: mapMode(params.mode),
      inputMode: mapInputMode(params.inputMode),
      title: params.title || null,
      author: params.author || null,
      documentType: params.documentType || null,
      publicationContext: params.publicationContext || null,
      sourceFileName: params.sourceFileName || null,
      rawText: params.rawText,
      resultJson: toInputJson(params.result),
      sourcesJson: toInputJson(params.sources),
    },
  });
}

export async function saveComparisonToDb(params: {
  mode: AnalysisMode;
  inputMode: "text" | "pdf" | "mixed";
  documentATitle: string;
  documentBTitle: string;
  rawTextA: string;
  rawTextB: string;
  sourceFileNameA?: string;
  sourceFileNameB?: string;
  result: ComparisonResult;
  sources: ExternalSourceItem[];
}) {
  return prisma.historyEntry.create({
    data: {
      kind: "COMPARISON",
      mode: mapMode(params.mode),
      inputMode: mapInputMode(params.inputMode),
      documentATitle: params.documentATitle || null,
      documentBTitle: params.documentBTitle || null,
      rawTextA: params.rawTextA,
      rawTextB: params.rawTextB,
      sourceFileNameA: params.sourceFileNameA || null,
      sourceFileNameB: params.sourceFileNameB || null,
      resultJson: toInputJson(params.result),
      sourcesJson: toInputJson(params.sources),
    },
  });
}

export async function getHistoryFromDb(): Promise<StoredHistoryEntry[]> {
  const rows = await prisma.historyEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => {
    const mode =
      row.mode === "EXTERNAL_RESEARCH"
        ? "external_research"
        : "internal_only";

    const sources = Array.isArray(row.sourcesJson)
      ? (row.sourcesJson as unknown as ExternalSourceItem[])
      : [];

    if (row.kind === "ANALYSIS") {
      return {
        id: row.id,
        kind: "analysis" as const,
        mode,
        createdAt: row.createdAt.toISOString(),
        inputMode: row.inputMode === "PDF" ? "pdf" : "text",
        title: row.title || "",
        author: row.author || "",
        documentType: row.documentType || "",
        publicationContext: row.publicationContext || "",
        sourceFileName: row.sourceFileName || undefined,
        rawText: row.rawText || "",
        result: row.resultJson as unknown as AnalysisResult,
        sources,
      };
    }

    return {
      id: row.id,
      kind: "comparison" as const,
      mode,
      createdAt: row.createdAt.toISOString(),
      inputMode:
        row.inputMode === "PDF"
          ? "pdf"
          : row.inputMode === "MIXED"
            ? "mixed"
            : "text",
      documentATitle: row.documentATitle || "",
      documentBTitle: row.documentBTitle || "",
      rawTextA: row.rawTextA || "",
      rawTextB: row.rawTextB || "",
      sourceFileNameA: row.sourceFileNameA || undefined,
      sourceFileNameB: row.sourceFileNameB || undefined,
      result: row.resultJson as unknown as ComparisonResult,
      sources,
    };
  });
}

export async function clearHistoryInDb() {
  await prisma.historyEntry.deleteMany();
}