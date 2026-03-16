"use client";

import { cn } from "@/lib/utils";

export interface ReportTabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface ReportTabsProps {
  tabs: ReportTabItem[];
  defaultTabId?: string;
}

import { useMemo, useState } from "react";

export function ReportTabs({ tabs, defaultTabId }: ReportTabsProps) {
  const firstId = useMemo(() => defaultTabId || tabs[0]?.id || "", [defaultTabId, tabs]);
  const [activeTab, setActiveTab] = useState(firstId);

  const current = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  if (!tabs.length || !current) return null;

  return (
    <div className="grid gap-4">
      <div
        data-no-print
        className="flex flex-wrap gap-2 rounded-3xl border border-white/10 bg-white/5 p-3"
      >
        {tabs.map((tab) => {
          const active = tab.id === current.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-2xl border px-4 py-2 text-sm transition",
                active
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/10 bg-slate-950/20 text-slate-300 hover:bg-white/5",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>{current.content}</div>
    </div>
  );
}