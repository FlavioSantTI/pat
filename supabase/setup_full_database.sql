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
-- RLS helpers and policies. No admin SELECT on therapeutic tables.

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.users where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  )
$$;

create or replace function public.current_patient_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.patients where user_id = auth.uid()
$$;

create or replace function public.current_professional_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.professionals where user_id = auth.uid()
$$;

create or replace function public.is_linked_professional_patient(target_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.professional_patients pp
    where pp.professional_id = public.current_professional_id()
      and pp.patient_id = target_patient_id
      and pp.status = 'active'
  )
$$;

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.patients enable row level security;
alter table public.professionals enable row level security;
alter table public.professional_patients enable row level security;
alter table public.programs enable row level security;
alter table public.patient_programs enable row level security;
alter table public.program_areas enable row level security;
alter table public.patient_areas enable row level security;
alter table public.activities enable row level security;
alter table public.activity_progressions enable row level security;
alter table public.activity_assignments enable row level security;
alter table public.activity_sessions enable row level security;
alter table public.activity_assessments enable row level security;
alter table public.progress_metrics enable row level security;
alter table public.gains enable row level security;
alter table public.weekly_reviews enable row level security;
alter table public.professional_notes enable row level security;
alter table public.audit_logs enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.support_tickets enable row level security;

-- Operational tables (admin + limited professional read)
create policy organizations_admin_all on public.organizations
  for all using (public.is_admin()) with check (public.is_admin());
create policy organizations_professional_select on public.organizations
  for select using (id = public.current_org_id());

create policy users_self_select on public.users
  for select using (id = auth.uid());
create policy users_admin_all on public.users
  for all using (public.is_admin()) with check (public.is_admin());
create policy users_professional_org_select on public.users
  for select using (
    public.current_user_role() = 'professional'
    and organization_id = public.current_org_id()
    and role in ('patient', 'professional')
  );

create policy plans_admin_all on public.plans
  for all using (public.is_admin()) with check (public.is_admin());
create policy plans_professional_select on public.plans
  for select using (public.current_user_role() = 'professional');

create policy subscriptions_admin_all on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());
create policy subscriptions_professional_select on public.subscriptions
  for select using (
    public.current_user_role() = 'professional'
    and organization_id = public.current_org_id()
  );

create policy support_admin_all on public.support_tickets
  for all using (public.is_admin()) with check (public.is_admin());
create policy support_self_insert on public.support_tickets
  for insert with check (created_by = auth.uid());
create policy support_self_select on public.support_tickets
  for select using (created_by = auth.uid());

create policy audit_admin_select on public.audit_logs
  for select using (public.is_admin());
create policy audit_insert_authenticated on public.audit_logs
  for insert with check (actor_user_id = auth.uid());

-- Patients / professionals
create policy patients_self_select on public.patients
  for select using (user_id = auth.uid());
create policy patients_self_update on public.patients
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy professional_linked_patients_select on public.patients
  for select using (public.is_linked_professional_patient(id));
create policy professional_create_patient on public.patients
  for insert with check (
    public.current_user_role() = 'professional'
    and organization_id = public.current_org_id()
  );

create policy professionals_self_select on public.professionals
  for select using (user_id = auth.uid());
create policy professionals_admin_all on public.professionals
  for all using (public.is_admin()) with check (public.is_admin());
create policy professionals_peer_select on public.professionals
  for select using (
    public.current_user_role() = 'professional'
    and organization_id = public.current_org_id()
  );

create policy professional_own_links_select on public.professional_patients
  for select using (professional_id = public.current_professional_id());
create policy professional_own_links_insert on public.professional_patients
  for insert with check (professional_id = public.current_professional_id());
create policy professional_own_links_update on public.professional_patients
  for update using (professional_id = public.current_professional_id())
  with check (professional_id = public.current_professional_id());
create policy patient_own_links_select on public.professional_patients
  for select using (patient_id = public.current_patient_id());

-- Programs
create policy professional_programs_select on public.programs
  for select using (professional_id = public.current_professional_id());
create policy professional_programs_insert on public.programs
  for insert with check (professional_id = public.current_professional_id());
create policy professional_programs_update on public.programs
  for update using (professional_id = public.current_professional_id())
  with check (professional_id = public.current_professional_id());
create policy patient_programs_via_link_select on public.programs
  for select using (
    exists (
      select 1 from public.patient_programs pp
      where pp.program_id = programs.id
        and pp.patient_id = public.current_patient_id()
        and pp.status = 'active'
    )
  );

create policy patient_programs_select on public.patient_programs
  for select using (patient_id = public.current_patient_id());
create policy professional_patient_programs_all on public.patient_programs
  for all using (public.is_linked_professional_patient(patient_id))
  with check (public.is_linked_professional_patient(patient_id));

create policy professional_program_areas_all on public.program_areas
  for all using (
    exists (
      select 1 from public.programs p
      where p.id = program_areas.program_id
        and p.professional_id = public.current_professional_id()
    )
  )
  with check (
    exists (
      select 1 from public.programs p
      where p.id = program_areas.program_id
        and p.professional_id = public.current_professional_id()
    )
  );
create policy patient_program_areas_select on public.program_areas
  for select using (
    exists (
      select 1 from public.patient_programs pp
      where pp.program_id = program_areas.program_id
        and pp.patient_id = public.current_patient_id()
        and pp.status = 'active'
    )
  );

create policy patient_areas_own_all on public.patient_areas
  for all using (patient_id = public.current_patient_id())
  with check (patient_id = public.current_patient_id());
create policy professional_patient_areas_select on public.patient_areas
  for select using (public.is_linked_professional_patient(patient_id));

create policy professional_activities_all on public.activities
  for all using (
    exists (
      select 1 from public.programs p
      where p.id = activities.program_id
        and p.professional_id = public.current_professional_id()
    )
  )
  with check (
    exists (
      select 1 from public.programs p
      where p.id = activities.program_id
        and p.professional_id = public.current_professional_id()
    )
  );
create policy patient_activities_select on public.activities
  for select using (
    exists (
      select 1 from public.patient_programs pp
      where pp.program_id = activities.program_id
        and pp.patient_id = public.current_patient_id()
        and pp.status = 'active'
    )
  );

create policy professional_progressions_all on public.activity_progressions
  for all using (
    exists (
      select 1 from public.programs p
      where p.id = activity_progressions.program_id
        and p.professional_id = public.current_professional_id()
    )
  )
  with check (
    exists (
      select 1 from public.programs p
      where p.id = activity_progressions.program_id
        and p.professional_id = public.current_professional_id()
    )
  );
create policy patient_progressions_select on public.activity_progressions
  for select using (
    exists (
      select 1 from public.patient_programs pp
      where pp.program_id = activity_progressions.program_id
        and pp.patient_id = public.current_patient_id()
        and pp.status = 'active'
    )
  );

create policy patient_assignments_select on public.activity_assignments
  for select using (patient_id = public.current_patient_id());
create policy patient_assignments_update on public.activity_assignments
  for update using (patient_id = public.current_patient_id())
  with check (patient_id = public.current_patient_id());
create policy professional_assignments_select on public.activity_assignments
  for select using (professional_id = public.current_professional_id());
create policy professional_assignments_insert on public.activity_assignments
  for insert with check (
    professional_id = public.current_professional_id()
    and public.is_linked_professional_patient(patient_id)
  );
create policy professional_assignments_update on public.activity_assignments
  for update using (professional_id = public.current_professional_id())
  with check (professional_id = public.current_professional_id());

create policy patient_sessions_own on public.activity_sessions
  for all using (
    exists (
      select 1 from public.activity_assignments a
      where a.id = activity_sessions.assignment_id
        and a.patient_id = public.current_patient_id()
    )
  )
  with check (
    exists (
      select 1 from public.activity_assignments a
      where a.id = activity_sessions.assignment_id
        and a.patient_id = public.current_patient_id()
    )
  );
create policy professional_sessions_select on public.activity_sessions
  for select using (
    exists (
      select 1 from public.activity_assignments a
      where a.id = activity_sessions.assignment_id
        and a.professional_id = public.current_professional_id()
    )
  );

create policy patient_assessments_own on public.activity_assessments
  for all using (
    exists (
      select 1
      from public.activity_sessions s
      join public.activity_assignments a on a.id = s.assignment_id
      where s.id = activity_assessments.session_id
        and a.patient_id = public.current_patient_id()
    )
  )
  with check (
    exists (
      select 1
      from public.activity_sessions s
      join public.activity_assignments a on a.id = s.assignment_id
      where s.id = activity_assessments.session_id
        and a.patient_id = public.current_patient_id()
    )
  );
create policy professional_assessments_select on public.activity_assessments
  for select using (
    exists (
      select 1
      from public.activity_sessions s
      join public.activity_assignments a on a.id = s.assignment_id
      where s.id = activity_assessments.session_id
        and a.professional_id = public.current_professional_id()
    )
  );

create policy patient_gains_own on public.gains
  for all using (patient_id = public.current_patient_id())
  with check (patient_id = public.current_patient_id());
create policy professional_gains_select on public.gains
  for select using (public.is_linked_professional_patient(patient_id));

create policy patient_progress_select on public.progress_metrics
  for select using (patient_id = public.current_patient_id());
create policy professional_progress_all on public.progress_metrics
  for all using (public.is_linked_professional_patient(patient_id))
  with check (public.is_linked_professional_patient(patient_id));

create policy patient_reviews_own on public.weekly_reviews
  for all using (patient_id = public.current_patient_id())
  with check (patient_id = public.current_patient_id());
create policy professional_reviews_select on public.weekly_reviews
  for select using (public.is_linked_professional_patient(patient_id));

create policy professional_notes_author_select on public.professional_notes
  for select using (
    professional_id = public.current_professional_id()
    and public.is_linked_professional_patient(patient_id)
  );
create policy professional_notes_author_insert on public.professional_notes
  for insert with check (
    professional_id = public.current_professional_id()
    and public.is_linked_professional_patient(patient_id)
  );
create policy professional_notes_author_update on public.professional_notes
  for update using (professional_id = public.current_professional_id())
  with check (professional_id = public.current_professional_id());

revoke all on public.activity_assessments from public;
revoke all on public.professional_notes from public;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage on all sequences in schema public to authenticated;
-- Seed operacional (sem usuários de auth). Dados terapêuticos ficam no script Node.

insert into public.plans (name, interval, active)
values
  ('Básico', 'monthly', true),
  ('Clínica', 'monthly', true),
  ('Instituição', 'yearly', true)
on conflict do nothing;
