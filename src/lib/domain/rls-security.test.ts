import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://itjkzrnsppwcrwgnazdd.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_mOcrIesivGaB61SiyiTZ9Q_QA-w6IX3";
const PASSWORD = process.env.LUMINA_SEED_PASSWORD || "LuminaDev!2026";

describe("RLS Matrix Security Tests (Section 22 do PROMPT MESTRE)", () => {
  let adminClient: SupabaseClient;
  let proAnaClient: SupabaseClient;
  let patientMariaClient: SupabaseClient;
  let patientJoaoClient: SupabaseClient;

  let mariaPatientId: string;

  beforeAll(async () => {
    adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    proAnaClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    patientMariaClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    patientJoaoClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });

    const [adminAuth, anaAuth, mariaAuth, joaoAuth] = await Promise.all([
      adminClient.auth.signInWithPassword({
        email: "admin.ficticio@lumina.dev",
        password: PASSWORD,
      }),
      proAnaClient.auth.signInWithPassword({
        email: "ana.profissional@lumina.dev",
        password: PASSWORD,
      }),
      patientMariaClient.auth.signInWithPassword({
        email: "maria.paciente@lumina.dev",
        password: PASSWORD,
      }),
      patientJoaoClient.auth.signInWithPassword({
        email: "joao.paciente@lumina.dev",
        password: PASSWORD,
      }),
    ]);

    expect(adminAuth.error).toBeNull();
    expect(anaAuth.error).toBeNull();
    expect(mariaAuth.error).toBeNull();
    expect(joaoAuth.error).toBeNull();

    // Retrieve Maria's patient record ID
    const { data: mariaPatient } = await patientMariaClient
      .from("patients")
      .select("id")
      .single();
    expect(mariaPatient?.id).toBeDefined();
    mariaPatientId = mariaPatient!.id;
  }, 15000);


  // Teste 1: Admin tenta acessar D/P/A (activity_assessments)
  it("Teste 1: Admin tenta acessar D/P/A (activity_assessments) -> NEGADO (RLS retorna 0 linhas)", async () => {
    const { data, error } = await adminClient
      .from("activity_assessments")
      .select("*");

    expect(error).toBeNull();
    expect(data).toHaveLength(0); // RLS silently filters out all rows for non-clinical roles
  });

  // Teste 2: Admin tenta acessar notas profissionais
  it("Teste 2: Admin tenta acessar notas profissionais -> NEGADO (RLS retorna 0 linhas)", async () => {
    const { data, error } = await adminClient
      .from("professional_notes")
      .select("*");

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  // Teste 3: Admin tenta acessar pequenos ganhos
  it("Teste 3: Admin tenta acessar pequenos ganhos (gains) -> NEGADO (RLS retorna 0 linhas)", async () => {
    const { data, error } = await adminClient
      .from("gains")
      .select("*");

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  // Teste 4: Paciente B tenta acessar atribuições de Paciente A
  it("Teste 4: Paciente B tenta acessar atribuições do Paciente A -> NEGADO (RLS retorna 0 linhas)", async () => {
    const { data, error } = await patientJoaoClient
      .from("activity_assignments")
      .select("*")
      .eq("patient_id", mariaPatientId);

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  // Teste 5: Paciente tenta criar nota profissional
  it("Teste 5: Paciente tenta criar nota profissional -> NEGADO (RLS policy nega inserção)", async () => {
    const { error } = await patientMariaClient
      .from("professional_notes")
      .insert({
        patient_id: mariaPatientId,
        content: "Tentativa indevida de criar nota clínica como paciente",
      });

    expect(error).not.toBeNull();
  });

  // Teste 6: Paciente acessa seus próprios dados e atividades
  it("Teste 6: Paciente acessa suas próprias atividades -> PERMITIDO", async () => {
    const { data, error } = await patientMariaClient
      .from("activity_assignments")
      .select("id, status, scheduled_date")
      .eq("patient_id", mariaPatientId);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  // Teste 7: Profissional vinculado acessa atividades e registros do seu paciente
  it("Teste 7: Profissional vinculado acessa atividades do paciente -> PERMITIDO", async () => {
    const { data, error } = await proAnaClient
      .from("activity_assignments")
      .select("id, status")
      .eq("patient_id", mariaPatientId);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  // Teste 8: Profissional vinculado cria nota clínica para seu paciente
  it("Teste 8: Profissional vinculado cria nota clínica confidencial -> PERMITIDO", async () => {
    const { data: userData } = await proAnaClient.auth.getUser();
    const { data: proRecord } = await proAnaClient
      .from("professionals")
      .select("id")
      .eq("user_id", userData.user!.id)
      .single();

    expect(proRecord?.id).toBeDefined();

    const { data, error } = await proAnaClient
      .from("professional_notes")
      .insert({
        patient_id: mariaPatientId,
        professional_id: proRecord!.id,
        content: "Nota clínica de validação automatizada RLS",
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.content).toBe("Nota clínica de validação automatizada RLS");
  });
});
