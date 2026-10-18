# PRD — HMIF Proker Manager

> Web app manajemen program kerja (proker) untuk HMIF Telkom University Purwokerto.
> Dokumen ini adalah sumber kebenaran untuk **apa** yang dibangun. Untuk **siapa boleh apa** lihat `ROLES_PERMISSIONS.md`, untuk **bagaimana datanya** lihat `DATABASE_SCHEMA.md`.

---

## 1. Latar Belakang & Tujuan

Setiap periode HMIF menjalankan ±30–50 proker. Koordinasi panitia (pembagian jobdesk, deadline, laporan progres, notulensi) saat ini tersebar di grup chat dan dokumen terpisah sehingga sulit dipantau.

**Tujuan produk**
1. Satu tempat untuk melihat siapa mengerjakan apa, kapan deadline-nya, dan sudah sampai mana.
2. Ketua Pelaksana (Ketupel) bisa membagi jobdesk dan memantau progres semua divisi tanpa harus bertanya satu per satu.
3. Panitia (internal maupun non-HMIF) punya daftar tugas yang jelas dan cara sederhana melaporkan progres beserta link dokumennya.
4. Riwayat proker periode lalu tetap bisa dibuka sebagai referensi.

**Bukan tujuan (non-goals)**
- Bukan sistem akuntansi penuh (keuangan hanya ringkasan anggaran vs realisasi).
- Bukan tempat upload file (lampiran = link Google Drive, dsb.).
- Bukan pengganti grup chat (hanya komentar per task + notifikasi).
- **Tidak ada absensi rapat.**

## 2. Pengguna

| Persona | Deskripsi | Jumlah perkiraan |
|---|---|---|
| Admin | Mengelola akun anggota HMIF, periode, dan membuat proker | 1–3 orang |
| BPH (Ketua & Wakil Ketua) | Memantau semua proker (read-only) | 2 orang |
| Anggota HMIF | Menjadi panitia di satu/lebih proker | 45–55 orang |
| Panitia non-HMIF | Mahasiswa informatika hasil open recruitment, akun dibuat Ketupel | ±10–30 per proker |

Skala: 30–50 proker/periode, 60–70 panitia/proker terbesar. Total pengguna aktif ±150 per periode. Sangat aman untuk free tier.

## 3. Konsep Inti

- **Dua lapis role.** Role global (`admin`, `bph`, `member`, `external`) dan role per proker (`sc`, `pic`, `ketupel`, `sekretaris`, `bendahara`, `koor`, `staff`). Seseorang bisa punya role berbeda di proker berbeda dan **boleh merangkap** lebih dari satu role dalam satu proker.
- **Divisi.** Setiap proker otomatis punya divisi bawaan **Sekretaris** dan **Bendahara**. Divisi lain (Acara, Humas, PDD, dst.) dibuat bebas oleh Ketupel.
- **Jobdesk vs Task.** *Jobdesk* = daftar tanggung jawab per divisi yang dibuat Ketupel. *Task* = pekerjaan konkret dengan status, deadline, penanggung jawab, checklist, dan link; dibuat oleh Koor/Sekretaris/Bendahara.
- **Periode.** Proker dikelompokkan per periode kepengurusan. Proker lama tetap bisa dibuka dan diedit.
- **Kemampuan Admin/Ketupel mengelola akun.** Admin membuat akun anggota HMIF, Ketupel membuat akun non-HMIF.

## 4. Fitur & Prioritas

### MVP (Fase 1–4)
| ID | Fitur |
|---|---|
| F1 | Login username + password, wajib ganti password di login pertama |
| F2 | Admin: kelola akun (buat, nonaktifkan, reset password), kelola periode |
| F3 | Admin: buat proker + tetapkan PIC, Ketupel, dan SC |
| F4 | Dashboard: daftar proker yang diikuti user (+ riwayat per periode) |
| F5 | Ketupel: kelola tim (tambah anggota, tetapkan role), buat divisi, buat akun non-HMIF |
| F6 | Ketupel: buat & bagi jobdesk per divisi/Sekretaris/Bendahara |
| F7 | Task: buat/edit/hapus, deadline, penanggung jawab (divisi atau orang tertentu), status 3 level |
| F8 | Checklist per task + lampiran link (dokumen/spreadsheet/apa pun) |
| F9 | Tracking progres per divisi, Sekretaris, Bendahara, dan keseluruhan proker |
| F10 | Timeline besar (Ketupel) + rapat divisi (Koor) + deadline task, tampil di kalender |
| F11 | Pengumuman rapat + notulensi (Sekretaris), terlihat oleh panitia proker terkait |
| F12 | Halaman "Tugas Saya" lintas proker, urut deadline |
| F13 | Akses BPH/Admin lintas proker (read-only untuk BPH) |

### Fase lanjutan (Fase 5–6)
| ID | Fitur |
|---|---|
| F14 | Notifikasi in-app (task baru, deadline H-3/H-1, rapat baru, komentar) |
| F15 | Komentar per task |
| F16 | Indikator terlambat (overdue) |
| F17 | Ringkasan keuangan (anggaran vs realisasi, link bukti) — **hanya** Bendahara, Ketupel, PIC, SC (+ Admin, BPH) |
| F18 | Dokumen terpusat per proker (proposal, LPJ, folder Drive) |
| F19 | Duplikat struktur proker (divisi + jobdesk) dari proker lain sebagai template |
| F20 | Log aktivitas per proker |
| F21 | Dark mode (opsional) |

### Ditunda / mungkin nanti
Integrasi Google Calendar, bot WhatsApp/Telegram, export PDF laporan, form open recruitment terintegrasi, riwayat kepanitiaan per anggota, evaluasi panitia.

## 5. User Stories (ringkas)

**Admin**
- A1. Sebagai Admin, saya membuat akun anggota HMIF dengan nama lengkap + NIM agar anggota bisa login (username = nama lengkap, password awal = NIM).
- A2. Sebagai Admin, saya mereset password pengguna ke NIM jika lupa.
- A3. Sebagai Admin, saya membuat proker, memilih PIC, Ketupel, dan SC (opsional) dari daftar akun.
- A4. Sebagai Admin, saya mengatur periode aktif dan memindahkan proker ke periode yang tepat.

**Ketua Pelaksana (dan SC/PIC yang punya akses sama)**
- K1. Menambahkan anggota ke proker dan menetapkan role (Sekretaris 1/2, Bendahara 1/2, Koor, Staff).
- K2. Membuat divisi sesuai kebutuhan proker dan menentukan Koor serta staff-nya.
- K3. Membuat akun panitia non-HMIF langsung dari halaman tim proker.
- K4. Menulis jobdesk untuk tiap divisi/Sekretaris/Bendahara.
- K5. Menyusun timeline besar proker (milestone dengan tanggal mulai–selesai).
- K6. Melihat progres semua divisi dalam satu layar.

**Sekretaris / Bendahara / Koor**
- T1. Menambah dan mengedit task untuk unit saya, dengan deadline dan penanggung jawab.
- T2. Mengubah status task dan menandai checklist.
- T3. Melampirkan link dokumen pada task atau item checklist.
- T4. (Koor) Menjadwalkan rapat divisi.
- T5. (Sekretaris) Membuat pengumuman rapat dan menulis notulensi.
- T6. (Bendahara) Mencatat anggaran vs realisasi.

**Staff / Panitia**
- S1. Melihat tugas yang menjadi tanggung jawab saya di semua proker, urut deadline.
- S2. Mengubah status tugas saya dan melampirkan link hasil kerja.
- S3. Membaca pengumuman rapat dan notulensi.

**BPH**
- B1. Melihat dashboard seluruh proker dan progresnya tanpa menjadi panitia.

## 6. Aturan Bisnis Penting

1. Satu orang boleh merangkap role di satu proker (mis. Sekretaris 1 + Staff Acara).
2. Task bisa ditugaskan ke **seluruh divisi** (tanpa assignee) atau ke **satu/lebih orang**.
3. Koor dan Staff bisa mengubah status task; hanya Koor/Sekretaris/Bendahara (di unitnya) dan Manajer proker (SC/PIC/Ketupel) yang bisa membuat/mengedit/menghapus task.
4. Semua panitia proker bisa melihat semua task, timeline, rapat, dan notulensi di proker itu.
5. **Data keuangan** hanya terlihat oleh Bendahara, Ketupel, PIC, SC (plus Admin dan BPH).
6. Proker berstatus `done` tetap bisa diedit; tidak ada mode arsip terkunci.
7. Lampiran hanya berupa URL `http(s)://`.
8. Progres divisi = jumlah task `Selesai` / total task divisi. Progres proker = total seluruh task.
9. Username = nama lengkap (dinormalisasi: huruf kecil, spasi tunggal). Password awal = NIM, **wajib diganti** sebelum bisa memakai aplikasi.

## 7. Batasan Teknis & Biaya

- **Harus 100% gratis**: Next.js di Vercel Hobby + Supabase Free + GitHub. Detail di `TECH_STACK.md`.
- Responsif: mobile-first, tetap nyaman di desktop.
- UI campuran Indonesia–Inggris (istilah umum seperti Dashboard, Task, Deadline boleh tetap Inggris).
- Zona waktu tampilan: Asia/Jakarta (WIB).

## 8. Kriteria Keberhasilan

- Ketupel bisa membuat struktur proker lengkap (divisi, jobdesk, tim) < 15 menit.
- Panitia bisa mengubah status task + melampirkan link < 30 detik di HP.
- ≥ 80% proker periode berjalan memakai aplikasi untuk pelacakan task.
- Tidak ada kebocoran data keuangan ke role yang tidak berhak (diuji lewat tes RLS).

## 9. Asumsi (ubah jika salah)

| # | Asumsi | Dampak jika salah |
|---|---|---|
| 1 | BPH (Ketua/Waketum) hanya **read-only**, termasuk melihat data keuangan | Ubah `can_see_finance` / policy tulis |
| 2 | Admin punya akses penuh ke semua data (termasuk keuangan) sebagai pengaman | Ubah helper `is_admin` |
| 3 | SC dan PIC punya hak identik dengan Ketupel dalam proker | Sudah sesuai permintaan |
| 4 | Staff hanya bisa mengubah status task di divisinya yang ditugaskan ke seluruh divisi atau ke dirinya | Longgarkan fungsi `can_update_task_status` |
| 5 | Task Sekretaris/Bendahara tetap terlihat semua panitia; hanya **modul keuangan** yang dibatasi | Tambah pembatasan visibilitas task |
| 6 | Yang dapat membuat akun non-HMIF: SC, PIC, Ketupel proker tsb. | Persempit ke Ketupel saja |
| 7 | Nama lengkap yang kembar ditangani dengan suffix manual saat pembuatan akun (mis. "budi santoso 2") | Tambah login via NIM |
| 8 | Tidak ada fitur lupa password via email; reset dilakukan Admin (anggota) atau Ketupel (non-HMIF) | Tambah SMTP/email |
