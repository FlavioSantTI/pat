<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- Install with `npm ci`. The environment `start` script writes a gitignored `.env.local` (if missing) and runs `npm run dev` on port 3000. Reuse that server. Open it at `http://localhost:3000`. Turbopack's HMR socket fails on `127.0.0.1`, and the login page then does not hydrate, so the demo buttons do nothing.
- The dev server and `npm test` use the hosted Supabase project already referenced in `src/lib/domain/rls-security.test.ts`. Demo accounts (password in `.env.example` as `LUMINA_SEED_PASSWORD`): `maria.paciente@lumina.dev` → `/hoje`, `ana.profissional@lumina.dev` → `/dashboard`, `admin.ficticio@lumina.dev` → `/admin`. Quick-fill buttons on `/login` enter those credentials.
- `SUPABASE_SERVICE_ROLE_KEY` is only required by `supabase/seed/seed.mjs`. The app and the Vitest suite do not need it.
- Checks: `npm run lint` (currently reports existing React hook and unescaped-entity errors in patient timer components), `npx tsc --noEmit`, `npm test` (includes remote RLS; `npm run test:fast` skips that file), `npm run build`, `npm run test:e2e`. Playwright Chromium is installed with `npx playwright install chromium`; the e2e config reuses a server already on port 3000.
