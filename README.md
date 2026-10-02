# Find My Career — Frontend App

> Antarmuka web untuk **Sistem Rekomendasi Program Studi Perguruan Tinggi** menggunakan metode SAW (Simple Additive Weighting).
>
> Studi Kasus: **SMAN 18 Garut**

---

## Deskripsi Proyek

**Find My Career App** adalah aplikasi web *frontend* yang dibangun dengan **Next.js 14** (App Router). Aplikasi ini menyediakan antarmuka yang intuitif bagi:

- **Siswa** — untuk mengisi nilai rapor, mengisi kuesioner minat RIASEC, dan mendapatkan rekomendasi program studi yang dipersonalisasi
- **Admin (Guru BK)** — untuk mengelola data siswa, memonitor rekomendasi, dan mengekspor laporan

---

## Teknologi yang Digunakan

| Teknologi | Versi | Keterangan |
|---|---|---|
| **Next.js** | `^14.2.35` | React framework (App Router) |
| **React** | `^18.3.1` | UI library |
| **TypeScript** | `^5.7.2` | Type-safe JavaScript |
| **Tailwind CSS** | `^3.4.17` | Utility-first CSS framework |
| **Axios** | `^1.7.9` | HTTP client untuk API calls |
| **Recharts** | `^3.10.1` | Library grafik & visualisasi data |
| **Radix UI** | `^1.x` | Komponen UI primitif (Dialog, Slot) |
| **Lucide React** | `^0.468.0` | Icon library |
| **CVA** | `^0.7.1` | Class Variance Authority (variant components) |

---

## Fitur Utama

### Halaman Siswa
- **Dashboard** — Ringkasan status pengisian rapor & kuesioner
- **Rapor** — Form input nilai mata pelajaran per semester
- **Kuesioner** — Pengisian 36 soal minat karir RIASEC
- **Hasil** — Visualisasi peringkat rekomendasi program studi dengan nilai preferensi SAW

### Halaman Admin
- **Dashboard Admin** — Statistik jumlah siswa, kelas, & status rekomendasi
- **Manajemen Siswa** — CRUD siswa, reset password, catatan konseling, import/export Excel
- **Manajemen Kelas** — Tambah, edit, hapus data kelas
- **Program Studi** — Lihat & kelola daftar 59 program studi beserta kriteria SAW

---

## Struktur Direktori

```
find-my-career-app/
├── app/
│   ├── (auth)/              <- Halaman Login & Register
│   ├── (student)/           <- Layout & halaman siswa
│   │   ├── dashboard/       <- Dashboard siswa
│   │   ├── rapor/           <- Input nilai rapor
│   │   ├── questionnaire/   <- Kuesioner RIASEC
│   │   └── hasil/           <- Hasil rekomendasi SAW
│   └── (admin)/             <- Layout & halaman admin
│       └── admin/
│           ├── dashboard/   <- Dashboard admin
│           ├── siswa/       <- Manajemen siswa
│           ├── kelas/       <- Manajemen kelas
│           └── program-studi/ <- Manajemen program studi
├── components/
│   ├── layout/              <- Sidebar, navbar, layout wrapper
│   ├── recommendation/      <- Komponen hasil rekomendasi
│   ├── shared/              <- Komponen bersama (tabel, modal, dsb.)
│   └── ui/                  <- Komponen UI primitif
├── context/                 <- React Context (auth, state global)
├── hooks/                   <- Custom React hooks
├── lib/                     <- Utilitas & konfigurasi axios
├── types/                   <- TypeScript type definitions
└── public/                  <- Aset statis
```

---

## Koneksi ke Backend

Aplikasi ini terhubung ke **Find My Career API** (Laravel 11).
Konfigurasi URL backend di file `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Autentikasi menggunakan **Laravel Sanctum** berbasis cookie/token.

---

## Instalasi & Setup

### Prasyarat
- Node.js `>= 18.x`
- npm atau yarn
- Backend API berjalan di `http://localhost:8000`

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/auufaaauza/fe-fmc.git
cd fe-fmc

# 2. Install dependensi
npm install

# 3. Salin file konfigurasi
cp .env.example .env
# atau buat .env dengan isi:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# 4. Jalankan development server
npm run dev
```

Aplikasi berjalan di: **http://localhost:3000**

### Build Production

```bash
npm run build
npm start
```

### Type Check & Lint

```bash
npm run type-check
npm run lint
```

---

## Halaman & Routing

| Path | Role | Deskripsi |
|---|---|---|
| `/login` | Public | Halaman login |
| `/register` | Public | Halaman registrasi siswa |
| `/dashboard` | Siswa | Dashboard siswa |
| `/rapor` | Siswa | Input nilai rapor |
| `/questionnaire` | Siswa | Kuesioner RIASEC |
| `/hasil` | Siswa | Hasil rekomendasi program studi |
| `/admin/dashboard` | Admin | Dashboard admin (Guru BK) |
| `/admin/siswa` | Admin | Manajemen data siswa |
| `/admin/kelas` | Admin | Manajemen data kelas |
| `/admin/program-studi` | Admin | Manajemen program studi |

---

## Lisensi

Proyek ini dibuat sebagai karya ilmiah Tugas Akhir / Skripsi.

---

## Author

**auufaaauza** — [GitHub](https://github.com/auufaaauza)

> Backend companion: [be-fmc](https://github.com/auufaaauza/be-fmc)
