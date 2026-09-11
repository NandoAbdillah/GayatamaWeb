# Fitur KKN Management System — Organized by Development Phases

**System Architecture**: Next.js 14 (Frontend) + Laravel 12 + MySQL (Backend)  
**Auth**: Laravel Sanctum (token-based SPA authentication)  
**Last Updated**: September 2026

## Fase 1: Autentikasi dan Manajemen Pengguna Dasar
- Verifikasi akun via email untuk semua jenis pengguna (mahasiswa, desa, admin)
- Pembuatan dan validasi profil pengguna dasar (registrasi per role dengan upload dokumen: KTM, SK, surat)
- Sistem login/logout yang aman menggunakan Laravel Sanctum token
- Frontend: Next.js AuthContext, middleware.ts route protection, Axios interceptor untuk Sanctum token

## Fase 2: Pengajuan dan Persetujuan KKN Dasar
- Form pengajuan aspirasi KKN dari masyarakat (public, tanpa login)
- Sistem verify aspirasi oleh Perangkat Desa → publish pos kebutuhan
- Form pengajuan proposal oleh mahasiswa (dengan matching score, jarak, dan surat izin otomatis)
- Sistem approve/reject proposal oleh desa dan validasi kelayakan oleh dosen
- Deadline otomatis untuk proposal dan progres
- Notifikasi WhatsApp otomatis (via backend queue)
- Frontend: Halaman aspirasi publik, dashboard desa untuk verify, dashboard mahasiswa untuk proposal

## Fase 3: Manajemen Mahasiswa dan Kelompok
- Pembentukan kelompok KKN (mahasiswa bisa membuat/join sebagai ketua)
- Validasi bahwa satu mahasiswa hanya bisa bergabung dengan satu kelompok
- Pengisian data diri mahasiswa (angkatan, jurusan, dll)
- Trigger surat izin berdasarkan jarak dari universitas ke lokasi KKN (via Haversine)
- Update/progres mingguan KKN dengan sistem double-confirm dan lock
- Status approval/reject progres mingguan
- Tampilan sisa waktu KKN dan countdown
- Upload luaran akhir → verifikasi desa → auto-generate portofolio & sertifikat
- Frontend: Group management, proposal form, progress upload, portfolio pages

## Fase 4: Manajemen Desa dan Periode KKN
- Riwayat KKN desa (lihat sejarah KKN yang telah dilakukan)
- Sistem surat tugas/cap digital dari desa untuk mahasiswa (generate PDF via DomPDF)
- Monitoring kinerja mahasiswa dari perspektif desa (dashboard agregat)
- Kalender jadwal KKN
- Verifikasi cap perangkat desa oleh admin platform
- Frontend: Desa dashboard, surat tugas generator, monitoring pages

## Fase 5: Fitur Universalis dan Pencarian
- Dashboard untuk mencari peluang KKN berdasarkan radius, jurusan, dan urgensi
- Peta KKN interaktif (Leaflet.js + React-Leaflet) yang menunjukkan lokasi desa
- Fitur pencarian KKN dengan berbagai filter dan sorting
- History KKN dari sebuah daerah dengan laporan mingguan dan grafik
- Katalog KKN publik (pos kebutuhan yang open)
- Homepage sebagai dashboard universal dengan quick search
- Sistem rekomendasi KKN personalisasi (jika user login sebagai mahasiswa)
- Frontend: Search page, maps page, detail pages, homepage dashboard

## Fase 6: Manajemen Administrasi dan Universitas
- Validasi kelayakan KKN (surat dokumen dan persyaratan)
- Monitoring kelompok KKN dan progresnya dari pihak universitas
- Approval konversi KKN ke dalam SKS (dengan surat rekomendasi PDF)
- Pengecekan laporan mingguan dari tiap kelompok KKN
- Manajemen dosen (tambah, nonaktifkan, filter)
- Tinjau laporan dosen dari desa
- Frontend: Admin dashboard, dosen management, SKS approval, monitoring

## Fase 7: Fitur Lanjutan dan Keamanan
- Klaim surat/portofolio setelah KKN selesai (download PDF sertifikat)
- Portofolio digital publik dengan QR code verifikasi keaslian
- Sistem pengingat untuk selalu mengisi progres (progressive notification: 1 hari, besok, 2 hari lagi)
- Validasi KTM + selfie untuk mencegah pencurian identitas
- Monitoring lokasi KKN via GPS browser dengan fallback manual (kode verifikasi WA)
- Anti-manipulasi laporan progres (lock + digital signature + audit trail)
- Sistem penanganan mahasiswa yang berhenti tengah jalan
- Manajemen slot KKN oleh desa dengan mekanisme pencegahan penyalahgunaan
- Frontend: Portfolio pages, verification pages, notification system, GPS verification

## Fase 8: Analisis, Laporan dan Pertimbangan Etis
- Analisis performa KKN dan dampak nyata dari aktivitas KKN (Recharts dashboard)
- Deteksi loophole dalam sistem approval/reject (mencegah manipulasi)
- Pertimbangan keamanan berbagi lokasi dan foto aktivitas KKN (privacy settings)
- Sistem slot KKN yang bisa diatur oleh desa dengan mekanisme pencegahan penyalahgunaan
- Validasi pembuatan laporan mingguan untuk mencegah manipulasi oleh ketua kelompok
- Sinkronisasi waktu sistem dengan waktu lapangan KKN
- Survei kepuasan masyarakat (link survei via WA)
- Mekanisme umpan balik berkelanjutan dari semua stakeholder
- Pedoman etika, dokumentasi terbuka, dan pelatihan untuk daerah terpencil
- Frontend: Analytics dashboard, feedback system, documentation pages, survey pages

## Catatan dan Pertanyaan Terbuka (Untuk Diskusi Selanjutnya)
- Apakah perlu sistem rating/ulasan bagi KKN yang diterima desa?
- Bagaimana mekanisme penanganan jika ada konflik antar stakeholder?
- Apakah perlu integrasi dengan sistem pembayaran untuk transaksi apapun?
- Bagaimana menjamin kualitas kontribusi mahasiswa bukan hanya administratif?
- Sistem apakah harus mendukung mode offline untuk area dengan konektivitas terbatas?

## Teknologi yang Digunakan
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Hook Form + Zod, Axios, Leaflet.js, Recharts, date-fns, Sonner
- **Backend**: Laravel 12, MySQL 8.0+, Laravel Sanctum, DomPDF, Fonnte/Wablas (WA)
- **Deployment**: Vercel (frontend), Shared hosting/VPS (backend)