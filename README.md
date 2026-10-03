# Lumina

PWA de acompanhamento terapêutico (Next.js + Supabase). Sem gamificação e sem IA no MVP.

## Setup

1. Copie `.env.example` para `.env.local` e preencha as chaves do projeto Supabase existente.
2. Aplique as migrations em `supabase/migrations` no SQL editor ou com a CLI.
3. Rode o seed operacional: `psql`/`supabase db query` em `supabase/seed/001_plans.sql`.
4. Rode o seed fictício: `node --env-file=.env.local supabase/seed/seed.mjs`.
5. `npm run dev`

A `SUPABASE_SERVICE_ROLE_KEY` nunca vai para o cliente. Use-a só em scripts server-side.

## Testes

- `npm test` — regras de domínio e suíte RLS (pulada sem credenciais).
- `npx playwright test` — fluxos E2E.

## Papéis

- Paciente: `/hoje`
- Profissional: `/dashboard`
- Admin: `/admin` (sem acesso a dados terapêuticos)
