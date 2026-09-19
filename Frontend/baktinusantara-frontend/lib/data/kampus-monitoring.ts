export type LogbookMinggu = {
  minggu: number;
  status: "Tuntas" | "Kendala" | "Belum Mulai";
  tanggal?: string;
  catatan?: string;
};

export interface GroupMonitoringItem {
  id: string;
  nama: string;
  universitas: string;
  desa: string;
  jarak_km: number;
  izin_ortu: string;
  dpl: string;
  anggota_count: number;
  anggota_nama?: string[];
  jam_kerja: string;
  progres_pct: number;
  logbook_status: string;
  logbook_minggu: number; // 0-4, minggu terakhir tuntas
  logbook_detail: LogbookMinggu[];
  gps_valid: boolean;
  alert: string | null;
  projek: string;
  projek_deskripsi: string;
  projek_kategori: string;
}

export function getStatusLabel(item: GroupMonitoringItem): "Selesai" | "Berjalan" {
  return item.progres_pct >= 100 ? "Selesai" : "Berjalan";
}

export const SEEDED_MONITORING_GROUPS: GroupMonitoringItem[] = [
  {
    id: "kelompok-1",
    nama: "KKN UNESA 01 - Sukamaju Digital",
    universitas: "Universitas Negeri Surabaya (UNESA)",
    desa: "Desa Sukamaju, Mojowarno, Jombang",
    jarak_km: 15.5,
    izin_ortu: "Radius Standar (<1000 km)",
    dpl: "Dr. Budi Santoso, M.Kom.",
    anggota_count: 3,
    anggota_nama: ["Ahmad Fauzi", "Siti Nurhaliza", "Budi Prasetyo"],
    jam_kerja: "160 / 160 Jam",
    progres_pct: 100,
    logbook_status: "Tuntas Minggu 4",
    logbook_minggu: 4,
    logbook_detail: [
      { minggu: 1, status: "Tuntas", tanggal: "05 Agu 2026", catatan: "Observasi desa & pemetaan UMKM" },
      { minggu: 2, status: "Tuntas", tanggal: "12 Agu 2026", catatan: "Pelatihan digitalisasi produk" },
      { minggu: 3, status: "Tuntas", tanggal: "19 Agu 2026", catatan: "Pembuatan marketplace desa" },
      { minggu: 4, status: "Tuntas", tanggal: "26 Agu 2026", catatan: "Evaluasi & BAST dengan perangkat desa" },
    ],
    gps_valid: true,
    alert: null,
    projek: "Digitalisasi UMKM & Marketplace Desa",
    projek_deskripsi:
      "Rebranding produk olahan singkong, pembuatan katalog digital, dan pendampingan onboarding ke Tokopedia & Shopee Desa.",
    projek_kategori: "Pemberdayaan UMKM",
  },
  {
    id: "kelompok-2",
    nama: "KKN UNESA 02 - Edukasi Cempaka",
    universitas: "Universitas Negeri Surabaya (UNESA)",
    desa: "Desa Cempaka Putih, Pacet, Mojokerto",
    jarak_km: 28.3,
    izin_ortu: "Radius Standar (<1000 km)",
    dpl: "Dr. Retno Wulandari, M.Pd.",
    anggota_count: 1,
    anggota_nama: ["Dewi Lestari"],
    jam_kerja: "0 / 160 Jam",
    progres_pct: 0,
    logbook_status: "Kendala Minggu 1",
    logbook_minggu: 0,
    logbook_detail: [
      { minggu: 1, status: "Kendala", catatan: "Menunggu persetujuan proposal dari pihak desa" },
      { minggu: 2, status: "Belum Mulai" },
      { minggu: 3, status: "Belum Mulai" },
      { minggu: 4, status: "Belum Mulai" },
    ],
    gps_valid: true,
    alert: "Menunggu persetujuan proposal dari pihak desa",
    projek: "Literasi Digital & Edukasi Anak Desa",
    projek_deskripsi:
      "Program bimbingan belajar, perpustakaan mini, dan kelas literasi digital untuk siswa SD Desa Cempaka Putih.",
    projek_kategori: "Pendidikan",
  },
  {
    id: "kelompok-3",
    nama: "KKN UNESA 03 - Harapan Sejahtera",
    universitas: "Universitas Negeri Surabaya (UNESA)",
    desa: "Desa Jatirowo, Dawarblandong, Mojokerto",
    jarak_km: 42.0,
    izin_ortu: "Radius Standar (<1000 km)",
    dpl: "Dr. Siti Aminah, M.Pd.",
    anggota_count: 4,
    anggota_nama: ["Rina Marlina", "Joko Widodo", "Ani Yudhoyono", "Farhan Hakim"],
    jam_kerja: "120 / 160 Jam",
    progres_pct: 75,
    logbook_status: "Tuntas Minggu 3",
    logbook_minggu: 3,
    logbook_detail: [
      { minggu: 1, status: "Tuntas", tanggal: "05 Agu 2026", catatan: "Sosialisasi PHBS & posyandu" },
      { minggu: 2, status: "Tuntas", tanggal: "12 Agu 2026", catatan: "Penyuluhan stunting & gizi" },
      { minggu: 3, status: "Tuntas", tanggal: "19 Agu 2026", catatan: "Senam sehat & cek kesehatan gratis" },
      { minggu: 4, status: "Belum Mulai", catatan: "Persiapan laporan akhir & luaran" },
    ],
    gps_valid: true,
    alert: null,
    projek: "PHBS & Pencegahan Stunting",
    projek_deskripsi:
      "Edukasi perilaku hidup bersih sehat, pendampingan posyandu, dan kampanye gizi seimbang untuk ibu & balita.",
    projek_kategori: "Kesehatan",
  },
  {
    id: "kelompok-4",
    nama: "KKN UNESA 04 - Asri Lestari",
    universitas: "Universitas Negeri Surabaya (UNESA)",
    desa: "Desa Sumber Glagah, Pacet, Mojokerto",
    jarak_km: 18.9,
    izin_ortu: "Radius Standar (<1000 km)",
    dpl: "Prof. Hendra Wijaya, M.Si.",
    anggota_count: 2,
    anggota_nama: ["Putri Ayu", "Rizky Febian"],
    jam_kerja: "40 / 160 Jam",
    progres_pct: 25,
    logbook_status: "Kendala Minggu 2",
    logbook_minggu: 1,
    logbook_detail: [
      { minggu: 1, status: "Tuntas", tanggal: "05 Agu 2026", catatan: "Pemetaan titik sampah & bank sampah" },
      { minggu: 2, status: "Kendala", catatan: "Logbook minggu 2 belum diunggah, menunggu bimbingan DPL" },
      { minggu: 3, status: "Belum Mulai" },
      { minggu: 4, status: "Belum Mulai" },
    ],
    gps_valid: true,
    alert: "Logbook minggu 2 belum diunggah, menunggu bimbingan DPL",
    projek: "Bank Sampah & Lingkungan Asri",
    projek_deskripsi:
      "Pembuatan sistem bank sampah dusun, edukasi pemilahan sampah, dan penghijauan area fasilitas umum.",
    projek_kategori: "Lingkungan",
  },
];
