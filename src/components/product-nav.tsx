"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gauge,
  Home,
  FileSearch2,
  FolderKanban,
  GitCompareArrows,
  History,
  Settings,
  UserCircle2,
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

      <Link href="/dashboard" className={itemClass(pathname === "/dashboard")}>
        <Gauge className="h-4 w-4" />
        Dashboard
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

      <Link href="/profile" className={itemClass(pathname === "/profile")}>
        <UserCircle2 className="h-4 w-4" />
        Profil
      </Link>

      <Link href="/settings" className={itemClass(pathname === "/settings")}>
        <Settings className="h-4 w-4" />
        Paramètres
      </Link>
    </nav>
  );
}