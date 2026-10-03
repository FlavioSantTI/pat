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
