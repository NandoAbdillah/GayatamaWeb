import apiClient from '@/lib/api-client';
import { LogbookEntry } from '@/lib/types';

export interface SubmitProgressPayload {
  proposal_id: number | string;
  minggu_ke: number;
  persentase: number;
  deskripsi: string;
  foto?: File | Blob;
}

export const progressService = {
  /**
   * Submit weekly progress report with optional photo
   * Endpoint: POST /api/progress
   */
  async submitProgress(payload: SubmitProgressPayload | FormData): Promise<{
    message: string;
    data: LogbookEntry;
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
    const res = await apiClient.post('/api/progress', body);
    return res.data;
  },

  /**
   * Get all progress timeline entries for a specific proposal
   * Endpoint: GET /api/proposal/{proposal_id}/progress
   */
  async getByProposal(proposalId: number | string): Promise<LogbookEntry[]> {
    const res = await apiClient.get<LogbookEntry[]>(`/api/proposal/${proposalId}/progress`);
    return res.data;
  },
};

export default progressService;
