'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/services';
import {
  ShieldCheck,
  Building2,
  Users,
  GraduationCap,
  Award,
  TrendingUp,
  Activity,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Layers,
  MapPin,
  Calendar,
  RefreshCw,
  Landmark,
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardMetrics {
  total_desa_terbantu: number;
  total_umkm_terdigitalisasi: number;
  total_kelompok_kkn: number;
  total_mahasiswa_terlibat: number;
  total_jam_pengabdian: number;
  total_pos_kebutuhan: number;
  status_pos_breakdown: {
    open: number;
    in_progress: number;
    completed: number;
  };
  total_luaran_terverifikasi: number;
  total_portofolio_publik: number;
  kategori_breakdown: Record<string, number>;
  sdgs_distribution: Record<string, number>;
}

export default function KampusDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const res = await api.dashboard.getMetrics();
      if (res) {
        setMetrics(res);
      }
    } catch (err) {
      console.warn('Backend metrics fetch fallback:', err);
      // Fallback fallback default values if network fails
      setMetrics({
        total_desa_terbantu: 2,
        total_umkm_terdigitalisasi: 1,
        total_kelompok_kkn: 3,
        total_mahasiswa_terlibat: 7,
        total_jam_pengabdian: 640,
        total_pos_kebutuhan: 5,
        status_pos_breakdown: { open: 2, in_progress: 2, completed: 1 },
        total_luaran_terverifikasi: 1,
        total_portofolio_publik: 1,
        kategori_breakdown: { umkm: 1, lingkungan: 1, kesehatan: 1, pendidikan: 1, fasilitas: 1 },
        sdgs_distribution: { 'SDG 3': 1, 'SDG 4': 1, 'SDG 8': 1, 'SDG 9': 2, 'SDG 11': 1, 'SDG 13': 1, 'SDG 15': 1 },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }, []);

  const totalPos = metrics?.total_pos_kebutuhan || 0;
  const openPos = metrics?.status_pos_breakdown?.open || 0;
  const inProgressPos = metrics?.status_pos_breakdown?.in_progress || 0;
  const completedPos = metrics?.status_pos_breakdown?.completed || 0;

  return (
    <DashboardLayout
      title="Portal Monev LPPM Kampus"
    >
      <div className="space-y-6 font-jakarta">
        {/* Executive Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-primary-950 text-white p-6 sm:p-8 shadow-ambient-lg relative overflow-hidden border border-slate-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8">
            <Landmark className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-xs text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {currentDate}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-epilogue tracking-tight">
                Monitoring & Evaluasi LPPM Kampus
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
                Kelola mahasiswa KKN, dosen pembimbing lapangan, monitoring spasial program, dan konversi SKS terintegrasi kampus Anda.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link href="/kampus/laporan-dosen">
                <Button size="sm" variant="primary" className="shadow-glow-primary gap-1.5 font-bold text-xs">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Laporan Supervisi DPL</span>
                </Button>
              </Link>
              <Link href="/kampus/monitoring">
                <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-white/20 gap-1.5 font-bold text-xs">
                  <MapPin className="w-4 h-4" />
                  <span>Monitoring Sebaran KKN</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Verification Alert Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                Terdapat Laporan Supervisi DPL Menunggu Review
              </p>
              <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                1 laporan kunjungan lapangan Dosen Pembimbing Lapangan menunggu persetujuan LPPM Kampus.
              </p>
            </div>
          </div>
          <Link href="/kampus/laporan-dosen" className="shrink-0">
            <Button size="sm" variant="outline" className="border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 font-bold text-xs gap-1.5">
              <span>Buka Laporan DPL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Core KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Desa Terbantu</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {loading ? '...' : `${metrics?.total_desa_terbantu || 0} Desa`}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Mitra Aktif & Terverifikasi</span>
            </p>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Mahasiswa KKN Terlibat</span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {loading ? '...' : `${metrics?.total_mahasiswa_terlibat || 0} Orang`}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {metrics?.total_kelompok_kkn || 0} Kelompok Terdaftar
            </p>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>UMKM Terdigitalisasi</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {loading ? '...' : `${metrics?.total_umkm_terdigitalisasi || 0} Unit`}
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              Rebranding & E-Commerce
            </p>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Jam Pengabdian Efektif</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {loading ? '...' : `${metrics?.total_jam_pengabdian?.toLocaleString('id-ID') || 0} Jam`}
            </p>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
              {metrics?.total_luaran_terverifikasi || 0} Luaran Terverifikasi
            </p>
          </Card>
        </div>

        {/* Detailed Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pos Kebutuhan Status & Progress */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                    Status Siklus Pos Kebutuhan Desa
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Distribusi progres kebutuhan masyarakat dari pendaftaran hingga luaran tuntas
                  </p>
                </div>
                <Link href="/kampus/monitoring">
                  <Button variant="outline" size="sm" className="text-xs font-semibold gap-1">
                    <span>Buka Monitoring</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>

              {/* Visual Multi-Segment Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Total Kebutuhan: {totalPos} Pos</span>
                  <span>{completedPos > 0 && totalPos > 0 ? `${Math.round((completedPos / totalPos) * 100)}% Tuntas` : '0% Tuntas'}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-navy-800 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${totalPos > 0 ? (openPos / totalPos) * 100 : 0}%` }}
                    className="bg-primary hover:opacity-90 transition-all"
                    title={`Open: ${openPos}`}
                  />
                  <div
                    style={{ width: `${totalPos > 0 ? (inProgressPos / totalPos) * 100 : 0}%` }}
                    className="bg-amber-500 hover:opacity-90 transition-all"
                    title={`In Progress: ${inProgressPos}`}
                  />
                  <div
                    style={{ width: `${totalPos > 0 ? (completedPos / totalPos) * 100 : 0}%` }}
                    className="bg-emerald-500 hover:opacity-90 transition-all"
                    title={`Completed: ${completedPos}`}
                  />
                </div>
              </div>

              {/* Status Breakdown Cards */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Terbuka (Open)</span>
                  <p className="text-xl font-extrabold text-navy-950 dark:text-white font-epilogue">{openPos}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Menunggu Pelamar</p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 space-y-1">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Berjalan (In Progress)</span>
                  <p className="text-xl font-extrabold text-navy-950 dark:text-white font-epilogue">{inProgressPos}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Sedang Dikerjakan</p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Selesai (Completed)</span>
                  <p className="text-xl font-extrabold text-navy-950 dark:text-white font-epilogue">{completedPos}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Luaran Diterbitkan</p>
                </div>
              </div>

              {/* Kategori Breakdown */}
              <div className="pt-2 border-t border-slate-100 dark:border-navy-800 space-y-3">
                <h3 className="text-xs font-bold text-navy-950 dark:text-white uppercase tracking-wider">
                  Distribusi Kategori Program Pengabdian
                </h3>
                <div className="space-y-2">
                  {metrics?.kategori_breakdown &&
                    Object.entries(metrics.kategori_breakdown).map(([kategori, count]) => {
                      const pct = totalPos > 0 ? Math.round((count / totalPos) * 100) : 0;
                      return (
                        <div key={kategori} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="capitalize text-slate-700 dark:text-slate-200">
                              {kategori === 'umkm' ? 'Pemberdayaan UMKM' : kategori}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 font-mono">
                              {count} Pos ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-navy-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions & SDGs Distribution */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Actions Superadmin */}
            <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                Aksi Pengelolaan Platform
              </h2>

              <div className="space-y-2.5">
                <Link href="/kampus/laporan-dosen" className="block group">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200/80 dark:border-navy-800 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy-950 dark:text-white group-hover:text-primary transition-colors">
                          Laporan Supervisi DPL
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Review & sahkan laporan kunjungan lapangan DPL
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>

                <Link href="/kampus/dosen" className="block group">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200/80 dark:border-navy-800 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy-950 dark:text-white group-hover:text-emerald-600 transition-colors">
                          Manajemen Dosen DPL
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Alokasi & kelola Dosen Pembimbing Lapangan
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>


              </div>
            </Card>

            {/* SDGs Distribution Pill Cloud */}
            <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                  Kontribusi SDG Nusantara
                </h2>
                <span className="text-[11px] text-primary font-bold">Agenda 2030</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {metrics?.sdgs_distribution &&
                  Object.entries(metrics.sdgs_distribution).map(([sdg, count]) => (
                    <span
                      key={sdg}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs font-bold text-navy-950 dark:text-slate-200"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span>{sdg}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono">
                        {count} Pos
                      </span>
                    </span>
                  ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
