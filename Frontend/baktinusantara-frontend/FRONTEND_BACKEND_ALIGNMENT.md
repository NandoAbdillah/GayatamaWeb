# Frontend-Backend Alignment Document
## Next.js Frontend ↔ Laravel 12 Backend

> Dokumen ini memetakan setiap fitur frontend Next.js ke endpoint backend Laravel 12 yang sudah ada, sehingga logika frontend dan backend terhubung sempurna.

## Arsitektur Keseluruhan

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                     │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  App     │  │  Pages   │  │  Pages   │  │  Pages   │    │
│  │  Router  │  │  (Next.js│  │  API     │  │  Dashboard│    │
│  │  (App    │  │   Router)│  │  Routes  │  │  & Admin │    │
│  │  Router) │  │          │  │  (Route  │  │          │    │
│  │          │  │          │  │   Handler)│  │          │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │              │              │              │          │
│  ┌────▼──────────────▼──────────────▼──────────────▼─────┐    │
│  │              STATE MANAGEMENT                         │    │
│  │   Zustand / TanStack Query / React Context            │    │
│  └──────────────────────┬────────────────────────────────┘    │
│                         │                                    │
│  ┌──────────────────────▼────────────────────────────────┐    │
│  │              API CLIENT LAYER                         │    │
│  │   Axios / Fetch dengan interceptor + auth token      │    │
│  └──────────────────────┬────────────────────────────────┘    │
└─────────────────────────┼────────────────────────────────────┘
                          │ HTTP (REST API + Sanctum Token)
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                   BACKEND (Laravel 12)                        │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Route   │  │  Route   │  │  Route   │  │  Route   │    │
│  │  (API    │  │  (API    │  │  (API    │  │  (API    │    │
│  │  Routes) │  │  Routes) │  │  Routes) │  │  Routes) │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │              │              │              │          │
│  ┌────▼──────────────▼──────────────▼──────────────▼─────┐    │
│  │              SERVICE LAYER                            │    │
│  │   ProposalService, ProgressService, AspirasiService,  │    │
│  │   MatchingService (Haversine + Smart-Matching)        │    │
│  │   WhatsAppService, AIService                          │    │
│  └──────────────────────┬────────────────────────────────┘    │
│                         │                                    │
│  ┌──────────────────────▼────────────────────────────────┐    │
│  │              MODEL & DATABASE                         │    │
│  │   MySQL + Eloquent ORM                                │    │
│  │   users, profiles_*, kelompok, proposal,               │    │
│  │   pos_kebutuhan, progress_mingguan, luaran,            │    │
│  │   portofolio_publik, laporan_dosen, aspirasi           │    │
│  └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Autentikasi & State

| Frontend (Next.js) | Backend (Laravel 12) | Keterangan |
|---|---|---|
| `app/login/page.tsx` | `POST /api/login` (Sanctum) | Authentikasi via Sanctum token |
| `app/register/page.tsx` | `POST /api/register` | Registrasi dengan role-based redirect |
| `app/register/mahasiswa/page.tsx` | `POST /api/register/mahasiswa` | Registrasi mahasiswa (upload KTM) |
| `app/register/perangkat-desa/page.tsx` | `POST /api/register/perangkat-desa` | Registrasi desa (upload SK) |
| `app/register/universitas/page.tsx` | `POST /api/register/universitas` | Registrasi universitas |
| `lib/auth.ts` (Axios client) | Sanctum token storage & refresh | Token disimpan di localStorage/cookie |
| `middleware.ts` (Next.js) | Role validation | Middleware frontend untuk proteksi route berdasarkan role |
| `context/AuthContext.tsx` | `GET /api/user` | Ambil profil user yang login |

## Peran & Hak Akses Mapping

### Role: Masyarakat (Public)
| Frontend Page/Route | Laravel Backend Endpoint | Deskripsi |
|---|---|---|
| `app/aspirasi/page.tsx` | `POST /api/aspirasi` (public, no auth) | Submit aspirasi tanpa login |
| `app/aspirasi/[ticket]/page.tsx` | `GET /api/aspirasi/{ticket}` | Cek status aspirasi via nomor tiket |
| `app/katalog/page.tsx` | `GET /api/pos-kebutuhan/public` | Lihat katalog KKN publik (desa yang sudah publish) |

### Role: Mahasiswa
| Frontend Page/Route | Laravel Backend Endpoint | Deskripsi |
|---|---|---|
| `app/dashboard/mahasiswa/page.tsx` | `GET /api/proposal` (role: mahasiswa) | Dashboard proposal & progres |
| `app/mahasiswa/kelompok/page.tsx` | `POST /api/kelompok` (role: mahasiswa) | Buat/join kelompok |
| `app/mahasiswa/proposal/page.tsx` | `POST /api/proposal` (role: mahasiswa) | Submit proposal ke pos kebutuhan |
| `app/mahasiswa/progress/page.tsx` | `POST /api/progress` (role: mahasiswa) | Upload progres mingguan |
| `app/mahasiswa/portofolio/page.tsx` | `POST /api/luaran` (role: mahasiswa) | Submit luaran akhir |
| `app/mahasiswa/portofolio/[slug]/page.tsx` | `GET /portofolio/{slug}` (public) | Lihat portofolio publik |
| `app/mahasiswa/izin/page.tsx` | `GET /api/proposal` + Haversine calc | Cek kebutuhan surat izin |
| `app/mahasiswa/profile/page.tsx` | `PATCH /api/profile/mahasiswa` | Update profil mahasiswa |

### Role: Perangkat Desa
| Frontend Page/Route | Laravel Backend Endpoint | Deskripsi |
|---|---|---|
| `app/dashboard/perangkat-desa/page.tsx` | `GET /api/desa/aspirasi` (role: perangkat_desa) | Dashboard aspirasi masuk |
| `app/perangkat-desa/aspirasi/[id]/page.tsx` | `PATCH /api/desa/aspirasi/{id}/verify` | Verify/verify aspirasi |
| `app/perangkat-desa/pos-kebutuhan/page.tsx` | `POST /api/desa/pos-kebutuhan` | Publish pos kebutuhan |
| `app/perangkat-desa/proposal/page.tsx` | `PATCH /api/desa/proposal/{id}/decide` | Approve/reject proposal |
| `app/perangkat-desa/progress/page.tsx` | `GET /api/progress?desa_id={id}` | Monitor progres semua kelompok |
| `app/perangkat-desa/luaran/page.tsx` | `PATCH /api/desa/luaran/{id}/verify` | Verify luaran akhir |
| `app/perangkat-desa/riwayat/page.tsx` | `GET /api/desa/riwayat-kkn` | Riwayat KKN desa |
| `app/perangkat-desa/surat-tugas/page.tsx` | `POST /api/desa/surat-tugas` | Generate surat tugas digital |

### Role: Dosen (DPL)
| Frontend Page/Route | Laravel Backend Endpoint | Deskripsi |
|---|---|---|
| `app/dosen/dashboard/page.tsx` | `GET /api/proposal?dosen_id={id}` | Dashboard proposal binaan |
| `app/dosen/proposal/[id]/page.tsx` | `PATCH /api/dosen/proposal/{id}/kelayakan` | Validasi kelayakan proposal |
| `app/dosen/progress/page.tsx` | `GET /api/progress?dosen_id={id}` | Monitor progres binaan |
| `app/dosen/laporan/page.tsx` | `GET /api/laporan-dosen` | Lihat laporan dosen |

### Role: Universitas/Admin
| Frontend Page/Route | Laravel Backend Endpoint | Deskripsi |
|---|---|---|
| `app/admin/dashboard/page.tsx` | `GET /api/admin/overview` | Dashboard overview universitas |
| `app/admin/dosen/page.tsx` | `POST /api/dosen` (role: universitas) | Kelola data dosen |
| `app/admin/laporan-dosen/page.tsx` | `GET /api/laporan-dosen` (role: universitas) | Tinjau laporan dosen |
| `app/admin/monitoring/page.tsx` | `GET /api/admin/monitoring-kelompok` | Monitoring agregat kelompok |
| `app/admin/sks/page.tsx` | `POST /api/admin/approve-sks` | Approval konversi KKN ke SKS |
| `app/admin/verifikasi/page.tsx` | `POST /api/admin/verifikasi-role` | Verifikasi role baru |

## Algoritma & Logika Inti (Frontend-Backend)

| Frontend Fitur | Backend Service | Cara Kerja |
|---|---|---|
| Peta KKN berbasis radius | `HaversineDistanceEngine` | Frontend kirim lat/lon → Backend hitung jarak → Frontend tampilkan di peta Leaflet/Mapbox |
| Rekomendasi KKN berdasarkan jurusan | `Smart-Matching Competency Score` | Frontend kirim data jurusan anggota → Backend hitung matching_score → Frontend tampilkan badge cocok |
| Dashboard pencarian KKN | `GET /api/pos-kebutuhan?lat={}&lon={}&radius={}&jurusan={}` | Frontend filter → Backend filter MySQL → Frontend tampilkan daftar + peta |
| Progres mingguan dengan lock | `ProgressService::store()` | Frontend kirim → Backend lock + double confirm → Frontend tampilkan status locked |
| Notifikasi WhatsApp | `WhatsAppService` | Backend kirim via Fonnte/Wablas → Frontend tidak perlu (server-side event) |
| Kategorisasi aspirasi AI | `AIService::categorize()` | Frontend kirim deskripsi → Backend call OpenAI API → Frontend tampilkan kategori suggested |

## Integrasi Eksternal (Frontend ↔ Backend)

| Layanan | Frontend Panggil | Backend Panggil | Catatan |
|---|---|---|---|
| WhatsApp (Fonnte/Wablas) | Tidak langsung | `WhatsAppService::send()` | Frontend tidak perlu integrate, backend kirim via Job/Queue |
| AI API (OpenAI) | Tidak langsung | `AIService::categorize()`, `AIService::chat()` | Frontend kirim teks → Backend call → Frontend tampilkan hasil |
| API Wilayah Indonesia | `GET /api/wilayah/provinsi` | `Http::get('emsifa...')` | Frontend request ke backend → Backend fetch ke external API |
| Storage (Private/Public) | `GET /api/file/{id}` (signed URL) | Laravel Storage + signed URL | Frontend request signed URL → download via Laravel |

## Struktur Folder Frontend (Next.js App Router)

```
app/
├── layout.tsx                 # Layout utama dengan AuthProvider
├── page.tsx                   # Homepage - katalog KKN publik
├── login/page.tsx             # Halaman login
├── register/
│   ├── page.tsx               # Pilih role register
│   ├── mahasiswa/page.tsx     # Register mahasiswa (upload KTM)
│   ├── perangkat-desa/page.tsx # Register desa (upload SK)
│   ├── universitas/page.tsx   # Register universitas
│   └── dosen/page.tsx         # Register dosen (via invite)
├── dashboard/
│   ├── mahasiswa/page.tsx     # Dashboard mahasiswa
│   ├── perangkat-desa/page.tsx # Dashboard desa
│   ├── dosen/page.tsx         # Dashboard dosen
│   └── admin/page.tsx         # Dashboard admin universitas
├── mahasiswa/
│   ├── kelompok/page.tsx      # Buat/join kelompok
│   ├── proposal/page.tsx      # Submit proposal
│   ├── progress/page.tsx      # Upload progres mingguan
│   ├── portofolio/page.tsx    # Submit luaran
│   ├── portofolio/[slug]/page.tsx # Lihat portofolio publik
│   ├── izin/page.tsx          # Surat izin berdasarkan jarak
│   └── profile/page.tsx       # Edit profil
├── perangkat-desa/
│   ├── aspirasi/page.tsx      # List aspirasi masuk
│   ├── aspirasi/[id]/page.tsx # Detail & verify aspirasi
│   ├── pos-kebutuhan/page.tsx # Publish pos kebutuhan
│   ├── proposal/page.tsx      # List proposal & approve/reject
│   ├── proposal/[id]/page.tsx # Detail proposal
│   ├── progress/page.tsx      # Monitor progres kelompok
│   ├── luaran/page.tsx        # Verify luaran akhir
│   ├── riwayat/page.tsx       # Riwayat KKN desa
│   └── surat-tugas/page.tsx   # Buat surat tugas digital
├── dosen/
│   ├── dashboard/page.tsx     # Dashboard binaan
│   ├── proposal/[id]/page.tsx # Validasi kelayakan
│   ├── progress/page.tsx      # Monitor progres binaan
│   └── laporan/page.tsx       # Laporan dosen
├── admin/
│   ├── dashboard/page.tsx     # Overview universitas
│   ├── dosen/page.tsx         # Kelola dosen
│   ├── laporan-dosen/page.tsx # Tinjau laporan dosen
│   ├── monitoring/page.tsx    # Monitoring agregat
│   ├── sks/page.tsx           # Approval SKS
│   └── verifikasi/page.tsx    # Verifikasi role
├── katalog/page.tsx           # Katalog KKN publik
├── maps/page.tsx              # Peta KKN interaktif
├── search/page.tsx            # Pencarian KKN
├── aspirasi/page.tsx          # Submit aspirasi (public)
├── aspirasi/[ticket]/page.tsx # Cek status aspirasi
└── api/                       # Next.js API routes (proxy ke Laravel)
    ├── auth/                  # Proxy auth ke Laravel
    ├── proposal/              # Proxy proposal
    ├── progress/              # Proxy progress
    ├── aspirasi/              # Proxy aspirasi
    └── ...
lib/
├── api-client.ts              # Axios client dengan Sanctum interceptor
├── auth.ts                    # Utility autentikasi
├── constants.ts               # Endpoint & role constants
└── types.ts                   # TypeScript interfaces untuk semua models
components/
├── ui/                        # shadcn/ui components
├── dashboard/                 # Dashboard-specific components
├── forms/                     # Form components per role
├── maps/                      # Map components (Leaflet/Mapbox)
└── layout/                    # App layout components
hooks/
├── useAuth.ts                 # Auth hook
├── useProposal.ts             # Proposal hook
├── useProgress.ts             # Progress hook
└── useSearch.ts               # Search hook
```

## Konvensi Response Format

Semua response dari Laravel backend harus mengikuti format ini di sisi frontend:

```typescript
// Success Response
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Paginated Response
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Error Response
interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
```

## Flow Autentikasi

```
1. User akses halaman login → Next.js menampilkan form login
2. User submit email/password → Next.js POST ke Laravel /api/login
3. Laravel validasi → Sanctum token dibuat → Return token
4. Next.js simpan token di localStorage/cookie
5. Setiap request berikutnya → Next.js kirim token di Authorization header
6. Laravel middleware (auth:sanctum) validate token → Return data
7. Role-based middleware di Laravel menentukan halaman yang bisa diakses
8. Next.js middleware (middleware.ts) melindungi route berdasarkan role
```

## Catatan Penting

1. **Next.js API Routes** (`app/api/`) bisa berfungsi sebagai proxy ke Laravel untuk menghindari CORS issues di development
2. **Atau** Next.js langsung memanggil Laravel API dengan CORS enabled di Laravel
3. **Sanctum** token harus disimpan dengan aman (httpOnly cookie preferred untuk production)
4. **Environment variable** Next.js harus menyimpan `NEXT_PUBLIC_API_URL` pointing ke Laravel backend
5. **Laravel CORS** harus dikonfigurasi untuk menerima request dari domain Next.js
6. **Role validation** dilakukan di Laravel middleware, namun UX routing di Next.js middleware memberikan experience yang lebih baik