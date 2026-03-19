import {
  AnalysisMode,
  AnalysisProfile,
  ExportPreference,
  SourcePolicy,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export interface UserPreferenceView {
  defaultMode: "internal_only" | "external_research";
  analysisProfile: "academic" | "geopolitical" | "media" | "institutional";
  sourcePolicy: "strict_reliable" | "balanced" | "broad";
  autoSaveRuns: boolean;
  showCitations: boolean;
  preferredExport: "pdf" | "print";
}

const DEFAULT_PREFERENCE_VIEW: UserPreferenceView = {
  defaultMode: "internal_only",
  analysisProfile: "geopolitical",
  sourcePolicy: "balanced",
  autoSaveRuns: true,
  showCitations: true,
  preferredExport: "pdf",
};

function prismaModeToView(value: AnalysisMode): UserPreferenceView["defaultMode"] {
  return value === AnalysisMode.EXTERNAL_RESEARCH
    ? "external_research"
    : "internal_only";
}

function viewModeToPrisma(value: UserPreferenceView["defaultMode"]): AnalysisMode {
  return value === "external_research"
    ? AnalysisMode.EXTERNAL_RESEARCH
    : AnalysisMode.INTERNAL_ONLY;
}

function prismaProfileToView(
  value: AnalysisProfile,
): UserPreferenceView["analysisProfile"] {
  switch (value) {
    case AnalysisProfile.ACADEMIC:
      return "academic";
    case AnalysisProfile.MEDIA:
      return "media";
    case AnalysisProfile.INSTITUTIONAL:
      return "institutional";
    default:
      return "geopolitical";
  }
}

function viewProfileToPrisma(
  value: UserPreferenceView["analysisProfile"],
): AnalysisProfile {
  switch (value) {
    case "academic":
      return AnalysisProfile.ACADEMIC;
    case "media":
      return AnalysisProfile.MEDIA;
    case "institutional":
      return AnalysisProfile.INSTITUTIONAL;
    default:
      return AnalysisProfile.GEOPOLITICAL;
  }
}

function prismaSourcePolicyToView(
  value: SourcePolicy,
): UserPreferenceView["sourcePolicy"] {
  switch (value) {
    case SourcePolicy.STRICT_RELIABLE:
      return "strict_reliable";
    case SourcePolicy.BROAD:
      return "broad";
    default:
      return "balanced";
  }
}

function viewSourcePolicyToPrisma(
  value: UserPreferenceView["sourcePolicy"],
): SourcePolicy {
  switch (value) {
    case "strict_reliable":
      return SourcePolicy.STRICT_RELIABLE;
    case "broad":
      return SourcePolicy.BROAD;
    default:
      return SourcePolicy.BALANCED;
  }
}

function prismaExportToView(
  value: ExportPreference,
): UserPreferenceView["preferredExport"] {
  return value === ExportPreference.PRINT ? "print" : "pdf";
}

function viewExportToPrisma(
  value: UserPreferenceView["preferredExport"],
): ExportPreference {
  return value === "print" ? ExportPreference.PRINT : ExportPreference.PDF;
}

export async function getOrCreateUserPreference(
  userId: string,
): Promise<UserPreferenceView> {
  const preference = await prisma.userPreference.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
    },
  });

  return {
    defaultMode: prismaModeToView(preference.defaultMode),
    analysisProfile: prismaProfileToView(preference.analysisProfile),
    sourcePolicy: prismaSourcePolicyToView(preference.sourcePolicy),
    autoSaveRuns: preference.autoSaveRuns,
    showCitations: preference.showCitations,
    preferredExport: prismaExportToView(preference.preferredExport),
  };
}

export async function updateUserPreference(
  userId: string,
  input: UserPreferenceView,
): Promise<UserPreferenceView> {
  const updated = await prisma.userPreference.upsert({
    where: { userId },
    update: {
      defaultMode: viewModeToPrisma(input.defaultMode),
      analysisProfile: viewProfileToPrisma(input.analysisProfile),
      sourcePolicy: viewSourcePolicyToPrisma(input.sourcePolicy),
      autoSaveRuns: input.autoSaveRuns,
      showCitations: input.showCitations,
      preferredExport: viewExportToPrisma(input.preferredExport),
    },
    create: {
      userId,
      defaultMode: viewModeToPrisma(input.defaultMode),
      analysisProfile: viewProfileToPrisma(input.analysisProfile),
      sourcePolicy: viewSourcePolicyToPrisma(input.sourcePolicy),
      autoSaveRuns: input.autoSaveRuns,
      showCitations: input.showCitations,
      preferredExport: viewExportToPrisma(input.preferredExport),
    },
  });

  return {
    defaultMode: prismaModeToView(updated.defaultMode),
    analysisProfile: prismaProfileToView(updated.analysisProfile),
    sourcePolicy: prismaSourcePolicyToView(updated.sourcePolicy),
    autoSaveRuns: updated.autoSaveRuns,
    showCitations: updated.showCitations,
    preferredExport: prismaExportToView(updated.preferredExport),
  };
}

export function getDefaultPreferenceView(): UserPreferenceView {
  return DEFAULT_PREFERENCE_VIEW;
}


















