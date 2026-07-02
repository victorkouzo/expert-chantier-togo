# ChantierPro BTP — Context

## Stack
- Next.js 15 (App Router, Server Actions)
- TypeScript strict
- Tailwind CSS 4
- Supabase (Auth + Postgres + RLS + Storage)
- Zod for validation
- lucide-react for icons
- recharts for dashboard charts
- jsPDF for PDF export
- SheetJS (xlsx) for Excel export

## Structure
```
src/
  app/(auth)/            — login, register
  app/(dashboard)/       — all authenticated pages
    dashboard/           — advanced dashboard with charts
    chantiers/           — list, create, detail [id], status update
    rapports/            — list, create (with photos), detail [id], PDF export
    depenses/            — list, create, Excel export
    equipes/             — list, create, detail [id], member management
    planning/            — Kanban board, task CRUD, progress tracking
    documents/           — file management (upload, categorize, download)
    notifications/       — list, mark read/unread
    profil/              — profile edit, password change
  app/api/auth/          — Supabase auth callback
  components/
    ui/                  — Button, Input, Select, Textarea, Card
    dashboard/           — ExpenseChart, StatusChart, TaskProgressChart
    sidebar.tsx          — main navigation
    photo-upload.tsx     — reusable photo upload with Supabase Storage
    export-excel-button.tsx — Excel export for expenses
  lib/supabase/          — client.ts, server.ts, middleware.ts
  types/                 — database.ts (all entity types)
```

## Conventions
- Server Actions with Zod validation in `actions.ts` per module
- `createClient()` from `@/lib/supabase/server` in Server Components
- `createClient()` from `@/lib/supabase/client` in Client Components
- `useActionState` for form submissions (state, formData signature)
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
See `supabase_schema.sql` — tables:
profiles, chantiers, daily_reports, expenses, teams, team_members, tasks, notifications, documents

## Storage Buckets (create in Supabase dashboard)
- `chantier-photos` (public) — report photos
- `chantier-documents` (private) — contracts, plans, permits, invoices

## SaaS Phases (A–E)
- **A** Multi-tenant + RBAC: `companies`, `company_id` scoping, 6 roles, RLS. Helper `src/lib/auth.ts` (`requireSession`, `requireRole`, `Role`).
- **B** Detailed reports (trade details + signature canvas), attendance (`/presences`), receipt upload on expenses, role-based dashboard.
- **C** Subscriptions: `src/lib/plans.ts` (starter/pro/entreprise), `src/lib/billing.ts` (limits), `/tarifs` (public), `/abonnement` (in-app, mobile money). `payments` table.
- **D** AI via Claude API: `src/lib/anthropic.ts` (model claude-haiku-4-5), `/assistant` (chat + report gen), `/api/ai/chat`, `/api/ai/report`. Deterministic alerts in `src/lib/alerts.ts`. Gated to `entreprise` plan.
- **E** Notifications: `src/lib/notifications/` (channels: email=Resend, whatsapp=Meta Cloud, sms=generic HTTP; dispatch + templates). Settings in `/parametres`. Cron digest `/api/notifications/digest` (daily 07:00 via vercel.json crons).

## SQL Migrations (run in order in Supabase SQL Editor)
`supabase_schema.sql` → `supabase_migration_phase_a.sql` → `_phase_b.sql` → `_phase_c.sql` → `supabase_migration_super_admin_payments.sql` → `supabase_migration_fix_payments_fk.sql`

> `supabase_migration_admin_payments.sql` est OBSOLÈTE (faille auto-confirmation), remplacé par `_super_admin_payments.sql` : seul le super-admin (`NEXT_PUBLIC_SUPER_ADMIN_EMAIL`) confirme/voit tous les paiements.

## Deployment
- Vercel: `vercel.json` configured for CDG1 region (Paris), daily cron for alert digest
- Env vars: see `.env.example` (Supabase required; ANTHROPIC_API_KEY for AI; RESEND/WHATSAPP/SMS optional per channel)
