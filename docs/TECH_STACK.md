# TECH STACK & ARSITEKTUR

Syarat utama: **full gratis**.

## 1. Stack

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js** (versi stabil terbaru, App Router) + TypeScript strict | Server Components + Server Actions meminimalkan kode API |
| Styling | **Tailwind CSS** + token CSS dari `DESIGN.md` | Cepat, konsisten, mobile-first |
| Komponen | Primitif **Radix UI** (dialog, dropdown, tabs, popover) + komponen sendiri; boleh pakai shadcn/ui **sebagai titik awal saja**, wajib dikustom sesuai `DESIGN.md` | Aksesibel tanpa tampilan template |
| Database & Auth | **Supabase Free** (Postgres, Auth, RLS, pg_cron) via `@supabase/ssr` | Gratis, RLS menjaga hak akses di level data |
| Validasi | **Zod** (+ react-hook-form untuk form kompleks) | Skema sama dipakai server & client |
| Tanggal | **date-fns** (locale `id`), zona Asia/Jakarta | Ringan |
| Ikon | **lucide-react** | Konsisten, garis tipis |
| Toast | **sonner** | Ringan |
| Hosting | **Vercel Hobby** | Gratis untuk organisasi non-komersial |
| CI | GitHub Actions (lint, typecheck, test) | Gratis |
| Tes | Vitest (unit), Playwright (E2E alur kunci), tes SQL RLS | Lihat §6 |

Tanpa: Redux, ORM berat, layanan storage berbayar, layanan email berbayar.

## 2. Batas Free Tier & Mitigasi

| Risiko | Mitigasi |
|---|---|
| **Supabase Free menjeda (pause) proyek yang tidak aktif ±7 hari** | Tambah endpoint `/api/health` yang melakukan 1 query ringan + GitHub Actions cron harian yang memanggilnya. Dokumentasikan di README |
| Storage DB 500 MB | Cukup: ±5–10 rb baris/periode. **Tidak ada upload file**, hanya link |
| Auth: tidak ada SMTP bawaan yang layak | Tidak memakai email; reset password oleh Admin/Ketupel |
| Vercel Hobby: cron terbatas | Notifikasi deadline memakai **pg_cron** di Supabase, bukan Vercel cron |
| Backup: Free tier tanpa backup terjadwal otomatis | Skrip `pg_dump` mingguan via GitHub Actions ke artifact/repo privat, atau ekspor manual berkala oleh Admin |
| Kepemilikan akun | Buat akun GitHub/Supabase/Vercel atas nama **organisasi** (bukan pribadi) dan catat pemegang kredensial agar tidak hilang saat pergantian periode |

## 3. Arsitektur

```
Browser ──► Next.js (Vercel)
              ├─ Server Components  → baca data via Supabase client (sesi user, RLS aktif)
              ├─ Server Actions     → tulis data via Supabase client (sesi user, RLS aktif)
              └─ Server Actions "admin" (buat akun/reset password)
                     → pakai SERVICE ROLE KEY, SETELAH cek hak pemanggil
Supabase: Auth · Postgres (RLS + RPC + pg_cron)
```

**Prinsip**
1. **RLS adalah sumber kebenaran hak akses.** UI hanya menyembunyikan tombol demi kenyamanan.
2. Service role key hanya di `lib/supabase/admin.ts`, `import 'server-only'`, tidak pernah di komponen client, tidak pernah berprefiks `NEXT_PUBLIC_`.
3. Default Server Component; `'use client'` hanya untuk interaktivitas (dialog, bottom sheet, form).
4. Mutasi lewat Server Actions + validasi Zod + `revalidatePath`.
5. Ubah status task **selalu** lewat RPC `set_task_status`.

## 4. Struktur Folder

```
├─ app/
│  ├─ (auth)/login, ganti-password
│  ├─ (app)/
│  │  ├─ layout.tsx               # shell: sidebar (desktop) / tab bar (mobile)
│  │  ├─ page.tsx                 # dashboard
│  │  ├─ tugas/ kalender/ notifikasi/ profil/
│  │  ├─ proker/
│  │  │  ├─ semua/
│  │  │  └─ [id]/ (layout.tsx, page.tsx, task/, tim/, timeline/, rapat/, keuangan/, dokumen/, aktivitas/)
│  │  └─ admin/ pengguna/, proker/baru, periode/
│  └─ api/health/route.ts
├─ components/
│  ├─ ui/                         # Button, Input, Dialog, StatusChip, ProgressBar, Avatar, EmptyState...
│  └─ feature/                    # TaskRow, DivisionCard, MeetingCard, TeamTable...
├─ lib/
│  ├─ supabase/ (server.ts, client.ts, admin.ts, middleware.ts)
│  ├─ auth/ (getSession, requireRole, normalizeUsername)
│  ├─ permissions.ts              # cermin helper RLS untuk UI (can('task.create', ctx))
│  ├─ validators/                 # skema Zod per fitur
│  ├─ queries/                    # fungsi baca data per fitur
│  ├─ actions/                    # server actions per fitur
│  └─ format.ts                   # tanggal Indonesia, Rupiah
├─ supabase/
│  ├─ migrations/                 # 0001_init.sql, 0002_rls.sql, ...
│  ├─ seed.sql
│  └─ tests/                      # tes RLS (pgTAP atau skrip)
├─ middleware.ts                  # refresh sesi + redirect login / ganti-password
├─ docs/                          # dokumen ini
└─ .github/workflows/             # ci.yml, keepalive.yml, backup.yml
```

## 5. Environment Variables

| Nama | Dipakai di | Catatan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client+server | publik |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client+server | publik, aman karena RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **server saja** | rahasia, jangan di-commit |
| `NEXT_PUBLIC_APP_NAME` | client | "HMIF Proker Manager" |

Sediakan `.env.example` tanpa nilai rahasia.

## 6. Strategi Tes

- **Tes RLS (wajib)**: untuk tiap role pada matriks `ROLES_PERMISSIONS.md`, uji SELECT/INSERT/UPDATE/DELETE di tabel utama. Fokus kritis: keuangan tidak terbaca Koor/Staff/non-HMIF; BPH tidak bisa menulis; Staff tidak bisa mengubah kolom selain status; user proker A tidak bisa membaca proker B.
- **Unit**: `normalizeUsername`, `permissions.ts`, kalkulasi progres, formatter tanggal.
- **E2E (Playwright)**: (1) login + ganti password paksa, (2) Admin buat proker, (3) Ketupel bangun tim + task, (4) Staff ubah status + tambah link, (5) Sekretaris buat rapat + notulensi.
- CI gagal bila lint/typecheck/tes gagal.

## 7. Konvensi Kode

- TypeScript strict, tanpa `any` kecuali terdokumentasi.
- Nama berkas `kebab-case`, komponen `PascalCase`.
- Teks UI dalam Bahasa Indonesia (istilah umum Inggris boleh); nama kode & komentar boleh Inggris.
- Format tanggal UI: `18 Okt 2026`, jam `14.30 WIB`. Simpan UTC/`timestamptz`, tampilkan Asia/Jakarta.
- Rupiah: `Rp 1.500.000` (pemisah titik).
- Setiap server action: (1) cek sesi, (2) validasi Zod, (3) eksekusi, (4) kembalikan `{ ok, error? }` dengan pesan Indonesia yang ramah.
- Commit kecil, satu fitur per commit; PR/branch per fase.
