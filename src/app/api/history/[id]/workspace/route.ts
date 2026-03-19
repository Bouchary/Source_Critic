import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { assignRunToWorkspace } from "@/lib/run-collaboration";

const workspaceSchema = z.object({
  workspaceId: z.string().trim().min(1).nullable(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const parsed = workspaceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Entrée invalide." },
        { status: 400 },
      );
    }

    const assignment = await assignRunToWorkspace({
      historyEntryId: id,
      userId,
      workspaceId: parsed.data.workspaceId,
    });

    if (!assignment) {
      return NextResponse.json({ error: "Run introuvable." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      workspaceId: assignment.workspaceId,
      workspaceName: assignment.workspaceName,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue côté serveur.";

    return NextResponse.json(
      { error: "Affectation impossible. Détail : " + message },
      { status: 500 },
    );
  }
}