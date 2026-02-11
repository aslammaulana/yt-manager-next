# Ringkasan Aplikasi YT Manager

## Nama & Fungsi Aplikasi
**Nama:**  YT Manager (`yt-manager-next`)
**Fungsi:** Aplikasi dashboard manajemen multi-channel YouTube yang memungkinkan pengguna untuk memantau performa, statistik, dan mengelola banyak channel YouTube sekaligus dalam satu tempat.

---

## Struktur Halaman Aplikasi

| Route | Halaman | Akses |
|---|---|---|
| `/` | Landing Page | Publik |
| `/login` | Halaman Login (Google OAuth / Email+Password) | Publik (redirect jika sudah login) |
| `/dashboard` | Dashboard utama - monitoring channel | Admin & Editor |
| `/admin` | Manajemen user & role | Admin only |
| `/settings` | Pengaturan akun & password | Semua user login |
| `/videos` | Detail daftar video per channel | Admin & Editor |
| `/manager` | Upload video & thumbnail ke YouTube | Admin & Editor |
| `/pricing` | Halaman upgrade akses (untuk user `no_access` / expired) | User tanpa akses |

---

## Fitur Utama

### 1. Landing Page (`/`)
*   Halaman sambutan dengan desain glassmorphism (blur, gradient, border transparan).
*   Tombol CTA "Masuk ke Dashboard" untuk navigasi langsung.
*   Link Privacy Policy & Terms of Service.

### 2. Autentikasi & Login (`/login`, `/auth/callback`)
*   **Login via Google OAuth:** Satu klik login menggunakan akun Google melalui Supabase Auth.
*   **Login via Email + Password:** Opsi login manual bagi user yang sudah set password.
*   **Auto-Create Profile:** Saat pertama kali login, sistem otomatis membuat profil di tabel `profiles` dengan role default `no_access`.
*   **Redirect Logic:** User yang sudah login otomatis diarahkan ke `/dashboard`.

### 3. Dashboard Monitoring Realtime (`/dashboard`)
*   **Statistik Global (Stat Cards):** Menampilkan total gabungan Subscribers, Views, dan Penayangan Realtime (48 Jam) dari seluruh channel yang terdaftar.
*   **Status Sistem:** Indikator visual (Online/Offline) untuk memantau kesehatan koneksi API.
*   **Tabel Channel:** Menampilkan daftar channel lengkap dengan detail metrik masing-masing (Nama, Thumbnail, Subs, Views, Realtime Views/48h).
*   **Data Aggregation:** Menghitung total statistik secara otomatis dari semua akun yang terhubung.
*   **Pencarian & Filter:** Kolom pencarian realtime untuk menemukan channel tertentu berdasarkan nama.
*   **Token Expired Indicator:** Badge visual untuk menandai channel dengan token kadaluarsa.

### 4. Manajemen Channel (YouTube API Integration)
*   **Tambah Channel:** Integrasi aman menggunakan Google OAuth 2.0 untuk menghubungkan akun YouTube tanpa perlu berbagi password. Aksesibel dari Sidebar.
*   **Multi-Account Support:** Mendukung penambahan jumlah channel tak terbatas.
*   **Hapus Channel:** Fitur untuk menghapus akses dan data channel dari database aplikasi.
*   **Import & Export Data:**
    *   **Salin Data (Copy):** Ekspor data kredensial akses channel ke format JSON.
    *   **Tempel Data (Paste):** Impor massal data channel menggunakan format JSON, memudahkan backup atau pemindahan data antar perangkat.
    *   **Tombol Copy/Paste tersembunyi di tampilan mobile** untuk menjaga kebersihan UI.

### 5. Manajemen Video & Upload
*   **Halaman Video (`/videos`):** Akses detail daftar video per channel, menampilkan thumbnail, judul, tanggal publish, views, likes, dan komentar.
*   **Detail Video:** Klik video untuk melihat informasi lengkap termasuk deskripsi dan tags.
*   **Halaman Manager (`/manager`):** Interface upload video ke YouTube langsung dari aplikasi.
    *   Pilih file video & custom thumbnail.
    *   Set judul, deskripsi, dan tags video.
    *   Progress bar upload realtime.
    *   Log aktivitas upload secara detail.
*   **Deep Linking:** Navigasi langsung dari dashboard ke halaman video atau manager per channel.

### 6. Sistem Admin & Kontrol Akses (Role-Based Access Control)
Aplikasi memiliki sistem manajemen user yang canggih untuk mengatur hak akses pengguna:

*   **Role Management:**
    *   **Admin:** Memiliki akses penuh ke semua fitur, termasuk halaman Admin untuk mengelola user lain dan melihat semua channel.
    *   **Editor:** Memiliki akses terbatas untuk melihat dashboard dan mengelola channel milik sendiri, namun dengan batasan waktu tertentu.
    *   **No Access:** User yang terdaftar tapi belum diberikan izin akses (default setelah register). Diarahkan ke halaman `/pricing`.

*   **Time-Based Access Control (Limitasi Waktu Akses):**
    *   Admin dapat memberikan akses sementara kepada Editor dengan durasi tertentu.
    *   **Pilihan Durasi:**
        *   2 Menit (untuk testing)
        *   2 Hari
        *   1 Bulan
        *   2 Bulan
        *   3 Bulan
    *   **Otomatisasi Expired:** Middleware secara otomatis mengecek status akun setiap kali user mengakses halaman. Jika masa aktif habis, user otomatis dialihkan ke halaman `/pricing?expired=true`.

*   **Fitur Halaman Admin (`/admin`):**
    *   **Daftar User:** Melihat seluruh user yang terdaftar di database (profil & role).
    *   **Search User:** Mencari user berdasarkan email.
    *   **Update Role:** Mengubah role user (Admin, Editor + durasi, No Access) secara langsung.
    *   **Visual Indicators:** Badge warna-warni untuk membedakan role (Ungu untuk Admin, Hijau untuk Editor, Merah untuk No Access).
    *   **Monitor Durasi:** Menampilkan tanggal/waktu kadaluarsa akses bagi user dengan role Editor.

### 7. Halaman Settings (`/settings`)
*   **Account Info Card:** Menampilkan email user, role, metode login (Google / Email+Password), dan tanggal kadaluarsa akses (untuk Editor).
*   **Set / Update Password:** User yang login via Google dapat menambahkan password agar bisa login juga via Email + Password.
*   **Validasi:** Minimal 6 karakter, konfirmasi password harus cocok.
*   **Toggle Show/Hide Password.**

### 8. Halaman Pricing (`/pricing`)
*   Ditampilkan untuk user dengan role `no_access` atau yang aksesnya sudah expired.
*   Menampilkan dua paket: **Visitor** (gratis, tanpa akses) dan **Pro Edition** (Rp 150K/bulan).
*   Tombol "Contact Admin to Upgrade" mengarah ke WhatsApp untuk proses langganan manual.

---

## Arsitektur UI & Komponen

### Layout System
Aplikasi menggunakan layout responsif dengan sistem **Sidebar + Header**:

| Komponen | Letak | Deskripsi |
|---|---|---|
| `DesktopHeader` | Fixed top, full-width | Header desktop dengan logo, ThemeToggle, info user (nama + email + avatar). Tersembunyi di mobile. |
| `MobileHeader` | Sticky top | Header mobile dengan hamburger menu, logo, ThemeToggle, dan avatar user. Tersembunyi di desktop. |
| `Sidebar` | Fixed left, 330px | Navigasi utama: Dashboard, Tambah Channel, Settings, Kelola User (admin), Sign Out. Pada mobile muncul sebagai drawer overlay. |
| `AppSidebar` | Wrapper | Komponen pembungkus `Sidebar` yang otomatis fetch role user dan menyediakan fungsi Google Sign-In & Sign Out. |

### Tema (Dark/Light Mode)
*   **ThemeToggle Component:** Dropdown dengan 3 opsi - Terang, Gelap, Sistem.
*   **Theme Provider:** Menggunakan `next-themes` dengan `ThemeProvider` di root layout.
*   **CSS Variables:** Sistem design token berbasis CSS custom properties untuk Light Mode dan Dark Mode di `globals.css`.
*   **Background Glow Effect:** Efek radial gradient animasi hanya tampil di Dark Mode.
*   **Transisi halus:** `transition: background-color 0.3s ease` untuk perpindahan tema yang smooth.

### Design System (CSS Variables)
```
Light Mode:
  --background: #f3f6f9    --foreground: #101828
  --card: #ffffff           --primary: #155dfc
  --border: #e2e8f0         --muted: #f1f5f9

Dark Mode:
  --background: #101116    --foreground: #ffffff
  --card: #15171c           --primary: #155dfc
  --border: rgba(255,255,255,0.1)  --muted: #1e293b
```

---

## API Routes (Backend)

| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/auth` | GET | Menerima OAuth callback dari Google. Menukar code → token, ambil data channel YouTube, simpan ke tabel `yt_accounts` di Supabase. |
| `/api/get-stats` | GET | Mengambil semua data channel milik user. Otomatis refresh token jika expired/hampir expired (< 5 menit). |
| `/api/get-account-token` | GET | Mengambil access token spesifik untuk satu akun channel. |
| `/api/delete-account` | - | Menghapus data channel dari database. |
| `/api/import-data` | - | Mengimpor data channel secara massal dari format JSON. |
| `/api/log` | - | Endpoint untuk logging aktivitas. |
| `/auth/callback` | GET | Callback untuk Supabase Auth (Google login). Membuat profil user baru jika belum ada. |

### Token Refresh Logic (Auto-Refresh)
*   Saat mengambil data via `/api/get-stats`, sistem mengecek `expires_at` setiap channel.
*   Jika token expired atau akan expired dalam < 5 menit, sistem otomatis melakukan refresh menggunakan `refresh_token`.
*   Token baru disimpan kembali ke database untuk pemakaian selanjutnya.

---

## Tech Stack (Teknologi yang Digunakan)
Aplikasi ini dibangun dengan arsitektur modern yang mengutamakan performa dan keamanan:

### Frontend
*   **Framework:** **Next.js 16 (App Router)** - Framework React terbaru untuk performa tinggi dan routing server-side.
*   **Bahasa:** **TypeScript** - Menjamin keamanan tipe data dan mengurangi bug saat pengembangan.
*   **Styling:** **Tailwind CSS v4** - Framework CSS utility-first untuk desain UI yang cepat dan responsif.
*   **Theming:** **next-themes v0.4** - Library untuk dark/light mode dengan dukungan system preference.
*   **Fonts:** **Geist Sans & Geist Mono** (Google Fonts) - Tipografi modern dari Vercel.
*   **UI Icons:** **Lucide React** & **React Icons (IoMd)** - Koleksi ikon vektor modern.

### Backend & Database
*   **Backend-as-a-Service:** **Supabase** - Pengganti backend tradisional, menyediakan Database, Auth, dan Realtime subscriptions.
*   **Database:** **PostgreSQL** (via Supabase) - Menyimpan data user (`profiles`), konfigurasi, dan data channel YouTube (`yt_accounts`).
*   **Authentication:** **Supabase Auth** - Menangani sistem login (Google OAuth + Email/Password), register, dan manajemen sesi.
*   **Row Level Security (RLS):** Admin bisa melihat semua data, Editor hanya bisa melihat data milik sendiri.

### Integrasi API Pihak Ketiga
*   **Google OAuth 2.0:** Protokol otentikasi standar industri untuk login akun Google/YouTube yang aman.
*   **YouTube Data API v3:** Mengambil data profil channel (Nama, Foto Profil), statistik publik (Subscribers, Total Views), dan daftar video.
*   **YouTube Analytics API:** Mengambil data statistik mendalam yang tidak tersedia di publik, seperti *Realtime Views 48 Jam*.
*   **YouTube Upload API:** Mengupload video dan thumbnail langsung ke channel YouTube dari aplikasi.

### Keamanan & Infrastruktur
*   **Middleware Protection:** Validasi route di sisi server untuk mencegah akses tidak sah ke halaman sensitif (`/dashboard`, `/admin`, `/manager`, `/settings`).
*   **Role Checking in Middleware:** Pengecekan role (`admin`, `editor`, `no_access`) dan status expired langsung di middleware sebelum halaman dimuat.
*   **Supabase Admin Client:** Menggunakan `SUPABASE_SERVICE_ROLE_KEY` di server-side untuk operasi yang perlu bypass RLS (penyimpanan token OAuth).
*   **Environment Variables:** Penyimpanan kunci API dan kredensial sensitif menggunakan `.env`.
*   **Server-Side Fetching:** Pengambilan data admin dan token refresh dilakukan di sisi server untuk keamanan maksimal.
*   **Force Dynamic Rendering:** Semua halaman menggunakan `export const dynamic = 'force-dynamic'` untuk memastikan data selalu fresh.

---

## Struktur File Proyek

```
yt-manager-next/
├── app/
│   ├── layout.tsx              # Root layout (ThemeProvider, Fonts, Background Glow)
│   ├── page.tsx                # Landing Page
│   ├── globals.css             # Design tokens (Light/Dark CSS variables)
│   ├── admin/page.tsx          # Halaman Admin (user management)
│   ├── auth/callback/route.ts  # Supabase Auth callback
│   ├── dashboard/page.tsx      # Dashboard utama (660 lines)
│   ├── login/page.tsx          # Halaman Login
│   ├── manager/page.tsx        # Upload Manager
│   ├── pricing/page.tsx        # Halaman Pricing/Access Denied
│   ├── settings/page.tsx       # Halaman Settings
│   ├── videos/page.tsx         # Halaman Detail Video
│   └── api/
│       ├── auth/route.ts       # Google OAuth token exchange
│       ├── get-stats/route.ts  # Fetch channel stats + auto token refresh
│       ├── get-account-token/  # Get specific account token
│       ├── delete-account/     # Delete channel
│       ├── import-data/        # Import bulk channel data
│       └── log/                # Activity logging
├── components/
│   ├── AppSidebar.tsx          # Sidebar wrapper (auto-fetch role, auth functions)
│   ├── Sidebar.tsx             # Sidebar UI (navigation, menu items)
│   ├── DesktopHeader.tsx       # Header desktop (logo, theme, user info)
│   ├── MobileHeader.tsx        # Header mobile (hamburger, logo, theme)
│   ├── ThemeToggle.tsx         # Dark/Light/System theme dropdown
│   └── theme-provider.tsx      # next-themes ThemeProvider wrapper
├── utils/supabase/
│   ├── client.ts               # Supabase client-side instance
│   ├── server.ts               # Supabase server-side instance
│   └── admin.ts                # Supabase admin instance (service role)
├── middleware.ts                # Route protection & role/expiry checking
├── package.json
└── public/
    └── user.svg                # Default user avatar
```

---

*Terakhir diperbarui: 11 Februari 2026*
