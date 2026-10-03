-- Lumina MVP schema, constraints, RLS
-- Admin MUST NOT receive SELECT policies on therapeutic tables.

create extension if not exists pgcrypto;

create type public.user_role as enum ('patient', 'professional', 'admin');
create type public.assignment_status as enum (
  'scheduled',
  'started',
  'completed',
  'skipped',
  'cancelled',
  'rescheduled'
);
create type public.period_type as enum (
  'morning',
  'afternoon',
  'night',
  'specific_time'
);
create type public.subscription_status as enum (
  'active',
  'past_due',
  'cancelled',
  'trialing'
);
create type public.support_ticket_status as enum (
  'open',
  'in_progress',
  'resolved',
  'closed'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  organization_id uuid references public.organizations (id),
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id),
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id),
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.professional_patients (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  organization_id uuid not null references public.organizations (id),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (professional_id, patient_id)
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  professional_id uuid not null references public.professionals (id),
  name text not null,
  description text,
  start_date date,
  end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patient_programs (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  status text not null default 'active',
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  unique (program_id, patient_id)
);

create table public.program_areas (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  name text not null,
  icon text,
  sort_order integer not null default 0,
  active boolean not null default true
);

create table public.patient_areas (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  name text not null,
  icon text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  program_area_id uuid references public.program_areas (id),
  title text not null,
  description text,
  objective text,
  instructions text,
  duration_suggested_minutes integer,
  difficulty text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_progressions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  activity_id uuid not null references public.activities (id) on delete cascade,
  step_order integer not null default 0,
  description text not null,
  created_at timestamptz not null default now(),
  unique (program_id, activity_id, step_order)
);

create table public.activity_assignments (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id),
  patient_id uuid not null references public.patients (id) on delete cascade,
  professional_id uuid not null references public.professionals (id),
  scheduled_date date not null,
  period public.period_type not null,
  scheduled_at timestamptz,
  status public.assignment_status not null default 'scheduled',
  instructions text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  constraint assignment_specific_time_requires_at check (
    period <> 'specific_time' or scheduled_at is not null
  )
);

create table public.activity_sessions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.activity_assignments (id) on delete cascade,
  started_at timestamptz not null,
  finished_at timestamptz,
  elapsed_seconds integer,
  focus_timer_enabled boolean not null default false,
  focus_timer_minutes integer,
  notes text,
  created_at timestamptz not null default now()
);

create table public.activity_assessments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid unique not null references public.activity_sessions (id) on delete cascade,
  domain_score smallint not null check (domain_score between 0 and 5),
  pleasure_score smallint not null check (pleasure_score between 0 and 5),
  anxiety_score smallint not null check (anxiety_score between 0 and 5),
  created_at timestamptz not null default now()
);

create table public.progress_metrics (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  area_name text not null,
  flexible_direction text,
  observable_indicator text not null,
  baseline_value text,
  current_value text,
  next_small_step text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gains (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  program_id uuid references public.programs (id),
  assignment_id uuid references public.activity_assignments (id),
  description text not null,
  created_at timestamptz not null default now()
);

create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  program_id uuid references public.programs (id),
  week_start date not null,
  smallest_gain text,
  flexible_situation text,
  increased_domain_or_pleasure text,
  high_anxiety_analysis text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_id, program_id, week_start)
);

create table public.professional_notes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  professional_id uuid not null references public.professionals (id),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users (id),
  organization_id uuid references public.organizations (id),
  action text not null,
  resource_type text,
  resource_id uuid,
  created_at timestamptz not null default now(),
  metadata jsonb
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  interval text not null default 'monthly',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  plan_id uuid not null references public.plans (id),
  status public.subscription_status not null default 'active',
  renews_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id),
  created_by uuid references public.users (id),
  subject text not null,
  status public.support_ticket_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_assignments_patient_date
  on public.activity_assignments (patient_id, scheduled_date);
create index idx_sessions_assignment
  on public.activity_sessions (assignment_id, created_at desc);
create index idx_gains_patient
  on public.gains (patient_id, created_at desc);
create index idx_reviews_patient_week
  on public.weekly_reviews (patient_id, week_start desc);
create index idx_notes_patient_created
  on public.professional_notes (patient_id, created_at desc);
create index idx_users_org_role on public.users (organization_id, role);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_organizations_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger trg_users_updated_at before update on public.users
  for each row execute function public.set_updated_at();
create trigger trg_patients_updated_at before update on public.patients
  for each row execute function public.set_updated_at();
create trigger trg_professionals_updated_at before update on public.professionals
  for each row execute function public.set_updated_at();
create trigger trg_programs_updated_at before update on public.programs
  for each row execute function public.set_updated_at();
create trigger trg_activities_updated_at before update on public.activities
  for each row execute function public.set_updated_at();
create trigger trg_progress_metrics_updated_at before update on public.progress_metrics
  for each row execute function public.set_updated_at();
create trigger trg_weekly_reviews_updated_at before update on public.weekly_reviews
  for each row execute function public.set_updated_at();
create trigger trg_professional_notes_updated_at before update on public.professional_notes
  for each row execute function public.set_updated_at();
create trigger trg_subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();
create trigger trg_support_tickets_updated_at before update on public.support_tickets
  for each row execute function public.set_updated_at();

create or replace function public.enforce_assignment_status()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if old.status = 'scheduled' and new.status not in ('started', 'skipped', 'cancelled', 'rescheduled') then
      raise exception 'Transição de status inválida: % -> %', old.status, new.status;
    end if;
    if old.status = 'started' and new.status not in ('completed', 'cancelled') then
      raise exception 'Transição de status inválida: % -> %', old.status, new.status;
    end if;
    if old.status in ('completed', 'skipped', 'cancelled', 'rescheduled') then
      raise exception 'Transição de status inválida a partir de %', old.status;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_assignment_status
  before update on public.activity_assignments
  for each row execute function public.enforce_assignment_status();
