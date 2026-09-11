import apiClient from '@/lib/api-client';
import { LuaranAkhir, PortofolioPublik } from '@/lib/types';

export interface SubmitLuaranPayload {
  proposal_id: number | string;
  deskripsi: string;
  file_deliverable: File | Blob;
}

export interface VerifyLuaranPayload {
  ringkasan_dampak: string;
  testimoni_desa: string;
  status?: string;
}

export const luaranService = {
  /**
   * Submit final project deliverables (Mahasiswa)
   * Endpoint: POST /api/luaran
   */
  async submitLuaran(payload: SubmitLuaranPayload | FormData): Promise<{
    message: string;
    data: LuaranAkhir;
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
    const res = await apiClient.post('/api/luaran', body);
    return res.data;
  },

  /**
   * Get deliverable details for a specific proposal
   * Endpoint: GET /api/proposal/{proposal_id}/luaran
   */
  async getByProposal(proposalId: number | string): Promise<LuaranAkhir> {
    const res = await apiClient.get<LuaranAkhir>(`/api/proposal/${proposalId}/luaran`);
    return res.data;
  },

  /**
   * List deliverables for authenticated village
   * Endpoint: GET /api/desa/luaran
   */
  async getByDesa(): Promise<LuaranAkhir[]> {
    const res = await apiClient.get<LuaranAkhir[]>('/api/desa/luaran');
    return res.data;
  },

  /**
   * Village verification of deliverables & publish portfolio + E-Certificate
   * Endpoint: PATCH /api/desa/luaran/{id}/verify
   */
  async verifyByDesa(id: number | string, payload: VerifyLuaranPayload): Promise<{
    message: string;
    data: any;
  }> {
    const res = await apiClient.patch(`/api/desa/luaran/${id}/verify`, payload);
    return res.data;
  },

  /**
   * Get public E-Portfolio and certificate details by slug
   * Endpoint: GET /api/portofolio/{slug}
   */
  async getPortofolio(slug: string): Promise<PortofolioPublik> {
    const res = await apiClient.get<PortofolioPublik>(`/api/portofolio/${slug}`);
    return res.data;
  },
};

export default luaranService;
