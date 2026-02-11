# Ringkasan Visual — Bang Memed YT Manager

Dokumentasi ini menjelaskan **tampilan visual** setiap halaman, komponen UI, warna, layout, dan elemen desain yang digunakan dalam aplikasi.

---

## 🎨 Design System (Tema & Warna)

### Palet Warna

| Token | Light Mode | Dark Mode |
|---|---|---|
| Background | `#f3f6f9` (abu-abu terang) | `#101116` (hitam kebiruan) |
| Card | `#ffffff` (putih) | `#15171c` (abu gelap) |
| Foreground (Teks) | `#101828` (hitam navy) | `#ffffff` (putih) |
| Primary (Brand) | `#155dfc` (biru) | `#155dfc` (biru) |
| Muted Text | `#64748b` (abu slate) | `#94a3b8` (abu slate terang) |
| Border | `#e2e8f0` (abu muda) | `rgba(255,255,255,0.1)` (putih transparan) |
| Destructive | `#ef4444` (merah) | `#ef4444` (merah) |

### Aksen Warna Khusus
- **Biru Brand:** `#155dfc` — tombol utama, link aktif, badge primary
- **Kuning:** `text-yellow-400` — statistik 3D Views / Realtime
- **Hijau:** `text-green-400` / `bg-green-500` — status online, role Editor badge
- **Merah:** `text-red-500` — EXPIRED badge, tombol hapus, role No Access
- **Ungu:** `bg-purple-500/20` — role Admin badge
- **Cyan:** `text-cyan-400` — hover effect halaman video, aksen landing page

### Font
- **Utama:** `Geist Sans` (dari Google Fonts via `next/font`)
- **Monospace:** `Geist Mono` — untuk ID user dan log upload

### Efek Visual Global
- **Background Glow (Dark Mode saja):** Radial gradient transparan biru & cyan yang blur di background, memberikan efek cahaya lembut.
- **Selection Color:** `selection:bg-[#155dfc]/30 selection:text-[#93bbff]` — teks yang di-select berwarna biru.
- **Transisi Tema:** `transition: background-color 0.3s ease` — pergantian Light/Dark Mode halus.
- **Custom Scrollbar:** Scrollbar tipis 5px, abu-abu transparan, rounded.

---

## 🧩 Komponen UI Reusable

### 1. Desktop Header (`DesktopHeader.tsx`)
- **Posisi:** Fixed top, full-width, z-50.
- **Tinggi:** 72px.
- **Background:** `#101828` (navy gelap) — **sama di light & dark mode**.
- **Tampil di:** Desktop only (`hidden md:flex`).
- **Layout:** Flex row, space-between.
- **Kiri:** Logo (ikon `Database` biru dalam kotak `bg-blue-600/20` rounded) + teks "YT Manager" putih bold.
- **Kanan:** `ThemeToggle` + Info user (nama 11px semibold putih + email 11px putih/40) + Avatar user (`/user.svg`, 40x40px, rounded-lg).
- **Border:** `border-b border-border`.

### 2. Mobile Header (`MobileHeader.tsx`)
- **Posisi:** Sticky top, z-30.
- **Background:** `#101828` (navy gelap).
- **Tampil di:** Mobile only (`md:hidden`).
- **Layout:** Flex row, space-between, padding 16px.
- **Kiri:** Hamburger menu icon (`Menu` 24px, rounded-lg hover effect) + teks "YouTube Manager" putih bold.
- **Kanan:** `ThemeToggle` + Avatar user (`/user.svg`, 36x36px, rounded-md).

### 3. Sidebar (`Sidebar.tsx`)
- **Lebar:** 330px fixed.
- **Background Mobile:** `#15171c` (gelap).
- **Background Desktop:** `#f3f6f9` (light) / `#101116` (dark).
- **Posisi:** Fixed left, full height. Di desktop selalu tampil, di mobile jadi drawer overlay.
- **Dengan Header:** Sidebar turun 72px dari atas (`md:top-[72px]`) saat `withHeader=true`.
- **Overlay Mobile:** `bg-black/60 backdrop-blur-sm` saat sidebar terbuka.
- **Padding Desktop:** `p-10 pr-5 pt-10`.
- **Border Desktop:** `border border-[#ffffff1a] rounded-lg shadow-[0_0px_15px_#02020210]`.
- **Menu Items:**
  - Dashboard, Tambah Channel, Settings, Kelola User (admin only).
  - Item aktif: `bg-blue-600/10 text-[#1e1e2d] dark:text-blue-400`.
  - Item normal: `text-muted-foreground hover:bg-muted/50`.
  - Setiap item: Ikon (18px) + Teks semibold 14px, padding `px-4 py-2.5`, rounded-lg.
- **Sign Out Button:** `bg-red-500/10 border border-red-500/20 text-red-400` — merah transparan di bawah menu items.
- **Footer Status:** Lingkaran hijau kecil `animate-pulse` + teks "System Operational" 12px.

### 4. Theme Toggle (`ThemeToggle.tsx`)
- **Tombol:** 40x40px rounded-lg, `hover:bg-[#fafafa15]`, teks putih.
- **Ikon:** `IoMdSunny` (Terang), `IoMdMoon` (Gelap), `Monitor` (Sistem) — 20x20px.
- **Dropdown:** Absolute right, width 128px, `bg-white dark:bg-[#101116]`, rounded-lg, shadow-xl, border.
- **Opsi:** 3 baris (Terang, Gelap, Sistem) — teks 14px, padding `px-4 py-2.5`.
- **Opsi Aktif:** `text-blue-500 font-medium`.
- **Animasi:** `animate-in fade-in zoom-in-95 duration-100`.

---

## 📄 Halaman-Halaman

---

### 1. Landing Page (`/`)

**Layout:** Fullscreen center, min-height 100vh.

**Background:** Radial gradient gelap — `radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)`.

**Card Tengah:**
- Max-width 600px, padding 50px, rounded-[32px].
- **Glassmorphism:** `bg-white/3 border border-white/10 backdrop-blur-[10px]`.
- **Judul:** "Bang Memed YT Manager" — `text-[2.5rem]`, gradient text `linear-gradient(90deg, #22d3ee, #818cf8)` (cyan ke indigo).
- **Deskripsi:** Teks slate-400, leading-relaxed.
- **Tombol CTA:** "Masuk ke Dashboard" — `bg-[#155dfc]` biru, rounded-xl, font-bold, hover naik 3px (`hover:-translate-y-[3px]`), hover shadow biru `shadow-[0_10px_20px_rgba(21,93,252,0.3)]`.
- **Footer:** Border-top transparan, link "Privacy Policy" & "Terms of Service" slate-500, hover cyan-400.

---

### 2. Login Page (`/login`)

**Layout:** Fullscreen center, `bg-[#0f0f0f]` hitam, teks putih.

**Card Login:**
- Max-width 448px (md), `bg-[#1e1e1e]`, border `border-gray-800`, rounded-2xl, padding 32px, shadow-2xl.

**Elemen Visual:**
- **Logo:** Ikon `LayoutDashboard` 48px dalam lingkaran `bg-[#155dfc]/10` warna `text-[#5b9aff]`.
- **Judul:** "Welcome Back" — text-3xl font-bold.
- **Subtitle:** "Sign in to manage your YouTube Channels" — gray-400.
- **Tab Switcher:** 2 tab (Google | Email) dalam `bg-[#0f0f0f]` p-1 rounded-lg.
  - Aktif: `bg-[#1e1e1e] text-white shadow`.
  - Inaktif: `text-gray-400 hover:text-white`.
- **Error Alert:** `bg-red-500/10 text-red-400 border border-red-500/30` dengan ikon `AlertCircle`.

**Tab Google:**
- Tombol putih `bg-white text-black`, full-width, rounded-lg, dengan favicon Google 20x20px.
- Loading: spinner circular (`animate-spin border-2 border-gray-600`).

**Tab Email:**
- Input Email: `bg-[#0f0f0f] border border-gray-700`, ikon `Mail` di kiri, focus border cyan.
- Input Password: `bg-[#0f0f0f]`, toggle show/hide (`Eye`/`EyeOff`).
- Tombol Submit: `bg-[#155dfc] hover:bg-[#407bfa]`, font-semibold, rounded-lg.
- Hint Text: "Don't have a password? Sign in with Google first" — link cyan-400.

---

### 3. Dashboard (`/dashboard`)

**Layout:**
- Desktop: Sidebar kiri (330px) + Header atas (72px) + Konten utama di kanan.
- Mobile: Header atas (sticky) + konten penuh, sidebar drawer.
- Konten padding: `p-6 md:p-10`.

**Topbar:**
- Judul "Dashboard" — `text-2xl md:text-3xl font-extrabold`.
- Subtitle "Pantau performa channel secara realtime" — `text-muted-foreground text-sm`.

**Stats Cards (4 kartu):**
- Grid `grid-cols-2 xl:grid-cols-4`, gap `3 md:5`.
- Setiap card: `bg-card border border-border rounded-lg p-3 md:p-5`, shadow `shadow-[0_0px_5px_#02020210]`.
- **Garis atas warna:** Card pertama (Subscribers) memiliki garis atas gradient `from-[#155dfc] to-[rgb(61,122,255)]`. Card lainnya garis `bg-white/10`.
- **Ikon:** Kanan atas setiap card — `Users` biru, `Eye` biru-400, `Activity` kuning-400, `Zap` hijau-400 (14px mobile, 18px desktop).
- **Angka:** `text-lg md:text-3xl font-extrabold tracking-tight`.
- **Angka 3D Views:** Khusus `text-yellow-400`.
- **Label bawah:** `text-[10px] md:text-xs text-gray-400`.

**Status Indikator:**
- Pill: `bg-card px-3 py-1 rounded-full text-xs border border-border`.
- Dot: 8x8px rounded-full dengan shadow glow (`shadow-[0_0_10px]`).
  - Hijau `bg-green-500` = Online.
  - Kuning `bg-yellow-500` = Syncing.
  - Merah `bg-red-500` = Offline.
- Tombol "Layout": `bg-[#155dfc] text-white rounded-lg px-5 py-3`.

**Search Card:**
- Card full-width, `bg-card border rounded-lg`, flex row.
- Input search: `bg-background border border-border`, ikon `Search` 16px, width 250px desktop.
- Tombol Refresh: `bg-background border border-border`, ikon `RefreshCw` (berputar saat loading: `animate-spin`).
- Tombol "Tambah Channel": `bg-[#155dfc] text-white`, ikon `Upload`, label tersembunyi di mobile.

**Channel Table (Desktop):**
- Card: `bg-card border border-border rounded-lg backdrop-blur-md shadow-[0_0px_5px_#02020210]`.
- Header row: "Channel List" bold + tombol "Salin Data" & "Tempel Data" (tersembunyi di mobile).
- Kolom: Channel Name (thumbnail 32px rounded-full + nama), Subs, Total Views, 3D VIEWS (kuning-400 bold), Upload, Videos, Action.
- Header tabel: `text-xs uppercase tracking-wider text-muted-foreground bg-background`.
- Hover baris: `hover:bg-card transition-colors`.
- Tombol UPLOAD: `bg-[#155dfc]/10 text-[#5b9aff] border border-[#155dfc]/20 rounded-lg text-xs font-bold`.
- Tombol LIHAT: Sama seperti UPLOAD style.
- Badge EXPIRED: `bg-red-500/20 text-red-500 rounded text-xs font-bold`.
- Tombol Hapus: `text-red-500 hover:text-red-400`, ikon `Trash2` 16px.

**Channel Cards (Mobile):**
- Card per channel: `bg-background border border-gray-800 rounded-lg p-4`.
- Row atas: Thumbnail 40px rounded-full + Nama (bold) + Subs/Views (12px gray-400) + Delete icon kanan atas.
- Box tengah: `bg-black/20 p-3 rounded-lg`, label "3D Views" uppercase + angka `text-yellow-400 font-bold text-lg`.
- Row bawah: Tombol "UPLOAD" (`bg-[#155dfc] text-white rounded-lg font-bold`) + ikon Video (`bg-gray-800 border-gray-700`).
- EXPIRED: Full-width `bg-red-500/10 text-red-500 border border-red-500/20`.

**Footer Dashboard:**
- `border-t border-border text-slate-500 text-center text-sm`.
- "© 2026 Bang Memed Project. All rights reserved."

**Paste Modal:**
- Overlay: `fixed inset-0 bg-black/80 backdrop-blur-sm`.
- Card: `bg-[#1e1e1e] border border-gray-700 rounded-lg p-6`, max-width 512px, shadow-2xl.
- Textarea: `bg-[#0f0f0f] border border-gray-700`, h-40, focus border cyan-500.
- Tombol Batal: `text-gray-400 hover:bg-gray-800`.
- Tombol Simpan: `bg-[#155dfc] hover:bg-[#407bfa] text-white`.

---

### 4. Admin Page (`/admin`)

**Layout:** Sama seperti Dashboard (Sidebar + Header + konten).

**Header:**
- Judul "Kelola Users" — `text-2xl md:text-3xl font-bold`.
- Subtitle "Manage user roles and permissions" — `text-muted-foreground`.
- Search email: `bg-card border border-border rounded-lg`, ikon `Search`.
- Tombol Refresh: `bg-card border border-border`, ikon `RefreshCw`.

**Tabel User (Desktop):**
- Card: `bg-card border border-border rounded-lg shadow-2xl`.
- Kolom: User/Email, Current Role, Actions, Joined At.
- Header: `bg-muted/50 text-muted-foreground text-xs uppercase`.
- Avatar user: 32px rounded-full, gradient `from-gray-700 to-gray-600`, inisial 2 huruf putih bold.
- Email: font-semibold 14px, ID: font-mono 10px `text-muted-foreground`.
- **Role Badges:**
  - Admin: `bg-purple-500/20 border border-purple-500/50` — teks dark/light adaptive.
  - Editor (Pro): `bg-green-500/20 border border-green-500/50`.
  - No Access: `bg-red-500/20 border border-red-500/50`.
- Expiry info: `text-[10px] text-muted-foreground` di bawah badge Editor.
- **Action Buttons (icon-only):**
  - Promote Admin: `hover:bg-purple-500/20 hover:text-purple-400`, ikon `ShieldAlert`.
  - Set Editor: `hover:bg-green-500/20 hover:text-green-400`, ikon `CheckCircle`.
  - Revoke: `hover:bg-red-500/20 hover:text-red-400`, ikon `XCircle`.
- Updating state: `text-xs text-blue-400 animate-pulse` "Updating...".

**Cards User (Mobile):**
- Card per user: `bg-card border border-border rounded-lg`.
- User Info row: Avatar 40px + email (14px semibold, break-all) + ID mono.
- Role badge row: Badge + expiry date.
- Footer row: `bg-muted/40 rounded-lg border-t`, Joined date + action buttons berwarna.

**Duration Modal:**
- Overlay: `bg-black/80 backdrop-blur-sm`.
- Card: `bg-popover border border-border rounded-lg p-6`, max-width sm, shadow-2xl.
- Judul: "Set Editor Duration" — `text-lg font-bold`.
- Daftar durasi: 5 tombol (`bg-secondary hover:bg-secondary/80`), flex space-between.
  - Hover: muncul teks "Select" `text-blue-400` dari `opacity-0`.
- Tombol Cancel: `text-muted-foreground hover:text-foreground`.

---

### 5. Settings Page (`/settings`)

**Layout:** Sama seperti Dashboard (Sidebar + Header + konten).

**Header:**
- Judul "Account Settings" — `text-2xl md:text-3xl font-bold`.
- Subtitle "Kelola akun dan keamanan Anda" — `text-gray-400`.
- Tombol "Back to Dashboard" (desktop only): `bg-[#1a2234] hover:bg-[#155dfc] text-white border border-gray-700`.

**Loading:** Spinner `border-2 border-[#155dfc] border-t-transparent animate-spin` 32px di tengah.

**Card Account Info:**
- `bg-card border border-white/30 rounded-lg shadow-[0_0px_15px_#02020210]`.
- Header card: Judul "Account Info" 17px semibold.
- Divider: `border border-[#f3f6f9] dark:border-[#f3f6f927]`.
- Row items (14px): Email, Role (capitalize), Access Expires (editor only — `bg-yellow-500/10 border border-yellow-500/20 text-yellow-400`).
- Login Methods badges:
  - Google: `bg-blue-500/20 text-blue-400 border border-blue-500/50` 12px.
  - Email+Password: `bg-green-500/20 text-green-400 border border-green-500/50` 12px.

**Card Set/Update Password:**
- Sama card style. Judul dinamis "Set Password" / "Update Password".
- Hint text (tanpa password): "Anda login via Google..." gray-400.
- Alert Success: `bg-green-500/10 text-green-400 border border-green-500/30` + `CheckCircle`.
- Alert Error: `bg-red-500/10 text-red-400 border border-red-500/30` + `AlertCircle`.
- Input Password: `bg-[#101116] border border-gray-700 rounded-lg`, toggle Eye/EyeOff.
- Input Confirm: Sama style.
- Submit Button: `bg-[#155dfc] hover:bg-[#407bfa] text-white font-semibold`, full-width, rounded-lg.
- Loading: spinner kecil putih + "Saving...".

---

### 6. Videos Page (`/videos`)

**Layout:** Grid 2 kolom — Sidebar (320px) + konten. Background: `#101828`.

**Header:**
- Tombol Back (`ArrowLeft` 24px, hover `bg-gray-800` rounded-full).
- Judul "Channel Videos" — text-2xl font-bold putih.
- Subtitle "Most recent 50 uploads" — gray-400 14px.

**State Kosong:** Ikon `Video` 48px opacity-50 + "No videos found."

**Loading:** Spinner `border-t-2 border-b-2 border-cyan-400` 48px di tengah, `animate-spin`.

**Error:** `bg-red-500/10 border border-red-500/50 text-red-400`.

**Video Grid:**
- Grid responsive: 1 / 2 / 3 / 4 kolom tergantung layar, gap 24px.
- **Video Card:** `bg-[#1e1e1e] rounded-xl overflow-hidden`.
  - Hover: `hover:ring-2 hover:ring-cyan-500/50` + thumbnail zoom `group-hover:scale-105 transition duration-500`.
  - Thumbnail: Aspect-video, object-cover, overlay `bg-black/20` yang hilang saat hover.
  - Judul: 14px semibold, 2 baris max (`line-clamp-2`), hover `text-cyan-400`.
  - Tanggal: Ikon `Calendar` 12px + tanggal, `text-xs text-gray-500`.

**Video Detail Modal:**
- Overlay: `bg-black/80 backdrop-blur-sm`.
- Card: `bg-[#1e1e1e] max-w-2xl rounded-2xl border border-gray-800 shadow-2xl`.
- **Header Modal:** Thumbnail full-width aspect-video, `opacity-50` + gradient overlay `from-[#1e1e1e] to-transparent`.
  - Close button: `bg-black/50 hover:bg-black/80 text-white rounded-full`.
  - Judul overlay di bawah: text-xl md:text-2xl bold putih.
- **Stats Grid (3 kolom):**
  - Views: `bg-[#2a2a2a]`, ikon `Eye` biru-400.
  - Likes: `bg-[#2a2a2a]`, ikon `ThumbsUp` hijau-400.
  - Comments: `bg-[#2a2a2a]`, ikon `MessageCircle` ungu-400.
  - Angka: text-lg font-bold.
- **Deskripsi:** `bg-[#0f0f0f] rounded-xl max-h-40 overflow-y-auto text-sm text-gray-400 whitespace-pre-wrap`.
- **Tombol "Watch on YouTube":** `bg-red-600 hover:bg-red-700`, ikon `Play`.

---

### 7. Manager/Upload Page (`/manager`)

**Layout:** Grid 2 kolom — Sidebar (320px) + konten. Background: `#101828`. Teks `text-slate-200`.

**Header Banner:**
- `bg-gradient-to-b from-slate-800 to-slate-900`, padding 24px, rounded-3xl, `border border-white/5`, shadow-2xl.
- **Kiri:** Judul "YouTube Manager PRO" (PRO warna merah), subtitle "by-bangmemed.id" italic slate-500.
- **Tengah:** Avatar channel 80x80px rounded-full, border 2px merah-500, efek glow `blur-xl animate-pulse opacity-40 bg-red-500` di belakang. Nama channel text-lg bold putih.
- **Kanan:** Tombol "TUTUP PANEL" — `border border-slate-700 text-slate-400 rounded-full text-xs`, hover border merah.

**Konten 2 Kolom:**

**Kolom Kiri — Konten Video:**
- Card: `bg-slate-800 rounded-3xl border border-white/5`, padding 24px.
- Section Title: `text-red-500 font-bold text-sm uppercase` + ikon merah.
- **Drag & Drop Zone:** `border-2 border-dashed border-slate-700 rounded-[15px] bg-black/20`, padding 40px, hover `border-cyan-400`.
  - Ikon `CloudUpload` 40px merah-500, hover scale-110.
  - Teks "Pilih Video" semibold slate-300.
- **Preview Video:** `w-full rounded-xl border border-slate-700`, tersembunyi sampai file dipilih.
- **Input Fields:** Judul, Deskripsi (textarea 4 baris), Tags.
  - Style: `bg-slate-900 border border-slate-700 text-white rounded-[10px]`, focus `border-cyan-400`.
  - Label: `text-[11px] font-semibold text-slate-400 uppercase`.
- **Section Thumbnail:** Judul merah "Custom Thumbnail" + file input sama style + preview tersembunyi.

**Kolom Kanan — Publish:**
- Card: `bg-slate-800 rounded-3xl border border-white/5`, padding 24px.
- Section Title: "Publish" merah + ikon `Rocket`.
- **Select Visibilitas:** `bg-slate-900 border border-slate-700 rounded-[10px]`.
  - Opsi: 🔒 Privat, 🔗 Unlisted, 🌐 Publik, 📅 Jadwalkan.
- **Scheduled Box (kondisional):** `bg-red-500/10 border border-red-500 rounded-xl` + datetime-local input.
- **Tombol Upload:** Full-width, py-4, rounded-xl, font-bold, shadow-lg.
  - Normal: `bg-red-500 hover:bg-red-600 shadow-red-500/30`, hover naik 1px.
  - Uploading: `bg-slate-600 cursor-not-allowed`.
  - Teks dinamis: "UNGGAH SEKARANG" / "UPLOADING XX%" / "UPLOAD LAGI" / "GAGAL".
- **Log Box:** `bg-black rounded-[15px] border border-slate-800`, font-mono 12px `text-[#00ff41]` (hijau terminal), height 120px, overflow auto-scroll.

---

### 8. Pricing Page (`/pricing`)

**Layout:** Fullscreen center, `bg-[#0f0f0f]` hitam, teks putih, padding top 80px.

**Header:**
- Judul "Access Restricted" — `text-4xl md:text-5xl font-extrabold`.
- Subtitle: Role `text-yellow-400 font-bold` "No Access".

**Grid 2 Paket:**

**Card Visitor (Kiri):**
- `bg-[#1e1e1e]/50 border border-gray-800 rounded-2xl`, opacity-75.
- Ikon `Shield` 32px gray-400.
- Judul "Visitor", Harga "Free".
- Fitur list: `text-gray-400` + `CheckCircle` 16px.
- Tombol disabled: "Current Plan" `cursor-not-allowed`.

**Card Pro (Kanan):**
- `bg-gradient-to-b from-[#1e1e1e] to-[#0f0f0f]`, border `border-cyan-500/50`, rounded-2xl.
- **Garis atas gradient:** `from-cyan-400 to-purple-500`, 4px.
- Hover: `hover:scale-105 transition duration-300`, shadow `shadow-2xl shadow-cyan-500/10`.
- Ikon `Crown` 32px cyan-400.
- Judul "Pro Edition" `text-cyan-400`, Harga "Rp 150K/mo".
- Fitur list: `CheckCircle` cyan-400 — Full Dashboard, Unlimited Sync, Realtime Analytics, Bulk Manager.
- **Tombol CTA:** `bg-[#155dfc] hover:bg-[#407bfa]`, "Contact Admin to Upgrade" + ikon `ArrowRight`, link ke WhatsApp.

**Footer:**
- "Already upgraded?" + tombol "Sign Out & Refund" `text-red-400 hover:text-red-300 underline`.

---

*Terakhir diperbarui: 11 Februari 2026*
