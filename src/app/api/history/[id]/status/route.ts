import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { updateRunStatus } from "@/lib/run-collaboration";

const statusSchema = z.object({
  status: z.enum(["draft", "in_review", "validated"]),
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
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Entrée invalide." },
        { status: 400 },
      );
    }

    const status = await updateRunStatus({
      historyEntryId: id,
      userId,
      status: parsed.data.status,
    });

    if (!status) {
      return NextResponse.json({ error: "Run introuvable." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue côté serveur.";

    return NextResponse.json(
      { error: "Mise à jour impossible. Détail : " + message },
      { status: 500 },
    );
  }
}