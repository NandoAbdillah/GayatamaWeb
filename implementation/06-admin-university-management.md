# Implementasi Fase 6: Admin & Universitas Management (Next.js Frontend)

## Tujuan
Membangun frontend Next.js untuk dashboard admin universitas, manajemen dosen, monitoring kelompok, dan approval SKS, terhubung ke Laravel 12 backend.

## Hubungan dengan Backend Laravel 12
| Endpoint Laravel | Method | Fungsi |
|---|---|---|
| `GET /api/admin/overview` | GET | Overview dashboard universitas |
| `GET /api/admin/monitoring-kelompok` | GET | Monitoring agregat kelompok |
| `POST /api/dosen` | POST | Tambah dosen (role: universitas) |
| `GET /api/laporan-dosen` | GET | List laporan dosen |
| `POST /api/admin/approve-sks` | POST | Approval konversi KKN ke SKS |
| `POST /api/admin/verifikasi-role` | POST | Verifikasi role baru |
| `GET /api/dosen/{id}/proposal` | GET | Proposal binaan dosen |
| `PATCH /api/dosen/proposal/{id}/kelayakan` | PATCH | Validasi kelayakan |

## Fitur Frontend yang Akan Diimplementasikan

### 1. Dashboard Admin Universitas (`app/admin/dashboard/page.tsx`)
- Overview statistics:
  - Total mahasiswa terdaftar
  - Total desa aktif
  - Total proposal diajukan (belum diverifikasi / approved / rejected)
  - Total kelompok aktif
  - KKN berjalan vs selesai
- Chart: tren KKN per bulan, distribusi per jurusan, grafik status proposal
- Alert: notifikasi mendesak (proposal menunggu, deadline mendekat, dll)

### 2. Manajemen Dosen (`app/admin/dosen/page.tsx`)
- List dosen yang terdaftar di universitas
- Tambah dosen baru (form: nama, NIP, jurusan, universitas)
  - Submit ke `POST /api/dosen`
  - Dosen diundang via email (backend generate akun + invite)
- Nonaktifkan dosen (toggle status active/inactive)
- Filter berdasarkan jurusan, universitas, status aktif
- Detail dosen → lihat proposal binaan dan monitoring progres

### 3. Tinjau Laporan Dosen (`app/admin/laporan-dosen/page.tsx`)
- List laporan dosen yang masuk (dari desa)
- Filter: status (menunggu/tinjauan/disetujui), dosen, periode
- Detail laporan → baca isi, lihat lampiran
- Action: approve atau reject dengan catatan
- `PATCH /api/laporan-dosen/{id}/status`

### 4. Monitoring Kelompok (`app/admin/monitoring/page.tsx`)
- Dashboard agregat semua kelompok binaan
- Filter berdasarkan: universitas, jurusan, periode, status
- Tampilkan:
  - Setiap kelompok: progres mingguan terakhir, status, deadline
  - Warning untuk kelompok yang terlambat submit progres
  - Notifikasi otomatis (via backend → frontend display)
- Detail kelompok → lihat history progres, luaran, dan portofolio

### 5. Approval SKS (`app/admin/sks/page.tsx`)
- List proposal yang sudah disahkan oleh desa → siap dikonversi ke SKS
- Filter: periode, jurusan, status validasi
- Detail proposal → cek semua persyaratan terpenuhi:
  - Progres mingguan sudah lengkap
  - Luaran sudah diverifikasi
  - Dokumentasi lengkap
- Action: approve → `POST /api/admin/approve-sks`
  - Backend: konversi jam KKN ke SKS sesuai kebijakan
  - Generate surat rekomendasi konversi SKS (PDF)
- Reject dengan alasan

### 6. Verifikasi Role (`app/admin/verifikasi/page.tsx`)
- List role yang menunggu verifikasi:
  - Desa: upload SK → menunggu verifikasi admin platform
  - Universitas: daftar institusi → menunggu verifikasi
  - Mahasiswa: upload KTM → menunggu verifikasi admin
- Detail: lihat dokumen yang diupload, data registrasi
- Action: approve → `POST /api/admin/verifikasi-role` (set `is_verified = true`) atau reject

### 7. Validasi Kelayakan (Opsional - Dosen/Admin)
- Dosen login → lihat proposal binaannya
- Validasi administratif sebelum proposal masuk ke desa
- Form kelayakan: dokumen lengkap, proposal realistis, dll
- `PATCH /api/dosen/proposal/{id}/kelayakan` → approve/reject

## Teknologi yang Digunakan
- **Framework**: Next.js 14 App Router
- **Charts**: Recharts untuk statistik dan monitoring
- **Form**: React Hook Form + Zod
- **UI**: shadcn/ui, Tailwind CSS, Ant Design (untuk admin complexity)
- **State**: Zustand untuk filter & pagination state
- **File Display**: PDF.js untuk melihat surat rekomendasi SKS
- **Auth**: Sanctum token dengan role middleware
- **Type Safety**: TypeScript interfaces untuk semua admin models

## Estimasi Waktu
- **3-4 minggu** untuk 1 frontend developer

## Kriteria Acceptance
- Admin universitas dapat melihat overview dashboard dengan statistik lengkap
- Manajemen dosen bekerja (tambah, nonaktifkan, filter)
- Laporan dosen dapat ditinjau dan disetujui/reject
- Monitoring kelompok menampilkan status real-time dengan warning
- Approval SKS berfungsi dengan validasi lengkap dan surat rekomendasi PDF
- Verifikasi role berjalan untuk desa, universitas, dan mahasiswa
- Semua halaman admin memiliki proteksi role yang ketat