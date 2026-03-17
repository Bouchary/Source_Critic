import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth-helpers";
import { SignupForm } from "@/components/signup-form";

export default async function SignupPage() {
  const user = await getOptionalUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <h1 className="text-2xl font-semibold text-white">Créer un compte</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Créez votre espace personnel pour rattacher vos runs à votre compte.
          </p>
          <div className="mt-6">
            <SignupForm />
          </div>
        </section>
      </div>
    </main>
  );
}