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
