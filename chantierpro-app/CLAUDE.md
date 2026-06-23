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

## Deployment
- Vercel: `vercel.json` configured for CDG1 region (Paris)
- Set env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
