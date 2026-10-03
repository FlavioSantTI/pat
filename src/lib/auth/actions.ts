"use server";

import { createClient } from "@/lib/supabase/server";
import { homeForRole, getProfile } from "./profile";
import { loginSchema } from "@/lib/validations/schemas";
import { redirect } from "next/navigation";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Dados de acesso inválidos.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error:
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : `Erro de login: ${error.message}`,
    };
  }

  const profile = await getProfile();
  if (!profile) {
    redirect("/hoje");
  }

  redirect(homeForRole(profile.role));
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
