# Implementasi Fase 8: Analisis, Laporan & Etika (Next.js Frontend)

## Tujuan
Membangun frontend Next.js untuk analisis data KKN, sistem deteksi anomali, dashboard etika, dan umpan balik berkelanjutan, terhubung ke Laravel 12 backend.

## Hubungan dengan Backend Laravel 12
| Endpoint Laravel | Method | Fungsi |
|---|---|---|
| `GET /api/admin/analytics` | GET | Data analytics untuk dashboard |
| `GET /api/admin/logs` | GET | Audit trail log aktivitas |
| `GET /api/admin/anomaly` | GET | Deteksi pola mencurigakan |
| `GET /api/survei/{proposal_id}` | GET | Survei kepuasan masyarakat |
| `POST /api/survei/{proposal_id}` | POST | Submit survei kepuasan |
| `GET /api/admin/policy` | GET | Kebijakan privasi dan etika |
| `POST /api/admin/feedback` | POST | Mekanisme umpan balik |

## Fitur Frontend yang Akan Diimplementasikan

### 1. Dashboard Analisis KKN (`app/admin/analytics/page.tsx`)
- Tampilan utama: metrik dan grafik KKN
- Metrics cards:
  - Total jam KKN yang dipakai (periode ini)
  - Total output yang dihasilkan
  - Manfaat yang diterima masyarakat (berdasarkan survei)
  - Rata-rata kepuasan masyarakat
- Charts:
  - Tren KKN per tahun dan per jenis pekerjaan (line chart)
  - Distribusi per jurusan (pie chart)
  - Status proposal (bar chart: pending/approved/rejected)
  - Progres rata-rata per kelompok (area chart)
- Identifikasi best practice dan area yang perlu diperbaiki
- Filter: tahun, jurusan, jenis KKN, universitas

### 2. Sistem Deteksi Anomali & Loophole (`app/admin/analytics/anomaly/page.tsx`)
- Dashboard deteksi pola mencurigakan:
  - Mahasiswa yang mendaftar ke banyak desa sekaligus
  - Kelompok yang approved di desa A tapi tidak pernah submit progres
  - Pola pengajuan KKN yang tidak wajar (jarak tidak masuk akal, dsb)
- Tampilkan alert list dengan detail dan rekomendasi
- Backend menghitung → frontend menampilkan peringatan
- Batas maksimum desa yang boleh ditawari kelompok per periode
- Frontend menampilkan countdown timer dan batas kuota

### 3. Kebijakan Privasi & Data (`app/admin/analytics/privacy/page.tsx`)
- Dashboard pengelolaan data:
  - Data yang dapat dibagikan secara publik vs privat
  - Opsi penarikan izin sebelum berbagi foto atau lokasi KKN
  - Anonimisasi data sensitif dalam laporan publik
- Frontend menampilkan:
  - Checkbox "Izinkan foto saya dibagikan secara publik"
  - Toggle "Izinkan lokasi saya dibagikan"
  - Status anonimisasi data
- Audit keamanan: tampilkan ringkasan hasil audit rutin (dari backend)

### 4. Pedoman Etika & Penggunaan Teknologi (`app/admin/analytics/ethics/page.tsx`)
- Halaman dokumentasi:
  - Pedoman penggunaan foto dan video aktivitas KKN
  - Pertimbangan terhadap kewajaran dalam sistem rekomendasi
  - Mekanisme aduan dan risolusi konflik antara stakeholder
- Form aduan: pengguna dapat mengajukan aduan → `POST /api/admin/feedback`
- Status aduan: menunggu/tinjauan/selesai
- Frontend display timeline penanganan aduan

### 5. Survei Kepuasan Masyarakat (`app/admin/analytics/survei/page.tsx`)
- Dashboard survei:
  - List proposal yang sudah selesai → kirim survei ke masyarakat
  - Hasil survei: kepuasan, dampak, rekomendasi
  - Tampilkan dalam grafik: kepuasan rata-rata, distribusi rating
- Frontend: form survei yang sederhana dan accessible
- Link survei dapat dibagikan via WhatsApp (backend generate link)

### 6. Mekanisme Umpan Balik Kontinuer (`app/admin/feedback/page.tsx`)
- Dashboard umpan balik dari semua stakeholder:
  - Mahasiswa, desa, dosen, universitas → semuanya bisa memberikan feedback
  - Kategori: fitur baru, bug, saran, keluhan
  - Status: menunggu/tinjauan/diproses/selesai
- Frontend menampilkan:
  - List feedback dengan filter kategori dan status
  - Timeline penanganan setiap feedback
  - Form submit feedback baru
- Roadmap fitur yang diprioritaskan berdasarkan umpan balik

### 7. Dokumentasi Terbuka & Pelatihan (`app/admin/documentation/page.tsx`)
- Halaman dokumentasi untuk semua stakeholder:
  - Panduan penggunaan sistem (mahasiswa, desa, admin)
  - Tutorial video atau gambar
  - FAQ dan troubleshooting
- Aksesibilitas untuk daerah terpencil:
  - Tampilan yang ringan dan cepat
  - Mode offline-friendly (service worker cache)
  - Bahasa Indonesia yang sederhana
- Frontend menampilkan progress tutorial completion per user

### 8. Analisis Dampak Nyata KKN (`app/admin/analytics/dampak/page.tsx`)
- Dashboard dampak KKN:
  - Output yang dihasilkan (infrastruktur, edukasi, kesehatan, dll)
  - Manfaat yang dirasakan masyarakat (dari survei)
  - Feedback dari penerima manfaat
- Frontend menampilkan:
  - Kategori output dengan statistik
  - Testimoni masyarakat (dengan izin)
  - Grafik tren dampak per tahun
- Identifikasi best practice: output terbaik per jurusan, per jenis KKN

## Teknologi yang Digunakan
- **Charts**: Recharts (untuk semua visualisasi data)
- **UI**: shadcn/ui, Tailwind CSS, Ant Design (untuk admin complexity)
- **Form**: React Hook Form + Zod
- **State**: Zustand untuk filter & pagination state
- **Survey**: Custom form survey atau integrasi dengan layanan survei
- **File/Document**: PDF.js untuk melihat laporan dan dokumentasi
- **Accessibility**: A11y-compliant design untuk daerah terpencil
- **Offline**: Service worker caching untuk mode offline
- **Auth**: Sanctum token dengan role middleware (admin/university only)

## Estimasi Waktu
- **3-4 minggu** untuk 1 frontend developer

## Kriteria Acceptance
- Dashboard analisis menampilkan metrik dan grafik yang meaningful
- Deteksi anomali menampilkan pola mencurigakan dengan alert
- Kebijakan privasi dan pengelolaan data berfungsi (opt-in/opt-out)
- Pedoman etika dan mekanisme aduan dapat diakses dan digunakan
- Survei kepuasan masyarakat dikirim dan hasil ditampilkan
- Umpan balik stakeholder dikelola dengan status tracking
- Dokumentasi terbuka dapat diakses semua stakeholder
- Analisis dampak nyata menampilkan output dan manfaat yang terukur
- Semua halaman admin memiliki akses terbatas berdasarkan role