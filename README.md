# HMIF Proker Manager

> Web app manajemen program kerja (proker) untuk HMIF Telkom University Purwokerto.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + Custom Design Tokens
- **Database:** Supabase (Postgres + RLS + Auth)
- **Hosting:** Vercel Hobby (gratis)

## Quickstart

```bash
# Clone repo
git clone https://github.com/AedilAnsyah/hmif-proker-manager.git
cd hmif-proker-manager

# Install dependencies
npm install

# Copy env dan isi kredensial Supabase
cp .env.example .env.local

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Struktur Folder

```
src/
├── app/
│   ├── (auth)/          # Login, ganti password
│   ├── (app)/           # Dashboard, tugas, kalender, profil
│   └── api/health/      # Health check endpoint
├── components/
│   ├── ui/              # Button, Input, Dialog, StatusChip, dll.
│   └── layout/          # AppShell (sidebar + tab bar)
├── lib/
│   ├── supabase/        # Client, server, admin, middleware
│   ├── format.ts        # Format tanggal, Rupiah
│   └── utils.ts         # cn() helper
docs/                    # PRD, Database Schema, Design System, dll.
supabase/
├── migrations/          # SQL migrations
└── seed.sql             # Data development
```

## Environment Variables

| Variable | Keterangan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (publik, dilindungi RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — jangan expose ke client |

## Dokumentasi

Lihat folder `docs/` untuk:
- [PRD](docs/PRD.md) — Spesifikasi produk
- [Database Schema](docs/DATABASE_SCHEMA.md) — Tabel & RLS
- [Design System](docs/DESIGN.md) — Warna, tipografi, komponen
- [Tech Stack](docs/TECH_STACK.md) — Arsitektur & konvensi
- [Roles & Permissions](docs/ROLES_PERMISSIONS.md) — Matriks akses
- [Tasks](docs/TASKS.md) — Roadmap pengerjaan
- [User Flow](docs/USER_FLOW.md) — Alur pengguna

## Lisensi

Internal HMIF Telkom University Purwokerto.
