"use client";

import { useState, useTransition } from "react";

export function WorkspaceForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        const formData = new FormData(event.currentTarget);
        const name = String(formData.get("name") || "").trim();
        const description = String(formData.get("description") || "").trim();

        startTransition(async () => {
          const response = await fetch("/api/workspaces", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, description }),
          });

          const data = await response.json();

          if (!response.ok) {
            setError(data?.error || "Création impossible.");
            return;
          }

          setSuccess("Espace créé.");
          window.location.reload();
        });
      }}
    >
      <label className="grid gap-2">
        <span className="text-sm text-slate-200">Nom de l’espace</span>
        <input
          name="name"
          type="text"
          required
          className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 outline-none"
          placeholder="Ex. Veille géopolitique"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm text-slate-200">Description</span>
        <textarea
          name="description"
          rows={3}
          className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 outline-none"
          placeholder="Description courte de l’espace"
        />
      </label>

      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Création..." : "Créer l’espace"}
      </button>
    </form>
  );
}