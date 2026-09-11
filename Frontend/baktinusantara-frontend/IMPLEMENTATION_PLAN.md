# IMPLEMENTATION PLAN — Gayatama Web (KKN Management System)

## System Architecture Overview

**Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui  
**Backend**: Laravel 12 + MySQL + Laravel Sanctum (API token auth)  
**Communication**: REST API via Axios with Sanctum token interceptor  
**Deployment**: Frontend → Vercel | Backend → Shared hosting / VPS  

## Tech Stack Alignment

| Layer | Technology | Details |
|---|---|---|
| Frontend Framework | Next.js 14 (App Router) | Server Components, Server Actions, Route Groups |
| Language | TypeScript | Strict mode, full type safety |
| Styling | Tailwind CSS + shadcn/ui | Utility-first, accessible components |
| State Management | Zustand | Lightweight, middleware-friendly |
| HTTP Client | Axios | Interceptors for Sanctum token, error handling |
| Form Handling | React Hook Form + Zod | Client-side validation, type-safe |
| Maps | Leaflet.js + React-Leaflet | Interactive KKN location map |
| Charts | Recharts | Analytics dashboard charts |
| Date/Time | date-fns | Indonesian locale support |
| Notifications | Sonner / React Hot Toast | Toast notifications |
| File Upload | Next.js API route proxy | Proxy to Laravel Storage (private disk) |
| Backend Framework | Laravel 12 | MVC + Service Layer architecture |
| Database | MySQL 8.0+ | With Haversine formula for distance calculation |
| Authentication | Laravel Sanctum | Token-based SPA authentication |
| Email/WA | Laravel Mail + Queue | Fonnte/Wablas for WhatsApp notifications |
| AI Integration | OpenAI API (backend) | Auto-suggest aspiration categories |
| Storage | Private disk + Signed URLs | File uploads are private, access via signed URL |
| Deployment | Vercel (frontend) | Backend on shared hosting/VPS |

## RBAC Role Mapping (Frontend ↔ Backend)

| Role (Laravel) | Frontend Route Group | Pages |
|---|---|---|
| `mahasiswa` | `/mahasiswa/*` | Proposal, Progress, Portfolio, Group management |
| `perangkat_desa` | `/perangkat-desa/*` | Aspirasi, Proposal decisions, Luaran verify, Desa management |
| `dosen` | `/dosen/*` | Proposal validation, Monitoring |
| `universitas` | `/admin/*` | Dashboard, Dosen management, SKS approval, Analytics |
| `admin` | `/admin/*` | Platform-wide settings, Verification |
| `public` | `/` | Homepage, Search, Aspirasi submit, Portfolio public pages |

## Development Phases & Timeline

### Total Timeline: ~18-22 weeks (1 developer)

---

### Fase 1: Autentikasi & Manajemen Pengguna (Week 1-2)
**Status: ✅ Implementation files ready**
- [ ] AuthContext & Provider (login, register, logout, token management)
- [ ] Login page with Sanctum token flow
- [ ] Register page with role-based forms
- [ ] middleware.ts route protection
- [ ] API client layer with Axios interceptors
- [ ] Profile management pages

**Backend Endpoints Used:** `POST /api/login`, `POST /api/register`, `POST /api/register/mahasiswa`, `POST /api/register/perangkat-desa`, `POST /api/register/universitas`, `GET /api/user`, `POST /api/logout`

---

### Fase 2: Pengajuan & Persetujuan KKN (Week 3-5)
**Status: ✅ Implementation files ready**
- [ ] Public aspirasi submission (no login required)
- [ ] Aspirasi status tracking via ticket number
- [ ] Desa dashboard: verify aspirasi → publish pos kebutuhan
- [ ] Mahasiswa: browse pos kebutuhan with matching score
- [ ] Proposal submission with distance check & surat izin
- [ ] Desa: approve/reject proposal
- [ ] Dosen: validate proposal kelayakan
- [ ] WhatsApp notification integration (backend Job)

**Backend Endpoints Used:** `POST /api/aspirasi`, `GET /api/aspirasi/{ticket}`, `GET /api/desa/aspirasi`, `PATCH /api/desa/aspirasi/{id}/verify`, `POST /api/desa/pos-kebutuhan`, `POST /api/proposal`, `PATCH /api/desa/proposal/{id}/decide`, `PATCH /api/dosen/proposal/{id}/kelayakan`

---

### Fase 3: Manajemen Mahasiswa & Kelompok (Week 6-9)
**Status: ✅ Implementation files ready**
- [ ] Group creation and join
- [ ] Proposal submission with matching algorithm
- [ ] Weekly progress submission with double-confirm lock
- [ ] Dosen & Desa monitoring dashboard
- [ ] Luaran submission and verification
- [ ] Auto-generated portofolio publik & sertifikat
- [ ] Public portofolio page with QR code
- [ ] Surat izin otomatis berdasarkan jarak

**Backend Endpoints Used:** `POST /api/kelompok`, `POST /api/kelompok/join`, `GET /api/kelompok`, `POST /api/progress`, `GET /api/progress`, `POST /api/luaran`, `PATCH /api/desa/luaran/{id}/verify`, `GET /portofolio/{slug}`

---

### Fase 4: Manajemen Desa & Periode KKN (Week 10-12)
**Status: ✅ Implementation files ready**
- [ ] Riwayat KKN per desa
- [ ] Surat tugas digital generation
- [ ] Cap digital
- [ ] Monitoring kinerja dari perspektif desa
- [ ] Kalender jadwal KKN
- [ ] Luaran verification
- [ ] Cap verifikasi by admin platform

**Backend Endpoints Used:** `GET /api/desa/riwayat-kkn`, `POST /api/desa/surat-tugas`, `GET /api/desa/aspirasi`, `PATCH /api/desa/aspirasi/{id}/verify`, `POST /api/desa/pos-kebutuhan`, `PATCH /api/desa/proposal/{id}/decide`, `PATCH /api/desa/luaran/{id}/verify`

---

### Fase 5: Pencarian & Dashboard Universal (Week 13-16)
**Status: ✅ Implementation files ready**
- [ ] Dashboard pencarian KKN (multi-filter)
- [ ] Peta KKN interaktif (Leaflet + React-Leaflet)
- [ ] Detail pencarian dengan matching score
- [ ] History KKN per daerah dengan grafik
- [ ] Katalog KKN publik
- [ ] Homepage dashboard universal
- [ ] Sistem rekomendasi (jika user login sebagai mahasiswa)

**Backend Endpoints Used:** `GET /api/pos-kebutuhan`, `GET /api/desa/{id}`, `GET /api/pos-kebutuhan/{id}`, `GET /api/desa/riwayat/{id}`, Haversine query, Smart-Matching service

---

### Fase 6: Admin & Universitas Management (Week 17-20)
**Status: ✅ Implementation files ready**
- [ ] Dashboard admin universitas
- [ ] Manajemen dosen (tambah, nonaktifkan, filter)
- [ ] Tinjau laporan dosen
- [ ] Monitoring kelompok agregat
- [ ] Approval SKS dengan surat rekomendasi PDF
- [ ] Verifikasi role (desa, universitas, mahasiswa)
- [ ] Validasi kelayakan proposal

**Backend Endpoints Used:** `GET /api/admin/overview`, `GET /api/admin/monitoring-kelompok`, `POST /api/dosen`, `GET /api/laporan-dosen`, `POST /api/admin/approve-sks`, `POST /api/admin/verifikasi-role`, `GET /api/dosen/{id}/proposal`

---

### Fase 7: Fitur Lanjutan & Keamanan (Week 21-24)
**Status: ✅ Implementation files ready**
- [ ] Klaim sertifikat & portofolio digital
- [ ] Portofolio publik dengan QR code verifikasi
- [ ] Sistem pengingat cerdas
- [ ] Validasi identitas (KTM + selfie)
- [ ] Verifikasi lokasi GPS
- [ ] Anti-manipulasi laporan (lock + digital signature)
- [ ] Deteksi performa KKN
- [ ] Manajemen slot KKN

**Backend Endpoints Used:** `POST /api/luaran`, `PATCH /api/desa/luaran/{id}/verify`, `GET /portofolio/{slug}`, `GET /api/portofolio/{id}/verify`, `POST /api/surat-izin`, `GET /api/admin/logs`

---

### Fase 8: Analisis, Laporan & Etika (Week 25-28)
**Status: ✅ Implementation files ready**
- [ ] Dashboard analisis KKN (Recharts)
- [ ] Deteksi anomali & loophole
- [ ] Kebijakan privasi & data management
- [ ] Pedoman etika & mekanisme aduan
- [ ] Survei kepuasan masyarakat
- [ ] Mekanisme umpan balik berkelanjutan
- [ ] Dokumentasi terbuka & pelatihan
- [ ] Analisis dampak nyata KKN

**Backend Endpoints Used:** `GET /api/admin/analytics`, `GET /api/admin/logs`, `GET /api/admin/anomaly`, `GET /api/survei/{proposal_id}`, `POST /api/survei/{proposal_id}`, `GET /api/admin/policy`, `POST /api/admin/feedback`

---

## Frontend-Backend Integration Pattern

### 1. Authentication Flow
```
Frontend → POST /api/login → Backend (validate → Sanctum token)
Frontend stores token → Axios interceptor adds header
Every subsequent request includes Authorization: Bearer {token}
```

### 2. File Upload Flow
```
Frontend → Next.js API route → POST to Laravel (with token)
Laravel stores file on private disk → returns signed URL
Frontend displays file via signed URL (expires after time)
```

### 3. Real-time Notifications
```
Backend (Job/Queue) → WhatsApp via Fonnte/Wablas
Frontend shows in-app toast notification (via WebSocket or polling)
```

### 4. Matching Score Calculation
```
Frontend sends location + preferences → Backend calculates:
  - Haversine distance (MySQL spatial query)
  - Major match percentage
  - Priority score
→ Returns {distance_km, matching_score, urgency_level}
Frontend displays badge with matching score
```

### 5. CORS Configuration
```php
// Laravel backend config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_origins' => ['https://gayatama-web.vercel.app'],
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];
```

## File Structure Reference

```
C:\Coding\GayatamaWeb\
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Login, Register
│   ├── mahasiswa/                # Student routes
│   ├── perangkat-desa/           # Village device routes
│   ├── dosen/                    # Lecturer routes
│   ├── admin/                    # Admin/University routes
│   ├── search/                   # Universal search
│   ├── maps/                     # Interactive map
│   ├── portofolio/               # Public portfolio
│   └── layout.tsx                # Root layout
├── context/                      # React Context (Auth, etc.)
├── lib/                          # Utilities, API client
├── components/                   # Shared UI components
├── hooks/                        # Custom hooks
├── types/                        # TypeScript types
├── implementation/               # Implementation plan files (8 files)
├── FRONTEND_BACKEND_ALIGNMENT.md # Master mapping document
├── RAW_BACKEND_FEAT.md           # Laravel backend details
├── RAW_FEATURE.md                # Organized features by phase
├── SPEC.md                       # Technical specification
└── PLAN.md                       # High-level plan
```

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Laravel API changes | Frontend breaks | Use FRONTEND_BACKEND_ALIGNMENT.md as contract, version API |
| Sanctum token expiration | User logged out unexpectedly | Implement refresh token mechanism, auto-redirect to login |
| File upload size limits | User cannot upload documents | Configure Laravel & Next.js limits, show upload progress |
| CORS issues | API requests blocked | Configure CORS properly in Laravel, use Next.js API proxy |
| Haversine query slow on large dataset | Search latency | Add MySQL spatial indexes, cache results |
| WhatsApp API limits | Notifications not sent | Implement queue with retry, fallback to in-app notification |
| Mobile accessibility | Poor UX on mobile | Responsive design, touch-friendly components, PWA support |
| Offline functionality | Cannot work in remote areas | Service worker caching, offline mode for forms |

## Success Metrics

- All 8 phases complete with working frontend
- All API endpoints tested and documented in FRONTEND_BACKEND_ALIGNMENT.md
- Authentication flow works end-to-end with Sanctum
- File upload/download works via signed URLs
- Matching score algorithm produces accurate results
- WhatsApp notifications sent successfully
- All role-based access control working
- Responsive design across devices
- Performance: page load < 3s, API response < 500ms
- Accessibility: WCAG 2.1 AA compliance