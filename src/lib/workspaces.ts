import { WorkspaceRole } from "@prisma/client";
import { prisma } from "@/lib/db";

export interface WorkspaceView {
  id: string;
  name: string;
  description: string;
  role: "owner" | "editor" | "viewer";
  memberCount: number;
  createdAt: string;
}

function roleToView(role: WorkspaceRole): WorkspaceView["role"] {
  if (role === WorkspaceRole.OWNER) return "owner";
  if (role === WorkspaceRole.EDITOR) return "editor";
  return "viewer";
}

export async function getUserWorkspaces(userId: string): Promise<WorkspaceView[]> {
  const links = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return links.map((link) => ({
    id: link.workspace.id,
    name: link.workspace.name,
    description: link.workspace.description || "",
    role: roleToView(link.role),
    memberCount: link.workspace.members.length,
    createdAt: link.workspace.createdAt.toISOString(),
  }));
}

export async function createWorkspaceForUser(params: {
  userId: string;
  name: string;
  description?: string;
}) {
  return prisma.workspace.create({
    data: {
      name: params.name,
      description: params.description || "",
      members: {
        create: {
          userId: params.userId,
          role: WorkspaceRole.OWNER,
        },
      },
    },
  });
}

export async function userCanAccessWorkspace(userId: string, workspaceId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  return !!membership;
}