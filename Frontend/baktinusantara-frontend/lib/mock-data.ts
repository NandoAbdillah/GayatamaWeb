import {
  User,
  PosKebutuhan,
  Kelompok,
  Proposal,
  LogbookEntry,
  LuaranAkhir,
  BASTDocument,
  Aspirasi,
} from './types';

export const MOCK_USERS: Record<string, User> = {
  mahasiswa: {
    id: 101,
    name: 'M. Rian Pratama',
    email: 'rian.pratama@student.univ.ac.id',
    role: 'mahasiswa',
    is_verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '081234567890',
    profile: {
      id: 1,
      user_id: 101,
      nim: '21051204012',
      jurusan: 'Teknik Informatika',
      fakultas: 'Teknik',
      angkatan: '2021',
      total_jam_kkn: 142,
      target_jam_kkn: 200,
      kelompok_id: 14,
    },
  },
  perangkat_desa: {
    id: 201,
    name: 'H. Ahmad Subardjo',
    email: 'kades@sukamaju.desa.id',
    role: 'perangkat_desa',
    is_verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '081398765432',
    profile: {
      id: 2,
      user_id: 201,
      nama_desa: 'Desa Sukamaju',
      kecamatan: 'Kecamatan Ciawi',
      kabupaten: 'Kabupaten Bogor',
      provinsi: 'Jawa Barat',
      jabatan: 'Kepala Desa',
      kepala_desa: 'H. Ahmad Subardjo',
      latitude: -6.6854,
      longitude: 106.8456,
    },
  },
  dosen: {
    id: 301,
    name: 'Dr. Ir. Hendra Gunawan, M.T.',
    email: 'hendra.gunawan@univ.ac.id',
    role: 'dosen',
    is_verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '081122334455',
    profile: {
      id: 3,
      user_id: 301,
      nip: '197804122005011002',
      fakultas: 'Teknik & Pertanian',
      departemen: 'Teknologi Informasi & Biosistem',
      bidang_keahlian: 'Smart Agriculture & IoT Pedesaan',
      kuota_bimbingan: 5,
      jumlah_kelompok_binaan: 3,
    },
  },
  universitas: {
    id: 401,
    name: 'Prof. Dr. Budi Santoso (LPPM)',
    email: 'lppm@univ.ac.id',
    role: 'universitas',
    is_verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '081987654321',
    profile: {
      id: 4,
      user_id: 401,
      kode_kampus: 'UNIV-001',
      nama_universitas: 'Universitas Nusantara Merdeka',
      lppm_ketua: 'Prof. Dr. Budi Santoso, M.Sc.',
    },
  },
  admin: {
    id: 501,
    name: 'Super Admin BaktiNusantara',
    email: 'admin@baktinusantara.id',
    role: 'admin',
    is_verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '081234567890',
  },
};

export const MOCK_KELOMPOK_14: Kelompok = {
  id: 14,
  nama_kelompok: 'Kelompok 14 - KKN Sukamaju Berdaya',
  kode_kelompok: 'KKN-2026-SKM-014',
  ketua_id: 101,
  ketua_nama: 'M. Rian Pratama',
  dosen_id: 301,
  dosen_nama: 'Dr. Ir. Hendra Gunawan, M.T.',
  pos_kebutuhan_id: 1,
  pos_kebutuhan_judul: 'Digitalisasi Katalog Produk UMKM & Manajemen Irigasi Cerdas',
  desa_nama: 'Desa Sukamaju, Bogor',
  total_anggota: 5,
  status_program: 'pelaksanaan',
  progres_persen: 71,
  anggota: [
    {
      id: 1,
      user_id: 101,
      nama: 'M. Rian Pratama',
      nim: '21051204012',
      jurusan: 'Teknik Informatika',
      role_kelompok: 'Ketua',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      user_id: 102,
      nama: 'Salsabila Putri',
      nim: '21051204045',
      jurusan: 'Agribisnis',
      role_kelompok: 'Anggota',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      user_id: 103,
      nama: 'Dimas Arya Pamungkas',
      nim: '21051204088',
      jurusan: 'Ilmu Komunikasi',
      role_kelompok: 'Anggota',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      user_id: 104,
      nama: 'Siti Nurhaliza',
      nim: '21051204102',
      jurusan: 'Farmasi & Herbal',
      role_kelompok: 'Anggota',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 5,
      user_id: 105,
      nama: 'Bagus Wicaksono',
      nim: '21051204033',
      jurusan: 'Teknik Elektro',
      role_kelompok: 'Anggota',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  ],
};

export const MOCK_POS_KEBUTUHAN: PosKebutuhan[] = [
  {
    id: 1,
    desa_id: 201,
    nama_desa: 'Desa Sukamaju',
    kecamatan: 'Ciawi',
    kabupaten: 'Bogor',
    provinsi: 'Jawa Barat',
    judul: 'Digitalisasi Katalog Produk UMKM & Manajemen Irigasi Cerdas',
    deskripsi:
      'Desa Sukamaju membutuhkan pendampingan digitalisasi bagi 42 pelaku UMKM keripik talas & madu hutan, serta perancangan sistem monitoring debit air irigasi sawah terpadu.',
    kategori_sektor: 'Digitalisasi & Teknologi Desa',
    kuota_mahasiswa: 5,
    terisi_mahasiswa: 5,
    latitude: -6.6854,
    longitude: 106.8456,
    target_luaran: [
      'Website Marketplace & Katalog Desa',
      'Pelatihan Branding & Kemasan UMKM',
      'Modul Panduan Irigasi Terpadu',
    ],
    kriteria_jurusan: ['Teknik Informatika', 'Agribisnis', 'Ilmu Komunikasi', 'Teknik Elektro'],
    status: 'in_progress',
    matching_score: 96,
    distance_km: 18.4,
    created_at: '2026-08-10',
  },
  {
    id: 2,
    desa_id: 202,
    nama_desa: 'Desa Cibodas Asri',
    kecamatan: 'Pacet',
    kabupaten: 'Cianjur',
    provinsi: 'Jawa Barat',
    judul: 'Pengembangan Agrowisata Organik & Edukasi Zero Waste Desa',
    deskripsi:
      'Meningkatkan daya tarik wisata petik sayur organik mandiri, pengolahan limbah sayur menjadi kompos cair berdaya jual tinggi, dan pembuatan peta jalur hiking desa.',
    kategori_sektor: 'Agrikultur & Ketahanan Pangan',
    kuota_mahasiswa: 6,
    terisi_mahasiswa: 0,
    latitude: -6.7421,
    longitude: 107.0322,
    target_luaran: [
      'Peta Jalur Wisata & Papan Informasi QR Code',
      'Unit Pengomposan Skala Dusun',
      'Video Promosi Agrowisata 4K',
    ],
    kriteria_jurusan: ['Pertanian', 'Biologi', 'Desain Komunikasi Visual', 'Manajemen'],
    status: 'open',
    matching_score: 88,
    distance_km: 42.1,
    created_at: '2026-08-15',
  },
  {
    id: 3,
    desa_id: 203,
    nama_desa: 'Desa Tanjung Karang',
    kecamatan: 'Babakan Madang',
    kabupaten: 'Bogor',
    provinsi: 'Jawa Barat',
    judul: 'Pemberdayaan Posyandu Digital & Pencegahan Stunting Balita',
    deskripsi:
      'Penyusunan dashboard gizi balita terintegrasi WhatsApp reminder untuk ibu hamil, penyuluhan MPASI berbasis pangan lokal, dan sanitasi air bersih keluarga pra-sejahtera.',
    kategori_sektor: 'Kesehatan & Sanitasi',
    kuota_mahasiswa: 5,
    terisi_mahasiswa: 3,
    latitude: -6.5678,
    longitude: 106.8912,
    target_luaran: [
      'Buku Panduan Menu MPASI Bergizi',
      'Sistem Pencatatan Posyandu Berbasis Web',
      'Filter Air Sederhana di 3 Dusun',
    ],
    kriteria_jurusan: ['Kesehatan Masyarakat', 'Gizi', 'Ilmu Keperawatan', 'Sistem Informasi'],
    status: 'open',
    matching_score: 92,
    distance_km: 12.8,
    created_at: '2026-08-20',
  },
];

export const MOCK_LOGBOOKS: LogbookEntry[] = [
  {
    id: 1,
    kelompok_id: 14,
    mahasiswa_id: 101,
    mahasiswa_nama: 'M. Rian Pratama',
    mahasiswa_nim: '21051204012',
    mahasiswa_jurusan: 'Teknik Informatika',
    tanggal: '2026-09-02',
    minggu_ke: 4,
    durasi_jam: 8,
    judul_kegiatan: 'Sosialisasi dan Pelatihan Foto Produk untuk 15 Pelaku UMKM Keripik Talas',
    deskripsi:
      'Melaksanakan workshop mini di Balai Desa Sukamaju mengenai teknik pencahayaan sederhana menggunakan smartphone, pembuatan deskripsi produk menarik, serta input ke website katalog desa.',
    target_program_terkait: 'Pelatihan Branding & Kemasan UMKM Desa',
    foto_dokumentasi_urls: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&auto=format&fit=crop&q=80',
    ],
    status: 'revision',
    catatan_revisi_dpl:
      'Kegiatan sangat baik. Mohon tambahkan rekapitulasi data nama-nama UMKM yang hadir dan lampirkan lembar absensi bertanda tangan Kepala Dusun.',
  },
  {
    id: 2,
    kelompok_id: 14,
    mahasiswa_id: 101,
    mahasiswa_nama: 'M. Rian Pratama',
    mahasiswa_nim: '21051204012',
    mahasiswa_jurusan: 'Teknik Informatika',
    tanggal: '2026-08-28',
    minggu_ke: 3,
    durasi_jam: 7,
    judul_kegiatan: 'Instalasi Sensor Ketinggian Air & Uji Coba Monitoring Irigasi Blok Barat',
    deskripsi:
      'Pemasangan modul IoT sensor ultrasonik di saluran irigasi primer blok sawah barat dengan dukungan dari pengurus kelompok tani Tirta Kencana.',
    target_program_terkait: 'Modul Panduan Irigasi Terpadu',
    foto_dokumentasi_urls: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
    ],
    status: 'approved',
    disahkan_pada: '2026-08-29 14:20:00',
  },
  {
    id: 3,
    kelompok_id: 14,
    mahasiswa_id: 101,
    mahasiswa_nama: 'M. Rian Pratama',
    mahasiswa_nim: '21051204012',
    mahasiswa_jurusan: 'Teknik Informatika',
    tanggal: '2026-09-05',
    minggu_ke: 4,
    durasi_jam: 6,
    judul_kegiatan: 'Penyusunan Draf Buku Petunjuk Pengoperasian Portal Desa untuk Staf Pelayanan',
    deskripsi:
      'Menulis panduan ringkas (SOP) pengelolaan konten berita desa, verifikasi formulir aspirasi warga, dan update produk UMKM pada web portal desa.',
    target_program_terkait: 'Website Marketplace & Katalog Desa',
    foto_dokumentasi_urls: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=80',
    ],
    status: 'submitted',
  },
];

export const MOCK_ASPIRASI: Aspirasi[] = [
  {
    id: 1,
    ticket_number: 'ASP-2026-SKM-0089',
    desa_id: 201,
    nama_pengadu: 'Pak Joko (Ketua RT 03)',
    nomor_kontak: '081299887766',
    judul: 'Saluran Irigasi Dusun 2 Tertutup Endapan Lumpur Saat Hujan Deras',
    deskripsi:
      'Pintu air di perbatasan sawah blok RT 03 sering meluap karena sedimentasi pasir. Mohon bantuan kelompok KKN atau desa untuk merancang program kerja bakti dan pengerukan.',
    kategori: 'Infrastruktur',
    status: 'converted_to_pos',
    tanggapan_desa: 'Telah dimasukkan ke dalam pos kebutuhan program kerja irigasi KKN Kelompok 14.',
    created_at: '2026-08-04',
  },
  {
    id: 2,
    ticket_number: 'ASP-2026-SKM-0112',
    desa_id: 201,
    nama_pengadu: 'Ibu Ratna (Pengrajin Keripik Talas)',
    nomor_kontak: '085711223344',
    judul: 'Perlu Pelatihan Izin Edar P-IRT dan Sertifikasi Halal Gratis',
    deskripsi:
      'Banyak ibu-ibu pengrajin olahan talas yang produknya belum memiliki izin edar resmi sehingga sulit masuk ke minimarket atau toko oleh-oleh kota.',
    kategori: 'Ekonomi / UMKM',
    status: 'verified',
    tanggapan_desa: 'Diverifikasi oleh Sekdes. Sedang dijadwalkan workshop bersama mahasiswa KKN Farmasi & Hukum.',
    created_at: '2026-08-18',
  },
];

export const MOCK_BAST: BASTDocument = {
  id: 1,
  kelompok_id: 14,
  desa_id: 201,
  nomor_surat: 'BAST/014/KKN-SKM/IX/2026',
  tanggal_penyerahan: '2026-09-06',
  nama_kades: 'H. Ahmad Subardjo',
  nama_ketua_kelompok: 'M. Rian Pratama',
  nama_dpl: 'Dr. Ir. Hendra Gunawan, M.T.',
  daftar_luaran_diserahkan: [
    'Portal Web Resmi Katalog UMKM & Layanan Sukamaju (Source Code & Domain)',
    '1 Unit Modul Irigasi Cerdas IoT Terpasang di Bendung Barat',
    '30 Buku Panduan Branding & SOP Digitalisasi UMKM',
    'Video Dokumenter Perjalanan KKN Sukamaju Berdaya 2026',
  ],
  nilai_mitra_desa: 94,
  komentar_evaluasi_desa:
    'Kelompok 14 sangat santun, aktif berbaur dengan warga, dan program yang dijalankan memberikan dampak nyata bagi pedagang kecil dan petani kami. Sangat memuaskan!',
  status_tanda_tangan: 'signed_desa',
  qr_code_verify_url: 'https://gayatama.univ.ac.id/verify/bast/BAST-014-KKN-SKM-2026',
};

export interface MockDesaItem {
  id: number;
  nama: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  populasi: number;
  luas_km2: number;
  potensi_utama: string[];
  kebutuhan_prioritas: string[];
  foto_url: string;
  pos_tersedia: number;
}

export const MOCK_DESA_LIST: MockDesaItem[] = [
  {
    id: 1,
    nama: 'Desa Sukamaju',
    kecamatan: 'Ciawi',
    kabupaten: 'Bogor',
    provinsi: 'Jawa Barat',
    populasi: 4820,
    luas_km2: 12.4,
    potensi_utama: ['UMKM Keripik Talas', 'Madu Hutan Lestari', 'Pertanian Organik'],
    kebutuhan_prioritas: ['Digitalisasi Katalog UMKM', 'Otomasi Irigasi Tani', 'Sertifikasi Halal'],
    foto_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80',
    pos_tersedia: 2,
  },
  {
    id: 2,
    nama: 'Desa Cibodas Asri',
    kecamatan: 'Pacet',
    kabupaten: 'Cianjur',
    provinsi: 'Jawa Barat',
    populasi: 3650,
    luas_km2: 18.2,
    potensi_utama: ['Agrowisata Hortikultura', 'Sayur Organik', 'Ekowisata Jalur Hiking'],
    kebutuhan_prioritas: ['Pengolahan Kompos Zero Waste', 'Promosi Wisata Digital', 'Peta Jalur Wisata QR'],
    foto_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    pos_tersedia: 1,
  },
  {
    id: 3,
    nama: 'Desa Tanjung Karang',
    kecamatan: 'Babakan Madang',
    kabupaten: 'Bogor',
    provinsi: 'Jawa Barat',
    populasi: 5120,
    luas_km2: 9.8,
    potensi_utama: ['Budidaya Ikan Air Tawar', 'Kerajinan Anyaman Bambu', 'Sentra Tanaman Hias'],
    kebutuhan_prioritas: ['Pencegahan Stunting Posyandu', 'Filtrasi Air Bersih', 'Website Desa'],
    foto_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    pos_tersedia: 1,
  },
  {
    id: 4,
    nama: 'Desa Pasir Madang',
    kecamatan: 'Cigudeg',
    kabupaten: 'Bogor',
    provinsi: 'Jawa Barat',
    populasi: 4230,
    luas_km2: 15.6,
    potensi_utama: ['Perkebunan Kopi Robusta', 'Gula Aren Tradisional', 'Wisata Curug'],
    kebutuhan_prioritas: ['Pengemasan & Roasting Kopi Modern', 'Pemberdayaan BUMDes', 'Literasi Keuangan'],
    foto_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    pos_tersedia: 3,
  },
];

export interface MockUmkmItem {
  id: number;
  nama: string;
  desa: string;
  kabupaten: string;
  kategori: string;
  produk_unggulan: string;
  pemilik: string;
  omset_bulanan: string;
  status_kkn: string;
  foto_url: string;
}

export const MOCK_UMKM_LIST: MockUmkmItem[] = [
  {
    id: 1,
    nama: 'UMKM Keripik Talas Barokah',
    desa: 'Desa Sukamaju',
    kabupaten: 'Bogor',
    kategori: 'Kuliner & Olahan Pangan',
    produk_unggulan: 'Keripik Talas Aneka Rasa (Original, Keju, Balado)',
    pemilik: 'Ibu Ratna Susanti',
    omset_bulanan: 'Rp 12.000.000',
    status_kkn: 'Pendampingan Foto Produk, NIB, & Kemasan Standing Pouch',
    foto_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    nama: 'Madu Hutan Lestari Ciawi',
    desa: 'Desa Sukamaju',
    kabupaten: 'Bogor',
    kategori: 'Herbal & Pangan Alami',
    produk_unggulan: 'Madu Hutan Odeng Murni 500ml & Bee Pollen',
    pemilik: 'Pak Dedi Kurniawan',
    omset_bulanan: 'Rp 18.500.000',
    status_kkn: 'Pembuatan Website Katalog & Pendaftaran Sertifikasi Halal',
    foto_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    nama: 'Batik Tulis Bambu Ceria',
    desa: 'Desa Tanjung Karang',
    kabupaten: 'Bogor',
    kategori: 'Fashion & Kerajinan Tangan',
    produk_unggulan: 'Kain Batik Motif Bambu & Pouch Ecoprint',
    pemilik: 'Ibu Endang Rahayu',
    omset_bulanan: 'Rp 8.000.000',
    status_kkn: 'Integrasi Akun Tokopedia & Pelatihan Instagram Ads',
    foto_url: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    nama: 'Kopi Robusta Gunung Madang',
    desa: 'Desa Pasir Madang',
    kabupaten: 'Bogor',
    kategori: 'Perkebunan & Minuman Khas',
    produk_unggulan: 'Kopi Bubuk & Biji Sangrai Medium Dark 250gr',
    pemilik: 'Pak Haji Mansur',
    omset_bulanan: 'Rp 22.000.000',
    status_kkn: 'Redesain Label Kemasan & Setup Akun Pembayaran QRIS',
    foto_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
  },
];

export interface MockProgramRekomendasi {
  id: number;
  nama_program: string;
  kategori: string;
  sasaran: string;
  fokus: string;
  durasi: string;
  relevansi: string;
  alasan: string;
  target_output: string[];
}

export const MOCK_PROGRAM_REKOMENDASI: MockProgramRekomendasi[] = [
  {
    id: 1,
    nama_program: 'Digitalisasi Katalog Produk UMKM Desa & Toko Online',
    kategori: 'Ekonomi Kreatif & Teknologi',
    sasaran: 'Pelaku UMKM Pangan & Kerajinan Desa',
    fokus: 'Pembuatan Website Katalog, Foto Produk Studio Mini, & QRIS',
    durasi: '4 Minggu',
    relevansi: 'Sangat Sesuai (High Impact)',
    alasan: 'Memperluas jangkauan pasar produk lokal desa ke tingkat kota secara digital.',
    target_output: ['Website Katalog Desa', '30 Banner Produk', 'SOP Pembukuan Kas Digital'],
  },
  {
    id: 2,
    nama_program: 'Pelatihan Kemasan Premium, NIB & Sertifikasi Halal Gratis',
    kategori: 'Pemberdayaan Ekonomi UMKM',
    sasaran: 'Ibu-ibu Pengrajin & Industri Rumahan Desa',
    fokus: 'Legalitas Usaha, Sertifikasi P-IRT/Halal, & Standar Kemasan',
    durasi: '3 Minggu',
    relevansi: 'Prioritas Tinggi',
    alasan: 'Syarat utama agar produk desa dapat dipasarkan ke retail modern & minimarket.',
    target_output: ['25 NIB Terbit', 'Modul Panduan Sertifikasi', 'Desain Kemasan Baru'],
  },
  {
    id: 3,
    nama_program: 'Modernisasi Irigasi Pertanian & Sistem Pemantauan IoT',
    kategori: 'Ketahanan Pangan & Teknologi',
    sasaran: 'Gabungan Kelompok Tani (Gapoktan)',
    fokus: 'Otomasi Pintu Air & Manajemen Distribusi Air Musim Kemarau',
    durasi: '4 Minggu',
    relevansi: 'Sangat Sesuai',
    alasan: 'Mencegah gagal panen dan memastikan debit air sawah terbagi merata.',
    target_output: ['1 Unit Modul Sensor Air', 'Buku Petunjuk Operasional', 'Peta Jalur Irigasi'],
  },
  {
    id: 4,
    nama_program: 'Posyandu Digital Terpadu & Edukasi Gizi Cegah Stunting',
    kategori: 'Kesehatan & Sanitasi Masyarakat',
    sasaran: 'Kader Posyandu, Ibu Hamil & Balita',
    fokus: 'Dashboard Pencatatan Tumbuh Kembang & Demo Masak MPASI Lokal',
    durasi: '4 Minggu',
    relevansi: 'Sangat Sesuai',
    alasan: 'Mempercepat deteksi dini stunting dan meningkatkan pemenuhan gizi keluarga.',
    target_output: ['Aplikasi Web Posyandu', 'Buku Menu Sehat MPASI', 'Filter Air Bersih Dusun'],
  },
];

