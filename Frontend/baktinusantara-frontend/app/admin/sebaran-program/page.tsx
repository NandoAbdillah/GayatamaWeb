"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Eye, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { MONITORING_UNIV } from "@/lib/data/monitoring-data";
import { FALLBACK_UNIV_DETAIL } from "@/lib/data/direktori-kampus-data";

export default function AdminSebaranProgramPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalUniversitasTerdaftar = FALLBACK_UNIV_DETAIL.length;

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return MONITORING_UNIV.filter(
      (u) =>
        u.nama.toLowerCase().includes(q) ||
        u.kode.toLowerCase().includes(q) ||
        u.provinsi.toLowerCase().includes(q) ||
        u.kabupaten_kota.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <DashboardLayout title="Pemantauan Multi-Kampus & Sebaran Program KKN Nasional">
      <div className="space-y-6 font-jakarta">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Pemantauan Multi-Kampus & Sebaran Program KKN Nasional
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Super Admin memantau daftar universitas mitra berdasarkan provinsi dan membuka rincian program KKN per kampus.
            </p>
          </div>
        </div>

        <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari universitas, kode, atau provinsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 px-3 py-2 rounded-xl whitespace-nowrap">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span>{totalUniversitasTerdaftar} Universitas Terdaftar</span>
          </div>
        </Card>

        <Card className="p-0 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-500 border-b border-slate-200 dark:border-navy-800">
                  <th className="p-3.5 font-bold whitespace-nowrap">Nama Universitas</th>
                  <th className="p-3.5 font-bold whitespace-nowrap">Kode Universitas</th>
                  <th className="p-3.5 font-bold whitespace-nowrap">Kabupaten/Kota</th>
                  <th className="p-3.5 font-bold whitespace-nowrap">Provinsi</th>
                  <th className="p-3.5 font-bold text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-slate-500">
                      Tidak ada universitas yang sesuai pencarian.
                    </td>
                  </tr>
                ) : (
                  paginated.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-950/50 transition-colors">
                      <td className="p-3.5">
                        <p className="font-bold text-navy-950 dark:text-white">{u.nama}</p>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full text-[11px]">{u.kode}</span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">{u.kabupaten_kota}</td>
                      <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">{u.provinsi}</td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/sebaran-program/${u.id}`)}
                          className="text-xs font-bold gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50">
            <p className="text-xs text-slate-500">
              Halaman {currentPage} dari {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
