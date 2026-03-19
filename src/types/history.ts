import type {
  AnalysisMode,
  AnalysisResult,
  ComparisonResult,
  ExternalSourceItem,
} from "@/lib/schema";

export type HistoryEntry =
  | {
      id: string;
      kind: "analysis";
      mode: AnalysisMode;
      inputMode: "text" | "pdf" | "mixed";
      createdAt: string;
      title: string;
      author: string;
      documentType: string;
      publicationContext: string;
      rawText: string;
      sourceFileName?: string;
      result: AnalysisResult;
      sources: ExternalSourceItem[];
      status: "draft" | "in_review" | "validated";
      workspaceId?: string | null;
      workspaceName?: string | null;
      commentCount: number;
    }
  | {
      id: string;
      kind: "comparison";
      mode: AnalysisMode;
      inputMode: "text" | "pdf" | "mixed";
      createdAt: string;
      documentATitle: string;
      documentBTitle: string;
      rawTextA: string;
      rawTextB: string;
      sourceFileNameA?: string;
      sourceFileNameB?: string;
      result: ComparisonResult;
      sources: ExternalSourceItem[];
      status: "draft" | "in_review" | "validated";
      workspaceId?: string | null;
      workspaceName?: string | null;
      commentCount: number;
    };

export interface RunCommentView {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
  authorEmail: string;
}