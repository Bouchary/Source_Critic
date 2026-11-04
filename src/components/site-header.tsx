import Link from "next/link";
import {
  LogIn,
  LogOut,
  Settings,
  UserCircle2,
} from "lucide-react";
import { auth } from "@/auth";
import { ProductNav } from "@/components/product-nav";
import { SignOutButton } from "@/components/sign-out-button";

function iconButtonClass() {
  return "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10";
}

export async function SiteHeader() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/75 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" className="shrink-0">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
                <p className="text-sm font-semibold tracking-wide text-white">
                  Source Critic
                </p>
              </div>
            </Link>

            <div className="min-w-0">
              <p className="truncate text-sm text-slate-300">
                Analyse critique, comparaison structurée et travail rejouable
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3" data-no-print>
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className={iconButtonClass()}
                  aria-label="Profil"
                  title="Profil"
                >
                  <UserCircle2 className="h-5 w-5" />
                </Link>

                <Link
                  href="/settings"
                  className={iconButtonClass()}
                  aria-label="Paramètres"
                  title="Paramètres"
                >
                  <Settings className="h-5 w-5" />
                </Link>

                <SignOutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <LogIn className="h-4 w-4" />
                  Connexion
                </Link>

                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Créer un compte
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