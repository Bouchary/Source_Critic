import { prisma } from "@/lib/db";
import type { HistoryEntry } from "@/types/history";
import { getHistoryFromDb } from "@/lib/history-db";
import { userCanAccessWorkspace } from "@/lib/workspaces";

export interface WorkspaceDetailView {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  runs: HistoryEntry[];
}

export async function getWorkspaceDetailForUser(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceDetailView | null> {
  const canAccess = await userCanAccessWorkspace(userId, workspaceId);

  if (!canAccess) {
    return null;
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    return null;
  }

  const allRuns = await getHistoryFromDb(userId);
  const runs = allRuns.filter((entry) => entry.workspaceId === workspaceId);

  return {
    id: workspace.id,
    name: workspace.name,
    description: workspace.description || "",
    createdAt: workspace.createdAt.toISOString(),
    runs,
  };
}