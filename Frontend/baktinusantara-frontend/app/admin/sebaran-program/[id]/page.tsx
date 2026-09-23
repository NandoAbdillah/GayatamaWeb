"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Building2,
  MapPin,
  ShieldCheck,
  Award,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  Loader2,
} from "lucide-react";
import api from "@/lib/services";

export default function SebaranProgramDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const univId = params?.id as string;
  const [univ, setUniv] = useState<any | null>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Aktif" | "Selesai">("all");
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    async function loadData() {
      if (!univId) return;
      try {
        setLoading(true);
        // 1. Fetch university list to find matching university
        const univs = await api.universitas.getUniversitasList();
        const found = Array.isArray(univs)
          ? (univs as any[]).find((u) => String(u.id) === String(univId))
          : null;

        if (found) {
          setUniv({
            id: found.id,
            nama: found.nama_universitas || found.nama,
            kode: found.kode_univ || `UNIV-${found.id}`,
            provinsi: found.provinsi || "Indonesia",
            status: found.status === "aktif" || found.status === "verified" ? "Terverifikasi" : "Pending",
            total_program: found.kelompok_count || 0,
            program_aktif: found.kelompok_count || 0,
            program_selesai: 0,
          });
        } else {
          setUniv(null);
        }

        // 2. Fetch pos kebutuhan programs
        const allPos = await api.posKebutuhan.getAll({});
        if (Array.isArray(allPos)) {
          setPrograms(
            allPos.map((p) => ({
              id: p.id,
              nama_program: p.judul,
              nama_desa: p.desa?.nama_desa || "Desa Mitra",
              kabupaten_kota: p.desa?.kabupaten || "Wilayah",
              status: p.status === "completed" ? "Selesai" : "Aktif",
              sdg: p.sdg_target || "SDG",
            }))
          );
        }
      } catch (err) {
        console.error("Gagal memuat detail sebaran program:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [univId]);

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        p.nama_program.toLowerCase().includes(q) ||
        p.nama_desa.toLowerCase().includes(q) ||
        p.kabupaten_kota.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [programs, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  if (loading) {
    return (
      <DashboardLayout title="Detail Monitoring KKN">
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs text-slate-500">Memuat profil universitas...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!univ) {
    return (
      <DashboardLayout title="Detail Monitoring KKN">
        <div className="space-y-4 font-jakarta w-full">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/sebaran-program")} className="gap-1.5 text-xs font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </Button>
          <Card className="p-12 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
            <p className="text-sm font-bold text-navy-950 dark:text-white">Universitas tidak ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">ID {String(univId)} tidak terdaftar dalam pangkalan data.</p>
            <Link href="/admin/sebaran-program">
              <Button size="sm" variant="outline" className="mt-4 gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Sebaran Program
              </Button>
            </Link>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Detail Monitoring KKN">
      <div className="space-y-6 font-jakarta w-full">
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/sebaran-program")} className="gap-1.5 text-xs font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </Button>

        {/* Header */}
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm w-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-50/40 dark:from-primary/10 pointer-events-none" />
          <div className="relative">
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Detail Monitoring KKN
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Rincian universitas dan program KKN yang dipantau Super Admin.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Nama Universitas
                </p>
                <p className="text-sm font-bold text-navy-950 dark:text-white mt-1.5 leading-snug">{univ.nama}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3" /> Kode Universitas
                </p>
                <p className="text-sm font-bold font-mono text-primary mt-1.5">{univ.kode}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Provinsi
                </p>
                <p className="text-sm font-semibold text-navy-950 dark:text-white mt-1.5">{univ.provinsi}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Status Universitas
                </p>
                <p className="mt-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                      univ.status === "Terverifikasi"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50"
                        : "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50"
                    }`}
                  >
                    {univ.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Ringkasan Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Program</p>
              <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue mt-1">{programs.length}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Seluruh program KKN</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Program Aktif</p>
              <p className="text-2xl font-extrabold text-emerald-600 font-epilogue mt-1">
                {programs.filter((p) => p.status === "Aktif").length}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Sedang berjalan</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Program Selesai</p>
              <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue mt-1">
                {programs.filter((p) => p.status === "Selesai").length}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Telah tuntas</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* Program KKN */}
        <Card className="p-0 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-md overflow-hidden w-full">
          <div className="p-4 border-b border-slate-200 dark:border-navy-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">Program KKN Terkait</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama program, desa, kabupaten..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
                {[
                  { key: "all", label: "Semua" },
                  { key: "Aktif", label: "Aktif" },
                  { key: "Selesai", label: "Selesai" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      statusFilter === f.key
                        ? "bg-primary text-white shadow-sm"
                        : "bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-navy-800">
                  <th className="p-3.5 font-bold">Nama Program</th>
                  <th className="p-3.5 font-bold">Desa</th>
                  <th className="p-3.5 font-bold">Kabupaten/Kota</th>
                  <th className="p-3.5 font-bold">Target SDG</th>
                  <th className="p-3.5 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                      Tidak ada program yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  paginated.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-950/50 transition-colors">
                      <td className="p-3.5 font-bold text-navy-950 dark:text-white">{p.nama_program}</td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{p.nama_desa}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{p.kabupaten_kota}</td>
                      <td className="p-3.5">
                        <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full">
                          {p.sdg}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            p.status === "Aktif"
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"
                              : "bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
