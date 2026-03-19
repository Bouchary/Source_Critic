import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createWorkspaceForUser, getUserWorkspaces } from "@/lib/workspaces";

const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(300).optional().default(""),
});

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const workspaces = await getUserWorkspaces(userId);
  return NextResponse.json({ workspaces });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createWorkspaceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Entrée invalide." },
        { status: 400 },
      );
    }

    const workspace = await createWorkspaceForUser({
      userId,
      name: parsed.data.name,
      description: parsed.data.description,
    });

    return NextResponse.json({
      ok: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description || "",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue côté serveur.";

    return NextResponse.json(
      { error: "Création impossible. Détail : " + message },
      { status: 500 },
    );
  }
}