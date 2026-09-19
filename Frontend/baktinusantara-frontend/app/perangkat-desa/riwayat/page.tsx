'use client';

import React, { useState, useMemo } from 'react';
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
  const completedKkn = [
    {
      kelompok: 'Kelompok 05 - Filter Air Bersih Dusun 3',
      periode: 'Semester Genap 2025/2026',
      status: 'approved',
      statusLabel: 'Selesai',
      total_mahasiswa: 6,
      dpl: 'Prof. Dr. Ir. Ahmad Syahid',
      program: 'Instalasi Filterisasi Air Bersih & Pipanisasi Dusun 3',
      luaran: ['Instalasi filter 3 titik', 'Modul perawatan filter', 'Peta jaringan pipa'],
      tanggal_selesai: '25 Mar 2026',
      tanggal_periode: '10 Feb 2026 - 25 Mar 2026',
      bast_url: 'https://storage.gayatama.ac.id/bast/bast_sukamaju_genap2025_05.pdf',
      nilai_desa: '4.8 / 5.0',
    },
    {
      kelompok: 'Kelompok 06 - GIS Wisata Curug Sukamaju',
      periode: 'Semester Genap 2025/2026',
      status: 'approved',
      statusLabel: 'Selesai',
      total_mahasiswa: 6,
      dpl: 'Dr. Ratna Juwita, M.Pd.',
      program: 'Pemetaan Batas Desa & Geospasial GIS Wisata Curug Sukamaju',
      luaran: ['Peta GIS batas desa', 'Website wisata curug', 'Papan informasi QR'],
      tanggal_selesai: '25 Mar 2026',
      tanggal_periode: '10 Feb 2026 - 25 Mar 2026',
      bast_url: 'https://storage.gayatama.ac.id/bast/bast_sukamaju_genap2025_06.pdf',
      nilai_desa: '4.9 / 5.0',
    },
    {
      kelompok: 'Kelompok 03 - Posyandu Mawar Stunting',
      periode: 'Semester Ganjil 2025/2026',
      status: 'approved',
      statusLabel: 'Selesai',
      total_mahasiswa: 5,
      dpl: 'Dr. H. Muhammad Ridwan, M.M.',
      program: 'Pencegahan Stunting Balita & PMT Posyandu Mawar',
      luaran: ['Modul PMT balita', 'Dashboard gizi balita'],
      tanggal_selesai: '15 Okt 2025',
      tanggal_periode: '01 Sep 2025 - 15 Okt 2025',
      bast_url: 'https://storage.gayatama.ac.id/bast/bast_sukamaju_ganjil2025_03.pdf',
      nilai_desa: '4.9 / 5.0',
    },
    {
      kelompok: 'Kelompok 04 - Maggot BSF Sampah Organik',
      periode: 'Semester Ganjil 2025/2026',
      status: 'approved',
      statusLabel: 'Selesai',
      total_mahasiswa: 5,
      dpl: 'Dr. H. Muhammad Ridwan, M.M.',
      program: 'Budidaya Maggot BSF untuk Pengelolaan Sampah Organik',
      luaran: ['Unit budidaya maggot', 'SOP pengelolaan sampah'],
      tanggal_selesai: '15 Okt 2025',
      tanggal_periode: '01 Sep 2025 - 15 Okt 2025',
      bast_url: 'https://storage.gayatama.ac.id/bast/bast_sukamaju_ganjil2025_04.pdf',
      nilai_desa: '4.7 / 5.0',
    },
    {
      kelompok: 'Kelompok 01 - BUMDes Kasir Digital',
      periode: 'Semester Genap 2024/2025',
      status: 'approved',
      statusLabel: 'Selesai',
      total_mahasiswa: 5,
      dpl: 'Dr. Endang Sulastri, S.P., M.Si.',
      program: 'Pelatihan Pembukuan Keuangan BUMDes Berbasis Aplikasi Kasir',
      luaran: ['Aplikasi kasir BUMDes', 'Modul pembukuan', 'Laporan keuangan'],
      tanggal_selesai: '30 Mar 2025',
      tanggal_periode: '15 Feb 2025 - 30 Mar 2025',
      bast_url: 'https://storage.gayatama.ac.id/bast/bast_sukamaju_genap2024_01.pdf',
      nilai_desa: '4.8 / 5.0',
    },
    {
      kelompok: 'Kelompok 02 - NIB UMKM 30 Pelaku',
      periode: 'Semester Genap 2024/2025',
      status: 'approved',
      statusLabel: 'Selesai',
      total_mahasiswa: 5,
      dpl: 'Dr. Endang Sulastri, S.P., M.Si.',
      program: 'Pendaftaran Nomor Induk Berusaha (NIB) untuk 30 Pelaku Usaha Mikro',
      luaran: ['30 NIB terbit', 'Sosialisasi legalitas usaha', 'Pendampingan OSS'],
      tanggal_selesai: '30 Mar 2025',
      tanggal_periode: '15 Feb 2025 - 30 Mar 2025',
      bast_url: 'https://storage.gayatama.ac.id/bast/bast_sukamaju_genap2024_02.pdf',
      nilai_desa: '5.0 / 5.0',
    },
  ];

  const [selectedYear, setSelectedYear] = useState<string>('semua');

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    completedKkn.forEach((k) => {
      const year = k.tanggal_selesai.trim().split(' ').pop() || '';
      if (/^\d{4}$/.test(year)) years.add(year);
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, []);

  const filteredKkn = useMemo(() => {
    if (selectedYear === 'semua') return completedKkn;
    return completedKkn.filter((k) => k.tanggal_selesai.endsWith(selectedYear));
  }, [selectedYear]);

  const totalMahasiswa = completedKkn.reduce((a, b) => a + b.total_mahasiswa, 0);
  const totalKelompok = completedKkn.length;

  return (
    <DashboardLayout title="Daftar KKN Telah Selesai">
      <div className="space-y-6 font-jakarta">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
            Daftar KKN yang Telah Selesai di Desa Sukamaju
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Seluruh kelompok KKN yang telah menyelesaikan pengabdian, dinyatakan selesai dan telah menerbitkan BAST resmi desa.
          </p>
        </div>

        {/* Metrik khusus selesai */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 space-y-1 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KKN Selesai</span>
            <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">{totalKelompok} Kelompok</p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>3 Periode</span>
            </p>
          </Card>

          <Card className="p-4 space-y-1 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Mahasiswa Selesai</span>
            <p className="text-2xl font-extrabold text-primary font-epilogue">{totalMahasiswa} Mahasiswa</p>
            <p className="text-[11px] text-slate-500">Telah kembali ke kampus</p>
          </Card>

          <Card className="p-4 space-y-1 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Luaran Tersertifikasi</span>
            <p className="text-2xl font-extrabold text-emerald-600 font-epilogue">16 Luaran</p>
            <p className="text-[11px] text-slate-500">Telah diserahterimakan</p>
          </Card>
        </div>

        {/* Filter Tahun Dinamis */}
        <div className="flex items-center gap-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-1.5 shadow-sm w-fit overflow-x-auto">
          <button
            onClick={() => setSelectedYear('semua')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedYear === 'semua' ? 'bg-navy-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-800'}`}
          >
            Semua
          </button>
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedYear === year ? 'bg-navy-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-800'}`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Daftar KKN Selesai - 2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKkn.length === 0 ? (
            <div className="col-span-full">
              <Card className="p-10 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                <p className="text-sm text-slate-500">Tidak ada KKN selesai pada tahun {selectedYear}.</p>
              </Card>
            </div>
          ) : (
            filteredKkn.map((kkn, idx) => (
              <Card key={idx} className="p-6 space-y-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-navy-800">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">{kkn.kelompok}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{kkn.tanggal_periode}</span>
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={kkn.status} label={kkn.statusLabel} size="sm" />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Program & Hasil Nyata:</p>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 text-xs text-navy-950 dark:text-slate-200 flex items-start gap-2">
                    <span>{kkn.program}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {kkn.luaran.map((l, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100 dark:border-navy-800">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        <strong>{kkn.total_mahasiswa}</strong> Mahasiswa
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        DPL: <strong>{kkn.dpl}</strong>
                      </span>
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success('Mengunduh arsip BAST resmi...')}
                    className="text-xs font-bold gap-1.5 border-slate-300"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh BAST (PDF)</span>
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
