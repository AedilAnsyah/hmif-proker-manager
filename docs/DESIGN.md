# DESIGN SYSTEM — HMIF Proker Manager

**Karakter:** tegas, tenang, fungsional. Seperti papan kerja yang rapi: banyak ruang putih, tipografi jelas, hitam untuk struktur, kuning hanya untuk hal yang perlu perhatian atau aksi utama.
**Prinsip:** (1) isi dulu, hiasan belakangan; (2) satu aksi utama per layar; (3) informasi paling penting terbaca dalam 2 detik; (4) nyaman satu tangan di HP.

---

## 1. Anti-"AI Slop" — Daftar Larangan

Jangan lakukan hal berikut:
- Gradien (terutama ungu/biru), efek glass/blur, glow, bayangan besar yang lembut.
- Emoji sebagai ikon atau pada judul/sapaan ("Selamat datang kembali 👋").
- Grid kartu seragam yang masing-masing berisi lingkaran ikon + judul + 2 baris teks generik.
- Sudut terlalu bulat (`rounded-2xl/3xl`) di mana-mana, semuanya berbentuk pil.
- Ilustrasi 3D/blob/stok, hero section raksasa di dalam aplikasi.
- Teks pengisi: "Lorem ipsum", "Fitur hebat", "Solusi terbaik", "Tingkatkan produktivitas".
- Statistik hiasan tanpa makna (angka besar yang tidak bisa ditindaklanjuti).
- Animasi berlebihan (bounce, parallax, gerak otomatis).
- Terlalu banyak warna: hanya putih, hitam, kuning (+ satu merah fungsional).

Lakukan:
- Garis tipis 1 px sebagai struktur, bukan bayangan.
- Data nyata & copy spesifik ("Deadline 3 hari lagi", "Belum ada divisi. Tambah divisi pertama").
- Hierarki lewat ukuran, bobot, dan jarak, bukan lewat warna.
- Satu "tanda tangan visual": **penanda kuning** (garis/blok kuning solid) untuk item aktif dan aksi utama.

## 2. Warna

```css
:root {
  /* Netral */
  --bg:           #FFFFFF;   /* latar halaman */
  --surface:      #F6F5F0;   /* latar sekunder: sidebar, header tabel, input disabled */
  --line:         #E6E4DC;   /* garis pemisah, border kartu */
  --line-strong:  #0A0A0A;   /* border penting, fokus */
  --ink:          #0A0A0A;   /* teks utama */
  --ink-2:        #55534C;   /* teks sekunder (kontras ≥ 7:1 di atas putih) */
  --ink-3:        #6F6C63;   /* teks tersier/placeholder (≥ 5:1) */

  /* Aksen */
  --accent:       #FFC800;   /* kuning utama */
  --accent-hover: #F0BA00;
  --accent-soft:  #FFF3C0;   /* latar lembut: baris yang perlu perhatian */
  --on-accent:    #0A0A0A;   /* teks di atas kuning SELALU hitam */

  /* Fungsional (dipakai hemat) */
  --danger:       #C62F1B;   /* error, hapus, terlambat */
  --danger-soft:  #FCE9E5;
}

/* Dark mode (opsional, Fase 6) */
[data-theme="dark"] {
  --bg:#0B0B0A; --surface:#151513; --line:#2A2925; --line-strong:#F5F4EE;
  --ink:#F5F4EE; --ink-2:#BDBAAF; --ink-3:#9A978C;
  --accent:#FFC800; --accent-hover:#FFD633; --accent-soft:#2B2400; --on-accent:#0A0A0A;
  --danger:#FF6B57; --danger-soft:#2E1511;
}
```

**Aturan pemakaian**
- Teks selalu `--ink`/`--ink-2`/`--ink-3`. **Kuning tidak pernah jadi warna teks di atas putih** (kontras rendah). Kuning hanya sebagai latar (dengan teks hitam), garis, atau titik.
- Kuning solid = aksi utama (tombol primer), item navigasi aktif, status **On Progress**, penanda "berikutnya/segera".
- Hitam solid = struktur & selesai (tombol sekunder gelap, status **Selesai**, progress bar).
- Merah hanya untuk error, tombol hapus, dan label **Terlambat**.
- Jangan menambahkan warna lain (hijau/biru/ungu) untuk status.

## 3. Tipografi

| Peran | Font (Google Fonts via `next/font`) | Catatan |
|---|---|---|
| UI & judul | **Schibsted Grotesk** (400, 500, 600, 700) | Grotesk bersih dengan karakter; bukan Inter/Space Grotesk |
| Angka, tanggal, label kecil, kode | **JetBrains Mono** (400, 500) | Memberi kesan "papan kerja" dan rapi untuk tanggal/angka |

Skala (mobile → desktop):

| Token | Ukuran / Line-height | Bobot | Pemakaian |
|---|---|---|---|
| `display` | 28/32 → 36/40 | 700, letter-spacing −0.02em | Judul halaman utama (nama proker) |
| `h1` | 22/28 → 26/32 | 700 | Judul halaman |
| `h2` | 17/24 → 18/26 | 600 | Judul bagian/kartu |
| `body` | 15/22 | 400 | Teks utama |
| `body-sm` | 13/20 | 400/500 | Meta, keterangan |
| `label` (mono) | 11/16, uppercase, tracking 0.06em | 500 | Label kecil, header tabel, tanggal |

Aturan: maksimal dua bobot per layar; judul tidak pernah center-aligned di dalam aplikasi; panjang baris teks ≤ 70 karakter.

## 4. Spasi, Bentuk, Layout

- Grid spasi **4 px**: 4, 8, 12, 16, 24, 32, 48.
- Radius: `--r-sm 4px` (chip, input kecil), `--r-md 6px` (tombol, input), `--r-lg 10px` (kartu, dialog). Pil penuh hanya untuk avatar dan chip status.
- Border 1 px `--line`. Tanpa bayangan; satu-satunya bayangan: dialog/bottom sheet `0 8px 24px rgba(0,0,0,.12)`.
- Target tap ≥ **44×44 px**.
- Lebar konten maksimum 1120 px; halaman bacaan (notulensi) 720 px.
- Breakpoint: `sm 640`, `md 768`, `lg 1024`. Desain **mobile-first**.
- Fokus keyboard: outline 2 px `--ink`, offset 2 px (di mode gelap: `--accent`).

## 5. Layout Aplikasi

**Mobile (< 1024 px)**
- Header atas tipis (judul halaman + aksi kontekstual).
- **Tab bar bawah** 4 item: Dashboard · Tugas · Kalender · Profil. Item aktif: garis kuning 3 px di atas ikon + label bold.
- Notifikasi: ikon lonceng di header dengan titik kuning jika belum dibaca.
- Detail proker: tab horizontal yang bisa digeser (Ringkasan, Task, Tim, Timeline, Rapat, …).
- Aksi utama (mis. "Tambah task") sebagai tombol kuning di bawah daftar atau FAB persegi (radius 10 px), bukan lingkaran besar.
- Dialog di HP = **bottom sheet**.

**Desktop (≥ 1024 px)**
- Sidebar kiri 240 px, latar `--surface`: logo teks "HMIF" mono + daftar menu; item aktif punya blok kuning 3 px di kiri.
- Konten di tengah, tab detail proker sebagai tab teks dengan garis bawah kuning pada yang aktif.
- Tabel/daftar lebih padat; panel detail task boleh muncul sebagai drawer kanan.

## 6. Komponen

### Tombol
| Varian | Gaya |
|---|---|
| Primer | latar `--accent`, teks hitam, bobot 600, tinggi 44 (HP) / 40 (desktop); hover `--accent-hover`; **satu per layar** |
| Sekunder | latar `--ink`, teks putih |
| Garis | latar transparan, border 1 px `--line-strong`, teks hitam |
| Teks | tanpa border; garis bawah saat hover |
| Bahaya | border/teks `--danger`; konfirmasi dialog sebelum dieksekusi |
Status loading: spinner kecil + teks "Menyimpan…", tombol disabled.

### Input
Tinggi 44, border 1 px `--line`, radius 6, label di atas (bukan placeholder-only), fokus: border `--ink` + outline. Error: border `--danger`, pesan di bawah dengan ikon alert. Helper text `--ink-3`.

### Status Chip (3 status task) — selalu ikon + teks, tidak bergantung warna saja
| Status | Tampilan |
|---|---|
| **Belum Dimulai** | border 1 px `--line-strong`, latar putih, ikon lingkaran kosong |
| **On Progress** | latar `--accent`, teks hitam, ikon lingkaran setengah terisi |
| **Selesai** | latar `--ink`, teks putih, ikon centang |
Chip bisa ditekan (untuk yang berhak) → membuka menu/bottom sheet 3 pilihan.

### Penanda Deadline
- Normal: teks mono `--ink-2` ("24 OKT").
- ≤ 3 hari: latar `--accent-soft`, teks hitam, label "3 hari lagi".
- Terlambat: teks `--danger` bobot 600, ikon jam, label "Terlambat 2 hari". Tidak untuk task `Selesai`.

### Progress Bar
Tinggi 6 px, track `--line`, isi `--ink`, radius 2. Di sampingnya angka mono "12/20". Jangan pakai donut/lingkaran.

### Baris Task (komponen terpenting)
```
[chip status]  Judul task (body, 500)                      24 OKT
               Divisi Acara · Budi S., Rina A. · ☑ 3/5 · 🔗 2   ← meta (body-sm, ink-2; ikon lucide, bukan emoji)
```
- HP: dua baris, chip di kiri atas, deadline di kanan.
- Satu garis pemisah 1 px antar baris; tidak memakai kartu terpisah.
- Baris yang terlambat/segera: garis kiri 3 px (`--danger` / `--accent`).

### Kartu Proker (dashboard)
Border 1 px, radius 10, padding 16. Isi: nama proker (h2), chip role user ("Ketua Pelaksana", "Koor Acara"), progress bar + "18/40 task", dan satu baris "Berikutnya: *Rapat divisi, Sel 21 Okt*" dengan penanda kuning kecil. Tanpa gambar/ikon dekoratif. Tata letak: 1 kolom (HP), 2–3 kolom (desktop).

### Kartu Divisi (di Ringkasan & Tim)
Nama divisi, Koor, progress bar, ringkasan "Belum 3 · Progress 4 · Selesai 5", dan tautan "Lihat task".

### Avatar
Inisial 1–2 huruf di lingkaran 28/32 px, latar `--surface`, border `--line`, teks mono. Tanpa foto pada MVP.

### Tab
Teks `body-sm` 600; aktif: garis bawah kuning 3 px + teks hitam; non-aktif `--ink-2`.

### Dialog / Bottom Sheet
Judul h2, isi form, tombol primer di kanan bawah (desktop) atau penuh lebar (HP). Esc / klik luar menutup bila tidak ada perubahan belum disimpan.

### Toast
Bar hitam teks putih di bawah (HP) / kanan bawah (desktop), 3 detik, satu kalimat ("Status diperbarui").

### Tabel
Desktop: header `label` mono di latar `--surface`, baris dipisah garis. **HP: ubah menjadi daftar bertumpuk**, tidak ada scroll horizontal untuk data inti.

### State Kosong
Judul singkat + satu kalimat + satu tombol aksi. Tanpa ilustrasi. Contoh: "Belum ada task. Buat task pertama untuk divisi ini."

### Loading
Skeleton persegi berwarna `--surface`, tanpa shimmer berlebihan.

### Ikon
lucide-react, stroke 1.75, ukuran 16/20 px, warna mengikuti teks.

## 7. Wireframe Halaman Kunci

**Dashboard (HP)**
```
┌──────────────────────────────┐
│ Dashboard                 🔔 │
├──────────────────────────────┤
│ SEGERA (mono label)          │
│ ▍Susun rundown      24 OKT   │ ← garis kuning kiri
│ ▍Pesan konsumsi     25 OKT   │
├──────────────────────────────┤
│ PROKER SAYA                  │
│ ┌──────────────────────────┐ │
│ │ Makrab Informatika       │ │
│ │ [Ketua Pelaksana]        │ │
│ │ ▓▓▓▓▓▓░░░░ 18/40         │ │
│ │ ▍Berikutnya: Rapat Sel 21│ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Seminar Teknologi …      │ │
│ └──────────────────────────┘ │
│ Riwayat periode lalu  ›      │
├──────────────────────────────┤
│ Dashboard Tugas Kalender Profil│ ← tab bar
└──────────────────────────────┘
```

**Ringkasan Proker (desktop)**
```
Makrab Informatika                          [Edit]
Periode 2026/2027 · 12 Nov – 14 Nov · Aktif
─────────────────────────────────────────────────
Ringkasan | Task | Tim | Timeline | Rapat | Keuangan | Dokumen
 ═════════
Progres keseluruhan  ▓▓▓▓▓▓░░░░ 18/40      Terlambat: 2

Divisi                Koor        Progres        Belum Progress Selesai
Sekretaris            Rina A.     ▓▓▓▓▓▓▓░ 7/9      1      1      7
Bendahara             Doni P.     ▓▓▓░░░░░ 3/8      3      2      3
Acara                 Budi S.     ▓▓░░░░░░ 4/15     8      3      4
...
Timeline berikutnya   • 21 Okt  Rapat divisi Acara
                      • 24 Okt  Susun rundown (deadline)
```

**Detail Task (HP, sheet penuh)**
```
‹ Susun rundown                    ⋯
[On Progress ▾]   Deadline 24 Okt 2026
Divisi Acara · Ditugaskan: Budi S., Rina A.

Deskripsi …

CHECKLIST            3/5
☑ Draft kasar        🔗 Docs
☑ Review Ketupel
☐ Final

LINK
🔗 Rundown v2 (docs.google.com)
[+ Tambah link]

KOMENTAR (Fase 5)
```
(Ikon pada wireframe hanya ilustrasi; di aplikasi gunakan ikon lucide.)

## 8. Copywriting

- Nada: lugas, sopan, tidak lebay. Kalimat aktif pendek.
- Tombol memakai kata kerja: "Tambah task", "Simpan", "Buat akun". Hindari "Submit"/"OK".
- Format tanggal `24 Okt 2026`; jam `14.30 WIB`; relatif ("3 hari lagi") untuk deadline dekat.
- Pesan error menjelaskan solusi: "Username atau password salah. Hubungi Admin jika lupa password." / "Link harus diawali http:// atau https://".
- Istilah baku: Proker, Ketua Pelaksana (Ketupel), Person in Charge (PIC), Steering Committee (SC), Sekretaris, Bendahara, Koordinator (Koor), Staff, Divisi, Jobdesk, Task, Deadline, Notulensi.

## 9. Aksesibilitas

- Kontras teks ≥ 4.5:1 (token di atas sudah memenuhi).
- Status/aksi tidak hanya dibedakan warna: selalu ikon + teks.
- Semua elemen interaktif bisa dijangkau keyboard; urutan fokus logis; `aria-label` untuk tombol ikon.
- Hormati `prefers-reduced-motion`; animasi hanya transisi 120–160 ms (opacity/translate kecil).
- Form: label terhubung, error dibacakan (`aria-live`).

## 10. Contoh Token Tailwind (acuan `tailwind.config`)

```ts
theme: {
  extend: {
    colors: {
      bg: 'var(--bg)', surface: 'var(--surface)', line: 'var(--line)',
      ink: { DEFAULT: 'var(--ink)', 2: 'var(--ink-2)', 3: 'var(--ink-3)' },
      accent: { DEFAULT: 'var(--accent)', hover: 'var(--accent-hover)', soft: 'var(--accent-soft)' },
      danger: { DEFAULT: 'var(--danger)', soft: 'var(--danger-soft)' },
    },
    borderRadius: { sm: '4px', md: '6px', lg: '10px' },
    fontFamily: { sans: ['var(--font-schibsted)'], mono: ['var(--font-jetbrains)'] },
  },
}
```

## 11. Checklist Review Desain (sebelum PR UI digabung)

- [ ] Hanya putih/hitam/kuning (+ merah fungsional)
- [ ] Tidak ada gradien, glass, emoji, bayangan tebal
- [ ] Satu tombol primer per layar
- [ ] Dites di 375 px dan 1280 px, tanpa scroll horizontal
- [ ] Target tap ≥ 44 px, fokus keyboard terlihat
- [ ] Ada state loading, kosong, error
- [ ] Copy spesifik, Bahasa Indonesia, tanggal format Indonesia
