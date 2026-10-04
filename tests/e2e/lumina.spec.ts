import { test, expect } from "@playwright/test";

test.describe("Lumina - Plataforma de Acompanhamento Terapêutico (E2E Suite)", () => {
  test("1. Login e redirecionamento de Maria Silva (Paciente) para /hoje", async ({ page }) => {
    await page.goto("/login");

    // Check title and branding
    await expect(page).toHaveTitle(/Lumina/);
    await expect(page.getByText("Acompanhamento terapêutico e desenvolvimento de habilidades")).toBeVisible();

    // Use fast demo button for Patient
    const demoPatientBtn = page.getByRole("button", { name: "Paciente", exact: true });
    await expect(demoPatientBtn).toBeVisible();
    await demoPatientBtn.click();

    // Verify fields populated
    await expect(page.locator("input[name='email']")).toHaveValue("maria.paciente@lumina.dev");

    // Click submit
    const submitBtn = page.getByRole("button", { name: "Entrar na plataforma" });
    await submitBtn.click();

    // Verify redirected to /hoje
    await page.waitForURL("**/hoje", { timeout: 20000 });
    await expect(page).toHaveURL(/.*\/hoje/);
    await expect(page.getByRole("heading", { name: /Olá, Maria/i })).toBeVisible();
  });

  test("2. Navegação do Paciente: Agenda, Progresso e Perfil", async ({ page }) => {
    // Log in as patient
    await page.goto("/login");
    await page.getByRole("button", { name: "Paciente", exact: true }).click();
    await page.getByRole("button", { name: "Entrar na plataforma" }).click();
    await page.waitForURL("**/hoje", { timeout: 20000 });

    // Navigate to Agenda
    await page.goto("/agenda");
    await expect(page.getByRole("heading", { name: "Agenda Terapêutica" })).toBeVisible();

    // Navigate to Progresso
    await page.goto("/progresso");
    await expect(page.getByRole("heading", { name: /Progresso Terapêutico/i })).toBeVisible();

    // Navigate to Perfil / Meu Espaço
    await page.goto("/perfil");
    await expect(page.getByRole("heading", { name: "Meu Espaço" })).toBeVisible();
  });

  test("3. Login e Portal do Profissional (Dra. Ana)", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Terapeuta", exact: true }).click();
    await page.getByRole("button", { name: "Entrar na plataforma" }).click();

    // Verify redirected to /dashboard
    await page.waitForURL("**/dashboard", { timeout: 20000 });
    await expect(page.getByText("Portal Clínico")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Olá, Dra. Ana" })).toBeVisible();

    // Navigate to Programs library
    await page.goto("/programas");
    await expect(page.getByRole("heading", { name: "Programas & Biblioteca de Atividades" })).toBeVisible();

    // Navigate to Weekly reviews
    await page.goto("/revisoes");
    await expect(page.getByRole("heading", { name: "Revisões Semanais dos Pacientes" })).toBeVisible();
  });

  test("4. Login e Portal Administrativo Operacional (Sem vazamento clínico)", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Admin", exact: true }).click();
    await page.getByRole("button", { name: "Entrar na plataforma" }).click();

    // Verify redirected to /admin
    await page.waitForURL("**/admin", { timeout: 20000 });
    await expect(page.getByRole("heading", { name: "Painel Operacional" })).toBeVisible();
    await expect(page.getByText("Isolamento Clínico Ativo (RLS)")).toBeVisible();

    // Verify Users & Organizations page
    await page.goto("/admin/usuarios");
    await expect(page.getByRole("heading", { name: "Usuários & Organizações" })).toBeVisible();

    // Verify Plans & Subscriptions page
    await page.goto("/admin/planos");
    await expect(page.getByRole("heading", { name: "Planos & Assinaturas" })).toBeVisible();

    // Verify Support & Audit trail
    await page.goto("/admin/suporte");
    await expect(page.getByRole("heading", { name: "Suporte Técnico & Logs de Auditoria" })).toBeVisible();
  });
});
