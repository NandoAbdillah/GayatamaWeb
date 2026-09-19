import apiClient from '@/lib/api-client';
import { VerifikasiItem } from '@/lib/data/verifikasi-data';

export interface VerifikasiListResponse {
  success: boolean;
  total: number;
  pending_count: number;
  verified_count: number;
  data: VerifikasiItem[];
}

export interface VerifikasiDetailResponse {
  success: boolean;
  data: VerifikasiItem;
  message?: string;
}

export const adminService = {
  /**
   * Get all verification entities (Perguruan Tinggi / Universitas and Mitra Desa)
   * Endpoint: GET /api/admin/verifikasi-entitas
   */
  async getVerifikasiList(): Promise<VerifikasiListResponse> {
    const res = await apiClient.get('/api/admin/verifikasi-entitas');
    return res.data;
  },

  /**
   * Get single verification entity detail
   * Endpoint: GET /api/admin/verifikasi-entitas/{type}/{id}
   */
  async getVerifikasiDetail(type: string, id: number | string): Promise<VerifikasiDetailResponse> {
    const res = await apiClient.get(`/api/admin/verifikasi-entitas/${type}/${id}`);
    return res.data;
  },

  /**
   * Verify village profile
   * Endpoint: PATCH /api/admin/desa/{profilDesa}/verify
   */
  async verifyDesa(profilDesaId: number | string): Promise<{ success: boolean; message: string; data?: any }> {
    const res = await apiClient.patch(`/api/admin/desa/${profilDesaId}/verify`);
    return res.data;
  },

  /**
   * Verify student profile
   * Endpoint: PATCH /api/admin/mahasiswa/{profilMahasiswa}/verify
   */
  async verifyMahasiswa(profilMahasiswaId: number | string): Promise<{ success: boolean; message: string; data?: any }> {
    const res = await apiClient.patch(`/api/admin/mahasiswa/${profilMahasiswaId}/verify`);
    return res.data;
  },

  /**
   * Verify university profile
   * Endpoint: PATCH /api/admin/universitas/{profilUniversitas}/verify
   */
  async verifyUniversitas(profilUniversitasId: number | string): Promise<{ success: boolean; message: string; data?: any }> {
    const res = await apiClient.patch(`/api/admin/universitas/${profilUniversitasId}/verify`);
    return res.data;
  },
};

export default adminService;
