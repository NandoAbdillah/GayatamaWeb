"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Send, Eye, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/services";
import { useAuth } from "@/context/AuthContext";

export interface CampusGroupItem {
  id: string;
  nama: string;
  universitas: string;
  desa: string;
  jarak_km: number;
  dpl: string;
  anggota_count: number;
  progres_pct: number;
  projek: string;
  projek_kategori: string;
  status: "Selesai" | "Berjalan";
}

export default function KampusMonitoringPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<CampusGroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "berjalan" | "selesai">("all");

  const univName = (user as any)?.profil_universitas?.nama_universitas || user?.name || "Universitas";

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.universitas.getKelompokList();
      if (Array.isArray(res)) {
        const normalized: CampusGroupItem[] = res.map((k: any) => {
          const anggota = Array.isArray(k.anggota) ? k.anggota : [];
          const progressList = Array.isArray(k.proposal?.progress_mingguan) ? k.proposal.progress_mingguan : [];
          const maxProg = progressList.length > 0
            ? Math.max(...progressList.map((p: any) => Number(p.persentase || 0)))
            : (k.proposal?.status === 'diterima' ? 25 : 5);
          const isDone = maxProg >= 100 || k.proposal?.luaran_akhir?.status_verifikasi === 'verified';

          const desaObj = k.proposal?.pos_kebutuhan?.desa;
          const desaStr = desaObj
            ? `Desa ${desaObj.nama_desa || ''}, ${desaObj.kabupaten || desaObj.kecamatan || ''}`
            : 'Belum Terhubung Desa';

          return {
            id: String(k.id),
            nama: k.nama_kelompok || `Kelompok #${k.id}`,
            universitas: univName,
            desa: desaStr,
            jarak_km: 15,
            dpl: k.dosen?.user?.name || k.dosen?.name || "Belum Ditugaskan",
            anggota_count: anggota.length > 0 ? anggota.length : 1,
            progres_pct: Math.min(100, Math.max(0, maxProg)),
            projek: k.proposal?.pos_kebutuhan?.judul || k.proposal?.draf_proker || "Program Pengabdian KKN",
            projek_kategori: k.proposal?.pos_kebutuhan?.kategori || "Pemberdayaan Masyarakat",
            status: isDone ? "Selesai" : "Berjalan",
          };
        });
        setGroups(normalized);
      } else {
        setGroups([]);
      }
    } catch (err) {
      console.error("Gagal mengambil daftar kelompok kampus:", err);
      toast.error("Gagal memuat kelompok dari server.");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchSearch =
        g.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.desa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.dpl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.projek.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      if (filterStatus === "berjalan") return g.status === "Berjalan";
      if (filterStatus === "selesai") return g.status === "Selesai";
      return true;
    });
  }, [groups, searchTerm, filterStatus]);

  const countBerjalan = groups.filter((g) => g.status === "Berjalan").length;
  const countSelesai = groups.filter((g) => g.status === "Selesai").length;

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
              LPPM {univName} memantau kelompok binaan — lokasi desa mitra, DPL pengampu, dan status pelaksanaan secara real-time.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success("Pengingat notifikasi pembaruan logbook berhasil diproses")
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
              Semua ({groups.length})
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

        {/* Tabel Monitoring */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs">Memuat data pemantauan kelompok dari server...</p>
          </div>
        ) : (
          <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-md">
            <div className="overflow-x-auto border border-slate-200 dark:border-navy-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-navy-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-navy-800">
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
                      <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                        Belum ada kelompok KKN yang terdaftar atau cocok dengan pencarian Anda.
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition-colors">
                        <td className="p-3">
                          <p className="font-bold text-navy-950 dark:text-white">{g.nama}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {g.anggota_count} Mahasiswa • {g.projek_kategori}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-slate-700 dark:text-slate-200">{g.desa}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Capaian {g.progres_pct}%
                          </p>
                        </td>
                        <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                          {g.dpl}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              g.status === "Selesai"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {g.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Link href={`/kampus/monitoring/${g.id}`}>
                            <Button size="sm" variant="outline" className="text-xs font-bold gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detail</span>
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
