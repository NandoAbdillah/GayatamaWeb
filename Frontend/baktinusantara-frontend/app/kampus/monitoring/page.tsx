"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Activity,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Send,
  Eye,
  Compass,
  FileCheck2,
  Building,
  GraduationCap,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface GroupMonitoringItem {
  id: string;
  nama: string;
  universitas: string;
  desa: string;
  jarak_km: number;
  izin_ortu: string;
  dpl: string;
  anggota_count: number;
  jam_kerja: string;
  progres_pct: number;
  logbook_status: string;
  gps_valid: boolean;
  alert: string | null;
}

const SEEDED_MONITORING_GROUPS: GroupMonitoringItem[] = [
  {
    id: "kelompok-1",
    nama: "KKN UNESA 01 - Sukamaju Digital",
    universitas: "Universitas Negeri Surabaya (UNESA)",
    desa: "Desa Sukamaju, Mojowarno, Jombang",
    jarak_km: 15.5,
    izin_ortu: "Radius Standar (<1000 km)",
    dpl: "Dr. Budi Santoso, M.Kom.",
    anggota_count: 3,
    jam_kerja: "160 / 160 Jam",
    progres_pct: 100,
    logbook_status: "Tuntas Minggu 4",
    gps_valid: true,
    alert: null,
  },
  {
    id: "kelompok-2",
    nama: "KKN UNESA 02 - Edukasi Cempaka",
    universitas: "Universitas Negeri Surabaya (UNESA)",
    desa: "Desa Cempaka Putih, Pacet, Mojokerto",
    jarak_km: 28.3,
    izin_ortu: "Radius Standar (<1000 km)",
    dpl: "Dr. Retno Wulandari, M.Pd.",
    anggota_count: 1,
    jam_kerja: "0 / 160 Jam",
    progres_pct: 0,
    logbook_status: "Kendala Minggu 1",
    gps_valid: true,
    alert: "Menunggu persetujuan proposal dari pihak desa",
  },
  {
    id: "kelompok-3",
    nama: "KKN UNESA 03 - Harapan Sejahtera",
    universitas: "Universitas Negeri Surabaya (UNESA)",
    desa: "Desa Jatirowo, Dawarblandong, Mojokerto",
    jarak_km: 42.0,
    izin_ortu: "Radius Standar (<1000 km)",
    dpl: "Dr. Siti Aminah, M.Pd.",
    anggota_count: 4,
    jam_kerja: "120 / 160 Jam",
    progres_pct: 75,
    logbook_status: "Tuntas Minggu 3",
    gps_valid: true,
    alert: null,
  },
  {
    id: "kelompok-4",
    nama: "KKN UNESA 04 - Asri Lestari",
    universitas: "Universitas Negeri Surabaya (UNESA)",
    desa: "Desa Sumber Glagah, Pacet, Mojokerto",
    jarak_km: 18.9,
    izin_ortu: "Radius Standar (<1000 km)",
    dpl: "Prof. Hendra Wijaya, M.Si.",
    anggota_count: 2,
    jam_kerja: "40 / 160 Jam",
    progres_pct: 25,
    logbook_status: "Kendala Minggu 2",
    gps_valid: true,
    alert: "Logbook minggu 2 belum diunggah, menunggu bimbingan DPL",
  },
];

export default function AdminMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedGroup, setSelectedGroup] =
    useState<GroupMonitoringItem | null>(null);

  const filteredGroups = SEEDED_MONITORING_GROUPS.filter((g) => {
    const matchSearch =
      g.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.desa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.universitas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.dpl.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === "alert") return matchSearch && g.alert !== null;
    if (filterStatus === "ok") return matchSearch && g.alert === null;
    return matchSearch;
  });

  return (
    <DashboardLayout title="Pemantauan Sebaran & Pelaksanaan Program KKN">
      <div className="space-y-6 font-jakarta">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                Pemantauan Lapangan & Sebaran Program KKN
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Super Admin mengawasi kepatuhan operasional, laporan logbook
              mingguan, radius jarak (&gt;1.000 km), dan surat izin orang tua
              kelompok mahasiswa KKN.
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
              placeholder="Cari kelompok, universitas, desa, atau DPL..."
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
              onClick={() => setFilterStatus("alert")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === "alert"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Perlu Perhatian (
              {SEEDED_MONITORING_GROUPS.filter((g) => g.alert !== null).length}
              )
            </button>
            <button
              onClick={() => setFilterStatus("ok")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === "ok"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Berjalan Normal (
              {SEEDED_MONITORING_GROUPS.filter((g) => g.alert === null).length})
            </button>
          </div>
        </Card>

        {/* Tabel Monitoring */}
        <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-md">
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-500 border-b border-slate-200 dark:border-navy-800">
                  <th className="p-3 font-bold">Kelompok & Kampus Asal</th>
                  <th className="p-3 font-bold">Lokasi Desa Mitra</th>
                  <th className="p-3 font-bold">Dosen DPL</th>
                  <th className="p-3 font-bold">Akumulasi Jam</th>
                  <th className="p-3 font-bold">Status Logbook</th>
                  <th className="p-3 font-bold">Izin Ortu (&gt;1000km)</th>
                  <th className="p-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {filteredGroups.map((g) => (
                  <tr
                    key={g.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-navy-900/50 transition-colors"
                  >
                    <td className="p-3">
                      <p className="font-bold text-navy-950 dark:text-white">
                        {g.nama}
                      </p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-slate-700 dark:text-slate-200">
                        {g.desa}
                      </p>
                    </td>
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                      {g.dpl}
                    </td>
                    <td className="p-3 font-bold text-primary font-mono">
                      {g.jam_kerja.replace(/\s*\(.*\)/, "")}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          g.logbook_status.toLowerCase().startsWith("kendala")
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {g.logbook_status}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {g.jarak_km} km
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedGroup(g)}
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

        {/* Modal Detail Monitoring */}
        {selectedGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
            <Card className="w-full max-w-lg p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                      Rincian Pelaksanaan Kelompok KKN
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedGroup.nama}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-jakarta">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      Institusi:{" "}
                      <strong className="text-navy-950 dark:text-white">
                        {selectedGroup.universitas}
                      </strong>
                    </div>
                    <div>
                      DPL:{" "}
                      <strong className="text-navy-950 dark:text-white">
                        {selectedGroup.dpl}
                      </strong>
                    </div>
                    <div>
                      Lokasi Mitra:{" "}
                      <span className="text-slate-700 dark:text-slate-300">
                        {selectedGroup.desa}
                      </span>
                    </div>
                    <div>
                      Jarak Asal:{" "}
                      <span className="font-mono font-bold text-primary">
                        {selectedGroup.jarak_km} km
                      </span>
                    </div>
                    <div>
                      Anggota:{" "}
                      <span>{selectedGroup.anggota_count} Mahasiswa</span>
                    </div>
                    <div>
                      Progres Siklus:{" "}
                      <span className="font-bold text-emerald-600">
                        {selectedGroup.progres_pct}%
                      </span>
                    </div>
                  </div>
                </div>

                {selectedGroup.alert && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-200">
                    <p className="font-bold">Catatan Pengawasan:</p>
                    <p className="mt-0.5">{selectedGroup.alert}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-navy-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedGroup(null)}
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
