export interface IndonesiaMajorItem {
  id: string;
  name: string;
  category: 'Teknik & Informatika' | 'Pertanian & Pangan' | 'Kesehatan & Gizi' | 'Ekonomi & Bisnis' | 'Sosial & Pendidikan' | 'Lingkungan & Sains';
  sectorKey: 'digitalisasi' | 'agrikultur' | 'kesehatan' | 'pendidikan' | 'all';
  keywords: string[];
}

export const INDONESIA_POPULAR_MAJORS: IndonesiaMajorItem[] = [
  // 1. Teknik & Informatika (Digitalisasi UMKM & Smart Village)
  {
    id: 'ti',
    name: 'Teknik Informatika',
    category: 'Teknik & Informatika',
    sectorKey: 'digitalisasi',
    keywords: ['it', 'software', 'programming', 'web', 'komputer', 'coding', 'aplikasi'],
  },
  {
    id: 'si',
    name: 'Sistem Informasi',
    category: 'Teknik & Informatika',
    sectorKey: 'digitalisasi',
    keywords: ['database', 'erp', 'bisnis digital', 'e-commerce', 'data'],
  },
  {
    id: 'dkv',
    name: 'Desain Komunikasi Visual (DKV)',
    category: 'Teknik & Informatika',
    sectorKey: 'digitalisasi',
    keywords: ['desain', 'branding', 'kemasan produk', 'logo', 'konten kreatif', 'grafis'],
  },
  {
    id: 'ilkom',
    name: 'Ilmu Komunikasi',
    category: 'Teknik & Informatika',
    sectorKey: 'digitalisasi',
    keywords: ['public relations', 'media sosial', 'promosi', 'jurnalisme desa', 'marketing'],
  },
  {
    id: 'ts',
    name: 'Teknik Sipil & Perencanaan',
    category: 'Teknik & Informatika',
    sectorKey: 'digitalisasi',
    keywords: ['infrastruktur', 'irigasi', 'jembatan', 'tata ruang desa', 'konstruksi'],
  },

  // 2. Pertanian & Ketahanan Pangan (Agrikultur & Desa Mandiri)
  {
    id: 'agribisnis',
    name: 'Agribisnis',
    category: 'Pertanian & Pangan',
    sectorKey: 'agrikultur',
    keywords: ['pertanian', 'pemasaran hasil tani', 'rantai pasok', 'bumdes pangan'],
  },
  {
    id: 'agrotek',
    name: 'Agroteknologi / Agronomi',
    category: 'Pertanian & Pangan',
    sectorKey: 'agrikultur',
    keywords: ['budidaya tanaman', 'tanah', 'pupuk organik', 'hidroponik', 'hama tanaman'],
  },
  {
    id: 'peternakan',
    name: 'Ilmu Peternakan',
    category: 'Pertanian & Pangan',
    sectorKey: 'agrikultur',
    keywords: ['ternak sapi', 'kambing', 'unggas', 'pakan ternak', 'biogas'],
  },
  {
    id: 'perikanan',
    name: 'Akuakultur / Ilmu Perikanan',
    category: 'Pertanian & Pangan',
    sectorKey: 'agrikultur',
    keywords: ['budidaya ikan', 'tambak', 'kolam bioflok', 'pengolahan ikan'],
  },
  {
    id: 'thp',
    name: 'Teknologi Hasil Pertanian',
    category: 'Pertanian & Pangan',
    sectorKey: 'agrikultur',
    keywords: ['pascapanen', 'olahan pangan', 'pengawetan alami', 'higiene pangan'],
  },
  {
    id: 'kehutanan',
    name: 'Kehutanan & Konservasi',
    category: 'Pertanian & Pangan',
    sectorKey: 'agrikultur',
    keywords: ['hutan desa', 'reboisasi', 'agroforestri', 'konservasi air'],
  },

  // 3. Kesehatan, Gizi & Posyandu
  {
    id: 'gizi',
    name: 'Ilmu Gizi',
    category: 'Kesehatan & Gizi',
    sectorKey: 'kesehatan',
    keywords: ['stunting', 'mpasi', 'posyandu', 'nutrisi balita', 'pola makan sehat'],
  },
  {
    id: 'kesmas',
    name: 'Kesehatan Masyarakat (Kesmas)',
    category: 'Kesehatan & Gizi',
    sectorKey: 'kesehatan',
    keywords: ['sanitasi', 'phbs', 'edukasi kesehatan', 'pencegahan wabah', 'lingkungan sehat'],
  },
  {
    id: 'keperawatan',
    name: 'Ilmu Keperawatan',
    category: 'Kesehatan & Gizi',
    sectorKey: 'kesehatan',
    keywords: ['pemeriksaan tensi', 'lansia', 'pertolongan pertama', 'kesehatan keluarga'],
  },
  {
    id: 'farmasi',
    name: 'Farmasi & Obat Tradisional',
    category: 'Kesehatan & Gizi',
    sectorKey: 'kesehatan',
    keywords: ['toga', 'tanaman obat', 'jamu higienis', 'edukasi obat bebas'],
  },
  {
    id: 'kebidanan',
    name: 'Kebidanan',
    category: 'Kesehatan & Gizi',
    sectorKey: 'kesehatan',
    keywords: ['ibu hamil', 'kesehatan ibu dan anak', 'kia', 'asi eksklusif'],
  },

  // 4. Ekonomi, Bisnis & Manajemen BUMDes
  {
    id: 'manajemen',
    name: 'Manajemen Bisnis',
    category: 'Ekonomi & Bisnis',
    sectorKey: 'digitalisasi',
    keywords: ['bumdes', 'keuangan usaha', 'strategi pemasaran', 'kelayakan usaha'],
  },
  {
    id: 'akuntansi',
    name: 'Akuntansi',
    category: 'Ekonomi & Bisnis',
    sectorKey: 'digitalisasi',
    keywords: ['pembukuan desa', 'laporan keuangan bumdes', 'pajak', 'audit kas'],
  },
  {
    id: 'ekonomipembangunan',
    name: 'Ekonomi Pembangunan',
    category: 'Ekonomi & Bisnis',
    sectorKey: 'digitalisasi',
    keywords: ['potensi desa', 'pemetaan ekonomi', 'pengentasan kemiskinan'],
  },
  {
    id: 'pariwisata',
    name: 'Destinasi Pariwisata',
    category: 'Ekonomi & Bisnis',
    sectorKey: 'digitalisasi',
    keywords: ['desa wisata', 'homestay', 'ekowisata', 'pemandu wisata'],
  },

  // 5. Pendidikan, Sosial & Hukum
  {
    id: 'pgsd',
    name: 'Pendidikan Guru SD (PGSD)',
    category: 'Sosial & Pendidikan',
    sectorKey: 'pendidikan',
    keywords: ['bimbingan belajar', 'literasi anak', 'numerasi', 'rumah baca desa'],
  },
  {
    id: 'hukum',
    name: 'Ilmu Hukum',
    category: 'Sosial & Pendidikan',
    sectorKey: 'pendidikan',
    keywords: ['peraturan desa (perdes)', 'legalitas bumdes', 'kesadaran hukum', 'hak tanah'],
  },
  {
    id: 'psikologi',
    name: 'Psikologi',
    category: 'Sosial & Pendidikan',
    sectorKey: 'pendidikan',
    keywords: ['parenting', 'kesehatan mental remaja', 'pengembangan karakter'],
  },
  {
    id: 'sosiologi',
    name: 'Sosiologi & Antropologi',
    category: 'Sosial & Pendidikan',
    sectorKey: 'pendidikan',
    keywords: ['pemberdayaan masyarakat', 'kelembagaan desa', 'resolusi konflik'],
  },
];
