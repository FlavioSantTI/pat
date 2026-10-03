export type UserRole = "patient" | "professional" | "admin";

export type AssignmentStatus =
  | "scheduled"
  | "started"
  | "completed"
  | "skipped"
  | "cancelled"
  | "rescheduled";

export type PeriodType = "morning" | "afternoon" | "night" | "specific_time";

export const PERIOD_LABELS: Record<PeriodType, string> = {
  morning: "Manhã",
  afternoon: "Tarde",
  night: "Noite",
  specific_time: "Horário específico",
};

export const STATUS_LABELS: Record<AssignmentStatus, string> = {
  scheduled: "Agendada",
  started: "Em andamento",
  completed: "Concluída",
  skipped: "Pular",
  cancelled: "Cancelada",
  rescheduled: "Reagendada",
};

export type Profile = {
  userId: string;
  role: UserRole;
  organizationId: string | null;
  email: string | null;
  displayName: string;
  patientId?: string;
  professionalId?: string;
};
