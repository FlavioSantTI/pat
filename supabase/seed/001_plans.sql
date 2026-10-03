-- Seed operacional (sem usuários de auth). Dados terapêuticos ficam no script Node.

insert into public.plans (name, interval, active)
values
  ('Básico', 'monthly', true),
  ('Clínica', 'monthly', true),
  ('Instituição', 'yearly', true)
on conflict do nothing;
