# 🚀 BaktiNusantara — Frontend Integration & API Guide

Panduan teknis lengkap untuk Frontend Engineer dalam mengintegrasikan antarmuka web dengan RESTful Backend **BaktiNusantara** (Laravel 12 / Sanctum).

---

## 📌 1. Konfigurasi Dasar & Autentikasi

### Base URL
- **Local Development:** `http://127.0.0.1:8000/api`
- **Headers Wajib:**
  ```http
  Accept: application/json
  Content-Type: application/json
  ```
- **Untuk Request File Upload (`multipart/form-data`):**
  Jangan set `Content-Type: application/json`, biarkan browser/Axios mengisi boundary form-data secara otomatis.

### Format Auth Token
Setelah login (`POST /api/login`), simpan `token` di local storage / cookie. Sertakan header berikut pada semua endpoint terproteksi:
```http
Authorization: Bearer <token_kamu>
```

### Standar Struktur Response JSON
- **Success Response:**
  ```json
  {
    "message": "Pesan sukses operasional.",
    "data": { ... }
  }
  ```
- **Validation Error (422 Unprocessable Content):**
  ```json
  {
    "message": "The given data was invalid.",
    "errors": {
      "email": ["Format email tidak valid."],
      "password": ["Password minimal 8 karakter."]
    }
  }
  ```

---

## 🔑 2. Cheatsheet Akun & Testing Credentials

Semua akun di bawah ini telah ter-seed secara otomatis dan siap dipakai langsung.  
**Password untuk semua akun:** `password`

| Role | Email | Password | Nama / Keterangan | Use-Case Pengujian Frontend |
|---|---|---|---|---|
| **Admin** | `admin@baktinusantara.id` | `password` | Super Admin Platform | Verifikasi desa, mahasiswa, dan universitas pending. |
| **Universitas (Verified)** | `unesa@unesa.ac.id` | `password` | LPM UNESA | Tambah dosen DPL, pantau kelompok binaan, tinjau evaluasi desa. |
| **Universitas (Verified)** | `its@its.ac.id` | `password` | DRPM ITS | Kelola DPL & kelompok KKN asal ITS. |
| **Universitas (Pending)** | `unair@unair.ac.id` | `password` | LPPM UNAIR | Uji validasi akun belum diverifikasi admin. |
| **Dosen DPL (UNESA)** | `dosen.budi@unesa.ac.id` | `password` | Dr. Budi Santoso, M.Kom. | DPL Kelompok 1. Validasi proposal kelayakan, monitor progress 1-4. |
| **Dosen DPL (UNESA)** | `dosen.retno@unesa.ac.id` | `password` | Dr. Retno Wulandari, M.Pd. | DPL Kelompok 3 (Proposal baru status menunggu). |
| **Dosen DPL (ITS)** | `dosen.agus@its.ac.id` | `password` | Ir. Agus Setiawan, M.T. | DPL Kelompok 2 (Biogas KKN ITS). |
| **Perangkat Desa 1** | `desa.sukamaju@desa.id` | `password` | Desa Sukamaju (Jombang) | Kurasi aspirasi, kelola pos UMKM, approve proposal, validasi luaran akhir. |
| **Perangkat Desa 2** | `desa.berkahmakmur@desa.id` | `password` | Desa Berkah Makmur (Pasuruan)| Pos Lingkungan, pantau progress mingguan, kirim laporan DPL. |
| **Perangkat Desa 3** | `desa.cempakaputih@desa.id` | `password` | Desa Cempaka Putih (Mojokerto)| Pos Pendidikan terbuka yang dilamar Kelompok 3. |
| **Perangkat Desa (Pending)**| `desa.pending@desa.id` | `password` | Desa Maju Bersama | Uji akses desa sebelum diverifikasi admin. |
| **Mahasiswa (Ketua 1)** | `ketua.ahmad@mhs.unesa.ac.id`| `password` | Ahmad Fauzi (Ketua UNESA 01) | Siklus penuh: Proposal diterima, progress 1-4 (100%), luaran verified, e-sertifikat aktif. |
| **Mahasiswa (Anggota 1)** | `anggota.siti@mhs.unesa.ac.id`| `password` | Siti Aminah (DKV UNESA) | Akses anggota kelompok 1, upload laporan & berkas luaran. |
| **Mahasiswa (Anggota 1)** | `anggota.bambang@mhs.unesa.ac.id`| `password` | Bambang Prakoso (Manajemen) | Anggota kelompok 1. |
| **Mahasiswa (Ketua 2)** | `ketua.dimas@mhs.its.ac.id`| `password` | Dimas Pratama (Ketua ITS) | Skenario jarak jauh (> 1000 km), upload surat izin orang tua, progress berjalan. |
| **Mahasiswa (Anggota 2)** | `anggota.rina@mhs.its.ac.id`| `password` | Rina Kusuma (Teknik Lingkungan)| Anggota kelompok 2. |
| **Mahasiswa (Ketua 3)** | `ketua.bayu@mhs.unesa.ac.id`| `password` | Bayu Setiawan (Ketua UNESA 02)| Skenario proposal baru berstatus `menunggu`. |
| **Mahasiswa (Solo/Available)**| `mhs.solo@mhs.unesa.ac.id`| `password` | Dewi Lestari (Kesmas) | Mahasiswa aktif belum punya kelompok (uji buat kelompok / gabung). |
| **Mahasiswa (Pending)** | `mhs.pending@mhs.unesa.ac.id`| `password` | Fajar Nugraha | Uji mahasiswa belum diverifikasi admin. |

---

## 🗺️ 3. API Wilayah Indonesia (Dropdown Bertingkat / Cascading)

Endpoint publik untuk form dropdown berjenjang (Provinsi $\rightarrow$ Kabupaten $\rightarrow$ Kecamatan $\rightarrow$ Desa):

```http
GET /api/wilayah/provinsi
GET /api/wilayah/kabupaten/{provinceId}
GET /api/wilayah/kecamatan/{regencyId}
GET /api/wilayah/desa/{districtId}
```

**Contoh Response:**
```json
[
  { "id": "35", "name": "JAWA TIMUR" },
  { "id": "33", "name": "JAWA TENGAH" }
]
```

---

## 🔐 4. Modul Autentikasi & Registrasi

### A. Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "desa.sukamaju@desa.id",
  "password": "password"
}
```
**Response (200 OK):**
```json
{
  "message": "Login berhasil",
  "token": "1|abcdef123456...",
  "user": {
    "id": 5,
    "name": "Kantor Kepala Desa Sukamaju",
    "email": "desa.sukamaju@desa.id",
    "role": "perangkat_desa",
    "is_verified": true
  }
}
```

### B. Registrasi Mahasiswa
```http
POST /api/register/mahasiswa
Content-Type: multipart/form-data

name: "Rudi Hermawan"
email: "rudi@mhs.unesa.ac.id"
password: "password"
password_confirmation: "password"
phone_wa: "081299998888"
universitas_id: 1                  // Ambil dari GET /api/universitas
nim: "23051204099"
jurusan: "Teknik Informatika"
semester: 6
ktm_file: (binary file PDF/JPG/PNG)
```

### C. Registrasi Perangkat Desa
```http
POST /api/register/desa
Content-Type: multipart/form-data

name: "Kantor Desa Sumberrejo"
email: "desa.sumberrejo@desa.id"
password: "password"
password_confirmation: "password"
phone_wa: "081277776666"
nama_desa: "Desa Sumberrejo"
kecamatan: "Pacet"
kabupaten: "Kabupaten Mojokerto"
provinsi: "Jawa Timur"
latitude: -7.654321
longitude: 112.543210
sk_file: (binary file PDF)
```

### D. Registrasi Universitas
```http
POST /api/register/universitas
Content-Type: application/json

{
  "name": "LPPM Universitas Brawijaya",
  "email": "lppm@ub.ac.id",
  "password": "password",
  "password_confirmation": "password",
  "phone_wa: "081233334444",
  "nama_universitas": "Universitas Brawijaya",
  "kode_univ": "UB"
}
```

### E. Current User Profile & Logout
```http
GET /api/user            (Auth) -> Mengambil user yang sedang login
POST /api/logout         (Auth) -> Menghanguskan token sesi
```

---

## 📢 5. Modul Aspirasi Warga Desa

### A. Submit Aspirasi (Publik / Tamu)
```http
POST /api/aspirasi
Content-Type: multipart/form-data

desa_id: 1
pelapor_nama: "Pak Bambang"
pelapor_wa: "085712345678"
kategori: "umkm"                      // umkm | kesehatan | lingkungan | pendidikan | fasilitas
deskripsi: "Pelatihan pembukuan dan foto produk UMKM desa."
latitude: -7.6358
longitude: 112.2965
urgensi: "sedang"                     // rendah | sedang | mendesak
foto: (opsional binary image)
```

### B. Cek Status Aspirasi (Publik)
```http
GET /api/aspirasi/{id}
```

### C. Perangkat Desa: List & Kurasi Aspirasi
```http
GET /api/desa/aspirasi                (Auth: perangkat_desa)
PATCH /api/desa/aspirasi/{id}/decide  (Auth: perangkat_desa)

// Approve & Jadi Pos Kebutuhan:
{
  "action": "approve",
  "judul": "Digitalisasi Pemasaran UMKM",
  "kuota_kelompok": 1,
  "deadline": "2026-10-30",
  "sdg_codes": [8, 9],
  "jurusan_dibutuhkan": {
    "Teknik Informatika": 1,
    "Desain Komunikasi Visual": 1
  }
}

// Reject:
{
  "action": "reject",
  "alasan_tolak": "Di luar cakupan pengabdian KKN."
}
```

---

## 📌 6. Modul Pos Kebutuhan Desa

### A. Publik: Katalog & Detail Pos Kebutuhan
```http
GET /api/pos-kebutuhan
GET /api/pos-kebutuhan?kategori=umkm
GET /api/pos-kebutuhan?sdg=8
GET /api/pos-kebutuhan?status=open
GET /api/pos-kebutuhan?lat=-7.2575&lng=112.7521   // Sortir otomatis terdekat (Haversine)
GET /api/pos-kebutuhan/{id}
```

### B. Perangkat Desa: Direct Publish Pos Kebutuhan
```http
POST /api/desa/pos-kebutuhan          (Auth: perangkat_desa)
Content-Type: application/json

{
  "judul": "Pemberdayaan Posyandu Balita",
  "deskripsi": "Pendataan gizi anak dan balita.",
  "kategori": "kesehatan",
  "sdg_codes": [3],
  "kuota_kelompok": 2,
  "deadline": "2026-11-15",
  "jurusan_dibutuhkan": {
    "Kesehatan Masyarakat": 2,
    "Gizi": 1
  }
}
```

---

## 👥 7. Modul Kelompok Mahasiswa & DPL

### A. Buat Kelompok (Ketua)
```http
POST /api/kelompok                    (Auth: mahasiswa)
{
  "nama_kelompok": "KKN UNESA Sukamaju Hebat"
}
```

### B. Mahasiswa Gabung Kelompok
```http
POST /api/kelompok/{id}/join          (Auth: mahasiswa)
{
  "jurusan_kontribusi": "Teknik Informatika"
}
```

### C. Detail Kelompok
```http
GET /api/kelompok/{id}                (Auth: mahasiswa)
```

### D. Tetapkan Dosen Pembimbing Lapangan (DPL)
> Mahasiswa hanya bisa memilih DPL yang berasal dari universitas yang sama.
```http
POST /api/kelompok/{id}/set-dosen     (Auth: mahasiswa - Ketua)
{
  "dosen_id": 1
}
```

---

## 📝 8. Modul Proposal Pengajuan KKN

### A. Submit Proposal (Ketua Kelompok)
```http
POST /api/proposal                    (Auth: mahasiswa - Ketua)
Content-Type: multipart/form-data

pos_kebutuhan_id: 1
draf_proker: "Program akselerasi digitalisasi UMKM desa."
latitude: -7.2575                     // Koordinat asal kampus/mahasiswa
longitude: 112.7521
file_proposal: (binary PDF)
surat_pengantar: (opsional binary PDF)
```
*(Sistem otomatis menghitung `matching_score` kecocokan jurusan dan `jarak_km`. Jika jarak > 1.000 km, sistem otomatis mewajibkan Surat Izin Ortu).*

### B. Dosen DPL: Tinjau Kelayakan Proposal
```http
PATCH /api/dosen/proposal/{id}/kelayakan   (Auth: dosen)
{
  "status_kelayakan": "layak",        // layak | perlu_revisi
  "catatan_dosen": "Rancangan proker sangat matang dan siap dijalankan."
}
```

### C. Perangkat Desa: Putusan Proposal (Approve / Reject)
```http
PATCH /api/desa/proposal/{id}/decide      (Auth: perangkat_desa)
{
  "action": "approve",                // approve | reject
  "catatan_desa": "Selamat, proposal disetujui pihak desa."
}
```

---

## 📊 9. Modul Progress Mingguan & Surat Izin Ortu

### A. Lapor Progress Mingguan (Mahasiswa Tim)
```http
POST /api/progress                    (Auth: mahasiswa)
Content-Type: multipart/form-data

proposal_id: 1
minggu_ke: 2                          // Harus berurutan (1, 2, 3...)
persentase: 50
deskripsi: "Rebranding kemasan produk UMKM."
foto: (opsional binary image)
```

### B. Lihat Timeline Progress Proposal
```http
GET /api/proposal/{proposal_id}/progress   (Auth)
```

### C. Upload Surat Izin Orang Tua (Jika jarak KKN > 1.000 km)
```http
POST /api/proposal/{proposal_id}/surat-izin-ortu   (Auth: mahasiswa - Ketua)
Content-Type: multipart/form-data

file_surat: (binary PDF)
```

---

## 🏆 10. Modul Luaran Akhir, Portofolio & E-Sertifikat

### A. Mahasiswa: Upload Berkas Luaran Akhir
```http
POST /api/luaran                      (Auth: mahasiswa)
Content-Type: multipart/form-data

proposal_id: 1
deskripsi: "Aplikasi katalog produk UMKM dan template kemasan."
file_deliverable: (binary ZIP/PDF)
```

### B. Perangkat Desa: Verifikasi Luaran & Terbitkan Portofolio + E-Sertifikat
```http
PATCH /api/desa/luaran/{luaran_id}/verify   (Auth: perangkat_desa)
{
  "ringkasan_dampak": "Meningkatkan penjualan UMKM desa sebesar 65%.",
  "testimoni_desa": "Sangat solutif dan membantu warga desa."
}
```

### C. Publik: Lihat E-Portofolio Publik
```http
GET /api/portofolio/{slug}            (Publik tanpa auth)
```
**Contoh URL Siap Cek:**
`GET /api/portofolio/digitalisasi-branding-dan-e-commerce-umkm-kripik-singkong-sukamaju`

*(Response memuat rincian dampak, testimoni, profil kelompok, profil desa, dan URL `sertifikat_pdf_url` yang bisa diunduh/dibuka langsung di browser).*

---

## 🏫 11. Tata Kelola Universitas & Evaluasi DPL

### A. Universitas: Tambah Dosen DPL
```http
POST /api/universitas/dosen           (Auth: universitas)
{
  "name": "Dr. Siti Rahayu, M.Si.",
  "email": "siti.rahayu@unesa.ac.id",
  "password": "password",
  "nip": "198305102008122001",
  "no_hp": "081234567899"
}
```

### B. Perangkat Desa: Kirim Evaluasi Kinerja DPL
```http
POST /api/desa/laporan-dosen          (Auth: perangkat_desa)
{
  "dosen_id": 1,
  "proposal_id": 1,
  "isi": "DPL sangat responsif dan membimbing mahasiswa secara optimal di lapangan."
}
```

### C. Universitas: Tinjau Laporan Evaluasi DPL
```http
PATCH /api/universitas/laporan-dosen/{id}/status   (Auth: universitas)
{
  "status": "ditinjau"                // menunggu | ditinjau | selesai
}
```

---

## 📈 12. Dashboard Metrik Dampak Nasional (Landing Page)

Endpoint publik real-time untuk komponen Counter / Hero Section / Statistik Dampak pada landing page:
```http
GET /api/dashboard/metrics            (Publik)
```
**Response (200 OK):**
```json
{
  "message": "Metrik dampak nasional berhasil dimuat.",
  "data": {
    "total_desa_terbantu": 2,
    "total_umkm_terdigitalisasi": 1,
    "total_kelompok_kkn": 3,
    "total_mahasiswa_terlibat": 7,
    "total_jam_pengabdian": 640,
    "total_pos_kebutuhan": 5,
    "status_pos_breakdown": {
      "open": 2,
      "in_progress": 2,
      "completed": 1
    },
    "total_luaran_terverifikasi": 1,
    "total_portofolio_publik": 1,
    "kategori_breakdown": {
      "umkm": 1,
      "lingkungan": 1,
      "kesehatan": 1,
      "pendidikan": 1,
      "fasilitas": 1
    },
    "sdgs_distribution": {
      "SDG 3": 1,
      "SDG 4": 1,
      "SDG 8": 1,
      "SDG 9": 2,
      "SDG 11": 1,
      "SDG 13": 1,
      "SDG 15": 1
    }
  }
}
```

---

## 🔔 13. Pusat Notifikasi In-App Real-Time

Tiap user yang login memiliki notifikasi inbox tersendiri:

```http
GET /api/notifikasi                   (Auth) -> Semua notifikasi (paginated)
GET /api/notifikasi?unread=1          (Auth) -> Hanya notifikasi yang belum dibaca
PATCH /api/notifikasi/{id}/read       (Auth) -> Tandai 1 notifikasi telah dibaca
PATCH /api/notifikasi/read-all        (Auth) -> Tandai semua notifikasi telah dibaca
```

---

## 🛡️ 14. Admin Verifikasi Platform

```http
PATCH /api/admin/desa/{profilDesa}/verify           (Auth: admin)
PATCH /api/admin/mahasiswa/{profilMahasiswa}/verify (Auth: admin)
PATCH /api/admin/universitas/{profilUniversitas}/verify (Auth: admin)
```

---

## 💡 15. Tips & Cara Reset Database Kapan Saja

Jika ingin mereset seluruh data kembali ke kondisi awal yang bersih & lengkap:
```powershell
php artisan migrate:fresh --seed
```
Setelah perintah di atas selesai, seluruh data di panduan ini akan otomatis tersedia kembali!