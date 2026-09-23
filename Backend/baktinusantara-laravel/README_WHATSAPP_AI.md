# 📖 Panduan Lengkap & Troubleshooting: Bot WhatsApp AIIRA (Fonnte + Gemini AI)

Dokumentasi ini dibuat sebagai referensi teknis dan panduan pemecahan masalah (*troubleshooting*) jika suatu saat integrasi WhatsApp Bot AIIRA mengalami kendala atau tidak merespons.

---

## 📌 1. Arsitektur & Spesifikasi Sistem

```
[ Pengguna WhatsApp ] 
        │ (Kirim chat ke 085932883277)
        ▼
[ Gateway Fonnte (api.fonnte.com) ]
        │ (POST Webhook)
        ▼
[ Public Tunnel: https://baktinusantara-wa.loca.lt ]
        │ (Forward ke port 8000)
        ▼
[ Laravel Controller: WhatsAppWebhookController ]
        │
        ├─► [ WhatsAppBotService ] 
        │         │
        │         ├─► [ AiService (Conversational Engine) ]
        │         │         ├─► Gemini Multi-Model & Key Rotation
        │         │         ├─► MySQL Database Context (ProfilDesa, PosKebutuhan, Aspirasi)
        │         │         └─► Local Resilient Knowledge Engine (Fallback 100% Uptime)
        │         │
        │         └─► [ Auto-Ticketing Database Insertion ]
        ▼
[ Balasan Otomatis dikirim balik via Fonnte API ] ──► [ Pengguna Menerima Balasan ]
```

### Data Kredensial & Konfigurasi
* **Nomor WhatsApp Bot**: `085932883277`
* **Token Fonnte**: `BTcP5yXcjC42y9BiXXkE`
* **URL Fonnte API**: `https://api.fonnte.com/send`
* **Subdomain Tunnel Tetap**: `baktinusantara-wa`
* **URL Webhook Publik**: `https://baktinusantara-wa.loca.lt/api/webhook/whatsapp`

---

## 🚀 2. Cara Menjalankan Layanan (Daily Startup)

Untuk menjalankan seluruh ekosistem bot WhatsApp, pastikan 3 komponen berikut berjalan:

### 1. Database MySQL & Backend Laravel
Pastikan MySQL 8.0 aktif (port 3306) dan jalankan Laravel:
```powershell
cd c:\Coding\GayatamaWeb\Backend\baktinusantara-laravel
php artisan serve
```
*(Server berjalan di `http://127.0.0.1:8000`)*

### 2. Tunnel Publik (Localtunnel)
Buka terminal baru dan jalankan:
```powershell
npx localtunnel --port 8000 --subdomain baktinusantara-wa
```
Pastikan output di terminal menampilkan:
```
your url is: https://baktinusantara-wa.loca.lt
```

### 3. Pengaturan Wajib di Dashboard Fonnte
1. Buka [https://fonnte.com](https://fonnte.com) dan login ke akun Anda.
2. Masuk ke menu **Device** &rarr; klik **Edit** pada device `085932883277`.
3. Pada kolom **Webhook URL**, masukkan:
   ```
   https://baktinusantara-wa.loca.lt/api/webhook/whatsapp
   ```
4. ⚠️ **SANGAT PENTING**: Pastikan opsi **Auto Read** dalam posisi **ON (Aktif)**!
   *(Jika Auto Read mati, Fonnte tidak akan mengirimkan event pesan masuk ke Webhook!)*
5. Klik **Save**.

---

## 🤖 3. Mekanisme AI: Rotasi Model & Rotasi API Key

### Daftar Rotasi Model (Prioritas Berurutan)
Sistem di `AiService.php` dan `Frontend/baktinusantara-frontend/lib/gemini-models.ts` telah dikonfigurasi untuk memutar model secara berurutan:
1. `gemini-3.5-flash` *(Utama - Cepat & Cerdas)*
2. `gemini-3-flash`
3. `gemini-2.5-flash`
4. `gemini-3.1-flash-lite`
5. `gemini-2.5-flash-lite`
6. `gemma-4-26b`
7. `gemma-4-31b`
8. `gemini-1.5-flash` *(Cadangan tangguh)*

### Rotasi API Key (Round-Robin)
Konfigurasi file `.env` di Backend:
```env
GEMINI_API_KEYS=UserAccount|AQ.Ab8RN6LmNwGwmlb8yzWrALP3O5SR1QxeJq7C2uXZYZVyb6Bllw|true,Esper|AQ.Ab8RN6J8hmVyLXVofC8aNRnuZw36MQ8CL-FtUwpoOCn6-nYD-A|true,Stud|AQ.Ab8RN6KJJPiFoH2UmM5IuVulGip1wbDpeFblyM_Erlhnm9KmKw|true,Tom|AQ.Ab8RN6JX-D1ROgHsEf_lMwuSPqiHc-EN004aSDGs6-l_3Oyqow|true,Village|AQ.Ab8RN6KurK4cxWhQFg50LX5UQm-4OIW58B89NmHZLBAjgmfn-g|true,Ara|AQ.Ab8RN6ItRuE2JfcG5sNanrt-5P4Pth5mIi8ykQj9VPtbnpP4mQ|true
GEMINI_MODEL=gemini-3.5-flash
```
* **Fleksibilitas Parser**: Parser otomatis membersihkan awalan `UserAccount|` dan hanya mengambil string inti kunci (`AQ.Ab8RN6...`).
* **Round-Robin**: Setiap pemanggilan memutar counter cache `gemini_key_rotation_idx` sehingga pemanggilan kunci 1, 2, 3, 4, 5, 6 terdistribusi merata.

---

## 💬 4. Fitur Percakapan & Integrasi Database Realtime

AIIRA mengenali beragam intensi percakapan tanpa terjebak *looping*:

| Intensi Chat | Contoh Pesan Pengguna | Respon AIIRA |
| :--- | :--- | :--- |
| **Sapaan (Greeting)** | *"halo"*, *"hai"*, *"assalamualaikum"*, *"selamat pagi"* | Menyapa ramah dan menampilkan ringkasan opsi bantuan. |
| **Tanya Kemampuan** | *"apa yang bisa anda lakukan"*, *"kamu bisa apa aja sih"* | Menjelaskan 4 kemampuan utama AIIRA dan statistik desa aktif dari database. |
| **Penelusuran Desa** | *"ada desa apa saja?"*, *"daftar desa mitra"* | Mengambil data riil dari tabel `profil_desa` (Sukamaju, Berkah Makmur, Cempaka Putih, dsb.). |
| **Penelusuran KKN** | *"program kkn apa saja yang ada?"*, *"pos kebutuhan apa"* | Mengambil data riil dari tabel `pos_kebutuhan` (kategori UMKM, Stunting, Sampah, dsb.). |
| **Cek Status Tiket** | *"status"*, *"cek tiket #12"* | Mengambil data tiket aduan milik nomor WA pengirim dari tabel `aspirasi`. |
| **Pelaporan Aduan** | *"saya warga Sukamaju mau lapor lampu jalan mati"* | Mengekstrak entitas, menyusun draf aduan, dan meminta konfirmasi. |
| **Konfirmasi Tiket** | *"ya"*, *"kirim"*, *"setuju"* | Menyimpan resmi ke tabel `aspirasi` dan menerbitkan nomor tiket aduan. |
| **Batal Sesi** | *"batal"*, *"cancel"*, *"reset"* | Menghapus cache draf sesi dan mengembalikan status percakapan ke normal. |

---

## 🛠️ 5. Panduan Troubleshooting (Jika Bot Tidak Merespons)

Jika suatu saat bot tidak membalas chat di WhatsApp, ikuti langkah-langkah diagnosis di bawah ini:

### 🔍 Kasus A: "Pesan terkirim (centang 2), tapi bot tidak merespons sama sekali"

1. **Periksa Tunnel Publik**:
   Buka file log tunnel atau jalankan ulang tunnel:
   ```powershell
   npx localtunnel --port 8000 --subdomain baktinusantara-wa
   ```
   *Jika localtunnel sempat reconnect otomatis, terkadang server memberikan domain acak (misal `brown-moose-38.loca.lt`). Hentikan proses tunnel (Ctrl+C) dan jalankan kembali agar mendapatkan `baktinusantara-wa.loca.lt`.*

2. **Periksa Dashboard Fonnte**:
   * Masuk ke [Fonnte Device](https://fonnte.com).
   * Pastikan device berstatus **Connected** (hijau).
   * Pastikan **Auto Read** aktif (**ON**).
   * Pastikan **Webhook URL** mengarah ke: `https://baktinusantara-wa.loca.lt/api/webhook/whatsapp`.

3. **Periksa Log Laravel**:
   Buka file `Backend/baktinusantara-laravel/storage/logs/laravel.log`:
   * Cari baris: `local.INFO: WhatsApp Webhook received`.
   * Jika baris ini ada, berarti webhook berhasil masuk ke Laravel.
   * Cari baris berikutnya: `local.INFO: WhatsApp sent to ... {"status":200}`.
   * Jika status 200, berarti pesan telah diteruskan ke Fonnte untuk dikirim ke HP pengguna.

4. **Periksa Kuota Fonnte**:
   Pada respon Fonnte di `laravel.log`, periksa bagian `"remaining": ...`. Jika kuota habis (0), pesan balasan tidak dapat terkirim oleh Fonnte.

---

### 🔍 Kasus B: "Cara Menguji Koneksi Fonnte Secara Manual"

Gunakan perintah Artisan bawaan untuk menguji apakah Fonnte bisa mengirim pesan keluar ke nomor Anda:
```powershell
cd c:\Coding\GayatamaWeb\Backend\baktinusantara-laravel
php artisan wa:test 082125469584
```
*Jika pesan uji coba masuk ke HP Anda, berarti akun dan token Fonnte aktif 100%.*

---

### 🔍 Kasus C: "Cara Menguji Webhook & AIIRA Tanpa Perlu Buka WhatsApp"

Anda dapat mensimulasikan pesan masuk kapan saja langsung dari terminal menggunakan script pengujian:
```powershell
cd c:\Coding\GayatamaWeb\Backend\baktinusantara-laravel
php -r "
require 'vendor/autoload.php';
\$app = require_once 'bootstrap/app.php';
\$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
\$bot = app(App\Services\WhatsAppBotService::class);
echo \$bot->handleIncoming('082125469584', 'halo', 'Nando') . PHP_EOL;
"
```

---

## 📁 6. Lokasi File Penting Terkait

| Komponen | Path File |
| :--- | :--- |
| **Logika AI & Intent Router** | `Backend/baktinusantara-laravel/app/Services/AiService.php` |
| **Bot Handler Per Role** | `Backend/baktinusantara-laravel/app/Services/WhatsAppBotService.php` |
| **API Pengiriman Fonnte** | `Backend/baktinusantara-laravel/app/Services/WhatsAppService.php` |
| **Controller Webhook Masuk** | `Backend/baktinusantara-laravel/app/Http/Controllers/WhatsAppWebhookController.php` |
| **Environment Variables** | `Backend/baktinusantara-laravel/.env` |
| **Log Error & Aktivitas** | `Backend/baktinusantara-laravel/storage/logs/laravel.log` |
| **Frontend AI Copilot (Aira)** | `Frontend/baktinusantara-frontend/components/ai/BaktiAiCopilot.tsx` |
| **Frontend Rotasi Model** | `Frontend/baktinusantara-frontend/lib/gemini-models.ts` |
| **Frontend Rotasi Key** | `Frontend/baktinusantara-frontend/lib/gemini-keys.ts` |

---

## 🌐 7. Panduan Deployment ke Server Produksi (Production Deployment)

Saat aplikasi dideploy ke server produksi (VPS Ubuntu/Debian, Nginx, Apache, Cloud, dll.), cara kerja bot WhatsApp menjadi **jauh lebih sederhana, cepat, dan stabil** dibandingkan di komputer lokal.

### 🌟 Keuntungan di Server Produksi:
* **Tidak Perlu Tunneling Lagi**: Anda **TIDAK PERLU** lagi menjalankan `localtunnel` / `ngrok`! Server produksi sudah memiliki IP publik dan domain sendiri.
* **Online 24 Jam Nonstop**: Layanan berjalan sebagai daemon/service sistem operasi (`systemd` / `supervisor`).
* **Koneksi Jauh Lebih Stabil**: Tidak ada risiko URL berganti acak.

---

### 📋 Langkah-Langkah Tambahan Saat Deploy:

#### Langkah 1: Siapkan Domain & Sertifikat SSL (HTTPS Wajib)
Fonnte mewajibkan webhook menggunakan protokol **HTTPS** yang valid.
* Arahkan subdomain (contoh: `api.baktinusantara.id` atau `baktinusantara.id`) ke IP server VPS Anda.
* Pasang sertifikat SSL gratis Let's Encrypt menggunakan Certbot:
  ```bash
  sudo certbot --nginx -d api.baktinusantara.id
  ```

#### Langkah 2: Update Webhook URL di Dashboard Fonnte
1. Buka [https://fonnte.com](https://fonnte.com) &rarr; menu **Device** &rarr; **Edit**.
2. Ubah kolom **Webhook URL** dari URL tunnel lama menjadi URL domain produksi Anda:
   ```
   https://api.baktinusantara.id/api/webhook/whatsapp
   ```
   *(atau `https://namadomainanda.com/api/webhook/whatsapp`)*
3. Pastikan **Auto Read** tetap **ON**.
4. Klik **Save**.

#### Langkah 3: Konfigurasi File `.env` di Server Produksi
Pastikan variabel lingkungan berikut disalin ke `.env` server produksi:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.baktinusantara.id

# Fonnte WhatsApp Gateway
FONNTE_TOKEN=BTcP5yXcjC42y9BiXXkE
FONNTE_URL=https://api.fonnte.com/send
FONNTE_BOT_NUMBER=085932883277
WA_ENABLED=true

# Keamanan Tambahan Webhook (Opsional tapi Direkomendasikan)
# Masukkan kata sandi rahasia di sini dan di header Fonnte jika ingin verifikasi signature
FONNTE_WEBHOOK_SECRET=

# Gemini AI Multi-Model & Multi-Key Pool
GEMINI_API_KEYS=UserAccount|AQ.Ab8RN6LmNwGwmlb8yzWrALP3O5SR1QxeJq7C2uXZYZVyb6Bllw|true,Esper|AQ.Ab8RN6J8hmVyLXVofC8aNRnuZw36MQ8CL-FtUwpoOCn6-nYD-A|true,Stud|AQ.Ab8RN6KJJPiFoH2UmM5IuVulGip1wbDpeFblyM_Erlhnm9KmKw|true,Tom|AQ.Ab8RN6JX-D1ROgHsEf_lMwuSPqiHc-EN004aSDGs6-l_3Oyqow|true,Village|AQ.Ab8RN6KurK4cxWhQFg50LX5UQm-4OIW58B89NmHZLBAjgmfn-g|true,Ara|AQ.Ab8RN6ItRuE2JfcG5sNanrt-5P4Pth5mIi8ykQj9VPtbnpP4mQ|true
GEMINI_MODEL=gemini-3.5-flash
```
Setelah mengubah `.env`, jalankan optimasi cache:
```bash
php artisan config:cache
php artisan route:cache
```

#### Langkah 4: Pastikan Nginx / Web Server Meneruskan Header Webhook
Contoh konfigurasi Nginx (`/etc/nginx/sites-available/baktinusantara`):
```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ \.php$ {
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    include fastcgi_params;
    fastcgi_read_timeout 60;
}
```

#### Langkah 5: Menjalankan Background Worker / Scheduler (Supervisor)
Jika menggunakan antrean asynchronous (*queue*) untuk performa chat tinggi, gunakan Supervisor:
```ini
[program:baktinusantara-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/baktinusantara/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/baktinusantara/storage/logs/worker.log
```

---
*Dokumentasi ini disusun untuk menjaga keandalan dan memudahkan pemeliharaan sistem BaktiNusantara.* 🇮🇩
