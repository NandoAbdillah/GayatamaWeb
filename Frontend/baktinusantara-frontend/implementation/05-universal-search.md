# Implementasi Fase 5: Pencarian & Dashboard Universal (Next.js Frontend)

## Tujuan
Membangun frontend Next.js untuk dashboard pencarian KKN, peta interaktif, dan fitur universalis, terhubung ke Laravel 12 backend.

## Hubungan dengan Backend Laravel 12
| Endpoint Laravel | Method | Fungsi |
|---|---|---|
| `GET /api/pos-kebutuhan` | GET (dengan query: lat, lon, radius, jurusan, urgency) | List pos kebutuhan dengan filter |
| `GET /api/desa/{id}` | GET | Detail desa + koordinat |
| `GET /api/pos-kebutuhan/{id}` | GET | Detail pos kebutuhan |
| `GET /api/desa/riwayat/{id}` | GET | Riwayat KKN per daerah |
| `GET /api/proposal` (public) | GET | List proposal publik |
| Haversine query | SQL raw | Radius search di MySQL |
| Smart-Matching | Service | Matching score calculation |

## Fitur Frontend yang Akan Diimplementasikan

### 1. Dashboard Pencarian KKN (`app/search/page.tsx`)
- Filter panel:
  - Radius pencarian (input km atau pin lokasi)
  - Filter jurusan (dropdown multi-select)
  - Filter urgensi (Tinggi/Sedang/Rendah)
  - Filter status (open/progress/completed)
  - Filter tanggal
- Search button → fetch `GET /api/pos-kebutuhan?lat={}&lon={}&radius={}&jurusan={}&urgensi={}`
- Tampilkan hasil dalam 2 mode: daftar (list) dan peta (map)
- Sorting: jarak terdekat, tanggal posting, prioritas

### 2. Peta KKN Interaktif (`app/maps/page.tsx`)
- Peta interaktif (Leaflet.js + React-Leaflet atau Mapbox GL)
- Marker untuk setiap desa yang punya pos kebutuhan open
- Marker info: nama desa, jenis KKN yang dibutuhkan, jumlah kuota tersisa
- Click marker → popup dengan detail + link ke halaman detail pos kebutuhan
- User dapat pin lokasi sendiri → hitung radius → filter hasil di sekitar lokasi
- Tampilkan jarak ke setiap desa (dari Haversine calculation)
- Layer toggle: semua desa / hanya yang dekat / yang sudah full

### 3. Halaman Detail Pencarian (`app/search/[id]/page.tsx`)
- Detail lengkap pos kebutuhan
- Matching score untuk mahasiswa yang login (jika login & terdaftar)
- Daftar proposal yang sudah diajukan (jika perangkat desa)
- Timeline pengajuan
- Aksi sesuai role (mahasiswa: ajukan proposal; desa: lihat riwayat)

### 4. History KKN per Daerah (`app/search/history/[desaId]/page.tsx`)
- Tampilkan semua KKN yang pernah dilakukan di daerah tersebut
- Filter berdasarkan tahun
- Akses ke laporan mingguan jika tersedia dan izin diberikan
- Statistik penggunaan lahan KKN per wilayah
- Display: grafik timeline jumlah KKN per tahun (Recharts)

### 5. Katalog KKN Publik (`app/katalog/page.tsx`)
- Daftar pos kebutuhan yang sudah publish (status = 'open')
- Tampilan kartu dengan: nama desa, jenis KKN, deadline, kuota tersisa
- Filter dan sorting
- Public access (tidak perlu login untuk melihat)
- Click → detail pos kebutuhan

### 6. Dashboard Universal (Homepage) (`app/page.tsx`)
- Tampilan utama: peta + daftar pos kebutuhan terbaru
- Quick search bar (cari berdasarkan lokasi, jurusan, urgency)
- Featured KKN (priority/high urgency)
- Statistik: total pos kebutuhan open, total mahasiswa aktif, total desa aktif
- Link cepat: "Cari KKN", "Katalog", "Submit Aspirasi"

### 7. Sistem Rekomendasi (Fase Lanjutan)
- Jika user login sebagai mahasiswa:
  - Tampilkan "Rekomendasi untukmu" di dashboard
  - Berdasarkan profil (jurusan, skill, preferensi lokasi)
  - Berdasarkan riwayat partisipasi sebelumnya
  - Berdasarkan kebutuhan desa yang cocok
- Backend menghitung rekomendasi → frontend tampilkan

## Teknologi yang Digunakan
- **Map**: Leaflet.js + React-Leaflet (atau Mapbox GL JS)
- **Search**: Frontend filter + backend MySQL Haversine query
- **Charts**: Recharts untuk statistik dan history
- **UI**: shadcn/ui, Tailwind CSS
- **Geolocation**: Browser Geolocation API atau Google Maps Geocoding
- **State**: Zustand untuk filter state (complex multi-filter)
- **Auth**: Sanctum token (opsional untuk search yang ter-scope)

## Estimasi Waktu
- **3-4 minggu** untuk 1 frontend developer (mungkin 1 frontend + 1 UI/visual designer)

## Kriteria Acceptance
- Pencarian KKN berdasarkan radius lokasi bekerja dengan akurat
- Peta menampilkan marker dengan info informatif
- Filter multi-kombinasi bekerja (jurusan + radius + urgency)
- History KKN per daerah dapat diakses dengan grafik dan filter
- Katalog KKN publik menampilkan pos kebutuhan yang open
- Homepage sebagai dashboard universal dengan quick search
- Rekomendasi KKN bekerja jika user login sebagai mahasiswa