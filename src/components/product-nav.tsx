"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileSearch2,
  FolderKanban,
  GitCompareArrows,
  History,
  Home,
  LayoutPanelTop,
  ScrollText,
  Target,
} from "lucide-react";

function itemClass(active: boolean) {
  return active
    ? "inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white"
    : "inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10";
}

export function ProductNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-3" data-no-print>
      <Link href="/" className={itemClass(pathname === "/")}>
        <Home className="h-4 w-4" />
        Accueil
      </Link>

      <Link href="/product" className={itemClass(pathname === "/product")}>
        <LayoutPanelTop className="h-4 w-4" />
        Produit
      </Link>

      <Link href="/method" className={itemClass(pathname === "/method")}>
        <ScrollText className="h-4 w-4" />
        Méthode
      </Link>

      <Link href="/use-cases" className={itemClass(pathname === "/use-cases")}>
        <Target className="h-4 w-4" />
        Cas d’usage
      </Link>

      <Link href="/analyze" className={itemClass(pathname === "/analyze")}>
        <FileSearch2 className="h-4 w-4" />
        Analyser
      </Link>

      <Link href="/compare" className={itemClass(pathname === "/compare")}>
        <GitCompareArrows className="h-4 w-4" />
        Comparer
      </Link>

      <Link href="/history" className={itemClass(pathname === "/history")}>
        <History className="h-4 w-4" />
        Historique
      </Link>

      <Link href="/workspaces" className={itemClass(pathname === "/workspaces")}>
        <FolderKanban className="h-4 w-4" />
        Espaces
      </Link>
    </nav>
  );
}