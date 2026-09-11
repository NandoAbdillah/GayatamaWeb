import apiClient from '@/lib/api-client';
import { WilayahItem } from '@/lib/types';

export const wilayahService = {
  /**
   * Get all provinces
   * Endpoint: GET /api/wilayah/provinsi
   */
  async getProvinsi(): Promise<WilayahItem[]> {
    const res = await apiClient.get<WilayahItem[]>('/api/wilayah/provinsi');
    return res.data;
  },

  /**
   * Get regencies/cities in a province
   * Endpoint: GET /api/wilayah/kabupaten/{provinceId}
   */
  async getKabupaten(provinceId: string | number): Promise<WilayahItem[]> {
    const res = await apiClient.get<WilayahItem[]>(`/api/wilayah/kabupaten/${provinceId}`);
    return res.data;
  },

  /**
   * Get districts in a regency/city
   * Endpoint: GET /api/wilayah/kecamatan/{regencyId}
   */
  async getKecamatan(regencyId: string | number): Promise<WilayahItem[]> {
    const res = await apiClient.get<WilayahItem[]>(`/api/wilayah/kecamatan/${regencyId}`);
    return res.data;
  },

  /**
   * Get villages in a district
   * Endpoint: GET /api/wilayah/desa/{districtId}
   */
  async getDesa(districtId: string | number): Promise<WilayahItem[]> {
    const res = await apiClient.get<WilayahItem[]>(`/api/wilayah/desa/${districtId}`);
    return res.data;
  },
};

export default wilayahService;
