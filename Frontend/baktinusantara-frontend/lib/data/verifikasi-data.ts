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
