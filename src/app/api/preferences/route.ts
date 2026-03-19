import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  getOrCreateUserPreference,
  updateUserPreference,
} from "@/lib/user-preferences";

const preferenceSchema = z.object({
  defaultMode: z.enum(["internal_only", "external_research"]),
  analysisProfile: z.enum(["academic", "geopolitical", "media", "institutional"]),
  sourcePolicy: z.enum(["strict_reliable", "balanced", "broad"]),
  autoSaveRuns: z.boolean(),
  showCitations: z.boolean(),
  preferredExport: z.enum(["pdf", "print"]),
});

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const preference = await getOrCreateUserPreference(userId);
  return NextResponse.json({ preference });
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = preferenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Entrée invalide." },
        { status: 400 },
      );
    }

    const preference = await updateUserPreference(userId, parsed.data);
    return NextResponse.json({ ok: true, preference });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue côté serveur.";

    return NextResponse.json(
      { error: "Enregistrement impossible. Détail : " + message },
      { status: 500 },
    );
  }
}