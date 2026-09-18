# WEBSITE AUDIT REPORT

**Proyek:** GayatamaWeb (BaktiNusantara)  
**Kategori:** Integrated Community Service & Village Collaboration Platform  
**Tech Stack:** Next.js 14 (App Router, TypeScript, Tailwind CSS, Framer Motion) & Laravel 12 (PHP 8.2, Sanctum, Eloquent, SQLite/MySQL)  
**Peran Auditor:** Senior Full-Stack Engineer, QA Engineer, UX/UI Auditor, Accessibility Specialist, Performance Engineer, Security Reviewer  
**Metodologi Audit:** Static Code Analysis, Architecture & Dependency Inspection, Security Review, UX/WCAG Evaluation, Data Flow & State Verification  
**Status Eksekusi Kode:** *Strict Audit Mode — Tidak ada kode, konfigurasi, maupun database yang diubah.*

---

## 1. Executive Summary

Platform **GayatamaWeb (BaktiNusantara)** dirancang sebagai ekosistem digital terpadu yang menghubungkan mahasiswa, perguruan tinggi (LPPM), dosen pembimbing lapangan (DPL), dan pemerintah desa dalam pelaksanaan Kuliah Kerja Nyata (KKN) Tematik berbasis indikator SDGs. Secara konseptual dan fitur, platform ini memiliki cakupan yang komprehensif, mulai dari pemetaan spasial wilayah, matchmaking keahlian berbasis SDGs, pelaporan logbook mingguan ber-GPS, hingga verifikasi luaran terbitan desa dan e-sertifikat ber-hash digital.

Namun, hasil audit menyeluruh menemukan **kesenjangan kritis (critical architectural & functional gaps)** antara antarmuka (frontend) dan server (backend). Terdapat **masalah keamanan tingkat tinggi (API key bocor, endpoint unauthenticated, IDOR, dan client-side privilege spoofing)**, **fitur mockup/dummy yang belum terintegrasi ke backend riil**, **monolithic client components berukuran masif (80–100 KB per file)**, serta **sejumlah dead routes yang menghasilkan HTTP 404**.

---

## 2. Audit Coverage

| Area / Modul | Cakupan Audit | Status Verifikasi | Catatan |
|---|---|---|---|
| **Struktur & Arsitektur** | Next.js App Router, Laravel 12 API, State Context | **Terverifikasi** | Static analysis seluruh controller, service, middleware, route. |
| **Autentikasi & Otorisasi** | Sanctum Token, Next.js Middleware, OTP Flow | **Terverifikasi** | Ditemukan bypass client-side dan OTP mock. |
| **Fitur Mahasiswa** | Proposal, Logbook, Kelompok, Izin Jarak Jauh | **Terverifikasi** | Sebagian besar masih hardcoded `proposal_id: 1` & mock data. |
| **Fitur Perangkat Desa** | Pos Kebutuhan, Validasi Proposal, Luaran, BAST | **Terverifikasi** | Ditemukan loop render mapping mock data alih-alih state riil. |
| **Fitur Dosen (DPL)** | Review Kelayakan Proposal, Logbook, Penilaian | **Terverifikasi** | Halaman dashboard masih 100% data statis. |
| **Fitur Kampus (LPPM)** | Roster Dosen, Monitoring Wilayah, SKS | **Terverifikasi** | Duplikasi kode hampir 90% dengan admin dashboard. |
| **Fitur Super Admin** | Verifikasi Entitas, Audit Trail, Metrik | **Terverifikasi** | Tombol verifikasi menghasilkan false-positive success toast. |
| **AI Assistant (Aira)** | Function Calling, Scope Restriction, Fallback | **Terverifikasi** | Prompt guardrail bagus, tetapi tool frontend mengueri mock data. |
| **Accessibility Widget** | Contrast, TTS Piper, Web Speech API | **Terverifikasi** | Script integrasi berjalan, namun tabrakan posisi tombol melayang di mobile. |
| **Geospatial & Maps** | Leaflet Map, Filter Wilayah, Medsos Feed | **Terverifikasi** | Komponen monolitik 1.900+ baris; payload SVG > 1MB. |
| **E-Sertifikat & PDF** | Hash SHA-256, QR Code, PDF Generator | **Terverifikasi** | Algoritma QR code menghasilkan pola SVG acak (tidak scannable). |
| **Web Push & PWA** | Service Worker, VAPID, Push Store | **Terverifikasi** | Push store berbasis RAM server; private key terekspos default. |
| **Runtime Cross-Browser** | Safari / WebKit Mobile | *Tidak Terverifikasi* | Hanya dianalisis via static web standard & modern CSS checks. |

---

## 3. Critical Findings

### [SEC-01] Kebocoran Kunci Rahasia API Gemini di Source Code
- **ID:** `SEC-01`
- **Category:** `Security - Hardcoded Credentials`
- **Location:** `Frontend/baktinusantara-frontend/lib/gemini-keys.ts:L10`, `Frontend/baktinusantara-frontend/.env.local:L10-L11`
- **Finding:** Terdapat API Key Google Gemini permanen yang di-hardcode langsung ke dalam kode (`DEFAULT_PRIMARY_KEY = 'AQ.Ab8RN...'`) dan tercatat pada `.env.local` yang masuk ke repositori.
- **Evidence:** 
  ```typescript
  const DEFAULT_PRIMARY_KEY = 'AQ.Ab8RN6L_C1aNCzUKJYhyOvoEtbzjY8AE1dz-7IBZoge4f2b5kg';
  ```
- **Impact:** Kuota API Gemini dapat dicuri dan disalahgunakan oleh pihak ketiga untuk eksploitasi AI gratis atau DDoS kuota.
- **Severity:** `CRITICAL`
- **Recommendation:** Revoke API key tersebut segera dari Google AI Studio Console. Pindahkan kunci ke environment variable server-only (`GEMINI_API_KEY`) dan hapus fallback hardcoded string dari source code.

---

### [SEC-02] Webhook WhatsApp Unauthenticated (Arbitrary Message Relay Risk)
- **ID:** `SEC-02`
- **Category:** `Security - Broken Authentication / Resource Abuse`
- **Location:** `Backend/baktinusantara-laravel/routes/api.php:L52`, `Backend/baktinusantara-laravel/app/Http/Controllers/WhatsAppWebhookController.php:L21-L46`
- **Finding:** Endpoint `POST /api/webhook/whatsapp` tidak memiliki secret token, signature verification (HMAC), maupun API key header check. Siapapun dapat mengirim HTTP POST dengan field `sender` dan `message` acak.
- **Evidence:**
  ```php
  Route::post('/webhook/whatsapp', [WhatsAppWebhookController::class, 'handle']);
  // Controller langsung memanggil $this->whatsAppService->send($sender, $reply);
  ```
- **Impact:** Penyerang dapat menggunakan endpoint ini sebagai open proxy SMS/WhatsApp untuk mengirim spam atau pesan penipuan ke nomor manapun di dunia menggunakan kuota Fonnte milik pengelola web.
- **Severity:** `CRITICAL`
- **Recommendation:** Tambahkan token verifikasi webhook (misal header `X-Fonnte-Signature` atau query token rahasia) dan middleware validator sebelum memproses input.

---

### [SEC-03] PII Exposure & IDOR pada Endpoint Aspirasi Publik
- **ID:** `SEC-03`
- **Category:** `Security - Sensitive Data Exposure / IDOR`
- **Location:** `Backend/baktinusantara-laravel/app/Http/Controllers/AspirasiController.php:L29-L38`, `Backend/baktinusantara-laravel/app/Models/Aspirasi.php:L7-L14`
- **Finding:** Endpoint `GET /api/aspirasi/{ticket}` bersifat publik tanpa otentikasi dan mengembalikan seluruh atribut model `Aspirasi` termasuk `pelapor_nama` dan `pelapor_wa` asli tanpa masking.
- **Evidence:** Model `Aspirasi.php` tidak memiliki `$hidden = ['pelapor_wa']`. Siapapun dapat mengiterasi ID tiket `1, 2, 3...` untuk mengikis (scraping) seluruh nomor WhatsApp warga desa yang mengadu.
- **Impact:** Pelanggaran privasi data pribadi (UU PDP / GDPR) dan risiko phishing/spam terhadap warga pelapor.
- **Severity:** `HIGH`
- **Recommendation:** Tambahkan masking nomor WhatsApp pada respon publik (`0812****7890`) atau gunakan token akses unik/UUID tiket alih-alih auto-incrementing integer ID.

---

### [SEC-04] Client-Side Role & Token Spoofing pada Next.js Middleware
- **ID:** `SEC-04`
- **Category:** `Security - Broken Access Control`
- **Location:** `Frontend/baktinusantara-frontend/middleware.ts:L15-L36`
- **Finding:** Next.js middleware hanya memeriksa nilai cookie mentah `user_role` dan `sanctum_token` tanpa memvalidasi kriptografi JWT/Sanctum ke backend Laravel.
- **Evidence:** Pengguna dapat membuka DevTools dan menyetel `document.cookie = "sanctum_token=bypass; user_role=admin;"`, lalu browser akan diizinkan mengakses halaman antarmuka `/admin/*`.
- **Impact:** User biasa dapat melihat UI dashboard internal admin dan kampus (meskipun API data backend akan menolak dengan 401/403 jika token salah, kebocoran UI dan kontrol client tetap terjadi).
- **Severity:** `HIGH`
- **Recommendation:** Implementasikan session cookie berbasis signed JWT/iron-session di Next.js atau lakukan edge token introspection.

---

### [SEC-05] Public Unauthenticated Medsos Post Injection
- **ID:** `SEC-05`
- **Category:** `Security - Missing Authorization`
- **Location:** `Backend/baktinusantara-laravel/routes/api.php:L55`, `Backend/baktinusantara-laravel/app/Http/Controllers/MedsosPostController.php:L45-L73`
- **Finding:** Endpoint `POST /api/medsos-posts` terbuka untuk publik tanpa `auth:sanctum`. Controller langsung menyetel `'is_verified' => true` dan menyimpan link media sosial ke database.
- **Evidence:**
  ```php
  Route::post('/medsos-posts', [MedsosPostController::class, 'store']); // No auth middleware
  ```
- **Impact:** Siapapun dapat menginjeksi tautan judi online, phishing, atau konten berbahaya ke feed Live Report di peta publik tanpa moderasi admin.
- **Severity:** `HIGH`
- **Recommendation:** Lindungi rute tersebut dengan middleware `auth:sanctum` dan batasi hanya untuk role `mahasiswa`, `dosen`, atau `perangkat_desa`.

---

### [BUG-01] Pos Kebutuhan Baru Tidak Pernah Tampil di Dashboard Desa
- **ID:** `BUG-01`
- **Category:** `Functional Bug - UI State Misbinding`
- **Location:** `Frontend/baktinusantara-frontend/app/perangkat-desa/pos-kebutuhan/page.tsx:L108`
- **Finding:** Meskipun fungsi `fetchDesaPos()` berhasil memuat data dari API ke state `posList`, komponen grid pada baris 108 malah mengulang array statis `MOCK_POS_KEBUTUHAN.map(...)`.
- **Evidence:**
  ```tsx
  {/* Existing Pos List */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {MOCK_POS_KEBUTUHAN.map((pos) => ( ... ))} {/* Harusnya posList.map */}
  ```
- **Impact:** Pos kebutuhan baru yang dibuat oleh perangkat desa tidak akan pernah muncul di halaman manajemen desa.
- **Severity:** `HIGH`
- **Recommendation:** Ganti `MOCK_POS_KEBUTUHAN.map` menjadi `posList.map`.

---

### [BUG-02] Hardcoded ID Proposal dan Data Mahasiswa pada Logbook Progress
- **ID:** `BUG-02`
- **Category:** `Functional Bug - Hardcoded State`
- **Location:** `Frontend/baktinusantara-frontend/app/mahasiswa/progress/page.tsx:L66, L92, L109-L111`
- **Finding:** Halaman pelaporan progres meng-hardcode `api.progress.getByProposal(1)` dan `proposal_id: 1` serta nama mahasiswa `Ahmad Fauzi`.
- **Evidence:**
  ```typescript
  api.progress.getByProposal(1)
  const payload = { proposal_id: 1, ... }
  ```
- **Impact:** Mahasiswa dari kelompok proposal lain (ID 2, 3, dst.) akan selalu membaca dan mengirimkan logbook ke proposal ID 1.
- **Severity:** `HIGH`
- **Recommendation:** Ambil proposal ID aktif milik kelompok mahasiswa yang sedang login secara dinamis dari `AuthContext` / user session API.

---

### [BUG-03] QR Code E-Sertifikat Bukan Standar QR (Unscannable SVG)
- **ID:** `BUG-03`
- **Category:** `Functional & Integrity Issue`
- **Location:** `Backend/baktinusantara-laravel/app/Services/CertificateService.php:L186-L214`
- **Finding:** Fungsi pembuatan QR code `generateQrCodeSvg()` menghasilkan kotak-kotak SVG berdasarkan perulangan modulo karakter hash buatan (`($char + $r + $c) % 2 === 0`), bukan matriks QR Code standar ISO/IEC 18004.
- **Evidence:** Ketika QR Code pada sertifikat di-scan dengan kamera smartphone atau aplikasi pemindai QR standar, kode tersebut tidak akan dapat dibaca/diterjemahkan menjadi URL verifikasi.
- **Impact:** Fitur validasi cepat dokumen fisik e-sertifikat gagal total saat dipindai di dunia nyata.
- **Severity:** `MEDIUM`
- **Recommendation:** Gunakan library resmi pembuat QR Code standar di PHP seperti `bacon/bacon-qr-code` atau `simplesoftwareio/simple-qrcode`.

---

### [UX-01] False-Positive Success Toast Saat Backend API Error
- **ID:** `UX-01`
- **Category:** `UX/UI - Misleading Feedback`
- **Location:** `Frontend/baktinusantara-frontend/app/admin/verifikasi-entitas/page.tsx:L200`, `Frontend/baktinusantara-frontend/app/mahasiswa/proposal/page.tsx:L93`, `Frontend/baktinusantara-frontend/app/perangkat-desa/pos-kebutuhan/page.tsx:L75`
- **Finding:** Blok `catch (err)` pada form pengajuan proposal, verifikasi admin, dan pembuatan pos sengaja menangkap kegagalan API lalu tetap menampilkan toast sukses `toast.success('... (Mode Demo)')`.
- **Evidence:**
  ```typescript
  } catch (err: any) {
    toast.success(`Akun ${item.nama} berhasil diverifikasi!`); // Eksekusi backend sebenarnya gagal/401/500
  }
  ```
- **Impact:** User/admin mengira aksi berhasil disimpan di database server padahal transaksi gagal total.
- **Severity:** `HIGH`
- **Recommendation:** Tampilkan pesan error faktual menggunakan `toast.error(formatApiError(err).message)` saat backend gagal.

---

## 4. Functional Audit

| Feature / Page | Status | Issue | Severity | Evidence |
|---|---|---|---|---|
| **Pendaftaran Mahasiswa (Multi-Phase)** | `PARTIAL` | Verifikasi OTP dibuat murni di browser client dengan hardcoded bypass code (`729401`, `123456`). | `HIGH` | `register/mahasiswa/page.tsx:L248` |
| **Login Multi-Peran** | `PASS` | Autentikasi Sanctum berjalan, token tersimpan di LocalStorage & Cookies. | `INFO` | `AuthController.php`, `AuthContext.tsx` |
| **Pusat Kendali Super Admin** | `PARTIAL` | Tombol preview berkas legalitas mengarah ke `href="#"` (Dead Link). | `MEDIUM` | `admin/verifikasi-entitas/page.tsx:L58` |
| **Manajemen Pos Kebutuhan Desa** | `FAIL` | Pos baru yang dibuat desa tidak muncul karena mapping array mock hardcoded. | `HIGH` | `perangkat-desa/pos-kebutuhan/page.tsx:L108` |
| **Pengajuan Proposal Mahasiswa** | `PARTIAL` | Koordinat GPS domisili di-hardcode ke Surabaya (`-7.2575, 112.7521`). Berkas proposal fallback ke dummy blob. | `MEDIUM` | `mahasiswa/proposal/page.tsx:L66` |
| **Logbook Progres Mingguan** | `FAIL` | Proposal ID di-hardcode ke ID `1`, nama mahasiswa hardcoded ke `Ahmad Fauzi`. | `HIGH` | `mahasiswa/progress/page.tsx:L66-L111` |
| **Pengaduan Aspirasi Warga** | `PARTIAL` | Koordinat desa di-hardcode ke Mojowarno Jombang; no WA terekspos di API publik. | `HIGH` | `aspirasi/page.tsx:L88` |
| **Peta Interaktif Spasial (/maps)** | `PASS` | Filter wilayah (Provinsi, Kab, Kec, Desa), marker Leaflet, dan Live Report berjalan baik. | `INFO` | `app/maps/page.tsx` |
| **AI Copilot (Aira)** | `PARTIAL` | Guardrail dan persona berjalan baik, namun eksekutor tools mengueri data mock statis frontend. | `MEDIUM` | `lib/ai-agent-tools.ts` |
| **Web Push Notification** | `PARTIAL` | Menggunakan in-memory global store di Next.js runtime; hilang jika server restart. | `MEDIUM` | `lib/server/push-store.ts` |
| **TTS Piper Voice** | `PARTIAL` | Menjalankan subprocess `python -c` per HTTP request tanpa process pool. | `MEDIUM` | `app/api/tts/piper/route.ts` |
| **E-Portofolio Publik (/portofolio/[slug])** | `PASS` | Berhasil merender data capaian, ulasan desa, dan tombol unduh sertifikat. | `INFO` | `app/portofolio/[slug]/page.tsx` |
| **Halaman Induk /portofolio & /survei** | `FAIL` | Menghasilkan HTTP 404 Not Found karena tidak ada file `page.tsx` di folder root. | `HIGH` | Direct routing failure |
| **Halaman Induk /admin, /mahasiswa, /dosen** | `FAIL` | Menghasilkan HTTP 404 jika diakses tanpa sub-path `/dashboard`. | `HIGH` | Direct routing failure |

---

## 5. UX/UI Audit

| Area | Finding | Impact | Severity | Recommendation |
|---|---|---|---|---|
| **Floating Action Collision** | Tombol melayang Aira AI Copilot (`bottom: 84px`) bertumpuk tepat di atas tombol Widget Aksesibilitas (`bottom: 24px`) di pojok kanan bawah. | Pada layar smartphone, tumpukan tombol melayang ini menutupi form submit, pagination, dan footer navigation. | `HIGH` | Berikan opsi minimize atau jadikan satu unified floating dock menu. |
| **Role Switcher di Navbar Publik** | Dropdown ganti peran instan (Mahasiswa, Kades, DPL, LPPM, Admin) muncul di navbar publik pada setiap halaman. | Membingungkan user publik umum dan memberikan celah impresi bahwa sistem tidak aman. | `MEDIUM` | Sembunyikan `RoleSwitcher` pada mode produksi (`process.env.NODE_ENV === 'production'`). |
| **Hardcoded Nav Link Portofolio** | Tautan navbar Portofolio mengarah ke `/portofolio/kelompok-14-sukamaju`. | User selalu diarahkan ke satu kelompok spesifik alih-alih galeri daftar portofolio publik. | `MEDIUM` | Buat halaman katalog portofolio di `/portofolio/page.tsx` dan tautkan ke sana. |
| **Duplikasi Dashboard Kampus & Admin** | Tampilan `/kampus/dashboard` dan `/admin/dashboard` identik 90% termasuk teks header "Sistem Informasi & Pusat Kendali". | Pengelola LPPM Kampus disajikan informasi yang membingungkan dan tidak berfokus khusus pada universitasnya. | `MEDIUM` | Kustomisasi KPI Kampus khusus untuk agregasi mahasiswa, DPL internal, dan konversi SKS. |
| **Placeholder Document Links** | Tautan dokumen SK & KTM pada modal verifikasi admin bertuliskan `href="#"`. | Admin tidak bisa meninjau fisik berkas PDF yang diajukan pendaftar. | `HIGH` | Hubungkan ke file URL nyata dari backend storage. |

---

## 6. Responsive Audit

| Viewport | Status | Issue |
|---|---|---|
| **320px (Mobile S - iPhone SE)** | `FAIL` | Tabel rekapitulasi nilai dosen dan logbook mengalami overflow horizontal; floating buttons AI & Aksesibilitas menutupi 30% area bawah layar. |
| **375px - 390px (Mobile M/L - iPhone 13/14)** | `PARTIAL` | Multi-phase stepper pada pendaftaran mahasiswa memotong label teks tahapan. |
| **414px (Mobile XL)** | `PASS` | Layout form, card, dan navbar hamburger menu collapse dengan rapi. |
| **768px (Tablet Portrait)** | `PASS` | Grid 2 kolom berjalan baik; Leaflet Map menyesuaikan dimensi container. |
| **1024px (Tablet Landscape / Laptop)** | `PASS` | Sidebar dashboard responsif dan collapsible. |
| **1280px - 1440px (Desktop Standard)** | `PASS` | Visual hierarchy dan spacing terlihat proporsional dan elegan. |
| **1920px (FHD Desktop)** | `PASS` | Container `max-w-[1500px]` membatasi pelebaran layout berlebih. |

---

## 7. Accessibility Audit (WCAG 2.1 AA)

| Issue | WCAG Principle | WCAG Success Criterion | Severity | Location | Recommendation |
|---|---|---|---|---|---|
| **Tombol Ikon Tanpa Label Aksesibel** | Operable | 4.1.2 Name, Role, Value | `HIGH` | Send button di `BaktiAiCopilot.tsx:L469`, Action buttons di tabel | Tambahkan `aria-label="Kirim Pesan"` dan `aria-label` deskriptif di seluruh tombol ikon. |
| **Kontras Warna Teks Rendah** | Perceivable | 1.4.3 Contrast (Minimum) | `MEDIUM` | Teks keterangan kecil `text-slate-400` pada latar putih di card | Ubah token warna menjadi `text-slate-600` untuk rasio kontras minimal 4.5:1. |
| **Modal Tanpa Focus Trap** | Operable | 2.1.2 No Keyboard Trap & 2.4.3 Focus Order | `HIGH` | Modal Aira AI Copilot & Modal Buat Pos | Terapkan focus trap (misal via `@radix-ui/react-dialog` atau custom hook) agar tombol Tab tidak lari ke background. |
| **Heading Hierarchy Terlewati** | Perceivable | 1.3.1 Info and Relationships | `LOW` | `app/page.tsx` (`h1` langsung melompat ke `h3`) | Gunakan struktur hierarki heading berurutan `h1 -> h2 -> h3`. |
| **Multi `<h1>` dalam Satu Halaman** | Perceivable | 1.3.1 Info and Relationships | `LOW` | Halaman dashboard memiliki lebih dari 1 tag `h1` | Pastikan hanya ada 1 elemen `<h1>` utama per halaman. |

---

## 8. Performance Audit

| Area | Finding | Impact | Recommendation |
|---|---|---|---|
| **Ukuran Aset SVG Sangat Besar** | File `public/logochat.svg` (1.64 MB), `public/indonesia.svg` (1.13 MB), dan `public/logo.svg` (1.06 MB) belum dikompresi. | Memperlambat First Contentful Paint (FCP) dan memboroskan kuota internet pengguna mobile. | Optimasi SVG menggunakan `svgo` atau konversi ke WebP vector-optimized (~20–40 KB). |
| **Monolithic Client Components** | File `app/page.tsx` (1.506 baris) dan `app/maps/page.tsx` (1.928 baris) dideklarasikan sebagai `'use client'`. | Bundle JavaScript client menjadi sangat besar (~500 KB+ gzipped), memperlambat Time to Interactive (TTI). | Pecah halaman menjadi Server Component layout dengan Client Component modular terisolasi. |
| **Subprocess Spawning pada TTS** | Rute `/api/tts/piper` mengeksekusi `child_process.spawn('python', ...)` per request jika server HTTP offline. | Latensi tinggi (1–3 detik per audio) dan risiko CPU throttling saat traffic tinggi. | Jalankan Piper TTS sebagai daemon microservice mandiri atau gunakan Web Speech API native browser sebagai fallback utama. |
| **Test Screenshot di Folder Public** | Folder `public/` menyimpan 5 file PNG screenshot pengujian dengan total ukuran > 7 MB. | Menambah ukuran build image dan deploy size secara sia-sia. | Pindahkan gambar pengujian ke luar folder `public` atau hapus sebelum rilis produksi. |

---

## 9. Security Audit

| Area | Finding | Risk | Severity | Recommendation |
|---|---|---|---|---|
| **Hardcoded Gemini API Keys** | API Key Google Gemini tertanam langsung di kode `lib/gemini-keys.ts`. | Pencurian kuota API dan penyalahgunaan endpoint AI. | `CRITICAL` | Revoke key segera, pindahkan ke `.env` server-side only. |
| **Unauthenticated WhatsApp Webhook** | Rute `POST /api/webhook/whatsapp` tanpa autentikasi/signature check. | Eksploitasi relay pengiriman pesan spam via kuota Fonnte. | `CRITICAL` | Pasang signature verification header dari provider WhatsApp. |
| **Unauthenticated Medsos Post Creation** | Rute `POST /api/medsos-posts` terbuka untuk publik dengan `is_verified: true`. | Injeksi konten spam/judi ke feed peta nasional. | `HIGH` | Pasang middleware `auth:sanctum` dan validasi role. |
| **PII Data Leakage pada Aspirasi** | Endpoint `GET /api/aspirasi/{ticket}` mengekspos nomor WhatsApp asli pelapor. | Scraping data kontak warga (Pelanggaran UU PDP). | `HIGH` | Masking nomor telepon dan gunakan UUID tiket. |
| **Client-Side Auth Middleware Bypass** | Next.js middleware hanya mengecek keberadaan cookie mentah. | Pengguna dapat membuka antarmuka admin di client browser. | `HIGH` | Validasi signature session / edge introspection. |
| **Missing Rate Limiter pada Auth & AI** | Tidak ada throttling pada login, OTP verification, dan AI prompt generation. | Brute force OTP 6-digit dan eksploitasi kuota AI. | `HIGH` | Pasang Laravel `throttle:6,1` pada rute sensitif. |
| **Exposed VAPID Private Key Fallback** | Fallback private key Web Push tertulis di `lib/server/push-store.ts`. | Pihak luar dapat menandatangani push notification palsu. | `MEDIUM` | Wajibkan pembacaan dari environment variable tanpa fallback plaintext. |

---

## 10. API & Backend Audit

1. **Routing Inconsistencies:**
   - Frontend memanggil `POST /api/upload` untuk unggah berkas umum (`app/api/upload/route.ts:L60`), namun pada backend Laravel `routes/api.php` rute tersebut **tidak ada**, sehingga selalu jatuh ke mock URL `https://storage.gayatama.ac.id/uploads/...`.
2. **Missing Storage Routes:**
   - Proposal diunggah ke private disk `store('proposal', 'local')` (`ProposalService.php:L107`), tetapi backend **tidak memiliki rute controller** untuk men-download atau mengalirkan berkas proposal yang tersimpan tersebut ke DPL/Kades.
3. **Database Transactions:**
   - Sebagian besar operasi multi-tabel (seperti pembuatan proposal dan penerbitan sertifikat) sudah memanfaatkan `DB::transaction(...)` dengan baik.
4. **N+1 Query Optimization:**
   - Controller sudah memanfaatkan eager loading (`with(['posKebutuhan', 'desa', 'kelompok'])`), namun pada `GeospatialController::nearbyPos` perhitungan jarak Haversine dilakukan di memori PHP pada seluruh koleksi pos aktif, yang akan melambat jika data desa mencapai ribuan. Disarankan menggunakan formula Haversine langsung di SQL query / Spatial extension.

---

## 11. Database Audit

1. **Foreign Key Integrity:**
   - Seluruh tabel relasional utama (`users`, `profil_mahasiswa`, `profil_desa`, `kelompok`, `proposal`, `sertifikat_kkn`) sudah memiliki foreign key constraint yang tepat dengan `cascadeOnDelete()` atau `nullOnDelete()`.
2. **Missing Indexing:**
   - Kolom-kolom filter frekuensi tinggi seperti `pos_kebutuhan.status`, `pos_kebutuhan.kategori`, `proposal.status`, dan `aspirasi.desa_id` belum memiliki indeks khusus di database migrations.
3. **Nullability & Validation:**
   - Tabel `pos_kebutuhan` menyimpan field `sdg_codes` dan `jurusan_dibutuhkan` dalam format `JSON` yang fleksibel dan efisien.

---

## 12. SEO Audit

| Item | Status | Finding |
|---|---|---|
| **Title Tags** | `PARTIAL` | Title default di root layout lengkap, namun halaman dinamis (`/portofolio/[slug]`, `/aspirasi`) tidak memiliki `generateMetadata()` dinamis. |
| **Meta Description** | `PASS` | Deskripsi informatif mengenai ekosistem KKN Tematik BaktiNusantara. |
| **Robots.txt** | `FAIL` | File `app/robots.ts` atau `public/robots.txt` belum tersedia. |
| **Sitemap.xml** | `FAIL` | File `app/sitemap.ts` atau `public/sitemap.xml` belum tersedia. |
| **Open Graph & Twitter Card** | `PARTIAL` | Belum ada deklarasi `og:image`, `og:url`, atau `twitter:card` spesifik di metadata. |
| **Canonical URL** | `FAIL` | Belum ada tag canonical URL untuk mencegah duplikasi indexasi parameter query. |

---

## 13. Code Quality Audit

| Area | Finding | Severity | Recommendation |
|---|---|---|---|
| **Komponen Monolitik Raksasa** | `app/maps/page.tsx` (1.928 baris) dan `app/page.tsx` (1.506 baris). | `HIGH` | Ekstraksi sub-komponen (filter bar, quick chips, modal review) ke folder `components/`. |
| **Duplikasi Kode Masif** | `app/admin/dashboard/page.tsx` dan `app/kampus/dashboard/page.tsx` (90% duplikat). | `MEDIUM` | Buat reusable `ExecutiveDashboardTemplate` untuk dipakai bersama oleh Admin & Kampus. |
| **Unused Mock Dependencies** | Campuran antara pemanggilan service API asli dan fallback `MOCK_*` yang saling bertubrukan. | `MEDIUM` | Bersihkan mock data dari production flow; gunakan React Query / SWR untuk handling state server. |
| **Any / Loose Type Safety** | Banyak parameter payload API dan state dideklarasikan sebagai `any` (misal: `payload: any`, `raw: any`). | `LOW` | Definisikan interface DTO yang strict pada `lib/types.ts`. |

---

## 14. Dependency Audit

| Dependency | Versi Terpasang | Isu / Catatan | Rekomendasi |
|---|---|---|---|
| **Next.js** | `14.2.23` | Versi stabil Next.js 14 App Router. | Pertahankan (belum perlu upgrade ke 15 sebelum arsitektur SSR dirapikan). |
| **Laravel Framework** | `^12.0` | Laravel 12 terbaru dengan arsitektur `bootstrap/app.php` modern. | Sangat baik dan mutakhir. |
| **Framer Motion** | `^13.3.0` | Versi terbaru untuk animasi micro-interactions. | Kompatibel. |
| **Leaflet & React-Leaflet** | `^1.9.4 / ^4.2.1` | Memerlukan dynamic import `ssr: false` (sudah dihandle). | Pertahankan. |
| **Web-Push** | `^3.6.7` | Digunakan untuk FCM & standard push protocol. | Pertahankan. |
| **Dompdf** | `*` | Sudah terpasang di `composer.json` namun belum dipakai di `CertificateService`. | Manfaatkan Dompdf untuk render sertifikat berstandar tinggi. |

---

## 15. Dead Features & Incomplete Implementations

1. **Dead Routes (404 Error):**
   - Mengakses `/portofolio` langsung (tanpa slug) menghasilkan 404 (Footer link rusak).
   - Mengakses `/survei` langsung menghasilkan 404.
   - Mengakses base path dashboard `/admin`, `/mahasiswa`, `/perangkat-desa`, `/dosen`, `/kampus` tanpa suffix `/dashboard` menghasilkan 404.
2. **Dead Buttons & Stub Actions:**
   - Tombol "Lihat Berkas Legalitas SK/KTM" pada `admin/verifikasi-entitas/page.tsx` mengarah ke `#`.
   - Tombol unduh E-Sertifikat jika file URL kosong mengarah ke `#`.
   - Tombol "Unduh Laporan" pada dashboard kampus tidak mengeksekusi fungsi unduh apapun.
3. **Simulated OTP Form:**
   - Form pendaftaran mahasiswa menampilkan kode OTP acak via toast notifikasi di browser tanpa mengirim email/WA nyata dari backend.
4. **Unconnected Backend Upload:**
   - Next.js API `/api/upload` menembak rute `/api/upload` di Laravel yang tidak pernah dibuat di `routes/api.php`.

---

## 16. User Flow Problems

1. **Broken Flow: Pendaftaran -> Auto Login -> 401 API Error:**
   - *Problem:* Jika pendaftaran backend gagal, `AuthContext` membuat token palsu `token-${Date.now()}` dan memasukkan user ke dashboard. Begitu user membuka menu dashboard, seluruh request API backend gagal dengan 401 Unauthenticated.
   - *Impact:* Pengguna terjebak di dashboard kosong tanpa data dan tidak bisa melakukan aksi apapun.
   - *Recommendation:* Jangan izinkan login jika registrasi backend gagal; tampilkan pesan kegagalan secara jelas di form registrasi.
2. **Broken Flow: Tambah Pos Desa -> Halaman Pos Tidak Berubah:**
   - *Problem:* Perangkat desa mengisi form pos kebutuhan baru dan mendapat toast sukses, namun daftar pos di layar tetap menampilkan 3 pos mock bawaan karena hardcoded `.map`.
   - *Impact:* Perangkat desa mengira sistem rusak atau data mereka hilang.
   - *Recommendation:* Sambungkan rendering ke state `posList`.
3. **Confusing Flow: Mahasiswa Luar Kelompok 1 Mengakses Logbook:**
   - *Problem:* Mahasiswa login dari kelompok baru, tetapi halaman logbook selalu menampilkan dan mengirim data ke Proposal ID 1 milik Ahmad Fauzi.
   - *Impact:* Data kelompok saling tertimpa dan tercampur aduk.
   - *Recommendation:* Kaitkan proposal ID secara dinamis dengan kelompok aktif mahasiswa.

---

## 17. Positive Findings (Terverifikasi Berjalan Baik)

1. **Arsitektur Model & Database Laravel Sangat Rapi:** Relasi Eloquent antar entitas (`User`, `ProfilDesa`, `ProfilMahasiswa`, `ProfilUniversitas`, `Kelompok`, `Proposal`, `PosKebutuhan`, `SertifikatKkn`) dirancang dengan konvensi Laravel 12 yang sangat terstruktur dan bersih.
2. **Desain UI & Visual Identity Sangat Menarik:** Penggunaan tipografi Google Fonts (`Epilogue` dan `Plus Jakarta Sans`), palet warna bertema nusantara/terpadu, dark mode toggle, serta transisi animasi Framer Motion memberikan impresi visual modern dan premium.
3. **Guardrail Prompt AI Assistant (Aira) Kuat:** System instruction pada `app/api/ai/agent/route.ts` membatasi domain percakapan secara tegas pada KKN, desa binaan, dan platform GayatamaWeb dengan formula penolakan ramah dan cerdas.
4. **Peta Spasial Interaktif Berfungsi:** Integrasi Leaflet dengan GeoJSON dan filter wilayah (Provinsi, Kabupaten, Kecamatan, Desa) dapat merender titik-titik pos kebutuhan dan profil daerah secara interaktif.
5. **Dukungan Multi-Bahasa (i18n):** Tersedia integrasi `next-intl` dengan kamus bahasa Indonesia (`id`) dan Inggris (`en`) pada komponen-komponen utama.

---

## 18. PRIORITIZED FIX LIST

### P0 — Critical (Keamanan & Integritas Data)

#### [P0-01] Cabut & Amankan Kunci API Google Gemini
- **Problem:** API Key terekspos di `lib/gemini-keys.ts` dan `.env.local`.
- **Why it matters:** Mencegah eksploitasi kuota AI dan kerugian finansial.
- **Affected component:** `lib/gemini-keys.ts`, `.env.local`
- **Recommended fix:** Revoke key di Google Cloud Console. Pindahkan konfigurasi ke `process.env.GEMINI_API_KEY` server-only dan hapus fallback string di kode.
- **Dependencies:** None
- **Estimated complexity:** Low (15 menit)

#### [P0-02] Pasang Signature Verification pada Webhook WhatsApp
- **Problem:** Endpoint webhook `/api/webhook/whatsapp` terbuka tanpa proteksi.
- **Why it matters:** Mencegah eksploitasi open relay SMS/WhatsApp spam.
- **Affected component:** `Backend/routes/api.php`, `WhatsAppWebhookController.php`
- **Recommended fix:** Validasi token secret pada header request webhook sebelum memproses pesan.
- **Dependencies:** None
- **Estimated complexity:** Low (30 menit)

#### [P0-03] Proteksi Endpoint Publik Medsos Post & Masking PII Aspirasi
- **Problem:** `POST /api/medsos-posts` terbuka tanpa auth; `GET /api/aspirasi/{ticket}` membocorkan nomor WhatsApp warga.
- **Why it matters:** Menghindari defacement feed live report dan kebocoran data pribadi (UU PDP).
- **Affected component:** `MedsosPostController.php`, `AspirasiController.php`
- **Recommended fix:** Tambahkan middleware `auth:sanctum` pada rute `POST /api/medsos-posts` dan masking nomor telepon di respon tiket aspirasi.
- **Dependencies:** None
- **Estimated complexity:** Low (30 menit)

---

### P1 — High (Bug Fungsional & User Flow Rusak)

#### [P1-01] Perbaiki Binding Rendering Pos Kebutuhan Desa
- **Problem:** Halaman manajemen pos kebutuhan desa mengulang `MOCK_POS_KEBUTUHAN` bukan `posList`.
- **Why it matters:** Pos baru yang diinput kepala desa tidak pernah muncul di UI.
- **Affected component:** `app/perangkat-desa/pos-kebutuhan/page.tsx:L108`
- **Recommended fix:** Ganti `MOCK_POS_KEBUTUHAN.map` menjadi `posList.map`.
- **Dependencies:** None
- **Estimated complexity:** Low (10 menit)

#### [P1-02] Hubungkan Proposal ID Dinamis pada Logbook Mahasiswa
- **Problem:** Hardcoded `proposal_id: 1` pada pengiriman dan pembacaan progress logbook.
- **Why it matters:** Mencegah tumpang tindih data antar mahasiswa dan kelompok KKN yang berbeda.
- **Affected component:** `app/mahasiswa/progress/page.tsx`
- **Recommended fix:** Ambil `activeProposalId` dari context user kelompok mahasiswa aktif.
- **Dependencies:** AuthContext / Kelompok API
- **Estimated complexity:** Medium (1 jam)

#### [P1-03] Selesaikan Dead Routes (404) & Redirect Base Path
- **Problem:** Akses ke `/portofolio`, `/survei`, `/admin`, `/mahasiswa`, `/dosen`, `/kampus` menghasilkan 404.
- **Why it matters:** Menghilangkan dead end pada navigasi utama dan footer.
- **Affected component:** `middleware.ts`, `app/portofolio/page.tsx`, `app/survei/page.tsx`
- **Recommended fix:** Buat halaman katalog portofolio di `app/portofolio/page.tsx` dan tambahkan redirect otomatis pada `middleware.ts` dari `/mahasiswa` ke `/mahasiswa/dashboard`.
- **Dependencies:** None
- **Estimated complexity:** Medium (1 jam)

#### [P1-04] Buat Rute Storage Controller untuk Berkas Proposal & SK
- **Problem:** Berkas disimpan di disk `local` tanpa ada rute download/stream dari server.
- **Why it matters:** DPL, Kades, dan Admin tidak bisa melihat isi proposal dan dokumen legalitas.
- **Affected component:** `Backend/routes/api.php`, `ProposalController.php`
- **Recommended fix:** Tambahkan endpoint `GET /api/proposal/{proposal}/file` dengan otentikasi role-based untuk mengalirkan file response.
- **Dependencies:** Sanctum Auth
- **Estimated complexity:** Medium (1 jam)

---

### P2 — Medium (UX/UI, Performa, dan Integrasi Nyata)

#### [P2-01] Optimasi & Kompresi Aset SVG Raksasa (>1 MB)
- **Problem:** `logochat.svg` (1.64 MB), `indonesia.svg` (1.13 MB), `logo.svg` (1.06 MB) memperlambat FCP/LCP.
- **Why it matters:** Meningkatkan skor Core Web Vitals dan kecepatan buka di smartphone.
- **Affected component:** `public/logochat.svg`, `public/indonesia.svg`, `public/logo.svg`
- **Recommended fix:** Kompresi vektor menggunakan SVGO atau ganti icon chat dengan WebP ringan (<30 KB).
- **Dependencies:** None
- **Estimated complexity:** Low (30 menit)

#### [P2-02] Ganti Pola Acak QR Code dengan Generator QR Standar
- **Problem:** QR Code sertifikat berupa SVG kotak acak yang tidak dapat dipindai oleh smartphone.
- **Why it matters:** Memastikan verifikasi keaslian dokumen fisik berfungsi nyata saat di-scan.
- **Affected component:** `CertificateService.php`
- **Recommended fix:** Gunakan library QR code standar di PHP atau Google Chart QR API.
- **Dependencies:** Composer package
- **Estimated complexity:** Low (45 menit)

#### [P2-03] Pisahkan Monolithic Pages & Sembunyikan Role Switcher di Production
- **Problem:** `app/page.tsx` dan `app/maps/page.tsx` berukuran ribuan baris; Role Switcher terbuka di publik.
- **Why it matters:** Meningkatkan maintainability dan menjaga kredibilitas sistem di mata publik.
- **Affected component:** `app/page.tsx`, `app/maps/page.tsx`, `components/ui/RoleSwitcher.tsx`
- **Recommended fix:** Refaktor sub-bagian ke komponen terpisah dan bungkus `RoleSwitcher` dengan kondisi `process.env.NODE_ENV !== 'production'`.
- **Dependencies:** None
- **Estimated complexity:** High (3 jam)

---

### P3 — Low (Aksesibilitas, SEO, dan Polish)

#### [P3-01] Tambahkan `robots.txt` dan `sitemap.ts`
- **Problem:** Mesin pencari (Google/Bing) belum memiliki panduan crawling dan indeksasi URL.
- **Why it matters:** Meningkatkan indeksasi SEO untuk portofolio desa dan katalog pos KKN.
- **Affected component:** `app/robots.ts`, `app/sitemap.ts`
- **Recommended fix:** Buat file `app/robots.ts` dan `app/sitemap.ts` dinamis di Next.js.
- **Dependencies:** None
- **Estimated complexity:** Low (30 menit)

#### [P3-02] Lengkapi ARIA Labels & Focus Trap pada Seluruh Modal Dialog
- **Problem:** Tombol ikon belum memiliki `aria-label`; modal dialog belum memiliki focus trap.
- **Why it matters:** Memenuhi standar kepatuhan aksesibilitas WCAG 2.1 AA untuk pengguna screen reader.
- **Affected component:** `BaktiAiCopilot.tsx`, `components/ui/Button.tsx`, form modal
- **Recommended fix:** Tambahkan `aria-label` deskriptif dan kelola fokus keyboard saat modal terbuka.
- **Dependencies:** None
- **Estimated complexity:** Medium (1.5 jam)

---

## 19. FINAL AUDIT CHECKLIST

| Kategori Evaluasi | Status Akhir | Ringkasan Kondisi |
|---|---|---|
| **Functional** | `PARTIAL` | Fitur utama berjalan, namun terdapat binding bug pada pos desa dan proposal ID logbook. |
| **UX/UI** | `PARTIAL` | Visual sangat estetik, namun terdapat false-positive toast dan tombol melayang bertumpuk. |
| **Responsive** | `PARTIAL` | Bagus di desktop/tablet; tabel rekap overflow di layar < 375px. |
| **Accessibility (a11y)** | `PARTIAL` | Kontras warna di beberapa card rendah; ARIA labels pada tombol ikon belum lengkap. |
| **Performance** | `PARTIAL` | Aset SVG > 1MB dan monolithic client components memperlambat LCP & TTI. |
| **Security** | `FAIL` | Terdapat API key bocor di source code, webhook tanpa signature, dan IDOR data kontak warga. |
| **API & Backend** | `PARTIAL` | Desain controller & service bersih, namun rute upload proxy dan file download belum lengkap. |
| **Database** | `PASS` | Skema relasional, tipe data, foreign keys, dan cascade rules sudah sangat baik. |
| **SEO** | `PARTIAL` | Meta tag dasar tersedia; robots.txt, sitemap.xml, dan dynamic metadata belum ada. |
| **Browser Compatibility** | `PASS` | Menggunakan standar modern CSS/JS yang kompatibel di Chrome, Edge, dan Firefox. |
| **PWA** | `PARTIAL` | Manifest & Service Worker tersedia, namun push store masih menggunakan RAM server. |
| **AI Assistant (Aira)** | `PASS` | Guardrail dan respon percakapan natural dan terarah sesuai domain KKN/Desa. |
| **Accessibility Widget** | `PASS` | Script helper integrasi berfungsi dengan multi-voice detection. |
| **Code Quality** | `PARTIAL` | Terdapat duplikasi masif antara dashboard kampus dan admin serta file monolitik besar. |
| **Dependencies** | `PASS` | Seluruh library utama kompatibel dan mutakhir (Next.js 14 & Laravel 12). |
| **Deployment Readiness** | `PARTIAL` | Memerlukan perbaikan keamanan (P0) sebelum layak dirilis ke production publik. |

---

*Laporan audit ini disusun secara objektif berdasarkan pembacaan kode aktual di repositori dan siap digunakan sebagai acuan technical backlog untuk tahap perbaikan berikutnya.*
