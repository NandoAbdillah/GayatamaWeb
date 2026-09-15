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
   * Normalize raw backend entry to LogbookEntry shape
   * Backend may return different keys like foto, foto_url, fotos, or missing foto_dokumentasi_urls
   */
  normalizeEntry(raw: any): LogbookEntry {
    const fotos: string[] = (() => {
      if (Array.isArray(raw.foto_dokumentasi_urls)) return raw.foto_dokumentasi_urls;
      if (Array.isArray(raw.foto_dokumentasi)) return raw.foto_dokumentasi;
      if (Array.isArray(raw.fotos)) return raw.fotos;
      if (Array.isArray(raw.foto_urls)) return raw.foto_urls;
      if (typeof raw.foto === 'string' && raw.foto) return [raw.foto];
      if (typeof raw.foto_url === 'string' && raw.foto_url) return [raw.foto_url];
      if (typeof raw.foto_dokumentasi_url === 'string' && raw.foto_dokumentasi_url) return [raw.foto_dokumentasi_url];
      return [];
    })();

    return {
      id: raw.id,
      kelompok_id: raw.kelompok_id ?? raw.kelompokId ?? 0,
      mahasiswa_id: raw.mahasiswa_id ?? raw.mahasiswaId ?? 0,
      mahasiswa_nama: raw.mahasiswa_nama ?? raw.mahasiswaNama ?? raw.nama_mahasiswa ?? 'Mahasiswa',
      mahasiswa_nim: raw.mahasiswa_nim ?? raw.mahasiswaNim ?? raw.nim ?? '-',
      mahasiswa_jurusan: raw.mahasiswa_jurusan ?? raw.mahasiswaJurusan ?? raw.jurusan ?? '-',
      tanggal: raw.tanggal ?? raw.created_at?.slice(0, 10) ?? new Date().toISOString().split('T')[0],
      minggu_ke: raw.minggu_ke ?? raw.mingguKe ?? 1,
      durasi_jam: raw.durasi_jam ?? raw.durasiJam ?? 6,
      judul_kegiatan: raw.judul_kegiatan ?? raw.judulKegiatan ?? raw.judul ?? '-',
      deskripsi: raw.deskripsi ?? raw.deskripsi_kegiatan ?? '',
      target_program_terkait: raw.target_program_terkait ?? raw.targetProgram ?? '-',
      foto_dokumentasi_urls: fotos,
      status: raw.status ?? 'submitted',
      catatan_revisi_dpl: raw.catatan_revisi_dpl ?? raw.catatan_revisi ?? raw.catatan,
      disahkan_pada: raw.disahkan_pada ?? raw.disahkanPada,
    } as LogbookEntry;
  },

  /**
   * Get all progress timeline entries for a specific proposal
   * Endpoint: GET /api/proposal/{proposal_id}/progress
   */
  async getByProposal(proposalId: number | string): Promise<LogbookEntry[]> {
    const res = await apiClient.get<any>(`/api/proposal/${proposalId}/progress`);
    const rawData = res.data;
    // Laravel may wrap as { data: [...] } or { data: { data: [...] } } or plain array
    let list: any[] = [];
    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (Array.isArray(rawData?.data)) {
      list = rawData.data;
    } else if (Array.isArray(rawData?.data?.data)) {
      list = rawData.data.data;
    }
    return list.map((item) => this.normalizeEntry(item));
  },
};

export default progressService;
