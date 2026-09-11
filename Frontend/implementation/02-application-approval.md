# Implementasi Fase 2: Pengajuan & Persetujuan KKN (Next.js Frontend)

## Tujuan
Membangun frontend Next.js untuk sistem pengajuan KKN oleh desa dan mekanisme approve/reject, terhubung ke Laravel 12 backend.

## Hubungan dengan Backend Laravel 12
| Endpoint Laravel | Method | Fungsi |
|---|---|---|
| `POST /api/aspirasi` | POST | Submit aspirasi masyarakat (public, no auth) |
| `GET /api/aspirasi/{ticket}` | GET | Cek status aspirasi via nomor tiket |
| `GET /api/desa/aspirasi` | GET | List aspirasi masuk ke desa (role: perangkat_desa) |
| `PATCH /api/desa/aspirasi/{id}/verify` | PATCH | Verify/reject aspirasi |
| `POST /api/desa/pos-kebutuhan` | POST | Publish pos kebutuhan |
| `POST /api/proposal` | POST | Submit proposal mahasiswa (role: mahasiswa) |
| `PATCH /api/desa/proposal/{id}/decide` | PATCH | Approve/reject proposal (role: perangkat_desa) |
| `PATCH /api/dosen/proposal/{id}/kelayakan` | PATCH | Validasi kelayakan (role: dosen) |

## Fitur Frontend yang Akan Diimplementasikan

### 1. Halaman Submit Aspirasi (`app/aspirasi/page.tsx`)
- Form publik tanpa login (Nama + WhatsApp + deskripsi + pin lokasi + foto)
- Submit ke `POST /api/aspirasi` (public endpoint)
- Setelah submit, tampilkan nomor tiket untuk tracking
- AI API di backend akan auto-suggest kategori → tampilkan di UI sebagai "Saran Kategori"

### 2. Cek Status Aspirasi (`app/aspirasi/[ticket]/page.tsx`)
- Form input nomor tiket
- Fetch `GET /api/aspirasi/{ticket}` → tampilkan status: menunggu / terverifikasi / ditolak
- Public endpoint, tidak perlu login

### 3. Dashboard Perangkat Desa - Aspirasi (`app/perangkat-desa/aspirasi/page.tsx`)
- List aspirasi masuk ke desa ini (scope: `GET /api/desa/aspirasi` dengan scope desa)
- Filter: status (menunggu/terverifikasi/ditolak), urgensi, kategori
- Action: Verify (setujui jadi pos kebutuhan) atau Reject (tolak dengan alasan)
- Click untuk detail aspirasi → buka `app/perangkat-desa/aspirasi/[id]/page.tsx`

### 4. Detail & Verify Aspirasi (`app/perangkat-desa/aspirasi/[id]/page.tsx`)
- Tampilkan detail lengkap aspirasi (deskripsi, lokasi, foto, status)
- Map preview lokasi (Leaflet/Google Maps)
- Tombol "Verify" → `PATCH /api/desa/aspirasi/{id}/verify`
  - Isi: kuota_kelompok, deadline, jurusan_dibutuhkan, SDG tags
  - Atau Reject dengan alasan → kirim WA notifikasi otomatis via backend
- Form publish pos kebutuhan langsung dari sini

### 5. Publish Pos Kebutuhan (`app/perangkat-desa/pos-kebutuhan/page.tsx`)
- Form untuk publish pos kebutuhan (dari aspirasi yang sudah verify)
- Field: nama pos, deskripsi, kuota, deadline, jurusan dibutuhkan, koordinat
- Submit ke `POST /api/desa/pos-kebutuhan`
- Status otomatis = 'open' → mahasiswa bisa lihat di katalog

### 6. Dashboard Mahasiswa - Proposal (`app/mahasiswa/proposal/page.tsx`)
- List pos kebutuhan yang tersedia (filter by radius, jurusan, urgency)
- Pilih pos kebutuhan → form proposal (draf proker + file proposal + surat pengantar)
- Hitung matching_score & jarak_km di background (via API)
- Submit ke `POST /api/proposal`
- Tampilkan badge "Cocok XX%" berdasarkan matching_score dari backend
- Tampilkan peringatan jika jarak > threshold → wajib upload surat_izin_ortu

### 7. Dashboard Desa - Proposal (`app/perangkat-desa/proposal/page.tsx`)
- List proposal yang masuk ke desa ini
- Filter: status (menunggu/approved/rejected), jarak, matching_score
- Detail proposal → `app/perangkat-desa/proposal/[id]/page.tsx`
- Approve → `PATCH /api/desa/proposal/{id}/decide` (kuota berkurang 1)
- Reject → wajib isi catatan_desa → kirim WA notifikasi otomatis

### 8. Validasi Kelayakan Dosen (`app/dosen/proposal/[id]/page.tsx`)
- Dosen login → lihat proposal binaannya
- Validasi administratif → `PATCH /api/dosen/proposal/{id}/kelayakan`
- Bisa approve atau reject dengan catatan

### 9. Notifikasi WhatsApp (via Backend)
- Frontend tidak perlu handle langsung (backend kirim via Job/Queue)
- Tampilkan badge "Notifikasi WA dikirim" di UI untuk feedback user

## Teknologi yang Digunakan
- **Framework**: Next.js 14 App Router
- **Map Integration**: Leaflet.js + React-Leaflet (atau Mapbox)
- **Form**: React Hook Form + Zod
- **API Client**: Axios dengan Sanctum interceptor
- **State**: Zustand untuk filter & pagination state
- **UI**: shadcn/ui, Tailwind CSS
- **Validation**: Laravel FormRequest (server-side) + Zod (client-side)
- **Notifications**: In-app toast notification (frontend) + WhatsApp (backend)

## Estimasi Waktu
- **2-3 minggu** untuk 1 frontend developer

## Kriteria Acceptance
- Masyarakat dapat submit aspirasi tanpa login
- Perangkat desa dapat verify aspirasi dan publish pos kebutuhan
- Mahasiswa dapat melihat pos kebutuhan, menghitung matching_score, dan submit proposal
- Desa dapat approve/reject proposal dengan catatan
- Dosen dapat validasi kelayakan proposal
- Semua notifikasi WA terkirim otomatis via backend
- Form validasi bekerja di client dan server