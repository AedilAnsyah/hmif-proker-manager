-- Migration: 0001_init
-- Creates core tables: profiles, profile_private, periods, prokers, divisions, proker_roles
-- Plus enums, triggers, indexes

-- ENUMS
create type global_role   as enum ('admin','bph','member','external');
create type proker_status as enum ('planning','active','done');
create type proker_role   as enum ('sc','pic','ketupel','sekretaris','bendahara','koor','staff');
create type division_kind as enum ('sekretaris','bendahara','custom');
create type task_status   as enum ('belum_dimulai','on_progress','selesai');
create type finance_kind  as enum ('pemasukan','pengeluaran');

-- PENGGUNA
create table profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  username             text not null unique,
  full_name            text not null,
  global_role          global_role not null default 'member',
  angkatan             smallint,
  is_active            boolean not null default true,
  must_change_password boolean not null default true,
  created_by           uuid references profiles(id),
  created_at           timestamptz not null default now(),
  constraint username_normalized check (username = lower(regexp_replace(btrim(username), '\s+', ' ', 'g')))
);

create table profile_private (
  id  uuid primary key references profiles(id) on delete cascade,
  nim text not null unique
);

-- PERIODE & PROKER
create table periods (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  start_date date,
  end_date   date,
  is_current boolean not null default false
);
create unique index one_current_period on periods ((true)) where is_current;

create table prokers (
  id          uuid primary key default gen_random_uuid(),
  period_id   uuid not null references periods(id),
  name        text not null,
  description text,
  status      proker_status not null default 'planning',
  start_date  date,
  end_date    date,
  created_by  uuid references profiles(id),
  created_at  timestamptz not null default now()
);

create table divisions (
  id          uuid primary key default gen_random_uuid(),
  proker_id   uuid not null references prokers(id) on delete cascade,
  name        text not null,
  kind        division_kind not null default 'custom',
  description text,
  sort_order  int not null default 0,
  unique (id, proker_id)
);
create unique index one_builtin_division on divisions (proker_id, kind) where kind <> 'custom';

-- Trigger: setiap proker baru otomatis punya divisi Sekretaris & Bendahara
create function create_builtin_divisions() returns trigger language plpgsql as $$
begin
  insert into divisions (proker_id, name, kind, sort_order) values
    (new.id, 'Sekretaris', 'sekretaris', 0),
    (new.id, 'Bendahara',  'bendahara',  1);
  return new;
end $$;
create trigger trg_builtin_divisions after insert on prokers
  for each row execute function create_builtin_divisions();

-- ROLE PER PROKER
create table proker_roles (
  id          uuid primary key default gen_random_uuid(),
  proker_id   uuid not null references prokers(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        proker_role not null,
  division_id uuid,
  label       text,
  created_at  timestamptz not null default now(),
  foreign key (division_id, proker_id) references divisions(id, proker_id) on delete cascade,
  constraint division_rule check (
    (role in ('sc','pic','ketupel') and division_id is null) or
    (role in ('sekretaris','bendahara','koor','staff') and division_id is not null)
  )
);
create unique index proker_roles_unique on proker_roles
  (proker_id, user_id, role, coalesce(division_id, '00000000-0000-0000-0000-000000000000'));
create index on proker_roles (user_id);
create index on proker_roles (proker_id);
