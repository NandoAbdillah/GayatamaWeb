"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/services";
import {
  ShieldCheck,
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  Sparkles,
  Clock,
  ClipboardList,
  Calendar,
  Landmark,
  Filter,
  RotateCcw,
  LineChart as LineChartIcon,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const MONTH_OPTIONS: { value: number | "all"; label: string }[] = [
  { value: "all", label: "Semua Bulan" },
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

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

export default function SuperadminDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [universitasList, setUniversitasList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  const currentYear = new Date().getFullYear();
  const availableYears = useMemo(() => [currentYear - 1, currentYear, currentYear + 1], [currentYear]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const [resMetrics, resUnivs] = await Promise.allSettled([
        api.dashboard.getMetrics(),
        api.universitas.getUniversitasList(),
      ]);

      if (resMetrics.status === "fulfilled" && resMetrics.value) {
        setMetrics(resMetrics.value);
      }
      if (resUnivs.status === "fulfilled" && Array.isArray(resUnivs.value)) {
        setUniversitasList(resUnivs.value);
      }
    } catch (err) {
      console.error("Gagal mengambil metrik admin:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  const chartDisplayData = useMemo(() => {
    const openCount = metrics?.status_pos_breakdown?.open || 0;
    const inProgressCount = metrics?.status_pos_breakdown?.in_progress || 0;
    const completedCount = metrics?.status_pos_breakdown?.completed || 0;

    const months = Array.from({ length: 12 }, (_, i) => {
      const mNum = i + 1;
      return {
        month: mNum,
        monthLabel: MONTH_NAMES[i],
        year: selectedYear,
        membutuhkan: openCount,
        berjalan: inProgressCount,
        selesai: completedCount,
        label: `${MONTH_NAMES[i]} ${selectedYear}`,
      };
    });

    if (selectedMonth === "all") return months;
    return months.filter((d) => d.month === selectedMonth);
  }, [metrics, selectedYear, selectedMonth]);

  const snapshotMembutuhkan = metrics?.status_pos_breakdown?.open ?? 0;
  const snapshotBerjalan = metrics?.status_pos_breakdown?.in_progress ?? 0;
  const snapshotSelesai = metrics?.status_pos_breakdown?.completed ?? 0;
  const snapshotTotal = snapshotMembutuhkan + snapshotBerjalan + snapshotSelesai;
  const pctSelesai = snapshotTotal > 0 ? Math.round((snapshotSelesai / snapshotTotal) * 100) : 0;

  const handleResetFilter = () => {
    setSelectedYear(currentYear);
    setSelectedMonth("all");
  };

  return (
    <DashboardLayout title="Pusat Kendali Eksekutif Super Admin">
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
                Sistem Informasi & Pusat Kendali BaktiNusantara
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
                Pantau seluruh ekosistem pengabdian masyarakat: verifikasi
                institusi perguruan tinggi, desa mitra, mahasiswa, dan pemetaan
                dampak SDG terintegrasi.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link href="/admin/verifikasi-entitas">
                <Button
                  size="sm"
                  variant="primary"
                  className="shadow-glow-primary gap-1.5 font-bold text-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verifikasi Berkas Mitra & Kampus</span>
                </Button>
              </Link>
              <Link href="/admin/pos-kebutuhan">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/10 text-white hover:bg-white/20 border-white/20 gap-1.5 font-bold text-xs"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Katalog Pos Kebutuhan Desa</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Core KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Desa Terdaftar</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {loading ? "..." : `${metrics?.total_desa_terbantu || 0} Desa`}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Mitra Terdaftar di Sistem</span>
            </p>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Desa Terbantu</span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {loading ? "..." : `${metrics?.total_desa_terbantu || 0} Desa`}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Telah Menerima Program KKN</span>
            </p>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Universitas Terdaftar</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {loading ? "..." : `${universitasList.length} Kampus`}
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Kampus Mitra Terverifikasi</p>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="text-[10px] sm:text-xs leading-tight">Universitas Sedang KKN</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {loading ? "..." : `${universitasList.filter((u: any) => u.status === 'aktif' || u.status === 'verified').length} Kampus`}
            </p>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">Aktif menjalankan KKN</p>
          </Card>
        </div>

        {/* Detailed Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pos Kebutuhan Status & Progress */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-5">
              <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-navy-800 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                      Status Siklus Pos Kebutuhan Desa
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Distribusi progres kebutuhan masyarakat dari pendaftaran
                      hingga luaran tuntas
                    </p>
                  </div>
                </div>

                {/* Filtering bulan/tahun */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-between bg-slate-50/70 dark:bg-navy-950/70 rounded-xl p-3 border border-slate-100 dark:border-navy-800">
                  <div className="flex flex-wrap gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Tahun
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) =>
                          setSelectedYear(Number(e.target.value))
                        }
                        className="h-9 min-w-[110px] rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 px-3 text-sm font-semibold text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {availableYears.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                        <Filter className="w-3 h-3" /> Bulan
                      </label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSelectedMonth(v === "all" ? "all" : Number(v));
                        }}
                        className="h-9 min-w-[150px] rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 px-3 text-sm font-semibold text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {MONTH_OPTIONS.map((opt) => (
                          <option
                            key={String(opt.value)}
                            value={String(opt.value)}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilter}
                      className="gap-1.5 text-xs font-semibold whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </Button>
                  </div>
                </div>
              </div>

              {/* Status Breakdown Cards - renamed */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    Membutuhkan KKN
                  </span>
                  <p className="text-xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                    {snapshotMembutuhkan}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Desa butuh penempatan KKN
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 space-y-1">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                    KKN Berjalan
                  </span>
                  <p className="text-xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                    {snapshotBerjalan}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    KKN sedang berlangsung
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    KKN Selesai
                  </span>
                  <p className="text-xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                    {snapshotSelesai}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Kelompok tuntas & luaran terbit
                  </p>
                </div>
              </div>

              {/* Line Chart Tren Siklus KKN */}
              <div className="pt-4 border-t border-slate-100 dark:border-navy-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-navy-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <LineChartIcon className="w-3.5 h-3.5 text-primary" />
                    Tren Siklus KKN (Line Chart)
                  </h3>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {selectedMonth === "all"
                      ? `${selectedYear}`
                      : `${MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`}
                  </span>
                </div>

                {chartDisplayData.length === 0 ? (
                  <div className="h-[260px] flex items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-800/30 text-sm text-slate-500 text-center px-4">
                    {selectedMonth === "all"
                      ? `Tidak ada informasi KKN pada tahun ${selectedYear}`
                      : `Tidak ada informasi KKN pada bulan ${MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label.toLowerCase()} ${selectedYear}`}
                  </div>
                ) : (
                  <div className="h-[280px] w-full bg-white dark:bg-navy-900 rounded-xl border border-slate-100 dark:border-navy-800 p-2 sm:p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartDisplayData}
                        margin={{ top: 8, right: 16, left: -10, bottom: 4 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          opacity={0.6}
                        />
                        <XAxis
                          dataKey={selectedMonth === "all" ? "monthLabel" : "label"}
                          interval={0}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={{ stroke: "#e2e8f0" }}
                          tickLine={{ stroke: "#e2e8f0" }}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={{ stroke: "#e2e8f0" }}
                          tickLine={{ stroke: "#e2e8f0" }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                            fontSize: "12px",
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                          iconType="circle"
                        />
                        <Line
                          type="monotone"
                          dataKey="membutuhkan"
                          name="Membutuhkan KKN"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          dot={{
                            r: selectedMonth !== "all" ? 4 : 3,
                            strokeWidth: 2,
                          }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="berjalan"
                          name="KKN Berjalan"
                          stroke="#f59e0b"
                          strokeWidth={2.5}
                          dot={{
                            r: selectedMonth !== "all" ? 4 : 3,
                            strokeWidth: 2,
                          }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="selesai"
                          name="KKN Selesai"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={{
                            r: selectedMonth !== "all" ? 4 : 3,
                            strokeWidth: 2,
                          }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}


              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
