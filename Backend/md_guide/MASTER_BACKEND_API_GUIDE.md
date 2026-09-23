# 🏛️ Master Dokumentasi Lengkap Backend API BaktiNusantara

Dokumentasi resmi arsitektur, seluruh rute API, struktur data, format request/response, autentikasi, serta integrasi gateway untuk platform **BaktiNusantara (GayatamaWeb)**.

---

## 📑 Daftar Isi
1. [Arsitektur & Konvensi Umum](#1-arsitektur--konvensi-umum)
2. [Matriks Peran Pengguna (Role-Based Access Control)](#2-matriks-peran-pengguna-rbac)
3. [Autentikasi & Registrasi](#3-autentikasi--registrasi)
4. [Super Admin Platform](#4-super-admin-platform)
5. [Aspirasi Warga & Layanan Aduan Desa](#5-aspirasi-warga--layanan-aduan-desa)
6. [Pos Kebutuhan KKN Desa](#6-pos-kebutuhan-kkn-desa)
7. [Kelompok Mahasiswa & Penetapan DPL](#7-kelompok-mahasiswa--penetapan-dpl)
8. [Pengajuan & Validasi Proposal KKN](#8-pengajuan--validasi-proposal-kkn)
9. [Progres Mingguan, Logbook & Surat Izin Ortu](#9-progres-mingguan-logbook--surat-izin-ortu)
10. [Luaran Akhir, Verifikasi Desa & Portofolio Publik](#10-luaran-akhir-verifikasi-desa--portofolio-publik)
11. [LPPM Perguruan Tinggi (Universitas)](#11-lppm-perguruan-tinggi-universitas)
12. [Dosen Pembimbing Lapangan (DPL)](#12-dosen-pembimbing-lapangan-dpl)
13. [Dashboard Metrik Nasional & SDGs](#13-dashboard-metrik-nasional--sdgs)
14. [Data Wilayah Administratif Indonesia](#14-data-wilayah-administratif-indonesia)
15. [Media Sosial & Feed Pengabdian](#15-media-sosial--feed-pengabdian)
16. [WhatsApp Gateway & Webhook Bot Dua Arah](#16-whatsapp-gateway--webhook-bot-dua-arah)
17. [AI Real-Time Context & Smart Matching Engine](#17-ai-real-time-context--smart-matching-engine)
18. [Sistem Notifikasi Pengguna](#18-sistem-notifikasi-pengguna)
19. [Peta Interaktif Geospasial & Haversine Distance Engine](#19-peta-interaktif-geospasial--haversine-distance-engine)
20. [E-Sertifikat KKN & Verifikasi Kriptografis Publik](#20-e-sertifikat-kkn--verifikasi-kriptografis-publik)

---

## 1. Arsitektur & Konvensi Umum

- **Framework**: Laravel 12 on PHP 8.2+
- **Database**: MySQL 
- **Autentikasi**: Laravel Sanctum (Token-Based Bearer Authentication)
- **Base URL**: `http://127.0.0.1:8000/api`
- **Format Header Standar**:
  ```http
  Content-Type: application/json
  Accept: application/json
  Authorization: Bearer <SANCTUM_TOKEN>
  ```
- **Format Response Standar**:
  ```json
  {
    "message": "Pesan deskriptif keberhasilan",
    "data": { ... }
  }
  ```
- **Format Error Standar (`422 Unprocessable Content` / `403 Forbidden` / `401 Unauthorized`)**:
  ```json
  {
    "message": "Pesan kesalahan atau validasi gagal",
    "errors": {
      "field_name": ["Penjelasan error validasi"]
    }
  }
  ```

---

## 2. Matriks Peran Pengguna (RBAC)

| Role Slug | Nama Peran | Hak Akses Utama |
|---|---|---|
| `admin` | **Super Admin Platform** | Verifikasi SK Desa, verifikasi KTM Mahasiswa, verifikasi Kampus, pengawasan sebaran KKN nasional, statistik agregat 17 SDGs. |
| `universitas` | **LPPM Perguruan Tinggi** | Daftarkan DPL kampus, kelola bimbingan kelompok KKN internal, evaluasi laporan DPL dari desa, monitoring metrik internal kampus. |
| `dosen` | **Dosen Pembimbing Lapangan** | Akses kelompok mahasiswa binaan, validasi kelayakan proposal program kerja (`layak`/`perlu_revisi`), review progres mingguan. |
| `perangkat_desa` | **Aparatur / Pemerintah Desa** | Verifikasi aspirasi warga, buat pos kebutuhan KKN, setujui proposal masuk, verifikasi luaran akhir, kirim evaluasi kinerja DPL ke kampus. |
| `mahasiswa` | **Mahasiswa KKN** | Bentuk/gabung kelompok, pilih DPL, ajukan proposal ke pos desa, isi logbook mingguan, upload surat izin ortu (>50km), submit luaran. |
| *Publik/Warga* | **Warga Masyarakat** | Kirim aspirasi desa via web/WhatsApp, cek status tiket, eksplorasi katalog pos KKN, akses portofolio publik & sertifikat terverifikasi. |

---

## 3. Autentikasi & Registrasi

### 3.1 Login Pengguna (`POST /api/login`)
- **Akses**: Publik
- **Payload**:
  ```json
  {
    "email": "ahmad@unesa.ac.id",
    "password": "password123"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "message": "Login berhasil",
    "token": "1|qwert123456...",
    "user": {
      "id": 5,
      "name": "Ahmad Mahasiswa",
      "email": "ahmad@unesa.ac.id",
      "role": "mahasiswa",
      "is_verified": true
    }
  }
  ```

### 3.2 Logout (`POST /api/logout`)
- **Akses**: Auth (`auth:sanctum`)
- **Header**: `Authorization: Bearer <TOKEN>`
- **Response (`200 OK`)**:
  ```json
  { "message": "Logout berhasil" }
  ```

### 3.3 Get Current User (`GET /api/user`)
- **Akses**: Auth (`auth:sanctum`)

### 3.4 Registrasi Mahasiswa (`POST /api/register/mahasiswa`)
- **Payload (`multipart/form-data`)**:
  - `name`: string
  - `email`: string (unique)
  - `password`: string
  - `phone_wa`: string
  - `universitas_id`: integer (ID perguruan tinggi yang sudah terverifikasi admin)
  - `nim`: string
  - `jurusan`: string
  - `semester`: integer
  - `ktm_file`: file (PDF/JPG/PNG, max 2MB)
- **Response (`201 Created`)**:
  ```json
  {
    "message": "Registrasi mahasiswa berhasil, menunggu verifikasi KTM oleh admin",
    "data": { "id": 10, "nim": "23051204001", "jurusan": "Teknik Informatika" }
  }
  ```

### 3.5 Registrasi Perangkat Desa (`POST /api/register/desa`)
- **Payload (`multipart/form-data`)**:
  - `name`: string (Nama Kepala Desa / Admin Desa)
  - `email`: string
  - `password`: string
  - `phone_wa`: string
  - `nama_desa`: string
  - `kecamatan`: string
  - `kabupaten`: string
  - `provinsi`: string
  - `latitude`: float
  - `longitude`: float
  - `kontak_resmi`: string
  - `sk_file`: file (PDF/JPG/PNG SK Pengangkatan Kepala Desa)

### 3.6 Registrasi Perguruan Tinggi (`POST /api/register/universitas`)
- **Payload**:
  ```json
  {
    "name": "Admin LPPM UNESA",
    "email": "lppm@unesa.ac.id",
    "password": "password123",
    "nama_universitas": "Universitas Negeri Surabaya",
    "kode_univ": "UNESA-01",
    "phone_wa": "081234567890"
  }
  ```

### 3.7 Verifikasi OTP Registrasi (`POST /api/register/verify-otp`)
- **Akses**: Publik
- **Payload**:
  ```json
  {
    "identifier": "081234567890",
    "otp": "749201"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Verifikasi OTP berhasil. Akun Anda telah diverifikasi."
  }
  ```

### 3.8 Request / Resend OTP Multi-Saluran (`POST /api/otp/resend`)
- **Akses**: Publik
- **Channel**: `whatsapp` (default), `sms`, `email`
- **Payload**:
  ```json
  {
    "identifier": "081234567890",
    "purpose": "registration",
    "channel": "sms"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Kode OTP telah berhasil dikirimkan melalui SMS.",
    "target": "0812****7890",
    "channel": "sms",
    "expires_in_minutes": 15
  }
  ```

### 3.9 Validasi Kode OTP (`POST /api/otp/verify`)
- **Akses**: Publik (Step validasi sebelum submit form)
- **Payload**:
  ```json
  {
    "identifier": "081234567890",
    "otp": "749201",
    "purpose": "forgot_password"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "valid": true,
    "message": "Kode OTP valid."
  }
  ```

### 3.10 Lupa Kata Sandi / Forgot Password (`POST /api/forgot-password`)
- **Akses**: Publik
- **Payload**:
  ```json
  {
    "identifier": "ahmad@unesa.ac.id",
    "channel": "whatsapp"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Kode OTP pemulihan kata sandi telah dikirimkan via WHATSAPP.",
    "target": "ahm***@unesa.ac.id",
    "channel": "whatsapp",
    "expires_in_minutes": 15
  }
  ```

### 3.11 Reset Kata Sandi Baru (`POST /api/reset-password`)
- **Akses**: Publik (Memvalidasi OTP + mereset password + me-revoke seluruh Sanctum token aktif)
- **Payload**:
  ```json
  {
    "identifier": "081234567890",
    "otp": "749201",
    "password": "PasswordBaru#2026",
    "password_confirmation": "PasswordBaru#2026"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru Anda."
  }
  ```

### 3.12 Lupa Email / Account Lookup (`POST /api/forgot-email`)
- **Akses**: Publik (Mencari email akun terdaftar berdasarkan No WhatsApp, NIM Mahasiswa, atau NIP Dosen)
- **Payload**:
  ```json
  {
    "identifier": "081234567890",
    "channel": "whatsapp"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Informasi email terdaftar telah dikirimkan ke WHATSAPP pemilik akun.",
    "masked_email": "ahm***@unesa.ac.id",
    "name": "Ahmad Mahasiswa",
    "role": "mahasiswa"
  }
  ```

---

## 4. Super Admin Platform

### 4.1 Verifikasi Desa (`PATCH /api/admin/desa/{profilDesa}/verify`)
- **Akses**: Auth (`role:admin`)
- **Response (`200 OK`)**: Status desa berubah menjadi verified (`verified_at`).

### 4.2 Verifikasi Mahasiswa (`PATCH /api/admin/mahasiswa/{profilMahasiswa}/verify`)
- **Akses**: Auth (`role:admin`)

### 4.3 Verifikasi Perguruan Tinggi (`PATCH /api/admin/universitas/{profilUniversitas}/verify`)
- **Akses**: Auth (`role:admin`)

---

## 5. Aspirasi Warga & Layanan Aduan Desa

### 5.1 Kirim Aspirasi Warga (`POST /api/aspirasi`)
- **Akses**: Publik
- **Payload (`multipart/form-data`)**:
  - `desa_id`: integer (ID desa tujuan)
  - `pelapor_nama`: string
  - `pelapor_wa`: string (format nomor HP/WA aktif)
  - `kategori`: `umkm` | `kesehatan` | `lingkungan` | `pendidikan` | `fasilitas`
  - `deskripsi`: text
  - `latitude`: float
  - `longitude`: float
  - `foto`: file (opsional)
  - `urgensi`: `rendah` | `sedang` | `mendesak`
- **Response (`201 Created`)**:
  ```json
  {
    "message": "Aspirasi berhasil dikirim, nomor tiket Anda: ASP-202609-0001",
    "ticket": "ASP-202609-0001",
    "data": { ... }
  }
  ```

### 5.2 Lacak Tiket Aspirasi (`GET /api/aspirasi/{ticket}`)
- **Akses**: Publik

### 5.3 Daftar Aspirasi Masuk Desa (`GET /api/desa/aspirasi`)
- **Akses**: Auth (`role:perangkat_desa`)

### 5.4 Keputusan Desa atas Aspirasi (`PATCH /api/desa/aspirasi/{aspirasi}/decide`)
- **Akses**: Auth (`role:perangkat_desa`)
- **Payload**:
  ```json
  {
    "action": "terverifikasi",
    "alasan_tolak": null,
    "create_pos_kebutuhan": true,
    "judul_pos": "Optimalisasi Irigasi Pertanian Sawah",
    "sdg_codes": [6, 9],
    "kuota_kelompok": 2,
    "deadline": "2026-10-30",
    "jurusan_dibutuhkan": ["Teknik Sipil", "Agroteknologi"]
  }
  ```

---

## 6. Pos Kebutuhan KKN Desa

### 6.1 Katalog Pos Kebutuhan Terbuka (`GET /api/pos-kebutuhan`)
- **Akses**: Publik
- **Query Params**: `kategori`, `sdg_code`, `kabupaten`, `provinsi`, `search`
- **Response (`200 OK`)**: List pos kebutuhan lengkap dengan nama desa, kriteria jurusan, kuota, dan SDG codes.

### 6.2 Detail Pos Kebutuhan (`GET /api/pos-kebutuhan/{posKebutuhan}`)
- **Akses**: Publik

### 6.3 Desa Buat Pos Kebutuhan Baru (`POST /api/desa/pos-kebutuhan`)
- **Akses**: Auth (`role:perangkat_desa`)
- **Payload**:
  ```json
  {
    "judul": "Digitalisasi Pemasaran Produk Madu Hutan",
    "deskripsi": "Pembuatan branding kemasan, sertifikasi PIRT, dan katalog online",
    "kategori": "umkm",
    "sdg_codes": [8, 12],
    "kuota_kelompok": 1,
    "deadline": "2026-11-01",
    "jurusan_dibutuhkan": ["Teknik Informatika", "Desain Komunikasi Visual", "Manajemen"]
  }
  ```

### 6.4 Daftar Pos Milik Desa (`GET /api/desa/pos-kebutuhan`)
- **Akses**: Auth (`role:perangkat_desa`)

---

## 7. Kelompok Mahasiswa & Penetapan DPL

### 7.1 Mahasiswa Buat Kelompok Baru (`POST /api/kelompok`)
- **Akses**: Auth (`role:mahasiswa`)
- **Payload**: `{ "nama_kelompok": "Kelompok KKN 14 CyberDesa" }`
- **Response (`201 Created`)**: Mahasiswa pembuat otomatis ditetapkan sebagai Ketua Kelompok.

### 7.2 Mahasiswa Gabung Kelompok (`POST /api/kelompok/{kelompok}/join`)
- **Akses**: Auth (`role:mahasiswa`)

### 7.3 Detail Kelompok (`GET /api/kelompok/{kelompok}`)
- **Akses**: Auth (`role:mahasiswa`)

### 7.4 Ketua Pilih DPL dari Kampus Sendiri (`POST /api/kelompok/{kelompok}/set-dosen`)
- **Akses**: Auth (`role:mahasiswa` - Hanya Ketua Kelompok)
- **Payload**: `{ "dosen_id": 1 }`
- *Catatan Bisnis*: Sistem otomatis menolak jika Dosen berasal dari universitas berbeda (`422 Unprocessable Content`).

---

## 8. Pengajuan & Validasi Proposal KKN

### 8.1 Kelompok Ajukan Proposal ke Pos Desa (`POST /api/proposal`)
- **Akses**: Auth (`role:mahasiswa`)
- **Payload (`multipart/form-data`)**:
  - `pos_kebutuhan_id`: integer
  - `draf_proker`: text (deskripsi rencana program)
  - `latitude`: float (titik koordinat asal kelompok/kampus)
  - `longitude`: float
  - `file_proposal`: file (PDF max 10MB)
  - `surat_pengantar`: file (opsional)
- *Catatan Bisnis*: Backend otomatis menghitung jarak geospasial (km) dan matching score jurusan.

### 8.2 DPL Validasi Kelayakan Proposal (`PATCH /api/dosen/proposal/{proposal}/kelayakan`)
- **Akses**: Auth (`role:dosen`)
- **Payload**:
  ```json
  {
    "status_kelayakan": "layak",
    "catatan_dosen": "Rencana kerja sangat terstruktur dan sesuai target kompetensi."
  }
  ```

### 8.3 Desa Ambil Keputusan atas Proposal (`PATCH /api/desa/proposal/{proposal}/decide`)
- **Akses**: Auth (`role:perangkat_desa`)
- **Payload**:
  ```json
  {
    "action": "approve",
    "catatan_desa": "Selamat, proposal KKN kelompok Anda diterima di desa kami."
  }
  ```

---

## 9. Progres Mingguan, Logbook & Surat Izin Ortu

### 9.1 Mahasiswa Unggah Progres Mingguan (`POST /api/progress`)
- **Akses**: Auth (`role:mahasiswa`)
- **Payload (`multipart/form-data`)**:
  - `proposal_id`: integer
  - `minggu_ke`: integer (1, 2, 3, atau 4 - harus berurutan kronologis)
  - `persentase`: integer (0-100)
  - `deskripsi`: text (catatan kegiatan logbook)
  - `foto`: file (opsional)

### 9.2 Timeline Progres Proposal (`GET /api/proposal/{proposal}/progress`)
- **Akses**: Auth (Mahasiswa / Dosen / Desa / Admin)

### 9.3 Unggah Surat Izin Orang Tua (`POST /api/proposal/{proposal}/surat-izin-ortu`)
- **Akses**: Auth (`role:mahasiswa`)
- **Payload (`multipart/form-data`)**: `file_surat`: file (PDF/JPG)
- *Catatan Bisnis*: Wajib diunggah jika lokasi desa > 50km dari kampus.

---

## 10. Luaran Akhir, Verifikasi Desa & Portofolio Publik

### 10.1 Mahasiswa Unggah Berkas Luaran Akhir (`POST /api/luaran`)
- **Akses**: Auth (`role:mahasiswa`)
- **Payload (`multipart/form-data`)**:
  - `proposal_id`: integer (Proposal harus berstatus `diterima`)
  - `deskripsi`: text
  - `file_deliverable`: file (ZIP/PDF deliverable, disimpan di private storage)

### 10.2 Desa Verifikasi & Terbitkan Sertifikat (`PATCH /api/desa/luaran/{luaran}/verify`)
- **Akses**: Auth (`role:perangkat_desa`)
- **Payload**:
  ```json
  {
    "ringkasan_dampak": "Digitalisasi website meningkatkan omzet BUMDes sebesar 35%",
    "testimoni_desa": "Kerja sama mahasiswa KKN sangat memuaskan dan berdedikasi tinggi."
  }
  ```
- *Otomasi Backend*: Mengubah status menjadi `verified`, men-generate **Portofolio Publik**, dan menerbitkan **Sertifikat Pengesahan PDF**.

### 10.3 Portofolio Publik Terverifikasi (`GET /api/portofolio/{slug}`)
- **Akses**: Publik
- **Output**: Detail program, nama desa, kelompok mahasiswa, testimoni kepala desa, dan URL unduh sertifikat resmi.

---

## 11. LPPM Perguruan Tinggi (Universitas)

Seluruh endpoint di bawah ini terlindung dengan middleware `auth:sanctum` dan `role:universitas`, menjamin data **100% terisolasi per institusi kampus**.

### 11.1 Tambah Akun DPL Kampus (`POST /api/universitas/dosen`)
- **Payload**: `{ "name": "Dr. Budi Santoso", "email": "budi@unesa.ac.id", "password": "...", "nip": "19800101...", "no_hp": "0812345678" }`

### 11.2 Daftar DPL Kampus (`GET /api/universitas/dosen`)

### 11.3 Daftar Laporan Evaluasi DPL dari Desa (`GET /api/universitas/laporan-dosen`)

### 11.4 Update Status Laporan DPL (`PATCH /api/universitas/laporan-dosen/{laporanDosen}/status`)
- **Payload**: `{ "status": "ditinjau" }`

### 11.5 Metrik KKN Internal Kampus (`GET /api/universitas/metrics`)
- **Response (`200 OK`)**: Total dosen kampus, total mahasiswa kampus, total kelompok binaan, jam pengabdian efektif, desa mitra, dan kontribusi 17 SDGs kampus.

### 11.6 Monitoring Kelompok Kampus (`GET /api/universitas/kelompok`)
- **Response (`200 OK`)**: Daftar kelompok mahasiswa bimbingan DPL kampus tersebut dengan progres logbook live.

### 11.7 Audit Log Kampus (`GET /api/universitas/logs`)
- **Response (`200 OK`)**: Rekam jejak event civitas kampus tersebut.

---

## 12. Dosen Pembimbing Lapangan (DPL)

### 12.1 Daftar Kelompok Mahasiswa Binaan (`GET /api/dosen/kelompok`)
- **Akses**: Auth (`role:dosen`)

### 12.2 Validasi Kelayakan Proposal Binaan (`PATCH /api/dosen/proposal/{proposal}/kelayakan`)
- **Akses**: Auth (`role:dosen`)

---

## 13. Dashboard Metrik Nasional & SDGs

### 13.1 Metrik Agregat Nasional (`GET /api/dashboard/metrics`)
- **Akses**: Publik
- **Fungsi**: Digunakan di Landing Page dan Dashboard Super Admin untuk menampilkan statistik agregat Indonesia:
  - Total Desa Terbantu
  - Total UMKM Terdigitalisasi
  - Total Kelompok & Mahasiswa KKN se-Indonesia
  - Total Jam Pengabdian Nasional
  - Status Siklus Pos Kebutuhan (Open, In Progress, Completed)
  - Distribusi Capaian 17 SDGs

---

## 14. Data Wilayah Administratif Indonesia

Integrasi data master wilayah resmi Kemendagri & BIG dengan layer in-memory caching:
- `GET /api/wilayah/provinsi` (Daftar 38 Provinsi Indonesia)
- `GET /api/wilayah/kabupaten/{provinceId}` (Daftar Kabupaten/Kota)
- `GET /api/wilayah/kecamatan/{regencyId}` (Daftar Kecamatan)
- `GET /api/wilayah/desa/{districtId}` (Daftar Desa/Kelurahan)

---

## 15. Media Sosial & Feed Pengabdian

- `GET /api/medsos-posts` (Feed postingan dokumentasi kegiatan mahasiswa KKN)
- `POST /api/medsos-posts` (Buat postingan baru dengan gambar & tagar desa)
- `GET /api/medsos-posts/{medsosPost}` (Detail postingan)

---

## 16. WhatsApp Gateway & Webhook Bot Dua Arah

Backend terintegrasi dengan **Fonnte API Gateway** (`config/services.php`).

### 16.1 Notifikasi Otomatis (Asynchronous Queue Job)
Sistem otomatis mengirim notifikasi WhatsApp interaktif kepada nomor HP pengguna:
- Saat warga mengirim aspirasi (Nomor Tiket).
- Saat desa mengambil keputusan aspirasi/pos kebutuhan.
- Saat mahasiswa mengajukan proposal KKN.
- Saat DPL memvalidasi kelayakan proposal.
- Saat desa menyetujui/menolak proposal KKN.
- Saat luaran akhir disahkan oleh kepala desa.

### 16.2 Webhook Bot Dua Arah (`POST /api/webhook/whatsapp`)
- **URL Webhook**: `https://domain-anda.com/api/webhook/whatsapp`
- **Fitur Bot Cerdas Role-Aware**:
  - **Warga**: Buat laporan aspirasi langsung via chat WA (diproses NLP AI Service) & cek status tiket.
  - **Mahasiswa**: Cek status proposal KKN & pengingat tenggat waktu logbook.
  - **Perangkat Desa**: Cek proposal mahasiswa yang masuk dan konfirmasi luaran.
  - **Dosen**: Cek kelompok mahasiswa bimbingan aktif.

---

## 17. AI Real-Time Context & Smart Matching Engine

Menenagai **AI Smart Copilot / Agent (Aira)** di frontend:

| Method | Endpoint | Akses | Output & Kegunaan |
|---|---|---|---|
| `GET` | `/api/ai/context` | **Publik** | Snapshot platform real-time untuk reasoning LLM Gemini. |
| `GET` | `/api/ai/search-desa` | **Publik** | Pencarian profil desa terverifikasi + data agregat. |
| `POST` | `/api/ai/recommend-pos` | **Publik** | Algoritma matching score (0–100%), analisis kecocokan jurusan, dan ide proker terstruktur. |
| `GET` | `/api/ai/user-context` | **Auth (Sanctum)** | Data kontekstual personal pengguna yang sedang login + rekomendasi aksi berikutnya (*To-Do actions*). |
| `POST` | `/api/ai/draft-proposal` | **Auth (Sanctum)** | Generator draf proposal KKN 4-minggu berbasis aspirasi riil desa. |
| `POST` | `/api/ai/draft-logbook` | **Auth (Sanctum)** | Generator draf catatan logbook mingguan standar LPPM. |

---

## 18. Sistem Notifikasi Pengguna

- `GET /api/notifikasi` (Daftar notifikasi internal aplikasi)
- `GET /api/notifikasi?unread=1` (Filter notifikasi belum dibaca)
- `PATCH /api/notifikasi/{notifikasi}/read` (Tandai satu dibaca)
- `PATCH /api/notifikasi/read-all` (Tandai semua dibaca)

---

## 19. Peta Interaktif Geospasial & Haversine Distance Engine

Layanan geospasial terpusat untuk peta interaktif, visualisasi persebaran KKN, serta pencarian pos terdekat berbasis formula **Haversine** ($R = 6371\text{ km}$).

### 19.1 Pin Data Peta Interaktif (`GET /api/geospatial/map-data`)
- **Akses**: Publik
- **Query Params**:
  - `provinsi` (opsional): filter nama provinsi (misal `Jawa Timur`)
  - `kategori` (opsional): `umkm`, `kesehatan`, `lingkungan`, `pendidikan`, `fasilitas`
  - `sdg` (opsional): integer `1` - `17`
- **Response (`200 OK`)**:
  ```json
  {
    "total_desa_mitra": 3,
    "pins": [
      {
        "desa_id": 1,
        "nama_desa": "Desa Sukamaju",
        "kecamatan": "Mojowarno",
        "kabupaten": "Kabupaten Jombang",
        "provinsi": "Jawa Timur",
        "latitude": -7.6358,
        "longitude": 112.2965,
        "kontak_resmi": "081234567201",
        "total_pos_aktif": 1,
        "total_kelompok_kkn": 1,
        "sdgs_fokus": [8, 9],
        "kategori_pos": ["umkm"],
        "aspirasi_urgensi_tertinggi": "mendesak",
        "pos_kebutuhan": [
          {
            "id": 1,
            "judul": "Digitalisasi Branding dan E-Commerce UMKM",
            "kategori": "umkm",
            "sdg_codes": [8, 9],
            "kuota_kelompok": 1,
            "kuota_terisi": 1,
            "deadline": "2026-10-30",
            "status": "in_progress"
          }
        ]
      }
    ]
  }
  ```

### 19.2 Pencarian Pos KKN Terdekat via Haversine (`GET /api/geospatial/nearby-pos`)
- **Akses**: Publik
- **Query Params**:
  - `lat` (required): Latitude titik asal / kampus (misal `-7.3117`)
  - `lon` (required): Longitude titik asal / kampus (misal `112.7275`)
  - `radius_km` (opsional): batas jarak maksimal dalam km (misal `50`)
  - `kategori` (opsional): kategori pos
  - `sdg` (opsional): kode SDG 1-17
  - `jurusan` (opsional): kecocokan jurusan mahasiswa
- **Response (`200 OK`)**:
  ```json
  {
    "origin": { "latitude": -7.3117, "longitude": 112.7275 },
    "radius_filter_km": 50,
    "total_found": 1,
    "results": [
      {
        "pos_id": 2,
        "judul": "Pengolahan Biogas Kotoran Sapi",
        "kategori": "lingkungan",
        "sdg_codes": [13, 15],
        "kuota_kelompok": 1,
        "kuota_terisi": 0,
        "sisa_kuota": 1,
        "deadline": "2026-10-27",
        "desa": {
          "id": 2,
          "nama_desa": "Desa Berkah Makmur",
          "kabupaten": "Kabupaten Pasuruan",
          "latitude": -7.6931,
          "longitude": 112.6312
        },
        "jarak_km": 43.72,
        "requires_surat_izin_ortu": false,
        "travel_estimate": "± 1.1 jam (Darat/Mobil)"
      }
    ]
  }
  ```

### 19.3 Ringkasan Sebaran Regional per Provinsi (`GET /api/geospatial/province-summary`)
- **Akses**: Publik (Digunakan untuk visualisasi peta *Choropleth* Indonesia di Super Admin)
- **Response (`200 OK`)**:
  ```json
  {
    "total_provinces": 2,
    "provinces": [
      {
        "provinsi": "Jawa Timur",
        "total_desa_mitra": 2,
        "total_pos_kebutuhan": 3,
        "total_kelompok_bertugas": 2,
        "sdg_counts": { "SDG 8": 1, "SDG 9": 1, "SDG 13": 1 },
        "center_coordinate": { "latitude": -7.6358, "longitude": 112.2965 }
      }
    ]
  }
  ```

### 19.4 Utilitas Kalkulasi Jarak Geospasial (`POST /api/geospatial/calculate-distance`)
- **Akses**: Publik
- **Payload**:
  ```json
  {
    "lat1": -7.3117,
    "lon1": 112.7275,
    "lat2": -6.1754,
    "lon2": 106.8272
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "origin": { "latitude": -7.3117, "longitude": 112.7275 },
    "destination": { "latitude": -6.1754, "longitude": 106.8272 },
    "distance_km": 659.85,
    "requires_surat_izin_ortu": false,
    "travel_estimate": "± 11 jam (Darat/Kereta/Bus)"
  }
  ```

---

## 20. E-Sertifikat KKN & Verifikasi Kriptografis Publik

Mesin penerbitan dan verifikasi keaslian digital sertifikat resmi KKN berbasis nomor registrasi nasional dan signature hash kriptografis SHA-256.

### 20.1 Verifikasi Publik Keaslian Sertifikat (`GET /api/certificate/verify/{code}`)
- **Akses**: Publik (No-Auth — diakses langsung saat memindai QR Code)
- **Response (`200 OK`)**:
  ```json
  {
    "is_authentic": true,
    "status": "VALID & TERVERIFIKASI",
    "certificate_code": "BN-KKN-2026-UNESA-D1-8F3A12",
    "verification_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "recipient": {
      "name": "Ahmad Fauzi",
      "nim": "21051204001",
      "jurusan": "Teknik Informatika"
    },
    "academic": {
      "universitas": "Universitas Negeri Surabaya",
      "dosen_pembimbing": "Dr. Budi Santoso, M.Kom.",
      "total_jam_pengabdian": 160
    },
    "village": {
      "nama_desa": "Desa Sukamaju",
      "pengesahan": "Pemerintah Desa Mitra BaktiNusantara"
    },
    "program": {
      "judul": "Digitalisasi Branding dan E-Commerce UMKM",
      "sdg_codes": [8, 9]
    },
    "issued_at": "17 September 2026 15:30:00 WIB",
    "pdf_url": "http://127.0.0.1:8000/storage/certificates/BN-KKN-2026-UNESA-D1-8F3A12.pdf",
    "qr_code_svg": "<svg xmlns=..."
  }
  ```

### 20.2 Unduh Berkas PDF Sertifikat Asli (`GET /api/certificate/{code}/download`)
- **Akses**: Publik
- **Header**: `Content-Type: application/pdf`
- **Response**: Binary stream berkas PDF standar resmi.

### 20.3 Portal Sertifikat Mahasiswa (`GET /api/certificate/mine`)
- **Akses**: Auth (`role:mahasiswa`)
- **Response (`200 OK`)**: Daftar seluruh sertifikat KKN resmi yang diraih oleh mahasiswa yang sedang login.

### 20.4 Daftar Sertifikat Anggota per Proposal (`GET /api/certificate/proposal/{proposal}`)
- **Akses**: Auth (`auth:sanctum`)
- **Response (`200 OK`)**: Rincian sertifikat seluruh anggota tim pada proposal KKN terkait.

---

## 🧪 Panduan Menjalankan Pengujian Otomatis (Automated Tests)

Semua fungsionalitas backend di atas dilindungi oleh **68 Feature & Unit Test Suites (519 assertions)** dengan SQLite in-memory isolation.

Jalankan perintah berikut di direktori `Backend/baktinusantara-laravel`:
```bash
php artisan test
```
**Hasil Ekspektasi**:
```
Tests:  68 passed (519 assertions)
Time:   ~12.80s
```
