# 🇮🇩 BaktiNusantara
### *Platform Kolaborasi Terpadu Kuliah Kerja Nyata (KKN) & Pengabdian Masyarakat Berbasis SDGs dan Potensi Desa Presisi*

<div align="center">

![BaktiNusantara Showcase](https://raw.githubusercontent.com/NandoAbdillah/GayatamaWeb/main/Frontend/baktinusantara-frontend/public/images/hero-banner.png)

**Karya Inovasi Teknologi Perangkat Lunak yang Menjembatani Kolaborasi 5 Stakeholder KKN (Pemerintah Desa, LPPM Kampus, Dosen Pembimbing, Mahasiswa, dan Warga) Berbasis AI, Geospasial, dan Bot WhatsApp.**

[![SDGs Impact](https://img.shields.io/badge/SDGs-17_Pillars-E5243B?style=for-the-badge)](https://sdgs.un.org)
[![Framework](https://img.shields.io/badge/Stack-Next.js_14_%7C_Laravel_11-000000?style=for-the-badge)](https://laravel.com)
[![AI Engine](https://img.shields.io/badge/AI-Gemini_Smart_Matching-8E75B2?style=for-the-badge)](https://ai.google.dev)
[![GIS Engine](https://img.shields.io/badge/GIS-Leaflet_Haversine-4285F4?style=for-the-badge)](https://leafletjs.com)
[![WhatsApp Bot](https://img.shields.io/badge/Bot-Two--Way_WhatsApp-25D366?style=for-the-badge)](https://fonnte.com)

</div>

---

## 📌 Gambaran Umum & Latar Belakang Inovasi

Pelaksanaan Kuliah Kerja Nyata (KKN) dan program pengabdian masyarakat di Indonesia selama ini masih menghadapi berbagai kendala:
* **Ketidaksesuaian Kebutuhan Desa (*Skill Mismatch*)**: Program kerja mahasiswa sering tidak sesuai dengan masalah riil desa karena ketiadaan data kebutuhan yang terstruktur.
* **Administrasi Terpisah & Manual**: Perizinan desa, penugasan dosen DPL, logbook harian, hingga Berita Acara Serah Terima (BAST) masih dilakukan manual tanpa integrasi sistem.
* **Minimnya Partisipasi Warga**: Warga desa sulit menyampaikan aspirasi/aduan langsung ke mahasiswa atau perangkat desa.
* **Ketiadaan Mitigasi Jarak & Keselamatan**: Lokasi KKN jarak jauh (>1.000 km) tidak terpantau secara geospasial dan sering luput dari verifikasi izin orang tua/wali.

**BaktiNusantara** dibangun sebagai solusi satu pintu (*all-in-one platform*) yang mengintegrasikan seluruh tahapan KKN dari hulu ke hilir secara transparan, terukur, dan berdampak langsung pada capaian 17 Sustainable Development Goals (SDGs).

---

## 🌟 Fitur Unggulan & Inovasi Aplikasi

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              5 PILAR INOVASI BAKTINUSANTARA                            │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ 1. 🤖 AI SMART MATCHING  │ 2. 🗺️ GIS & HAVERSINE    │ 3. 📱 BOT WHATSAPP DUA ARAH      │
│ Rekomendasi pos desa     │ Peta sebaran KKN         │ Warga bisa kirim aspirasi & cek  │
│ sesuai jurusan mhs (0-100%) & Safety gate (>1.000 km) status via chat WhatsApp instan. │
├──────────────────────────┴──────────────────────────┴──────────────────────────────────┤
│ 4. 🔐 MULTI-ROLE GOVERNANCE                         │ 5. 📜 E-SERTIFIKAT & QR CODE     │
│ Hak akses 5 peran (Admin, LPPM, Dosen, Desa, Mhs). │ QR Code ISO 18004 anti-pemalsuan.│
└─────────────────────────────────────────────────────┴──────────────────────────────────┘
```

### 1. 🤖 Rekomendasi Pos KKN Berbasis AI (*Smart Matching Engine*)
* Menghitung persentase kecocokan (*matching score*) antara keahlian/jurusan mahasiswa dengan deskripsi pos kebutuhan desa.
* Menyediakan **AI Copilot (Aira)** untuk membantu penyusunan draf proposal program kerja dan logbook mingguan secara otomatis.

### 2. 🗺️ Peta Interaktif Sebaran KKN & Kalkulasi Jarak (*GIS Engine*)
* Visualisasi peta digital interaktif berbasis Leaflet yang menampilkan sebaran pos kebutuhan desa di seluruh Indonesia.
* Algoritma jarak **Haversine Formula** yang secara otomatis mendeteksi jika lokasi KKN melebihi 1.000 km dan mewajibkan unggah *Surat Izin Orang Tua*.

### 3. 📱 Integrasi WhatsApp Bot Dua Arah untuk Warga (*Fonnte Gateway*)
* Warga masyarakat dapat mengirimkan aduan/aspirasi desa langsung melalui WhatsApp tanpa perlu membuka website.
* Sistem bot membalas dengan nomor tiket aduan yang dapat dilacak status penanganannya secara realtime.

### 4. 🔐 Tata Kelola Hak Akses Berjenjang & Google OAuth 2.0
* **Super Admin**: Verifikasi legalitas SK Kepala Desa & Akun Kampus.
* **LPPM Kampus**: Pendaftaran dan monitoring dosen DPL & mahasiswa internal.
* **Dosen Pembimbing (DPL)**: Validasi kelayakan proposal & evaluasi berkala.
* **Perangkat Desa**: Publikasi pos kebutuhan, approval proposal, & validasi luaran/BAST.
* **Mahasiswa**: Pembentukan kelompok, pengajuan proposal, logbook harian, & submit luaran.

### 5. 📜 E-Sertifikat Digital & Verifikasi QR Code Resmi
* Penerbitan e-sertifikat PDF otomatis untuk seluruh anggota kelompok setelah luaran akhir disetujui Kepala Desa.
* Dilengkapi kode verifikasi unik dan QR Code berstandar ISO/IEC 18004 yang dapat dipindai oleh publik.

---

## 🔄 Alur Kerja Sistem (System Workflow)

```
[PERANGKAT DESA]                                   [MAHASISWA KKN]
  Mempublikasikan Pos Kebutuhan KKN                  Mencari Pos KKN (Filter AI & Jarak)
        │                                                  │
        │                                                  ▼
        │                                            Membentuk Kelompok & Pilih DPL
        │                                                  │
        │                                                  ▼
        │                                            Mengajukan Proposal Program Kerja
        │                                                  │
        ▼                                                  ▼
  Menerima & Menyetujui Proposal ◄────────────── [DOSEN DPL] Validasi Kelayakan Proposal
        │
        ▼
  Pelaksanaan KKN: Mahasiswa Mengisi Logbook Mingguan (Ditinjau Dosen & Desa)
        │
        ▼
  Penyelesaian KKN: Mahasiswa Mengunggah Luaran Akhir & Dokumen BAST
        │
        ▼
  [KEPALA DESA] Memverifikasi Luaran & Menyetujui BAST
        │
        ▼
  Sistem Menerbitkan Portofolio Publik Desa & E-Sertifikat Digital Mahasiswa (QR Code)
```

---

## 🎯 Relevansi dengan 17 Sustainable Development Goals (SDGs)

Setiap pos kebutuhan KKN yang diunggah oleh desa dikategorikan ke dalam 17 pilar SDGs:
* **SDG 1 (Tanpa Kemiskinan)**: Program pendampingan dan digitalisasi UMKM desa.
* **SDG 3 (Kehidupan Sehat)**: Program posyandu, pencegahan stunting, dan sanitasi lingkungan.
* **SDG 4 (Pendidikan Berkualitas)**: Bimbingan belajar desa, pojok literasi, dan pelatihan digital.
* **SDG 8 (Pekerjaan Layak & Pertumbuhan Ekonomi)**: Revitalisasi dan manajemen BUMDes.
* **SDG 11 (Kota & Komunitas Berkelanjutan)**: Tata ruang desa dan pemetaan potensi wilayah.

---

## 💻 Panduan Menjalankan Aplikasi (Quick Start)

### 1. Menjalankan Backend (Laravel)
```bash
cd Backend/baktinusantara-laravel
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```
*Backend API aktif di:* `http://127.0.0.1:8000`

### 2. Menjalankan Frontend (Next.js)
```bash
cd Frontend/baktinusantara-frontend
npm install
cp .env.example .env.local
npm run dev
```
*Frontend Web aktif di:* `http://localhost:3000`

---

## 🔑 Akun Demo Pengujian untuk Juri

Gunakan akun-akun berikut untuk menguji fitur tiap hak akses (*Password untuk semua akun: `password`*):

| Peran (Role) | Email | Password | Fitur Utama yang Dapat Diuji |
| :--- | :--- | :---: | :--- |
| **🛡️ Super Admin** | `admin@baktinusantara.id` | `password` | Verifikasi SK Desa & akun kampus, freeze/suspend entitas. |
| **🏛️ LPPM Kampus** | `unesa@unesa.ac.id` | `password` | Tambah dosen DPL, kelola mahasiswa, pantau metrik kampus. |
| **👨‍🏫 Dosen DPL** | `dosen.budi@unesa.ac.id` | `password` | Bimbingan kelompok, validasi kelayakan proposal, review logbook. |
| **🏡 Perangkat Desa** | `desa.sukamaju@desa.id` | `password` | Tambah pos kebutuhan, review proposal, verifikasi luaran & BAST. |
| **🎓 Mahasiswa (Ketua)** | `ahmad.mhs@unesa.ac.id` | `password` | Ajukan proposal, unggah izin ortu, catat logbook mingguan. |
| **🎓 Mahasiswa (Anggota)** | `siti.mhs@unesa.ac.id` | `password` | Cek kelompok bimbingan, pantau progres program kerja. |

---

## 📚 Tautan Dokumentasi Terkait

* 📖 [**Dokumentasi Integrasi API Frontend**](Backend/baktinusantara-laravel/FRONTEND_INTEGRATION_GUIDE.md)
* 📖 [**Panduan WhatsApp Bot & Webhook**](Backend/baktinusantara-laravel/WHATSAPP_API_GUIDE.md)
* 🛡️ [**Laporan Audit Keamanan Sistem**](AUDIT-REPORT.md)

---

<div align="center">

**🇮🇩 BaktiNusantara — Mengabdi untuk Negeri, Membangun Desa Presisi.**  
*Karya Inovasi Teknologi Terpadu untuk Pendidikan Tinggi dan Desa Berkelanjutan di Indonesia.*

</div>