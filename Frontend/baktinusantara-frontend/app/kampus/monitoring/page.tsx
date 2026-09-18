"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Send, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  SEEDED_MONITORING_GROUPS,
  getStatusLabel,
} from "@/lib/data/kampus-monitoring";

export default function KampusMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "berjalan" | "selesai"
  >("all");

  const filteredGroups = SEEDED_MONITORING_GROUPS.filter((g) => {
    const matchSearch =
      g.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.desa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.universitas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.dpl.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    const status = getStatusLabel(g);
    if (filterStatus === "berjalan") return status === "Berjalan";
    if (filterStatus === "selesai") return status === "Selesai";
    return true;
  });

  const countBerjalan = SEEDED_MONITORING_GROUPS.filter(
    (g) => getStatusLabel(g) === "Berjalan",
  ).length;
  const countSelesai = SEEDED_MONITORING_GROUPS.filter(
    (g) => getStatusLabel(g) === "Selesai",
  ).length;

  return (
    <DashboardLayout title="Pemantauan KKN Binaan Kampus">
      <div className="space-y-6 font-jakarta">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Pemantauan Kelompok & Logbook KKN Binaan Kampus
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              LPPM Kampus memantau kelompok binaan — lokasi desa mitra, DPL
              pengampu, dan status pelaksanaan (Berjalan / Selesai) secara
              real-time.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success(
                "Mengirim pengingat notifikasi serentak ke semua ketua kelompok",
              )
            }
            className="text-xs font-bold gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Notifikasi</span>
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kelompok, lokasi KKN, atau DPL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === "all"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Semua ({SEEDED_MONITORING_GROUPS.length})
            </button>
            <button
              onClick={() => setFilterStatus("berjalan")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === "berjalan"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Berjalan ({countBerjalan})
            </button>
            <button
              onClick={() => setFilterStatus("selesai")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === "selesai"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Selesai ({countSelesai})
            </button>
          </div>
        </Card>

        {/* Tabel Monitoring - kolom: Kelompok, Lokasi KKN, Dosen DPL, Status, Aksi */}
        <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-md">
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-500 border-b border-slate-200 dark:border-navy-800">
                  <th className="p-3 font-bold">Kelompok</th>
                  <th className="p-3 font-bold">Lokasi KKN</th>
                  <th className="p-3 font-bold">Dosen DPL</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {filteredGroups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-6 text-center text-slate-500 dark:text-slate-400"
                    >
                      Tidak ada kelompok yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((g) => {
                    const status = getStatusLabel(g);
                    return (
                      <tr
                        key={g.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-navy-900/50 transition-colors"
                      >
                        <td className="p-3">
                          <p className="font-bold text-navy-950 dark:text-white">
                            {g.nama}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {g.anggota_count} Mahasiswa • {g.projek_kategori}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-slate-700 dark:text-slate-200">
                            {g.desa}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {g.jarak_km} km dari kampus
                          </p>
                        </td>
                        <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                          {g.dpl}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              status === "Selesai"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Link href={`/kampus/monitoring/${g.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs font-bold gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detail</span>
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
