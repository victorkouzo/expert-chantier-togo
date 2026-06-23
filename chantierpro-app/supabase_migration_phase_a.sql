-- ChantierPro BTP — Migration Phase A
-- Multi-tenancy + RBAC + champs chantier manquants
-- À exécuter dans Supabase SQL Editor APRÈS supabase_schema.sql

-- =============================================
-- 1. COMPANIES (entreprises = locataires SaaS)
-- =============================================
create table if not exists public.companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  logo_url text,
  address text,
  city text default 'Lomé',
  phone text,
  email text,
  plan text not null default 'starter' check (plan in ('starter', 'pro', 'business')),
  max_chantiers integer not null default 1,
  max_users integer not null default 5,
  created_at timestamptz default now()
);

alter table public.companies enable row level security;

drop policy if exists "Members can view their company" on public.companies;
create policy "Members can view their company" on public.companies for select
  using (id in (select company_id from public.profiles where id = auth.uid()));

drop policy if exists "Directeur can update company" on public.companies;
create policy "Directeur can update company" on public.companies for update
  using (id in (select company_id from public.profiles where id = auth.uid() and role in ('admin', 'directeur')));

-- =============================================
-- 2. PROFILES — ajout company_id
-- =============================================
alter table public.profiles add column if not exists company_id uuid references public.companies(id);

-- Étendre le check des rôles pour inclure 'directeur'
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin', 'directeur', 'conducteur_travaux', 'chef_chantier', 'ouvrier', 'client'));

-- Permettre aux membres de voir les autres profils de leur entreprise
drop policy if exists "Members can view team profiles" on public.profiles;
create policy "Members can view team profiles" on public.profiles for select
  using (
    auth.uid() = id
    or company_id in (select company_id from public.profiles where id = auth.uid())
  );

drop policy if exists "Directeur can update team profiles" on public.profiles;
create policy "Directeur can update team profiles" on public.profiles for update
  using (
    auth.uid() = id
    or company_id in (select company_id from public.profiles where id = auth.uid() and role in ('admin', 'directeur'))
  );

-- =============================================
-- 3. CLIENTS (maîtres d'ouvrage)
-- =============================================
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  city text default 'Lomé',
  notes text,
  created_at timestamptz default now()
);

alter table public.clients enable row level security;
drop policy if exists "Company members can view clients" on public.clients;
create policy "Company members can view clients" on public.clients for select
  using (company_id in (select company_id from public.profiles where id = auth.uid()));

drop policy if exists "Authorized can manage clients" on public.clients;
create policy "Authorized can manage clients" on public.clients for all
  using (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid() and role in ('admin', 'directeur', 'conducteur_travaux')
    )
  );

-- =============================================
-- 4. CHANTIERS — nouveaux champs
-- =============================================
alter table public.chantiers add column if not exists company_id uuid references public.companies(id);
alter table public.chantiers add column if not exists reference text;
alter table public.chantiers add column if not exists client_id uuid references public.clients(id);
alter table public.chantiers add column if not exists latitude numeric;
alter table public.chantiers add column if not exists longitude numeric;

-- Replace RLS by company-scoped + role-based
drop policy if exists "Owner can CRUD own chantiers" on public.chantiers;

create policy "Company members can view chantiers" on public.chantiers for select
  using (company_id in (select company_id from public.profiles where id = auth.uid()));

create policy "Conducteur can create chantiers" on public.chantiers for insert
  with check (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid() and role in ('admin', 'directeur', 'conducteur_travaux')
    )
  );

create policy "Conducteur can update chantiers" on public.chantiers for update
  using (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid() and role in ('admin', 'directeur', 'conducteur_travaux')
    )
  );

create policy "Directeur can delete chantiers" on public.chantiers for delete
  using (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid() and role in ('admin', 'directeur')
    )
  );

-- =============================================
-- 5. INVITATIONS (inviter par email)
-- =============================================
create table if not exists public.invitations (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  email text not null,
  role text not null check (role in ('directeur', 'conducteur_travaux', 'chef_chantier', 'ouvrier', 'client')),
  invited_by uuid references public.profiles(id) not null,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

alter table public.invitations enable row level security;
drop policy if exists "Company managers can manage invitations" on public.invitations;
create policy "Company managers can manage invitations" on public.invitations for all
  using (
    company_id in (
      select company_id from public.profiles
      where id = auth.uid() and role in ('admin', 'directeur', 'conducteur_travaux')
    )
  );

-- =============================================
-- 6. RLS sur autres tables — scope par entreprise via chantier
-- =============================================

-- daily_reports
drop policy if exists "Author can CRUD own reports" on public.daily_reports;
create policy "Company members can view reports" on public.daily_reports for select
  using (chantier_id in (
    select id from public.chantiers where company_id in (
      select company_id from public.profiles where id = auth.uid()
    )
  ));
create policy "Authorized can create reports" on public.daily_reports for insert
  with check (
    auth.uid() = author_id
    and chantier_id in (
      select id from public.chantiers where company_id in (
        select company_id from public.profiles
        where id = auth.uid() and role in ('admin', 'directeur', 'conducteur_travaux', 'chef_chantier')
      )
    )
  );
create policy "Author can update own reports" on public.daily_reports for update
  using (auth.uid() = author_id);
create policy "Author can delete own reports" on public.daily_reports for delete
  using (auth.uid() = author_id);

-- expenses
drop policy if exists "Author can CRUD own expenses" on public.expenses;
create policy "Company members can view expenses" on public.expenses for select
  using (chantier_id in (
    select id from public.chantiers where company_id in (
      select company_id from public.profiles where id = auth.uid()
    )
  ));
create policy "Authorized can manage expenses" on public.expenses for all
  using (
    chantier_id in (
      select id from public.chantiers where company_id in (
        select company_id from public.profiles
        where id = auth.uid() and role in ('admin', 'directeur', 'conducteur_travaux', 'chef_chantier')
      )
    )
  );

-- teams
drop policy if exists "Chantier owner can manage teams" on public.teams;
create policy "Company members can view teams" on public.teams for select
  using (chantier_id in (
    select id from public.chantiers where company_id in (
      select company_id from public.profiles where id = auth.uid()
    )
  ));
create policy "Authorized can manage teams" on public.teams for all
  using (
    chantier_id in (
      select id from public.chantiers where company_id in (
        select company_id from public.profiles
        where id = auth.uid() and role in ('admin', 'directeur', 'conducteur_travaux')
      )
    )
  );

-- team_members
drop policy if exists "Team owner can manage members" on public.team_members;
create policy "Company can view team members" on public.team_members for select
  using (team_id in (
    select t.id from public.teams t join public.chantiers c on c.id = t.chantier_id
    where c.company_id in (select company_id from public.profiles where id = auth.uid())
  ));
create policy "Authorized can manage team members" on public.team_members for all
  using (
    team_id in (
      select t.id from public.teams t join public.chantiers c on c.id = t.chantier_id
      where c.company_id in (
        select company_id from public.profiles
        where id = auth.uid() and role in ('admin', 'directeur', 'conducteur_travaux')
      )
    )
  );

-- tasks
drop policy if exists "Chantier owner can manage tasks" on public.tasks;
create policy "Company members can view tasks" on public.tasks for select
  using (chantier_id in (
    select id from public.chantiers where company_id in (
      select company_id from public.profiles where id = auth.uid()
    )
  ));
create policy "Authorized can manage tasks" on public.tasks for all
  using (
    chantier_id in (
      select id from public.chantiers where company_id in (
        select company_id from public.profiles
        where id = auth.uid() and role in ('admin', 'directeur', 'conducteur_travaux', 'chef_chantier')
      )
    )
  );

-- documents
drop policy if exists "Chantier owner can manage documents" on public.documents;
create policy "Company members can view documents" on public.documents for select
  using (chantier_id in (
    select id from public.chantiers where company_id in (
      select company_id from public.profiles where id = auth.uid()
    )
  ));
create policy "Authorized can manage documents" on public.documents for all
  using (
    chantier_id in (
      select id from public.chantiers where company_id in (
        select company_id from public.profiles
        where id = auth.uid() and role in ('admin', 'directeur', 'conducteur_travaux', 'chef_chantier')
      )
    )
  );

-- =============================================
-- 7. MIGRATION : utilisateurs existants → company
-- =============================================
do $$
declare
  p record;
  new_company_id uuid;
begin
  for p in select id, full_name, company from public.profiles where company_id is null loop
    insert into public.companies (name, plan, max_chantiers, max_users)
    values (coalesce(nullif(p.company, ''), nullif(p.full_name, '') || ' SARL', 'Mon entreprise'), 'starter', 1, 5)
    returning id into new_company_id;

    update public.profiles
      set company_id = new_company_id,
          role = case when role = 'chef_chantier' then 'directeur' else role end
      where id = p.id;

    update public.chantiers set company_id = new_company_id
      where owner_id = p.id and company_id is null;
  end loop;
end $$;

-- =============================================
-- 8. Trigger handle_new_user mis à jour
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_company_id uuid;
  signup_company_name text;
  signup_role text;
  invitation_token text;
begin
  signup_company_name := coalesce(
    new.raw_user_meta_data->>'company_name',
    nullif(new.raw_user_meta_data->>'full_name', '') || ' SARL',
    'Mon entreprise'
  );
  signup_role := coalesce(new.raw_user_meta_data->>'role', 'directeur');
  invitation_token := new.raw_user_meta_data->>'invitation_token';

  -- Si invitation : rattache à l'entreprise existante
  if invitation_token is not null then
    select company_id, role into new_company_id, signup_role
      from public.invitations
      where token = invitation_token and status = 'pending' and expires_at > now();

    if new_company_id is not null then
      update public.invitations set status = 'accepted' where token = invitation_token;
    end if;
  end if;

  -- Sinon crée une nouvelle entreprise (l'utilisateur devient directeur)
  if new_company_id is null then
    insert into public.companies (name, plan, max_chantiers, max_users)
    values (signup_company_name, 'starter', 1, 5)
    returning id into new_company_id;
    signup_role := 'directeur';
  end if;

  insert into public.profiles (id, email, full_name, role, phone, company_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    signup_role,
    new.raw_user_meta_data->>'phone',
    new_company_id
  );
  return new;
end;
$$ language plpgsql security definer;
