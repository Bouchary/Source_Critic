-- CreateEnum
CREATE TYPE "public"."EntryKind" AS ENUM ('ANALYSIS', 'COMPARISON');

-- CreateEnum
CREATE TYPE "public"."AnalysisMode" AS ENUM ('INTERNAL_ONLY', 'EXTERNAL_RESEARCH');

-- CreateEnum
CREATE TYPE "public"."InputMode" AS ENUM ('TEXT', 'PDF', 'MIXED');

-- CreateTable
CREATE TABLE "public"."HistoryEntry" (
    "id" TEXT NOT NULL,
    "kind" "public"."EntryKind" NOT NULL,
    "mode" "public"."AnalysisMode" NOT NULL,
    "inputMode" "public"."InputMode" NOT NULL,
    "title" TEXT,
    "author" TEXT,
    "documentType" TEXT,
    "publicationContext" TEXT,
    "sourceFileName" TEXT,
    "documentATitle" TEXT,
    "documentBTitle" TEXT,
    "sourceFileNameA" TEXT,
    "sourceFileNameB" TEXT,
    "rawText" TEXT,
    "rawTextA" TEXT,
    "rawTextB" TEXT,
    "resultJson" JSONB NOT NULL,
    "sourcesJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HistoryEntry_createdAt_idx" ON "public"."HistoryEntry"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "HistoryEntry_kind_createdAt_idx" ON "public"."HistoryEntry"("kind", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "HistoryEntry_mode_createdAt_idx" ON "public"."HistoryEntry"("mode", "createdAt" DESC);
