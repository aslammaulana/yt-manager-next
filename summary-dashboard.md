# Ringkasan Fitur & Tombol — Dashboard (`/dashboard`)

Dokumen ini mencatat **semua fitur, tombol, dan elemen interaktif** yang ada di halaman Dashboard.

---

## Layout Utama

Dashboard menggunakan layout 3 bagian:

```
┌─────────────────────────────────────────────────┐
│              DESKTOP HEADER (fixed top)          │
├───────────┬─────────────────────────────────────┤
│           │                                     │
│  SIDEBAR  │          KONTEN UTAMA               │
│  (330px)  │    (scrollable, padding 24-40px)    │
│           │                                     │
└───────────┴─────────────────────────────────────┘
```

**Mobile:** Header sticky atas + seluruh konten full-width, sidebar muncul sebagai drawer overlay saat hamburger menu ditekan.

---

## Komponen yang Digunakan

| Komponen | Sumber | Fungsi |
|---|---|---|
| `DesktopHeader` | `@/components/DesktopHeader` | Header fixed atas (logo, ThemeToggle, info user) |
| `MobileHeader` | `@/components/MobileHeader` | Header mobile (hamburger, logo, ThemeToggle, avatar) |
| `AppSidebar` | `@/components/AppSidebar` | Sidebar navigasi (Dashboard, Tambah Channel, Settings, Admin, Sign Out) |
| `ThemeToggle` | `@/components/ThemeToggle` | Dropdown ganti tema (Terang/Gelap/Sistem) |

---

## Elemen Per Section (Atas ke Bawah)

---

### 1. Desktop Header (komponen terpisah)
- **Logo "YT Manager"** — klik menuju `/` (home)
- **🌙/☀️ Theme Toggle** — dropdown pilih tema: Terang, Gelap, Sistem
- **Info User** — menampilkan nama lengkap + email user yang login
- **Avatar User** — gambar `/user.svg`

### 2. Mobile Header (komponen terpisah)
- **☰ Hamburger Menu** — buka sidebar drawer
- **Logo "YouTube Manager"** — klik menuju `/dashboard`
- **🌙/☀️ Theme Toggle** — sama seperti desktop
- **Avatar User** — gambar `/user.svg`

### 3. Sidebar (komponen terpisah)
Menu navigasi:
- **Dashboard** — link ke `/dashboard` (aktif: highlight biru)
- **Tambah Channel** — trigger `googleSignIn()` (Google OAuth popup)
- **Settings** — link ke `/settings`
- **Kelola User** — link ke `/admin` (hanya tampil jika role = `admin`)
- **Sign Out** — tombol merah, logout lalu redirect ke `/login`
- **Status Indicator** — dot hijau pulse "System Operational"

---

### 4. Topbar (Judul Halaman)

| Elemen | Detail |
|---|---|
| **Judul** | "Dashboard" — teks besar bold |
| **Subtitle** | "Pantau performa channel secara realtime" — teks gray kecil |

---

### 5. Stats Cards (4 Kartu Statistik)

Grid 2 kolom (mobile) / 4 kolom (desktop).

| # | Kartu | Ikon | Warna Ikon | Data yang Ditampilkan |
|---|---|---|---|---|
| 1 | **SUBSCRIBERS** | `Users` | Biru `#3d7aff` | Total subscriber gabungan semua channel |
| 2 | **TOTAL VIEWS** | `Eye` | Biru-400 | Total views gabungan semua channel |
| 3 | **3D VIEWS** | `Activity` | Kuning-400 | Total views 3 hari terakhir (realtime) — angka berwarna kuning |
| 4 | **CHANNELS** | `Zap` | Hijau-400 | Jumlah channel terdaftar + timestamp sync terakhir |

- Card pertama (Subscribers) memiliki **garis atas gradient biru**.
- Card lainnya garis atas `bg-white/10` (subtle).
- Semua angka diformat dengan `toLocaleString("id-ID")` (pemisah titik, contoh: 1.234.567).

---

### 6. Status Bar

| Elemen | Detail |
|---|---|
| **Status Indicator** | Pill rounded-full berisi dot warna + teks status |
| — Dot Hijau + "Dashboard Aktif" | Semua data berhasil di-sync |
| — Dot Kuning + "Syncing" | Sedang proses sinkronisasi data |
| — Dot Merah + "Database Offline" / "Database Kosong" | Gagal atau kosong |
| **Tombol "Layout"** | Tombol biru `#155dfc` dengan ikon `LuLayoutTemplate` — *(belum ada fungsi yang terhubung)* |

---

### 7. Search & Action Card

Card full-width berisi:

| Elemen | Tipe | Detail |
|---|---|---|
| **🔍 Input Pencarian** | Input text | Placeholder "Cari Channel...", filter realtime di tabel berdasarkan nama channel |
| **🔄 Tombol Refresh** | Button | Ikon `RefreshCw`, klik: panggil `fetchAllChannelsData()` — ikon berputar (`animate-spin`) saat loading |
| **⬆️ Tombol "Tambah Channel"** | Button | Ikon `Upload` + teks "Tambah Channel" (teks tersembunyi di mobile). Klik: jalankan `googleSignIn()` — buka Google OAuth consent screen |

---

### 8. Channel List / Tabel Data

Terdapat **2 tampilan** tergantung layar:

#### 8a. Desktop: Tabel (`<table>`)

**Header Tabel:**
- Judul "Channel List" di kiri
- **Tombol "Salin Data"** (ikon `Copy`) — klik: salin semua data channel ke clipboard dalam format JSON
- **Tombol "Tempel Data"** (ikon `ClipboardPaste`) — klik: buka Paste Modal untuk import
- ⚠️ Kedua tombol ini **tersembunyi di mobile** (`hidden md:flex`)

**Kolom Tabel (7 kolom):**

| Kolom | Data | Interaktif? |
|---|---|---|
| **Channel Name** | Thumbnail (32px bulat) + nama channel | Tidak |
| **Subs** | Jumlah subscriber (atau "---" jika expired) | Tidak |
| **Total Views** | Jumlah total views (atau "---" jika expired) | Tidak |
| **3D VIEWS** | Views 3 hari terakhir, warna kuning bold (atau "---") | Tidak |
| **Upload** | Tombol "UPLOAD" atau badge "EXPIRED" | ✅ Ya |
| **Videos** | Tombol "LIHAT" atau teks disabled | ✅ Ya |
| **Action** | Tombol hapus (ikon `Trash2` merah) | ✅ Ya |

**Tombol per Baris:**

| Tombol | Kondisi | Aksi |
|---|---|---|
| **UPLOAD** | Channel aktif (tidak expired) | `handleManagerOpen(ch)` — simpan data channel ke `sessionStorage`, buka `/manager` di tab baru |
| **EXPIRED** (badge) | Channel token expired | Tidak bisa diklik, hanya badge merah |
| **LIHAT** | Channel aktif | Link ke `/videos?id={channelId}&email={email}` — buka halaman daftar video channel |
| **LIHAT** (disabled) | Channel expired | Tidak bisa diklik, teks abu-abu |
| **🗑️ Hapus** | Selalu tampil | `handleDelete(email)` — konfirmasi dialog lalu hapus channel dari database via `/api/delete-account` |

#### 8b. Mobile: Card List

Setiap channel ditampilkan sebagai card vertikal:

| Bagian | Elemen |
|---|---|
| **Header Card** | Thumbnail (40px bulat) + Nama channel (bold) + Subs & Views (12px, separated by "•") |
| **🗑️ Delete** | Ikon `Trash2` di pojok kanan atas card |
| **Box 3D Views** | Background gelap, label "3D Views" uppercase + angka kuning besar bold |
| **Tombol UPLOAD** | Biru `#155dfc`, full-width (flex-1), font bold — buka Manager di tab baru |
| **Tombol Video** | Kotak kecil abu-abu dengan ikon `Video` — link ke halaman video channel |
| **Badge EXPIRED** | Merah full-width `bg-red-500/10 text-red-500` — menggantikan tombol UPLOAD & Video jika expired |

---

### 9. Footer

| Elemen | Detail |
|---|---|
| **Copyright Text** | "© 2026 Bang Memed Project. All rights reserved." — tengah, teks slate-500 kecil, border-top |

---

### 10. Paste Modal (Pop-up)

Muncul saat tombol **"Tempel Data"** ditekan.

| Elemen | Detail |
|---|---|
| **Overlay** | Fullscreen hitam transparan `bg-black/80 backdrop-blur-sm` |
| **Judul Modal** | "Tempel Data Channel" — putih bold |
| **Textarea** | Area input besar (h-40), placeholder: `Paste JSON array here...`, background `#0f0f0f` |
| **Tombol "Batal"** | Tutup modal, reset isi textarea |
| **Tombol "Simpan Data"** | Biru `#155dfc`, klik: panggil `handlePasteSubmit()` — kirim JSON ke `/api/import-data` lalu refresh data |

---

## Ringkasan Semua Tombol

| # | Tombol / Aksi | Lokasi | Fungsi |
|---|---|---|---|
| 1 | **☰ Hamburger Menu** | Mobile Header | Buka sidebar drawer |
| 2 | **🌙/☀️ Theme Toggle** | Header (desktop & mobile) | Ganti tema Terang/Gelap/Sistem |
| 3 | **Dashboard** | Sidebar | Navigasi ke `/dashboard` |
| 4 | **Tambah Channel** | Sidebar | Google OAuth — tambah channel YouTube baru |
| 5 | **Settings** | Sidebar | Navigasi ke `/settings` |
| 6 | **Kelola User** | Sidebar (admin only) | Navigasi ke `/admin` |
| 7 | **Sign Out** | Sidebar | Logout → redirect ke `/login` |
| 8 | **Layout** | Status Bar | *(belum ada fungsi)* |
| 9 | **🔍 Search** | Search Card | Filter channel berdasarkan nama (realtime) |
| 10 | **🔄 Refresh** | Search Card | Sinkronisasi ulang semua data channel dari API |
| 11 | **⬆️ Tambah Channel** | Search Card | Google OAuth — sama seperti sidebar |
| 12 | **📋 Salin Data** | Tabel header (desktop only) | Copy semua data channel ke clipboard (JSON) |
| 13 | **📋 Tempel Data** | Tabel header (desktop only) | Buka modal import data channel |
| 14 | **UPLOAD** | Per baris channel | Buka halaman Manager (`/manager`) di tab baru |
| 15 | **LIHAT** | Per baris channel | Link ke halaman Video (`/videos`) channel tersebut |
| 16 | **🗑️ Hapus** | Per baris channel | Hapus channel dari database (dengan konfirmasi) |
| 17 | **Simpan Data** | Paste Modal | Kirim data JSON import ke server |
| 18 | **Batal** | Paste Modal | Tutup modal tanpa aksi |

---

## Data / State yang Ditampilkan

| State | Tipe | Sumber | Keterangan |
|---|---|---|---|
| `channels` | `MergedChannel[]` | `/api/get-stats` + YouTube API | Daftar semua channel yang terdaftar |
| `totalSubs` | number | Dihitung dari `channels` | Total subscriber gabungan |
| `totalViews` | number | Dihitung dari `channels` | Total views gabungan |
| `totalRealtime` | number | Dihitung dari `channels` | Total 3D views gabungan |
| `totalChannel` | number | `channels.length` | Jumlah channel |
| `lastUpdate` | string | Timestamp saat data berhasil di-sync | Contoh: "14:30:05 (Auto-Sync)" |
| `statusMsg` | string | Set oleh `setStatus()` | Pesan status sistem |
| `isOnline` | boolean | Set oleh `setStatus()` | Apakah sistem online |
| `search` | string | Input pencarian | Filter nama channel |
| `loading` | boolean | Saat fetch data | Tampilkan spinner / "Loading data..." |
| `user` | object | Supabase Auth session | Data user yang login (email, nama) |
| `role` | string | Tabel `profiles` Supabase | Role user: `admin`, `editor`, `no_access` |
| `sidebarOpen` | boolean | Toggle hamburger | Kontrol visibility sidebar mobile |
| `showPasteModal` | boolean | Toggle | Kontrol visibility paste modal |
| `pasteContent` | string | Textarea dalam modal | Isi JSON yang akan di-import |

---

## Auto-Sync

- Data channel di-fetch otomatis setiap **5 menit** (`setInterval 300000ms`).
- Saat pertama load, data langsung di-fetch.
- Setiap sync memperbarui: `channels`, stat cards, `lastUpdate`, `statusMsg`.

---

*Terakhir diperbarui: 11 Februari 2026*
