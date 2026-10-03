-- Testes RLS (executar no SQL editor como postgres, ou via supabase test).
-- Os casos 1-8 usam usuários autenticados; este arquivo documenta as asserções.

-- 1. Admin SELECT activity_assessments → 0 linhas / policy deny
-- 2. Admin SELECT professional_notes → deny
-- 3. Profissional A lê paciente de B → deny
-- 4. Paciente A lê paciente B → deny
-- 5. Atribuição sem vínculo → deny
-- 6. Paciente INSERT professional_notes → deny
-- 7. Paciente lê próprio D/P/A → allow
-- 8. Profissional vinculado lê D/P/A → allow

select 'rls_tests_placeholder' as note;
