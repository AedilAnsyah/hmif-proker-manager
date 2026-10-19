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
