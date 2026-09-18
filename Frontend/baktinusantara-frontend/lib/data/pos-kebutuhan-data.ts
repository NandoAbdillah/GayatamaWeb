export interface PosKebutuhanItem {
  id: number;
  judul: string;
  desa_id: number;
  deskripsi: string;
  kategori: string;
  sdg_codes?: number[];
  kuota_kelompok: number;
  deadline?: string;
  jurusan_dibutuhkan?: Record<string, number>;
  status: 'open' | 'in_progress' | 'completed';
  desa?: {
    id: number;
    nama_desa: string;
    kecamatan?: string;
    kabupaten?: string;
    provinsi?: string;
    kontak_resmi?: string;
    latitude?: number;
    longitude?: number;
  };
}

export const FALLBACK_POS_DATA: PosKebutuhanItem[] = [
  {
    id: 1,
    judul: 'Digitalisasi Branding dan E-Commerce UMKM Kripik Singkong',
    desa_id: 1,
    deskripsi:
      'Pengembangan identitas visual merek kemasan modern, pendaftaran marketplace (Shopee/Tokopedia), dan pelatihan pembukuan keuangan digital untuk 15 pelaku UMKM.',
    kategori: 'umkm',
    sdg_codes: [8, 9],
    kuota_kelompok: 1,
    deadline: '2026-10-30',
    jurusan_dibutuhkan: {
      'Teknik Informatika': 1,
      'Desain Komunikasi Visual': 1,
      Manajemen: 1,
    },
    status: 'in_progress',
    desa: {
      id: 1,
      nama_desa: 'Desa Sukamaju',
      kecamatan: 'Mojowarno',
      kabupaten: 'Kabupaten Jombang',
      provinsi: 'Jawa Timur',
      kontak_resmi: '081234567201',
    },
  },
  {
    id: 2,
    judul: 'Pemetaan Sistem Pengolahan Sampah Organik dan Biogas',
    desa_id: 2,
    deskripsi:
      'Perancangan instalasi prototipe biogas dari limbah kotoran ternak dan penyuluhan manajemen sampah ramah lingkungan.',
    kategori: 'lingkungan',
    sdg_codes: [13, 15],
    kuota_kelompok: 1,
    deadline: '2026-11-15',
    jurusan_dibutuhkan: {
      'Teknik Lingkungan': 1,
      'Sistem Informasi': 1,
    },
    status: 'in_progress',
    desa: {
      id: 2,
      nama_desa: 'Desa Berkah Makmur',
      kecamatan: 'Prigen',
      kabupaten: 'Kabupaten Pasuruan',
      provinsi: 'Jawa Timur',
      kontak_resmi: '081234567202',
    },
  },
  {
    id: 3,
    judul: 'Pemberdayaan Posyandu Digital & Pencegahan Stunting Anak',
    desa_id: 1,
    deskripsi:
      'Digitalisasi pencatatan data tumbuh kembang balita di 5 posyandu desa serta edukasi gizi seimbang bagi ibu hamil.',
    kategori: 'kesehatan',
    sdg_codes: [3],
    kuota_kelompok: 2,
    deadline: '2026-10-15',
    jurusan_dibutuhkan: {
      'Kesehatan Masyarakat': 2,
      Gizi: 1,
      'Teknik Informatika': 1,
    },
    status: 'open',
    desa: {
      id: 1,
      nama_desa: 'Desa Sukamaju',
      kecamatan: 'Mojowarno',
      kabupaten: 'Kabupaten Jombang',
      provinsi: 'Jawa Timur',
      kontak_resmi: '081234567201',
    },
  },
  {
    id: 4,
    judul: 'Bimbingan Belajar Bahasa Inggris dan Literasi Digital SD',
    desa_id: 3,
    deskripsi:
      'Penguatan kemampuan dasar bahasa Inggris interaktif dan pengenalan literasi komputer bagi siswa SDN Pacet 01.',
    kategori: 'pendidikan',
    sdg_codes: [4],
    kuota_kelompok: 1,
    deadline: '2026-10-05',
    jurusan_dibutuhkan: {
      'Pendidikan Bahasa Inggris': 1,
      'Pendidikan Guru Sekolah Dasar': 1,
    },
    status: 'open',
    desa: {
      id: 3,
      nama_desa: 'Desa Cempaka Putih',
      kecamatan: 'Pacet',
      kabupaten: 'Kabupaten Mojokerto',
      provinsi: 'Jawa Timur',
      kontak_resmi: '081234567203',
    },
  },
  {
    id: 5,
    judul: 'Perencanaan Masterplan Ruang Terbuka Hijau & Sarana Olahraga Desa',
    desa_id: 2,
    deskripsi:
      'Penyusunan dokumen desain teknis dan anggaran rencana pembangunan taman desa terpadu ramah lansia dan anak.',
    kategori: 'fasilitas',
    sdg_codes: [9, 11],
    kuota_kelompok: 1,
    deadline: '2026-08-30',
    jurusan_dibutuhkan: {
      'Teknik Sipil': 1,
      Arsitektur: 1,
    },
    status: 'completed',
    desa: {
      id: 2,
      nama_desa: 'Desa Berkah Makmur',
      kecamatan: 'Prigen',
      kabupaten: 'Kabupaten Pasuruan',
      provinsi: 'Jawa Timur',
      kontak_resmi: '081234567202',
    },
  },
];

export function getPosById(id: number): PosKebutuhanItem | undefined {
  return FALLBACK_POS_DATA.find((p) => p.id === id);
}
