# Monitoring KKN — Kampus (LPPM Unesa) — API & Database Spec

Dokumen ini menjelaskan cara mengganti data statis `SEEDED_MONITORING_GROUPS` di `app/kampus/monitoring/page.tsx:43-104` agar ditarik live dari database Laravel.

---

## 1. Ringkasan Halaman Saat Ini

**File:** `app/kampus/monitoring/page.tsx`

**Role akses:** `universitas` (LPPM Unesa, `unesa@unesa.ac.id`). Halaman memonitor kelompok binaan universitas sendiri, bukan semua kampus.

**Interface saat ini:**

```ts
// app/kampus/monitoring/page.tsx:27-41
interface GroupMonitoringItem {
  id: string;              // kelompok.id
  nama: string;            // kelompok.nama_kelompok
  universitas: string;     // profil_universitas.nama_universitas (via ketua)
  desa: string;            // profil_desa.nama_desa (via proposal.pos_kebutuhan.desa)
  jarak_km: number;        // proposal.jarak_km
  izin_ortu: string;       // surat_izin_ortu.file_url / required
  dpl: string;             // profil_dosen.user.name
  anggota_count: number;   // count anggota_kelompok
  jam_kerja: string;       // "160 / 160 Jam" (derived)
  progres_pct: number;     // progress_mingguan max persentase
  logbook_status: string;  // "Tuntas Minggu 4" | "Kendala Minggu 2"
  gps_valid: boolean;      // flag validasi GPS
  alert: string | null;    // catatan pengawasan
}
```

**Behavior UI yang sudah ada:**
- Search by `nama | desa | universitas | dpl` (`page.tsx:112-121`)
- Filter `all | alert (alert !== null) | ok (alert === null)` (`page.tsx:118-121`)
- Tabel 7 kolom: Kelompok, Desa Mitra, DPL, Akumulasi Jam (tanpa `%`), Status Logbook (hanya `Tuntas`/`Kendala`), Izin Ortu (`jarak_km km`), Aksi detail (`Eye`) (`page.tsx:206-273`)
- Kartu filter menampilkan count dinamis (`page.tsx:188-201`)

---

## 2. Endpoint API yang Diusulkan

Ikuti konvensi proyek di `Backend/FRONTEND_INTEGRATION_GUIDE.md` dan `routes/api.php`.

### 2.1 Base & Auth

```
Base URL: http://127.0.0.1:8000/api
Headers:  Accept: application/json
          Authorization: Bearer <sanctum_token>  // dari POST /api/login
```

Gunakan `lib/api-client.ts` (`apiClient`) yang sudah inject token otomatis (`lib/api-client.ts:23-41`).

### 2.2 Endpoint Baru (Rekomendasi)

Tambahkan di `routes/api.php` dalam group `role:universitas` (sejajar `GET /universitas/dosen` di `routes/api.php:77-82`):

```php
Route::middleware(['auth:sanctum', 'role:universitas'])->group(function () {
    // ... existing
    Route::get('/universitas/monitoring', [UniversitasController::class, 'monitoring']);
    Route::get('/universitas/monitoring/{kelompok}', [UniversitasController::class, 'monitoringDetail']);
});
```

**Alternatif naming** jika ingin namespace `kampus` agar selaras dengan folder frontend `app/kampus`:

```
GET /api/kampus/monitoring
GET /api/kampus/monitoring/{kelompok}
```

Pilih salah satu, jangan duplikat. Rekomendasi: **`GET /api/universitas/monitoring`** agar konsisten dengan `profil_universitas`.

### 2.3 Spec `GET /api/universitas/monitoring`

**Query params (opsional, untuk server-side filtering):**

| Param | Tipe | Contoh | Keterangan |
|-------|------|--------|------------|
| `search` | string | `?search=sukamaju` | Cari `nama_kelompok`, `nama_desa`, `nama_dpl` (ILIKE) |
| `status` | enum | `?status=alert` / `ok` / `all` | `alert` = punya `alert`/`kendala`, `ok` = normal |
| `logbook` | enum | `?logbook=tuntas` / `kendala` | Filter `Tuntas` vs `Kendala` |
| `page` | int | `?page=1` | Pagination |
| `per_page` | int | `?per_page=10` | Default 10 / 20 |

**Contoh Request Frontend:**

```ts
import apiClient from "@/lib/api-client";

const res = await apiClient.get("/universitas/monitoring", {
  params: { search, status: filterStatus, per_page: 20 }
});
// res.data.data = GroupMonitoringItem[]
```

**Response Success `200 OK` (standar `FRONTEND_INTEGRATION_GUIDE.md:26-32`):**

```json
{
  "message": "Data monitoring kelompok KKN berhasil dimuat.",
  "data": [
    {
      "id": "kelompok-1",
      "nama": "KKN UNESA 01 - Sukamaju Digital",
      "universitas": "Universitas Negeri Surabaya (UNESA)",
      "desa": "Desa Sukamaju, Mojowarno, Jombang",
      "jarak_km": 15.5,
      "izin_ortu": "Radius Standar (<1000 km)",
      "izin_ortu_file_url": null,
      "izin_ortu_required": false,
      "dpl": "Dr. Budi Santoso, M.Kom.",
      "dpl_id": 1,
      "anggota_count": 3,
      "jam_kerja": "160 / 160 Jam",
      "jam_kerja_tercapai": 160,
      "jam_kerja_target": 160,
      "progres_pct": 100,
      "logbook_status": "Tuntas Minggu 4",
      "gps_valid": true,
      "alert": null,
      "proposal_id": 1,
      "proposal_status": "diterima"
    },
    {
      "id": "kelompok-4",
      "nama": "KKN UNESA 04 - Asri Lestari",
      "universitas": "Universitas Negeri Surabaya (UNESA)",
      "desa": "Desa Sumber Glagah, Pacet, Mojokerto",
      "jarak_km": 18.9,
      "izin_ortu": "Radius Standar (<1000 km)",
      "dpl": "Prof. Hendra Wijaya, M.Si.",
      "anggota_count": 2,
      "jam_kerja": "40 / 160 Jam",
      "progres_pct": 25,
      "logbook_status": "Kendala Minggu 2",
      "gps_valid": true,
      "alert": "Logbook minggu 2 belum diunggah, menunggu bimbingan DPL"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 4,
    "total_alert": 2,
    "total_ok": 2
  }
}
```

**Response Pagination (opsional Laravel `paginate()`):**

```json
{
  "message": "Data monitoring kelompok KKN berhasil dimuat.",
  "data": [ ... ],
  "links": { "first": "...", "last": "...", "prev": null, "next": null },
  "meta": { "current_page": 1, "last_page": 1, "per_page": 10, "total": 4 }
}
```

### 2.4 Spec `GET /api/universitas/monitoring/{kelompok}` (Detail Modal)

Untuk modal `selectedGroup` di `page.tsx:275-361`. Kembalikan detail lengkap 1 kelompok:

```http
GET /api/universitas/monitoring/1
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Detail kelompok berhasil dimuat.",
  "data": {
    "id": 1,
    "nama": "KKN UNESA 01 - Sukamaju Digital",
    "universitas": "Universitas Negeri Surabaya (UNESA)",
    "desa": "Desa Sukamaju, Mojowarno, Jombang",
    "jarak_km": 15.5,
    "dpl": "Dr. Budi Santoso, M.Kom.",
    "anggota": [
      { "id": 5, "name": "Ahmad Fauzi", "nim": "23051204099", "peran": "ketua" },
      { "id": 6, "name": "Siti Aminah", "nim": "...", "peran": "anggota" }
    ],
    "anggota_count": 3,
    "jam_kerja": "160 / 160 Jam",
    "progres_pct": 100,
    "logbook_status": "Tuntas Minggu 4",
    "timeline_progress": [
      { "minggu_ke": 1, "persentase": 25, "deskripsi": "...", "foto_url": "..." },
      { "minggu_ke": 4, "persentase": 100, "deskripsi": "..." }
    ],
    "alert": null
  }
}
```

### 2.5 Endpoint Opsional `POST /api/notifikasi` untuk Tombol Kirim Notifikasi

Tombol `Kirim Notifikasi` (`page.tsx:141-153`) saat ini `toast.success` dummy. Jika ingin real:

```http
POST /api/universitas/monitoring/notify
Authorization: Bearer <token>
Content-Type: application/json

{
  "target": "all",
  "message": "Mohon segera lengkapi logbook minggu berjalan."
}
```

Backend buat entri `notifikasi` untuk setiap `ketua_id` kelompok.

---

## 3. Tabel Database yang Diperlukan

Semua tabel sudah ada di `database/migrations` kecuali 2 field tambahan untuk `jam_kerja`/`gps_valid` (lihat §3.2).

### 3.1 Tabel Eksisting & Pemetaan Field

| Tabel (migration) | Kolom Penting | Relasi ke Monitoring |
|-------------------|---------------|----------------------|
| `users` (`0001_01_01_000000_create_users_table.php`) | `id, name, email, role` | `kelompok.ketua_id → users`, `profil_dosen.user_id → users` |
| `profil_universitas` (`2026_09_03_092454_create_profil_universitas_table.php`) | `id, nama_universitas, kode_univ` | Filter `WHERE universitas_id = auth()->user()->profilUniversitas->id` — hanya kelompok binaan UNESA. `universitas` di response diambil dari sini. |
| `profil_mahasiswa` (`2026_09_03_092456_create_profil_mahasiswa_table.php`) | `user_id, universitas_id, nim, jurusan` | Join `users → profil_mahasiswa` untuk tentukan universitas ketua. |
| `profil_desa` (`2026_09_03_092456_create_profil_desa_table.php`) | `nama_desa, kecamatan, kabupaten, provinsi, latitude, longitude` | Via `pos_kebutuhan.desa_id → profil_desa`. Field `desa` di UI = `nama_desa + kecamatan + kabupaten`. |
| `profil_dosen` (`2026_09_03_092455_create_profil_dosen_table.php`) | `user_id, universitas_id, nip` | `kelompok.dosen_id → profil_dosen`. Field `dpl` = `users.name` dari `profil_dosen.user`. |
| `kelompok` (`2026_09_03_092457_create_kelompok_table.php`) | `id, nama_kelompok, ketua_id, dosen_id, status` | Tabel utama. `id` → `GroupMonitoringItem.id` (prefix `kelompok-` opsional). |
| `anggota_kelompok` (`2026_09_03_092458_create_anggota_kelompok_table.php`) | `kelompok_id, user_id` | `anggota_count = COUNT(*)` per kelompok. |
| `pos_kebutuhan` (`2026_09_03_092459_create_pos_kebutuhan_table.php`) | `desa_id, judul, kategori` | Join untuk dapat `profil_desa` & validasi. |
| `proposal` (`2026_09_03_092501_create_proposal_table.php` + `2026_09_08_000001_add_dosen_review...`) | `kelompok_id, pos_kebutuhan_id, jarak_km, matching_score, status, status_kelayakan_dosen, catatan_dosen, catatan_desa` | `jarak_km` → kolom `Izin Ortu (>1000km)`. `status` untuk filter. |
| `surat_izin_ortu` (`2026_09_03_092501_create_surat_izin_ortu_table.php`) | `proposal_id, file_url, required, uploaded_at` | Jika `jarak_km > 1000` maka `required=true`. `izin_ortu` di UI = `required ? file_url ? "Lengkap" : "Belum unggah" : "Radius Standar"`. |
| `progress_mingguan` (`2026_09_03_092502_create_progress_mingguan_table.php`) | `proposal_id, minggu_ke, persentase, deskripsi, foto_url` | Sumber `logbook_status` & `progres_pct`. `logbook_status = Tuntas Minggu {max minggu_ke where persentase >= threshold} else Kendala Minggu {next minggu}`. `progres_pct = MAX(persentase)`. `jam_kerja` = `progres_pct * 160 /100` (lihat §3.2). |
| `luaran_akhir` (`2026_09_03_092502_create_luaran_akhir_table.php`) | `proposal_id, file_deliverable, status` | Tidak tampil di tabel monitoring tapi dipakai modal `Progres Siklus`. |
| `notifikasi` (`2026_09_03_092504_create_notifikasi_table.php`) | `user_id, judul, pesan` | Untuk fitur `Kirim Notifikasi`. |

### 3.2 Field yang Belum Ada (Rekomendasi Tambahan)

| Field UI | Status di DB | Opsi Solusi |
|----------|--------------|-------------|
| `jam_kerja` ("160 / 160 Jam") | **Tidak ada kolom jam** di `progress_mingguan`/`proposal`. | **Opsi A (computed):** `jam_tercapai = progres_pct * 160 / 100`, `jam_target = 160` (konstanta KKN). **Opsi B (kolom baru):** Tambah `jam_kerja_tercapai INT` di `proposal` jika ada tracking absensi harian. Rekomendasi awal pakai **computed** tanpa migrasi baru. |
| `gps_valid` | Tidak ada kolom GPS validasi di `proposal`/`progress_mingguan`. | Tambah migrasi: `proposal.gps_valid BOOLEAN DEFAULT true`. Jika belum perlu, hardcode `true` di API resource sementara. |
| `alert` | Tidak ada kolom `alert` eksplisit. | **Derived:** Jika `proposal.status='menunggu'` → `alert="Menunggu persetujuan..."`, jika `progress_mingguan` minggu terakhir `persentase < expected` → `alert="Logbook minggu X belum diunggah"`. Bisa juga tambah `kelompok.alert_text TEXT NULLABLE` jika ingin alert manual. |
| `progres_pct` | Ada `progress_mingguan.persentase` | Ambil `MAX(persentase)` per `proposal_id`. Jika belum ada progress, `0`. |

**Migrasi contoh jika ingin persist `alert` & `gps_valid`:**

```php
// database/migrations/2026_09_17_add_monitoring_fields.php
Schema::table('proposal', function (Blueprint $table) {
    $table->boolean('gps_valid')->default(true)->after('jarak_km');
    $table->text('alert')->nullable()->after('catatan_desa');
    $table->unsignedSmallInteger('jam_target')->default(160)->after('jarak_km');
});
```

### 3.3 Relasi Query (Eloquent / SQL)

**Eloquent sketch untuk Controller:**

```php
// app/Http/Controllers/UniversitasController.php
public function monitoring(Request $request)
{
    $univId = auth()->user()->profilUniversitas->id;

    $query = Kelompok::with([
        'ketua.profilMahasiswa',
        'dosen.user',
        'proposal.posKebutuhan.desa',
        'proposal.suratIzinOrtu',
        'proposal.progressMingguan'
    ])
    ->whereHas('ketua.profilMahasiswa', fn($q) => $q->where('universitas_id', $univId));

    if ($search = $request->query('search')) {
        $query->where(function($q) use ($search) {
            $q->where('nama_kelompok', 'like', "%{$search}%")
              ->orWhereHas('proposal.posKebutuhan.desa', fn($qq) => $qq->where('nama_desa','like',"%{$search}%"))
              ->orWhereHas('dosen.user', fn($qq) => $qq->where('name','like',"%{$search}%"));
        });
    }

    return MonitoringResource::collection($query->paginate($request->get('per_page', 10)));
}
```

**SQL mentah setara:**

```sql
SELECT
  k.id,
  k.nama_kelompok AS nama,
  pu.nama_universitas AS universitas,
  CONCAT(pd.nama_desa, ', ', pd.kecamatan, ', ', pd.kabupaten) AS desa,
  p.jarak_km,
  s.file_url AS izin_ortu_file,
  s.required AS izin_ortu_required,
  u_dosen.name AS dpl,
  (SELECT COUNT(*) FROM anggota_kelompok ak WHERE ak.kelompok_id = k.id) AS anggota_count,
  COALESCE((SELECT MAX(pm.persentase) FROM progress_mingguan pm WHERE pm.proposal_id = p.id), 0) AS progres_pct
FROM kelompok k
JOIN users u_ketua ON u_ketua.id = k.ketua_id
JOIN profil_mahasiswa pmhs ON pmhs.user_id = u_ketua.id
JOIN profil_universitas pu ON pu.id = pmhs.universitas_id
LEFT JOIN profil_dosen pdos ON pdos.id = k.dosen_id
LEFT JOIN users u_dosen ON u_dosen.id = pdos.user_id
LEFT JOIN proposal p ON p.kelompok_id = k.id
LEFT JOIN pos_kebutuhan pk ON pk.id = p.pos_kebutuhan_id
LEFT JOIN profil_desa pd ON pd.id = pk.desa_id
LEFT JOIN surat_izin_ortu s ON s.proposal_id = p.id
WHERE pmhs.universitas_id = :authUnivId
GROUP BY k.id;
```

---

## 4. Integrasi Frontend (Ganti `SEEDED_MONITORING_GROUPS`)

```tsx
// app/kampus/monitoring/page.tsx
"use client";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";

export default function AdminMonitoringPage() {
  const [groups, setGroups] = useState<GroupMonitoringItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/universitas/monitoring")
      .then(res => setGroups(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const filteredGroups = groups.filter(/* ... sama page.tsx:112-121 */);
}
```

Hapus `const SEEDED_MONITORING_GROUPS` setelah API ready. Selama dev, bisa keep sebagai fallback:

```ts
const displayGroups = groups.length ? groups : SEEDED_MONITORING_GROUPS;
```

Pastikan `.env` punya:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## 5. Checklist Backend

- [ ] Buat `app/Http/Resources/MonitoringResource.php` untuk mapping field
- [ ] Tambah method `monitoring()` & `monitoringDetail()` di `UniversitasController`
- [ ] Daftarkan route `GET /universitas/monitoring` di `routes/api.php:77-82` (role `universitas`)
- [ ] (Opsional) `php artisan make:migration add_monitoring_fields_to_proposal_table`
- [ ] Seed 4 kelompok UNESA untuk LPPM UNESA
- [ ] `php artisan migrate:fresh --seed` (lihat `Backend/FRONTEND_INTEGRATION_GUIDE.md:501-506`)

---

*File ini sejajar dengan `page.tsx` agar frontend engineer bisa langsung mapping `GroupMonitoringItem` ke API & tabel tanpa menebak kolom.*
