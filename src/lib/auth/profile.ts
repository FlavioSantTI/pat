import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types";
import { redirect } from "next/navigation";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: row } = await supabase
    .from("users")
    .select(`
      id,
      role,
      organization_id,
      email,
      patients (id, display_name),
      professionals (id, display_name)
    `)
    .eq("id", user.id)
    .maybeSingle();

  if (!row) {
    return {
      userId: user.id,
      role: "patient",
      organizationId: null,
      email: user.email ?? null,
      displayName: user.email ?? "Usuário",
    };
  }

  let displayName = row.email ?? user.email ?? "Usuário";
  let patientId: string | undefined;
  let professionalId: string | undefined;

  const patientRecord = Array.isArray(row.patients) ? row.patients[0] : row.patients;
  const proRecord = Array.isArray(row.professionals) ? row.professionals[0] : row.professionals;

  if (row.role === "patient" && patientRecord) {
    displayName = patientRecord.display_name ?? displayName;
    patientId = patientRecord.id;
  }

  if (row.role === "professional" && proRecord) {
    displayName = proRecord.display_name ?? displayName;
    professionalId = proRecord.id;
  }

  if (row.role === "admin") {
    displayName = "Administração";
  }


  return {
    userId: row.id,
    role: row.role as UserRole,
    organizationId: row.organization_id,
    email: row.email,
    displayName,
    patientId,
    professionalId,
  };
}

export async function requireProfile() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireRole(role: UserRole | UserRole[]) {
  const profile = await requireProfile();
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(profile.role)) {
    redirect(homeForRole(profile.role));
  }
  return profile;
}

export function homeForRole(role: UserRole) {
  if (role === "admin") return "/admin";
  if (role === "professional") return "/dashboard";
  return "/hoje";
}
