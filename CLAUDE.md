# CLAUDE.md — Konteks Proyek HMIF Proker Manager

Kamu membantu membangun web app manajemen proker untuk HMIF Telkom University Purwokerto. Baca dokumen berikut **sebelum** menulis kode, sesuai urutan:

1. `PRD.md` — apa yang dibangun, aturan bisnis, asumsi
2. `ROLES_PERMISSIONS.md` — siapa boleh apa
3. `DATABASE_SCHEMA.md` — tabel, RLS, RPC, alur akun
4. `USER_FLOW.md` — rute & alur per role
5. `DESIGN.md` — sistem desain (wajib diikuti untuk semua UI)
6. `TECH_STACK.md` — stack, struktur folder, konvensi
7. `TASKS.md` — urutan pengerjaan per fase

## Cara Kerja

- Kerjakan **satu fase / satu tugas** dalam satu waktu sesuai `TASKS.md`. Jangan loncat fase.
- Sebelum mengerjakan, sebutkan tugas yang diambil dan berkas yang akan diubah. Setelah selesai, centang di `TASKS.md`.
- Jika dokumen ambigu atau bertentangan, **tanya**, jangan menebak. Jika harus mengambil asumsi, catat di bagian "Asumsi" `PRD.md`.
- Perubahan skema = migration baru di `supabase/migrations/`. Jangan edit migration lama yang sudah dijalankan.
- Jalankan `lint`, `typecheck`, dan tes sebelum menyatakan tugas selesai.

## Aturan Keras (jangan dilanggar)

1. **Hak akses ditegakkan di RLS.** Setiap tabel baru wajib `enable row level security` + policy. Jangan mengandalkan penyembunyian di UI.
2. **`SUPABASE_SERVICE_ROLE_KEY` hanya di server** (`lib/supabase/admin.ts` dengan `import 'server-only'`). Jangan di komponen client, jangan di-log, jangan di-commit.
3. **NIM tidak boleh terbaca** selain oleh Admin dan pemilik akun. NIM hanya di `profile_private`. Jangan masukkan NIM ke query umum, props komponen, atau log.
4. **Data keuangan** hanya untuk Bendahara, Manajer (SC/PIC/Ketupel), Admin, BPH (read-only). Uji dengan tes RLS.
5. **BPH read-only** di seluruh sistem.
6. Ubah status task **selalu** lewat RPC `set_task_status`.
7. Lampiran = **URL http(s) saja**; validasi di Zod **dan** constraint DB. Tidak ada upload file.
8. Tidak ada fitur **absensi rapat**.
9. Semua teks UI Bahasa Indonesia (istilah umum seperti Dashboard/Task/Deadline boleh Inggris). Pesan error ramah dan spesifik.
10. Waktu disimpan `timestamptz`, ditampilkan Asia/Jakarta.
11. Solusi harus tetap **100% gratis** (Vercel Hobby + Supabase Free). Jangan menambah layanan berbayar atau dependensi yang butuh akun berbayar.

## Aturan UI (ringkas — detail di DESIGN.md)

- Mobile-first, target tap ≥ 44 px, nyaman di HP dan PC.
- Palet: putih, hitam, kuning. Kuning **tidak** dipakai sebagai warna teks di atas putih.
- Tanpa gradien, tanpa bayangan tebal, tanpa emoji sebagai ikon/judul, tanpa kartu seragam berisi lingkaran ikon, tanpa teks lorem/placeholder generik.
- Gunakan komponen dari `components/ui`; jangan membuat varian gaya baru tanpa alasan.
- Setiap halaman punya state: loading (skeleton), kosong (dengan langkah berikutnya), dan error.

## Definisi Selesai (setiap tugas)

- [ ] Sesuai dokumen terkait, tanpa menambah fitur di luar lingkup
- [ ] RLS/policy dan tes untuk data baru
- [ ] Responsif (cek lebar 375 px dan 1280 px)
- [ ] Lint + typecheck + tes lulus
- [ ] `TASKS.md` diperbarui
