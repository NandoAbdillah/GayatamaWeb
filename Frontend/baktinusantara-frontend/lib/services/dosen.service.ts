import apiClient from '@/lib/api-client';
import { Kelompok } from '@/lib/types';
import { ReviewKelayakanPayload } from './proposal.service';

export const dosenService = {
  /**
   * Get public list of all Dosen DPL
   * Endpoint: GET /api/dosen
   */
  async getAllDosen(): Promise<any[]> {
    const res = await apiClient.get<any[]>('/api/dosen');
    return res.data;
  },

  /**
   * List all student groups supervised by authenticated DPL
   * Endpoint: GET /api/dosen/kelompok
   */
  async getBimbinganKelompok(): Promise<Kelompok[]> {
    const res = await apiClient.get<Kelompok[]>('/api/dosen/kelompok');
    return res.data;
  },

  /**
   * Review proposal feasibility for supervised team
   * Endpoint: PATCH /api/dosen/proposal/{proposal}/kelayakan
   */
  async reviewKelayakanProposal(
    proposalId: number | string,
    review: ReviewKelayakanPayload
  ): Promise<{ message: string; data: any }> {
    const res = await apiClient.patch(`/api/dosen/proposal/${proposalId}/kelayakan`, review);
    return res.data;
  },
};

export default dosenService;
