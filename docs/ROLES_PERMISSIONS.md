# ROLES & PERMISSIONS

Dua lapis role. **Semua aturan ini wajib ditegakkan di database (RLS), bukan hanya di UI.**

## 1. Role Global (tabel `profiles.global_role`)

| Role | Siapa | Kemampuan |
|---|---|---|
| `admin` | Pengurus yang ditunjuk | Buat/nonaktifkan akun, reset password, kelola periode, buat/hapus proker, tetapkan PIC/Ketupel/SC, akses penuh semua data |
| `bph` | Ketua & Wakil Ketua HMIF | Melihat **semua** proker, tim, task, timeline, rapat, notulensi, dan keuangan. **Read-only** |
| `member` | Anggota HMIF | Hanya melihat proker yang dia ikuti (sesuai role proker) |
| `external` | Panitia non-HMIF | Sama seperti `member`; tidak punya akses ke fitur Admin |

## 2. Role Per Proker (tabel `proker_roles`)

| Role | Catatan |
|---|---|
| `sc` Steering Committee | Hak = Manajer proker (sama seperti Ketupel) |
| `pic` Person in Charge | Hak = Manajer proker |
| `ketupel` Ketua Pelaksana | Hak = Manajer proker |
| `sekretaris` | Sekretaris 1 / 2 (label bebas). Terikat ke divisi bawaan **Sekretaris** |
| `bendahara` | Bendahara 1 / 2. Terikat ke divisi bawaan **Bendahara** |
| `koor` | Koordinator satu divisi |
| `staff` | Staff satu divisi |

- Satu user boleh punya **banyak baris role** di satu proker (merangkap).
- "**Manajer proker**" = `sc` / `pic` / `ketupel`.

## 3. Matriks Akses Dalam Proker

Legenda: ✅ boleh · ❌ tidak · 🔸 dengan syarat (lihat catatan) · 👁 hanya lihat

| Aksi | Admin | BPH | Manajer (SC/PIC/Ketupel) | Sekretaris | Bendahara | Koor | Staff |
|---|---|---|---|---|---|---|---|
| Melihat proker, tim, task, timeline, rapat, notulensi | ✅ | 👁 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Membuat proker, hapus proker | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Menetapkan/ubah PIC, Ketupel, SC | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit deskripsi, tanggal, status proker | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Kelola anggota & role proker | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Buat akun panitia non-HMIF | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reset password panitia non-HMIF proker itu | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Buat/ubah/hapus divisi | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Buat/ubah/hapus jobdesk | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Timeline besar (milestone) | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Buat/edit/hapus **task** | ✅ | ❌ | ✅ (semua divisi) | 🔸 unit Sekretaris | 🔸 unit Bendahara | 🔸 divisinya | ❌ |
| Menugaskan task ke divisi/orang | ✅ | ❌ | ✅ | 🔸 | 🔸 | 🔸 | ❌ |
| **Ubah status** task | ✅ | ❌ | ✅ | 🔸 unitnya | 🔸 unitnya | 🔸 divisinya | 🔸 lihat catatan 3 |
| Checklist + lampiran link pada task | ✅ | ❌ | ✅ | 🔸 | 🔸 | 🔸 | 🔸 sama dengan ubah status |
| Komentar pada task | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Jadwalkan rapat **seluruh panitia** + pengumuman | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Jadwalkan rapat **divisi** | ✅ | ❌ | ✅ | ✅ | ✅ | 🔸 divisinya | ❌ |
| Tulis/ubah notulensi | ✅ | ❌ | ✅ | ✅ | ❌ | 🔸 rapat divisinya | ❌ |
| Lihat/ubah **keuangan** | ✅ | 👁 | ✅ | ❌ | ✅ | ❌ | ❌ |
| Tambah dokumen terpusat | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Duplikat struktur proker (template) | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Lihat log aktivitas | ✅ | 👁 | ✅ | ❌ | ❌ | ❌ | ❌ |

### Catatan
1. **Unit** = divisi tempat user memegang role tersebut. Sekretaris 1 dan 2 punya hak sama; begitu pula Bendahara 1 dan 2.
2. **Hak gabungan.** Jika user merangkap role, hak yang berlaku adalah gabungan (union) seluruh role-nya.
3. **Staff** boleh mengubah status task di divisinya **jika** task itu ditugaskan ke seluruh divisi (tanpa assignee spesifik) **atau** dia salah satu assignee. Staff tidak bisa mengubah task yang ditugaskan khusus ke staff lain. (Asumsi #4 PRD)
4. Pengubahan status oleh Staff dilakukan lewat **RPC** `set_task_status` (bukan UPDATE langsung) supaya Staff tidak bisa mengubah kolom lain (judul, deadline, dsb.).
5. BPH tidak boleh menulis apa pun. Jika BPH juga terdaftar sebagai panitia suatu proker, hak tulisnya mengikuti role proker-nya.

## 4. Akses Lintas Proker

| Halaman | Siapa |
|---|---|
| Dashboard "Proker Saya" | Semua user (hanya proker yang diikuti) |
| "Semua Proker" | Admin, BPH |
| "Tugas Saya" | Semua user (hanya task yang relevan baginya, lihat §5) |
| Panel Admin (`/admin/*`) | Admin |

## 5. Definisi "Tugas Saya"
Task yang (a) di-assign langsung ke user, **atau** (b) ditugaskan ke seluruh divisi di mana user menjadi Koor/Staff/Sekretaris/Bendahara. Status ≠ `selesai` ditampilkan lebih dulu, urut deadline terdekat.

## 6. Keamanan Akun

- Username = nama lengkap (ter-normalisasi), password awal = NIM → **sangat lemah**. Mitigasi wajib:
  1. `must_change_password = true` pada akun baru dan setelah reset; semua rute aplikasi dialihkan ke `/ganti-password` sampai diganti.
  2. Password baru ≥ 8 karakter dan tidak boleh sama dengan NIM.
  3. **NIM tidak boleh terlihat** oleh siapa pun kecuali Admin dan pemilik akun (disimpan di tabel terpisah `profile_private`).
  4. Admin tidak dapat melihat password pengguna; reset = menimpa dengan NIM + flag ganti password.
  5. Akun `is_active = false` tidak bisa login dan diabaikan oleh semua helper RLS.
- Pembuatan/reset akun memakai **service role key** dan hanya di server action yang memeriksa hak pemanggil lebih dulu. Key ini tidak boleh pernah sampai ke browser.
