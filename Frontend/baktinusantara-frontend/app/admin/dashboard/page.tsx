"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/services";
import { FALLBACK_UNIV_DETAIL } from "@/lib/data/direktori-kampus-data";
import { MONITORING_UNIV } from "@/lib/data/monitoring-data";
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

// Dummy data siklus KKN per bulan/tahun - tidak terlalu banyak (15 titik: Sep 2024 - Mar 2026)
type KknCyclePoint = {
  month: number; // 1-12
  monthLabel: string;
  year: number;
  membutuhkan: number; // jumlah desa yang membutuhkan KKN
  berjalan: number; // jumlah KKN yang sedang berjalan
  selesai: number; // jumlah kelompok KKN yang sudah menyelesaikan
  label: string; // "Jan 2025"
};

const DUMMY_KKN_CYCLE: KknCyclePoint[] = [
  {
    month: 9,
    monthLabel: "Sep",
    year: 2024,
    membutuhkan: 11,
    berjalan: 5,
    selesai: 2,
    label: "Sep 2024",
  },
  {
    month: 10,
    monthLabel: "Okt",
    year: 2024,
    membutuhkan: 13,
    berjalan: 6,
    selesai: 3,
    label: "Okt 2024",
  },
  {
    month: 11,
    monthLabel: "Nov",
    year: 2024,
    membutuhkan: 12,
    berjalan: 7,
    selesai: 4,
    label: "Nov 2024",
  },
  {
    month: 12,
    monthLabel: "Des",
    year: 2024,
    membutuhkan: 15,
    berjalan: 8,
    selesai: 5,
    label: "Des 2024",
  },
  {
    month: 1,
    monthLabel: "Jan",
    year: 2025,
    membutuhkan: 14,
    berjalan: 7,
    selesai: 4,
    label: "Jan 2025",
  },
  {
    month: 2,
    monthLabel: "Feb",
    year: 2025,
    membutuhkan: 16,
    berjalan: 9,
    selesai: 5,
    label: "Feb 2025",
  },
  {
    month: 3,
    monthLabel: "Mar",
    year: 2025,
    membutuhkan: 18,
    berjalan: 10,
    selesai: 6,
    label: "Mar 2025",
  },
  {
    month: 4,
    monthLabel: "Apr",
    year: 2025,
    membutuhkan: 15,
    berjalan: 11,
    selesai: 7,
    label: "Apr 2025",
  },
  {
    month: 5,
    monthLabel: "Mei",
    year: 2025,
    membutuhkan: 17,
    berjalan: 12,
    selesai: 8,
    label: "Mei 2025",
  },
  {
    month: 6,
    monthLabel: "Jun",
    year: 2025,
    membutuhkan: 14,
    berjalan: 13,
    selesai: 9,
    label: "Jun 2025",
  },
  {
    month: 7,
    monthLabel: "Jul",
    year: 2025,
    membutuhkan: 13,
    berjalan: 11,
    selesai: 10,
    label: "Jul 2025",
  },
  {
    month: 8,
    monthLabel: "Agu",
    year: 2025,
    membutuhkan: 12,
    berjalan: 10,
    selesai: 11,
    label: "Agu 2025",
  },
  {
    month: 9,
    monthLabel: "Sep",
    year: 2025,
    membutuhkan: 10,
    berjalan: 9,
    selesai: 12,
    label: "Sep 2025",
  },
  {
    month: 10,
    monthLabel: "Okt",
    year: 2025,
    membutuhkan: 11,
    berjalan: 8,
    selesai: 13,
    label: "Okt 2025",
  },
  {
    month: 1,
    monthLabel: "Jan",
    year: 2026,
    membutuhkan: 9,
    berjalan: 7,
    selesai: 14,
    label: "Jan 2026",
  },
  {
    month: 2,
    monthLabel: "Feb",
    year: 2026,
    membutuhkan: 8,
    berjalan: 6,
    selesai: 15,
    label: "Feb 2026",
  },
  {
    month: 3,
    monthLabel: "Mar",
    year: 2026,
    membutuhkan: 10,
    berjalan: 8,
    selesai: 13,
    label: "Mar 2026",
  },
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  // Filtering bulan/tahun untuk line chart siklus KKN
  const availableYears = useMemo(
    () =>
      Array.from(new Set(DUMMY_KKN_CYCLE.map((d) => d.year))).sort(
        (a, b) => a - b,
      ),
    [],
  );
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const res = await api.dashboard.getMetrics();
      if (res) {
        setMetrics(res);
      }
    } catch (err) {
      console.warn("Backend metrics fetch fallback:", err);
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
        kategori_breakdown: {
          umkm: 1,
          lingkungan: 1,
          kesehatan: 1,
          pendidikan: 1,
          fasilitas: 1,
        },
        sdgs_distribution: {
          "SDG 3": 1,
          "SDG 4": 1,
          "SDG 8": 1,
          "SDG 9": 2,
          "SDG 11": 1,
          "SDG 13": 1,
          "SDG 15": 1,
        },
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
      now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  // Data untuk line chart: jika filter spesifik bulan -> hanya tampil bulan itu saja
  const chartDisplayData = useMemo(() => {
    const byYear = DUMMY_KKN_CYCLE.filter((d) => d.year === selectedYear);
    if (selectedMonth === "all") return byYear;
    return byYear.filter((d) => d.month === selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Snapshot untuk 3 card status: jika filter spesifik bulan -> angka bulan itu, jika semua -> angka bulan terakhir di tahun terpilih (snapshot terkini)
  const snapshot = useMemo(() => {
    if (selectedMonth !== "all") {
      return (
        DUMMY_KKN_CYCLE.find(
          (d) => d.year === selectedYear && d.month === selectedMonth,
        ) || null
      );
    }
    const byYear = DUMMY_KKN_CYCLE.filter((d) => d.year === selectedYear);
    return byYear.length ? byYear[byYear.length - 1] : null;
  }, [selectedYear, selectedMonth]);

  // Fallback ke metrics jika dummy tidak ada; jika filter spesifik bulan tanpa data tampilkan 0
  const totalPos = metrics?.total_pos_kebutuhan || 0;
  const snapshotMembutuhkan =
    snapshot?.membutuhkan ??
    (selectedMonth !== "all" ? 0 : (metrics?.status_pos_breakdown?.open ?? 0));
  const snapshotBerjalan =
    snapshot?.berjalan ??
    (selectedMonth !== "all" ? 0 : (metrics?.status_pos_breakdown?.in_progress ?? 0));
  const snapshotSelesai =
    snapshot?.selesai ??
    (selectedMonth !== "all" ? 0 : (metrics?.status_pos_breakdown?.completed ?? 0));
  const snapshotTotal =
    snapshot != null
      ? snapshot.membutuhkan + snapshot.berjalan + snapshot.selesai
      : selectedMonth !== "all"
        ? 0
        : totalPos;
  const pctSelesai =
    snapshotTotal > 0 ? Math.round((snapshotSelesai / snapshotTotal) * 100) : 0;

  const handleResetFilter = () => {
    setSelectedYear(2025);
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
              {loading ? "..." : `${FALLBACK_UNIV_DETAIL.length} Kampus`}
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
              {loading ? "..." : `${MONITORING_UNIV.filter((u) => u.program_aktif > 0).length} Kampus`}
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
