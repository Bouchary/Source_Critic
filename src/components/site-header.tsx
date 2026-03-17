import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ProductNav } from "@/components/product-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
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

          <div className="text-xs text-slate-400">
            Prototype avancé — UI produit
          </div>
        </div>

        <ProductNav />
      </div>
    </header>
  );
}