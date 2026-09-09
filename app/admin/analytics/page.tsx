'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Users,
  Building,
  Sparkles,
  Download,
  Calendar,
  Globe2,
  FileCheck2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAnalyticsPage() {
  // Mock dataset for Recharts
  const sectorData = [
    { name: 'Agrikultur & Ketahanan Pangan', kelompok: 48, sdg: 'SDG 2' },
    { name: 'Digitalisasi & UMKM Desa', kelompok: 36, sdg: 'SDG 8' },
    { name: 'Kesehatan & Cegah Stunting', kelompok: 28, sdg: 'SDG 3' },
    { name: 'Pendidikan & Literasi', kelompok: 20, sdg: 'SDG 4' },
    { name: 'Infrastruktur & Air Bersih', kelompok: 16, sdg: 'SDG 6' },
  ];

  const regionData = [
    { name: 'Kab. Bogor', value: 52, color: '#2589F5' },
    { name: 'Kab. Cianjur', value: 34, color: '#16A34A' },
    { name: 'Kab. Sukabumi', value: 26, color: '#F59E0B' },
    { name: 'Kab. Bandung Barat', value: 20, color: '#8B5CF6' },
    { name: 'Kab. Garut', value: 16, color: '#EC4899' },
  ];

  const weeklyProgressData = [
    { minggu: 'M1', target: 25, realisasi: 28 },
    { minggu: 'M2', target: 50, realisasi: 56 },
    { minggu: 'M3', target: 80, realisasi: 88 },
    { minggu: 'M4', target: 120, realisasi: 125 },
    { minggu: 'M5', target: 160, realisasi: 168 },
    { minggu: 'M6', target: 200, realisasi: 204 },
  ];

  return (
    <DashboardLayout title="Analytics & Monev Dampak KKN">
      <div className="space-y-6 font-jakarta">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Dashboard Analisis & Evaluasi Dampak LPPM
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Pemantauan kinerja agregat pengabdian mahasiswa, pencapaian target SDG desa, dan efektivitas jam kerja lapangan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Mengekspor laporan analisis statistik (Excel / CSV)')}
              className="text-xs font-bold gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Data (Excel)</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast.success('Mengunduh Laporan Eksekutif Monev KKN (PDF)')}
              className="text-xs font-bold gap-1.5"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Laporan Eksekutif LPPM</span>
            </Button>
          </div>
        </div>

        {/* Metrik Agregat Utama */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 space-y-1 border-slate-200 dark:border-navy-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Mahasiswa Aktif</span>
            <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">740 Orang</p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>148 Kelompok (100% Terisi)</span>
            </p>
          </Card>

          <Card className="p-4 space-y-1 border-slate-200 dark:border-navy-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Desa Mitra Terhubung</span>
            <p className="text-2xl font-extrabold text-primary font-epilogue">142 Desa</p>
            <p className="text-[11px] text-slate-500">5 Kabupaten / Kota</p>
          </Card>

          <Card className="p-4 space-y-1 border-slate-200 dark:border-navy-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rata-rata Jam Kerja</span>
            <p className="text-2xl font-extrabold text-emerald-600 font-epilogue">184.2 Jam</p>
            <p className="text-[11px] text-emerald-600 font-semibold">92.1% dari Target 200 Jam</p>
          </Card>

          <Card className="p-4 space-y-1 border-slate-200 dark:border-navy-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai Ekonomi Binaan</span>
            <p className="text-2xl font-extrabold text-amber-600 font-epilogue">Rp 1.48 M</p>
            <p className="text-[11px] text-slate-500">Omzet & Hibah Peralatan</p>
          </Card>
        </div>

        {/* Grid Charts Recharts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Distribusi Sektor KKN & Kontribusi SDG */}
          <Card className="lg:col-span-7 p-6 space-y-4 border-slate-200 dark:border-navy-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-navy-800">
              <div>
                <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
                  Distribusi Sektor Program & Kontribusi SDG
                </h3>
                <p className="text-xs text-slate-500">Jumlah kelompok mahasiswa per sektor pengabdian desa</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                  <YAxis type="category" dataKey="name" width={160} fontSize={10} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F294A',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="kelompok" fill="#2589F5" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 2: Sebaran Geografis per Kabupaten */}
          <Card className="lg:col-span-5 p-6 space-y-4 border-slate-200 dark:border-navy-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-navy-800">
              <div>
                <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
                  Sebaran Wilayah Kabupaten
                </h3>
                <p className="text-xs text-slate-500">Proporsi desa mitra penerima KKN 2026</p>
              </div>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F294A',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px]">
              {regionData.map((item, idx) => (
                <span key={idx} className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>
                    {item.name} ({item.value} Desa)
                  </span>
                </span>
              ))}
            </div>
          </Card>

          {/* Chart 3: Tren Realisasi Jam Kerja Lapangan */}
          <Card className="lg:col-span-12 p-6 space-y-4 border-slate-200 dark:border-navy-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-navy-800">
              <div>
                <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
                  Progres Kumulatif Jam Kerja Lapangan Mahasiswa (Minggu 1 s.d. 6)
                </h3>
                <p className="text-xs text-slate-500">Target baku LPPM (200 Jam) vs Rata-rata Realisasi Terverifikasi DPL</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyProgressData} margin={{ left: 10, right: 10 }}>
                  <defs>
                    <linearGradient id="realisasiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="minggu" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F294A',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="realisasi"
                    name="Realisasi Terverifikasi"
                    stroke="#16A34A"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#realisasiGrad)"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target Kurikulum LPPM"
                    stroke="#94A3B8"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
