import type { AnalysisResult, ComparisonResult, ExternalSourceItem, AnalysisMode } from "@/lib/schema";

export interface StoredAnalysis {
  id: string;
  kind: "analysis";
  mode: AnalysisMode;
  createdAt: string;
  inputMode: "text" | "pdf";
  title: string;
  author: string;
  documentType: string;
  publicationContext: string;
  sourceFileName?: string;
  rawText: string;
  result: AnalysisResult;
  sources: ExternalSourceItem[];
}

export interface StoredComparison {
  id: string;
  kind: "comparison";
  mode: AnalysisMode;
  createdAt: string;
  inputMode: "text" | "pdf" | "mixed";
  documentATitle: string;
  documentBTitle: string;
  rawTextA: string;
  rawTextB: string;
  sourceFileNameA?: string;
  sourceFileNameB?: string;
  result: ComparisonResult;
  sources: ExternalSourceItem[];
}

export type StoredHistoryEntry = StoredAnalysis | StoredComparison;