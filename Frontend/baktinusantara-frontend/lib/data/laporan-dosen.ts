export interface LaporanDosen {
  id: number;
  dosen: string;
  nip: string;
  kelompok: string;
  desa: string;
  tanggal_kunjungan: string;
  jenis_supervisi: string;
  status: "menunggu" | "disetujui" | "revisi";
  ringkasan: string;
  catatan_dpl: string;
  lampiran_url: string;
  lampiran_name?: string;
  alasanRevisi?: string;
  alasanRevisiAt?: string;
}
