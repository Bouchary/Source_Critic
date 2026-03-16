"use client";

import { cn } from "@/lib/utils";
import type { AnalysisMode } from "@/lib/schema";

interface ModeToggleProps {
  value: AnalysisMode;
  onChange: (value: AnalysisMode) => void;
}

export function ModeToggle({ value, onChange }: ModeToggleProps) {
  const items: { value: AnalysisMode; label: string; hint: string }[] = [
    {
      value: "internal_only",
      label: "Lecture interne",
      hint: "Aucune source externe. Analyse limitée au corpus fourni.",
    },
    {
      value: "external_research",
      label: "Recherche externe encadrée",
      hint: "Recherche web encadrée, recoupement et citations quand disponibles.",
    },
  ];

  return (
    <div className="grid gap-3">
      {items.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "rounded-2xl border p-4 text-left transition",
              active
                ? "border-sky-400/40 bg-sky-400/10"
                : "border-white/10 bg-slate-950/20 hover:bg-white/5",
            )}
          >
            <div className="text-sm font-medium text-white">{item.label}</div>
            <div className="mt-1 text-sm text-slate-300">{item.hint}</div>
          </button>
        );
      })}
    </div>
  );
}