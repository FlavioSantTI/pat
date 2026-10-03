import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres"),
});

export const assessmentSchema = z.object({
  domain_score: z.number().int().min(0).max(5),
  pleasure_score: z.number().int().min(0).max(5),
  anxiety_score: z.number().int().min(0).max(5),
  notes: z.string().max(2000).optional(),
  gain: z.string().max(500).optional(),
});

export const weeklyReviewSchema = z.object({
  smallest_gain: z.string().min(1),
  flexible_situation: z.string().min(1),
  increased_domain_or_pleasure: z.string().min(1),
  high_anxiety_analysis: z.string().min(1),
});

export const activitySchema = z.object({
  title: z.string().min(3),
  objective: z.string().optional(),
  instructions: z.string().optional(),
  description: z.string().optional(),
  duration_suggested_minutes: z.coerce.number().int().min(1).max(180).optional(),
  program_id: z.string().uuid(),
  program_area_id: z.string().uuid().optional(),
  period: z.enum(["morning", "afternoon", "night", "specific_time"]).optional(),
});

export const assignSchema = z.object({
  activity_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  scheduled_date: z.string(),
  period: z.enum(["morning", "afternoon", "night", "specific_time"]),
  scheduled_at: z.string().optional().nullable(),
});

export const areaSchema = z.object({
  name: z.string().min(2),
  icon: z.string().optional(),
});

export const noteSchema = z.object({
  content: z.string().min(1).max(8000),
});
