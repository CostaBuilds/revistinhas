-- Execute este SQL no Supabase SQL Editor para criar as tabelas

create table if not exists comics (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  title text not null,
  series text,
  issue_number integer,
  volume integer,
  publisher text,
  year integer,
  condition text check (condition in ('mint','near_mint','very_fine','fine','very_good','good','fair','poor')),
  purchase_price decimal(10,2),
  current_value decimal(10,2),
  owner text check (owner in ('marcelo','walter','ambos')) not null default 'marcelo',
  cover_url text,
  notes text,
  read boolean not null default false,
  language text not null default 'pt'
);

create table if not exists wishlist (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  title text not null,
  series text,
  issue_number integer,
  volume integer,
  publisher text,
  priority text check (priority in ('alta','media','baixa')) not null default 'media',
  notes text,
  owner text check (owner in ('marcelo','walter','ambos')) not null default 'marcelo',
  estimated_price decimal(10,2)
);

create table if not exists goals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  title text not null,
  description text,
  target_date date,
  completed boolean not null default false,
  owner text check (owner in ('marcelo','walter','ambos')) not null default 'ambos',
  type text check (type in ('serie','quantidade','valor','outro')) not null default 'outro',
  progress_current decimal(10,2),
  progress_target decimal(10,2)
);

-- Habilitar Row Level Security (opcional, mas recomendado)
alter table comics enable row level security;
alter table wishlist enable row level security;
alter table goals enable row level security;

-- Política pública (sem autenticação — acesso livre)
create policy "public read" on comics for select using (true);
create policy "public write" on comics for all using (true);
create policy "public read" on wishlist for select using (true);
create policy "public write" on wishlist for all using (true);
create policy "public read" on goals for select using (true);
create policy "public write" on goals for all using (true);
