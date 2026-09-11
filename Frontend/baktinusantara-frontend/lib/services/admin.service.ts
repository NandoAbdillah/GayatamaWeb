import apiClient from '@/lib/api-client';

export const adminService = {
  /**
   * Verify village profile
   * Endpoint: PATCH /api/admin/desa/{profilDesa}/verify
   */
  async verifyDesa(profilDesaId: number | string): Promise<{ message: string; data?: any }> {
    const res = await apiClient.patch(`/api/admin/desa/${profilDesaId}/verify`);
    return res.data;
  },

  /**
   * Verify student profile
   * Endpoint: PATCH /api/admin/mahasiswa/{profilMahasiswa}/verify
   */
  async verifyMahasiswa(profilMahasiswaId: number | string): Promise<{ message: string; data?: any }> {
    const res = await apiClient.patch(`/api/admin/mahasiswa/${profilMahasiswaId}/verify`);
    return res.data;
  },

  /**
   * Verify university profile
   * Endpoint: PATCH /api/admin/universitas/{profilUniversitas}/verify
   */
  async verifyUniversitas(profilUniversitasId: number | string): Promise<{ message: string; data?: any }> {
    const res = await apiClient.patch(`/api/admin/universitas/${profilUniversitasId}/verify`);
    return res.data;
  },
};

export default adminService;
