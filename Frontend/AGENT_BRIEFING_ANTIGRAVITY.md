# AGENT BRIEFING — Antigravity Agent
## KKN Management System — Initial Frontend Implementation

> Dokumen ini dirancang untuk agen AI lain (Antigravity) agar dapat langsung memulai implementasi frontend KKN Management System tanpa perlu briefing ulang.

---

## 0. IDENTITAS PROYEK

| Item | Detail |
|------|--------|
| **Nama Proyek** | Gayatama Web — KKN Management System |
| **Tujuan** | Platform web manajemen KKN (Kuliah Kerja Nyata) — menghubungkan mahasiswa, desa, dosen, universitas |
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| **Backend** | Laravel 12 + MySQL 8.0+ (sudah ada, dibangun oleh pihak lain) |
| **Auth** | Laravel Sanctum (token-based SPA authentication) |
| **Workspace** | `C:\Coding\GayatamaWeb\` |
| **Status Backend** | ✅ Sudah berjalan, API endpoints tersedia |
| **Status Frontend** | ❌ Belum dibangun — INI YANG AKAN KAMU KERJAKAN |

---

## 1. TEKNOLOGY STACK (PENUH)

### Frontend (Kamu Membangun Ini)
- **Framework**: Next.js 14 dengan App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand (atau TanStack Query untuk server state)
- **HTTP Client**: Axios dengan interceptors (untuk Sanctum token)
- **Form Handling**: React Hook Form + Zod validation
- **Maps**: Leaflet.js + React-Leaflet
- **Charts**: Recharts
- **Date/Time**: date-fns
- **Notifications**: Sonner (React Hot Toast)
- **File Upload**: Next.js API route proxy ke Laravel Storage

### Backend (Sudah Ada — Jangan Ubah)
- **Framework**: Laravel 12
- **Database**: MySQL 8.0+
- **Auth**: Laravel Sanctum
- **Architecture**: MVC + Service Layer + Repository Pattern
- **API Style**: REST API dengan JSON responses
- **Additional**: DomPDF (PDF generation), Fonnte/Wablas (WhatsApp), OpenAI API (AI suggestions)

### Deployment
- **Frontend**: Vercel
- **Backend**: Shared hosting / VPS
- **CORS**: Frontend domain harus terdaftar di `config/cors.php` Laravel

---

## 2. STRUKTUR PROJECT

```
C:\Coding\GayatamaWeb\
├── app/                          # Next.js App Router (KAMU BUAT)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage / Dashboard universal
│   ├── (auth)/                   # Auth group route
│   │   ├── login/page.tsx        # Halaman login
│   │   └── register/page.tsx     # Halaman register multi-role
│   ├── mahasiswa/                # Routes untuk role: mahasiswa
│   │   ├── proposal/page.tsx     # Ajukan proposal
│   │   ├── progress/page.tsx     # Progres mingguan
│   │   ├── kelompok/page.tsx     # Kelola kelompok
│   │   ├── portofolio/page.tsx   # Upload luaran + klaim
│   │   └── portofolio/[slug]/page.tsx  # Portofolio publik
│   ├── perangkat-desa/           # Routes untuk role: perangkat_desa
│   │   ├── aspirasi/page.tsx     # List + verify aspirasi
│   │   ├── pos-kebutuhan/page.tsx # Publish pos kebutuhan
│   │   ├── proposal/page.tsx     # Approve/reject proposal
│   │   ├── luaran/page.tsx       # Verify luaran
│   │   └── surat-tugas/page.tsx  # Generate surat tugas
│   ├── dosen/                    # Routes untuk role: dosen
│   │   └── proposal/[id]/page.tsx # Validasi kelayakan
│   ├── admin/                    # Routes untuk role: universitas/admin
│   │   ├── dashboard/page.tsx    # Overview universitas
│   │   ├── dosen/page.tsx        # Kelola dosen
│   │   ├── monitoring/page.tsx   # Monitoring kelompok
│   │   ├── sks/page.tsx          # Approval SKS
│   │   └── analytics/page.tsx    # Dashboard analisis
│   ├── search/                   # Pencarian universal
│   │   ├── page.tsx              # Dashboard pencarian
│   │   ├── maps/page.tsx         # Peta KKN
│   │   └── [id]/page.tsx         # Detail pos kebutuhan
│   ├── portofolio/               # Portofolio publik
│   │   └── [slug]/page.tsx       # Detail portofolio
│   └── api/                      # Next.js API routes (proxy ke Laravel)
│       └── upload/route.ts       # Proxy upload ke Laravel
├── context/                      # React Context (AuthContext)
├── lib/                          # Utilities
│   ├── api-client.ts             # Axios dengan Sanctum interceptor
│   └── utils.ts                  # Helper functions
├── components/                   # Shared UI components
│   ├── RoleGate.tsx              # Role-based access component
│   ├── StatusBadge.tsx           # Status indicator badge
│   ├── MatchingScoreBadge.tsx    # Matching score display
│   └── DistanceWarning.tsx       # Distance warning component
├── hooks/                        # Custom hooks
├── types/                        # TypeScript type definitions
├── middleware.ts                 # Next.js middleware (route protection)
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Node.js dependencies
├── .env.local                    # Environment variables
├── implementation/               # Implementation plan files (8 files)
│   ├── 01-authentication.md
│   ├── 02-application-approval.md
│   ├── 03-student-group-management.md
│   ├── 04-village-management.md
│   ├── 05-universal-search.md
│   ├── 06-admin-university-management.md
│   ├── 07-advanced-features-security.md
│   └── 08-analytics-ethics.md
├── FRONTEND_BACKEND_ALIGNMENT.md # MAPPING LENGKAP → BACA DOKUMEN INI
├── RAW_BACKEND_FEAT.md           # Detail endpoint backend
├── RAW_FEATURE.md                # Fitur diorganisir per fase
├── SPEC.md                       # Technical specification
├── IMPLEMENTATION_PLAN.md        # Master plan komprehensif
└── docs/
    └── INTEGRATION_PATTERN.md    # Pola integrasi teknis detail
```

---

## 3. API ENDPOINTS YANG ADA (BACKEND SUDAH SELESAI)

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/login` | Login, dapatkan Sanctum token | No |
| POST | `/api/register` | Register umum | No |
| POST | `/api/register/mahasiswa` | Register mahasiswa + upload KTM | No |
| POST | `/api/register/perangkat-desa` | Register desa + upload SK | No |
| POST | `/api/register/universitas` | Register universitas | No |
| GET | `/api/user` | Ambil profil user | Yes (Sanctum) |
| POST | `/api/logout` | Logout + revoke token | Yes (Sanctum) |

### Aspirasi (Bisa tanpa login)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/aspirasi` | Submit aspirasi publik | No |
| GET | `/api/aspirasi/{ticket}` | Cek status aspirasi | No |
| GET | `/api/desa/aspirasi` | List aspirasi desa | Yes (perangkat_desa) |
| PATCH | `/api/desa/aspirasi/{id}/verify` | Verify/reject aspirasi | Yes (perangkat_desa) |

### Pos Kebutuhan
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/desa/pos-kebutuhan` | Publish pos kebutuhan | Yes (perangkat_desa) |
| GET | `/api/pos-kebutuhan` | List pos kebutuhan (dengan filter) | No (public) |
| GET | `/api/pos-kebutuhan/{id}` | Detail pos kebutuhan | No |

### Proposal
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/proposal` | Submit proposal mahasiswa | Yes (mahasiswa) |
| PATCH | `/api/desa/proposal/{id}/decide` | Approve/reject proposal | Yes (perangkat_desa) |
| PATCH | `/api/dosen/proposal/{id}/kelayakan` | Validasi kelayakan | Yes (dosen) |

### Kelompok & Progres
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/kelompok` | Buat kelompok | Yes (mahasiswa) |
| POST | `/api/kelompok/join` | Join kelompok | Yes (mahasiswa) |
| GET | `/api/kelompok` | List kelompok | Yes |
| POST | `/api/progress` | Upload progres mingguan | Yes (mahasiswa) |
| GET | `/api/progress` | List progres | Yes |
| POST | `/api/luaran` | Submit luaran akhir | Yes (mahasiswa) |
| PATCH | `/api/desa/luaran/{id}/verify` | Verify luaran | Yes (perangkat_desa) |

### Portfolio & Sertifikat
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/portofolio/{slug}` | Portofolio publik | No |
| GET | `/api/portofolio/{id}/verify` | Verifikasi keaslian | No |

### Desa Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/desa/riwayat-kkn` | Riwayat KKN desa | Yes (perangkat_desa) |
| POST | `/api/desa/surat-tugas` | Generate surat tugas | Yes (perangkat_desa) |
| PATCH | `/api/desa/proposal/{id}/decide` | Approve/reject proposal | Yes (perangkat_desa) |

### Admin & Universitas
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/overview` | Dashboard admin | Yes (universitas/admin) |
| GET | `/api/admin/monitoring-kelompok` | Monitoring kelompok | Yes (universitas/admin) |
| POST | `/api/dosen` | Tambah dosen | Yes (universitas) |
| GET | `/api/laporan-dosen` | List laporan dosen | Yes (universitas/admin) |
| POST | `/api/admin/approve-sks` | Approval SKS | Yes (universitas) |
| POST | `/api/admin/verifikasi-role` | Verifikasi role | Yes (admin) |

### Analytics & Audit
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/analytics` | Data analytics | Yes (universitas/admin) |
| GET | `/api/admin/logs` | Audit trail | Yes (admin) |
| GET | `/api/admin/anomaly` | Deteksi anomali | Yes (admin) |

### Survei & Feedback
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/survei/{proposal_id}` | Survei kepuasan | No |
| POST | `/api/survei/{proposal_id}` | Submit survei | No |
| POST | `/api/admin/feedback` | Mekanisme umpan balik | Yes |

---

## 4. ROLE SYSTEM (RBAC)

### Roles di Laravel (5 Role)
```
1. masyarakat     — Publik, bisa submit aspirasi (tanpa login)
2. mahasiswa      — Ajukan proposal, kelola kelompok, upload progres & luaran
3. perangkat_desa — Verify aspirasi, publish pos kebutuhan, approve/reject proposal, verify luaran
4. dosen          — Validasi kelayakan proposal binaan
5. universitas    — Admin universitas: kelola dosen, approve SKS, monitoring
6. admin          — Admin platform: verifikasi role, audit logs, overview
```

### Mapping ke Frontend Route Groups
```typescript
// middleware.ts — Protected routes mapping
const protectedRoutes = {
  '/login': [],                    // Public
  '/register': [],                 // Public
  '/aspirasi': [],                 // Public (tanpa login)
  '/portofolio': [],               // Public
  '/search': [],                   // Public
  '/maps': [],                     // Public

  '/mahasiswa': ['mahasiswa'],     // Login + role mahasiswa
  '/perangkat-desa': ['perangkat_desa'],
  '/dosen': ['dosen'],
  '/admin': ['universitas', 'admin'], // Universitas dan Admin
};
```

---

## 5. STANDAR KODE & POLA

### 5.1 API Client (Wajib Ini Dulu)
```typescript
// lib/api-client.ts
import axios from 'axios';
import { useRouter } from 'next/navigation';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: attach Sanctum token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sanctum_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sanctum_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 5.2 Auth Context (Wajib)
```typescript
// context/AuthContext.tsx
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('sanctum_token');
    const storedUser = localStorage.getItem('user_data');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/api/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('sanctum_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = async () => {
    await apiClient.post('/api/logout');
    localStorage.removeItem('sanctum_token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 5.3 Middleware (Wajib)
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const roleRoutes: Record<string, string[]> = {
    '/mahasiswa': ['mahasiswa'],
    '/perangkat-desa': ['perangkat_desa'],
    '/dosen': ['dosen'],
    '/admin': ['universitas', 'admin'],
  };

  for (const [path, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(path)) {
      const token = request.cookies.get('sanctum_token')?.value;
      const userRole = request.cookies.get('user_role')?.value;

      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 5.4 Standard API Response Format
```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Berhasil"
}

// Error
{
  "success": false,
  "errors": { "field": ["error"] },
  "message": "Validasi gagal"
}
```

### 5.5 File Naming Convention
```
- Pages: kebab-case (login.tsx, proposal-page.tsx)
- Components: PascalCase (Button.tsx, RoleGate.tsx)
- Hooks: camelCase with use prefix (useAuth.ts, usePolling.ts)
- Types: PascalCase (User.ts, Proposal.ts)
- Utilities: camelCase (api-client.ts, format-date.ts)
```

---

## 6. IMPLEMENTATION PHASES — DIMANA MEMULAI

### 🚀 MULAI DARI SINI: Fase 1 (Week 1-2)

Prioritas implementasi:
1. **Buat `lib/api-client.ts`** — Axios config dengan Sanctum interceptor
2. **Buat `context/AuthContext.tsx`** — Auth state management
3. **Buat `middleware.ts`** — Route protection berdasarkan role
4. **Buat `app/layout.tsx`** — Root layout dengan AuthProvider
5. **Buat `app/login/page.tsx`** — Form login
6. **Buat `app/register/page.tsx`** — Form register multi-role

### Kemudian Fase 2 (Week 3-5):
- Halaman aspirasi publik (`app/aspirasi/page.tsx`)
- Dashboard desa (`app/perangkat-desa/aspirasi/page.tsx`)
- Dashboard mahasiswa proposal (`app/mahasiswa/proposal/page.tsx`)

### Lanjutkan Fase 3-8 secara berurutan sesuai `implementation/*.md`

---

## 7. ENVIRONMENT VARIABLES

### `.env.local` (Wajib Dibuat)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Gayatama KKN
```

**Catatan**: `NEXT_PUBLIC_API_URL` adalah URL backend Laravel. Development = `http://localhost:8000`, Production = URL deployment backend.

---

## 8. FILE YANG WAJIB ADA SEBELUM MULAI CODING

Pastikan file-file berikut sudah ada di workspace:

- [ ] `package.json` — dengan dependensi Next.js, React, dll
- [ ] `tsconfig.json` — TypeScript configuration
- [ ] `next.config.js` — Next.js configuration
- [ ] `tailwind.config.ts` — Tailwind configuration
- [ ] `.env.local` — Environment variables
- [ ] `app/layout.tsx` — Root layout
- [ ] `app/page.tsx` — Homepage

Untuk setup project Next.js baru, jalankan:
```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=false
```

---

## 9. DENGANAN PENTING

### Jangan Lakukan Ini:
- ❌ Jangan ubah backend Laravel (sudah selesai dan berjalan)
- ❌ Jangan ubah database schema (sudah ada)
- ❌ Jangan gunakan WebSocket/Socket.io (tidak ada di backend)
- ❌ Jangan gunakan state management yang terlalu kompleks (Zustand cukup)
- ❌ Jangan ignore CORS (akan jadi masalah utama)
- ❌ Jangan simpan Sanctum token di cookie tanpa httpOnly (keamanan)

### Lakukan Ini:
- ✅ Selalu baca `FRONTEND_BACKEND_ALIGNMENT.md` untuk mapping endpoint
- ✅ Gunakan `implementation/01-authentication.md` sebagai panduan Fase 1
- ✅ Validasi input di client (Zod) DAN server (Laravel FormRequest)
- ✅ Handle error 401 dengan redirect ke login
- ✅ Gunakan TypeScript types untuk semua data dari API
- ✅ Test setiap endpoint sebelum lanjut ke fase berikutnya

---

## 10. INTEGRATION PATTERN RINGKAS

```
┌─────────────────┐         ┌─────────────────┐
│   NEXT.JS       │         │   LARAVEL 12     │
│   Frontend      │────────▶│   Backend        │
│                 │◀────────│                  │
│                 │  REST   │  ┌──────────┐   │
│  - App Router   │  API    │  │ Service  │   │
│  - Zustand      │         │  │ Layer    │   │
│  - Axios        │         │  │          │   │
│  - Sanctum Token│────────▶│  │ MySQL    │   │
│  - Route Guard  │         │  │          │   │
└─────────────────┘         └─────────────────┘
       │                              │
       │    ┌─────────────────────┐   │
       │    │  Sanctum Token Flow │   │
       │    │  1. POST /api/login │   │
       │    │  2. Can token       │   │
       │    │  3. Attach header   │   │
       │    │  4. Every request   │   │
       │    └─────────────────────┘   │
       │                              │
       │    ┌─────────────────────┐   │
       │    │  File Upload Flow   │   │
       │    │  1. Next.js API     │   │
       │    │  2. Proxy to Laravel│   │
       │    │  3. Store private   │   │
       │    │  4. Signed URL      │   │
       │    └─────────────────────┘   │
```

---

## 11. STARTING COMMANDS

```bash
# 1. Setup Next.js project (jika belum ada)
npx create-next-app@14 . --typescript --tailwind --eslint --app

# 2. Install dependencies
npm install axios zustand react-hook-form @hookform/resolvers zod sonner react-leaflet leaflet recharts date-fns
npm install -D @types/node @types/react @types/react-dom @types/leaflet

# 3. Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 4. Run dev server
npm run dev

# 5. Test backend connectivity
# Buka http://localhost:3000 dan coba POST ke /api/login
```

---

## 12. REFERENSI KE FILE LAIN

Untuk informasi detail, baca file-file ini di workspace:
- **`FRONTEND_BACKEND_ALIGNMENT.md`** — Mapping lengkap setiap halaman ke endpoint Laravel
- **`RAW_BACKEND_FEAT.md`** — Detail lengkap endpoint, model, dan fitur backend
- **`RAW_FEATURE.md`** — Fitur diorganisir per 8 fase
- **`SPEC.md`** — Technical specification lengkap
- **`IMPLEMENTATION_PLAN.md`** — Master plan dengan timeline dan risk mitigation
- **`docs/INTEGRATION_PATTERN.md`** — Dokumentasi teknis pola integrasi detail
- **`implementation/01-authentication.md`** — Panduan implementasi Fase 1 (mulai dari sini)

---

## STATUS PROYEK

| Fase | Status | Estimasi |
|------|--------|----------|
| Fase 1: Autentikasi | 🔲 Belum dimulai | Week 1-2 |
| Fase 2: Pengajuan & Persetujuan | 🔲 Belum dimulai | Week 3-5 |
| Fase 3: Kelompok & Progres | 🔲 Belum dimulai | Week 6-9 |
| Fase 4: Desa & Surat Tugas | 🔲 Belum dimulai | Week 10-12 |
| Fase 5: Pencarian & Peta | 🔲 Belum dimulai | Week 13-16 |
| Fase 6: Admin & Universitas | 🔲 Belum dimulai | Week 17-20 |
| Fase 7: Fitur Lanjutan | 🔲 Belum dimulai | Week 21-24 |
| Fase 8: Analisis & Etika | 🔲 Belum dimulai | Week 25-28 |

**Total estimasi**: 28 minggu (1 developer)

---

> **PENTING**: Backend sudah selesai. Fokus 100% pada implementasi frontend. Jangan pernah mengubah backend. Gunakan `implementation/01-authentication.md` sebagai titik awal.