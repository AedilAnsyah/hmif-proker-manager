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
-- Migration: 0002_rls_core
-- RLS policies and helper functions for core tables

-- HELPER FUNCTIONS (security definer, stable)
create function current_global_role() returns global_role
language sql stable security definer set search_path = public as $$
  select global_role from profiles where id = auth.uid() and is_active
$$;

create function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(current_global_role() = 'admin', false)
$$;

create function is_view_all() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(current_global_role() in ('admin','bph'), false)
$$;

create function has_proker_access(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_view_all() or exists (
    select 1 from proker_roles r join profiles u on u.id = r.user_id and u.is_active
    where r.proker_id = p and r.user_id = auth.uid())
$$;

create function is_proker_manager(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or exists (
    select 1 from proker_roles where proker_id = p and user_id = auth.uid()
      and role in ('sc','pic','ketupel'))
$$;

create function is_in_division(d uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from proker_roles where division_id = d and user_id = auth.uid())
$$;

create function can_manage_division(d uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or exists (
    select 1 from divisions v join proker_roles r on r.proker_id = v.proker_id and r.user_id = auth.uid()
    where v.id = d and (
       r.role in ('sc','pic','ketupel')
       or (r.role in ('koor','sekretaris','bendahara') and r.division_id = d)))
$$;

create function can_see_finance(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_view_all() or exists (
    select 1 from proker_roles where proker_id = p and user_id = auth.uid()
      and role in ('sc','pic','ketupel','bendahara'))
$$;

-- ENABLE RLS ON ALL TABLES
alter table profiles enable row level security;
alter table profile_private enable row level security;
alter table periods enable row level security;
alter table prokers enable row level security;
alter table divisions enable row level security;
alter table proker_roles enable row level security;

-- PROFILES
create policy profiles_select on profiles for select
  to authenticated using (true);

create policy profiles_insert on profiles for insert
  to authenticated with check (is_admin());

create policy profiles_update on profiles for update
  to authenticated using (is_admin() or id = auth.uid())
  with check (is_admin() or id = auth.uid());

-- PROFILE_PRIVATE (NIM — sangat terbatas)
create policy private_select on profile_private for select
  to authenticated using (is_admin() or id = auth.uid());

-- profile_private INSERT/UPDATE/DELETE hanya via service role (server action)

-- PERIODS
create policy periods_select on periods for select
  to authenticated using (true);

create policy periods_insert on periods for insert
  to authenticated with check (is_admin());

create policy periods_update on periods for update
  to authenticated using (is_admin())
  with check (is_admin());

create policy periods_delete on periods for delete
  to authenticated using (is_admin());

-- PROKERS
create policy prokers_select on prokers for select
  to authenticated using (has_proker_access(id));

create policy prokers_insert on prokers for insert
  to authenticated with check (is_admin());

create policy prokers_update on prokers for update
  to authenticated using (is_proker_manager(id))
  with check (is_proker_manager(id));

create policy prokers_delete on prokers for delete
  to authenticated using (is_admin());

-- DIVISIONS
create policy divisions_select on divisions for select
  to authenticated using (has_proker_access(proker_id));

create policy divisions_insert on divisions for insert
  to authenticated with check (is_proker_manager(proker_id));

create policy divisions_update on divisions for update
  to authenticated using (is_proker_manager(proker_id))
  with check (is_proker_manager(proker_id));

create policy divisions_delete on divisions for delete
  to authenticated using (is_proker_manager(proker_id));

-- PROKER_ROLES
create policy proker_roles_select on proker_roles for select
  to authenticated using (has_proker_access(proker_id));

create policy proker_roles_insert on proker_roles for insert
  to authenticated with check (is_proker_manager(proker_id));

create policy proker_roles_update on proker_roles for update
  to authenticated using (is_proker_manager(proker_id))
  with check (is_proker_manager(proker_id));

create policy proker_roles_delete on proker_roles for delete
  to authenticated using (is_proker_manager(proker_id));
-- Migration: 0003_jobdesks
-- Membuat tabel jobdesks dan policies RLS untuk jobdesks

create table jobdesks (
  id          uuid primary key default gen_random_uuid(),
  division_id uuid not null references divisions(id) on delete cascade,
  title       text not null,
  description text,
  sort_order  int not null default 0,
  created_by  uuid references profiles(id),
  created_at  timestamptz not null default now()
);

create index on jobdesks (division_id);

-- ENABLE RLS
alter table jobdesks enable row level security;

-- POLICIES:
-- SELECT: pengguna yang memiliki akses ke proker divisi terkait
create policy jobdesks_select on jobdesks for select
  to authenticated using (
    exists (
      select 1 from divisions d
      where d.id = jobdesks.division_id
        and has_proker_access(d.proker_id)
    )
  );

-- INSERT: manajer proker divisi terkait
create policy jobdesks_insert on jobdesks for insert
  to authenticated with check (
    exists (
      select 1 from divisions d
      where d.id = jobdesks.division_id
        and is_proker_manager(d.proker_id)
    )
  );

-- UPDATE: manajer proker divisi terkait
create policy jobdesks_update on jobdesks for update
  to authenticated using (
    exists (
      select 1 from divisions d
      where d.id = jobdesks.division_id
        and is_proker_manager(d.proker_id)
    )
  )
  with check (
    exists (
      select 1 from divisions d
      where d.id = jobdesks.division_id
        and is_proker_manager(d.proker_id)
    )
  );

-- DELETE: manajer proker divisi terkait
create policy jobdesks_delete on jobdesks for delete
  to authenticated using (
    exists (
      select 1 from divisions d
      where d.id = jobdesks.division_id
        and is_proker_manager(d.proker_id)
    )
  );
-- Migration: 0004_tasks
-- Membuat tabel tasks, task_assignees, task_checklist_items, task_links,
-- view division_progress, helper can_update_task_status, RPC set_task_status, dan policies RLS.

-- 1. TABEL UTAMA TASKS
create table tasks (
  id           uuid primary key default gen_random_uuid(),
  proker_id    uuid not null references prokers(id) on delete cascade,
  division_id  uuid not null,
  jobdesk_id   uuid references jobdesks(id) on delete set null,
  title        text not null,
  description  text,
  status       task_status not null default 'belum_dimulai',
  deadline     date,
  completed_at timestamptz,
  created_by   uuid references profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  foreign key (division_id, proker_id) references divisions(id, proker_id) on delete cascade
);

create index on tasks (proker_id, status);
create index on tasks (division_id);
create index on tasks (deadline) where status <> 'selesai';

-- 2. TABEL TASK ASSIGNEES (jika kosong = ditugaskan ke seluruh divisi)
create table task_assignees (
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  primary key (task_id, user_id)
);

create index on task_assignees (user_id);

-- 3. TABEL TASK CHECKLIST ITEMS
create table task_checklist_items (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references tasks(id) on delete cascade,
  text       text not null,
  is_done    boolean not null default false,
  sort_order int not null default 0
);

create index on task_checklist_items (task_id);

-- 4. TABEL TASK LINKS (lampiran tautan dokumen/drive)
create table task_links (
  id                uuid primary key default gen_random_uuid(),
  task_id           uuid not null references tasks(id) on delete cascade,
  checklist_item_id uuid references task_checklist_items(id) on delete cascade,
  label             text,
  url               text not null check (url ~* '^https?://'),
  added_by          uuid references profiles(id),
  created_at        timestamptz not null default now()
);

create index on task_links (task_id);

-- 5. VIEW PROGRESS DIVISI
create view division_progress with (security_invoker = true) as
select d.id as division_id, d.proker_id, d.name, d.kind,
       count(t.id)                                            as total,
       count(t.id) filter (where t.status = 'selesai')        as selesai,
       count(t.id) filter (where t.status = 'on_progress')    as on_progress,
       count(t.id) filter (where t.status = 'belum_dimulai')  as belum,
       count(t.id) filter (where t.deadline < current_date and t.status <> 'selesai') as terlambat
from divisions d left join tasks t on t.division_id = d.id
group by d.id;

-- 6. HELPER FUNCTION can_update_task_status
create function can_update_task_status(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from tasks k where k.id = t and (
      can_manage_division(k.division_id)
      or (is_in_division(k.division_id) and (
           not exists (select 1 from task_assignees a where a.task_id = k.id)
           or exists (select 1 from task_assignees a where a.task_id = k.id and a.user_id = auth.uid())
         ))
    )
  )
$$;

-- 7. RPC set_task_status (WAJIB DIGUNAKAN UNTUK UBAH STATUS)
create function set_task_status(p_task uuid, p_status task_status) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not can_update_task_status(p_task) then
    raise exception 'tidak berhak mengubah status task ini';
  end if;
  update tasks set status = p_status,
         completed_at = case when p_status = 'selesai' then now() else null end,
         updated_at = now()
   where id = p_task;
end $$;

grant execute on function set_task_status(uuid, task_status) to authenticated;

-- 8. POLICIES RLS

-- A. TASKS
alter table tasks enable row level security;

create policy tasks_select on tasks for select
  to authenticated using (has_proker_access(proker_id));

create policy tasks_insert on tasks for insert
  to authenticated with check (can_manage_division(division_id));

create policy tasks_update on tasks for update
  to authenticated using (can_manage_division(division_id))
  with check (can_manage_division(division_id));

create policy tasks_delete on tasks for delete
  to authenticated using (can_manage_division(division_id));

-- B. TASK_ASSIGNEES
alter table task_assignees enable row level security;

create policy task_assignees_select on task_assignees for select
  to authenticated using (
    exists (
      select 1 from tasks t where t.id = task_assignees.task_id and has_proker_access(t.proker_id)
    )
  );

create policy task_assignees_insert on task_assignees for insert
  to authenticated with check (
    exists (
      select 1 from tasks t where t.id = task_assignees.task_id and can_manage_division(t.division_id)
    )
  );

create policy task_assignees_delete on task_assignees for delete
  to authenticated using (
    exists (
      select 1 from tasks t where t.id = task_assignees.task_id and can_manage_division(t.division_id)
    )
  );

-- C. TASK_CHECKLIST_ITEMS
alter table task_checklist_items enable row level security;

create policy task_checklist_items_select on task_checklist_items for select
  to authenticated using (
    exists (
      select 1 from tasks t where t.id = task_checklist_items.task_id and has_proker_access(t.proker_id)
    )
  );

create policy task_checklist_items_insert on task_checklist_items for insert
  to authenticated with check (can_update_task_status(task_id));

create policy task_checklist_items_update on task_checklist_items for update
  to authenticated using (can_update_task_status(task_id))
  with check (can_update_task_status(task_id));

create policy task_checklist_items_delete on task_checklist_items for delete
  to authenticated using (can_update_task_status(task_id));

-- D. TASK_LINKS
alter table task_links enable row level security;

create policy task_links_select on task_links for select
  to authenticated using (
    exists (
      select 1 from tasks t where t.id = task_links.task_id and has_proker_access(t.proker_id)
    )
  );

create policy task_links_insert on task_links for insert
  to authenticated with check (can_update_task_status(task_id));

create policy task_links_delete on task_links for delete
  to authenticated using (can_update_task_status(task_id));
-- Seed data for development
-- Target: 1 Admin, 1 BPH, beberapa anggota HMIF, 1 periode aktif, proker contoh
-- Menggunakan RFC 4122 compliant UUID v4

create extension if not exists pgcrypto;

do $$
declare
  admin_id uuid := 'a0000000-0000-4000-8000-000000000001'::uuid;
  bph_id   uuid := 'a0000000-0000-4000-8000-000000000002'::uuid;
  user1_id uuid := 'a0000000-0000-4000-8000-000000000003'::uuid;
  user2_id uuid := 'a0000000-0000-4000-8000-000000000004'::uuid;
  user3_id uuid := 'a0000000-0000-4000-8000-000000000005'::uuid;
  user4_id uuid := 'a0000000-0000-4000-8000-000000000006'::uuid;

  period_id uuid := 'b0000000-0000-4000-8000-000000000001'::uuid;
  proker1_id uuid := 'c0000000-0000-4000-8000-000000000001'::uuid;
  div_acara_id uuid := 'd0000000-0000-4000-8000-000000000001'::uuid;
begin
  -- 1. AUTH USERS (email format: {nim}@hmif.local, initial password: {nim})
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values
    (admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '1000000001@hmif.local', crypt('1000000001', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (bph_id,   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '1000000002@hmif.local', crypt('1000000002', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (user1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '1000000003@hmif.local', crypt('1000000003', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (user2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '1000000004@hmif.local', crypt('1000000004', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (user3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '1000000005@hmif.local', crypt('1000000005', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (user4_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '1000000006@hmif.local', crypt('1000000006', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
  on conflict (id) do nothing;

  -- 2. PROFILES
  insert into profiles (id, username, full_name, global_role, angkatan, is_active, must_change_password) values
    (admin_id, 'admin', 'Admin HMIF', 'admin', 2023, true, false),
    (bph_id,   'ketuahmif', 'Ketua HMIF', 'bph', 2023, true, true),
    (user1_id, 'dimas.anggoro', 'Dimas Anggoro', 'member', 2024, true, true),
    (user2_id, 'sarah.azhari', 'Sarah Azhari', 'member', 2024, true, true),
    (user3_id, 'budi.santoso', 'Budi Santoso', 'member', 2025, true, true),
    (user4_id, 'putri.ayuningtyas', 'Putri Ayuningtyas', 'member', 2025, true, true)
  on conflict (id) do update set
    username = excluded.username,
    full_name = excluded.full_name,
    global_role = excluded.global_role;

  -- 3. PROFILE_PRIVATE (NIM)
  insert into profile_private (id, nim) values
    (admin_id, '1000000001'),
    (bph_id,   '1000000002'),
    (user1_id, '1000000003'),
    (user2_id, '1000000004'),
    (user3_id, '1000000005'),
    (user4_id, '1000000006')
  on conflict (id) do update set nim = excluded.nim;

  -- 4. PERIODE
  insert into periods (id, name, start_date, end_date, is_current) values
    (period_id, '2026/2027', '2026-09-01', '2027-08-31', true)
  on conflict (id) do update set is_current = excluded.is_current;

  -- 5. CONTOH PROKER
  insert into prokers (id, period_id, name, description, status, start_date, end_date, created_by) values
    (proker1_id, period_id, 'Informatics Championship 2026', 'Kompetisi tahunan informatika se-Purwokerto', 'active', '2026-10-01', '2026-11-30', admin_id)
  on conflict (id) do nothing;

  -- Divisi Acara tambahan (Sekretaris & Bendahara sudah otomatis terbuat oleh trigger)
  insert into divisions (id, proker_id, name, kind, sort_order) values
    (div_acara_id, proker1_id, 'Acara', 'custom', 2)
  on conflict (id) do nothing;

  -- 6. PERAN PANITIA PROKER
  insert into proker_roles (proker_id, user_id, role, division_id) values
    (proker1_id, admin_id, 'sc', null),
    (proker1_id, bph_id, 'pic', null),
    (proker1_id, user1_id, 'ketupel', null),
    (proker1_id, user2_id, 'koor', div_acara_id)
  on conflict do nothing;

end $$;
