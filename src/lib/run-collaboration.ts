import { RunStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { RunCommentView } from "@/types/history";
import { userCanAccessWorkspace } from "@/lib/workspaces";

function statusToView(status: RunStatus): "draft" | "in_review" | "validated" {
  if (status === RunStatus.IN_REVIEW) return "in_review";
  if (status === RunStatus.VALIDATED) return "validated";
  return "draft";
}

function viewToStatus(value: "draft" | "in_review" | "validated"): RunStatus {
  if (value === "in_review") return RunStatus.IN_REVIEW;
  if (value === "validated") return RunStatus.VALIDATED;
  return RunStatus.DRAFT;
}

export async function getRunComments(
  historyEntryId: string,
  userId: string,
): Promise<RunCommentView[] | null> {
  const entry = await prisma.historyEntry.findFirst({
    where: {
      id: historyEntryId,
      userId,
    },
  });

  if (!entry) return null;

  const comments = await prisma.runComment.findMany({
    where: { historyEntryId },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return comments.map((comment) => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    authorName: comment.user.name || "Utilisateur",
    authorEmail: comment.user.email || "",
  }));
}

export async function addRunComment(params: {
  historyEntryId: string;
  userId: string;
  body: string;
}) {
  const entry = await prisma.historyEntry.findFirst({
    where: {
      id: params.historyEntryId,
      userId: params.userId,
    },
  });

  if (!entry) {
    return null;
  }

  const comment = await prisma.runComment.create({
    data: {
      historyEntryId: params.historyEntryId,
      userId: params.userId,
      body: params.body,
    },
    include: {
      user: true,
    },
  });

  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    authorName: comment.user.name || "Utilisateur",
    authorEmail: comment.user.email || "",
  } satisfies RunCommentView;
}

export async function updateRunStatus(params: {
  historyEntryId: string;
  userId: string;
  status: "draft" | "in_review" | "validated";
}) {
  const entry = await prisma.historyEntry.findFirst({
    where: {
      id: params.historyEntryId,
      userId: params.userId,
    },
  });

  if (!entry) {
    return null;
  }

  const updated = await prisma.historyEntry.update({
    where: { id: params.historyEntryId },
    data: {
      status: viewToStatus(params.status),
    },
  });

  return statusToView(updated.status);
}

export async function assignRunToWorkspace(params: {
  historyEntryId: string;
  userId: string;
  workspaceId: string | null;
}) {
  const entry = await prisma.historyEntry.findFirst({
    where: {
      id: params.historyEntryId,
      userId: params.userId,
    },
  });

  if (!entry) {
    return null;
  }

  if (params.workspaceId) {
    const canAccessWorkspace = await userCanAccessWorkspace(
      params.userId,
      params.workspaceId,
    );

    if (!canAccessWorkspace) {
      throw new Error("Workspace inaccessible pour cet utilisateur.");
    }
  }

  const updated = await prisma.historyEntry.update({
    where: { id: params.historyEntryId },
    data: {
      workspaceId: params.workspaceId,
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    workspaceId: updated.workspaceId,
    workspaceName: updated.workspace?.name ?? null,
  };
}