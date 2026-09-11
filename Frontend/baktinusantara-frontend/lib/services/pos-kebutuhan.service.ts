import apiClient from '@/lib/api-client';
import { PosKebutuhan } from '@/lib/types';

export interface PosKebutuhanQueryParams {
  kategori?: string;
  sdg?: number | string;
  status?: string;
  lat?: number;
  lon?: number;
  radius_km?: number;
}

export interface CreatePosKebutuhanPayload {
  judul: string;
  deskripsi: string;
  kategori: string;
  sdg_codes: number[];
  kuota_kelompok: number;
  deadline: string;
  jurusan_dibutuhkan: Record<string, number>;
}

export const posKebutuhanService = {
  /**
   * Get public catalog of KKN Needs (supports categories, SDGs, status, and Haversine distance)
   * Endpoint: GET /api/pos-kebutuhan
   */
  async getAll(params?: PosKebutuhanQueryParams): Promise<PosKebutuhan[]> {
    const res = await apiClient.get<PosKebutuhan[]>('/api/pos-kebutuhan', {
      params,
    });
    return res.data;
  },

  /**
   * Get detail of a specific Pos Kebutuhan
   * Endpoint: GET /api/pos-kebutuhan/{id}
   */
  async getById(id: number | string): Promise<PosKebutuhan> {
    const res = await apiClient.get<PosKebutuhan>(`/api/pos-kebutuhan/${id}`);
    return res.data;
  },

  /**
   * Direct publish pos kebutuhan by Perangkat Desa
   * Endpoint: POST /api/desa/pos-kebutuhan
   */
  async createDirect(payload: CreatePosKebutuhanPayload): Promise<{
    message: string;
    data: PosKebutuhan;
  }> {
    const res = await apiClient.post('/api/desa/pos-kebutuhan', payload);
    return res.data;
  },

  /**
   * Get all pos kebutuhan published by authenticated village
   * Endpoint: GET /api/desa/pos-kebutuhan
   */
  async getByDesa(): Promise<PosKebutuhan[]> {
    const res = await apiClient.get<PosKebutuhan[]>('/api/desa/pos-kebutuhan');
    return res.data;
  },
};

export default posKebutuhanService;
