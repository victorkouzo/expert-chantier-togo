-- Migration: Fix FK payments.requested_by + visibilité super-admin
-- (déjà appliquée sur la base via MCP le 2026-07-02 — conservée pour trace)
--
-- 1. La page /admin/paiements fait l'embed PostgREST profiles:requested_by(...),
--    qui exige une FK payments.requested_by -> profiles. Elle pointait vers
--    auth.users, ce qui faisait échouer toute la requête (page vide, 0 partout).
alter table payments drop constraint payments_requested_by_fkey;
alter table payments
  add constraint payments_requested_by_fkey
  foreign key (requested_by) references profiles(id);

-- 2. Le super-admin doit voir les noms des entreprises et des demandeurs de
--    toutes les entreprises sur /admin/paiements. On utilise l'email du JWT
--    (pas de sous-requête sur profiles => pas de récursion RLS).
--    ⚠️ Email à garder aligné avec NEXT_PUBLIC_SUPER_ADMIN_EMAIL (src/lib/super-admin.ts).
drop policy if exists "super_admin_select_profiles" on profiles;
create policy "super_admin_select_profiles" on profiles for select using (
  (auth.jwt() ->> 'email') = 'victorkouzo@gmail.com'
);

drop policy if exists "super_admin_select_companies" on companies;
create policy "super_admin_select_companies" on companies for select using (
  (auth.jwt() ->> 'email') = 'victorkouzo@gmail.com'
);

-- Done!
