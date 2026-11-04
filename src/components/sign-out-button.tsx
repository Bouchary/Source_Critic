"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
      aria-label="Déconnexion"
      title="Déconnexion"
      data-no-print
    >
      <LogOut className="h-4 w-4" />
      Déconnexion
    </button>
  );
}