# USER FLOW & PETA HALAMAN

## 1. Alur Utama

```
Login ──► (must_change_password?) ──► Ganti Password ──► Dashboard
                  │ tidak
                  ▼
              Dashboard ── daftar proker yang diikuti user
                  │
                  ▼
              Detail Proker (tab: Ringkasan · Task · Tim · Timeline · Rapat · Keuangan* · Dokumen)
```
`*` hanya tampil untuk Bendahara, Manajer, Admin, BPH.

## 2. Peta Rute

| Rute | Halaman | Akses |
|---|---|---|
| `/login` | Login | Publik |
| `/ganti-password` | Ganti password (wajib saat pertama) | Login |
| `/` | Dashboard: Proker Saya, tugas mendekati deadline, rapat mendatang | Login |
| `/proker/semua` | Semua proker + filter periode/status | Admin, BPH |
| `/proker/[id]` | Ringkasan proker: progres, per-divisi, next deadline | Anggota proker, Admin, BPH |
| `/proker/[id]/task` | Daftar task (filter divisi/status/assignee), buat task | idem |
| `/proker/[id]/task/[taskId]` | Detail task: checklist, link, komentar | idem |
| `/proker/[id]/tim` | Anggota, role, divisi, jobdesk; buat akun non-HMIF | Lihat: anggota. Kelola: Manajer |
| `/proker/[id]/timeline` | Gantt sederhana + kalender (milestone, rapat, deadline) | Anggota |
| `/proker/[id]/rapat` | Daftar pengumuman rapat + notulensi | Anggota |
| `/proker/[id]/rapat/[meetingId]` | Detail rapat + notulensi | Anggota |
| `/proker/[id]/keuangan` | Anggaran vs realisasi | Bendahara, Manajer, Admin, BPH |
| `/proker/[id]/dokumen` | Dokumen terpusat | Anggota |
| `/proker/[id]/aktivitas` | Log aktivitas | Manajer, Admin, BPH |
| `/tugas` | Tugas Saya lintas proker | Login |
| `/kalender` | Kalender gabungan milik saya | Login |
| `/notifikasi` | Daftar notifikasi | Login |
| `/profil` | Profil + ganti password | Login |
| `/admin/pengguna` | Daftar akun, buat, nonaktifkan, reset password | Admin |
| `/admin/pengguna/baru` | Form buat akun (nama lengkap + NIM + angkatan + tipe) | Admin |
| `/admin/proker/baru` | Buat proker + pilih PIC, Ketupel, SC | Admin |
| `/admin/periode` | Kelola periode | Admin |

## 3. Alur Per Role

### 3.1 Admin
1. Login → `/admin/pengguna` → **Buat akun** (nama lengkap, NIM, angkatan). Sistem membuat username (nama lengkap ter-normalisasi), password = NIM, `must_change_password = true`.
2. Jika nama kembar → form menolak dan meminta pembeda (mis. tambah angkatan di akhir username).
3. `/admin/periode` → buat periode (mis. "2026/2027"), tandai periode aktif.
4. `/admin/proker/baru` → isi nama proker, periode, tanggal perkiraan, pilih **PIC** dan **Ketupel** (wajib), **SC** (opsional, boleh banyak) → simpan. Sistem otomatis membuat divisi Sekretaris dan Bendahara.
5. Reset password: pilih user → "Reset ke NIM" (konfirmasi).

### 3.2 Ketua Pelaksana (Manajer)
1. Dashboard → pilih proker → tab **Tim**.
2. **Tambah divisi** (nama bebas, mis. "Acara", "Humas", "Perlengkapan").
3. **Tambah anggota**: cari anggota HMIF (nama), pilih role (Sekretaris 1/2, Bendahara 1/2, Koor, Staff) dan divisinya. Boleh menambah role lain untuk orang yang sama.
4. **Buat akun non-HMIF** (tombol di dialog tambah anggota jika orang tidak ditemukan): nama lengkap + NIM + angkatan → akun tercipta, otomatis masuk proker dengan role terpilih.
5. **Jobdesk**: di kartu tiap divisi/Sekretaris/Bendahara, tambah item jobdesk (judul + deskripsi singkat).
6. Tab **Timeline**: tambah milestone besar (judul, tanggal mulai–selesai).
7. Tab **Ringkasan**: pantau progres per divisi.

### 3.3 Sekretaris
1. Tab **Task**: tambah/edit task untuk unit Sekretaris (judul, deskripsi, deadline, assignee atau seluruh unit).
2. Tab **Rapat**: **Buat pengumuman rapat** (judul, tanggal-jam, lokasi/link meeting, agenda) → muncul di dashboard panitia + notifikasi.
3. Setelah rapat: buka rapat → **Tulis notulensi** (teks sederhana/markdown + opsional link dokumen).
4. Tab **Dokumen**: tambah link proposal/LPJ/folder.

### 3.4 Bendahara
1. Tab **Task** untuk unit Bendahara.
2. Tab **Keuangan**: tambah pos anggaran (kategori, nominal rencana), isi realisasi + link bukti.

### 3.5 Koor Divisi
1. Tab **Task**: tambah/edit task divisinya; tugaskan ke seluruh divisi atau staff tertentu.
2. Tab **Rapat**: jadwalkan **rapat divisi**; tulis notulensi rapat divisinya.
3. Ubah status task, centang checklist, tambah link.

### 3.6 Staff / Panitia
1. Login → Dashboard → `/tugas` atau masuk ke proker.
2. Buka task → ubah status (Belum Dimulai → On Progress → Selesai), centang checklist, tempel link hasil.
3. Baca pengumuman rapat dan notulensi.

### 3.7 BPH
1. Login → `/proker/semua` → pilih proker → semua tab (read-only).

## 4. Detail Interaksi Penting

**Ubah status task (target < 30 detik di HP)**
Daftar task → tap chip status → bottom sheet 3 pilihan → pilih → toast "Status diperbarui". Tidak perlu membuka halaman detail.

**Menambah link**
Di detail task → "Tambah link" → isi label (opsional) + URL → validasi `http(s)://` → tersimpan sebagai daftar link dengan ikon domain sederhana. Link bisa dilekatkan ke task atau ke item checklist tertentu.

**Tugas diberikan ke divisi vs orang**
Form task: field "Ditugaskan ke" → default "Seluruh divisi", opsi "Orang tertentu" membuka multi-select anggota divisi tersebut.

**Kalender/Timeline**
Menggabungkan tiga sumber: milestone (Manajer), rapat (Sekretaris/Koor), deadline task. Filter per jenis. Mobile: tampilan agenda (daftar per hari). Desktop: bulan + Gantt milestone.

**State kosong**
Setiap halaman punya empty state yang menunjukkan langkah berikutnya (mis. "Belum ada divisi. Tambah divisi pertama").

## 5. Notifikasi (Fase 5)
| Pemicu | Penerima |
|---|---|
| Task ditugaskan | Assignee (atau seluruh anggota divisi) |
| Deadline H-3 dan H-1 (task belum selesai) | Assignee/divisi |
| Task terlambat | Assignee + Koor |
| Rapat baru dibuat | Panitia proker (atau anggota divisi untuk rapat divisi) |
| Notulensi dipublikasikan | Peserta rapat (panitia terkait) |
| Komentar baru di task | Assignee + pembuat task |
| Ditambahkan ke proker | User tersebut |
