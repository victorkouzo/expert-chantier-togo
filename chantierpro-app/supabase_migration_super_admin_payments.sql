-- Migration: Super-admin payments (sécurisation)
-- Remplace les policies précédentes qui autorisaient TOUT admin/directeur à
-- confirmer/rejeter les paiements. Désormais seul le super-admin
-- (victorkouzo@gmail.com) gère les paiements de toutes les entreprises.
--
-- À rejouer dans le SQL Editor Supabase APRÈS supabase_migration_phase_c.sql
-- et supabase_migration_admin_payments.sql.
--
-- ⚠️ L'email ci-dessous doit rester aligné avec NEXT_PUBLIC_SUPER_ADMIN_EMAIL
--    (src/lib/super-admin.ts) côté application.

-- 1. UPDATE : seul le super-admin peut confirmer/rejeter les paiements
drop policy if exists "payments_update" on payments;
create policy "payments_update" on payments for update using (
  auth.uid() in (
    select id from profiles where email = 'victorkouzo@gmail.com'
  )
);

-- 2. SELECT : chaque entreprise voit ses paiements ; le super-admin voit tout
drop policy if exists "payments_select" on payments;
create policy "payments_select" on payments for select using (
  company_id in (select company_id from profiles where id = auth.uid())
  or auth.uid() in (select id from profiles where email = 'victorkouzo@gmail.com')
);

-- 3. INSERT : inchangé — chaque entreprise crée ses propres demandes (rappel)
drop policy if exists "payments_insert" on payments;
create policy "payments_insert" on payments for insert with check (
  company_id in (select company_id from profiles where id = auth.uid())
);

-- Done!
