export type UserRole =
  | 'masyarakat'
  | 'mahasiswa'
  | 'perangkat_desa'
  | 'dosen'
  | 'universitas'
  | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  avatar_url?: string;
  phone?: string;
  created_at?: string;
  profile?: MahasiswaProfile | PerangkatDesaProfile | DosenProfile | UniversitasProfile;
}

export interface MahasiswaProfile {
  id: number;
  user_id: number;
  nim: string;
  jurusan: string;
  fakultas: string;
  angkatan: string;
  ktm_url?: string;
  total_jam_kkn: number;
  target_jam_kkn: number;
  kelompok_id?: number;
  kelompok?: Kelompok;
}

export interface PerangkatDesaProfile {
  id: number;
  user_id: number;
  nama_desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  jabatan: string;
  sk_url?: string;
  latitude?: number;
  longitude?: number;
  kepala_desa?: string;
}

export interface DosenProfile {
  id: number;
  user_id: number;
  nip: string;
  fakultas: string;
  departemen: string;
  bidang_keahlian?: string;
  kuota_bimbingan: number;
  jumlah_kelompok_binaan: number;
}

export interface UniversitasProfile {
  id: number;
  user_id: number;
  kode_kampus: string;
  nama_universitas: string;
  lppm_ketua?: string;
}

export interface Aspirasi {
  id: number;
  ticket_number: string;
  desa_id: number;
  nama_pengadu: string;
  nomor_kontak?: string;
  judul: string;
  deskripsi: string;
  kategori: 'Infrastruktur' | 'Kesehatan' | 'Pendidikan' | 'Ekonomi / UMKM' | 'Lingkungan' | 'Lainnya';
  status: 'pending' | 'verified' | 'converted_to_pos' | 'rejected';
  tanggapan_desa?: string;
  created_at: string;
}

export interface PosKebutuhan {
  id: number;
  desa_id: number;
  nama_desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  judul: string;
  deskripsi: string;
  kategori_sektor: 'Agrikultur & Ketahanan Pangan' | 'Kesehatan & Sanitasi' | 'Digitalisasi & Teknologi Desa' | 'Pemberdayaan UMKM' | 'Pendidikan & Literasi' | 'Lingkungan & Energi';
  kuota_mahasiswa: number;
  terisi_mahasiswa: number;
  latitude: number;
  longitude: number;
  target_luaran: string[];
  kriteria_jurusan: string[];
  status: 'open' | 'in_progress' | 'completed';
  matching_score?: number;
  distance_km?: number;
  created_at: string;
}

export interface Kelompok {
  id: number;
  nama_kelompok: string;
  kode_kelompok: string;
  ketua_id: number;
  ketua_nama: string;
  dosen_id?: number;
  dosen_nama?: string;
  pos_kebutuhan_id?: number;
  pos_kebutuhan_judul?: string;
  desa_nama?: string;
  anggota: {
    id: number;
    user_id: number;
    nama: string;
    nim: string;
    jurusan: string;
    role_kelompok: 'Ketua' | 'Anggota';
    avatar_url?: string;
  }[];
  total_anggota: number;
  status_program: 'perencanaan' | 'pelaksanaan' | 'penyusunan_luaran' | 'selesai';
  progres_persen: number;
}

export interface Proposal {
  id: number;
  kelompok_id: number;
  pos_kebutuhan_id: number;
  judul_program: string;
  ringkasan_eksekutif: string;
  dokumen_url?: string;
  status_desa: 'pending' | 'approved' | 'rejected' | 'revision';
  status_dosen: 'pending' | 'approved' | 'rejected' | 'revision';
  catatan_desa?: string;
  catatan_dosen?: string;
  tanggal_pengajuan: string;
  anggaran_diusulkan: number;
  pos_kebutuhan?: PosKebutuhan;
  kelompok?: Kelompok;
}

export interface LogbookEntry {
  id: number;
  kelompok_id: number;
  mahasiswa_id: number;
  mahasiswa_nama: string;
  mahasiswa_nim: string;
  mahasiswa_jurusan: string;
  tanggal: string;
  minggu_ke: number;
  durasi_jam: number;
  judul_kegiatan: string;
  deskripsi: string;
  target_program_terkait: string;
  foto_dokumentasi_urls: string[];
  status: 'draft' | 'submitted' | 'approved' | 'revision';
  catatan_revisi_dpl?: string;
  disahkan_pada?: string;
}

export interface LuaranAkhir {
  id: number;
  kelompok_id: number;
  judul_luaran: string;
  jenis_luaran: 'Laporan Akhir KKN' | 'Video Dokumenter' | 'Modul / Panduan Desa' | 'Produk UMKM Inovasi' | 'Publikasi Jurnal / Media';
  file_url?: string;
  link_eksternal?: string;
  deskripsi: string;
  status_verifikasi_desa: 'pending' | 'approved' | 'rejected';
  status_verifikasi_dpl: 'pending' | 'approved' | 'rejected';
  nilai_akhir?: number;
  catatan?: string;
  slug?: string;
}

export interface BASTDocument {
  id: number;
  kelompok_id: number;
  desa_id: number;
  nomor_surat: string;
  tanggal_penyerahan: string;
  nama_kades: string;
  nama_ketua_kelompok: string;
  nama_dpl: string;
  daftar_luaran_diserahkan: string[];
  nilai_mitra_desa: number;
  komentar_evaluasi_desa: string;
  status_tanda_tangan: 'draft' | 'signed_desa' | 'completed';
  qr_code_verify_url: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success?: boolean;
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface NationalMetrics {
  total_desa_terbantu: number;
  total_umkm_terdigitalisasi: number;
  total_kelompok_kkn: number;
  total_mahasiswa_terlibat: number;
  total_jam_pengabdian: number;
  total_pos_kebutuhan: number;
  status_pos_breakdown: {
    open: number;
    in_progress: number;
    completed: number;
  };
  total_luaran_terverifikasi: number;
  total_portofolio_publik: number;
  kategori_breakdown: Record<string, number>;
  sdgs_distribution: Record<string, number>;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type?: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface WilayahItem {
  id: string;
  name: string;
}

export interface PortofolioPublik {
  id: number;
  slug: string;
  judul_program: string;
  ringkasan_dampak: string;
  testimoni_desa: string;
  sertifikat_pdf_url?: string;
  created_at?: string;
  kelompok?: {
    id: number;
    nama_kelompok: string;
    anggota?: any[];
  };
  desa?: {
    id: number;
    nama_desa: string;
    kecamatan: string;
    kabupaten: string;
    provinsi: string;
    user?: {
      name: string;
      email: string;
    };
  };
  proposal?: any;
  luaran?: any;
}

export interface LaporanDosenItem {
  id: number;
  dosen_id: number;
  proposal_id: number;
  isi: string;
  status: 'menunggu' | 'ditinjau' | 'selesai';
  dosen?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
}
