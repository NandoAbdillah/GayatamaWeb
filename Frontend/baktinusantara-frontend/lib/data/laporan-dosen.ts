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

export const INITIAL_LAPORAN: LaporanDosen[] = [
  {
    id: 1,
    dosen: "Dr. Ir. Hendra Kusuma, M.T.",
    nip: "197508122003121002",
    kelompok: "Kelompok 14 — Sukamaju Berdaya",
    desa: "Desa Sukamaju (Kab. Bandung)",
    tanggal_kunjungan: "28 Juli 2025",
    jenis_supervisi: "Supervisi Lapangan Tengah Periode (Monev II)",
    status: "menunggu",
    ringkasan:
      "Monitoring langsung instalasi sensor debit air irigasi cerdas di RW 04 dan validasi katalog produk UMKM olahan pisang.",
    catatan_dpl:
      "Progres kelompok mencapai 72%. Sinergi dengan aparat desa berjalan sangat baik. Disarankan akselerasi penyusunan laporan BAST akhir.",
    lampiran_url: "/files/BA_Supervisi_Kel14_Sukamaju.pdf",
    lampiran_name: "BA_Supervisi_Kel14_Sukamaju.pdf",
  },
  {
    id: 2,
    dosen: "Prof. Dr. Sri Wahyuni, M.Si.",
    nip: "196803151992032001",
    kelompok: "Kelompok 08 — Ciburial Mandiri",
    desa: "Desa Ciburial (Kab. Bandung Barat)",
    tanggal_kunjungan: "25 Juli 2025",
    jenis_supervisi: "Supervisi Lapangan Awal & Pembekalan Desa",
    status: "disetujui",
    ringkasan:
      "Sosialisasi program pengentasan stunting posyandu bersama bidan desa dan pemetaan sanitasi air bersih.",
    catatan_dpl:
      "Semua anggota kelompok hadir lengkap di posko. Program kerja sesuai kebutuhan mendesak posyandu desa.",
    lampiran_url: "",
    lampiran_name: undefined,
  },
  {
    id: 3,
    dosen: "Agus Setiawan, S.Kom., M.Cs.",
    nip: "198904202015041003",
    kelompok: "Kelompok 22 — Maruyung Digital",
    desa: "Desa Maruyung (Kab. Garut)",
    tanggal_kunjungan: "20 Juli 2025",
    jenis_supervisi: "Kunjungan Verifikasi Luaran Akhir",
    status: "disetujui",
    ringkasan:
      "Uji coba platform Sistem Informasi Administrasi Desa (SIAD) bersama Sekdes dan Kaur Perencanaan.",
    catatan_dpl:
      "Aplikasi web siap dihibahkan kepada pihak desa. Dokumen buku manual panduan operasional telah diserahkan.",
    lampiran_url: "/files/Laporan_SIAD_Maruyung_Digital.pdf",
    lampiran_name: "Laporan_SIAD_Maruyung_Digital.pdf",
  },
];

export const STORAGE_KEY = "laporan_dosen_list";
