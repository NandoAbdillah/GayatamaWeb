export interface VerifikasiItem {
  id: number;
  entity_type: 'universitas' | 'desa' | 'mahasiswa';
  nama: string;
  sub_info: string;
  pemohon: string;
  email: string;
  kontak: string;
  dokumen: string;
  dokumen_url?: string;
  status: 'pending' | 'verified';
  tanggal_pengajuan: string;
  detail_info: {
    label: string;
    value: string;
  }[];
}

export const INITIAL_VERIFIKASI_DATA: VerifikasiItem[] = [
  {
    id: 3,
    entity_type: 'universitas',
    nama: 'Universitas Airlangga (UNAIR)',
    sub_info: 'Lembaga Pengabdian Masyarakat & Inovasi (LPPM)',
    pemohon: 'Prof. Dr. Moh. Nasih, SE., MT., Ak.',
    email: 'unair@unair.ac.id',
    kontak: '081234567003',
    dokumen: 'SK_Pendirian_LPPM_UNAIR_2024.pdf',
    dokumen_url: '#',
    status: 'pending',
    tanggal_pengajuan: '14 September 2026',
    detail_info: [
      { label: 'Kode Institusi', value: 'UNAIR' },
      { label: 'Domisili Kampus', value: 'Kota Surabaya, Jawa Timur' },
      { label: 'Akreditasi', value: 'Unggul (A)' },
      { label: 'Fokus Pengabdian', value: 'Kesehatan Masyarakat, Maritim, & Sains Sosial' },
    ],
  },
  {
    id: 4,
    entity_type: 'desa',
    nama: 'Desa Maju Bersama',
    sub_info: 'Kec. Trawas, Kab. Mojokerto, Jawa Timur',
    pemohon: 'Kantor Balai Desa Maju Bersama',
    email: 'desa.pending@desa.id',
    kontak: '081234567204',
    dokumen: 'SK_Bupati_Kepala_Desa_Maju_Bersama.pdf',
    dokumen_url: '#',
    status: 'pending',
    tanggal_pengajuan: '15 September 2026',
    detail_info: [
      { label: 'Kecamatan / Kabupaten', value: 'Trawas / Kab. Mojokerto' },
      { label: 'Koordinat Lokasi', value: '-7.6811, 112.5934' },
      { label: 'Jumlah Penduduk', value: '3,420 Jiwa (4 Dusun)' },
      { label: 'Kebutuhan Mendesak', value: 'Digitalisasi Desa Wisata & Pengolahan Kopi' },
    ],
  },
  {
    id: 1,
    entity_type: 'universitas',
    nama: 'Universitas Negeri Surabaya (UNESA)',
    sub_info: 'Lembaga Pengabdian Kepada Masyarakat (LPM)',
    pemohon: 'Dr. Budi Santoso (Ketua LPM)',
    email: 'unesa@unesa.ac.id',
    kontak: '081234567001',
    dokumen: 'SK_Rektor_LPM_UNESA.pdf',
    dokumen_url: '#',
    status: 'verified',
    tanggal_pengajuan: '01 Agustus 2026',
    detail_info: [
      { label: 'Kode Institusi', value: 'UNESA' },
      { label: 'Status Legalitas', value: 'Terverifikasi Resmi oleh Admin Platform' },
      { label: 'DPL Terdaftar', value: '2 Dosen DPL Aktif' },
    ],
  },
  {
    id: 2,
    entity_type: 'universitas',
    nama: 'Institut Teknologi Sepuluh Nopember (ITS)',
    sub_info: 'Direktorat Riset & Pengabdian Masyarakat (DRPM)',
    pemohon: 'Ir. Agus Setiawan, M.T.',
    email: 'its@its.ac.id',
    kontak: '081234567002',
    dokumen: 'SK_DRPM_ITS_Surabaya.pdf',
    dokumen_url: '#',
    status: 'verified',
    tanggal_pengajuan: '05 Agustus 2026',
    detail_info: [
      { label: 'Kode Institusi', value: 'ITS' },
      { label: 'Status Legalitas', value: 'Terverifikasi Resmi' },
      { label: 'Fokus Bidang', value: 'Rekayasa Teknologi Tepat Guna & Energi Bersih' },
    ],
  },
  {
    id: 1,
    entity_type: 'desa',
    nama: 'Desa Sukamaju',
    sub_info: 'Kec. Mojowarno, Kab. Jombang, Jawa Timur',
    pemohon: 'Kantor Kepala Desa Sukamaju',
    email: 'desa.sukamaju@desa.id',
    kontak: '081234567201',
    dokumen: 'SK_Bupati_Jombang_Kades_Sukamaju.pdf',
    dokumen_url: '#',
    status: 'verified',
    tanggal_pengajuan: '10 Agustus 2026',
    detail_info: [
      { label: 'Kecamatan / Kabupaten', value: 'Mojowarno / Kab. Jombang' },
      { label: 'Pos Kebutuhan Aktif', value: 'Digitalisasi UMKM & Posyandu' },
    ],
  },
];

export function getVerifikasiByKey(key: string): VerifikasiItem | undefined {
  // key format: `${entity_type}-${id}` e.g. universitas-3
  return INITIAL_VERIFIKASI_DATA.find((v) => `${v.entity_type}-${v.id}` === key);
}
