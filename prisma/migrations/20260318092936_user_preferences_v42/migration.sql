-- CreateEnum
CREATE TYPE "public"."AnalysisProfile" AS ENUM ('ACADEMIC', 'GEOPOLITICAL', 'MEDIA', 'INSTITUTIONAL');

-- CreateEnum
CREATE TYPE "public"."SourcePolicy" AS ENUM ('STRICT_RELIABLE', 'BALANCED', 'BROAD');

-- CreateEnum
CREATE TYPE "public"."ExportPreference" AS ENUM ('PDF', 'PRINT');

-- CreateTable
CREATE TABLE "public"."UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultMode" "public"."AnalysisMode" NOT NULL DEFAULT 'INTERNAL_ONLY',
    "analysisProfile" "public"."AnalysisProfile" NOT NULL DEFAULT 'GEOPOLITICAL',
    "sourcePolicy" "public"."SourcePolicy" NOT NULL DEFAULT 'BALANCED',
    "autoSaveRuns" BOOLEAN NOT NULL DEFAULT true,
    "showCitations" BOOLEAN NOT NULL DEFAULT true,
    "preferredExport" "public"."ExportPreference" NOT NULL DEFAULT 'PDF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "public"."UserPreference"("userId");

-- AddForeignKey
ALTER TABLE "public"."UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
