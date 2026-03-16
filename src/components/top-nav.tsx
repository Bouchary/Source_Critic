"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, GitCompareArrows, History } from "lucide-react";

export function TopNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Analyser", icon: FileText },
    { href: "/compare", label: "Comparer", icon: GitCompareArrows },
    { href: "/history", label: "Historique", icon: History },
  ];

  return (
    <nav className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-xl backdrop-blur">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm transition",
                active
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/10 bg-slate-950/20 text-slate-300 hover:bg-white/5",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}