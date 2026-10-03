import { getProfile, homeForRole } from "@/lib/auth/profile";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Entrar — Lumina",
  description: "Acesse sua conta na plataforma Lumina.",
};

export default async function LoginPage() {
  const profile = await getProfile();

  if (profile) {
    redirect(homeForRole(profile.role));
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100">
      <LoginForm />
    </div>
  );
}
