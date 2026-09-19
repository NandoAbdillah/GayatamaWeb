export type UniversitasStatus = 'Terverifikasi' | 'Aktif' | 'Menunggu';

export interface MonitoringUniv {
  id: string;
  nama: string;
  kode: string;
  provinsi: string;
  kabupaten_kota: string;
  status: UniversitasStatus;
  total_program: number;
  program_aktif: number;
  program_selesai: number;
}

export type ProgramStatus = 'Aktif' | 'Selesai';

export interface ProgramKKN {
  id: string;
  universitas_id: string;
  nama_program: string;
  nama_desa: string;
  kabupaten_kota: string;
  jumlah_mahasiswa: number;
  jumlah_dpl: number;
  periode: string;
  status: ProgramStatus;
}

export const MONITORING_UNIV: MonitoringUniv[] = [
  {
    id: 'unesa',
    nama: 'Universitas Negeri Surabaya',
    kode: 'UNESA',
    provinsi: 'Jawa Timur',
    kabupaten_kota: 'Kota Surabaya',
    status: 'Terverifikasi',
    total_program: 8,
    program_aktif: 5,
    program_selesai: 3,
  },
  {
    id: 'its',
    nama: 'Institut Teknologi Sepuluh Nopember',
    kode: 'ITS',
    provinsi: 'Jawa Timur',
    kabupaten_kota: 'Kota Surabaya',
    status: 'Terverifikasi',
    total_program: 6,
    program_aktif: 3,
    program_selesai: 2,
  },
  {
    id: 'unair',
    nama: 'Universitas Airlangga',
    kode: 'UNAIR',
    provinsi: 'Jawa Timur',
    kabupaten_kota: 'Kota Surabaya',
    status: 'Menunggu',
    total_program: 4,
    program_aktif: 2,
    program_selesai: 1,
  },
  {
    id: 'ub',
    nama: 'Universitas Brawijaya',
    kode: 'UB',
    provinsi: 'Jawa Timur',
    kabupaten_kota: 'Kab. Malang',
    status: 'Aktif',
    total_program: 7,
    program_aktif: 4,
    program_selesai: 3,
  },
  {
    id: 'ugm',
    nama: 'Universitas Gadjah Mada',
    kode: 'UGM',
    provinsi: 'DI Yogyakarta',
    kabupaten_kota: 'Kab. Sleman',
    status: 'Terverifikasi',
    total_program: 9,
    program_aktif: 6,
    program_selesai: 3,
  },
  {
    id: 'undip',
    nama: 'Universitas Diponegoro',
    kode: 'UNDIP',
    provinsi: 'Jawa Tengah',
    kabupaten_kota: 'Kota Semarang',
    status: 'Aktif',
    total_program: 5,
    program_aktif: 2,
    program_selesai: 2,
  },
];

export const PROGRAM_KKN: ProgramKKN[] = [
  // UNESA
  { id: 'p1', universitas_id: 'unesa', nama_program: 'Digitalisasi UMKM Kripik Singkong', nama_desa: 'Desa Sukamaju', kabupaten_kota: 'Kab. Jombang', jumlah_mahasiswa: 12, jumlah_dpl: 2, periode: 'Agu - Okt 2025', status: 'Aktif' },
  { id: 'p2', universitas_id: 'unesa', nama_program: 'Posyandu Digital & Cegah Stunting', nama_desa: 'Desa Sukamaju', kabupaten_kota: 'Kab. Jombang', jumlah_mahasiswa: 15, jumlah_dpl: 2, periode: 'Jul - Sep 2025', status: 'Aktif' },
  { id: 'p3', universitas_id: 'unesa', nama_program: 'Literasi Digital SDN Pacet', nama_desa: 'Desa Cempaka Putih', kabupaten_kota: 'Kab. Mojokerto', jumlah_mahasiswa: 10, jumlah_dpl: 1, periode: 'Jun - Agu 2025', status: 'Selesai' },
  { id: 'p4', universitas_id: 'unesa', nama_program: 'Branding Desa Wisata Trawas', nama_desa: 'Desa Maju Bersama', kabupaten_kota: 'Kab. Mojokerto', jumlah_mahasiswa: 14, jumlah_dpl: 2, periode: 'Sep - Nov 2025', status: 'Aktif' },
  { id: 'p5', universitas_id: 'unesa', nama_program: 'Pengolahan Sampah Biogas', nama_desa: 'Desa Berkah Makmur', kabupaten_kota: 'Kab. Pasuruan', jumlah_mahasiswa: 8, jumlah_dpl: 1, periode: 'Mei - Jul 2025', status: 'Selesai' },
  { id: 'p6', universitas_id: 'unesa', nama_program: 'Ruang Terbuka Hijau Desa', nama_desa: 'Desa Berkah Makmur', kabupaten_kota: 'Kab. Pasuruan', jumlah_mahasiswa: 9, jumlah_dpl: 1, periode: 'Agu - Okt 2025', status: 'Aktif' },
  { id: 'p7', universitas_id: 'unesa', nama_program: 'Edukasi UMKM Kopi', nama_desa: 'Desa Maju Bersama', kabupaten_kota: 'Kab. Mojokerto', jumlah_mahasiswa: 11, jumlah_dpl: 2, periode: 'Jul - Sep 2025', status: 'Selesai' },
  { id: 'p8', universitas_id: 'unesa', nama_program: 'Pelatihan Keuangan Digital', nama_desa: 'Desa Sukamaju', kabupaten_kota: 'Kab. Jombang', jumlah_mahasiswa: 13, jumlah_dpl: 2, periode: 'Okt - Des 2025', status: 'Aktif' },
  // ITS
  { id: 'p9', universitas_id: 'its', nama_program: 'Instalasi Biogas Ternak', nama_desa: 'Desa Sumber Rejo', kabupaten_kota: 'Kab. Sidoarjo', jumlah_mahasiswa: 10, jumlah_dpl: 1, periode: 'Agu - Okt 2025', status: 'Aktif' },
  { id: 'p10', universitas_id: 'its', nama_program: 'Water Treatment Desa', nama_desa: 'Desa Kepuh', kabupaten_kota: 'Kab. Gresik', jumlah_mahasiswa: 12, jumlah_dpl: 2, periode: 'Jun - Agu 2025', status: 'Selesai' },
  { id: 'p11', universitas_id: 'its', nama_program: 'Smart Farming Hidroponik', nama_desa: 'Desa Cerme', kabupaten_kota: 'Kab. Gresik', jumlah_mahasiswa: 9, jumlah_dpl: 1, periode: 'Sep - Nov 2025', status: 'Aktif' },
  { id: 'p12', universitas_id: 'its', nama_program: 'Energi Bersih Panel Surya', nama_desa: 'Desa Menganti', kabupaten_kota: 'Kab. Gresik', jumlah_mahasiswa: 11, jumlah_dpl: 2, periode: 'Jul - Sep 2025', status: 'Aktif' },
  { id: 'p13', universitas_id: 'its', nama_program: 'Manajemen Sampah Digital', nama_desa: 'Desa Driyorejo', kabupaten_kota: 'Kab. Gresik', jumlah_mahasiswa: 8, jumlah_dpl: 1, periode: 'Mei - Jul 2025', status: 'Selesai' },
  { id: 'p14', universitas_id: 'its', nama_program: 'Jembatan Bambu Desa', nama_desa: 'Desa Kedamean', kabupaten_kota: 'Kab. Gresik', jumlah_mahasiswa: 10, jumlah_dpl: 1, periode: 'Okt - Des 2025', status: 'Selesai' },
  // UNAIR
  { id: 'p15', universitas_id: 'unair', nama_program: 'Edukasi Kesehatan Ibu & Anak', nama_desa: 'Desa Tambak', kabupaten_kota: 'Kab. Sidoarjo', jumlah_mahasiswa: 14, jumlah_dpl: 2, periode: 'Jul - Sep 2025', status: 'Aktif' },
  { id: 'p16', universitas_id: 'unair', nama_program: 'Vaksinasi & Posyandu', nama_desa: 'Desa Waru', kabupaten_kota: 'Kab. Sidoarjo', jumlah_mahasiswa: 12, jumlah_dpl: 2, periode: 'Jun - Agu 2025', status: 'Selesai' },
  { id: 'p17', universitas_id: 'unair', nama_program: 'Kesehatan Lingkungan Pesisir', nama_desa: 'Desa Sedati', kabupaten_kota: 'Kab. Sidoarjo', jumlah_mahasiswa: 10, jumlah_dpl: 1, periode: 'Sep - Nov 2025', status: 'Aktif' },
  { id: 'p18', universitas_id: 'unair', nama_program: 'Gizi Seimbang Balita', nama_desa: 'Desa Buduran', kabupaten_kota: 'Kab. Sidoarjo', jumlah_mahasiswa: 9, jumlah_dpl: 1, periode: 'Okt - Des 2025', status: 'Selesai' },
  // UB
  { id: 'p19', universitas_id: 'ub', nama_program: 'Agroforestri Desa Pujon', nama_desa: 'Desa Pujon', kabupaten_kota: 'Kab. Malang', jumlah_mahasiswa: 15, jumlah_dpl: 2, periode: 'Agu - Okt 2025', status: 'Aktif' },
  { id: 'p20', universitas_id: 'ub', nama_program: 'Pemasaran Apel Malang', nama_desa: 'Desa Batu', kabupaten_kota: 'Kota Batu', jumlah_mahasiswa: 12, jumlah_dpl: 2, periode: 'Jul - Sep 2025', status: 'Aktif' },
  { id: 'p21', universitas_id: 'ub', nama_program: 'Konservasi Sumber Air', nama_desa: 'Desa Ngantang', kabupaten_kota: 'Kab. Malang', jumlah_mahasiswa: 10, jumlah_dpl: 1, periode: 'Jun - Agu 2025', status: 'Selesai' },
  // UGM
  { id: 'p22', universitas_id: 'ugm', nama_program: 'Pariwisata Desa Nglanggeran', nama_desa: 'Desa Nglanggeran', kabupaten_kota: 'Kab. Gunungkidul', jumlah_mahasiswa: 16, jumlah_dpl: 2, periode: 'Agu - Okt 2025', status: 'Aktif' },
  // UNDIP
  { id: 'p23', universitas_id: 'undip', nama_program: 'Tambak Udang Digital', nama_desa: 'Desa Morodemak', kabupaten_kota: 'Kab. Demak', jumlah_mahasiswa: 13, jumlah_dpl: 2, periode: 'Sep - Nov 2025', status: 'Aktif' },
];

export function getUnivById(id: string): MonitoringUniv | undefined {
  return MONITORING_UNIV.find((u) => u.id === id);
}

export function getProgramsByUnivId(univId: string): ProgramKKN[] {
  return PROGRAM_KKN.filter((p) => p.universitas_id === univId);
}
