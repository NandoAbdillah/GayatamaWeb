import apiClient from '@/lib/api-client';
import { Proposal } from '@/lib/types';

export interface SubmitProposalPayload {
  pos_kebutuhan_id: number | string;
  draf_proker: string;
  latitude: number | string;
  longitude: number | string;
  file_proposal: File | Blob;
  surat_pengantar?: File | Blob;
}

export interface DecideProposalPayload {
  action: 'approve' | 'reject';
  catatan_desa?: string;
}

export interface ReviewKelayakanPayload {
  status_kelayakan: 'layak' | 'perlu_revisi' | 'revisi' | 'ditolak';
  catatan_dosen?: string;
  catatan_dpl?: string;
}

export const proposalService = {
  /**
   * Submit new KKN Proposal (Ketua Kelompok)
   * Endpoint: POST /api/proposal
   */
  async submitProposal(payload: SubmitProposalPayload | FormData): Promise<{
    message: string;
    data: Proposal;
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
    const res = await apiClient.post('/api/proposal', body);
    return res.data;
  },

  /**
   * Get all proposals submitted by current student's team
   * Endpoint: GET /api/proposal/mine
   */
  async getMyProposals(): Promise<Proposal[]> {
    const res = await apiClient.get<Proposal[]>('/api/proposal/mine');
    return res.data;
  },

  /**
   * Get proposals received by authenticated village
   * Endpoint: GET /api/desa/proposal
   */
  async getByDesa(): Promise<Proposal[]> {
    const res = await apiClient.get<Proposal[]>('/api/desa/proposal');
    return res.data;
  },

  /**
   * Village decision (Approve / Reject proposal)
   * Endpoint: PATCH /api/desa/proposal/{id}/decide
   */
  async decideByDesa(id: number | string, decision: DecideProposalPayload): Promise<{
    message: string;
    data: Proposal;
  }> {
    const res = await apiClient.patch(`/api/desa/proposal/${id}/decide`, decision);
    return res.data;
  },

  /**
   * Dosen DPL review of proposal feasibility
   * Endpoint: PATCH /api/dosen/proposal/{id}/kelayakan
   */
  async reviewKelayakan(id: number | string, review: ReviewKelayakanPayload): Promise<{
    message: string;
    data: any;
  }> {
    const res = await apiClient.patch(`/api/dosen/proposal/${id}/kelayakan`, review);
    return res.data;
  },

  /**
   * Upload Parental Consent Letter if KKN distance > 1,000 km
   * Endpoint: POST /api/proposal/{proposal_id}/surat-izin-ortu
   */
  async uploadSuratOrtu(proposalId: number | string, fileSurat: File | Blob): Promise<{
    message: string;
    data?: any;
  }> {
    const fd = new FormData();
    fd.append('file_surat', fileSurat);
    const res = await apiClient.post(`/api/proposal/${proposalId}/surat-izin-ortu`, fd);
    return res.data;
  },

  /**
   * Get BAST evaluation score from village
   * Endpoint: GET /api/desa/proposal/{id}/penilaian
   */
  async getPenilaian(id: number | string): Promise<{
    proposal_id: number;
    kelompok_id: number;
    nilai_desa: {
      skor1: number;
      skor2: number;
      skor3: number;
      nilaiAkhir: number;
      nilai_akhir: number;
    } | null;
    evaluasi_desa: string | null;
    submitted_at: string | null;
  }> {
    const res = await apiClient.get(`/api/desa/proposal/${id}/penilaian`);
    return res.data;
  },

  /**
   * Save BAST evaluation score from village to MySQL database
   * Endpoint: POST /api/desa/proposal/{id}/penilaian
   */
  async savePenilaian(
    id: number | string,
    payload: {
      skor1: number;
      skor2: number;
      skor3: number;
      catatan?: string;
    }
  ): Promise<{
    message: string;
    data: any;
  }> {
    const res = await apiClient.post(`/api/desa/proposal/${id}/penilaian`, payload);
    return res.data;
  },
};

export default proposalService;
