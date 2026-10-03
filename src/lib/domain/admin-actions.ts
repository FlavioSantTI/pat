"use server";

import { requireRole } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createOrganizationAction(name: string) {
  const profile = await requireRole("admin");
  const cleanName = name.trim();
  if (!cleanName) {
    return { error: "Nome da organização é obrigatório." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("organizations").insert({
    name: cleanName,
  });

  if (error) {
    return { error: error.message };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    actor_user_id: profile.userId,
    action: "create_organization",
    resource_type: "organization",
    metadata: { name: cleanName },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function updateTicketStatusAction(
  ticketId: string,
  newStatus: "open" | "in_progress" | "resolved" | "closed",
) {
  const profile = await requireRole("admin");
  const supabase = await createClient();

  const { error } = await supabase
    .from("support_tickets")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) {
    return { error: error.message };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    actor_user_id: profile.userId,
    action: "update_support_ticket",
    resource_type: "support_ticket",
    resource_id: ticketId,
    metadata: { new_status: newStatus },
  });

  revalidatePath("/admin/suporte");
  revalidatePath("/admin");
  return { success: true };
}

export async function createSupportTicketAction(subject: string) {
  const profile = await requireRole("admin");
  const cleanSubject = subject.trim();
  if (!cleanSubject) {
    return { error: "Assunto do chamado é obrigatório." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("support_tickets").insert({
    subject: cleanSubject,
    created_by: profile.userId,
    status: "open",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/suporte");
  revalidatePath("/admin");
  return { success: true };
}

export async function togglePlanStatusAction(planId: string, active: boolean) {
  const profile = await requireRole("admin");
  const supabase = await createClient();

  const { error } = await supabase
    .from("plans")
    .update({ active })
    .eq("id", planId);

  if (error) {
    return { error: error.message };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    actor_user_id: profile.userId,
    action: "toggle_plan_status",
    resource_type: "plan",
    resource_id: planId,
    metadata: { active },
  });

  revalidatePath("/admin/planos");
  return { success: true };
}
