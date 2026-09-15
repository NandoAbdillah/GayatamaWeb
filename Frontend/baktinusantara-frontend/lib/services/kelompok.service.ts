import apiClient from '@/lib/api-client';
import { Kelompok } from '@/lib/types';

export const kelompokService = {
  /**
   * Create a new KKN student team (Ketua)
   * Endpoint: POST /api/kelompok
   */
  async createKelompok(namaKelompok: string): Promise<{
    message?: string;
    data: Kelompok;
  }> {
    const res = await apiClient.post('/api/kelompok', {
      nama_kelompok: namaKelompok,
    });
    return res.data;
  },

  /**
   * Join an existing student team with a major/contribution
   * Endpoint: POST /api/kelompok/{id}/join
   */
  async joinKelompok(kelompokId: number | string, jurusanKontribusi: string): Promise<{
    message?: string;
    data: any;
  }> {
    const res = await apiClient.post(`/api/kelompok/${kelompokId}/join`, {
      jurusan_kontribusi: jurusanKontribusi,
    });
    return res.data;
  },

  /**
   * Get team details and member list
   * Endpoint: GET /api/kelompok/{id}
   */
  async getDetail(kelompokId: number | string): Promise<Kelompok> {
    const res = await apiClient.get<Kelompok>(`/api/kelompok/${kelompokId}`);
    return res.data;
  },

  /**
   * Assign Dosen Pembimbing Lapangan (DPL) from same university
   * Endpoint: POST /api/kelompok/{id}/set-dosen
   */
  async setDosen(kelompokId: number | string, dosenId: number | string): Promise<{
    message?: string;
    data: any;
  }> {
    const res = await apiClient.post(`/api/kelompok/${kelompokId}/set-dosen`, {
      dosen_id: dosenId,
    });
    return res.data;
  },
};

export default kelompokService;
