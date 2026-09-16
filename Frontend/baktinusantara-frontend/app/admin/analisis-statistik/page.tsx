'use client';

import React, { useState, useEffect } from 'react';
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
  Building2,
  Sparkles,
  Download,
  Calendar,
  Globe2,
  FileCheck2,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/services';

const SDG_COLORS: Record<string, string> = {
  'SDG 2': '#DDA63A',
  'SDG 3': '#4C9F38',
  'SDG 4': '#C5192D',
  'SDG 6': '#26BDE2',
  'SDG 8': '#A21942',
  'SDG 9': '#FD6925',
  'SDG 11': '#FD9D24',
  'SDG 13': '#3F7E44',
  'SDG 15': '#56C02B',
};

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await api.dashboard.getMetrics();
        if (res) {
          setMetrics(res);
        }
      } catch (err) {
        console.warn('Fallback analytics data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  // Format Kategori data for BarChart
  const sectorData = metrics?.kategori_breakdown
    ? Object.entries(metrics.kategori_breakdown).map(([kategori, total]) => ({
        name: kategori === 'umkm' ? 'Pemberdayaan UMKM' : kategori.charAt(0).toUpperCase() + kategori.slice(1),
        pos: total,
      }))
    : [
        { name: 'Pemberdayaan UMKM', pos: 1 },
        { name: 'Lingkungan', pos: 1 },
        { name: 'Kesehatan', pos: 1 },
        { name: 'Pendidikan', pos: 1 },
        { name: 'Fasilitas', pos: 1 },
      ];

  // Format SDG data for PieChart
  const sdgChartData = metrics?.sdgs_distribution
    ? Object.entries(metrics.sdgs_distribution).map(([sdg, val]) => ({
        name: sdg,
        value: val as number,
        color: SDG_COLORS[sdg] || '#2589F5',
      }))
    : [
        { name: 'SDG 3', value: 1, color: '#4C9F38' },
        { name: 'SDG 4', value: 1, color: '#C5192D' },
        { name: 'SDG 8', value: 1, color: '#A21942' },
        { name: 'SDG 9', value: 2, color: '#FD6925' },
        { name: 'SDG 11', value: 1, color: '#FD9D24' },
        { name: 'SDG 13', value: 1, color: '#3F7E44' },
        { name: 'SDG 15', value: 1, color: '#56C02B' },
      ];

  const weeklyProgressData = [
    { minggu: 'M1', target: 25, realisasi: 25 },
    { minggu: 'M2', target: 50, realisasi: 55 },
    { minggu: 'M3', target: 75, realisasi: 75 },
    { minggu: 'M4', target: 100, realisasi: 100 },
  ];

  return (
    <DashboardLayout title="Analisis & Statistik SDG Nasional">
      <div className="space-y-6 font-jakarta">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Analisis Capaian & Statistik SDG Nasional
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Pemantauan kinerja agregat program KKN terpadu, kontribusi Sustainable Development Goals (SDGs), dan efektivitas jam kerja mahasiswa di desa mitra.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Mengekspor laporan data analisis statistik (Excel / CSV)')}
              className="text-xs font-bold gap-1.5 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Excel</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast.success('Mengunduh Laporan Eksekutif Capaian KKN Nasional (PDF)')}
              className="text-xs font-bold gap-1.5 whitespace-nowrap"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Laporan Eksekutif</span>
            </Button>
          </div>
        </div>

        {/* Metrik Agregat Utama */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 space-y-1 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mahasiswa Terlibat</span>
            <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {metrics?.total_mahasiswa_terlibat || 7} Orang
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{metrics?.total_kelompok_kkn || 3} Kelompok KKN</span>
            </p>
          </Card>

          <Card className="p-4 space-y-1 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Desa Mitra Terbantu</span>
            <p className="text-2xl font-extrabold text-primary font-epilogue">
              {metrics?.total_desa_terbantu || 2} Desa
            </p>
            <p className="text-[11px] text-slate-500">Program Berjalan & Selesai</p>
          </Card>

          <Card className="p-4 space-y-1 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Jam Pengabdian</span>
            <p className="text-2xl font-extrabold text-emerald-600 font-epilogue">
              {metrics?.total_jam_pengabdian?.toLocaleString('id-ID') || '640'} Jam
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold">Tercatat di Logbook Mingguan</p>
          </Card>

          <Card className="p-4 space-y-1 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Luaran & Portofolio</span>
            <p className="text-2xl font-extrabold text-amber-600 font-epilogue">
              {metrics?.total_portofolio_publik || 1} Publikasi
            </p>
            <p className="text-[11px] text-slate-500">Sertifikat Digital Diterbitkan</p>
          </Card>
        </div>

        {/* Grid Charts Recharts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Distribusi Sektor Program */}
          <Card className="lg:col-span-7 p-6 space-y-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-navy-800">
              <div>
                <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
                  Distribusi Kategori Program KKN
                </h3>
                <p className="text-xs text-slate-500">Jumlah pos kebutuhan aktif & tuntas per bidang fokus</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                  <YAxis type="category" dataKey="name" width={140} fontSize={11} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F294A',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="pos" name="Jumlah Pos" fill="#2589F5" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 2: Kontribusi SDG */}
          <Card className="lg:col-span-5 p-6 space-y-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-navy-800">
              <div>
                <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
                  Sebaran Agenda SDG
                </h3>
                <p className="text-xs text-slate-500">Proporsi program KKN terhadap target pembangunan global</p>
              </div>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sdgChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sdgChartData.map((entry, index) => (
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

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px]">
              {sdgChartData.map((item, idx) => (
                <span key={idx} className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name} ({item.value})</span>
                </span>
              ))}
            </div>
          </Card>

          {/* Chart 3: Progres Kumulatif Siklus */}
          <Card className="lg:col-span-12 p-6 space-y-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-navy-800">
              <div>
                <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
                  Tren Rata-rata Progres Mingguan Mahasiswa (Minggu 1 s.d. 4)
                </h3>
                <p className="text-xs text-slate-500">Target Kurikulum (%) vs Realisasi Logbook Terverifikasi DPL & Desa</p>
              </div>
            </div>

            <div className="h-60 w-full">
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
                  <YAxis stroke="#64748b" fontSize={11} unit="%" />
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
                    name="Realisasi Progres"
                    stroke="#16A34A"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#realisasiGrad)"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target Kurikulum KKN"
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
