# Implementasi Fase 3: Manajemen Mahasiswa & Kelompok (Next.js Frontend)

## Tujuan
Membangun frontend Next.js untuk manajemen kelompok mahasiswa, progres mingguan, dan portofolio, terhubung ke Laravel 12 backend.

## Hubungan dengan Backend Laravel 12
| Endpoint Laravel | Method | Fungsi |
|---|---|---|
| `POST /api/kelompok` | POST | Buat kelompok baru |
| `POST /api/kelompok/join` | POST | Join kelompok yang sudah ada |
| `GET /api/kelompok` | GET | List kelompok (scope berdasarkan role) |
| `POST /api/proposal` | POST | Submit proposal (role: mahasiswa) |
| `POST /api/progress` | POST | Upload progres mingguan (role: mahasiswa) |
| `GET /api/progress?proposal_id={id}` | GET | Lihat progres mingguan |
| `POST /api/luaran` | POST | Submit luaran akhir |
| `PATCH /api/desa/luaran/{id}/verify` | PATCH | Verify luaran (role: perangkat_desa) |
| `GET /portofolio/{slug}` | GET | Lihat portofolio publik |

## Fitur Frontend yang Akan Diimplementasikan

### 1. Pembuatan & Pengelolaan Kelompok (`app/mahasiswa/kelompok/page.tsx`)
- Form buat kelompok: nama kelompok, jurusan kontribusi, anggota (NIM)
- Submit ke `POST /api/kelompok`
- Validasi: satu mahasiswa hanya bisa di 1 kelompok (di-check oleh Laravel)
- Display: daftar kelompok yang sudah jadi atau diikuti
- Join kelompok: ketik kode/kode undangan → `POST /api/kelompok/join`

### 2. Form Proposal dengan Matching Score (`app/mahasiswa/proposal/page.tsx`)
- Pilih pos kebutuhan dari daftar (dari `GET /api/pos-kebutuhan?lat={}&lon={}&radius={}`)
- Tampilkan matching_score badge (dihitung oleh backend)
- Form: draft proker (textarea), upload file proposal (PDF max 5MB), upload surat pengantar
- Submit ke `POST /api/proposal`
- Jika jarak > threshold → tampilkan peringatan + field upload surat_izin_ortu
- Auto-calculate jarak_km di background (via Haversine endpoint)

### 3. Dashboard Progres Mingguan (`app/mahasiswa/progress/page.tsx`)
- List progres mingguan per proposal
- Form upload progres mingguan ke-N:
  - Textarea: deskripsi progres
  - Upload file (PDF, max 20MB)
  - Persentase penyelesaian
- **Double Confirm**: submit pertama → modal "yakin? tidak bisa diedit" → confirm kedua → submit final
- Setelah submit → `is_locked = true` → tampilkan status "Locked" (tidak bisa edit)
- Setiap minggu, ketua kelompok submit progres → anggota bisa lihat

### 4. Monitor Progres (Dosen & Desa)
- **Dosen**: `GET /api/progress?dosen_id={id}` → list semua progres binaan
  - Tampilkan status: on track / terlambat / di atas jadwal
  - Read-only view (bisa lihat, tidak bisa edit)
- **Perangkat Desa**: `GET /api/progress?desa_id={id}` → list semua kelompok di desa
  - Dashboard monitoring dengan warning untuk yang terlambat
  - Notifikasi otomatis jika ada kelompok yang belum submit

### 5. Luaran Akhir & E-Portofolio (`app/mahasiswa/portofolio/page.tsx`)
- Setelah KKN selesai dan proposal status = 'disahkan':
  - Form upload deliverable (file PDF, ZIP, DOCX max 20MB) + deskripsi
  - Submit ke `POST /api/luaran`
  - Status = 'menunggu_verifikasi'
- Setelah desa verify → `PATCH /api/desa/luaran/{id}/verify`:
  - Backend auto-generate portofolio publik (slug unik + sertifikat PDF)
  - Tampilkan link portofolio → `app/mahasiswa/portofolio/[slug]/page.tsx`
  - Tampilkan sertifikat PDF yang bisa didownload

### 6. Portofolio Publik (`app/mahasiswa/portofolio/[slug]/page.tsx`)
- Halaman publik yang bisa diakses siapa saja
- Tampilkan: deliverable, deskripsi, sertifikat PDF
- Link untuk dibagikan ke LinkedIn/CV
- URL pattern: `/portofolio/{slug}`

### 7. Klaim Surat & Portofolio
- Setelah luaran diverifikasi:
  - Tombol "Klaim Sertifikat" → download PDF sertifikat
  - "Klaim Portofolio" → link portofolio publik
  - QR code untuk verifikasi keaslian (backend generate → frontend display)

### 8. Surat Izin Otomatis (`app/mahasiswa/izin/page.tsx`)
- Hitung jarak universitas ke lokasi KKN (via Haversine)
- Jika jarak > threshold → tampilkan tautan/cetak surat izin orang tua
- Template surat (frontend print) → isi data dari profil mahasiswa

## Teknologi yang Digunakan
- **Framework**: Next.js 14 App Router
- **File Upload**: Next.js API route → upload ke Laravel Storage (private disk, signed URL)
- **Form**: React Hook Form + Zod
- **Date/Time**: date-fns atau dayjs
- **Print**: React Print / CSS @media print untuk surat tugas
- **UI**: shadcn/ui, Tailwind CSS
- **State**: Zustand untuk form state & progress tracking
- **Auth**: Sanctum token via Axios interceptor
- **Validation**: Laravel FormRequest (server) + Zod (client)

## Estimasi Waktu
- **3-4 minggu** untuk 1 frontend developer

## Kriteria Acceptance
- Mahasiswa dapat membuat kelompok dan join kelompok lain
- Satu mahasiswa hanya bisa di 1 kelompok (validasi oleh Laravel)
- Proposal submit dengan matching_score & jarak_km tampil di UI
- Progres mingguan dengan double-confirm dan lock feature bekerja
- Dosen dan desa bisa monitor progres secara read-only
- Luaran submit → desa verify → portofolio publik & sertifikat auto-generate
- Surat izin otomatis berdasarkan jarak Haversine dari backend
- Semua file upload aman (private storage + signed URL)