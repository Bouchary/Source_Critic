"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "");

        startTransition(async () => {
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (result?.error) {
            setError("Identifiants invalides.");
            return;
          }

          window.location.href = "/dashboard";
        });
      }}
    >
      <label className="grid gap-2">
        <span className="text-sm text-slate-200">Email</span>
        <input
          name="email"
          type="email"
          required
          className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500"
          placeholder="vous@exemple.fr"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm text-slate-200">Mot de passe</span>
        <input
          name="password"
          type="password"
          required
          className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500"
          placeholder="Votre mot de passe"
        />
      </label>

      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-2xl border border-slate-300/15 bg-slate-100 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-white disabled:opacity-60"
      >
        {pending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}