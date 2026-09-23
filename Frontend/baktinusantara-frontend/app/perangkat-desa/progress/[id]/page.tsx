"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api } from "@/lib/services";
import {
  ArrowLeft,
  Users,
  MapPin,
  GraduationCap,
  Layers,
  Calendar,
  Clock,
  Award,
  FileCheck2,
  TrendingUp,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

export default function PerangkatDesaProgressDetailPage() {
  const params = useParams<{ id: string }>();
  const proposalId = Number(params?.id);

  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<any>(null);
  const [logbooks, setLogbooks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"anggota" | "logbook">("logbook");

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        // Load proposals for this village to find the matching proposal & kelompok
        const proposalsRes = await api.proposal.getByDesa();
        let currentProp = null;
        if (Array.isArray(proposalsRes)) {
          currentProp = proposalsRes.find((p: any) => p.id === proposalId || p.kelompok_id === proposalId);
        }

        if (currentProp) {
          setProposal(currentProp);
          // Load progress mingguan from API
          try {
            const logsRes = await api.progress.getByProposal(currentProp.id);
            if (Array.isArray(logsRes)) {
              setLogbooks(logsRes);
            }
          } catch (e) {
            console.warn("Logbook fetch:", e);
            setLogbooks([]);
          }
        } else {
          setProposal(null);
        }
      } catch (err) {
        console.error("Gagal memuat detail kelompok desa:", err);
        toast.error("Gagal memuat detail kelompok dari server.");
      } finally {
        setLoading(false);
      }
    }

    if (proposalId) {
      loadDetail();
    }
  }, [proposalId]);

  if (loading) {
    return (
      <DashboardLayout title="Detail Pemantauan Kelompok KKN">
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Memuat data kelompok & logbook mingguan...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!proposal) {
    return (
      <DashboardLayout title="Detail Pemantauan Kelompok KKN">
        <div className="space-y-6 font-jakarta">
          <Link href="/perangkat-desa/progress">
            <Button variant="outline" size="sm" className="text-xs font-bold gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </Button>
          </Link>
          <Card className="p-12 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-navy-950 dark:text-white">Kelompok Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Data kelompok KKN dengan ID {proposalId} tidak terdaftar di pos kebutuhan desa ini.
            </p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const kelompok = proposal.kelompok || {};
  const anggotaList = Array.isArray(kelompok.anggota) ? kelompok.anggota : [];
  const posKebutuhan = proposal.pos_kebutuhan || {};
  const desaName = posKebutuhan.desa?.nama_desa || "Desa Mitra";

  const maxPercent = logbooks.length > 0
    ? Math.max(...logbooks.map((l: any) => Number(l.persentase || 0)))
    : (proposal.status === "diterima" || proposal.status === "approved" ? 30 : 0);

  return (
    <DashboardLayout title="Detail Monitoring Kelompok KKN">
      <div className="space-y-6 font-jakarta">
        {/* Top Back & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/perangkat-desa/progress">
              <Button variant="outline" size="sm" className="text-xs font-bold gap-1.5 bg-white dark:bg-navy-900">
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali
              </Button>
            </Link>
            <div>
              <span className="font-mono text-[11px] font-bold text-primary dark:text-primary-300 bg-primary/10 dark:bg-primary-950/70 px-2.5 py-0.5 rounded-full">
                {kelompok.kode_kelompok || `KKN-${proposal.id}`}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-navy-950 dark:text-white font-epilogue mt-1">
                {kelompok.nama_kelompok || `Kelompok #${proposal.kelompok_id || proposal.id}`}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge
              status={proposal.status === "diterima" || proposal.status === "approved" ? "approved" : "submitted"}
              size="sm"
            />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-1">
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Ketua Kelompok</p>
            <p className="text-sm font-bold text-navy-950 dark:text-white">{kelompok.ketua?.name || "Ketua Mahasiswa"}</p>
            <p className="text-xs text-slate-500">{kelompok.ketua?.email || "Mahasiswa KKN"}</p>
          </Card>
          <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-1">
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Dosen Pembimbing</p>
            <p className="text-sm font-bold text-navy-950 dark:text-white">{kelompok.dosen?.name || "DPL KKN"}</p>
            <p className="text-xs text-slate-500">{kelompok.dosen?.nip ? `NIP: ${kelompok.dosen.nip}` : "DPL Resmi"}</p>
          </Card>
          <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-1">
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Desa Penugasan</p>
            <p className="text-sm font-bold text-navy-950 dark:text-white">{desaName}</p>
            <p className="text-xs text-slate-500">{posKebutuhan.kategori || "Program KKN"}</p>
          </Card>
          <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-1">
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Realisasi Program</p>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{maxPercent}% Selesai</p>
            <div className="w-full bg-slate-100 dark:bg-navy-800 rounded-full h-1.5 mt-1 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${maxPercent}%` }} />
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-2">
          <button
            onClick={() => setActiveTab("logbook")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "logbook"
                ? "bg-navy-950 dark:bg-primary text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
            }`}
          >
            Logbook & Progres Mingguan ({logbooks.length})
          </button>
          <button
            onClick={() => setActiveTab("anggota")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "anggota"
                ? "bg-navy-950 dark:bg-primary text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
            }`}
          >
            Daftar Anggota Tim ({anggotaList.length || 1})
          </button>
        </div>

        {/* Tab Content: Logbook */}
        {activeTab === "logbook" && (
          <div className="space-y-4">
            {logbooks.length === 0 ? (
              <Card className="p-10 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                <FileCheck2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-navy-950 dark:text-white">Belum Ada Logbook Mingguan</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Kelompok mahasiswa belum mengunggah catatan logbook pengabdian lapangan.
                </p>
              </Card>
            ) : (
              logbooks.map((log: any, idx: number) => (
                <Card
                  key={log.id || idx}
                  className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Minggu Ke-{log.minggu_ke || idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-navy-950 dark:text-white">
                        Capaian: {log.persentase || 0}%
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {log.created_at ? new Date(log.created_at).toLocaleDateString("id-ID") : "Baru saja"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {log.deskripsi || "Tidak ada rincian kegiatan."}
                  </p>

                  {log.foto_url && (
                    <div className="pt-2">
                      <img
                        src={log.foto_url}
                        alt={`Dokumentasi Minggu ${log.minggu_ke}`}
                        className="h-44 w-auto rounded-xl object-cover border border-slate-200 dark:border-navy-800"
                      />
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Anggota */}
        {activeTab === "anggota" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Ketua */}
            <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Ketua Kelompok
                </span>
              </div>
              <p className="text-sm font-bold text-navy-950 dark:text-white">
                {kelompok.ketua?.name || "Ketua Mahasiswa"}
              </p>
              <p className="text-xs text-slate-500">{kelompok.ketua?.email || "-"}</p>
            </Card>

            {/* Anggota Lainnya */}
            {anggotaList.map((m: any, idx: number) => (
              <Card
                key={m.id || idx}
                className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                    Anggota
                  </span>
                </div>
                <p className="text-sm font-bold text-navy-950 dark:text-white">
                  {m.user?.name || m.nama || `Mahasiswa #${idx + 1}`}
                </p>
                <p className="text-xs text-slate-500">
                  {m.user?.profilMahasiswa?.nim ? `NIM: ${m.user.profilMahasiswa.nim}` : m.nim ? `NIM: ${m.nim}` : "Mahasiswa"}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
