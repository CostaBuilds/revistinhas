-- ══════════════════════════════════════════════════
--  Revistinhas — Schema Supabase
--  Cole este SQL no SQL Editor do Supabase
-- ══════════════════════════════════════════════════

create table if not exists comics (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now() not null,
  title         text not null,
  series        text,
  issue_number  int,
  volume        int,
  publisher     text,
  year          int,
  condition     text check (condition in ('mint','near_mint','very_fine','fine','very_good','good','fair','poor')),
  purchase_price numeric(10,2),
  current_value  numeric(10,2),
  owner         text not null check (owner in ('marcelo','walter','ambos')),
  cover_url     text,
  notes         text,
  read          boolean default false,
  language      text default 'pt'
);

create table if not exists wishlist_items (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now() not null,
  title          text not null,
  series         text,
  issue_number   int,
  volume         int,
  publisher      text,
  priority       text check (priority in ('alta','media','baixa')),
  notes          text,
  owner          text not null check (owner in ('marcelo','walter','ambos')),
  estimated_price numeric(10,2)
);

create table if not exists goals (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz default now() not null,
  title            text not null,
  description      text,
  target_date      date,
  completed        boolean default false,
  owner            text not null check (owner in ('marcelo','walter','ambos')),
  type             text check (type in ('serie','quantidade','valor','outro')),
  progress_current int default 0,
  progress_target  int default 0
);

create table if not exists eventos (
  id         uuid primary key default gen_random_uuid(),
  titulo     text not null,
  data       date not null,
  tipo       text check (tipo in ('lancamento','pre_venda','saldao','evento','feira','sorteio')),
  descricao  text,
  local      text,
  created_by text not null default 'marcelo' check (created_by in ('marcelo','walter'))
);

create table if not exists collections (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now() not null,
  name          text not null,
  publisher     text,
  cover_url     text,
  total_volumes int default 1 not null,
  created_by    text not null check (created_by in ('marcelo','walter','ambos')),
  description   text
);

-- ── Desabilitar RLS (app pessoal, 2 usuários) ─────────────────────
alter table comics          disable row level security;
alter table wishlist_items  disable row level security;
alter table goals           disable row level security;
alter table eventos         disable row level security;
alter table collections     disable row level security;

-- ══════════════════════════════════════════════════
--  Usuários de autenticação (fazer no dashboard):
--  Authentication → Users → Add user
--    Email: marcelo@revistinhas.app  Senha: (escolha)
--    Email: walter@revistinhas.app   Senha: (escolha)
-- ══════════════════════════════════════════════════
