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
