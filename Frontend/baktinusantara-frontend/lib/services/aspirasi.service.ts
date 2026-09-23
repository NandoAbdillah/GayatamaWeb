import apiClient from '@/lib/api-client';
import { Aspirasi } from '@/lib/types';

export interface SubmitAspirasiPayload {
  desa_id: number | string;
  pelapor_nama: string;
  pelapor_wa: string;
  kategori: 'umkm' | 'kesehatan' | 'lingkungan' | 'pendidikan' | 'fasilitas' | string;
  deskripsi: string;
  latitude?: number | string;
  longitude?: number | string;
  urgensi: 'rendah' | 'sedang' | 'mendesak' | string;
  foto?: File | Blob;
}

export interface DecideAspirasiPayload {
  action: 'approve' | 'reject';
  judul?: string;
  kuota_kelompok?: number;
  deadline?: string;
  sdg_codes?: number[];
  jurusan_dibutuhkan?: Record<string, number>;
  alasan_tolak?: string;
}

export const aspirasiService = {
  /**
   * Submit new public citizen aspiration
   * Endpoint: POST /api/aspirasi
   */
  async submitAspirasi(payload: SubmitAspirasiPayload | FormData): Promise<{
    message: string;
    nomor_tiket: number;
    data: Aspirasi;
  }> {
    let body: any = payload;
    if (!(payload instanceof FormData)) {
      const fd = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fd.append(key, value instanceof Blob ? value : String(value));
        }
      });
      body = fd;
    }
    const res = await apiClient.post('/api/aspirasi', body);
    return res.data;
  },

  /**
   * Check status of aspiration by ticket / ID (Public)
   * Endpoint: GET /api/aspirasi/{ticket}
   */
  async getByTicket(ticket: string | number): Promise<Aspirasi> {
    const res = await apiClient.get<any>(`/api/aspirasi/${ticket}`);
    return res.data?.data || res.data;
  },

  /**
   * Get all aspirations for authenticated Village (perangkat_desa)
   * Endpoint: GET /api/desa/aspirasi
   */
  async getByDesa(): Promise<Aspirasi[]> {
    const res = await apiClient.get<Aspirasi[]>('/api/desa/aspirasi');
    return res.data;
  },

  /**
   * Approve/Reject aspiration and convert to pos kebutuhan
   * Endpoint: PATCH /api/desa/aspirasi/{id}/decide
   */
  async decide(id: number | string, decision: DecideAspirasiPayload): Promise<{
    message: string;
    data: Aspirasi;
  }> {
    const res = await apiClient.patch(`/api/desa/aspirasi/${id}/decide`, decision);
    return res.data;
  },
};

export default aspirasiService;
