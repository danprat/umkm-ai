# UMKM-AI - AI Image Generator for Indonesian MSMEs

UMKM-AI adalah platform SaaS berbasis AI yang dirancang khusus untuk membantu pelaku UMKM (Usaha Mikro, Kecil, dan Menengah) di Indonesia dalam menciptakan konten visual berkualitas tinggi secara instan. Dengan teknologi AI, pengguna dapat menghasilkan foto produk, maskot, dan materi promosi tanpa memerlukan keahlian desain grafis yang rumit.

## 🚀 Fitur Utama

- **AI Image Generation**:
  - **Food Mode**: Optimasi gambar khusus untuk produk makanan dan minuman.
  - **Mascot Mode**: Buat karakter maskot unik untuk branding usaha.
  - **Style Mode**: Ubah gaya visual gambar sesuai dengan tema yang diinginkan.
  - **Promo Mode**: Hasilkan materi promosi yang menarik untuk media sosial.
- **Sistem Kredit**: Pengelolaan penggunaan AI berbasis kredit yang transparan.
- **Integrasi Pembayaran (Pakasir)**: Beli paket kredit dengan mudah menggunakan QRIS, Virtual Account, dan metode pembayaran lokal lainnya melalui integrasi Pakasir.
- **Sistem Kupon**: Fitur klaim kode kupon untuk mendapatkan kredit tambahan atau promo khusus.
- **Dashboard Admin**: Panel kontrol lengkap untuk mengelola pengguna, memantau transaksi, membuat kupon, dan melihat riwayat generasi gambar.
- **Riwayat Generasi**: Akses kembali semua gambar yang telah dihasilkan dan unduh kapan saja.
- **Responsive Design**: Antarmuka modern yang dioptimalkan untuk perangkat desktop maupun mobile.

## 🛠️ Tech Stack

- **Frontend**:
  - [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Shadcn UI](https://ui.shadcn.com/)
  - [TanStack Query (React Query)](https://tanstack.com/query/latest)
  - [Lucide React](https://lucide.dev/) (Icons)
- **Backend & Database**:
  - [Supabase](https://supabase.com/) (Auth, PostgreSQL, Edge Functions, Storage)
- **Deployment**:
  - [Cloudflare Pages](https://pages.cloudflare.com/)

## 📂 Struktur Proyek

```text
├── docs/               # Dokumentasi tambahan (Integrasi Pakasir, dll)
├── public/             # Aset statis publik
├── src/
│   ├── components/     # Komponen UI reusable (Shadcn & Custom)
│   ├── contexts/       # React Context (Auth, dll)
│   ├── hooks/          # Custom React Hooks
│   ├── lib/            # Utilitas dan konfigurasi API/Supabase
│   ├── pages/          # Halaman aplikasi (Dashboard, Generate, Admin, dll)
│   └── App.tsx         # Root component & Routing
├── supabase/
│   ├── functions/      # Supabase Edge Functions (Logic Backend)
│   └── migrations/     # Skema database SQL
└── wrangler.toml       # Konfigurasi Cloudflare Pages
```

## ⚙️ Persiapan & Instalasi

### Prasyarat
- Node.js (v18 atau terbaru)
- Akun Supabase
- Akun Pakasir (untuk fitur pembayaran)

### Langkah Instalasi

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/username/umkm-ai.git
   cd umkm-ai
   ```

2. **Instal Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**:
   Salin file `.env.example` menjadi `.env` dan isi dengan kredensial Supabase Anda:
   ```bash
   cp .env.example .env
   ```
   Isi variabel berikut:
   - `VITE_SUPABASE_URL`: URL proyek Supabase Anda.
   - `VITE_SUPABASE_ANON_KEY`: Anon key dari dashboard Supabase.

4. **Setup Database**:
   Jalankan query SQL yang ada di `supabase/migrations/20241217_initial_schema.sql` melalui SQL Editor di dashboard Supabase Anda.

5. **Deploy Edge Functions**:
   Pastikan Anda sudah menginstal [Supabase CLI](https://supabase.com/docs/guides/cli).
   ```bash
   supabase login
   supabase functions deploy --project-ref your-project-id
   ```

6. **Jalankan Aplikasi Secara Lokal**:
   ```bash
   npm run dev
   ```

## 🔐 Akses Admin

Untuk memberikan akses admin ke akun tertentu:
1. Daftarkan akun melalui halaman Login/Register.
2. Masukkan email akun tersebut ke dalam tabel `public.admins` di database Supabase.
3. Akun tersebut akan secara otomatis memiliki akses ke menu **Admin Dashboard** di sidebar.

## 💳 Integrasi Pembayaran

Aplikasi ini menggunakan **Pakasir** sebagai gateway pembayaran. Pastikan Anda telah mengatur:
- **Slug Proyek** dan **API Key** Pakasir di Supabase Edge Functions (melalui secret).
- Webhook URL di dashboard Pakasir diarahkan ke Edge Function `pakasir-webhook`.

## 📄 Lisensi

Proyek ini dikembangkan untuk membantu digitalisasi UMKM di Indonesia. Silakan gunakan dan kembangkan lebih lanjut sesuai kebutuhan.

---
Dibuat dengan ❤️ untuk UMKM Indonesia.
