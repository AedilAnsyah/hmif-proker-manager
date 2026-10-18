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
