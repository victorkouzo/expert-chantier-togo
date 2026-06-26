-- Migration: Admin payments
-- ⚠️ OBSOLÈTE / NON SÉCURISÉ : cette policy autorise TOUT admin/directeur à
--    confirmer les paiements de SA propre entreprise (auto-confirmation possible).
--    Remplacée par supabase_migration_super_admin_payments.sql (super-admin only).
--    Conservé pour l'historique ; ne pas rejouer seul.
--
-- Ajouter la policy UPDATE sur payments pour les admin/directeur

-- Permettre aux admin/directeur de modifier les paiements de leur entreprise
create policy "payments_update" on payments for update using (
  company_id in (select company_id from profiles where id = auth.uid())
);
