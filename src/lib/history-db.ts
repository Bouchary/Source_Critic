import { Prisma, EntryKind, AnalysisMode as PrismaAnalysisMode, InputMode as PrismaInputMode } from "@prisma/client";
import { prisma } from "@/lib/db";
import type {
  AnalysisMode,
  AnalysisResult,
  ComparisonResult,
  ExternalSourceItem,
} from "@/lib/schema";
import type { HistoryEntry } from "@/types/history";

type AppHistoryKind = "analysis" | "comparison";
type AppInputMode = "text" | "pdf" | "mixed";

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function appModeToPrisma(mode: AnalysisMode): PrismaAnalysisMode {
  return mode === "external_research"
    ? PrismaAnalysisMode.EXTERNAL_RESEARCH
    : PrismaAnalysisMode.INTERNAL_ONLY;
}

function prismaModeToApp(mode: PrismaAnalysisMode): AnalysisMode {
  return mode === PrismaAnalysisMode.EXTERNAL_RESEARCH
    ? "external_research"
    : "internal_only";
}

function appKindToPrisma(kind: AppHistoryKind): EntryKind {
  return kind === "comparison" ? EntryKind.COMPARISON : EntryKind.ANALYSIS;
}

function prismaKindToApp(kind: EntryKind): AppHistoryKind {
  return kind === EntryKind.COMPARISON ? "comparison" : "analysis";
}

function appInputModeToPrisma(mode: AppInputMode): PrismaInputMode {
  if (mode === "pdf") return PrismaInputMode.PDF;
  if (mode === "mixed") return PrismaInputMode.MIXED;
  return PrismaInputMode.TEXT;
}

function prismaInputModeToApp(mode: PrismaInputMode): AppInputMode {
  if (mode === PrismaInputMode.PDF) return "pdf";
  if (mode === PrismaInputMode.MIXED) return "mixed";
  return "text";
}

function normalizeSources(value: unknown): ExternalSourceItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      url: typeof item.url === "string" ? item.url : "",
      snippet: typeof item.snippet === "string" ? item.snippet : "",
      domain: typeof item.domain === "string" ? item.domain : "",
    }))
    .filter((item) => item.url.trim().length > 0);
}

function mapDbEntry(entry: {
  id: string;
  kind: EntryKind;
  mode: PrismaAnalysisMode;
  inputMode: PrismaInputMode;
  title: string | null;
  author: string | null;
  documentType: string | null;
  publicationContext: string | null;
  sourceFileName: string | null;
  sourceFileNameA: string | null;
  sourceFileNameB: string | null;
  documentATitle: string | null;
  documentBTitle: string | null;
  rawText: string | null;
  rawTextA: string | null;
  rawTextB: string | null;
  resultJson: Prisma.JsonValue;
  sourcesJson: Prisma.JsonValue | null;
  createdAt: Date;
}): HistoryEntry {
  const base = {
    id: entry.id,
    kind: prismaKindToApp(entry.kind),
    mode: prismaModeToApp(entry.mode),
    inputMode: prismaInputModeToApp(entry.inputMode),
    createdAt: entry.createdAt.toISOString(),
    sources: normalizeSources(entry.sourcesJson),
  };

  if (entry.kind === EntryKind.ANALYSIS) {
    return {
      ...base,
      kind: "analysis",
      title: entry.title ?? "",
      author: entry.author ?? "",
      documentType: entry.documentType ?? "",
      publicationContext: entry.publicationContext ?? "",
      sourceFileName: entry.sourceFileName ?? undefined,
      rawText: entry.rawText ?? "",
      result: entry.resultJson as unknown as AnalysisResult,
    };
  }

  return {
    ...base,
    kind: "comparison",
    documentATitle: entry.documentATitle ?? "",
    documentBTitle: entry.documentBTitle ?? "",
    rawTextA: entry.rawTextA ?? "",
    rawTextB: entry.rawTextB ?? "",
    sourceFileNameA: entry.sourceFileNameA ?? undefined,
    sourceFileNameB: entry.sourceFileNameB ?? undefined,
    result: entry.resultJson as unknown as ComparisonResult,
  };
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
      kind: appKindToPrisma("analysis"),
      mode: appModeToPrisma(params.mode),
      inputMode: appInputModeToPrisma(params.inputMode),
      title: params.title || "",
      author: params.author || "",
      documentType: params.documentType || "",
      publicationContext: params.publicationContext || "",
      sourceFileName: params.sourceFileName || null,
      rawText: params.rawText,
      resultJson: toInputJsonValue(params.result),
      sourcesJson: toInputJsonValue(params.sources),
    },
  });
}

export async function saveComparisonToDb(params: {
  mode: AnalysisMode;
  inputMode: AppInputMode;
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
      kind: appKindToPrisma("comparison"),
      mode: appModeToPrisma(params.mode),
      inputMode: appInputModeToPrisma(params.inputMode),
      documentATitle: params.documentATitle || "",
      documentBTitle: params.documentBTitle || "",
      rawTextA: params.rawTextA,
      rawTextB: params.rawTextB,
      sourceFileNameA: params.sourceFileNameA || null,
      sourceFileNameB: params.sourceFileNameB || null,
      resultJson: toInputJsonValue(params.result),
      sourcesJson: toInputJsonValue(params.sources),
    },
  });
}

export async function getHistoryFromDb(): Promise<HistoryEntry[]> {
  const rows = await prisma.historyEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return rows.map(mapDbEntry);
}

export async function getHistoryEntryById(id: string): Promise<HistoryEntry | null> {
  const row = await prisma.historyEntry.findUnique({
    where: { id },
  });

  if (!row) return null;
  return mapDbEntry(row);
}

export async function clearHistoryInDb() {
  await prisma.historyEntry.deleteMany();
}