"use client";

import { Printer } from "lucide-react";

export function ExportReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      data-no-print
      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
    >
      <Printer className="h-4 w-4" />
      Exporter en PDF
    </button>
  );
}