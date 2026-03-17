import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ProductNav } from "@/components/product-nav";
import { getOptionalUser } from "@/lib/auth-helpers";
import { SignOutButton } from "@/components/sign-out-button";

export async function SiteHeader() {
  const user = await getOptionalUser();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <ShieldCheck className="h-5 w-5 text-slate-100" />
            </div>

            <div>
              <p className="text-lg font-semibold tracking-tight text-white">
                Source Critic
              </p>
              <p className="text-xs text-slate-400">
                Analyse critique, comparaison, traçabilité
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="text-right">
                  <p className="text-sm text-slate-200">
                    {user.name || "Utilisateur"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {user.email || "Session active"}
                  </p>
                </div>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-2xl border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="rounded-2xl border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>

        <ProductNav />
      </div>
    </header>
  );
}