"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await signOut({ callbackUrl: "/" });
        });
      }}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" />
      {pending ? "Déconnexion..." : "Déconnexion"}
    </button>
  );
}