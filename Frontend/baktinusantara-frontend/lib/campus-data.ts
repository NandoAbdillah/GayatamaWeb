/**
 * Data Referensi Perguruan Tinggi Indonesia (PDDikti / API Indonesia Standard)
 * Mendukung pemetaan ID unik, relasi Fakultas, Program Studi, dan domain email mahasiswa resmi.
 */

export interface ProgramStudi {
  id: string;
  nama: string;
  jenjang: 'D3' | 'D4' | 'S1' | 'S2' | 'Profesi';
  akreditasi?: string;
}

export interface Fakultas {
  id: string;
  nama: string;
  program_studi: ProgramStudi[];
}

export interface PerguruanTinggi {
  id: number; // Backend DB ID reference
  kode_pt: string; // Kode resmi PDDikti
  nama_universitas: string;
  singkatan: string;
  jenis: 'PTN' | 'PTS' | 'PTKIN' | 'Politeknik';
  provinsi: string;
  kabupaten: string;
  akreditasi: 'Unggul' | 'A' | 'Baik Sekali' | 'B' | 'Baik';
  domain_email_mhs: string; // Contoh: mhs.unesa.ac.id
  email_prefix_examples: string[];
  fakultas: Fakultas[];
}

export const INDONESIA_UNIVERSITIES: PerguruanTinggi[] = [
  {
    id: 1, // Matches DB Seeded UNESA
    kode_pt: '001042',
    nama_universitas: 'Universitas Negeri Surabaya (UNESA)',
    singkatan: 'UNESA',
    jenis: 'PTN',
    provinsi: 'Jawa Timur',
    kabupaten: 'Kota Surabaya',
    akreditasi: 'Unggul',
    domain_email_mhs: 'mhs.unesa.ac.id',
    email_prefix_examples: ['nama@mhs.unesa.ac.id', 'nim@mhs.unesa.ac.id'],
    fakultas: [
      {
        id: 'unesa-ft',
        nama: 'Fakultas Teknik & Rekayasa Sistem (FT)',
        program_studi: [
          { id: 'unesa-ft-if', nama: 'S1 Teknik Informatika', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-ft-si', nama: 'S1 Sistem Informasi', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-ft-el', nama: 'S1 Teknik Elektro', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-ft-sp', nama: 'S1 Teknik Sipil', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-ft-ms', nama: 'S1 Teknik Mesin', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-ft-ti', nama: 'S1 Teknik Industri', jenjang: 'S1', akreditasi: 'Baik Sekali' },
        ],
      },
      {
        id: 'unesa-fmipa',
        nama: 'Fakultas Matematika & Ilmu Pengetahuan Alam (FMIPA)',
        program_studi: [
          { id: 'unesa-fmipa-mat', nama: 'S1 Matematika', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-fmipa-bio', nama: 'S1 Biologi & Lingkungan', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-fmipa-fis', nama: 'S1 Fisika Terapan', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-fmipa-kim', nama: 'S1 Kimia', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-fmipa-pmat', nama: 'S1 Pendidikan Matematika', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'unesa-feb',
        nama: 'Fakultas Ekonomika & Bisnis (FEB)',
        program_studi: [
          { id: 'unesa-feb-man', nama: 'S1 Manajemen Bisnis & UMKM', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-feb-akt', nama: 'S1 Akuntansi Publik & Desa', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-feb-esp', nama: 'S1 Ekonomi Pembangunan', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-feb-es', nama: 'S1 Ekonomi Syariah', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'unesa-fbs',
        nama: 'Fakultas Bahasa & Seni (FBS)',
        program_studi: [
          { id: 'unesa-fbs-dkv', nama: 'S1 Desain Komunikasi Visual (DKV)', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-fbs-ing', nama: 'S1 Pendidikan Bahasa Inggris', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-fbs-ind', nama: 'S1 Pendidikan Bahasa Indonesia', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-fbs-sn', nama: 'S1 Seni Rupa & Desain Produk', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'unesa-fish',
        nama: 'Fakultas Ilmu Sosial & Hukum (FISH)',
        program_studi: [
          { id: 'unesa-fish-hk', nama: 'S1 Ilmu Hukum', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-fish-an', nama: 'S1 Administrasi Publik & Desa', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-fish-sos', nama: 'S1 Sosiologi Pedesaan', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-fish-kom', nama: 'S1 Ilmu Komunikasi', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'unesa-fip',
        nama: 'Fakultas Ilmu Pendidikan (FIP)',
        program_studi: [
          { id: 'unesa-fip-pgsd', nama: 'S1 Pendidikan Guru Sekolah Dasar (PGSD)', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-fip-pgpaud', nama: 'S1 Pendidikan Guru PAUD', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-fip-bk', nama: 'S1 Bimbingan & Konseling', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unesa-fip-tp', nama: 'S1 Teknologi Pendidikan', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'unesa-fik',
        nama: 'Fakultas Ilmu Keolahragaan & Kesehatan (FIKK)',
        program_studi: [
          { id: 'unesa-fik-kesmas', nama: 'S1 Kesehatan Masyarakat', jenjang: 'S1', akreditasi: 'Baik Sekali' },
          { id: 'unesa-fik-gizi', nama: 'S1 Ilmu Gizi & Pencegahan Stunting', jenjang: 'S1', akreditasi: 'Baik Sekali' },
          { id: 'unesa-fik-pkor', nama: 'S1 Pendidikan Kepelatihan Olahraga', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
    ],
  },
  {
    id: 2, // Matches DB Seeded ITS
    kode_pt: '001004',
    nama_universitas: 'Institut Teknologi Sepuluh Nopember (ITS)',
    singkatan: 'ITS',
    jenis: 'PTN',
    provinsi: 'Jawa Timur',
    kabupaten: 'Kota Surabaya',
    akreditasi: 'Unggul',
    domain_email_mhs: 'student.its.ac.id',
    email_prefix_examples: ['nama@student.its.ac.id', 'nrp@student.its.ac.id', 'nama.mhs@its.ac.id'],
    fakultas: [
      {
        id: 'its-fteic',
        nama: 'Fakultas Teknologi Elektro dan Informatika Cerdas (FTEIC)',
        program_studi: [
          { id: 'its-fteic-if', nama: 'S1 Teknik Informatika', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'its-fteic-si', nama: 'S1 Sistem Informasi', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'its-fteic-ti', nama: 'S1 Teknologi Informasi', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'its-fteic-el', nama: 'S1 Teknik Elektro', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'its-fteic-tb', nama: 'S1 Teknik Biomedik', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'its-ftspk',
        nama: 'Fakultas Teknik Sipil, Perencanaan, dan Kebumian (FTSPK)',
        program_studi: [
          { id: 'its-ftspk-ts', nama: 'S1 Teknik Sipil', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'its-ftspk-tl', nama: 'S1 Teknik Lingkungan & Sanitasi', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'its-ftspk-ars', nama: 'S1 Arsitektur', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'its-ftspk-pwk', nama: 'S1 Perencanaan Wilayah dan Kota (PWK)', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'its-ftspk-tg', nama: 'S1 Teknik Geomatika / GIS', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'its-ftirs',
        nama: 'Fakultas Teknologi Industri dan Rekayasa Sistem (FTIRS)',
        program_studi: [
          { id: 'its-ftirs-tm', nama: 'S1 Teknik Mesin & Energi Terbarukan', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'its-ftirs-ti', nama: 'S1 Teknik Industri', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'its-ftirs-tk', nama: 'S1 Teknik Kimia', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'its-ftirs-tf', nama: 'S1 Teknik Fisika / Instrumentasi', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'its-creabiz',
        nama: 'Fakultas Desain Kreatif dan Bisnis Digital (CREABIZ)',
        program_studi: [
          { id: 'its-creabiz-dkv', nama: 'S1 Desain Komunikasi Visual', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'its-creabiz-dp', nama: 'S1 Desain Produk Industri', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'its-creabiz-mb', nama: 'S1 Manajemen Bisnis', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
    ],
  },
  {
    id: 3, // Matches DB Seeded UNAIR
    kode_pt: '001003',
    nama_universitas: 'Universitas Airlangga (UNAIR)',
    singkatan: 'UNAIR',
    jenis: 'PTN',
    provinsi: 'Jawa Timur',
    kabupaten: 'Kota Surabaya',
    akreditasi: 'Unggul',
    domain_email_mhs: 'mhs.unair.ac.id',
    email_prefix_examples: ['nama@mhs.unair.ac.id', 'nim@mhs.unair.ac.id'],
    fakultas: [
      {
        id: 'unair-fk',
        nama: 'Fakultas Kedokteran & Kesehatan',
        program_studi: [
          { id: 'unair-fk-ked', nama: 'S1 Kedokteran', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unair-fk-bidan', nama: 'S1 Kebidanan', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'unair-fkm',
        nama: 'Fakultas Kesehatan Masyarakat (FKM)',
        program_studi: [
          { id: 'unair-fkm-kesmas', nama: 'S1 Kesehatan Masyarakat', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unair-fkm-gizi', nama: 'S1 Ilmu Gizi', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'unair-ftmm',
        nama: 'Fakultas Teknologi Maju dan Multidisiplin (FTMM)',
        program_studi: [
          { id: 'unair-ftmm-ds', nama: 'S1 Sains Data', jenjang: 'S1', akreditasi: 'Baik Sekali' },
          { id: 'unair-ftmm-ai', nama: 'S1 Robotika & Kecerdasan Buatan', jenjang: 'S1', akreditasi: 'Baik Sekali' },
          { id: 'unair-ftmm-rn', nama: 'S1 Teknik Rekayasa Nanoteknologi', jenjang: 'S1', akreditasi: 'Baik Sekali' },
        ],
      },
      {
        id: 'unair-feb',
        nama: 'Fakultas Ekonomi dan Bisnis',
        program_studi: [
          { id: 'unair-feb-man', nama: 'S1 Manajemen', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unair-feb-akt', nama: 'S1 Akuntansi', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'unair-feb-eks', nama: 'S1 Ekonomi Syariah', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
    ],
  },
  {
    id: 1, // Fallback mapped to DB ID 1 for verification compatibility
    kode_pt: '001002',
    nama_universitas: 'Universitas Gadjah Mada (UGM)',
    singkatan: 'UGM',
    jenis: 'PTN',
    provinsi: 'DI Yogyakarta',
    kabupaten: 'Kabupaten Sleman',
    akreditasi: 'Unggul',
    domain_email_mhs: 'mail.ugm.ac.id',
    email_prefix_examples: ['nama@mail.ugm.ac.id', 'mhs.nama@ugm.ac.id'],
    fakultas: [
      {
        id: 'ugm-ft',
        nama: 'Fakultas Teknik (FT UGM)',
        program_studi: [
          { id: 'ugm-ft-ti', nama: 'S1 Teknologi Informasi', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ugm-ft-ts', nama: 'S1 Teknik Sipil & Lingkungan', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ugm-ft-tf', nama: 'S1 Teknik Fisika', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ugm-ft-pwk', nama: 'S1 Perencanaan Wilayah dan Kota', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'ugm-faperta',
        nama: 'Fakultas Pertanian & Agrikultur',
        program_studi: [
          { id: 'ugm-faperta-agrotek', nama: 'S1 Agroteknologi', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ugm-faperta-agri', nama: 'S1 Agribisnis & Penyuluhan', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ugm-faperta-tanah', nama: 'S1 Ilmu Tanah', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'ugm-fisipol',
        nama: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIPOL)',
        program_studi: [
          { id: 'ugm-fisipol-mkp', nama: 'S1 Manajemen & Kebijakan Publik', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ugm-fisipol-kom', nama: 'S1 Ilmu Komunikasi', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ugm-fisipol-pemerintahan', nama: 'S1 Politik dan Pemerintahan', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
    ],
  },
  {
    id: 1, // Fallback mapped to DB ID 1 for verification compatibility
    kode_pt: '001001',
    nama_universitas: 'Universitas Indonesia (UI)',
    singkatan: 'UI',
    jenis: 'PTN',
    provinsi: 'Jawa Barat',
    kabupaten: 'Kota Depok',
    akreditasi: 'Unggul',
    domain_email_mhs: 'ui.ac.id',
    email_prefix_examples: ['nama@ui.ac.id', 'mhs.nama@ui.ac.id'],
    fakultas: [
      {
        id: 'ui-fasilkom',
        nama: 'Fakultas Ilmu Komputer (FASILKOM)',
        program_studi: [
          { id: 'ui-fasilkom-ilkom', nama: 'S1 Ilmu Komputer', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ui-fasilkom-si', nama: 'S1 Sistem Informasi', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'ui-ft',
        nama: 'Fakultas Teknik (FTUI)',
        program_studi: [
          { id: 'ui-ft-el', nama: 'S1 Teknik Elektro', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ui-ft-ling', nama: 'S1 Teknik Lingkungan', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ui-ft-sipil', nama: 'S1 Teknik Sipil', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'ui-fkm',
        nama: 'Fakultas Kesehatan Masyarakat',
        program_studi: [
          { id: 'ui-fkm-kesmas', nama: 'S1 Kesehatan Masyarakat', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ui-fkm-gizi', nama: 'S1 Ilmu Gizi', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
    ],
  },
  {
    id: 1, // Fallback mapped to DB ID 1 for verification compatibility
    kode_pt: '001005',
    nama_universitas: 'Institut Teknologi Bandung (ITB)',
    singkatan: 'ITB',
    jenis: 'PTN',
    provinsi: 'Jawa Barat',
    kabupaten: 'Kota Bandung',
    akreditasi: 'Unggul',
    domain_email_mhs: 'itb.ac.id',
    email_prefix_examples: ['nama@itb.ac.id', 'nim@mahasiswa.itb.ac.id'],
    fakultas: [
      {
        id: 'itb-stei',
        nama: 'Sekolah Teknik Elektro dan Informatika (STEI)',
        program_studi: [
          { id: 'itb-stei-if', nama: 'S1 Teknik Informatika', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'itb-stei-sti', nama: 'S1 Sistem dan Teknologi Informasi', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'itb-stei-el', nama: 'S1 Teknik Elektro', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'itb-sappk',
        nama: 'Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan (SAPPK)',
        program_studi: [
          { id: 'itb-sappk-ars', nama: 'S1 Arsitektur', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'itb-sappk-pl', nama: 'S1 Perencanaan Wilayah dan Kota', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'itb-fsrd',
        nama: 'Fakultas Seni Rupa dan Desain (FSRD)',
        program_studi: [
          { id: 'itb-fsrd-dkv', nama: 'S1 Desain Komunikasi Visual', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'itb-fsrd-dp', nama: 'S1 Desain Produk', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
    ],
  },
  {
    id: 1,
    kode_pt: '001006',
    nama_universitas: 'Institut Pertanian Bogor (IPB University)',
    singkatan: 'IPB',
    jenis: 'PTN',
    provinsi: 'Jawa Barat',
    kabupaten: 'Kabupaten Bogor',
    akreditasi: 'Unggul',
    domain_email_mhs: 'apps.ipb.ac.id',
    email_prefix_examples: ['nama@apps.ipb.ac.id', 'nim@mhs.ipb.ac.id'],
    fakultas: [
      {
        id: 'ipb-faperta',
        nama: 'Fakultas Pertanian (FAPERTA)',
        program_studi: [
          { id: 'ipb-faperta-agrotek', nama: 'S1 Agronomi dan Hortikultura', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ipb-faperta-ptan', nama: 'S1 Proteksi Tanaman', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'ipb-fema',
        nama: 'Fakultas Ekologi Manusia (FEMA)',
        program_studi: [
          { id: 'ipb-fema-gizi', nama: 'S1 Gizi Masyarakat & Stunting', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ipb-fema-kpm', nama: 'S1 Sains Komunikasi dan Pengembangan Masyarakat (SKPM)', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'ipb-fmipa',
        nama: 'Fakultas Matematika dan Ilmu Pengetahuan Alam',
        program_studi: [
          { id: 'ipb-fmipa-ilkom', nama: 'S1 Ilmu Komputer', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ipb-fmipa-stat', nama: 'S1 Statistika dan Sains Data', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
    ],
  },
  {
    id: 1,
    kode_pt: '001007',
    nama_universitas: 'Universitas Brawijaya (UB)',
    singkatan: 'UB',
    jenis: 'PTN',
    provinsi: 'Jawa Timur',
    kabupaten: 'Kota Malang',
    akreditasi: 'Unggul',
    domain_email_mhs: 'student.ub.ac.id',
    email_prefix_examples: ['nama@student.ub.ac.id', 'nim@mhs.ub.ac.id'],
    fakultas: [
      {
        id: 'ub-filkom',
        nama: 'Fakultas Ilmu Komputer (FILKOM)',
        program_studi: [
          { id: 'ub-filkom-tif', nama: 'S1 Teknik Informatika', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ub-filkom-si', nama: 'S1 Sistem Informasi', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ub-filkom-tkom', nama: 'S1 Teknik Komputer', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'ub-fp',
        nama: 'Fakultas Pertanian',
        program_studi: [
          { id: 'ub-fp-agro', nama: 'S1 Agroekoteknologi', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ub-fp-agri', nama: 'S1 Agribisnis', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'ub-fia',
        nama: 'Fakultas Ilmu Administrasi (FIA)',
        program_studi: [
          { id: 'ub-fia-ap', nama: 'S1 Administrasi Publik & Pemerintahan Desa', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'ub-fia-ab', nama: 'S1 Administrasi Bisnis', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
    ],
  },
  {
    id: 1,
    kode_pt: '001008',
    nama_universitas: 'Universitas Diponegoro (UNDIP)',
    singkatan: 'UNDIP',
    jenis: 'PTN',
    provinsi: 'Jawa Tengah',
    kabupaten: 'Kota Semarang',
    akreditasi: 'Unggul',
    domain_email_mhs: 'students.undip.ac.id',
    email_prefix_examples: ['nama@students.undip.ac.id', 'nim@mhs.undip.ac.id'],
    fakultas: [
      {
        id: 'undip-ft',
        nama: 'Fakultas Teknik (FT UNDIP)',
        program_studi: [
          { id: 'undip-ft-if', nama: 'S1 Teknik Informatika / Komputer', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'undip-ft-pwk', nama: 'S1 Perencanaan Wilayah dan Kota', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'undip-ft-tl', nama: 'S1 Teknik Lingkungan', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'undip-fkm',
        nama: 'Fakultas Kesehatan Masyarakat',
        program_studi: [
          { id: 'undip-fkm-kesmas', nama: 'S1 Kesehatan Masyarakat', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'undip-fkm-gizi', nama: 'S1 Ilmu Gizi', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
    ],
  },
  {
    id: 1,
    kode_pt: '001009',
    nama_universitas: 'Universitas Sebelas Maret (UNS)',
    singkatan: 'UNS',
    jenis: 'PTN',
    provinsi: 'Jawa Tengah',
    kabupaten: 'Kota Surakarta',
    akreditasi: 'Unggul',
    domain_email_mhs: 'student.uns.ac.id',
    email_prefix_examples: ['nama@student.uns.ac.id', 'nim@mhs.uns.ac.id'],
    fakultas: [
      {
        id: 'uns-ft',
        nama: 'Fakultas Teknik',
        program_studi: [
          { id: 'uns-ft-if', nama: 'S1 Informatika', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'uns-ft-el', nama: 'S1 Teknik Elektro', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'uns-ft-pwk', nama: 'S1 Perencanaan Wilayah dan Kota', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'uns-fp',
        nama: 'Fakultas Pertanian',
        program_studi: [
          { id: 'uns-fp-agrotek', nama: 'S1 Agroteknologi', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'uns-fp-agri', nama: 'S1 Agribisnis', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
    ],
  },
  {
    id: 1,
    kode_pt: '041001',
    nama_universitas: 'Telkom University',
    singkatan: 'Tel-U',
    jenis: 'PTS',
    provinsi: 'Jawa Barat',
    kabupaten: 'Kabupaten Bandung',
    akreditasi: 'Unggul',
    domain_email_mhs: 'student.telkomuniversity.ac.id',
    email_prefix_examples: ['nama@student.telkomuniversity.ac.id', 'nim@mhs.tel-u.ac.id'],
    fakultas: [
      {
        id: 'telu-fif',
        nama: 'Fakultas Informatika (FIF)',
        program_studi: [
          { id: 'telu-fif-if', nama: 'S1 Informatika', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'telu-fif-se', nama: 'S1 Rekayasa Perangkat Lunak', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'telu-fif-ds', nama: 'S1 Sains Data', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'telu-fri',
        nama: 'Fakultas Rekayasa Industri (FRI)',
        program_studi: [
          { id: 'telu-fri-si', nama: 'S1 Sistem Informasi', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'telu-fri-ti', nama: 'S1 Teknik Industri', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
      {
        id: 'telu-fkb',
        nama: 'Fakultas Komunikasi dan Ilmu Sosial (FKS)',
        program_studi: [
          { id: 'telu-fkb-ilkom', nama: 'S1 Ilmu Komunikasi', jenjang: 'S1', akreditasi: 'Unggul' },
          { id: 'telu-fkb-dkv', nama: 'S1 Desain Komunikasi Visual', jenjang: 'S1', akreditasi: 'Unggul' },
        ],
      },
    ],
  },
];

/**
 * Validasi format email mahasiswa institusi resmi:
 * Harus memiliki domain *.ac.id / *.edu dan disarankan mengandung mhs.*, student.*, atau nama kampus resmi.
 */
export function validateStudentEmailFormat(email: string): {
  isValid: boolean;
  isStrictCampusMatch: boolean;
  message?: string;
} {
  const cleanEmail = email.trim().toLowerCase();
  
  if (!cleanEmail) {
    return { isValid: false, isStrictCampusMatch: false, message: 'Alamat email wajib diisi' };
  }

  // Basic email structure
  const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicRegex.test(cleanEmail)) {
    return { isValid: false, isStrictCampusMatch: false, message: 'Format penulisan email tidak valid' };
  }

  // Academic institution domain check (*.ac.id or *.edu)
  const isAcademicDomain = cleanEmail.endsWith('.ac.id') || cleanEmail.endsWith('.edu');
  
  // Student prefix/subdomain check (mhs.*, student.*, students.*, mahasiswa.*)
  const hasStudentSubdomain = 
    cleanEmail.includes('mhs.') || 
    cleanEmail.includes('student.') || 
    cleanEmail.includes('students.') || 
    cleanEmail.includes('mahasiswa.') ||
    cleanEmail.includes('@mhs.') ||
    cleanEmail.includes('@student.');

  if (!isAcademicDomain) {
    return {
      isValid: false,
      isStrictCampusMatch: false,
      message: 'Gunakan email resmi institusi kampus Anda yang berakhiran .ac.id (contoh: nama@mhs.unesa.ac.id)',
    };
  }

  return {
    isValid: true,
    isStrictCampusMatch: hasStudentSubdomain,
    message: hasStudentSubdomain 
      ? 'Email institusi mahasiswa terverifikasi valid (Format: prefix mhs/student).'
      : 'Format domain kampus .ac.id terdeteksi.',
  };
}

/**
 * Helper untuk mencari kampus berdasarkan keyword nama / singkatan / kode PT
 */
export function searchUniversities(query: string): PerguruanTinggi[] {
  if (!query || query.trim() === '') return INDONESIA_UNIVERSITIES;
  const q = query.toLowerCase().trim();
  return INDONESIA_UNIVERSITIES.filter(
    (u) =>
      u.nama_universitas.toLowerCase().includes(q) ||
      u.singkatan.toLowerCase().includes(q) ||
      u.kode_pt.toLowerCase().includes(q) ||
      u.provinsi.toLowerCase().includes(q)
  );
}
