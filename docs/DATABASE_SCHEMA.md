# DATABASE SCHEMA (Supabase / Postgres)

Semua perubahan skema lewat **migration** di `supabase/migrations/` (Supabase CLI). Jangan mengubah skema lewat dashboard secara manual.
SQL di bawah adalah rancangan awal; rapikan menjadi beberapa file migration berurutan saat implementasi (lihat `TASKS.md`).

## 1. Diagram Relasi (ringkas)

```
auth.users 1─1 profiles 1─1 profile_private (nim)
periods 1─* prokers 1─* divisions 1─* jobdesks
prokers 1─* proker_roles *─1 profiles        (proker_roles.division_id → divisions)
divisions 1─* tasks 1─* task_assignees *─1 profiles
tasks 1─* task_checklist_items
tasks 1─* task_links          (opsional: checklist_item_id)
tasks 1─* comments
prokers 1─* timeline_events
prokers 1─* meetings 1─1 meeting_minutes   (meetings.division_id nullable)
prokers 1─* finance_items
prokers 1─* proker_documents
prokers 1─* activity_log
profiles 1─* notifications
```

## 2. Enum

```sql
create type global_role   as enum ('admin','bph','member','external');
create type proker_status as enum ('planning','active','done');
create type proker_role   as enum ('sc','pic','ketupel','sekretaris','bendahara','koor','staff');
create type division_kind as enum ('sekretaris','bendahara','custom');
create type task_status   as enum ('belum_dimulai','on_progress','selesai');
create type finance_kind  as enum ('pemasukan','pengeluaran');
```

## 3. Tabel

```sql
-- PENGGUNA ---------------------------------------------------------
create table profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  username             text not null unique,            -- nama lengkap ter-normalisasi (lowercase, spasi tunggal)
  full_name            text not null,
  global_role          global_role not null default 'member',
  angkatan             smallint,
  is_active            boolean not null default true,
  must_change_password boolean not null default true,
  created_by           uuid references profiles(id),
  created_at           timestamptz not null default now(),
  constraint username_normalized check (username = lower(regexp_replace(btrim(username), '\s+', ' ', 'g')))
);

-- NIM dipisah: dipakai sebagai password awal, tidak boleh terbaca role lain.
create table profile_private (
  id  uuid primary key references profiles(id) on delete cascade,
  nim text not null unique
);

-- PERIODE & PROKER ---------------------------------------------------
create table periods (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,            -- "2026/2027"
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

-- ROLE PER PROKER (satu user boleh banyak baris = merangkap) ------------
create table proker_roles (
  id          uuid primary key default gen_random_uuid(),
  proker_id   uuid not null references prokers(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        proker_role not null,
  division_id uuid,
  label       text,                              -- "Sekretaris 1", "Bendahara 2"
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

-- JOBDESK & TASK ---------------------------------------------------
create table jobdesks (
  id          uuid primary key default gen_random_uuid(),
  division_id uuid not null references divisions(id) on delete cascade,
  title       text not null,
  description text,
  sort_order  int not null default 0,
  created_by  uuid references profiles(id),
  created_at  timestamptz not null default now()
);

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

-- Tanpa baris assignee = ditugaskan ke seluruh divisi
create table task_assignees (
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  primary key (task_id, user_id)
);
create index on task_assignees (user_id);

create table task_checklist_items (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references tasks(id) on delete cascade,
  text       text not null,
  is_done    boolean not null default false,
  sort_order int not null default 0
);

create table task_links (
  id                uuid primary key default gen_random_uuid(),
  task_id           uuid not null references tasks(id) on delete cascade,
  checklist_item_id uuid references task_checklist_items(id) on delete cascade,
  label             text,
  url               text not null check (url ~* '^https?://'),
  added_by          uuid references profiles(id),
  created_at        timestamptz not null default now()
);

create table comments (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references tasks(id) on delete cascade,
  author_id  uuid not null references profiles(id),
  body       text not null,
  created_at timestamptz not null default now()
);

-- TIMELINE, RAPAT, NOTULENSI ------------------------------------------
create table timeline_events (          -- milestone besar (Manajer)
  id          uuid primary key default gen_random_uuid(),
  proker_id   uuid not null references prokers(id) on delete cascade,
  title       text not null,
  description text,
  start_date  date not null,
  end_date    date,
  created_by  uuid references profiles(id)
);

create table meetings (
  id          uuid primary key default gen_random_uuid(),
  proker_id   uuid not null references prokers(id) on delete cascade,
  division_id uuid,                     -- null = rapat seluruh panitia
  title       text not null,
  agenda      text,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  location    text,
  meeting_url text check (meeting_url is null or meeting_url ~* '^https?://'),
  created_by  uuid references profiles(id),
  created_at  timestamptz not null default now(),
  foreign key (division_id, proker_id) references divisions(id, proker_id) on delete cascade
);
create index on meetings (proker_id, starts_at);

create table meeting_minutes (          -- notulensi
  meeting_id uuid primary key references meetings(id) on delete cascade,
  content    text not null,             -- markdown sederhana
  doc_url    text check (doc_url is null or doc_url ~* '^https?://'),
  created_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

-- KEUANGAN (dibatasi), DOKUMEN, LOG, NOTIFIKASI -----------------------
create table finance_items (
  id             uuid primary key default gen_random_uuid(),
  proker_id      uuid not null references prokers(id) on delete cascade,
  kind           finance_kind not null default 'pengeluaran',
  category       text not null,
  description    text not null,
  planned_amount bigint not null default 0,   -- Rupiah, tanpa desimal
  actual_amount  bigint,
  proof_url      text check (proof_url is null or proof_url ~* '^https?://'),
  note           text,
  created_by     uuid references profiles(id),
  created_at     timestamptz not null default now()
);

create table proker_documents (
  id         uuid primary key default gen_random_uuid(),
  proker_id  uuid not null references prokers(id) on delete cascade,
  label      text not null,
  category   text,                        -- Proposal, LPJ, Folder Drive, dst.
  url        text not null check (url ~* '^https?://'),
  added_by   uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table activity_log (
  id          bigint generated always as identity primary key,
  proker_id   uuid references prokers(id) on delete cascade,
  actor_id    uuid references profiles(id),
  action      text not null,               -- 'task.create', 'task.status', dst.
  entity_type text,
  entity_id   uuid,
  meta        jsonb,
  created_at  timestamptz not null default now()
);
create index on activity_log (proker_id, created_at desc);

create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text,
  link_path  text,
  proker_id  uuid references prokers(id) on delete cascade,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index on notifications (user_id, is_read, created_at desc);
```

## 4. Helper Function untuk RLS

Semua `security definer`, `stable`, `set search_path = public` supaya tidak terjadi rekursi policy.

```sql
create function current_global_role() returns global_role
language sql stable security definer set search_path = public as $$
  select global_role from profiles where id = auth.uid() and is_active
$$;

create function is_admin()    returns boolean language sql stable security definer set search_path = public as
$$ select coalesce(current_global_role() = 'admin', false) $$;

create function is_view_all() returns boolean language sql stable security definer set search_path = public as
$$ select coalesce(current_global_role() in ('admin','bph'), false) $$;

create function has_proker_access(p uuid) returns boolean language sql stable security definer set search_path = public as
$$ select is_view_all() or exists (
     select 1 from proker_roles r join profiles u on u.id = r.user_id and u.is_active
     where r.proker_id = p and r.user_id = auth.uid()) $$;

create function is_proker_manager(p uuid) returns boolean language sql stable security definer set search_path = public as
$$ select is_admin() or exists (
     select 1 from proker_roles where proker_id = p and user_id = auth.uid()
       and role in ('sc','pic','ketupel')) $$;

create function is_in_division(d uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from proker_roles where division_id = d and user_id = auth.uid()) $$;

create function can_manage_division(d uuid) returns boolean language sql stable security definer set search_path = public as
$$ select is_admin() or exists (
     select 1 from divisions v join proker_roles r on r.proker_id = v.proker_id and r.user_id = auth.uid()
     where v.id = d and (
        r.role in ('sc','pic','ketupel')
        or (r.role in ('koor','sekretaris','bendahara') and r.division_id = d))) $$;

create function can_see_finance(p uuid) returns boolean language sql stable security definer set search_path = public as
$$ select is_view_all() or exists (
     select 1 from proker_roles where proker_id = p and user_id = auth.uid()
       and role in ('sc','pic','ketupel','bendahara')) $$;

create function can_update_task_status(t uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists (
     select 1 from tasks k where k.id = t and (
       can_manage_division(k.division_id)
       or (is_in_division(k.division_id) and (
            not exists (select 1 from task_assignees a where a.task_id = k.id)
            or exists (select 1 from task_assignees a where a.task_id = k.id and a.user_id = auth.uid()))))) $$;
```

## 5. Kebijakan RLS (pola)

Aktifkan RLS di **semua** tabel. Tanpa policy = tidak ada akses.

| Tabel | SELECT | INSERT / UPDATE / DELETE |
|---|---|---|
| `profiles` | semua user login (kolom non-sensitif) | Admin (semua); user sendiri hanya lewat RPC terbatas |
| `profile_private` | Admin & pemilik | Hanya service role (server action) |
| `periods` | semua user login | Admin |
| `prokers` | `has_proker_access(id)` | INSERT/DELETE: Admin. UPDATE: `is_proker_manager(id)` |
| `divisions`, `jobdesks`, `timeline_events` | `has_proker_access(proker_id)` | `is_proker_manager(proker_id)` |
| `proker_roles` | `has_proker_access(proker_id)` | `is_proker_manager(proker_id)` |
| `tasks` | `has_proker_access(proker_id)` | `can_manage_division(division_id)`; Staff memakai RPC `set_task_status` |
| `task_assignees`, `task_checklist_items`, `task_links` | via task: `has_proker_access` | checklist & link: `can_update_task_status(task_id)`; assignee: `can_manage_division` |
| `comments` | `has_proker_access` | INSERT: `has_proker_access` & `author_id = auth.uid()` (dan bukan BPH-only); edit/hapus: milik sendiri |
| `meetings` | `has_proker_access` | Tanpa division: Sekretaris/Manajer. Dengan division: `can_manage_division(division_id)` + Sekretaris |
| `meeting_minutes` | `has_proker_access` (via meeting) | Sekretaris, Manajer, Koor untuk rapat divisinya |
| `finance_items` | `can_see_finance(proker_id)` | Manajer & Bendahara saja |
| `proker_documents` | `has_proker_access` | Manajer & Sekretaris |
| `activity_log` | Manajer, Admin, BPH | Hanya lewat trigger/server |
| `notifications` | `user_id = auth.uid()` | UPDATE `is_read` milik sendiri; INSERT lewat fungsi/trigger |

Contoh policy:
```sql
alter table tasks enable row level security;

create policy tasks_select on tasks for select
  using (has_proker_access(proker_id));

create policy tasks_insert on tasks for insert
  with check (can_manage_division(division_id));

create policy tasks_update on tasks for update
  using (can_manage_division(division_id))
  with check (can_manage_division(division_id));

create policy tasks_delete on tasks for delete
  using (can_manage_division(division_id));
```

RPC untuk Staff (hanya mengubah status, tidak kolom lain):
```sql
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
```
Pastikan hak eksekusi hanya untuk `authenticated`. UI **selalu** memakai RPC ini untuk ubah status (untuk semua role) agar jalurnya satu.

Finance — contoh:
```sql
alter table finance_items enable row level security;
create policy fin_select on finance_items for select using (can_see_finance(proker_id));
create policy fin_write  on finance_items for all
  using (is_proker_manager(proker_id) or exists (
          select 1 from proker_roles where proker_id = finance_items.proker_id
            and user_id = auth.uid() and role = 'bendahara'))
  with check (is_proker_manager(proker_id) or exists (
          select 1 from proker_roles where proker_id = finance_items.proker_id
            and user_id = auth.uid() and role = 'bendahara'));
```

## 6. View Progres

```sql
create view division_progress with (security_invoker = true) as
select d.id as division_id, d.proker_id, d.name, d.kind,
       count(t.id)                                   as total,
       count(t.id) filter (where t.status = 'selesai')       as selesai,
       count(t.id) filter (where t.status = 'on_progress')   as on_progress,
       count(t.id) filter (where t.status = 'belum_dimulai') as belum,
       count(t.id) filter (where t.deadline < current_date and t.status <> 'selesai') as terlambat
from divisions d left join tasks t on t.division_id = d.id
group by d.id;
```
`security_invoker = true` memastikan view tetap tunduk pada RLS pemanggil.
Progres proker = jumlahkan semua baris divisi (hitung di query).

## 7. Notifikasi Deadline (Fase 5)

Fungsi `generate_deadline_notifications()` (SQL, security definer) membuat notifikasi untuk task `status <> 'selesai'` dengan `deadline` = H+3, H+1, dan terlambat (sekali per hari). Jadwalkan dengan **pg_cron** (Supabase gratis) setiap hari pukul 00:00 UTC (= 07:00 WIB).

## 8. Alur Akun (server-side, bukan dari browser)

```
createUser(fullName, nim, angkatan, globalRole):
  1. cek pemanggil: Admin (anggota HMIF) / Manajer proker (non-HMIF) — dari sesi, bukan dari input form
  2. username = normalize(fullName); tolak jika sudah ada
  3. supabase.auth.admin.createUser({ email: `${nim}@hmif.local`, password: nim, email_confirm: true })
  4. insert profiles (id, username, full_name, global_role, must_change_password=true)
  5. insert profile_private (id, nim)
  6. (opsional) insert proker_roles bila dibuat dari halaman tim proker

login(username, password):
  1. server action cari profiles.username (service role) → ambil email auth
  2. signInWithPassword(email, password)   -- pesan error generik "Username atau password salah"
  3. jika must_change_password → redirect /ganti-password

changePassword(newPassword):
  1. validasi ≥ 8 karakter dan ≠ NIM
  2. supabase.auth.updateUser({ password })
  3. update profiles set must_change_password = false (lewat RPC aman milik sendiri)
```
Email palsu `@hmif.local` hanya identifier internal Supabase Auth. Verifikasi di Fase 1 bahwa domain ini diterima; jika ditolak gunakan domain lain yang valid secara sintaks (mis. `@users.hmif-tup.app`). Matikan "Confirm email" dan signup publik di pengaturan Auth.

## 9. Seed Data (development)
- 1 Admin, 1 BPH, ±10 anggota, 2 non-HMIF
- 1 periode aktif, 2 proker contoh lengkap dengan divisi, task berbagai status, 1 rapat + notulensi
- Cukup untuk menguji tiap kolom matriks di `ROLES_PERMISSIONS.md`
