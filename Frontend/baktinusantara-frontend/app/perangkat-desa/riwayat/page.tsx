'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  History,
  Calendar,
  Users,
  Award,
  FileCheck2,
  Download,
  Building,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';

export default function RiwayatKknDesaPage() {
  const historyPeriods = [
    {
      periode: 'Semester Ganjil 2026/2027',
      status: 'in_progress',
      statusLabel: 'Sedang Berjalan',
      total_mahasiswa: 10,
      total_kelompok: 2,
      dpl: ['Dr. Ir. Hendra Gunawan, M.T.', 'Dra. Hj. Nurul Hidayati, M.Si.'],
      program_utama: [
        'Otomatisasi Irigasi Sawah IoT Dusun 2 (Kelompok 14)',
        'Digitalisasi & E-Commerce 24 UMKM Desa (Kelompok 08)',
      ],
      bast_url: null,
      tanggal: '01 Sep 2026 - 15 Okt 2026',
    },
    {
      periode: 'Semester Genap 2025/2026',
      status: 'approved',
      statusLabel: 'Selesai & BAST Terbit',
      total_mahasiswa: 12,
      total_kelompok: 2,
      dpl: ['Prof. Dr. Ir. Ahmad Syahid', 'Dr. Ratna Juwita, M.Pd.'],
      program_utama: [
        'Instalasi Filterisasi Air Bersih & Pipanisasi Dusun 3 (Kelompok 05)',
        'Pemetaan Batas Desa & Geospasial GIS Wisata Curug Sukamaju (Kelompok 06)',
      ],
      bast_url: 'https://storage.gayatama.ac.id/bast/bast_sukamaju_genap2025.pdf',
      tanggal: '10 Feb 2026 - 25 Mar 2026',
      luaran_count: 3,
    },
    {
      periode: 'Semester Ganjil 2025/2026',
      status: 'approved',
      statusLabel: 'Selesai & BAST Terbit',
      total_mahasiswa: 10,
      total_kelompok: 2,
      dpl: ['Dr. H. Muhammad Ridwan, M.M.'],
      program_utama: [
        'Pencegahan Stunting Balita & Pemberian Makanan Tambahan Posyandu Mawar',
        'Budidaya Maggot BSF untuk Pengelolaan Sampah Organik Rumah Tangga',
      ],
      bast_url: 'https://storage.gayatama.ac.id/bast/bast_sukamaju_ganjil2025.pdf',
      tanggal: '01 Sep 2025 - 15 Okt 2025',
      luaran_count: 2,
    },
    {
      periode: 'Semester Genap 2024/2025',
      status: 'approved',
      statusLabel: 'Selesai & BAST Terbit',
      total_mahasiswa: 10,
      total_kelompok: 2,
      dpl: ['Dr. Endang Sulastri, S.P., M.Si.'],
      program_utama: [
        'Pelatihan Pembukuan Keuangan BUMDes Sukamaju Berbasis Aplikasi Kasir',
        'Pendaftaran Nomor Induk Berusaha (NIB) untuk 30 Pelaku Usaha Mikro',
      ],
      bast_url: 'https://storage.gayatama.ac.id/bast/bast_sukamaju_genap2024.pdf',
      tanggal: '15 Feb 2025 - 30 Mar 2025',
      luaran_count: 3,
    },
  ];

  return (
    <DashboardLayout title="Riwayat KKN Desa Sukamaju">
      <div className="space-y-6 font-jakarta">
        {/* Header Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
            Riwayat & Rekam Jejak KKN Desa
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Arsip historis pelaksanaan program pengabdian mahasiswa di Desa Sukamaju dari tahun ke tahun.
          </p>
        </div>

        {/* Kumulatif Metrik Desa */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 space-y-1 border-slate-200 dark:border-navy-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Periode</span>
            <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">4 Periode</p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Sejak 2024</span>
            </p>
          </Card>

          <Card className="p-4 space-y-1 border-slate-200 dark:border-navy-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Mahasiswa</span>
            <p className="text-2xl font-extrabold text-primary font-epilogue">42 Mahasiswa</p>
            <p className="text-[11px] text-slate-500">8 Kelompok Lintas Jurusan</p>
          </Card>

          <Card className="p-4 space-y-1 border-slate-200 dark:border-navy-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Luaran Tersertifikasi</span>
            <p className="text-2xl font-extrabold text-emerald-600 font-epilogue">10 Inovasi</p>
            <p className="text-[11px] text-slate-500">Alat, Modul & Website</p>
          </Card>

          <Card className="p-4 space-y-1 border-slate-200 dark:border-navy-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Indeks Kepuasan Desa</span>
            <p className="text-2xl font-extrabold text-amber-600 font-epilogue">4.9 / 5.0</p>
            <p className="text-[11px] text-slate-500">Sangat Memuaskan</p>
          </Card>
        </div>

        {/* Timeline List Periode KKN */}
        <div className="space-y-4">
          {historyPeriods.map((p, idx) => (
            <Card
              key={idx}
              className="p-6 space-y-4 border-slate-200 dark:border-navy-800 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-navy-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                      {p.periode}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{p.tanggal}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} label={p.statusLabel} size="sm" />
                </div>
              </div>

              {/* Detail Program Kerja */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Program Kerja & Hasil Nyata di Desa:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {p.program_utama.map((prog, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 text-xs text-navy-950 dark:text-slate-200 flex items-start gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{prog}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong>{p.total_mahasiswa}</strong> Mahasiswa ({p.total_kelompok} Kelompok)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>DPL: <strong>{p.dpl.join(', ')}</strong></span>
                  </span>
                </div>

                {p.bast_url ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success('Mengunduh arsip BAST resmi...')}
                    className="text-xs font-bold gap-1.5 border-slate-300"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Arsip BAST Resmi (PDF)</span>
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-lg">
                    Program Sedang Berjalan
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
