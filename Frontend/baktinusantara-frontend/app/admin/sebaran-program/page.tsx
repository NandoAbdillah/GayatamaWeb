"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Send, Eye, X, Building2 } from "lucide-react";
import { toast } from "sonner";

interface KampusMonitoringItem {
  id: string;
  kampus: string;
  kode: string;
  kota: string;
  kelompok_aktif: number;
  jumlah_mahasiswa: number;
  jumlah_desa_mitra: number;
  status_lppm: "Terverifikasi" | "Aktif" | "Menunggu";
  rata_progres: number;
  alert: string | null;
}

const SEEDED_KAMPUS_MONITORING: KampusMonitoringItem[] = [
  {
    id: "kampus-1",
    kampus: "Universitas Negeri Surabaya",
    kode: "UNESA",
    kota: "Surabaya",
    kelompok_aktif: 12,
    jumlah_mahasiswa: 45,
    jumlah_desa_mitra: 8,
    status_lppm: "Terverifikasi",
    rata_progres: 78,
    alert: null,
  },
  {
    id: "kampus-2",
    kampus: "Institut Teknologi Sepuluh Nopember",
    kode: "ITS",
    kota: "Surabaya",
    kelompok_aktif: 8,
    jumlah_mahasiswa: 32,
    jumlah_desa_mitra: 6,
    status_lppm: "Aktif",
    rata_progres: 65,
    alert: null,
  },
  {
    id: "kampus-3",
    kampus: "Universitas Airlangga",
    kode: "UNAIR",
    kota: "Surabaya",
    kelompok_aktif: 5,
    jumlah_mahasiswa: 18,
    jumlah_desa_mitra: 4,
    status_lppm: "Menunggu",
    rata_progres: 42,
    alert: "Menunggu verifikasi legalitas LPPM",
  },
  {
    id: "kampus-4",
    kampus: "Universitas Brawijaya",
    kode: "UB",
    kota: "Malang",
    kelompok_aktif: 10,
    jumlah_mahasiswa: 38,
    jumlah_desa_mitra: 7,
    status_lppm: "Terverifikasi",
    rata_progres: 82,
    alert: null,
  },
];

export default function AdminMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedKampus, setSelectedKampus] =
    useState<KampusMonitoringItem | null>(null);

  const filteredKampus = SEEDED_KAMPUS_MONITORING.filter((k) => {
    const matchSearch =
      k.kampus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.kota.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === "menunggu")
      return matchSearch && k.status_lppm === "Menunggu";
    if (filterStatus === "terverifikasi")
      return matchSearch && k.status_lppm !== "Menunggu";
    return matchSearch;
  });

  return (
    <DashboardLayout title="Pemantauan Multi-Kampus & Sebaran Program KKN Nasional">
      <div className="space-y-6 font-jakarta">
        {/* Header Title - sama persis dengan kampus/monitoring */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Pemantauan Multi-Kampus & Sebaran Program KKN Nasional
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Super Admin mengawasi performa seluruh kampus mitra — kelompok
              aktif, sebaran mahasiswa, desa binaan, status LPPM, dan rata-rata
              progres logbook.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success(
                "Mengirim pengingat notifikasi serentak ke seluruh LPPM kampus",
              )
            }
            className="text-xs font-bold gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Notifikasi</span>
          </Button>
        </div>

        {/* Filter & Search Bar - desain identik kampus/monitoring */}
        <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kampus, kode, atau kota..."
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
              Semua ({SEEDED_KAMPUS_MONITORING.length})
            </button>
            <button
              onClick={() => setFilterStatus("menunggu")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === "menunggu"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Menunggu (
              {
                SEEDED_KAMPUS_MONITORING.filter(
                  (k) => k.status_lppm === "Menunggu",
                ).length
              }
              )
            </button>
            <button
              onClick={() => setFilterStatus("terverifikasi")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === "terverifikasi"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Terverifikasi (
              {
                SEEDED_KAMPUS_MONITORING.filter(
                  (k) => k.status_lppm !== "Menunggu",
                ).length
              }
              )
            </button>
          </div>
        </Card>

        {/* Tabel Monitoring - desain identik kampus/monitoring, hanya kolom berbeda */}
        <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-md">
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-500 border-b border-slate-200 dark:border-navy-800">
                  <th className="p-3 font-bold">Kampus</th>
                  <th className="p-3 font-bold">Kelompok Aktif</th>
                  <th className="p-3 font-bold">Jumlah Mahasiswa</th>
                  <th className="p-3 font-bold">Jumlah Desa Mitra</th>
                  <th className="p-3 font-bold">Status LPPM</th>
                  <th className="p-3 font-bold">Rata-rata Progres</th>
                  <th className="p-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {filteredKampus.map((k) => (
                  <tr
                    key={k.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-navy-900/50 transition-colors"
                  >
                    <td className="p-3">
                      <p className="font-bold text-navy-950 dark:text-white">
                        {k.kampus}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {k.kode} • {k.kota}
                      </p>
                    </td>
                    <td className="p-3 font-bold text-navy-950 dark:text-white text-center">
                      {k.kelompok_aktif}
                    </td>
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300 text-center">
                      {k.jumlah_mahasiswa}
                    </td>
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300 text-center">
                      {k.jumlah_desa_mitra}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          k.status_lppm === "Menunggu"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : k.status_lppm === "Terverifikasi"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {k.status_lppm}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-navy-800 rounded-full overflow-hidden w-20">
                          <div
                            className={`h-full rounded-full ${
                              k.rata_progres >= 75
                                ? "bg-emerald-500"
                                : k.rata_progres >= 50
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                            }`}
                            style={{ width: `${k.rata_progres}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                          {k.rata_progres}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedKampus(k)}
                        className="text-xs font-bold gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal Detail - struktur sama seperti kampus/monitoring */}
        {selectedKampus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
            <Card className="w-full max-w-lg p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                      Rincian Kampus Mitra
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedKampus.kampus} ({selectedKampus.kode})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedKampus(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-jakarta">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      Kampus:{" "}
                      <strong className="text-navy-950 dark:text-white">
                        {selectedKampus.kampus}
                      </strong>
                    </div>
                    <div>
                      Kode:{" "}
                      <strong className="text-navy-950 dark:text-white">
                        {selectedKampus.kode}
                      </strong>
                    </div>
                    <div>
                      Domisili:{" "}
                      <span className="text-slate-700 dark:text-slate-300">
                        {selectedKampus.kota}
                      </span>
                    </div>
                    <div>
                      Status LPPM:{" "}
                      <span className="font-bold text-primary">
                        {selectedKampus.status_lppm}
                      </span>
                    </div>
                    <div>
                      Kelompok Aktif:{" "}
                      <span className="font-bold">
                        {selectedKampus.kelompok_aktif} Kelompok
                      </span>
                    </div>
                    <div>
                      Mahasiswa:{" "}
                      <span>{selectedKampus.jumlah_mahasiswa} Orang</span>
                    </div>
                    <div>
                      Desa Mitra:{" "}
                      <span>{selectedKampus.jumlah_desa_mitra} Desa</span>
                    </div>
                    <div>
                      Rata-rata Progres:{" "}
                      <span className="font-bold text-emerald-600">
                        {selectedKampus.rata_progres}%
                      </span>
                    </div>
                  </div>
                </div>

                {selectedKampus.alert && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-200">
                    <p className="font-bold">Catatan Pengawasan:</p>
                    <p className="mt-0.5">{selectedKampus.alert}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-navy-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedKampus(null)}
                  className="text-xs"
                >
                  Tutup
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
