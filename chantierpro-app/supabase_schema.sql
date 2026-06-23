-- ChantierPro BTP — Supabase Schema
-- Execute in Supabase SQL Editor

-- Profiles (auto-created on signup via trigger)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  role text not null default 'chef_chantier' check (role in ('admin','chef_chantier','conducteur_travaux','ouvrier','client')),
  phone text,
  company text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'chef_chantier'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Chantiers
create table if not exists public.chantiers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  address text not null,
  city text not null default 'Lomé',
  status text not null default 'planifie' check (status in ('planifie','en_cours','suspendu','termine','annule')),
  budget numeric not null default 0,
  start_date date not null,
  end_date date,
  owner_id uuid references public.profiles(id) not null,
  created_at timestamptz default now()
);

alter table public.chantiers enable row level security;
create policy "Owner can CRUD own chantiers" on public.chantiers for all using (auth.uid() = owner_id);

-- Daily Reports
create table if not exists public.daily_reports (
  id uuid default gen_random_uuid() primary key,
  chantier_id uuid references public.chantiers(id) on delete cascade not null,
  author_id uuid references public.profiles(id) not null,
  report_date date not null,
  weather text not null default 'soleil' check (weather in ('soleil','nuageux','pluie','orage')),
  temperature numeric,
  summary text not null,
  workers_present integer not null default 0,
  tasks_completed text not null default '',
  issues text,
  photos text[] default '{}',
  signature_url text,
  created_at timestamptz default now()
);

alter table public.daily_reports enable row level security;
create policy "Author can CRUD own reports" on public.daily_reports for all using (auth.uid() = author_id);

-- Expenses
create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  chantier_id uuid references public.chantiers(id) on delete cascade not null,
  author_id uuid references public.profiles(id) not null,
  category text not null check (category in ('materiaux','main_oeuvre','transport','location_engin','autre')),
  description text not null,
  amount numeric not null,
  receipt_url text,
  expense_date date not null,
  created_at timestamptz default now()
);

alter table public.expenses enable row level security;
create policy "Author can CRUD own expenses" on public.expenses for all using (auth.uid() = author_id);

-- Teams
create table if not exists public.teams (
  id uuid default gen_random_uuid() primary key,
  chantier_id uuid references public.chantiers(id) on delete cascade not null,
  name text not null,
  specialty text not null default 'general' check (specialty in ('general','maconnerie','electricite','plomberie','peinture','charpente','ferraillage','coffrage','finition','autre')),
  created_at timestamptz default now()
);

alter table public.teams enable row level security;
create policy "Chantier owner can manage teams" on public.teams for all
  using (exists (select 1 from public.chantiers where id = chantier_id and owner_id = auth.uid()));

-- Team members
create table if not exists public.team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  full_name text not null,
  role text not null default 'ouvrier' check (role in ('chef_equipe','ouvrier','apprenti','manoeuvre')),
  phone text,
  daily_rate numeric default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.team_members enable row level security;
create policy "Team owner can manage members" on public.team_members for all
  using (exists (
    select 1 from public.teams t
    join public.chantiers c on c.id = t.chantier_id
    where t.id = team_id and c.owner_id = auth.uid()
  ));

-- Tasks (planning)
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  chantier_id uuid references public.chantiers(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'a_faire' check (status in ('a_faire','en_cours','termine','bloque')),
  priority text not null default 'normale' check (priority in ('basse','normale','haute','urgente')),
  assigned_team_id uuid references public.teams(id),
  start_date date,
  end_date date,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  created_at timestamptz default now()
);

alter table public.tasks enable row level security;
create policy "Chantier owner can manage tasks" on public.tasks for all
  using (exists (select 1 from public.chantiers where id = chantier_id and owner_id = auth.uid()));

-- Notifications
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info','warning','success','error')),
  is_read boolean default false,
  link text,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "User can read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "User can update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- Documents
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  chantier_id uuid references public.chantiers(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id) not null,
  name text not null,
  description text,
  category text not null default 'autre' check (category in ('contrat','plan','permis','facture','pv_reception','rapport_inspection','photo','autre')),
  file_url text not null,
  file_size integer default 0,
  file_type text,
  created_at timestamptz default now()
);

alter table public.documents enable row level security;
create policy "Chantier owner can manage documents" on public.documents for all
  using (exists (select 1 from public.chantiers where id = chantier_id and owner_id = auth.uid()));

-- Supabase Storage buckets (create manually in dashboard)
-- 1. chantier-photos (public)
-- 2. chantier-documents (private)
