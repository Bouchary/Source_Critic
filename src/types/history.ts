import type {
  AnalysisMode,
  AnalysisResult,
  ComparisonResult,
  ExternalSourceItem,
} from "@/lib/schema";

export type HistoryKind = "analysis" | "comparison";
export type HistoryInputMode = "text" | "pdf" | "mixed";

interface HistoryEntryBase {
  id: string;
  kind: HistoryKind;
  mode: AnalysisMode;
  inputMode: HistoryInputMode;
  createdAt: string;
  sources: ExternalSourceItem[];
}

export interface AnalysisHistoryEntry extends HistoryEntryBase {
  kind: "analysis";
  title: string;
  author: string;
  documentType: string;
  publicationContext: string;
  sourceFileName?: string;
  rawText: string;
  result: AnalysisResult;
}

export interface ComparisonHistoryEntry extends HistoryEntryBase {
  kind: "comparison";
  documentATitle: string;
  documentBTitle: string;
  rawTextA: string;
  rawTextB: string;
  sourceFileNameA?: string;
  sourceFileNameB?: string;
  result: ComparisonResult;
}

export type HistoryEntry = AnalysisHistoryEntry | ComparisonHistoryEntry;