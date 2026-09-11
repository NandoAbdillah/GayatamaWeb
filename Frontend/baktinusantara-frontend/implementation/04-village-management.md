# Implementasi Fase 4: Manajemen Desa & Periode KKN (Next.js Frontend)

## Tujuan
Membangun frontend Next.js untuk manajemen desa, riwayat KKN, surat tugas digital, dan cap digital, terhubung ke Laravel 12 backend.

## Hubungan dengan Backend Laravel 12
| Endpoint Laravel | Method | Fungsi |
|---|---|---|
| `GET /api/desa/riwayat-kkn` | GET | Riwayat KKN desa |
| `POST /api/desa/surat-tugas` | POST | Generate surat tugas digital |
| `GET /api/desa/aspirasi` | GET | List aspirasi masuk (scope desa) |
| `PATCH /api/desa/aspirasi/{id}/verify` | PATCH | Verify aspirasi |
| `POST /api/desa/pos-kebutuhan` | POST | Publish pos kebutuhan |
| `PATCH /api/desa/proposal/{id}/decide` | PATCH | Approve/reject proposal |
| `PATCH /api/desa/luaran/{id}/verify` | PATCH | Verify luaran akhir |

## Fitur Frontend yang Akan Diimplementasikan

### 1. Riwayat KKN Desa (`app/perangkat-desa/riwayat/page.tsx`)
- List semua KKN yang pernah diterima desa
- Filter berdasarkan tahun, jenis KKN, jumlah mahasiswa
- Setiap entri → link ke halaman detail
- Akses ke laporan mingguan jika tersedia
- Tampilkan statistik: jumlah KKN per tahun, rata-rata partisipan

### 2. Surat Tugas Digital (`app/perangkat-desa/surat-tugas/page.tsx`)
- Form template surat tugas:
  - Pilih mahasiswa/kelompok
  - Pilih periode KKN
  - Pilih jenis kegiatan
  - Upload lampiran (opsional)
- Submit ke `POST /api/desa/surat-tugas`
- Backend generate PDF (DomPDF) → return URL
- Frontend tampilkan preview PDF + tombol download/cetak
- Opsi tandatangan digital (e-signature)

### 3. Cap Digital (`app/perangkat-desa/surat-tugas/page.tsx`)
- Backend men-generate cap/logo desa yang unik
- Frontend menampilkan preview surat dengan cap yang sudah diterapkan
- Opsi download PDF dengan cap

### 4. Monitoring Kinerja dari Perspektif Desa (`app/perangkat-desa/progress/page.tsx`)
- Dashboard monitoring semua kelompok KKN di desa
- Status setiap kelompok: on track / terlambat / ahead
- Form feedback untuk kinerja kelompok (dikirim ke backend)
- Penilaian: kedisiplinan, kualitas kerja, kolaborasi dengan masyarakat
- Tampilkan rekomendasi untuk mahasiswa outstanding

### 5. Kalender Jadwal KKN (`app/perangkat-desa/riwayat/page.tsx`)
- Tampilkan kalender KKN yang diterima desa di tahun berjalan
- Notifikasi ketika ada kelompok yang akan datang
- Integrasi dengan backend: `GET /api/desa/jadwal-kkn`

### 6. Verifikasi Luaran (`app/perangkat-desa/luaran/page.tsx`)
- List luaran yang masuk untuk diverifikasi
- Detail luaran → review file deliverable + deskripsi
- Approve → `PATCH /api/desa/luaran/{id}/verify` → backend auto-generate portofolio & sertifikat
- Reject → isi alasan → kirim WA notifikasi otomatis

### 7. Pengecekan Cap Perangkat Desa (`app/perangkat-desa/verifikasi/page.tsx`)
- Fitur untuk admin platform memverifikasi keabsahan cap desa
- Display: daftar desa yang sudah verify vs belum
- Admin platform bisa approve/reject verifikasi desa
- Backend: `GET /api/admin/verifikasi-desa`

## Teknologi yang Digunakan
- **Framework**: Next.js 14 App Router
- **PDF Generation**: Backend pakai DomPDF → frontend download via signed URL
- **Signature**: e-signature library (frontend) atau backend-side
- **Calendar**: React Calendar / FullCalendar.js
- **File Display**: PDF.js atau embedded viewer untuk preview
- **UI**: shadcn/ui, Tailwind CSS
- **Charts**: Recharts untuk statistik riwayat KKN
- **Auth**: Sanctum token

## Estimasi Waktu
- **2-3 minggu** untuk 1 frontend developer

## Kriteria Acceptance
- Desa dapat melihat riwayat KKN dengan filter yang relevan
- Surat tugas digital dapat dibuat, dilihat preview, dan didownload sebagai PDF
- Cap digital diterapkan pada surat dengan benar
- Dashboard monitoring menampilkan status semua kelompok aktif
- Feedback kinerja dapat dikirim dan tersimpan
- Kalender jadwal KKN berfungsi dengan notifikasi
- Luaran dapat diverifikasi dan portofolio auto-generate
- Cap desa diverifikasi oleh admin platform