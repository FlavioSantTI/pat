"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/profile";
import { assertTransition } from "./assignment-status";
import { assessmentSchema, weeklyReviewSchema, areaSchema } from "@/lib/validations/schemas";
import { revalidatePath } from "next/cache";

export async function startAssignmentAction(assignmentId: string) {
  const profile = await requireRole("patient");
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("activity_assignments")
    .select("status, patient_id")
    .eq("id", assignmentId)
    .single();

  if (!current || current.patient_id !== profile.patientId) {
    throw new Error("Atribuição não encontrada ou não pertence ao paciente.");
  }

  assertTransition(current.status, "started");

  const now = new Date().toISOString();

  const { error: assignError } = await supabase
    .from("activity_assignments")
    .update({
      status: "started",
      started_at: now,
    })
    .eq("id", assignmentId);

  if (assignError) throw assignError;

  const { error: sessionError } = await supabase
    .from("activity_sessions")
    .insert({
      assignment_id: assignmentId,
      started_at: now,
    });

  if (sessionError) throw sessionError;

  revalidatePath("/hoje");
  revalidatePath(`/atividade/${assignmentId}`);
  return { success: true };
}

export async function skipAssignmentAction(assignmentId: string) {
  const profile = await requireRole("patient");
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("activity_assignments")
    .select("status, patient_id")
    .eq("id", assignmentId)
    .single();

  if (!current || current.patient_id !== profile.patientId) {
    throw new Error("Atribuição não encontrada.");
  }

  assertTransition(current.status, "skipped");

  const { error } = await supabase
    .from("activity_assignments")
    .update({ status: "skipped" })
    .eq("id", assignmentId);

  if (error) throw error;

  revalidatePath("/hoje");
  revalidatePath(`/atividade/${assignmentId}`);
  return { success: true };
}

export type CompleteAssessmentPayload = {
  assignmentId: string;
  domainScore: number;
  pleasureScore: number;
  anxietyScore: number;
  notes?: string;
  gain?: string;
  focusTimerEnabled?: boolean;
  focusTimerMinutes?: number;
  elapsedSeconds?: number;
};

export async function completeAssignmentAndAssessAction(
  payload: CompleteAssessmentPayload,
) {
  const profile = await requireRole("patient");
  const supabase = await createClient();

  const validated = assessmentSchema.safeParse({
    domain_score: payload.domainScore,
    pleasure_score: payload.pleasureScore,
    anxiety_score: payload.anxietyScore,
    notes: payload.notes,
    gain: payload.gain,
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { data: current } = await supabase
    .from("activity_assignments")
    .select("status, patient_id")
    .eq("id", payload.assignmentId)
    .single();

  if (!current || current.patient_id !== profile.patientId) {
    return { error: "Atividade não autorizada." };
  }

  // Find or create session
  const now = new Date().toISOString();
  let sessionId: string | null = null;

  const { data: latestSession } = await supabase
    .from("activity_sessions")
    .select("id")
    .eq("assignment_id", payload.assignmentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestSession) {
    sessionId = latestSession.id;
    await supabase
      .from("activity_sessions")
      .update({
        finished_at: now,
        elapsed_seconds: payload.elapsedSeconds ?? 0,
        focus_timer_enabled: Boolean(payload.focusTimerEnabled),
        focus_timer_minutes: payload.focusTimerMinutes ?? null,
        notes: payload.notes ?? null,
      })
      .eq("id", sessionId);
  } else {
    const { data: newSession, error: sErr } = await supabase
      .from("activity_sessions")
      .insert({
        assignment_id: payload.assignmentId,
        started_at: now,
        finished_at: now,
        elapsed_seconds: payload.elapsedSeconds ?? 0,
        focus_timer_enabled: Boolean(payload.focusTimerEnabled),
        focus_timer_minutes: payload.focusTimerMinutes ?? null,
        notes: payload.notes ?? null,
      })
      .select("id")
      .single();
    if (sErr) return { error: sErr.message };
    sessionId = newSession.id;
  }

  // Update assignment status
  await supabase
    .from("activity_assignments")
    .update({
      status: "completed",
      completed_at: now,
    })
    .eq("id", payload.assignmentId);

  // Insert assessment (D/P/A)
  const { error: assessErr } = await supabase
    .from("activity_assessments")
    .insert({
      session_id: sessionId,
      domain_score: validated.data.domain_score,
      pleasure_score: validated.data.pleasure_score,
      anxiety_score: validated.data.anxiety_score,
    });

  if (assessErr) return { error: assessErr.message };

  // If gain was entered, save it
  if (validated.data.gain && validated.data.gain.trim().length > 0) {
    await supabase.from("gains").insert({
      patient_id: profile.patientId!,
      assignment_id: payload.assignmentId,
      description: validated.data.gain.trim(),
    });
  }

  revalidatePath("/hoje");
  revalidatePath("/agenda");
  revalidatePath("/progresso");
  revalidatePath(`/atividade/${payload.assignmentId}`);

  return { success: true };
}

export async function createGainAction(description: string) {
  const profile = await requireRole("patient");
  const supabase = await createClient();

  if (!description || description.trim().length === 0) {
    return { error: "Informe uma descrição para o pequeno ganho." };
  }

  const { error } = await supabase.from("gains").insert({
    patient_id: profile.patientId!,
    description: description.trim(),
  });

  if (error) return { error: error.message };

  revalidatePath("/progresso");
  return { success: true };
}

export async function submitWeeklyReviewAction(formData: FormData) {
  const profile = await requireRole("patient");
  const supabase = await createClient();

  const raw = {
    smallest_gain: formData.get("smallest_gain")?.toString() ?? "",
    flexible_situation: formData.get("flexible_situation")?.toString() ?? "",
    increased_domain_or_pleasure: formData.get("increased_domain_or_pleasure")?.toString() ?? "",
    high_anxiety_analysis: formData.get("high_anxiety_analysis")?.toString() ?? "",
  };

  const parsed = weeklyReviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Preencha todas as perguntas da revisão semanal." };
  }

  // Calculate current week Monday
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff)).toISOString().slice(0, 10);

  const { error } = await supabase.from("weekly_reviews").upsert(
    {
      patient_id: profile.patientId!,
      week_start: monday,
      smallest_gain: parsed.data.smallest_gain,
      flexible_situation: parsed.data.flexible_situation,
      increased_domain_or_pleasure: parsed.data.increased_domain_or_pleasure,
      high_anxiety_analysis: parsed.data.high_anxiety_analysis,
    },
    { onConflict: "patient_id, program_id, week_start" },
  );

  if (error) return { error: error.message };

  revalidatePath("/progresso");
  revalidatePath("/revisao");
  return { success: true };
}

export async function createPatientAreaAction(name: string, icon = "circle") {
  const profile = await requireRole("patient");
  const supabase = await createClient();

  const parsed = areaSchema.safeParse({ name, icon });
  if (!parsed.success) return { error: "Nome de área inválido." };

  const { error } = await supabase.from("patient_areas").insert({
    patient_id: profile.patientId!,
    name: parsed.data.name,
    icon: parsed.data.icon ?? "circle",
    active: true,
  });

  if (error) return { error: error.message };

  revalidatePath("/areas");
  return { success: true };
}

export async function archivePatientAreaAction(areaId: string) {
  const profile = await requireRole("patient");
  const supabase = await createClient();

  const { error } = await supabase
    .from("patient_areas")
    .update({ active: false })
    .eq("id", areaId)
    .eq("patient_id", profile.patientId!);

  if (error) return { error: error.message };

  revalidatePath("/areas");
  return { success: true };
}

export async function createPatientMetricAction(payload: {
  areaName: string;
  observableIndicator: string;
  flexibleDirection?: string;
  baselineValue?: string;
  currentValue?: string;
  nextSmallStep?: string;
}) {
  const profile = await requireRole("patient");
  const supabase = await createClient();

  if (!payload.areaName.trim() || !payload.observableIndicator.trim()) {
    return { error: "Área e indicador observável são obrigatórios." };
  }

  const { error } = await supabase.from("patient_progress_metrics").insert({
    patient_id: profile.patientId!,
    area_name: payload.areaName.trim(),
    observable_indicator: payload.observableIndicator.trim(),
    flexible_direction: payload.flexibleDirection?.trim() || null,
    baseline_value: payload.baselineValue?.trim() || null,
    current_value: payload.currentValue?.trim() || null,
    next_small_step: payload.nextSmallStep?.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/progresso");
  return { success: true };
}

export async function selfAssignActivityAction(payload: {
  title: string;
  description?: string;
  scheduledDate: string;
  scheduledTime?: string;
}) {
  const profile = await requireRole("patient");
  const supabase = await createClient();

  if (!payload.title.trim() || !payload.scheduledDate) {
    return { error: "Título e data agendada são obrigatórios." };
  }

  const { data: act } = await supabase
    .from("activities")
    .insert({
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      created_by_patient_id: profile.patientId,
    })
    .select("id")
    .single();

  const activityId = act?.id;

  const period = payload.scheduledTime ? "specific_time" : "morning";
  const scheduledAt = payload.scheduledTime
    ? `${payload.scheduledDate}T${payload.scheduledTime}:00`
    : null;

  const { error } = await supabase.from("activity_assignments").insert({
    patient_id: profile.patientId!,
    activity_id: activityId || null,
    scheduled_date: payload.scheduledDate,
    scheduled_at: scheduledAt,
    period: period,
    status: "scheduled",
  });


  if (error) return { error: error.message };


  revalidatePath("/hoje");
  revalidatePath("/agenda");
  return { success: true };
}

export async function updatePatientAreaAction(areaId: string, name: string) {
  const profile = await requireRole("patient");
  const supabase = await createClient();

  if (!name.trim()) return { error: "Nome de área não pode ser vazio." };

  const { error } = await supabase
    .from("patient_areas")
    .update({ name: name.trim() })
    .eq("id", areaId)
    .eq("patient_id", profile.patientId!);

  if (error) return { error: error.message };

  revalidatePath("/areas");
  return { success: true };
}

export async function deletePatientAreaAction(areaId: string) {
  const profile = await requireRole("patient");
  const supabase = await createClient();

  const { error } = await supabase
    .from("patient_areas")
    .delete()
    .eq("id", areaId)
    .eq("patient_id", profile.patientId!);

  if (error) return { error: error.message };

  revalidatePath("/areas");
  return { success: true };
}

export async function updatePatientMetricAction(
  metricId: string,
  payload: {
    areaName?: string;
    observableIndicator?: string;
    flexibleDirection?: string;
    baselineValue?: string;
    currentValue?: string;
    nextSmallStep?: string;
  },
) {
  const profile = await requireRole("patient");
  const supabase = await createClient();

  const updates: Record<string, string | null> = {};
  if (payload.areaName !== undefined) updates.area_name = payload.areaName.trim();
  if (payload.observableIndicator !== undefined) updates.observable_indicator = payload.observableIndicator.trim();
  if (payload.flexibleDirection !== undefined) updates.flexible_direction = payload.flexibleDirection.trim() || null;
  if (payload.baselineValue !== undefined) updates.baseline_value = payload.baselineValue.trim() || null;
  if (payload.currentValue !== undefined) updates.current_value = payload.currentValue.trim() || null;
  if (payload.nextSmallStep !== undefined) updates.next_small_step = payload.nextSmallStep.trim() || null;

  const { error } = await supabase
    .from("patient_progress_metrics")
    .update(updates)
    .eq("id", metricId)
    .eq("patient_id", profile.patientId!);

  if (error) return { error: error.message };

  revalidatePath("/progresso");
  return { success: true };
}

export async function deletePatientMetricAction(metricId: string) {
  const profile = await requireRole("patient");
  const supabase = await createClient();

  const { error } = await supabase
    .from("patient_progress_metrics")
    .delete()
    .eq("id", metricId)
    .eq("patient_id", profile.patientId!);

  if (error) return { error: error.message };

  revalidatePath("/progresso");
  return { success: true };
}

export async function deleteAssignmentAction(assignmentId: string) {
  const profile = await requireRole("patient");
  const supabase = await createClient();

  const { error } = await supabase
    .from("activity_assignments")
    .delete()
    .eq("id", assignmentId)
    .eq("patient_id", profile.patientId!);

  if (error) return { error: error.message };

  revalidatePath("/hoje");
  revalidatePath("/agenda");
  return { success: true };
}


