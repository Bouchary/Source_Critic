import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { addRunComment, getRunComments } from "@/lib/run-collaboration";

const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { id } = await context.params;
  const comments = await getRunComments(id, userId);

  if (!comments) {
    return NextResponse.json({ error: "Run introuvable." }, { status: 404 });
  }

  return NextResponse.json({ comments });
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const parsed = createCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Entrée invalide." },
        { status: 400 },
      );
    }

    const comment = await addRunComment({
      historyEntryId: id,
      userId,
      body: parsed.data.body,
    });

    if (!comment) {
      return NextResponse.json({ error: "Run introuvable." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, comment });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue côté serveur.";

    return NextResponse.json(
      { error: "Commentaire impossible. Détail : " + message },
      { status: 500 },
    );
  }
}