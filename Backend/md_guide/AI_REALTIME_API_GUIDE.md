# Panduan Integrasi Backend AI Real-Time API (BaktiNusantara)

Dokumentasi ini ditujukan bagi tim **Frontend Developer** dan pengembang modul **AI Agent / Smart Copilot (Aira)** untuk mengonsumsi data real-time, matching engine, serta draf otomatis dari backend Laravel.

---

## 🌐 Base URL & Autentikasi

- **Base URL**: `http://127.0.0.1:8000/api` (atau `http://localhost:8000/api`)
- **Format Payload**: `application/json`
- **Autentikasi**: Menggunakan Bearer Token (Laravel Sanctum) pada header `Authorization: Bearer <TOKEN>` untuk endpoint yang membutuhkan hak akses pengguna.

---

## 📑 Daftar Endpoint

| Method | Endpoint | Akses | Fungsi Utama |
|---|---|---|---|
| `GET` | `/api/ai/context` | **Publik** | Mengambil seluruh snapshot data platform (pos aktif, profil desa, metrik nasional, SDGs, aspirasi terkini). |
| `GET` | `/api/ai/search-desa` | **Publik** | Pencarian data desa terverifikasi lengkap dengan status pos KKN & aspirasi. |
| `POST` | `/api/ai/recommend-pos` | **Publik** | Algoritma matching score (0–100%) pencocokan keahlian & jurusan mahasiswa dengan pos desa riil + analisis & ide proker. |
| `GET` | `/api/ai/user-context` | **Auth (Sanctum)** | Data personal live pengguna (Mahasiswa: kelompok, proposal, logbook, to-do list; Perangkat Desa: aspirasi & proposal; Dosen: kelompok bimbingan & validasi). |
| `POST` | `/api/ai/draft-proposal` | **Auth (Sanctum)** | Generator draf proposal KKN terstruktur (4-minggu roadmap, target luaran, estimasi anggaran) berbasis data riil desa. |
| `POST` | `/api/ai/draft-logbook` | **Auth (Sanctum)** | Generator draf catatan logbook mingguan berstandar LPPM. |
| `GET` | `/api/universitas/metrics` | **Auth (`role:universitas`)** | Metrik & statistik KKN terisolasi khusus untuk institusi kampus yang sedang login (bukan agregat nasional). |
| `GET` | `/api/universitas/kelompok` | **Auth (`role:universitas`)** | Monitoring kelompok KKN bimbingan dosen DPL dari kampus ini. |
| `GET` | `/api/universitas/logs` | **Auth (`role:universitas`)** | Audit trail & rekam jejak aktivitas yang hanya melibatkan civitas kampus terkait. |

---

## 1. Global Context Real-Time (`GET /api/ai/context`)

Digunakan oleh AI Agent pada awal sesi atau saat menjawab pertanyaan seputar statistik, pos KKN terbuka, profil desa binaan, dan capaian SDGs nasional.

### Request
```http
GET /api/ai/context HTTP/1.1
Host: 127.0.0.1:8000
Accept: application/json
```

### Response Success (`200 OK`)
```json
{
  "success": true,
  "message": "Konteks data global platform BaktiNusantara berhasil dimuat secara real-time",
  "data": {
    "status": "success",
    "timestamp": "2026-09-17T00:10:00+07:00",
    "platform_metrics": {
      "total_desa_terbantu": 12,
      "total_umkm_terdigitalisasi": 8,
      "total_kelompok_kkn": 15,
      "total_mahasiswa_terlibat": 120,
      "total_jam_pengabdian": 4800,
      "total_pos_kebutuhan": 25,
      "status_pos_breakdown": {
        "open": 18,
        "in_progress": 5,
        "completed": 2
      },
      "kategori_breakdown": {
        "umkm": 10,
        "kesehatan": 6,
        "lingkungan": 5,
        "fasilitas": 4
      },
      "sdgs_distribution": {
        "SDG 3": 6,
        "SDG 8": 10,
        "SDG 9": 8,
        "SDG 11": 5
      }
    },
    "open_positions_count": 18,
    "open_positions": [
      {
        "id": 1,
        "judul": "Digitalisasi Katalog Produk UMKM Keripik Talas",
        "deskripsi": "Pengembangan portal e-katalog, packaging, dan foto produk UMKM lokal",
        "kategori": "umkm",
        "sdg_codes": [8, 9],
        "kuota_kelompok": 2,
        "terisi_kelompok": 1,
        "sisa_kuota": 1,
        "deadline": "2026-10-15",
        "jurusan_dibutuhkan": ["Teknik Informatika", "Desain Komunikasi Visual", "Manajemen"],
        "status": "open",
        "desa": {
          "id": 1,
          "nama_desa": "Desa Sukamaju",
          "kecamatan": "Cibungbulang",
          "kabupaten": "Bogor",
          "provinsi": "Jawa Barat",
          "latitude": -6.5890000,
          "longitude": 106.6789000,
          "kontak_resmi": "081234567890"
        },
        "aspirasi_asal": {
          "id": 1,
          "pelapor_nama": "Pak Joko",
          "urgensi": "sedang",
          "deskripsi": "Perlu bantuan website katalog produk keripik talas BUMDes"
        }
      }
    ],
    "desa_count": 10,
    "desa_profiles": [
      {
        "id": 1,
        "nama_desa": "Desa Sukamaju",
        "kecamatan": "Cibungbulang",
        "kabupaten": "Bogor",
        "provinsi": "Jawa Barat",
        "total_aspirasi": 5,
        "total_pos": 3,
        "pos_aktif": 2
      }
    ],
    "recent_aspirasi": [
      {
        "id": 1,
        "desa_nama": "Desa Sukamaju",
        "kabupaten": "Bogor",
        "kategori": "umkm",
        "urgensi": "sedang",
        "status": "terverifikasi",
        "deskripsi": "Perlu bantuan website katalog produk keripik talas BUMDes"
      }
    ],
    "recent_portofolios": [
      {
        "id": 1,
        "slug": "katalog-umkm-sukamaju",
        "judul_proker": "Digitalisasi Katalog Produk UMKM Keripik Talas",
        "desa": "Desa Sukamaju",
        "kabupaten": "Bogor",
        "kelompok": "Kelompok KKN 14 CyberDesa",
        "sertifikat_url": "certificates/cert-123.pdf",
        "published_at": "2026-09-16T12:00:00+07:00"
      }
    ]
  }
}
```

---

## 2. User Context Real-Time (`GET /api/ai/user-context`)

Mengambil data live spesifik pengguna yang sedang login. AI Copilot menggunakannya untuk memberikan rekomendasi aksi personal dan mengetahui posisi tahapan KKN mahasiswa atau perangkat desa.

### Request
```http
GET /api/ai/user-context HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer 1|abcdef123456...
Accept: application/json
```

### Response Success (`200 OK`) — Contoh Mahasiswa
```json
{
  "success": true,
  "message": "Konteks profil dan aksi pengguna berhasil dimuat secara real-time",
  "data": {
    "status": "success",
    "timestamp": "2026-09-17T00:10:00+07:00",
    "context": {
      "user": {
        "id": 5,
        "name": "Ahmad Mahasiswa",
        "email": "ahmad@unesa.ac.id",
        "phone": "089514590179",
        "role": "mahasiswa"
      },
      "role_context": {
        "profil": {
          "nim": "23051204001",
          "jurusan": "Teknik Informatika",
          "semester": 6,
          "universitas": "Universitas Negeri Surabaya",
          "is_verified": true
        },
        "kelompok": {
          "id": 2,
          "nama_kelompok": "Kelompok KKN 14 CyberDesa",
          "is_ketua": true,
          "ketua_nama": "Ahmad Mahasiswa",
          "dosen_pembimbing": {
            "id": 1,
            "nama": "Dr. Budi Santoso",
            "nip": "198001012005011001",
            "bidang_keahlian": "Teknologi Informasi & IoT"
          },
          "total_anggota": 5,
          "anggota": [
            { "user_id": 6, "nama": "Siti Nurhaliza", "jurusan": "DKV" }
          ]
        },
        "active_proposal": {
          "id": 4,
          "pos_judul": "Digitalisasi Katalog Produk UMKM Desa",
          "desa_nama": "Desa Sukamaju",
          "status": "diterima",
          "status_kelayakan_dosen": "layak",
          "has_surat_ortu": true,
          "luaran_status": null,
          "total_progress_submitted": 2
        },
        "progress_logs": [
          {
            "id": 10,
            "minggu_ke": 1,
            "persentase": 25,
            "deskripsi": "Observasi dan FGD bersama pelaku UMKM",
            "is_locked": true
          },
          {
            "id": 11,
            "minggu_ke": 2,
            "persentase": 50,
            "deskripsi": "Pembuatan antarmuka web katalog",
            "is_locked": true
          }
        ]
      },
      "todo_actions": [
        "Isi logbook progres mingguan ke-3"
      ]
    }
  }
}
```

---

## 3. Smart Pos Recommendation Engine (`POST /api/ai/recommend-pos`)

Menghitung **Matching Score (0–100%)** antara profil mahasiswa dengan pos kebutuhan KKN desa secara dinamis, lengkap dengan analisis kesesuaian dan rekomendasi ide program kerja (proker).

### Request
```http
POST /api/ai/recommend-pos HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json
Accept: application/json

{
  "student_major": "Teknik Informatika",
  "skills": ["Web Development", "UI/UX", "Database", "IoT"],
  "kategori": "umkm",
  "sdg_target": 9,
  "kabupaten": "Bogor",
  "limit": 3
}
```

### Response Success (`200 OK`)
```json
{
  "success": true,
  "message": "Rekomendasi pos kebutuhan KKN berhasil dihitung dan dicocokkan",
  "data": {
    "status": "success",
    "query_params": {
      "student_major": "Teknik Informatika",
      "skills": ["web development", "ui/ux", "database", "iot"],
      "kategori": "umkm",
      "sdg_target": 9
    },
    "total_matches": 1,
    "recommendations": [
      {
        "pos_id": 1,
        "matching_score": 96,
        "predikat": "Sangat Sesuai (Highly Recommended)",
        "judul": "Digitalisasi Katalog Produk UMKM Keripik Talas",
        "kategori": "umkm",
        "sdg_codes": [8, 9],
        "kuota_kelompok": 2,
        "terisi_kelompok": 1,
        "sisa_kuota": 1,
        "deadline": "2026-10-15",
        "desa": {
          "id": 1,
          "nama_desa": "Desa Sukamaju",
          "kecamatan": "Cibungbulang",
          "kabupaten": "Bogor",
          "provinsi": "Jawa Barat"
        },
        "alasan_kesesuaian": [
          "Kesesuaian jurusan mahasiswa sangat relevan dengan kebutuhan pos: Teknik Informatika.",
          "Keahlian Anda (database, web development) secara langsung menyelesaikan masalah prioritas di pos ini.",
          "Sektor kategori (umkm) selaras dengan preferensi pengabdian Anda.",
          "Target dampak pos langsung berkontribusi pada pencapaian SDG 9."
        ],
        "rekomendasi_proker": {
          "nama_proker": "Digitalisasi Digitalisasi Katalog Produk UMKM Keripik Talas Berbasis Web & Platform Interaktif di Desa Sukamaju",
          "tahapan_utama": [
            "Analisis kebutuhan antarmuka sistem dan struktur basis data desa",
            "Pengembangan dan pelatihan admin operator sistem di balai desa",
            "Peluncuran dan integrasi link publik untuk kemudahan akses warga"
          ]
        }
      }
    ]
  }
}
```

---

## 4. Generator Draf Proposal KKN (`POST /api/ai/draft-proposal`)

Menyusun draf proposal KKN terstruktur otomatis dengan mengambil latar belakang riil dari deskripsi pos dan keluhan aspirasi warga yang tersimpan di database MySQL.

### Request
```http
POST /api/ai/draft-proposal HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer 1|abcdef123456...
Content-Type: application/json
Accept: application/json

{
  "pos_id": 1,
  "kelompok_id": 2,
  "fokus_utama": "Digital Branding & Marketplace BUMDes"
}
```

### Response Success (`200 OK`)
```json
{
  "success": true,
  "message": "Draf proposal KKN berhasil disusun berbasis data riil desa",
  "data": {
    "status": "success",
    "pos_id": 1,
    "draft": {
      "judul_program": "Inovasi Digital Branding & Marketplace BUMDes untuk Peningkatan Digitalisasi Katalog Produk UMKM Keripik Talas di Desa Sukamaju",
      "desa_tujuan": "Desa Sukamaju, Cibungbulang, Bogor, Jawa Barat",
      "kategori_sektor": "Umkm",
      "sdg_targets": [8, 9],
      "latar_belakang": "Desa Desa Sukamaju, Bogor memiliki potensi strategis dalam sektor Umkm. Berdasarkan data aspirasi masyarakat terkini: \"Pengembangan portal e-katalog, packaging, dan foto produk UMKM lokal\". Melalui program KKN ini, mahasiswa hadir sebagai katalisator solusi berkelanjutan untuk menjawab permasalahan tersebut secara partisipatif bersama aparatur desa dan masyarakat setempat.",
      "metodologi": "Participatory Action Research (PAR) & Asset-Based Community Development (ABCD)",
      "rencana_kegiatan": [
        {
          "minggu": 1,
          "fokus": "Observasi Lapangan, Sosialisasi & Pemetaan Kebutuhan",
          "kegiatan": [
            "Sowan dan koordinasi resmi dengan Kepala Desa Desa Sukamaju beserta jajaran perangkat desa",
            "Observasi lapangan dan Focus Group Discussion (FGD) bersama tokoh masyarakat dan kelompok sasaran",
            "Penyusunan instrumen pendampingan dan finalisasi baseline data"
          ],
          "target_output": "Peta kebutuhan riil dan komitmen bersama mitra sasaran desa"
        },
        {
          "minggu": 2,
          "fokus": "Implementasi Program Inti & Pelatihan Kapasitas Warga",
          "kegiatan": [
            "Pelaksanaan workshop interaktif dan pelatihan teknis sesuai target Umkm",
            "Demonstrasi penggunaan alat/aplikasi/metode percontohan kepada masyarakat",
            "Penyaluran modul panduan dan media edukasi visual"
          ],
          "target_output": "Warga sasaran terampil mengoperasikan luaran program"
        },
        {
          "minggu": 3,
          "fokus": "Pendampingan Teknis, Uji Coba Lapangan & Evaluasi Tahap 1",
          "kegiatan": [
            "Pendampingan intensif (one-on-one mentoring) bagi kelompok binaan",
            "Uji coba efektivitas program dan perbaikan kendala teknis di lapangan",
            "Pengukuran indikator keberhasilan awal bersama DPL dan perwakilan desa"
          ],
          "target_output": "Luaran program beroperasi stabil dan minim kendala"
        },
        {
          "minggu": 4,
          "fokus": "Finalisasi Luaran, Serah Terima ke Desa & Laporan Akhir",
          "kegiatan": [
            "Penyusunan Standar Operasional Prosedur (SOP) serah kelola berkelanjutan ke pihak desa",
            "Gelar pameran hasil karya KKN / Expo mini desa",
            "Serah terima resmi produk luaran kepada Pemerintah Desa Desa Sukamaju"
          ],
          "target_output": "Berita acara serah terima luaran dan draf laporan akhir KKN"
        }
      ],
      "target_luaran": {
        "Luaran Utama": "Sistem/Produk/Panduan Digitalisasi Katalog Produk UMKM Keripik Talas yang terpasang dan siap guna",
        "Luaran Dokumentasi": "Video profil program berdurasi 3-5 menit dan modul SOP pengelolaan",
        "Luaran Akademik": "Laporan akhir KKN terstandar LPPM dan draf artikel pengabdian masyarakat"
      },
      "estimasi_anggaran": [
        { "pos": "Bahan Baku & Alat Percontohan", "estimasi_biaya": 1500000 },
        { "pos": "Sosialisasi, Workshop & Konsumsi Warga", "estimasi_biaya": 800000 },
        { "pos": "Pencetakan Modul Panduan & Banner Edukasi", "estimasi_biaya": 450000 },
        { "pos": "Operasional & Dokumentasi Lapangan", "estimasi_biaya": 400000 }
      ],
      "total_anggaran": 3150000
    }
  }
}
```

---

## 5. Generator Draf Logbook Mingguan (`POST /api/ai/draft-logbook`)

Menghasilkan draf logbook kegiatan harian mahasiswa berstandar LPPM.

### Request
```http
POST /api/ai/draft-logbook HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer 1|abcdef123456...
Content-Type: application/json
Accept: application/json

{
  "minggu_ke": 2,
  "kegiatan_utama": "Pelatihan packaging dan fotografi produk bersama 15 pengrajin keripik desa",
  "kendala": "Jadwal warga terbatas karena sedang musim panen",
  "solusi": "Pelatihan dibagi dua sesi sore dan malam hari",
  "jam_kerja": 8
}
```

### Response Success (`200 OK`)
```json
{
  "success": true,
  "message": "Draf catatan logbook berhasil disusun sesuai standar LPPM",
  "data": {
    "status": "success",
    "draft_logbook": {
      "tanggal": "2026-09-17",
      "minggu_ke": 2,
      "jam_kerja_efektif": 8,
      "kegiatan_pokok": "Pelatihan packaging dan fotografi produk bersama 15 pengrajin keripik desa",
      "kendala_lapangan": "Jadwal warga terbatas karena sedang musim panen",
      "solusi_diterapkan": "Pelatihan dibagi dua sesi sore dan malam hari",
      "output_tercapai": "Kegiatan minggu ke-2 terlaksana dengan baik sesuai rencana target luaran.",
      "estimasi_persentase_kumulatif": 50
    }
  }
}
```

---

## 6. Pencarian Desa Real-Time (`GET /api/ai/search-desa`)

Mencari desa terverifikasi berdasarkan nama desa, kecamatan, atau kabupaten.

### Request
```http
GET /api/ai/search-desa?keyword=Sukamaju&kabupaten=Bogor HTTP/1.1
Host: 127.0.0.1:8000
Accept: application/json
```

### Response Success (`200 OK`)
```json
{
  "success": true,
  "message": "Pencarian data desa berhasil diproses secara real-time",
  "data": {
    "status": "success",
    "total_found": 1,
    "data": [
      {
        "id": 1,
        "nama_desa": "Desa Sukamaju",
        "kecamatan": "Cibungbulang",
        "kabupaten": "Bogor",
        "provinsi": "Jawa Barat",
        "latitude": -6.5890000,
        "longitude": 106.6789000,
        "kontak_resmi": "081234567890",
        "total_aspirasi": 5,
        "total_pos_kebutuhan": 3,
        "pos_aktif": 2
      }
    ]
  }
}
```

---

## 7. Endpoint Khusus LPPM Kampus (`/api/universitas/*`)

Untuk memastikan **isolasi data per institusi kampus** (agar data KKN UNESA, ITB, UI, dsb. tidak saling bocor atau bercampur), gunakan endpoint terotentikasi berikut:

### 7.1 Metrik Kampus (`GET /api/universitas/metrics`)
Mengembalikan statistik kinerja KKN yang **hanya berasal dari civitas kampus tersebut**.

```http
GET /api/universitas/metrics HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer <TOKEN_LOGIN_UNIVERSITAS>
Accept: application/json
```

**Contoh Response (`200 OK`)**:
```json
{
  "message": "Statistik & metrik program KKN internal kampus berhasil dimuat",
  "data": {
    "campus_name": "Universitas Negeri Surabaya",
    "kode_univ": "UNESA-01",
    "total_dosen": 12,
    "total_mahasiswa": 150,
    "total_kelompok_kkn": 15,
    "total_desa_terbantu": 8,
    "total_jam_pengabdian": 4800,
    "total_luaran_terverifikasi": 5,
    "status_proposal_breakdown": {
      "total": 18,
      "menunggu": 2,
      "diterima": 15,
      "ditolak": 1
    },
    "sdgs_distribution": {
      "SDG 4": 5,
      "SDG 8": 8,
      "SDG 9": 4
    }
  }
}
```

### 7.2 Monitoring Kelompok Kampus (`GET /api/universitas/kelompok`)
Mengembalikan daftar kelompok mahasiswa bimbingan DPL kampus tersebut beserta status proposal, progres logbook harian, dan luaran akhir.

```http
GET /api/universitas/kelompok HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer <TOKEN_LOGIN_UNIVERSITAS>
Accept: application/json
```

### 7.3 Audit Log Aktivitas Kampus (`GET /api/universitas/logs`)
Mengembalikan rekam jejak event dan notifikasi yang hanya melibatkan DPL, mahasiswa, dan proposal dari kampus bersangkutan.

```http
GET /api/universitas/logs HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer <TOKEN_LOGIN_UNIVERSITAS>
Accept: application/json
```

---

## 8. Panduan Batasan Wewenang Peran (*Role Scope Boundaries*)

| Role | Batasan Data & Kewenangan | Catatan Menu Frontend |
|---|---|---|
| **Super Admin Platform (`admin`)** | - Skala **Nasional** lintas seluruh kampus & desa.<br>- Verifikasi SK Desa, KTM Mahasiswa, dan Perguruan Tinggi.<br>- Analitika SDG Agregat Nasional & Sebaran Peta KKN Nasional. | Menu *"Audit Trail & Sistem"* dihapus dari Super Admin karena berisi event bisnis per-kampus. |
| **LPPM Kampus (`universitas`)** | - Skala **Internal Institusi Kampus Sendiri**.<br>- Kelola akun DPL kampus.<br>- Tinjau laporan supervisi dosen pembimbing.<br>- Akses metrik dan monitoring kelompok bimbingan kampusnya sendiri (`/api/universitas/*`). | Menu *"Statistik SDG"* dan *"Monitoring"* dihapus dari sidebar LPPM untuk mencegah kebocoran data agregat nasional lintas kampus. |
| **Dosen Pembimbing (`dosen`)** | - Skala **Kelompok Mahasiswa Binaan Sendiri**.<br>- Validasi kelayakan proposal & review progres logbook harian. | Hanya dapat mengakses data proposal kelompok yang dibimbingnya. |
| **Perangkat Desa (`perangkat_desa`)** | - Skala **Desa Binaan Sendiri**.<br>- Kelola pos kebutuhan, persetujuan proposal masuk, verifikasi luaran akhir. | Hanya dapat melihat proposal & luaran yang ditujukan ke desanya. |
| **Mahasiswa (`mahasiswa`)** | - Skala **Kelompok KKN Sendiri**.<br>- Pendaftaran pos, pengajuan proposal, logbook harian, upload izin ortu, luaran. | Terisolasi per kelompok KKN. |

---

## 💡 Contoh Implementasi Helper di Frontend (TypeScript / Next.js)

Berikut contoh fungsi fetcher yang siap dihubungkan langsung ke `Frontend/baktinusantara-frontend/lib/ai-agent-tools.ts`:

```typescript
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// 1. Fetch Global Real-Time Context
export async function fetchLiveAiContext() {
  const res = await fetch(`${BACKEND_API_URL}/ai/context`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 }, // Cache 60 detik
  });
  if (!res.ok) throw new Error('Gagal mengambil konteks live platform');
  const json = await res.json();
  return json.data;
}

// 2. Fetch Personalized User Context (with Bearer Token)
export async function fetchLiveUserContext(token: string) {
  const res = await fetch(`${BACKEND_API_URL}/ai/user-context`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Gagal mengambil konteks pengguna');
  const json = await res.json();
  return json.data.context;
}

// 3. Compute Smart Position Recommendation
export async function fetchLivePosRecommendations(params: {
  student_major?: string;
  skills?: string[];
  kategori?: string;
  sdg_target?: number;
  kabupaten?: string;
}) {
  const res = await fetch(`${BACKEND_API_URL}/ai/recommend-pos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Gagal menghitung rekomendasi pos KKN');
  const json = await res.json();
  return json.data.recommendations;
}
```
