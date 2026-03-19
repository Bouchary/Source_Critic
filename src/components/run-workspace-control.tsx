"use client";

import { useEffect, useState, useTransition } from "react";

interface WorkspaceOption {
  id: string;
  name: string;
}

export function RunWorkspaceControl({
  runId,
  initialWorkspaceId,
}: {
  runId: string;
  initialWorkspaceId?: string | null;
}) {
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [value, setValue] = useState(initialWorkspaceId ?? "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const response = await fetch("/api/workspaces");
      const data = await response.json();

      if (cancelled) return;

      if (!response.ok) {
        setError(data?.error || "Chargement des workspaces impossible.");
        return;
      }

      setWorkspaces(
        (data.workspaces || []).map((item: { id: string; name: string }) => ({
          id: item.id,
          name: item.name,
        })),
      );
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <label className="grid gap-2">
      <span className="text-sm text-slate-200">Workspace</span>
      <select
        value={value}
        disabled={pending}
        onChange={(e) => {
          const nextValue = e.target.value;
          setValue(nextValue);
          setError("");

          startTransition(async () => {
            const response = await fetch(`/api/history/${runId}/workspace`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                workspaceId: nextValue ? nextValue : null,
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              setError(data?.error || "Affectation impossible.");
            }
          });
        }}
        className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 outline-none"
      >
        <option value="">Aucun workspace</option>
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name}
          </option>
        ))}
      </select>

      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
    </label>
  );
}