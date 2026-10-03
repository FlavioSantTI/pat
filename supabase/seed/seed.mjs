import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const password = process.env.LUMINA_SEED_PASSWORD ?? "LuminaDev!2026";

const seedUsers = [
  { email: "admin.ficticio@lumina.dev", role: "admin", name: "Admin Operacional" },
  { email: "ana.profissional@lumina.dev", role: "professional", name: "Dra. Ana" },
  { email: "paulo.profissional@lumina.dev", role: "professional", name: "Dr. Paulo" },
  { email: "maria.paciente@lumina.dev", role: "patient", name: "Maria Silva" },
  { email: "joao.paciente@lumina.dev", role: "patient", name: "João Santos" },
  { email: "carla.paciente@lumina.dev", role: "patient", name: "Carla Lima" },
];

async function ensureAuthUser(email, role) {
  const { data: existing, error: listError } = await admin.auth.admin.listUsers();
  if (listError) throw listError;
  const found = existing.users.find((u) => u.email === email);
  if (found) return found.id;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { seed: true, role },
  });
  if (error) throw error;
  return data.user.id;
}

async function main() {
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({ name: "Clínica Bem Viver (fictícia)", status: "active" })
    .select("id")
    .single();
  if (orgError) throw orgError;

  const ids = {};
  for (const u of seedUsers) {
    ids[u.email] = await ensureAuthUser(u.email, u.role);
    const { error } = await admin.from("users").upsert({
      id: ids[u.email],
      role: u.role,
      organization_id: u.role === "admin" ? null : org.id,
      email: u.email,
    });
    if (error) throw error;
  }

  const { data: proAna, error: proAnaError } = await admin
    .from("professionals")
    .insert({
      user_id: ids["ana.profissional@lumina.dev"],
      organization_id: org.id,
      display_name: "Dra. Ana",
    })
    .select("id")
    .single();
  if (proAnaError) throw proAnaError;

  const { data: proPaulo, error: proPauloError } = await admin
    .from("professionals")
    .insert({
      user_id: ids["paulo.profissional@lumina.dev"],
      organization_id: org.id,
      display_name: "Dr. Paulo",
    })
    .select("id")
    .single();
  if (proPauloError) throw proPauloError;

  const patientRows = [
    ["maria.paciente@lumina.dev", "Maria Silva"],
    ["joao.paciente@lumina.dev", "João Santos"],
    ["carla.paciente@lumina.dev", "Carla Lima"],
  ];

  const patientIds = [];
  for (const [email, name] of patientRows) {
    const { data, error } = await admin
      .from("patients")
      .insert({
        user_id: ids[email],
        organization_id: org.id,
        display_name: name,
      })
      .select("id")
      .single();
    if (error) throw error;
    patientIds.push(data.id);
  }

  await admin.from("professional_patients").insert(
    patientIds.map((patient_id) => ({
      professional_id: proAna.id,
      patient_id,
      organization_id: org.id,
      status: "active",
    })),
  );

  const { data: program, error: progError } = await admin
    .from("programs")
    .insert({
      organization_id: org.id,
      professional_id: proAna.id,
      name: "Programa terapêutico de referência",
      description: "Programa fictício para desenvolvimento.",
      start_date: "2026-04-01",
      end_date: "2026-06-30",
    })
    .select("id")
    .single();
  if (progError) throw progError;

  await admin.from("patient_programs").insert(
    patientIds.map((patient_id) => ({
      program_id: program.id,
      patient_id,
      status: "active",
      start_date: "2026-04-01",
    })),
  );

  const areaNames = ["Trabalho", "Alimentação", "Consigo", "Saúde", "Social", "Lazer"];
  const areas = [];
  for (const [i, name] of areaNames.entries()) {
    const { data, error } = await admin
      .from("program_areas")
      .insert({ program_id: program.id, name, sort_order: i, icon: "circle" })
      .select("id, name")
      .single();
    if (error) throw error;
    areas.push(data);
  }

  for (const patient_id of patientIds) {
    await admin.from("patient_areas").insert(
      areaNames.map((name, sort_order) => ({
        patient_id,
        name,
        sort_order,
        icon: "circle",
      })),
    );
  }

  const work = areas.find((a) => a.name === "Trabalho");
  const food = areas.find((a) => a.name === "Alimentação");
  const self = areas.find((a) => a.name === "Consigo");

  const { data: activity, error: actError } = await admin
    .from("activities")
    .insert({
      program_id: program.id,
      program_area_id: work.id,
      title: "Escolher 1 prioridade e começar por 10 minutos",
      objective: "Agir por prioridade, não por urgência alheia.",
      instructions:
        "1. Escolha uma tarefa prioridade.\n2. Defina 10 minutos.\n3. Comece, sem revisar tudo antes.",
      duration_suggested_minutes: 10,
      difficulty: "leve",
    })
    .select("id")
    .single();
  if (actError) throw actError;

  await admin.from("activities").insert([
    {
      program_id: program.id,
      program_area_id: food.id,
      title: "Café da manhã possível",
      objective: "Comer algo simples sem perfeccionismo.",
      instructions: "Prepare um café da manhã possível em até 15 minutos.",
      duration_suggested_minutes: 15,
    },
    {
      program_id: program.id,
      program_area_id: self.id,
      title: "Pausar uma autocobrança",
      objective: "Notar a autocobrança e escolher um passo menor.",
      instructions: "Quando notar cobrança, pause e escolha a menor ação possível.",
      duration_suggested_minutes: 10,
    },
  ]);

  const today = new Date().toISOString().slice(0, 10);
  await admin.from("activity_assignments").insert({
    activity_id: activity.id,
    patient_id: patientIds[0],
    professional_id: proAna.id,
    scheduled_date: today,
    period: "morning",
    status: "scheduled",
  });

  await admin.from("progress_metrics").insert({
    program_id: program.id,
    patient_id: patientIds[0],
    area_name: "Trabalho",
    flexible_direction: "Agir por prioridade.",
    observable_indicator: "Tarefas iniciadas em blocos de 10 min.",
    baseline_value: "2",
    current_value: "4",
    next_small_step: "Manter 4 e experimentar uma tarefa diferente.",
  });

  const { data: plan } = await admin.from("plans").select("id").eq("name", "Clínica").maybeSingle();
  if (plan) {
    await admin.from("subscriptions").insert({
      organization_id: org.id,
      plan_id: plan.id,
      status: "active",
      renews_at: "2026-05-15",
    });
  }

  void proPaulo;
  console.log("Seed fictício concluído com sucesso!");
  console.log("Senha padrão:", password);
  console.log("Pacientes: maria.paciente@lumina.dev, joao.paciente@lumina.dev, carla.paciente@lumina.dev");
  console.log("Profissional: ana.profissional@lumina.dev, paulo.profissional@lumina.dev");
  console.log("Admin: admin.ficticio@lumina.dev");
}

main().catch((error) => {
  console.error("Erro no seed:", error);
  process.exit(1);
});
