"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/profile";
import { activitySchema, assignSchema, noteSchema } from "@/lib/validations/schemas";
import { revalidatePath } from "next/cache";

export async function createProgramAction(formData: FormData) {
  const profile = await requireRole("professional");
  const supabase = await createClient();

  const name = formData.get("name")?.toString()?.trim();
  const description = formData.get("description")?.toString()?.trim() || null;
  const startDate = formData.get("start_date")?.toString() || null;
  const endDate = formData.get("end_date")?.toString() || null;

  if (!name) return { error: "O nome do programa é obrigatório." };

  const { error } = await supabase.from("programs").insert({
    organization_id: profile.organizationId!,
    professional_id: profile.professionalId!,
    name,
    description,
    start_date: startDate,
    end_date: endDate,
  });

  if (error) return { error: error.message };

  revalidatePath("/programas");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createProgramAreaAction(programId: string, name: string) {
  await requireRole("professional");
  const supabase = await createClient();

  if (!name.trim()) return { error: "Nome da área obrigatório." };

  const { error } = await supabase.from("program_areas").insert({
    program_id: programId,
    name: name.trim(),
    icon: "circle",
  });

  if (error) return { error: error.message };

  revalidatePath("/programas");
  return { success: true };
}

export async function createActivityAction(formData: FormData) {
  await requireRole("professional");
  const supabase = await createClient();

  const raw = {
    title: formData.get("title")?.toString()?.trim() ?? "",
    objective: formData.get("objective")?.toString()?.trim() || undefined,
    instructions: formData.get("instructions")?.toString()?.trim() || undefined,
    description: formData.get("description")?.toString()?.trim() || undefined,
    duration_suggested_minutes: formData.get("duration_suggested_minutes")?.toString() || undefined,
    program_id: formData.get("program_id")?.toString() ?? "",
    program_area_id: formData.get("program_area_id")?.toString() || undefined,
  };

  const parsed = activitySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await supabase.from("activities").insert({
    program_id: parsed.data.program_id,
    program_area_id: parsed.data.program_area_id ?? null,
    title: parsed.data.title,
    objective: parsed.data.objective ?? null,
    instructions: parsed.data.instructions ?? null,
    description: parsed.data.description ?? null,
    duration_suggested_minutes: parsed.data.duration_suggested_minutes ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/programas");
  return { success: true };
}

export async function assignActivityAction(formData: FormData) {
  const profile = await requireRole("professional");
  const supabase = await createClient();

  const raw = {
    activity_id: formData.get("activity_id")?.toString() ?? "",
    patient_id: formData.get("patient_id")?.toString() ?? "",
    scheduled_date: formData.get("scheduled_date")?.toString() ?? "",
    period: formData.get("period")?.toString() ?? "morning",
    scheduled_at: formData.get("scheduled_at")?.toString() || null,
  };

  const parsed = assignSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados de atribuição inválidos." };
  }

  // Ensure professional is linked to patient
  const { data: link } = await supabase
    .from("professional_patients")
    .select("status")
    .eq("professional_id", profile.professionalId!)
    .eq("patient_id", parsed.data.patient_id)
    .single();

  if (!link) {
    return { error: "Paciente não está vinculado a você." };
  }

  const { error } = await supabase.from("activity_assignments").insert({
    activity_id: parsed.data.activity_id,
    patient_id: parsed.data.patient_id,
    professional_id: profile.professionalId!,
    scheduled_date: parsed.data.scheduled_date,
    period: parsed.data.period,
    scheduled_at: parsed.data.scheduled_at,
    status: "scheduled",
  });

  if (error) return { error: error.message };

  revalidatePath(`/pacientes/${parsed.data.patient_id}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function saveProfessionalNoteAction(
  patientId: string,
  content: string,
) {
  const profile = await requireRole("professional");
  const supabase = await createClient();

  const parsed = noteSchema.safeParse({ content });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nota inválida." };
  }

  const { error } = await supabase.from("professional_notes").insert({
    patient_id: patientId,
    professional_id: profile.professionalId!,
    content: parsed.data.content,
  });

  if (error) return { error: error.message };

  revalidatePath(`/pacientes/${patientId}`);
  return { success: true };
}

export async function savePatientMetricAction(formData: FormData) {
  await requireRole("professional");
  const supabase = await createClient();

  const programId = formData.get("program_id")?.toString();
  const patientId = formData.get("patient_id")?.toString();
  const areaName = formData.get("area_name")?.toString()?.trim();
  const observableIndicator = formData.get("observable_indicator")?.toString()?.trim();
  const flexibleDirection = formData.get("flexible_direction")?.toString()?.trim() || null;
  const baselineValue = formData.get("baseline_value")?.toString()?.trim() || null;
  const currentValue = formData.get("current_value")?.toString()?.trim() || null;
  const nextSmallStep = formData.get("next_small_step")?.toString()?.trim() || null;

  if (!programId || !patientId || !areaName || !observableIndicator) {
    return { error: "Campos obrigatórios não preenchidos." };
  }

  const { error } = await supabase.from("progress_metrics").insert({
    program_id: programId,
    patient_id: patientId,
    area_name: areaName,
    observable_indicator: observableIndicator,
    flexible_direction: flexibleDirection,
    baseline_value: baselineValue,
    current_value: currentValue,
    next_small_step: nextSmallStep,
  });

  if (error) return { error: error.message };

  revalidatePath(`/pacientes/${patientId}`);
  return { success: true };
}
