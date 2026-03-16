import { NextResponse } from "next/server";
import { clearHistoryInDb, getHistoryFromDb } from "@/lib/history-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getHistoryFromDb();
    return NextResponse.json(items);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue côté serveur.";

    return NextResponse.json(
      { error: "Impossible de lire l’historique. Détail : " + message },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await clearHistoryInDb();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue côté serveur.";

    return NextResponse.json(
      { error: "Impossible de vider l’historique. Détail : " + message },
      { status: 500 },
    );
  }
}