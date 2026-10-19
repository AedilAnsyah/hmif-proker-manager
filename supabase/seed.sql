-- Seed data for development
-- Target: 1 Admin, 1 BPH, beberapa anggota HMIF, 1 periode aktif, proker contoh

-- Supabase extensions (for crypt / password hashing)
create extension if not exists pgcrypto;

do $$
declare
  admin_id uuid := 'a0000000-0000-0000-0000-000000000001'::uuid;
  bph_id   uuid := 'a0000000-0000-0000-0000-000000000002'::uuid;
  user1_id uuid := 'a0000000-0000-0000-0000-000000000003'::uuid;
  user2_id uuid := 'a0000000-0000-0000-0000-000000000004'::uuid;
  user3_id uuid := 'a0000000-0000-0000-0000-000000000005'::uuid;
  user4_id uuid := 'a0000000-0000-0000-0000-000000000006'::uuid;

  period_id uuid := 'b0000000-0000-0000-0000-000000000001'::uuid;
  proker1_id uuid := 'c0000000-0000-0000-0000-000000000001'::uuid;
  div_acara_id uuid := 'd0000000-0000-0000-0000-000000000001'::uuid;
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
