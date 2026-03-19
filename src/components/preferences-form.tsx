"use client";

import { useState, useTransition } from "react";
import type { UserPreferenceView } from "@/lib/user-preferences";

export function PreferencesForm({
  initialPreference,
}: {
  initialPreference: UserPreferenceView;
}) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();

  const [defaultMode, setDefaultMode] = useState(initialPreference.defaultMode);
  const [analysisProfile, setAnalysisProfile] = useState(
    initialPreference.analysisProfile,
  );
  const [sourcePolicy, setSourcePolicy] = useState(initialPreference.sourcePolicy);
  const [autoSaveRuns, setAutoSaveRuns] = useState(initialPreference.autoSaveRuns);
  const [showCitations, setShowCitations] = useState(
    initialPreference.showCitations,
  );
  const [preferredExport, setPreferredExport] = useState(
    initialPreference.preferredExport,
  );

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        startTransition(async () => {
          const response = await fetch("/api/preferences", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              defaultMode,
              analysisProfile,
              sourcePolicy,
              autoSaveRuns,
              showCitations,
              preferredExport,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            setError(data?.error || "Enregistrement impossible.");
            return;
          }

          setSuccess("Préférences enregistrées.");
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-sm text-slate-200">Mode par défaut</span>
          <select
            value={defaultMode}
            onChange={(e) =>
              setDefaultMode(
                e.target.value as UserPreferenceView["defaultMode"],
              )
            }
            className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 outline-none"
          >
            <option value="internal_only">Lecture interne</option>
            <option value="external_research">Recherche externe encadrée</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-200">Profil d’analyse</span>
          <select
            value={analysisProfile}
            onChange={(e) =>
              setAnalysisProfile(
                e.target.value as UserPreferenceView["analysisProfile"],
              )
            }
            className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 outline-none"
          >
            <option value="academic">Académique</option>
            <option value="geopolitical">Géopolitique</option>
            <option value="media">Médiatique</option>
            <option value="institutional">Institutionnel</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-200">Politique de sources</span>
          <select
            value={sourcePolicy}
            onChange={(e) =>
              setSourcePolicy(
                e.target.value as UserPreferenceView["sourcePolicy"],
              )
            }
            className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 outline-none"
          >
            <option value="strict_reliable">Strict fiable</option>
            <option value="balanced">Équilibré</option>
            <option value="broad">Large</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-200">Export préféré</span>
          <select
            value={preferredExport}
            onChange={(e) =>
              setPreferredExport(
                e.target.value as UserPreferenceView["preferredExport"],
              )
            }
            className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 outline-none"
          >
            <option value="pdf">PDF</option>
            <option value="print">Impression</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3">
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3">
          <input
            type="checkbox"
            checked={autoSaveRuns}
            onChange={(e) => setAutoSaveRuns(e.target.checked)}
          />
          <span className="text-sm text-slate-200">
            Sauvegarder automatiquement les runs
          </span>
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3">
          <input
            type="checkbox"
            checked={showCitations}
            onChange={(e) => setShowCitations(e.target.checked)}
          />
          <span className="text-sm text-slate-200">
            Afficher les citations et références
          </span>
        </label>
      </div>

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

      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? "Enregistrement..." : "Enregistrer les préférences"}
        </button>
      </div>
    </form>
  );
}