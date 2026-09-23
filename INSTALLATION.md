# 🛠️ Panduan Instalasi & Pengoperasian Sistem (Installation Guide)
**BaktiNusantara — Platform Kolaborasi KKN & Kebutuhan Desa Berbasis 17 SDGs**  
*Gayatama 5 International Web Technology Competition 2026*

---

Dokumen ini berisi panduan teknis langkah demi langkah untuk melakukan instalasi, konfigurasi basis data, pengaturan variabel lingkungan, hingga menjalankan layanan **Backend (Laravel 11)** dan **Frontend (Next.js 14)** secara lokal maupun pengujian oleh Dewan Juri.

---

## 📋 1. Prasyarat Sistem (System Prerequisites)

Sebelum memulai, pastikan perangkat Anda telah terpasang perangkat lunak pendukung berikut:

| Perangkat Lunak | Versi Minimal | Keterangan & Ekstensi yang Dibutuhkan |
| :--- | :--- | :--- |
| **PHP** | `^8.2` atau `^8.3` | Ekstensi aktif: `pdo_mysql`, `curl`, `mbstring`, `fileinfo`, `gd`, `openssl`, `tokenizer`, `xml` |
| **Composer** | `^2.6` | Package manager resmi untuk dependensi PHP |
| **Node.js** | `^18.18` atau `^20.x` | Runtime JavaScript untuk Next.js frontend |
| **NPM** | `^9.x` atau `^10.x` | Package manager resmi Node.js |
| **MySQL Server** | `^8.0` / MariaDB `^10.4` | Basis data relasional (bisa via XAMPP, Laragon, atau Docker) |
| **Git** | Versi terbaru | Untuk manajemen source code |

---

## ⚙️ 2. Topologi & Port Standar

Secara default, kedua subsistem berkomunikasi melalui port lokal berikut:

```
┌───────────────────────────────┐               ┌───────────────────────────────┐
│     FRONTEND (Next.js 14)     │ ── REST API ──►│     BACKEND (Laravel 11)      │
│     http://localhost:3000     │◄── JSON/Token─│     http://127.0.0.1:8000     │
└───────────────────────────────┘               └───────────────┬───────────────┘
                                                                │
                                                              MySQL
                                                      (Port 3306: baktinusantaradb)
```

---

## 🚀 3. Panduan Instalasi Backend (Laravel 11)

### Langkah 3.1: Masuk ke Folder Backend
Buka terminal dan arahkan ke direktori backend:
```bash
cd Backend/baktinusantara-laravel
```

### Langkah 3.2: Pasang Dependensi PHP
Jalankan Composer untuk mengunduh seluruh vendor library:
```bash
composer install
```

### Langkah 3.3: Konfigurasi File Environment (`.env`)
Salin template konfigurasi `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
*(Pengguna Windows PowerShell / Command Prompt dapat menggunakan perintah `copy .env.example .env`)*

Buka file `.env` yang baru dibuat, lalu sesuaikan koneksi database MySQL Anda:
```env
APP_NAME=BaktiNusantara
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Koneksi Basis Data MySQL
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=baktinusantaradb
DB_USERNAME=root
DB_PASSWORD=

# WhatsApp Gateway (Fonnte)
FONNTE_TOKEN=TXNfJzsbf2oBVhYFZFbn
FONNTE_URL=https://api.fonnte.com/send
WA_ENABLED=true

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=411606118566-q1pupeff65t4r7enkpii2mfqg0cflj70.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

### Langkah 3.4: Generate Encryption Key
Buat *Application Key* unik Laravel untuk enkripsi sesi dan token Sanctum:
```bash
php artisan key:generate
```

### Langkah 3.5: Buat Database & Jalankan Migrasi + Seeder
Pastikan service MySQL Anda sudah menyala (misal via XAMPP). Kemudian buat database baru bernama **`baktinusantaradb`**.

Jalankan perintah migrasi skema tabel beserta seluruh akun demo dan data master awal:
```bash
php artisan migrate --seed
```

> **Catatan:** Perintah `--seed` akan mengisi akun demo untuk 5 peran (*Super Admin, LPPM Universitas, Dosen DPL, Perangkat Desa, Mahasiswa*), katalog pos kebutuhan desa berbasis 17 SDGs, data master wilayah, dan riwayat KKN.

### Langkah 3.6: Buat Tautan Simbolik Storage Publik
Hubungkan folder penyimpanan publik agar foto progres, avatar, dan berkas proposal dapat diakses browser:
```bash
php artisan storage:link
```

### Langkah 3.7: Jalankan Server Backend
```bash
php artisan serve
```
*Layanan RESTful API Backend kini aktif di: **`http://127.0.0.1:8000`** (Base API: `http://127.0.0.1:8000/api`).*

---

## 💻 4. Panduan Instalasi Frontend (Next.js 14)

### Langkah 4.1: Buka Terminal Baru & Masuk ke Folder Frontend
```bash
cd Frontend/baktinusantara-frontend
```

### Langkah 4.2: Pasang Dependensi Node.js
```bash
npm install
```

### Langkah 4.3: Konfigurasi File Environment (`.env.local`)
Salin template konfigurasi frontend:
```bash
cp .env.example .env.local
```

Pastikan isi file `.env.local` memiliki variabel berikut:
```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google OAuth 2.0 Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=411606118566-q1pupeff65t4r7enkpii2mfqg0cflj70.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Langkah 4.4: Jalankan Server Development Frontend
```bash
npm run dev
```
*Buka peramban (browser) Anda dan akses: **`http://localhost:3000`**.*

---

## 🔑 5. Akun Uji Coba Dewan Juri (Demo Accounts)

Database Seeder telah menyediakan akun demo siap pakai untuk menguji seluruh modul hak akses berjenjang:

| Peran (Role) | Alamat Email | Kata Sandi | Dashboard Utama | Fitur Utama yang Dapat Diuji |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@baktinusantara.id` | `password` | `/admin/dashboard` | Verifikasi SK Desa & Kampus, suspend/activate entitas, kelola sebaran nasional. |
| **LPPM Kampus** | `unesa@unesa.ac.id` | `password` | `/kampus/dashboard` | Batch import dosen & mahasiswa, monitoring kelompok internal, evaluasi bimbingan. |
| **Dosen DPL** | `dosen.budi@unesa.ac.id` | `password` | `/dosen/dashboard` | Validasi kelayakan proposal (layak/revisi), review logbook mingguan mahasiswa. |
| **Perangkat Desa** | `desa.sukamaju@desa.id` | `password` | `/perangkat-desa/dashboard` | Terbitkan pos kebutuhan baru (SDGs), verifikasi proposal, pengesahan luaran & BAST. |
| **Mahasiswa KKN** | `mahasiswa.ahmad@mhs.unesa.ac.id` | `password` | `/mahasiswa/dashboard` | Buat kelompok, pilih pos via Haversine & AI matching, submit logbook, unggah luaran. |

> **Login Instan:** Pengguna juga dapat langsung menguji login SSO menggunakan tombol **"Masuk dengan Akun Google"** di halaman `/login`.

---

## 🧪 6. Verifikasi & Menjalankan Automated Tests

### 6.1 Uji Fitur & Keamanan Backend (PHPUnit)
Backend dilengkapi dengan **81 test suites otomatis (591 assertions)** yang menguji seluruh alur bisnis, perhitungan Haversine, smart matching AI, webhook WhatsApp, hingga integritas kriptografi e-sertifikat.

Buka folder backend dan jalankan:
```bash
cd Backend/baktinusantara-laravel
php artisan test
```

*Seluruh pengujian berjalan secara otomatis di atas database SQLite in-memory (`:memory:`) sehingga data pengujian di MySQL tidak akan tertimpa.*

### 6.2 Uji Build Produksi Frontend (Type-Checking & Bundle)
Untuk memastikan tidak ada kesalahan kompilasi TypeScript atau rute halaman pada Next.js:
```bash
cd Frontend/baktinusantara-frontend
npm run build
```
*Hasil yang diharapkan: **Compiled successfully (68/68 static & dynamic routes generated)**.*

---

## ❓ 7. Troubleshooting Masalah Umum

### 1. Port 8000 atau Port 3000 Sudah Terpakai (Port Conflict)
Jika port 8000 atau 3000 sedang digunakan oleh aplikasi lain di komputer Anda:
* **Backend**: Jalankan pada port kustom:
  ```bash
  php artisan serve --port=8080
  ```
  *(Jangan lupa sesuaikan `NEXT_PUBLIC_API_URL=http://localhost:8080` di `.env.local` frontend)*
* **Frontend**: Jalankan pada port kustom:
  ```bash
  npm run dev -- -p 3001
  ```

### 2. Error Koneksi Database `SQLSTATE[HY000] [1049] Unknown database 'baktinusantaradb'`
Pastikan Anda sudah membuat database kosong bernama `baktinusantaradb` di MySQL (bisa melalui phpMyAdmin atau MySQL CLI: `CREATE DATABASE baktinusantaradb;`), lalu ulangi `php artisan migrate --seed`.

### 3. File Upload / Gambar Tidak Muncul
Pastikan Anda telah menjalankan perintah tautan storage publik di backend:
```bash
php artisan storage:link
```

### 4. Google OAuth Menampilkan `Error 400: invalid_request`
Pastikan variabel `GOOGLE_CLIENT_ID` di file `.env` backend dan `NEXT_PUBLIC_GOOGLE_CLIENT_ID` di file `.env.local` frontend sudah terisi dengan benar, dan pastikan URL callback `http://localhost:8000/api/auth/google/callback` telah terdaftar di Authorized Redirect URIs Google Cloud Console.

---

*Selamat menguji dan mengeksplorasi platform BaktiNusantara!*
