"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  MapPin,
  Users,
  GraduationCap,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Building2,
  Layers,
  Calendar,
  FileCheck2,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/services";
import { useAuth } from "@/context/AuthContext";

export default function KampusMonitoringDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);

  const univName = (user as any)?.profil_universitas?.nama_universitas || user?.name || "Universitas";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const list = await api.universitas.getKelompokList();
        if (Array.isArray(list)) {
          const match = list.find((k: any) => String(k.id) === String(id));
          if (match) {
            const anggota = Array.isArray(match.anggota) ? match.anggota : [];
            const progressList = Array.isArray(match.proposal?.progress_mingguan) ? match.proposal.progress_mingguan : [];
            const maxProg = progressList.length > 0
              ? Math.max(...progressList.map((p: any) => Number(p.persentase || 0)))
              : (match.proposal?.status === 'diterima' ? 25 : 5);
            const isDone = maxProg >= 100 || match.proposal?.luaran_akhir?.status_verifikasi === 'verified';

            const desaObj = match.proposal?.pos_kebutuhan?.desa;
            const desaStr = desaObj
              ? `Desa ${desaObj.nama_desa || ''}, ${desaObj.kabupaten || desaObj.kecamatan || ''}`
              : 'Belum Terhubung Desa';

            // Generate weekly logbook view from real progress reports or 4-week cycle
            const logbookDetails = [1, 2, 3, 4].map((wk) => {
              const report = progressList.find((p: any) => Number(p.minggu_ke) === wk);
              if (report) {
                return {
                  minggu: wk,
                  status: Number(report.persentase) > 0 ? "Tuntas" : "Kendala",
                  tanggal: report.created_at ? new Date(report.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : undefined,
                  catatan: report.catatan_kegiatan || report.deskripsi || "Laporan mingguan telah disampaikan mahasiswa.",
                };
              }
              return {
                minggu: wk,
                status: "Belum Mulai",
                tanggal: undefined,
                catatan: undefined,
              };
            });

            setGroup({
              id: String(match.id),
              nama: match.nama_kelompok || `Kelompok #${match.id}`,
              universitas: univName,
              desa: desaStr,
              jarak_km: 15,
              izin_ortu: "Radius Standar (<1000 km)",
              dpl: match.dosen?.user?.name || match.dosen?.name || "Belum Ditugaskan",
              anggota_count: anggota.length > 0 ? anggota.length : 1,
              anggota_nama: anggota.map((a: any) => a.user?.name || a.nim || "Mahasiswa"),
              jam_kerja: `${Math.round(maxProg * 1.6)} / 160 Jam`,
              progres_pct: Math.min(100, Math.max(0, maxProg)),
              logbook_minggu: progressList.length,
              logbook_detail: logbookDetails,
              projek: match.proposal?.pos_kebutuhan?.judul || match.proposal?.draf_proker || "Program Pengabdian KKN",
              projek_deskripsi: match.proposal?.pos_kebutuhan?.deskripsi || "Implementasi program kerja mahasiswa KKN bersama masyarakat desa mitra.",
              projek_kategori: match.proposal?.pos_kebutuhan?.kategori || "Pemberdayaan Masyarakat",
              status: isDone ? "Selesai" : "Berjalan",
            });
          }
        }
      } catch (err) {
        console.error("Gagal mengambil detail kelompok:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, univName]);

  if (loading) {
    return (
      <DashboardLayout title="Detail Monitoring Kelompok">
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Memuat data kelompok dan logbook binaan...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout title="Detail Monitoring Kelompok">
        <div className="space-y-6 font-jakarta">
          <Link href="/kampus/monitoring">
            <Button
              variant="outline"
              size="sm"
              className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-700 text-xs font-bold gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </Button>
          </Link>
          <Card className="p-8 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
            <p className="text-sm font-bold text-navy-950 dark:text-white">
              Kelompok tidak ditemukan
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ID <span className="font-mono">{id}</span> tidak ada di data monitoring kampus Anda.
            </p>
            <Link href="/kampus/monitoring" className="mt-4 inline-block">
              <Button size="sm" variant="outline" className="text-xs">
                Kembali ke Daftar
              </Button>
            </Link>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const status = group.status;

  return (
    <DashboardLayout title="Detail Monitoring Kelompok">
      <div className="space-y-6 font-jakarta">
        {/* Breadcrumb / Back */}
        <Link href="/kampus/monitoring">
          <Button
            variant="outline"
            size="sm"
            className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-700 text-xs font-bold gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </Button>
        </Link>

        {/* Header Kelompok */}
        <div className="rounded-2xl bg-gradient-to-r from-navy-950 via-slate-900 to-primary-950 text-white p-6 sm:p-8 shadow-ambient-lg border border-slate-800 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden sm:flex items-center justify-end pr-8">
            <Layers className="w-48 h-48" />
          </div>
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  status === "Selesai"
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                {status === "Selesai" ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                {status}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-xs text-slate-300">
                <Calendar className="w-3.5 h-3.5" />
                Logbook Minggu {group.logbook_minggu} / 4
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-xs text-slate-300">
                <Users className="w-3.5 h-3.5" />
                {group.anggota_count} Mahasiswa
              </span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold font-epilogue tracking-tight">
                {group.nama}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {group.universitas}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-full bg-white/20 rounded-full h-2 max-w-xs overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all"
                  style={{ width: `${group.progres_pct}%` }}
                />
              </div>
              <span className="font-bold">{group.progres_pct}% Progres</span>
            </div>
          </div>
        </div>

        {/* Grid Info Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Info Kelompok & Lokasi */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Kelompok */}
            <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Informasi Kelompok
              </h2>
              {/* Dosen DPL */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Dosen Pembimbing Lapangan (DPL)</p>
                  <p className="text-sm font-bold text-navy-950 dark:text-white">{group.dpl}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-slate-500 dark:text-slate-400">Nama Kelompok</p>
                  <p className="font-bold text-navy-950 dark:text-white">{group.nama}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 dark:text-slate-400">Universitas</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{group.universitas}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 dark:text-slate-400">Jumlah Anggota</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    {group.anggota_count} Mahasiswa
                  </p>
                  {group.anggota_nama && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {group.anggota_nama.join(", ")}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 dark:text-slate-400">Akumulasi Jam</p>
                  <p className="font-mono font-bold text-primary">{group.jam_kerja}</p>
                </div>
              </div>
            </Card>

            {/* Lokasi KKN */}
            <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Lokasi KKN
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-slate-500 dark:text-slate-400">Desa Mitra</p>
                  <p className="font-bold text-navy-950 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {group.desa}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 dark:text-slate-400">Jarak dari Kampus</p>
                  <p className="font-mono font-bold text-slate-700 dark:text-slate-200">{group.jarak_km} km</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 dark:text-slate-400">Izin Orang Tua</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300">{group.izin_ortu}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Kolom Kanan: Projek */}
          <div className="space-y-6">
            <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Projek KKN
              </h2>
              <div>
                <p className="text-sm font-bold text-navy-950 dark:text-white">{group.projek}</p>
                <p className="text-[11px] inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold mt-1">
                  {group.projek_kategori}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                  {group.projek_deskripsi}
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Pelaporan Logbook */}
        <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              Pelaporan Logbook Mingguan
            </h2>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Minggu {group.logbook_minggu} / 4
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {group.logbook_detail.map((lb: any) => (
              <div
                key={lb.minggu}
                className={`p-4 rounded-xl border space-y-2 ${
                  lb.status === "Tuntas"
                    ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900"
                    : lb.status === "Kendala"
                      ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                      : "bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-navy-950 dark:text-white">
                    Minggu {lb.minggu}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      lb.status === "Tuntas"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                        : lb.status === "Kendala"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                          : "bg-slate-200 text-slate-600 dark:bg-navy-800 dark:text-slate-400"
                    }`}
                  >
                    {lb.status}
                  </span>
                </div>
                {lb.tanggal && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {lb.tanggal}
                  </p>
                )}
                {lb.catatan && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {lb.catatan}
                  </p>
                )}
                {!lb.catatan && lb.status === "Belum Mulai" && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                    Belum ada laporan
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
