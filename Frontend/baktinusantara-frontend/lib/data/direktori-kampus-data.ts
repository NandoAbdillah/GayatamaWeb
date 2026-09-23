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
