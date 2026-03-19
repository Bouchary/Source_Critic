"use client";

import { useState, useTransition } from "react";

export function RunStatusControl({
  runId,
  initialStatus,
}: {
  runId: string;
  initialStatus: "draft" | "in_review" | "validated";
}) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();

  return (
    <label className="grid gap-2">
      <span className="text-sm text-slate-200">Statut du run</span>
      <select
        value={status}
        disabled={pending}
        onChange={(e) => {
          const nextStatus = e.target.value as "draft" | "in_review" | "validated";
          setStatus(nextStatus);

          startTransition(async () => {
            await fetch(`/api/history/${runId}/status`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status: nextStatus }),
            });
          });
        }}
        className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 outline-none"
      >
        <option value="draft">Brouillon</option>
        <option value="in_review">À relire</option>
        <option value="validated">Validé</option>
      </select>
    </label>
  );
}