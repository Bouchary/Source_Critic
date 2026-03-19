import Link from "next/link";
import { FolderKanban, Users } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { getUserWorkspaces } from "@/lib/workspaces";
import { WorkspaceForm } from "@/components/workspace-form";

export default async function WorkspacesPage() {
  const user = await requireUser();
  const workspaces = await getUserWorkspaces(user.id);

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
              <FolderKanban className="h-5 w-5 text-slate-200" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Espaces de travail
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Organisez les runs et préparez les workflows collaboratifs.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
            <h2 className="text-lg font-semibold text-white">Créer un espace</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Un espace permet de regrouper les travaux d’une même équipe ou d’un même dossier.
            </p>
            <div className="mt-6">
              <WorkspaceForm />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:p-6">
            <h2 className="text-lg font-semibold text-white">Mes espaces</h2>
            <div className="mt-4 grid gap-4">
              {workspaces.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/20 p-4 text-sm text-slate-300">
                  Aucun espace pour le moment.
                </div>
              ) : (
                workspaces.map((workspace) => (
                  <Link
                    key={workspace.id}
                    href={`/workspaces/${workspace.id}`}
                    className="block rounded-2xl border border-white/10 bg-slate-950/20 p-4 transition hover:bg-slate-950/35"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                        {workspace.role}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                        <Users className="h-3.5 w-3.5" />
                        {workspace.memberCount} membre(s)
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-white">
                      {workspace.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {workspace.description || "Aucune description."}
                    </p>
                    <p className="mt-3 text-xs text-sky-200">
                      Ouvrir l’espace
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}