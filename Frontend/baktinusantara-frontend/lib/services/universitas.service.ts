import apiClient from '@/lib/api-client';
import { LaporanDosenItem, User } from '@/lib/types';

export interface CreateDosenPayload {
  name: string;
  email: string;
  password: string;
  nip: string;
  no_hp: string;
}

export interface MasterUniversitasItem {
  id?: string;
  nama_universitas: string;
  nama_singkat?: string | null;
  kode_univ: string;
  jenis?: string;
  kelompok?: string;
  akreditasi: string;
  alamat_kampus?: string;
  provinsi?: string;
  kabupaten_kota?: string;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_verified?: boolean;
}

export const universitasService = {
  /**
   * Get public list of registered universities
   * Endpoint: GET /api/universitas
   */
  async getUniversitasList(): Promise<any[]> {
    const res = await apiClient.get<any[]>('/api/universitas');
    return res.data;
  },

  /**
   * Get master database of universities with PDDikti codes
   * Endpoint: GET /api/universitas/master?search=...
   */
  async getMasterList(search?: string): Promise<MasterUniversitasItem[]> {
    const res = await apiClient.get<MasterUniversitasItem[]>('/api/universitas/master', {
      params: search ? { search } : undefined,
    });
    return res.data;
  },

  /**
   * Check if a university PDDikti code is already claimed
   * Endpoint: POST /api/register/universitas/check-kode
   */
  async checkKodeAvailability(kode_univ: string): Promise<{
    available: boolean;
    is_registered: boolean;
    message: string;
  }> {
    const res = await apiClient.post('/api/register/universitas/check-kode', { kode_univ });
    return res.data;
  },

  /**
   * Scan SK document in realtime and extract legal entities (e-KYC style)
   * Endpoint: POST /api/register/universitas/scan-sk
   */
  async scanDocumentRealtime(file: File, context?: {
    nama_universitas?: string;
    kode_univ?: string;
    email?: string;
    name?: string;
    nip_admin?: string;
  }): Promise<{
    success: boolean;
    is_valid?: boolean;
    status_verifikasi?: string;
    engine?: string;
    extracted?: {
      judul_sk?: string;
      nomor_sk?: string;
      instansi_penerbit?: string;
      pejabat_penandatangan?: string;
      nama_tertulis?: string;
      nip_tertulis?: string;
      tanggal_sk?: string;
      berlaku_sampai?: string;
      has_kop_resmi?: boolean;
      has_tte_or_qr_code?: boolean;
      has_cap_stempel?: boolean;
      has_materai?: boolean;
      dokumen_filename?: string;
    } | null;
    trust_score?: number;
    catatan?: string;
  }> {
    const form = new FormData();
    form.append('file', file);
    if (context?.nama_universitas) form.append('nama_universitas', context.nama_universitas);
    if (context?.kode_univ) form.append('kode_univ', context.kode_univ);
    if (context?.email) form.append('email', context.email);
    if (context?.name) form.append('name', context.name);
    if (context?.nip_admin) form.append('nip_admin', context.nip_admin);

    const res = await apiClient.post('/api/register/universitas/scan-sk', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /**
   * Register a new university with official SK file
   * Endpoint: POST /api/register/universitas
   */
  async registerUniversitas(formData: FormData): Promise<{
    message: string;
    data: any;
  }> {
    const res = await apiClient.post('/api/register/universitas', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /**
   * Add a new lecturer under this university (Universitas)
   * Endpoint: POST /api/universitas/dosen
   */
  async addDosen(payload: CreateDosenPayload): Promise<{
    message: string;
    data: any;
  }> {
    const res = await apiClient.post('/api/universitas/dosen', payload);
    return res.data;
  },

  /**
   * List all lecturers belonging to this university
   * Endpoint: GET /api/universitas/dosen
   */
  async getDosenList(): Promise<any[]> {
    const res = await apiClient.get<any[]>('/api/universitas/dosen');
    return res.data;
  },

  /**
   * List all village evaluation reports about university's lecturers
   * Endpoint: GET /api/universitas/laporan-dosen
   */
  async getLaporanDosen(): Promise<LaporanDosenItem[]> {
    const res = await apiClient.get<LaporanDosenItem[]>('/api/universitas/laporan-dosen');
    return res.data;
  },

  /**
   * Update review status of a lecturer evaluation report
   * Endpoint: PATCH /api/universitas/laporan-dosen/{id}/status
   */
  async updateLaporanStatus(
    id: number | string,
    status: 'menunggu' | 'ditinjau' | 'selesai'
  ): Promise<{ message: string; data: LaporanDosenItem }> {
    const res = await apiClient.patch(`/api/universitas/laporan-dosen/${id}/status`, {
      status,
    });
    return res.data;
  },

  /**
   * Submit evaluation report for a DPL by village (Perangkat Desa)
   * Endpoint: POST /api/desa/laporan-dosen
   */
  async sendLaporanDosen(payload: {
    dosen_id: number | string;
    proposal_id: number | string;
    isi: string;
  }): Promise<{ message: string; data: any }> {
    const res = await apiClient.post('/api/desa/laporan-dosen', payload);
    return res.data;
  },
};

export default universitasService;
