-- Phase B Migration: Detailed reports, attendance, receipt uploads
-- Run this in Supabase SQL Editor

set check_function_bodies = off;

-- 1. Add trade/specialty detail fields to daily_reports
alter table daily_reports add column if not exists trade_details jsonb default '[]'::jsonb;
-- trade_details stores: [{ "trade": "maconnerie", "workers": 3, "description": "Coulage fondation", "progress": 60 }, ...]
alter table daily_reports add column if not exists signature_data text;
-- base64 signature from canvas

-- 2. Create attendance table
create table if not exists attendances (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  chantier_id uuid references chantiers(id) on delete cascade not null,
  team_member_id uuid references team_members(id) on delete cascade not null,
  attendance_date date not null default current_date,
  status text not null default 'present' check (status in ('present', 'absent', 'retard', 'demi_journee')),
  hours_worked numeric(4,1) default 8,
  note text,
  recorded_by uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  unique(team_member_id, attendance_date)
);

-- RLS for attendances
alter table attendances enable row level security;

drop policy if exists "attendance_select" on attendances;
create policy "attendance_select" on attendances for select using (
  company_id in (select company_id from profiles where id = auth.uid())
);

drop policy if exists "attendance_insert" on attendances;
create policy "attendance_insert" on attendances for insert with check (
  company_id in (select company_id from profiles where id = auth.uid())
);

drop policy if exists "attendance_update" on attendances;
create policy "attendance_update" on attendances for update using (
  company_id in (select company_id from profiles where id = auth.uid())
);

drop policy if exists "attendance_delete" on attendances;
create policy "attendance_delete" on attendances for delete using (
  company_id in (select company_id from profiles where id = auth.uid())
);

-- 3. Add receipt_url to expenses (already exists in type but ensure column exists)
-- The column may already exist from initial schema
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'expenses' and column_name = 'receipt_url') then
    alter table expenses add column receipt_url text;
  end if;
end $$;

-- Done! Phase B schema ready.
