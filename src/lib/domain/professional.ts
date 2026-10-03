import { createClient } from "@/lib/supabase/server";

export type LinkedPatient = {
  id: string; // patient_id
  displayName: string;
  email: string | null;
  status: string;
  activeAssignmentsCount: number;
  completedAssignmentsCount: number;
  lastAssessmentDate: string | null;
};

export type ProfessionalDashboardData = {
  patients: LinkedPatient[];
  programsCount: number;
  activitiesCount: number;
  recentReviewsCount: number;
};

export type ProgramAreaRow = {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
};

export type ActivityRow = {
  id: string;
  title: string;
  description: string | null;
  objective: string | null;
  instructions: string | null;
  duration_suggested_minutes: number;
  difficulty: number;
  program_area_id: string;
};

export type ProgramWithDetails = {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  program_areas: ProgramAreaRow[];
  activities: ActivityRow[];
};

export type ClinicalAssignment = {
  id: string;
  scheduled_date: string;
  period: string;
  scheduled_at: string | null;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  activities: {
    title: string;
    program_areas: {
      name: string;
    } | null;
  } | null;
  activity_sessions: Array<{
    elapsed_seconds: number;
    focus_timer_minutes: number | null;
    notes: string | null;
    activity_assessments: Array<{
      domain_score: number;
      pleasure_score: number;
      anxiety_score: number;
    }>;
  }>;
};

export type ProgressMetricRow = {
  id: string;
  program_id: string;
  patient_id: string;
  area_name: string;
  flexible_direction: string | null;
  observable_indicator: string;
  baseline_value: string | null;
  current_value: string | null;
  next_small_step: string | null;
  created_at: string;
  updated_at: string;
};

export type GainRow = {
  id: string;
  patient_id: string;
  program_id: string | null;
  assignment_id: string | null;
  description: string;
  created_at: string;
};

export type WeeklyReviewRow = {
  id: string;
  patient_id: string;
  program_id: string | null;
  week_start: string;
  smallest_gain: string | null;
  flexible_situation: string | null;
  increased_domain_or_pleasure: string | null;
  high_anxiety_analysis: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfessionalNoteRow = {
  id: string;
  patient_id: string;
  professional_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type PatientClinicalRecord = {
  patient: {
    id: string;
    displayName: string;
    email: string | null;
  };
  assignments: ClinicalAssignment[];
  metrics: ProgressMetricRow[];
  gains: GainRow[];
  reviews: WeeklyReviewRow[];
  notes: ProfessionalNoteRow[];
};

export type WeeklyReviewWithPatient = {
  id: string;
  week_start: string;
  smallest_gain: string;
  flexible_situation: string;
  increased_domain_or_pleasure: string;
  high_anxiety_analysis: string;
  created_at: string;
  patients: {
    id: string;
    display_name: string;
  } | null;
};

interface PatientLinkQueryResult {
  patient_id: string;
  status: string;
  patients: {
    id: string;
    display_name: string;
    user_id: string;
    users?: {
      email?: string;
    } | null;
  } | null;
}

export async function getProfessionalDashboardData(
  professionalId: string,
): Promise<ProfessionalDashboardData> {
  const supabase = await createClient();

  // Linked patients
  const { data: links } = await supabase
    .from("professional_patients")
    .select(`
      patient_id,
      status,
      patients (
        id,
        display_name,
        user_id,
        users (
          email
        )
      )
    `)
    .eq("professional_id", professionalId)
    .eq("status", "active");

  const patientsList: LinkedPatient[] = [];

  if (links) {
    const rawLinks = links as unknown as PatientLinkQueryResult[];
    for (const link of rawLinks) {
      const p = link.patients;
      if (!p) continue;

      // Count assignments
      const { count: scheduledCount } = await supabase
        .from("activity_assignments")
        .select("*", { count: "exact", head: true })
        .eq("patient_id", p.id)
        .in("status", ["scheduled", "started"]);

      const { count: doneCount } = await supabase
        .from("activity_assignments")
        .select("*", { count: "exact", head: true })
        .eq("patient_id", p.id)
        .eq("status", "completed");

      patientsList.push({
        id: p.id,
        displayName: p.display_name,
        email: p.users?.email ?? null,
        status: link.status,
        activeAssignmentsCount: scheduledCount ?? 0,
        completedAssignmentsCount: doneCount ?? 0,
        lastAssessmentDate: null,
      });
    }
  }

  // Count programs
  const { count: programsCount } = await supabase
    .from("programs")
    .select("*", { count: "exact", head: true })
    .eq("professional_id", professionalId);

  // Count activities
  const { count: activitiesCount } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true });

  // Count reviews from linked patients
  const patientIds = patientsList.map((p) => p.id);
  let recentReviewsCount = 0;
  if (patientIds.length > 0) {
    const { count } = await supabase
      .from("weekly_reviews")
      .select("*", { count: "exact", head: true })
      .in("patient_id", patientIds);
    recentReviewsCount = count ?? 0;
  }

  return {
    patients: patientsList,
    programsCount: programsCount ?? 0,
    activitiesCount: activitiesCount ?? 0,
    recentReviewsCount,
  };
}

export async function getPatientClinicalRecord(
  professionalId: string,
  patientId: string,
): Promise<PatientClinicalRecord | null> {
  const supabase = await createClient();

  // Verify link
  const { data: link } = await supabase
    .from("professional_patients")
    .select("status")
    .eq("professional_id", professionalId)
    .eq("patient_id", patientId)
    .maybeSingle();

  if (!link) return null;

  // Patient info
  const { data: patient } = await supabase
    .from("patients")
    .select(`
      id,
      display_name,
      users (
        email
      )
    `)
    .eq("id", patientId)
    .single();

  // Assignments with D/P/A assessments
  const { data: assignments } = await supabase
    .from("activity_assignments")
    .select(`
      id,
      scheduled_date,
      period,
      scheduled_at,
      status,
      started_at,
      completed_at,
      activities (
        title,
        program_areas (
          name
        )
      ),
      activity_sessions (
        elapsed_seconds,
        focus_timer_minutes,
        notes,
        activity_assessments (
          domain_score,
          pleasure_score,
          anxiety_score
        )
      )
    `)
    .eq("patient_id", patientId)
    .order("scheduled_date", { ascending: false });

  // Progress metrics
  const { data: metrics } = await supabase
    .from("progress_metrics")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  // Small gains
  const { data: gains } = await supabase
    .from("gains")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  // Weekly reviews
  const { data: reviews } = await supabase
    .from("weekly_reviews")
    .select("*")
    .eq("patient_id", patientId)
    .order("week_start", { ascending: false });

  // Confidential notes
  const { data: notes } = await supabase
    .from("professional_notes")
    .select("*")
    .eq("patient_id", patientId)
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: false });

  const patientData = patient as unknown as {
    id: string;
    display_name: string;
    users?: { email?: string } | null;
  } | null;

  return {
    patient: {
      id: patientData?.id ?? patientId,
      displayName: patientData?.display_name ?? "Paciente",
      email: patientData?.users?.email ?? null,
    },
    assignments: (assignments as unknown as ClinicalAssignment[]) ?? [],
    metrics: (metrics as unknown as ProgressMetricRow[]) ?? [],
    gains: (gains as unknown as GainRow[]) ?? [],
    reviews: (reviews as unknown as WeeklyReviewRow[]) ?? [],
    notes: (notes as unknown as ProfessionalNoteRow[]) ?? [],
  };
}

export async function getProfessionalPrograms(
  professionalId: string,
): Promise<ProgramWithDetails[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("programs")
    .select(`
      id,
      name,
      description,
      start_date,
      end_date,
      program_areas (
        id,
        name,
        icon,
        sort_order
      ),
      activities (
        id,
        title,
        description,
        objective,
        instructions,
        duration_suggested_minutes,
        difficulty,
        program_area_id
      )
    `)
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: false });

  return (data as unknown as ProgramWithDetails[]) ?? [];
}

export async function getProfessionalWeeklyReviews(
  professionalId: string,
): Promise<WeeklyReviewWithPatient[]> {
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("professional_patients")
    .select("patient_id")
    .eq("professional_id", professionalId);

  if (!links || links.length === 0) return [];
  const patientIds = links.map((l) => l.patient_id);

  const { data } = await supabase
    .from("weekly_reviews")
    .select(`
      id,
      week_start,
      smallest_gain,
      flexible_situation,
      increased_domain_or_pleasure,
      high_anxiety_analysis,
      created_at,
      patients (
        id,
        display_name
      )
    `)
    .in("patient_id", patientIds)
    .order("week_start", { ascending: false });

  return (data as unknown as WeeklyReviewWithPatient[]) ?? [];
}
