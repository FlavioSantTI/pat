import { createClient } from "@/lib/supabase/server";
import type { AssignmentStatus, PeriodType } from "@/types";

export type PatientActivityItem = {
  id: string; // assignment_id
  activityId: string;
  title: string;
  description: string | null;
  objective: string | null;
  instructions: string | null;
  durationMinutes: number | null;
  difficulty: string | null;
  areaName: string;
  areaIcon: string | null;
  period: PeriodType;
  scheduledDate: string;
  scheduledAt: string | null;
  status: AssignmentStatus;
  startedAt: string | null;
  completedAt: string | null;
  hasAssessment: boolean;
};

type AssignmentRow = {
  id: string;
  activity_id: string;
  scheduled_date: string;
  period: string;
  scheduled_at: string | null;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  activities?: {
    id: string;
    title: string;
    description: string | null;
    objective: string | null;
    instructions: string | null;
    duration_suggested_minutes: number | null;
    difficulty: string | null;
    program_areas?: {
      name: string;
      icon: string | null;
    } | null;
  } | null;
  activity_sessions?: Array<{
    id: string;
    activity_assessments?: Array<{
      id: string;
      domain_score: number;
      pleasure_score: number;
      anxiety_score: number;
    }> | null;
  }> | null;
};

export async function getTodayAssignments(
  patientId: string,
  dateStr?: string,
): Promise<PatientActivityItem[]> {
  const supabase = await createClient();
  const targetDate = dateStr ?? new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("activity_assignments")
    .select(`
      id,
      activity_id,
      scheduled_date,
      period,
      scheduled_at,
      status,
      started_at,
      completed_at,
      activities (
        id,
        title,
        description,
        objective,
        instructions,
        duration_suggested_minutes,
        difficulty,
        program_areas (
          name,
          icon
        )
      )
    `)
    .eq("patient_id", patientId)
    .eq("scheduled_date", targetDate)
    .order("period", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as unknown as AssignmentRow[]).map((row) => {
    const act = row.activities;
    const area = act?.program_areas;
    return {
      id: row.id,
      activityId: act?.id ?? row.activity_id,
      title: act?.title ?? "Atividade sem título",
      description: act?.description ?? null,
      objective: act?.objective ?? null,
      instructions: act?.instructions ?? null,
      durationMinutes: act?.duration_suggested_minutes ?? null,
      difficulty: act?.difficulty ?? null,
      areaName: area?.name ?? "Geral",
      areaIcon: area?.icon ?? "circle",
      period: row.period as PeriodType,
      scheduledDate: row.scheduled_date,
      scheduledAt: row.scheduled_at,
      status: row.status as AssignmentStatus,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      hasAssessment: false,
    };
  });
}

export async function getAssignmentDetails(
  patientId: string,
  assignmentId: string,
): Promise<PatientActivityItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activity_assignments")
    .select(`
      id,
      activity_id,
      scheduled_date,
      period,
      scheduled_at,
      status,
      started_at,
      completed_at,
      activities (
        id,
        title,
        description,
        objective,
        instructions,
        duration_suggested_minutes,
        difficulty,
        program_areas (
          name,
          icon
        )
      ),
      activity_sessions (
        id,
        activity_assessments (
          id,
          domain_score,
          pleasure_score,
          anxiety_score
        )
      )
    `)
    .eq("patient_id", patientId)
    .eq("id", assignmentId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as unknown as AssignmentRow;
  const act = row.activities;
  const area = act?.program_areas;
  const sessions = row.activity_sessions ?? [];
  const hasAssessment = sessions.some(
    (s) => s.activity_assessments && s.activity_assessments.length > 0,
  );

  return {
    id: row.id,
    activityId: act?.id ?? row.activity_id,
    title: act?.title ?? "Atividade",
    description: act?.description ?? null,
    objective: act?.objective ?? null,
    instructions: act?.instructions ?? null,
    durationMinutes: act?.duration_suggested_minutes ?? null,
    difficulty: act?.difficulty ?? null,
    areaName: area?.name ?? "Geral",
    areaIcon: area?.icon ?? "circle",
    period: row.period as PeriodType,
    scheduledDate: row.scheduled_date,
    scheduledAt: row.scheduled_at,
    status: row.status as AssignmentStatus,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    hasAssessment,
  };
}

export async function getAgendaAssignments(
  patientId: string,
  startDate: string,
  endDate: string,
): Promise<PatientActivityItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activity_assignments")
    .select(`
      id,
      activity_id,
      scheduled_date,
      period,
      scheduled_at,
      status,
      started_at,
      completed_at,
      activities (
        id,
        title,
        description,
        objective,
        instructions,
        duration_suggested_minutes,
        difficulty,
        program_areas (
          name,
          icon
        )
      )
    `)
    .eq("patient_id", patientId)
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)
    .order("scheduled_date", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as unknown as AssignmentRow[]).map((row) => {
    const act = row.activities;
    const area = act?.program_areas;
    return {
      id: row.id,
      activityId: act?.id ?? row.activity_id,
      title: act?.title ?? "Atividade",
      description: act?.description ?? null,
      objective: act?.objective ?? null,
      instructions: act?.instructions ?? null,
      durationMinutes: act?.duration_suggested_minutes ?? null,
      difficulty: act?.difficulty ?? null,
      areaName: area?.name ?? "Geral",
      areaIcon: area?.icon ?? "circle",
      period: row.period as PeriodType,
      scheduledDate: row.scheduled_date,
      scheduledAt: row.scheduled_at,
      status: row.status as AssignmentStatus,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      hasAssessment: false,
    };
  });
}

export async function getPatientProgressMetrics(patientId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("progress_metrics")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getPatientGains(patientId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gains")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getPatientReviews(patientId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("weekly_reviews")
    .select("*")
    .eq("patient_id", patientId)
    .order("week_start", { ascending: false });
  return data ?? [];
}

export async function getPatientAreas(patientId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("patient_areas")
    .select("*")
    .eq("patient_id", patientId)
    .eq("active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}
