export interface UnivDetail {
  id: number;
  nama_universitas: string;
  kode_univ: string;
  kota: string;
  status: 'verified' | 'pending';
  tanggal_verifikasi?: string;
  email: string;
  telepon: string;
  alamat_lengkap: string;
  website: string;
  domain: string;
  statistik: {
    jumlah_program_kkn: number;
    jumlah_mahasiswa: number;
    jumlah_dosen_dpl: number;
    jumlah_desa_ditangani: number;
  };
}

export function getLogoUrl(domain: string): string {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || 'pk_FKK0UKELT9yjnYjQ3KB3Kg';
  return `https://img.logo.dev/${domain}?token=${token}&retina=true`;
}

export const FALLBACK_UNIV_DETAIL: UnivDetail[] = [
  // {
  //   id: 1,
  //   nama_universitas: 'Universitas Negeri Surabaya',
  //   kode_univ: 'UNESA',
  //   kota: 'Surabaya, Jawa Timur',
  //   status: 'verified',
  //   tanggal_verifikasi: '12 Agustus 2024',
  //   email: 'humas@unesa.ac.id',
  //   telepon: '031-8280009 / 0812-3456-7890',
  //   alamat_lengkap: 'Jl. Ketintang, Kec. Gayungan, Kota Surabaya, Jawa Timur 60231',
  //   website: 'https://www.unesa.ac.id',
  //   domain: 'unesa.ac.id',
  //   statistik: {
  //     jumlah_program_kkn: 24,
  //     jumlah_mahasiswa: 842,
  //     jumlah_dosen_dpl: 18,
  //     jumlah_desa_ditangani: 32,
  //   },
  // },
  // {
  //   id: 2,
  //   nama_universitas: 'Institut Teknologi Sepuluh Nopember',
  //   kode_univ: 'ITS',
  //   kota: 'Surabaya, Jawa Timur',
  //   status: 'verified',
  //   tanggal_verifikasi: '05 September 2024',
  //   email: 'humas@its.ac.id',
  //   telepon: '031-5994251 / 0813-9876-5432',
  //   alamat_lengkap: 'Jl. Teknik Kimia, Keputih, Sukolilo, Surabaya, Jawa Timur 60111',
  //   website: 'https://www.its.ac.id',
  //   domain: 'its.ac.id',
  //   statistik: {
  //     jumlah_program_kkn: 18,
  //     jumlah_mahasiswa: 615,
  //     jumlah_dosen_dpl: 12,
  //     jumlah_desa_ditangani: 21,
  //   },
  // },
  // {
  //   id: 3,
  //   nama_universitas: 'Universitas Airlangga',
  //   kode_univ: 'UNAIR',
  //   kota: 'Surabaya, Jawa Timur',
  //   status: 'pending',
  //   tanggal_verifikasi: '-',
  //   email: 'info@unair.ac.id',
  //   telepon: '031-5914042 / 0821-1122-3344',
  //   alamat_lengkap: 'Jl. Airlangga No.4-6, Airlangga, Gubeng, Surabaya, Jawa Timur 60115',
  //   website: 'https://www.unair.ac.id',
  //   domain: 'unair.ac.id',
  //   statistik: {
  //     jumlah_program_kkn: 9,
  //     jumlah_mahasiswa: 210,
  //     jumlah_dosen_dpl: 7,
  //     jumlah_desa_ditangani: 11,
  //   },
  // },
];

export function getKampusById(id: number): UnivDetail | undefined {
  return FALLBACK_UNIV_DETAIL.find((u) => u.id === id);
}
