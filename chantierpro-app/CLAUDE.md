# ChantierPro BTP — Context

## Stack
- Next.js 15 (App Router, Server Actions)
- TypeScript strict
- Tailwind CSS 4
- Supabase (Auth + Postgres + RLS + Storage)
- Zod for validation
- lucide-react for icons

## Structure
```
src/
  app/(auth)/        — login, register
  app/(dashboard)/   — dashboard, chantiers, rapports, depenses
  app/api/auth/      — Supabase auth callback
  components/ui/     — Button, Input, Select, Textarea, Card
  lib/supabase/      — client.ts, server.ts, middleware.ts
  types/             — database.ts
```

## Conventions
- Server Actions with Zod validation in `actions.ts` per module
- `createClient()` from `@/lib/supabase/server` in Server Components
- `createClient()` from `@/lib/supabase/client` in Client Components
- RLS enforced — always filter by auth.uid()
- Currency: FCFA, locale fr-FR
- UI: dark theme (bg-black/zinc-900), green-400 accent

## Commands
```bash
npm run dev    # dev server
npm run build  # production build
npm run lint   # ESLint
```

## Database
See `supabase_schema.sql` — tables: profiles, chantiers, daily_reports, expenses
