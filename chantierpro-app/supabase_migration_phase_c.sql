-- Phase C Migration: Abonnements et paiements
-- À exécuter dans le SQL Editor de Supabase

set check_function_bodies = off;

-- 1. Colonnes d'abonnement sur companies
alter table companies add column if not exists plan text not null default 'starter'
  check (plan in ('starter', 'pro', 'entreprise'));
alter table companies add column if not exists subscription_status text not null default 'active'
  check (subscription_status in ('active', 'past_due', 'canceled', 'trialing'));
alter table companies add column if not exists billing_cycle text default 'monthly'
  check (billing_cycle in ('monthly', 'yearly'));
alter table companies add column if not exists subscription_ends_at timestamptz;

-- 2. Table des demandes / historique de paiement
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  plan text not null check (plan in ('starter', 'pro', 'entreprise')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly')),
  amount numeric(12,2) not null,
  method text not null default 'mobile_money' check (method in ('mobile_money', 'card', 'bank_transfer', 'manual')),
  provider text,                    -- ex: 'flooz', 'tmoney', 'wave', 'orange_money'
  phone text,                       -- numéro mobile money
  reference text,                   -- référence de transaction
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  requested_by uuid references auth.users(id) not null,
  confirmed_at timestamptz,
  created_at timestamptz default now()
);

alter table payments enable row level security;

drop policy if exists "payments_select" on payments;
create policy "payments_select" on payments for select using (
  company_id in (select company_id from profiles where id = auth.uid())
);

drop policy if exists "payments_insert" on payments;
create policy "payments_insert" on payments for insert with check (
  company_id in (select company_id from profiles where id = auth.uid())
);

-- Done!
