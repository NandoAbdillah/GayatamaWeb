export interface VerifikasiItem {
  id: number;
  entity_type: 'universitas' | 'desa' | 'mahasiswa';
  nama: string;
  sub_info: string;
  pemohon: string;
  email: string;
  kontak: string;
  dokumen: string;
  dokumen_url?: string | null;
  status: 'pending' | 'verified';
  tanggal_pengajuan: string;
  created_at_raw?: string;
  ai_trust_score?: number;
  ai_risk_level?: 'low' | 'medium' | 'high';
  ai_audit?: {
    engine?: string;
    trust_score?: number;
    risk_level?: 'low' | 'medium' | 'high';
    audited_at?: string;
    extracted_data?: {
      nomor_sk?: string;
      tanggal_sk?: string;
      nama_pejabat?: string;
      nama_tertulis?: string;
      institusi_tertulis?: string;
      dokumen_file?: string;
    };
    checks?: {
      domain_acid_verified?: boolean;
      nama_matched?: boolean;
      institusi_matched?: boolean;
      official_letterhead?: boolean;
      digital_signature_or_seal?: boolean;
      anti_tamper_passed?: boolean;
    };
    summary_verdict?: string;
  };
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
    sub_info: 'Lembaga Pengabdian Masyarakat & Inovasi (LPPM / LPM)',
    pemohon: 'Prof. Dr. Moh. Nasih, SE., MT., Ak.',
    email: 'unair@unair.ac.id',
    kontak: '081234567003',
    dokumen: 'SK_Pendirian_LPPM_UNAIR_2024.pdf',
    dokumen_url: null,
    status: 'pending',
    tanggal_pengajuan: '14 September 2026',
    ai_trust_score: 95,
    ai_risk_level: 'low',
    ai_audit: {
      engine: 'gemini_flash_multimodal',
      trust_score: 95,
      risk_level: 'low',
      audited_at: '2026-09-14T10:00:00Z',
      extracted_data: {
        nomor_sk: '012/UN3/HK/2024',
        tanggal_sk: '12 Januari 2024',
        nama_pejabat: 'Prof. Dr. Moh. Nasih, SE., MT., Ak.',
        nama_tertulis: 'Prof. Dr. Moh. Nasih, SE., MT., Ak.',
        institusi_tertulis: 'Universitas Airlangga',
      },
      checks: {
        domain_acid_verified: true,
        nama_matched: true,
        institusi_matched: true,
        official_letterhead: true,
        digital_signature_or_seal: true,
        anti_tamper_passed: true,
      },
      summary_verdict: 'SK Rektor Universitas Airlangga terverifikasi otentik. TTE BSrE terdeteksi sah dengan kesesuaian data pendaftar 100% dan domain email institusi resmi (@unair.ac.id).',
    },
    detail_info: [
      { label: 'Kode Institusi', value: 'UNAIR' },
      { label: 'Status Legalitas', value: 'Menunggu Validasi Dokumen Legalitas' },
      { label: 'DPL Terdaftar', value: '2 Dosen DPL Aktif' },
      { label: 'Email Resmi Institusi', value: 'unair@unair.ac.id' },
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
    dokumen_url: null,
    status: 'pending',
    tanggal_pengajuan: '15 September 2026',
    detail_info: [
      { label: 'Wilayah Administratif', value: 'Kec. Trawas, Kab. Mojokerto, Jawa Timur' },
      { label: 'Koordinat Lokasi', value: '-7.6811, 112.5934' },
      { label: 'Pos Kebutuhan Terdata', value: '2 Pos Kebutuhan Aktif' },
      { label: 'Kontak Resmi Perangkat', value: '081234567204' },
    ],
  },
];

export function getVerifikasiByKey(key: string): VerifikasiItem | undefined {
  // key format: `${entity_type}-${id}` e.g. universitas-3
  return INITIAL_VERIFIKASI_DATA.find((v) => `${v.entity_type}-${v.id}` === key);
}
