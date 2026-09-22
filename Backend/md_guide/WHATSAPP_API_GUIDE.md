# 📱 BaktiNusantara — Panduan Integrasi WhatsApp Notification Gateway (Fonnte API)

Panduan lengkap untuk tim **Frontend** dan **Backend** mengenai cara kerja, konfigurasi, dan pengujian notifikasi WhatsApp otomatis di platform **BaktiNusantara**.

---

## 📌 1. Cara Kerja Sistem Notifikasi WhatsApp

Sistem WhatsApp di BaktiNusantara bekerja secara **Direct & Asynchronous**:
1. Pengguna (Warga / Mahasiswa / Desa) melakukan aksi di antarmuka web (misal: kirim aspirasi, ajukan proposal, approve proposal).
2. Frontend memanggil REST API backend seperti biasa (`POST /api/aspirasi`, `PATCH /api/desa/proposal/{id}/decide`, dll).
3. Backend Laravel menyimpan data ke MySQL, lalu secara otomatis mengirimkan pesan WhatsApp ke nomor tujuan melalui **Fonnte Gateway**.
4. Pesan langsung berdering di aplikasi WhatsApp asli di HP penerima.
5. **Frontend Developer tidak perlu membuat UI chat WhatsApp**, cukup sediakan input form nomor telepon yang valid.

---

## ⚙️ 2. Konfigurasi Environment (`.env`)

Konfigurasi ini berada di file `.env` pada folder **Backend** (`Backend/baktinusantara-laravel/.env`):

```env
# ==========================================
# WhatsApp Gateway Configuration (Fonnte)
# ==========================================
FONNTE_TOKEN=your_fonnte_token_here
FONNTE_URL=https://api.fonnte.com/send
WA_ENABLED=true
```

### 💡 Penjelasan Mode Pengoperasian:
| Variabel | Nilai | Keterangan |
|---|---|---|
| `WA_ENABLED` | `true` | **Live Mode**: Pesan dikirim sungguhan ke WhatsApp penerima via Fonnte API. |
| `WA_ENABLED` | `false` | **Mock Mode**: Pesan tidak dikirim ke internet (hemat kuota), melainkan dicatat ke log backend (`storage/logs/laravel.log`). Sangat cocok jika sedang offline atau tanpa device Fonnte. |
| `FONNTE_TOKEN` | Token dari Fonnte | Token unik dari menu *Device* di dashboard Fonnte. Jika kosong, sistem otomatis masuk ke Mock Mode tanpa menimbulkan error. |

---

## 🧪 3. Cara Pengujian untuk Tim Frontend

Teman Frontend **TIDAK PERLU login ke Fonnte**. Cukup ikuti langkah berikut:

### Skenario 1: Uji Coba Form Aspirasi Warga
1. Buka halaman form aspirasi warga di browser: `http://localhost:3000/aspirasi`.
2. Pilih desa tujuan.
3. Masukkan nama dan **Nomor WhatsApp Asli Anda** (format bebas: `0812...`, `62812...`, atau `+62812...`).
4. Tuliskan deskripsi aspirasi dan klik **Kirim Aspirasi**.
5. Cek HP Anda! Pesan WhatsApp berisi **Nomor Tiket (#ID)** akan langsung masuk.

### Skenario 2: Uji Coba Proposal KKN (Desa Approve Proposal)
1. Login sebagai Mahasiswa (Ketua Tim) dan ajukan proposal ke salah satu Pos Kebutuhan.
2. Login sebagai Perangkat Desa (`desa.sukamaju@desa.id` / `password`).
3. Buka menu Proposal Masuk, lalu klik tombol **Approve**.
4. Notifikasi WhatsApp pengumuman persetujuan proposal akan langsung masuk ke nomor WhatsApp Ketua Tim Mahasiswa.

---

## 💻 4. Perintah Uji Coba Cepat via CLI (Backend)

Untuk memastikan nomor WhatsApp terhubung dengan gateway Fonnte tanpa harus membuka web:

```powershell
# Masuk ke folder backend
cd c:\Projects\GayatamaWeb\Backend\baktinusantara-laravel

# Jalankan perintah tes kirim WA ke nomor target
php artisan wa:test 081234567890
```

---

## 📋 5. Daftar Titik Pemicu (Trigger Events) & Format Pesan

| No | Modul | Pemicu (Trigger) | Penerima | Isi Ringkasan Pesan |
|---|---|---|---|---|
| 1 | **Aspirasi Warga** | Warga submit aspirasi di form `/aspirasi` | Warga (`pelapor_wa`) | Konfirmasi aspirasi diterima + Nomor Tiket (#ID Tiket) untuk pelacakan. |
| 2 | **Aspirasi Warga** | Desa menyetujui / menolak aspirasi | Warga (`pelapor_wa`) | Pemberitahuan status aspirasi (diangkat jadi Pos Kebutuhan KKN atau ditolak beserta alasan). |
| 3 | **Proposal KKN** | Mahasiswa mengajukan proposal KKN | Perangkat Desa (`phone_wa`) | Notifikasi proposal baru masuk dari kelompok X + skor kecocokan (*matching score*) & estimasi jarak. |
| 4 | **Proposal KKN** | Desa menyetujui / menolak proposal | Ketua Mahasiswa (`phone_wa`) | Pengumuman resmi: Proposal disetujui/ditolak beserta instruksi pelaksanaan proker. |
| 5 | **Luaran Akhir** | Desa mengesahkan luaran akhir | Ketua Mahasiswa (`phone_wa`) | Ucapan selamat luaran terverifikasi (*Verified by Village*) + link publik **E-Portofolio** dan sertifikat. |

---

## 🔧 6. Troubleshooting & FAQ

#### Q: Bagaimana format nomor HP yang didukung?
> **A:** Backend dilengkapi fungsi normalisasi otomatis. Semua format berikut valid dan otomatis diubah menjadi `628xxxxxxxxxx`:
> - `081234567890`
> - `+6281234567890`
> - `62812-3456-7890`
> - `0812 3456 7890`

#### Q: Apa yang terjadi jika HP bot Fonnte kehabisan baterai / disconnect?
> **A:** Transaksi di website **TIDAK AKAN ERROR**. Backend menggunakan *graceful fallback* & *queue job*, sehingga data formulir tetap tersimpan di database dan pesan error hanya dicatat di log server.

#### Q: Bagaimana jika teman frontend tidak punya koneksi internet untuk Fonnte?
> **A:** Ubah baris `WA_ENABLED=false` di `.env`. Aplikasi akan berjalan 100% normal dengan mode simulasi (mocking).