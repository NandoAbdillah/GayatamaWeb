# Implementasi Fase 7: Fitur Lanjutan & Keamanan (Next.js Frontend)

## Tujuan
Membangun frontend Next.js untuk fitur lanjutan seperti portofolio digital, verifikasi identitas, notifikasi cerdas, dan anti-manipulasi, terhubung ke Laravel 12 backend.

## Hubungan dengan Backend Laravel 12
| Endpoint Laravel | Method | Fungsi |
|---|---|---|
| `POST /api/luaran` | POST | Submit luaran akhir |
| `PATCH /api/desa/luaran/{id}/verify` | PATCH | Verify luaran → auto-generate portofolio |
| `GET /portofolio/{slug}` | GET | Portofolio publik (tanpa auth) |
| `GET /api/portofolio/{id}/verify` | GET | Verifikasi keaslian portofolio |
| `POST /api/surat-izin` | POST | Generate surat izin otomatis |
| `GET /api/admin/logs` | GET | Audit trail log aktivitas |

## Fitur Frontend yang Akan Diimplementasikan

### 1. Klaim Surat & Portofolio Digital (`app/mahasiswa/portofolio/page.tsx`)
- Setelah luaran diverifikasi oleh desa:
  - Tampilkan tombol "Klaim Sertifikat" → download PDF sertifikat (signed URL)
  - "Klaim Portofolio" → link portofolio publik dengan slug unik
  - QR code untuk verifikasi keaslian
- Frontend display QR code (dari backend QR generation URL)
- Klik QR code → scan → redirect ke `GET /portofolio/{slug}` → tampilkan portofolio

### 2. Portofolio Publik (`app/mahasiswa/portofolio/[slug]/page.tsx`)
- Halaman publik yang dapat diakses siapa saja
- Tampilkan: deliverable (file), deskripsi, sertifikat PDF
- Informasi: nama mahasiswa, kelompok, desa, periode KKN
- Bagikan ke LinkedIn/CV: URL copyable
- Verifikasi keaslian: scan QR atau cek slug di `GET /api/portofolio/{slug}/verify`

### 3. Sistem Pengingat Cerdas (Frontend Integration)
- Notifikasi progresif (hari ini, besok, 2 hari lagi) untuk submit progres mingguan
- Frontend menampilkan badge/toast:
  - "⏰ Jangan lupa submit progres minggu ini!" (1 hari sebelum deadline)
  - "⚠️ Progres minggu ini sudah deadline!" (after deadline)
- Eskalasi notifikasi jika terlambat:
  - Frontend menampilkan warning yang semakin intens
  - Backend mengirim WA (via Fonnte/Wablas) sebagai follow-up
- Frontend menampilkan daftar tugas yang harus diselesaikan dengan countdown timer

### 4. Validasi Identitas Mahasiswa (`app/mahasiswa/verifikasi/page.tsx`)
- Upload KTM + selfie dengan KTM (untuk verifikasi identitas)
- Frontend form dengan:
  - Upload foto KTM (JPG/PNG/PDF max 3MB)
  - Upload selfie dengan KTM
  - Konfirmasi NIM dan nama
- Submit ke `POST /api/mahasiswa/verifikasi-identitas`
- Backend: validasi NIM-KTM + mungkin integrasi layanan verifikasi KTP
- Frontend menampilkan status verifikasi: menunggu/diterima/ditolak

### 5. Verifikasi Lokasi KKN (`app/mahasiswa/lokasi/page.tsx`)
- Integrasi GPS browser → kirim lat/lon ke backend
- Backend Haversine check: apakah lokasi mahasiswa dalam radius yang ditentukan
- Frontend menampilkan:
  - Map dengan marker lokasi mahasiswa
  - Status: "Di lokasi KKN" (hijau) / "Di luar radius" (merah) / "GPS belum aktif" (kuning)
- Opsi fallback: jika GPS tidak tersedia, tampilkan form verifikasi manual (kode unik yang dikirim via WA oleh desa)

### 6. Anti-Manipulasi Laporan Progres
- Frontend menampilkan log aktivitas edit laporan (dari backend audit trail)
  - Siapa, kapan, apa yang diubah
  - Tampilkan di halaman detail progres
- Tanda tangan digital pada laporan yang sudah disetujui
  - Frontend display badge "Terverifikasi" + tanda tangan digital
- Peringatan ketika ada upaya edit laporan yang sudah locked
  - Frontend menampilkan alert: "Laporan ini sudah dikunci dan tidak dapat diedit"

### 7. Deteksi Performa KKN
- Frontend dashboard menampilkan metrik dampak KKN
  - Survei kepuasan masyarakat (link survei → hasil ditampilkan)
  - Feedback dari penerima manfaat (form + display)
  - Dashboard dengan metrik: jam KKN, output yang dihasilkan, manfaat
- Frontend menampilkan grafik dan insight yang dapat ditindaklanjuti

### 8. Manajemen Slot KKN
- Frontend untuk desa mengatur slot KKN:
  - Dashboard desa → atur kuota per periode
  - Tampilkan slot yang tersedia dan yang sudah terisi
  - Mekanisme anti-penyalahgunaan: tampilkan peringatan jika ada pola mencurigakan
- Frontend menampilkan transparansi alokasi slot ke kelompok

## Teknologi yang Digunakan
- **Map**: Leaflet.js dengan Geolocation API
- **QR Code**: `qrcode.react` library untuk generate QR
- **PDF Display**: PDF.js atau Next.js API route proxy
- **Notification**: Toast/alert system (React Hot Toast / Sonner)
- **Charts**: Recharts untuk dashboard monitoring
- **File Upload**: Next.js API route proxy ke Laravel Storage
- **Security**: CSRF protection, Sanctum token, rate limiting awareness
- **Audit Trail**: Frontend display log dari backend audit trail API
- **Geolocation**: Browser Geolocation API dengan fallback manual

## Estimasi Waktu
- **4-5 minggu** untuk 1 frontend developer (beberapa fitur membutuhkan integrasi kompleks)

## Kriteria Acceptance
- Portofolio digital dengan QR code verifikasi bekerja
- Surat/portofolio dapat diklaim setelah luaran diverifikasi
- Sistem pengingat progres menampilkan notifikasi yang tepat waktu
- Validasi identitas KTM + selfie berfungsi dan mengirim ke backend
- Verifikasi lokasi GPS bekerja dengan fallback manual
- Audit trail log aktivitas ditampilkan di halaman detail progres
- Dashboard monitoring menampilkan status real-time dengan warning
- Anti-manipulasi laporan dengan lock dan digital signature bekerja
- Slot KKN dapat dikelola oleh desa dengan transparansi