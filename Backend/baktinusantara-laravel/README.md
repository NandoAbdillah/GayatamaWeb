# 🇮🇩 BaktiNusantara — Laravel Backend Service

Platform Kolaborasi Pengabdian Masyarakat Terpadu & Kuliah Kerja Nyata (KKN) Tematik Berbasis Potensi Desa dan Capaian 17 SDGs.

---

## 🚀 Fitur Utama Backend

1. **Role-Based Access Control (RBAC)**:
   - `Super Admin`: Verifikasi entitas nasional (SK Desa, KTM Mahasiswa, Perguruan Tinggi), katalog pos KKN nasional, statistik agregat 17 SDGs.
   - `LPPM Kampus`: Pengelolaan akun DPL kampus, monitoring bimbingan kelompok internal, evaluasi laporan DPL, metrik terisolasi per kampus.
   - `Dosen Pembimbing (DPL)`: Bimbingan kelompok mahasiswa, validasi kelayakan proposal program kerja (`layak`/`perlu_revisi`), review progres mingguan.
   - `Perangkat Desa`: Verifikasi aspirasi warga, publikasi pos kebutuhan KKN, persetujuan proposal masuk, validasi luaran akhir & BAST.
   - `Mahasiswa KKN`: Pembentukan kelompok KKN, penetapan DPL, pengajuan proposal berbasis jarak & matching score, logbook harian, upload izin ortu (>50km), submit luaran akhir.
   - `Warga Masyarakat`: Layanan aduan/aspirasi publik (Web & WhatsApp Bot), pelacakan tiket aduan.

2. **WhatsApp Gateway & Bot Dua Arah (Fonnte API)**:
   - Notifikasi otomatis realtime via Queue Job asinkron.
   - Webhook Bot cerdas dua arah untuk warga, mahasiswa, desa, dan dosen.

3. **AI Real-Time Context & Smart Matching Engine**:
   - Algoritma pencocokan jurusan & keahlian mahasiswa dengan pos desa riil (0–100%).
   - Generator draf proposal program kerja dan logbook mingguan standar LPPM.
   - Context injection untuk AI Copilot (Aira).

4. **Portofolio Publik & Auto-Generate Sertifikat**:
   - Generate portofolio publik slug terverifikasi kepala desa.
   - Auto penerbitan sertifikat digital KKN berformat PDF resmi.

---

## 📚 Dokumentasi API Lengkap

Panduan lengkap seluruh rute API, struktur data, format request/response, dan contoh kode integrasi:
- 📖 [**Master Backend API Guide (`docs/MASTER_BACKEND_API_GUIDE.md`)**](docs/MASTER_BACKEND_API_GUIDE.md)
- 🤖 [**AI Real-Time & Recommendation API Guide (`docs/AI_REALTIME_API_GUIDE.md`)**](docs/AI_REALTIME_API_GUIDE.md)

---

## 🛠️ Panduan Instalasi & Menjalankan Backend

### 1. Prasyarat Sistem
- PHP >= 8.2 (dengan ekstensi `pdo_mysql`, `curl`, `mbstring`, `fileinfo`, `gd`)
- Composer
- MySQL Server (XAMPP / Standalone)

### 2. Konfigurasi Lingkungan (`.env`)
```env
APP_NAME=BaktiNusantara
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=baktinusantaradb
DB_USERNAME=root
DB_PASSWORD=

FONNTE_TOKEN=TXNfJzsbf2oBVhYFZFbn
FONNTE_ENABLED=true
```

### 3. Migrasi Database & Seeder
```bash
composer install
php artisan migrate --seed
```

### 4. Menjalankan Server
```bash
php artisan serve
```
Backend API akan aktif di `http://127.0.0.1:8000/api`.

---

## 🧪 Menjalankan Automated Tests
```bash
php artisan test
```
*Catatan: Test suite dikonfigurasi menggunakan SQLite in-memory (`:memory:`) sehingga data di MySQL `baktinusantaradb` tetap aman dan utuh.*
