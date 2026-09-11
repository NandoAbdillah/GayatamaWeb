'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Building,
  Users,
  Search,
  Download,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

interface LaporanDosen {
  id: number;
  dosen: string;
  nip: string;
  kelompok: string;
  desa: string;
  tanggal_kunjungan: string;
  jenis_supervisi: string;
  status: 'menunggu' | 'disetujui' | 'revisi';
  ringkasan: string;
  catatan_dpl: string;
  lampiran_url: string;
}

const INITIAL_LAPORAN: LaporanDosen[] = [
  {
    id: 1,
    dosen: 'Dr. Ir. Hendra Kusuma, M.T.',
    nip: '197508122003121002',
    kelompok: 'Kelompok 14 — Sukamaju Berdaya',
    desa: 'Desa Sukamaju (Kab. Bandung)',
    tanggal_kunjungan: '28 Juli 2025',
    jenis_supervisi: 'Supervisi Lapangan Tengah Periode (Monev II)',
    status: 'menunggu',
    ringkasan: 'Monitoring langsung instalasi sensor debit air irigasi cerdas di RW 04 dan validasi katalog produk UMKM olahan pisang.',
    catatan_dpl: 'Progres kelompok mencapai 72%. Sinergi dengan aparat desa berjalan sangat baik. Disarankan akselerasi penyusunan laporan BAST akhir.',
    lampiran_url: '#',
  },
  {
    id: 2,
    dosen: 'Prof. Dr. Sri Wahyuni, M.Si.',
    nip: '196803151992032001',
    kelompok: 'Kelompok 08 — Ciburial Mandiri',
    desa: 'Desa Ciburial (Kab. Bandung Barat)',
    tanggal_kunjungan: '25 Juli 2025',
    jenis_supervisi: 'Supervisi Lapangan Awal & Pembekalan Desa',
    status: 'disetujui',
    ringkasan: 'Sosialisasi program pengentasan stunting posyandu bersama bidan desa dan pemetaan sanitasi air bersih.',
    catatan_dpl: 'Semua anggota kelompok hadir lengkap di posko. Program kerja sesuai kebutuhan mendesak posyandu desa.',
    lampiran_url: '#',
  },
  {
    id: 3,
    dosen: 'Agus Setiawan, S.Kom., M.Cs.',
    nip: '198904202015041003',
    kelompok: 'Kelompok 22 — Maruyung Digital',
    desa: 'Desa Maruyung (Kab. Garut)',
    tanggal_kunjungan: '20 Juli 2025',
    jenis_supervisi: 'Kunjungan Verifikasi Luaran Akhir',
    status: 'disetujui',
    ringkasan: 'Uji coba platform Sistem Informasi Administrasi Desa (SIAD) bersama Sekdes dan Kaur Perencanaan.',
    catatan_dpl: 'Aplikasi web siap dihibahkan kepada pihak desa. Dokumen buku manual panduan operasional telah diserahkan.',
    lampiran_url: '#',
  },
];

export default function AdminLaporanDosenPage() {
  const [laporanList, setLaporanList] = useState<LaporanDosen[]>(INITIAL_LAPORAN);
  const [activeFilter, setActiveFilter] = useState<'all' | 'menunggu' | 'disetujui' | 'revisi'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanDosen | null>(null);

  const handleApprove = (id: number) => {
    setLaporanList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'disetujui' } : item))
    );
    setSelectedLaporan(null);
    toast.success('Laporan supervisi DPL berhasil disetujui oleh LPPM!');
  };

  const handleRequestRevision = (id: number) => {
    setLaporanList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'revisi' } : item))
    );
    setSelectedLaporan(null);
    toast.info('Catatan revisi laporan supervisi telah dikirim ke email Dosen DPL.');
  };

  const filteredLaporan = laporanList.filter((item) => {
    const matchFilter = activeFilter === 'all' || item.status === activeFilter;
    const matchSearch =
      item.dosen.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kelompok.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <DashboardLayout title="Tinjauan Laporan Dosen Pembimbing Lapangan">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-navy-950 dark:text-white font-epilogue">
            Tinjauan Laporan Supervisi DPL
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monev resmi laporan kunjungan lapangan dan evaluasi kelompok binaan oleh Dosen Pembimbing Lapangan (DPL).
          </p>
        </div>

        {/* Metrik Ringkas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border-slate-200 dark:border-navy-800 shadow-sm bg-white dark:bg-navy-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400">Total Laporan Masuk</p>
                <p className="text-2xl font-black text-navy-950 dark:text-white mt-1">{laporanList.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </Card>
          <Card className="p-4 border-slate-200 dark:border-navy-800 shadow-sm bg-white dark:bg-navy-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400">Menunggu Review LPPM</p>
                <p className="text-2xl font-black text-amber-500 mt-1">
                  {laporanList.filter((l) => l.status === 'menunggu').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </Card>
          <Card className="p-4 border-slate-200 dark:border-navy-800 shadow-sm bg-white dark:bg-navy-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400">Telah Disahkan</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {laporanList.filter((l) => l.status === 'disetujui').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Controls */}
        <Card className="p-4 border-slate-200 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-navy-900">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari DPL, Desa, atau Kelompok..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {(['all', 'menunggu', 'disetujui', 'revisi'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeFilter === filter
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {filter === 'all' ? 'Semua Status' : filter}
              </button>
            ))}
          </div>
        </Card>

        {/* List Laporan */}
        <div className="space-y-4">
          {filteredLaporan.map((item) => (
            <Card
              key={item.id}
              className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-md space-y-4 hover:border-primary/50 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-primary shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950 dark:text-white">{item.dosen}</h3>
                    <p className="text-xs text-slate-500">NIP: {item.nip}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      item.status === 'disetujui'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : item.status === 'revisi'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {item.status === 'disetujui'
                      ? '✓ Disetujui LPPM'
                      : item.status === 'revisi'
                      ? 'Perlu Revisi'
                      : 'Menunggu Review'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-navy-950 p-3.5 rounded-xl border border-slate-100 dark:border-navy-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <span>{item.kelompok}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item.desa}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Tanggal: {item.tanggal_kunjungan}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-navy-950 dark:text-white mb-1">
                  {item.jenis_supervisi}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.ringkasan}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-primary-50/50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900 text-xs text-navy-950 dark:text-slate-200">
                <strong className="text-primary font-bold block mb-1">Evaluasi & Catatan DPL:</strong>
                <p className="text-slate-600 dark:text-slate-300 italic">"{item.catatan_dpl}"</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-navy-800 text-xs">
                <button
                  onClick={() => toast.info('Mengunduh berkas lampiran foto & Berita Acara Supervisi...')}
                  className="flex items-center gap-1.5 text-primary hover:underline font-bold"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Lampiran BA Kunjungan (PDF)</span>
                </button>

                <div className="flex items-center gap-2">
                  {item.status !== 'disetujui' && (
                    <Button
                      onClick={() => handleRequestRevision(item.id)}
                      variant="outline"
                      size="sm"
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      <span>Minta Revisi</span>
                    </Button>
                  )}
                  {item.status !== 'disetujui' && (
                    <Button
                      onClick={() => handleApprove(item.id)}
                      variant="emerald"
                      size="sm"
                      className="gap-1 shadow-sm font-bold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sahkan Laporan DPL</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
