# TASKS — Roadmap Pengerjaan per Fase

Kerjakan **berurutan**. Centang `[x]` saat selesai. Tiap fase diakhiri **Definition of Done (DoD)** yang harus terpenuhi sebelum lanjut.
Estimasi kasar untuk 1 orang vibe coding: 1–3 sesi per fase.

> Cara memakai dengan AI coding assistant: mulai sesi dengan *"Baca CLAUDE.md dan semua dokumen yang dirujuk, lalu kerjakan Fase N di TASKS.md tugas demi tugas."* Setiap fase punya **Prompt Pembuka** yang bisa ditempel langsung.

---

## Fase 0 — Fondasi & Setup
**Tujuan:** repo, database, dan deployment kosong yang sudah berjalan.

- [ ] Buat akun organisasi: GitHub, Supabase, Vercel (atas nama organisasi, catat pemegang kredensial)
- [ ] Inisialisasi Next.js (TypeScript, App Router, Tailwind), ESLint, Prettier
- [ ] Taruh dokumen ini di `docs/` dan `CLAUDE.md` di root
- [ ] Setup Supabase CLI: `supabase init`, proyek terhubung, folder `supabase/migrations`
- [ ] Pasang `@supabase/ssr`, buat `lib/supabase/{server,client,admin,middleware}.ts`
- [ ] Konfigurasi Auth: **matikan** signup publik dan "Confirm email"
- [ ] Token desain: `globals.css` (variabel warna), `tailwind.config`, font Schibsted Grotesk + JetBrains Mono via `next/font`
- [ ] Komponen dasar `components/ui`: Button, Input, Label, Dialog/Sheet, Tabs, StatusChip, ProgressBar, Avatar, EmptyState, Skeleton, Toast
- [ ] Layout aplikasi: sidebar (desktop) + tab bar bawah (mobile) sesuai `DESIGN.md`
- [ ] `.env.example`, `/api/health`, workflow GitHub Actions `ci.yml` (lint+typecheck+test) dan `keepalive.yml` (ping harian ke `/api/health`)
- [ ] Deploy awal ke Vercel dengan env variable

**DoD:** halaman kosong terdeploy di Vercel, CI hijau, keepalive berjalan, token desain terpasang.

**Prompt Pembuka:** *"Baca CLAUDE.md, TECH_STACK.md, DESIGN.md. Kerjakan Fase 0 di TASKS.md. Mulai dari setup proyek dan token desain, lalu komponen UI dasar. Jangan buat fitur apa pun dulu."*

---

## Fase 1 — Auth, Akun, Periode, Proker (Admin)
**Tujuan:** Admin bisa membuat akun dan proker; user bisa login dan melihat dashboard.

**Database**
- [ ] Migration `0001_init`: enum, `profiles`, `profile_private`, `periods`, `prokers`, `divisions` (+ trigger divisi bawaan), `proker_roles`
- [ ] Migration `0002_rls_core`: helper function (`is_admin`, `is_view_all`, `has_proker_access`, `is_proker_manager`, dst.) + policy tabel di atas
- [ ] `seed.sql`: 1 admin, 1 bph, beberapa anggota, 1 periode aktif
- [ ] Tes RLS awal: user hanya melihat proker miliknya; BPH/Admin melihat semua

**Auth**
- [ ] Verifikasi domain email internal (`@hmif.local`) diterima Supabase Auth; jika tidak, ganti
- [ ] `normalizeUsername` + tes unit
- [ ] Halaman `/login` (username + password), pesan error generik
- [ ] `middleware.ts`: redirect ke `/login` jika belum login; ke `/ganti-password` jika `must_change_password`
- [ ] Halaman `/ganti-password` (≥ 8 karakter, ≠ NIM) dan `/profil`
- [ ] Logout

**Admin**
- [ ] `/admin/pengguna`: daftar akun (cari, filter tipe, aktif/nonaktif)
- [ ] Buat akun (server action dengan service role): nama lengkap, NIM, angkatan, tipe (member/bph/admin)
- [ ] Nonaktifkan/aktifkan akun; **Reset ke NIM** (+ `must_change_password = true`)
- [ ] `/admin/periode`: buat periode, tandai aktif
- [ ] `/admin/proker/baru`: nama, periode, tanggal, pilih PIC, Ketupel, SC (opsional)
- [ ] Edit nama/penugasan PIC-Ketupel-SC; hapus proker (konfirmasi)

**Dashboard**
- [ ] `/`: kartu proker yang diikuti user (nama, chip role, progres placeholder), tab/filter periode + "Riwayat"
- [ ] `/proker/semua` untuk Admin & BPH

**DoD:** Admin membuat akun → user login dengan nama lengkap + NIM → dipaksa ganti password → melihat dashboard berisi proker miliknya. NIM tidak terbaca oleh non-Admin (diuji). Tes RLS fase ini lulus.

**Prompt Pembuka:** *"Kerjakan Fase 1. Mulai dari migration + RLS + tes, baru UI. Pastikan NIM hanya di profile_private dan service role hanya dipakai di server action yang memeriksa hak pemanggil."*

---

## Fase 2 — Tim, Divisi, Jobdesk (Ketupel)
**Tujuan:** Ketupel membangun struktur kepanitiaan.

- [ ] Migration `0003_jobdesks` + policy (`jobdesks`)
- [ ] Layout detail proker `/proker/[id]` dengan tab dan guard akses
- [ ] Tab **Tim**: daftar anggota per divisi + role (Sekretaris 1/2, Bendahara 1/2, Koor, Staff), SC/PIC/Ketupel di bagian atas
- [ ] Buat/ubah/hapus **divisi** (divisi bawaan Sekretaris & Bendahara tidak bisa dihapus/diganti nama)
- [ ] **Tambah anggota** (cari anggota HMIF) + tetapkan role + divisi; dukung merangkap role
- [ ] **Buat akun non-HMIF** dari halaman tim (server action: cek Manajer proker; username/NIM sama aturan) + otomatis menambahkan ke proker
- [ ] Ketupel/Manajer dapat **reset password** panitia non-HMIF proker miliknya
- [ ] Ubah/hapus role anggota; validasi: minimal 1 Ketupel tetap ada
- [ ] **Jobdesk**: tambah/ubah/hapus/urutkan per divisi (termasuk Sekretaris & Bendahara)
- [ ] Halaman Ringkasan proker (versi awal): info, daftar divisi + Koor
- [ ] Tes RLS: Koor/Staff tidak bisa mengubah tim/jobdesk; user proker lain tidak bisa melihat

**DoD:** Ketupel dapat membuat proker lengkap (divisi, tim, jobdesk, akun non-HMIF) < 15 menit; hak akses sesuai matriks.

**Prompt Pembuka:** *"Kerjakan Fase 2 sesuai ROLES_PERMISSIONS.md dan USER_FLOW.md §3.2. Fokus halaman Tim dan Jobdesk di mobile dulu."*

---

## Fase 3 — Task & Tracking Progres (inti produk)
**Tujuan:** panitia bisa mengelola task dan melaporkan progres.

- [ ] Migration `0004_tasks`: `tasks`, `task_assignees`, `task_checklist_items`, `task_links`, view `division_progress`, RPC `set_task_status`, policy
- [ ] Tab **Task**: daftar (filter divisi/status/assignee, cari), ringkasan jumlah per status
- [ ] Buat/ubah/hapus task (judul, deskripsi, deadline, divisi, jobdesk terkait, assignee: seluruh divisi atau orang tertentu)
- [ ] Hak: Manajer semua divisi; Sekretaris/Bendahara/Koor hanya unitnya; Staff tidak bisa membuat
- [ ] **Ubah status** via chip → bottom sheet (selalu lewat RPC); Staff sesuai aturan assignee
- [ ] Detail task: checklist (tambah/centang/hapus), **link lampiran** (validasi http(s), pada task atau item checklist)
- [ ] Penanda deadline: segera (≤3 hari) dan terlambat
- [ ] Ringkasan proker: progres per divisi/Sekretaris/Bendahara + keseluruhan, jumlah terlambat
- [ ] Kartu proker di dashboard memakai progres nyata
- [ ] Halaman **Tugas Saya** `/tugas` lintas proker (definisi di `ROLES_PERMISSIONS.md` §5)
- [ ] Tes RLS: Staff tidak bisa ubah kolom selain status; Staff tidak bisa ubah task yang ditugaskan ke orang lain; BPH read-only; URL non-http ditolak
- [ ] Tes E2E: Staff ubah status + tambah link di viewport HP

**DoD:** alur "Koor buat task → Staff ubah status + tempel link → Ketupel melihat progres divisi naik" berjalan. Ubah status < 30 detik di HP.

**Prompt Pembuka:** *"Kerjakan Fase 3. Task row mengikuti DESIGN.md §6 (Baris Task). Ubah status wajib via RPC set_task_status. Tulis tes RLS dulu."*

---

## Fase 4 — Timeline, Rapat, Notulensi, Kalender
**Tujuan:** perencanaan waktu dan komunikasi rapat.

- [ ] Migration `0005_timeline_meetings`: `timeline_events`, `meetings`, `meeting_minutes` + policy
- [ ] Tab **Timeline**: CRUD milestone (Manajer); tampilan Gantt sederhana (desktop) / agenda per hari (HP)
- [ ] Timeline menggabungkan milestone + rapat + deadline task; filter jenis
- [ ] Tab **Rapat**: daftar mendatang & lampau; buat **rapat seluruh panitia** (Sekretaris/Manajer) dan **rapat divisi** (Koor untuk divisinya)
- [ ] Detail rapat: info, agenda, link meeting, **notulensi** (markdown sederhana + opsional link dokumen)
- [ ] Hak notulensi: Sekretaris, Manajer, Koor (rapat divisinya)
- [ ] Dashboard: bagian "Rapat mendatang"
- [ ] Halaman `/kalender` gabungan milik user
- [ ] Tes RLS: rapat divisi hanya bisa dibuat Koor/Sekretaris/Manajer terkait; non-panitia tidak bisa membaca notulensi

**DoD:** Ketupel menyusun milestone; Sekretaris membuat rapat + notulensi yang terbaca semua panitia proker itu; kalender menampilkan tiga jenis item.

**Prompt Pembuka:** *"Kerjakan Fase 4. Tidak ada fitur absensi. Kalender di HP berupa agenda per hari, bukan grid bulan."*

> **Titik rilis MVP.** Setelah Fase 4, aplikasi sudah memenuhi seluruh permintaan awal. Lakukan uji coba dengan 1–2 proker nyata sebelum lanjut.

---

## Fase 5 — Notifikasi & Komentar
- [ ] Migration `0006_notifications_comments`: `notifications`, `comments` + policy
- [ ] Komentar di detail task (hapus/ubah milik sendiri)
- [ ] Fungsi DB pembuat notifikasi (task ditugaskan, rapat baru, notulensi, komentar, ditambahkan ke proker)
- [ ] `generate_deadline_notifications()` + **pg_cron** harian 00:00 UTC (H-3, H-1, terlambat)
- [ ] Ikon lonceng + titik kuning, halaman `/notifikasi`, tandai dibaca
- [ ] Label **Terlambat** terpadu di semua daftar
- [ ] Tes: user hanya melihat notifikasinya; tidak ada duplikat notifikasi harian

**DoD:** assignee menerima notifikasi saat ditugaskan dan saat deadline mendekat.

**Prompt Pembuka:** *"Kerjakan Fase 5. Notifikasi in-app saja (tanpa email). Pakai pg_cron di Supabase, bukan Vercel cron."*

---

## Fase 6 — Keuangan, Dokumen, Template, Log, Polesan
- [ ] Migration `0007_finance_docs_log`: `finance_items`, `proker_documents`, `activity_log` + policy + trigger log
- [ ] Tab **Keuangan**: anggaran vs realisasi per kategori, total, link bukti — **hanya** Bendahara/Manajer/Admin/BPH (read-only BPH)
- [ ] **Tes RLS keuangan** (Koor, Staff, Sekretaris, non-HMIF, proker lain → semua ditolak)
- [ ] Tab **Dokumen**: link terpusat per kategori
- [ ] **Duplikat struktur proker** (divisi + jobdesk, tanpa task/anggota) saat/ setelah membuat proker
- [ ] Tab **Aktivitas** (log) untuk Manajer/Admin/BPH
- [ ] Dark mode (opsional) memakai token di `DESIGN.md` §2
- [ ] Audit aksesibilitas & performa (Lighthouse mobile ≥ 90 untuk Performance & Accessibility)
- [ ] Indeks DB & uji dengan data besar (50 proker × 100 task × 70 panitia)

**DoD:** seluruh daftar fitur F1–F20 di `PRD.md` terpenuhi dan teruji.

**Prompt Pembuka:** *"Kerjakan Fase 6. Prioritaskan tab Keuangan beserta tes RLS-nya sebelum fitur lain."*

---

## Fase 7 — Hardening, Peluncuran, Serah Terima
- [ ] Tinjau seluruh policy RLS; jalankan Supabase security advisor
- [ ] Pastikan tidak ada `SUPABASE_SERVICE_ROLE_KEY` di bundle client (cek `next build` output / grep)
- [ ] Rate-limit/penanganan percobaan login gagal (andalkan batas Supabase + pesan generik)
- [ ] Backup mingguan (`pg_dump` via GitHub Actions) + uji restore sekali
- [ ] Impor akun anggota awal (±55) — skrip seed sekali jalan dari CSV (nama, NIM, angkatan) oleh Admin
- [ ] Uji coba terbatas dengan 1–2 proker; kumpulkan masukan
- [ ] `README.md` untuk pengurus berikutnya: arsitektur singkat, cara menambah admin, cara pergantian periode, daftar akun layanan dan pemegangnya
- [ ] Panduan pengguna 1 halaman per role (Ketupel, Koor/Staff, Sekretaris, Bendahara)
- [ ] Rencana pergantian periode: buat periode baru, arsipkan (tandai `done`) proker lama, nonaktifkan akun non-HMIF yang sudah tidak perlu

**DoD:** dipakai oleh proker nyata, tidak ada temuan keamanan terbuka, dokumen serah terima lengkap.

---

## Catatan Lintas Fase

- Setiap fase = satu branch; gabung ke `main` setelah DoD terpenuhi dan CI hijau.
- Jangan menambah fitur di luar daftar tanpa memperbarui `PRD.md` dahulu.
- Jika ada keputusan baru (mis. longgarkan hak Staff), perbarui `ROLES_PERMISSIONS.md` **dan** policy DB **dan** tesnya.
- Fitur ditunda (lihat `PRD.md` §4): Google Calendar, bot WA/Telegram, export PDF, form open recruitment, evaluasi panitia.

## Pertanyaan Terbuka (jawab sebelum fase terkait)

| Sebelum fase | Pertanyaan | Default jika tidak dijawab |
|---|---|---|
| 1 | Siapa saja yang jadi Admin pertama? | 1 akun admin dibuat via seed oleh kamu |
| 1 | Penanganan nama kembar | Admin menambah pembeda manual pada username |
| 3 | Bolehkah Staff mengubah semua task divisinya, atau hanya yang ditugaskan ke dirinya/seluruh divisi? | Hanya yang ditugaskan ke dirinya/seluruh divisi |
| 6 | BPH boleh melihat keuangan? | Ya, read-only |
| 7 | Apakah akun non-HMIF perlu dinonaktifkan otomatis setelah proker `done`? | Tidak, manual |
