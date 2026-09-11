# SPEC — Gayatama Web (KKN Management System)

## 1. Product Spec (Apa yang dibangun)

### 1.1 Masalah & Tujuan
- **Masalah yang diselesaikan**: Sistem manajemen KKN (Kuliah Kerja Nyata) yang terpusat, menghubungkan mahasiswa, desa, dosen, dan universitas dalam satu platform digital.
- **Tujuan utama**: Membangun platform web yang memungkinkan pengelolaan KKN dari pengajuan hingga verifikasi selesai, dengan sistem matching mahasiswa-desa, progres mingguan, dan portofolio digital.
- **Success metric**: Platform berfungsi penuh dengan semua 8 fase terimplementasi, semua role dapat mengakses fitur sesuai hak akses, dan sistem autentikasi, progres, serta verifikasi berjalan tanpa error.

### 1.2 Pengguna (Users)
| Tipe User | Kebutuhan Utama | Catatan |
|-----------|----------------|---------|
| Mahasiswa | Mengajuan proposal KKN, mengelola kelompok, mengupload progres mingguan, mengklaim sertifikat | Role: `mahasiswa` |
| Perangkat Desa | Menerima aspirasi, menyetujui proposal, memverifikasi luaran, mengelola pos kebutuhan | Role: `perangkat_desa` |
| Dosen | Memvalidasi kelayakan proposal binaan, memantau progres | Role: `dosen` |
| Universitas/Admin | Mengelola dosen, menyetujui SKS, monitoring keseluruhan, analytics | Role: `universitas`, `admin` |
| Masyarakat | Mengajukan aspirasi KKN tanpa login | Role: `public` |

### 1.3 Fitur Inti (MVP)
- [ ] Autentikasi multi-role dengan Laravel Sanctum (Fase 1)
- [ ] Pengajuan aspirasi KKN publik tanpa login (Fase 2)
- [ ] Verifikasi aspirasi & penerbitan pos kebutuhan oleh desa (Fase 2)
- [ ] Pengajuan proposal mahasiswa dengan matching score (Fase 2-3)
- [ ] Progres mingguan dengan double-confirm lock (Fase 3)
- [ ] Verifikasi luaran & auto-generate portofolio (Fase 3)
- [ ] Dashboard pencarian KKN dengan peta interaktif (Fase 5)
- [ ] Surat tugas digital & cap digital (Fase 4)
- [ ] Approval SKS oleh universitas (Fase 6)
- [ ] Portofolio publik dengan QR code verifikasi (Fase 7)

### 1.4 Fitur Future (Nice to have)
- [ ] Sistem rekomendasi KKN personalisasi (Fase 5)
- [ ] Deteksi anomali & anti-manipulasi (Fase 7-8)
- [ ] Survei kepuasan masyarakat (Fase 8)
- [ ] Mode offline untuk daerah terpencil (Fase 8)
- [ ] Integrasi pembayaran (jika ada)
- [ ] Sistem rating/ulasan KKN

## 2. Technical Spec (Bagaimana dibangun)

### 2.1 Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Hook Form + Zod, Axios, Leaflet.js + React-Leaflet, Recharts, date-fns, Sonner
- **Backend / API**: Laravel 12 (PHP), MySQL 8.0+, Laravel Sanctum, Laravel Queue (Fonnte/Wablas for WA), OpenAI API (AI category suggestion)
- **Database**: MySQL 8.0+ (Haversine formula for distance calculation)
- **Hosting / Deploy**: Vercel (frontend), Shared hosting/VPS (backend Laravel)
- **Auth**: Laravel Sanctum (token-based SPA authentication)
- **File Storage**: Laravel private disk with signed URLs
- **PDF Generation**: DomPDF (backend)
- **Maps**: Leaflet.js + React-Leaflet (frontend)
- **Email/WA**: Laravel Mail + Queue (backend), Fonnte/Wablas API (WA notifications)

### 2.2 Arsitektur (singkat)
- **Pola arsitektur**: Monolith (backend) + SPA (frontend)
- **Struktur utama**:
  - Backend: Laravel MVC + Service Layer + Repository Pattern
  - Frontend: Next.js App Router + React Components + API Client Layer
  - Communication: REST API via Axios with Sanctum token interceptor
  - CORS: Configured for Vercel frontend ↔ Laravel backend

### 2.3 Data Model (sketch)
```
[User]
- id, name, email, password, role, is_verified
- relationships: hasMany proposals, hasMany progress_entries, belongsTo desa

[Desa]
- id, nama_desa, alamat, lat, lon, user_id, is_verified
- relationships: hasMany aspirasi, hasMany pos_kebutuhan, hasMany proposal

[Mahasiswa]
- id, nim, angkatan, jurusan, user_id, file_ktm_path
- relationships: belongsTo kelompok, hasMany proposal, hasMany progress_entries

[ProdiDosen]
- id, dosen_id, prodi_id, is_active
- relationships: belongsTo user (dosen), hasMany proposals

[Proposal]
- id, pos_kebutuhan_id, mahasiswa_id, dosen_id, status
- fields: draft_proker, file_proposal, jarak_km, matching_score, surat_izin_path
- relationships: belongsTo desa, belongsTo mahasiswa, belongsTo dosen

[Progress]
- id, proposal_id, minggu_ke, deskripsi, file_path, is_locked, submitted_at
- relationships: belongsTo proposal

[Luaran]
- id, proposal_id, deliverable_path, deskripsi, status, slug, sertifikat_path
- relationships: belongsTo proposal

[Aspirasi]
- id, nama, whatsapp, deskripsi, lat, lon, kategori, status, ticket_number
- relationships: belongsTo desa

[PosKebutuhan]
- id, desa_id, nama_pos, deskripsi, kuota, jurusan_dibutuhkan, urgency, status
- relationships: belongsTo desa, hasMany proposals

[Kelompok]
- id, nama_kelompok, ketua_mahasiswa_id, jurusan, is_active
- relationships: hasMany mahasiswa, belongsTo proposal
```

### 2.4 API / Endpoint (jika ada)
See `RAW_BACKEND_FEAT.md` for complete endpoint documentation and `FRONTEND_BACKEND_ALIGNMENT.md` for frontend-backend mapping.

### 2.5 Non-Functional Requirements
- **Performance**: Page load < 3s, API response < 500ms, file upload < 30s
- **Security**: Sanctum token auth, CSRF protection, input validation via Laravel FormRequest, CORS configured, file upload validation (max size + type)
- **Accessibility**: WCAG 2.1 AA compliance, responsive design, Bahasa Indonesia interface
- **Scalability**: MySQL indexing for Haversine queries, queue for WA notifications, CDN for static assets
- **Reliability**: Error handling in Axios interceptors, fallback mechanisms for API failures, auto-redirect on 401

## 3. Batasan & Asumsi
- **Batasan**:
  - Backend sudah dibangun oleh pihak lain (teman user) dan tidak dapat diubah secara bebas
  - Frontend dibangun oleh user yang memiliki pengalaman Next.js terbatas
  - Database MySQL sudah ada dengan struktur tertentu
  - Deployment backend menggunakan shared hosting (bukan VPS dedicated)
  - Tidak ada sistem real-time (WebSocket) — semua menggunakan polling atau page refresh
- **Asumsi**:
  - Laravel backend sudah berjalan dan API endpoints sudah tersedia
  - Sanctum token authentication sudah dikonfigurasi di backend
  - MySQL Haversine formula sudah di-implementasi untuk jarak
  - WhatsApp API (Fonnte/Wablas) sudah terintegrasi di backend
  - CORS sudah dikonfigurasi dengan benar di Laravel

## 4. Risiko
| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Backend API berubah tanpa notifikasi | Frontend break | Gunakan FRONTEND_BACKEND_ALIGNMENT.md sebagai kontrak, komunikasi rutin dengan backend developer |
| Sanctum token expired | User ter-logout | Implement refresh token, auto-redirect ke login |
| File upload gagal | Data tidak tersimpan | Validasi client-side + server-side, progress indicator |
| CORS issues | API requests diblokir | Konfigurasi CORS di Laravel, gunakan Next.js API proxy sebagai alternatif |
| Haversine query lambat | Pencarian lambat | MySQL spatial index, caching |
| WhatsApp API limit | Notifikasi tidak terkirim | Queue dengan retry, fallback in-app notification |
| Mobile UX buruk | User kabur di mobile | Responsive design, touch-friendly, PWA |
| Offline mode tidak tersedia | Tidak bisa kerja di area remote | Service worker caching, form draft local |
| Matching score tidak akurat | Mahasiswa tidak cocok | Validasi AI suggestion, manual override oleh desa |
| Deadline terlewat tanpa notifikasi | Progres tidak submit | Sistem pengingat progresif (Fase 7) |