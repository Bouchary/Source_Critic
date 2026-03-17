import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth-helpers";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const user = await getOptionalUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <h1 className="text-2xl font-semibold text-white">Connexion</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Connectez-vous à votre espace Source Critic.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}