"use client";

import { useEffect, useState, useTransition } from "react";
import type { RunCommentView } from "@/types/history";

export function RunComments({ runId }: { runId: string }) {
  const [comments, setComments] = useState<RunCommentView[]>([]);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const response = await fetch(`/api/history/${runId}/comments`);
      const data = await response.json();

      if (!cancelled) {
        if (response.ok) {
          setComments(data.comments || []);
        } else {
          setError(data?.error || "Chargement impossible.");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [runId]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Commentaires</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Utilisez ce bloc pour demander une relecture, signaler une réserve,
            valider un point ou laisser une note de travail sur ce run figé.
          </p>
        </div>

        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");

            const formData = new FormData(event.currentTarget);
            const body = String(formData.get("body") || "").trim();

            if (!body) return;

            const formElement = event.currentTarget;

            startTransition(async () => {
              const response = await fetch(`/api/history/${runId}/comments`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ body }),
              });

              const data = await response.json();

              if (!response.ok) {
                setError(data?.error || "Publication impossible.");
                return;
              }

              setComments((prev) => [...prev, data.comment]);
              formElement.reset();
            });
          }}
        >
          <textarea
            name="body"
            rows={4}
            placeholder="Ajouter un commentaire sur ce run..."
            className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 outline-none"
          />

          {error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
          >
            {pending ? "Publication..." : "Publier le commentaire"}
          </button>
        </form>

        <div className="grid gap-3">
          {comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/20 p-4 text-sm text-slate-300">
              Aucun commentaire pour le moment.
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-2xl border border-white/10 bg-slate-950/20 p-4"
              >
                <p className="text-sm font-medium text-white">{comment.authorName}</p>
                <p className="text-xs text-slate-400">{comment.authorEmail}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{comment.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}