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
