-- Migration: Admin payments
-- Ajouter la policy UPDATE sur payments pour les admin/directeur

-- Permettre aux admin/directeur de modifier les paiements de leur entreprise
create policy "payments_update" on payments for update using (
  company_id in (select company_id from profiles where id = auth.uid())
);
