"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/services";
import { Aspirasi, PosKebutuhan, Proposal } from "@/lib/types";
import {
  Home,
  ClipboardList,
  MessageSquare,
  Users,
  Award,
  Sparkles,
  PlusCircle,
  CheckCircle2,
  ArrowRight,
  FileCheck2,
  Loader2,
  AlertCircle,
  Building,
} from "lucide-react";

export default function PerangkatDesaDashboard() {
  const { user } = useAuth();
  const [posList, setPosList] = useState<PosKebutuhan[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [aspirasiList, setAspirasiList] = useState<Aspirasi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [posRes, propRes, aspRes] = await Promise.allSettled([
          api.posKebutuhan.getByDesa(),
          api.proposal.getByDesa(),
          api.aspirasi.getByDesa(),
        ]);

        if (posRes.status === "fulfilled" && Array.isArray(posRes.value)) {
          setPosList(posRes.value);
        }
        if (propRes.status === "fulfilled" && Array.isArray(propRes.value)) {
          setProposals(propRes.value);
        }
        if (aspRes.status === "fulfilled" && Array.isArray(aspRes.value)) {
          setAspirasiList(aspRes.value);
        }
      } catch (err) {
        console.error("Gagal memuat data dashboard desa:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const desaName = (user as any)?.profil_desa?.nama_desa || user?.name || "Desa Mitra";
  const kecamatan = (user as any)?.profil_desa?.kecamatan || "Kecamatan";
  const kabupaten = (user as any)?.profil_desa?.kabupaten || "Kabupaten";
  const kepalaDesa = (user as any)?.profil_desa?.kepala_desa || user?.name || "Kepala Desa";

  // Filter approved proposals and derive active team
  const approvedProposals = proposals.filter((p) => p.status === "diterima" || p.status === "approved");
  const pendingAspirasiCount = aspirasiList.filter((a) => (a.status as string) === "pending" || (a.status as string) === "menunggu").length;

  const totalMahasiswaBertugas = approvedProposals.reduce((sum, p: any) => {
    const anggotaCount = Array.isArray(p.kelompok?.anggota) ? p.kelompok.anggota.length : 1;
    return sum + anggotaCount;
  }, 0);

  const activeProposal: any = approvedProposals[0] || null;

  return (
    <DashboardLayout title="Portal Mitra Pemerintah Desa">
      <div className="space-y-6 font-jakarta">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-secondary-900 to-navy-950 text-white p-6 sm:p-8 shadow-ambient-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
              Mitra Resmi KKN Terverifikasi
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-epilogue">
              Pemerintah {desaName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {kecamatan}, {kabupaten} • Kepala Desa:{" "}
              <span className="font-bold text-white">{kepalaDesa}</span>
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link href="/perangkat-desa/pos-kebutuhan">
                <Button
                  size="sm"
                  variant="emerald"
                  className="shadow-glow-secondary gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Buat Pos Kebutuhan Baru</span>
                </Button>
              </Link>
              <Link href="/perangkat-desa/bast">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                >
                  <Award className="w-4 h-4 mr-1.5" />
                  <span>Penilaian & Pengesahan BAST</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Mahasiswa Bertugas</span>
              <Users className="w-4 h-4 text-primary dark:text-primary-300" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {loading ? "-" : `${totalMahasiswaBertugas} Orang`}
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              {approvedProposals.length > 0
                ? `${approvedProposals.length} Kelompok Aktif Lapangan`
                : "Belum ada kelompok aktif"}
            </p>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Pos Kebutuhan Diterbitkan</span>
              <ClipboardList className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {loading ? "-" : `${posList.length} Pos`}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {posList.filter((p) => p.status === "open").length} Terbuka, {posList.filter((p) => p.status === "in_progress").length} Pelaksanaan
            </p>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Aspirasi Warga Masuk</span>
              <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {loading ? "-" : `${aspirasiList.length} Usulan`}
            </p>
            <span className="inline-flex text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded-full">
              {pendingAspirasiCount} Perlu Tindak Lanjut
            </span>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Total Proposal Masuk</span>
              <FileCheck2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {loading ? "-" : `${proposals.length} Proposal`}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {proposals.filter((p) => p.status === "menunggu").length} Menunggu Keputusan
            </p>
          </Card>
        </div>

        {/* Active KKN Team in Village */}
        <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-ambient space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                Kelompok Mahasiswa KKN Bertugas di {desaName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeProposal
                  ? `Program: ${activeProposal.pos_kebutuhan?.judul || activeProposal.draf_proker || "Pengabdian Mahasiswa"}`
                  : "Status program dan kelompok KKN yang telah disahkan desa."}
              </p>
            </div>
            <Link href="/perangkat-desa/progress">
              <Button variant="outline" size="sm" className="text-xs">
                Monitor Progres
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memuat data kelompok bertugas...</span>
            </div>
          ) : activeProposal ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-surface-subtle dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">
                  Ketua Kelompok
                </span>
                <p className="text-sm font-bold text-navy-950 dark:text-white">
                  {activeProposal.kelompok?.ketua?.name || "Ketua Kelompok"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeProposal.kelompok?.nama_kelompok || "Kelompok KKN"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-subtle dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">
                  Dosen Pembimbing
                </span>
                <p className="text-sm font-bold text-navy-950 dark:text-white">
                  {activeProposal.kelompok?.dosen?.name || "DPL KKN"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeProposal.kelompok?.dosen?.nip ? `NIP: ${activeProposal.kelompok.dosen.nip}` : "DPL Resmi Kampus"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-subtle dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">
                  Status Pengesahan
                </span>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {activeProposal.status === "diterima" || activeProposal.status === "approved" ? "Disetujui Desa" : "Dalam Peninjauan"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeProposal.pos_kebutuhan?.judul || "Pos Kebutuhan Desa"}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed border-slate-200 dark:border-navy-800 rounded-2xl">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Belum ada kelompok KKN yang aktif di desa ini.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Periksa menu Proposal KKN Masuk untuk menyetujui usulan kelompok mahasiswa.
              </p>
            </div>
          )}
        </Card>

        {/* Aspirations Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
              Aspirasi Masyarakat Desa Masuk
            </h2>
            <Link
              href="/perangkat-desa/aspirasi"
              className="text-xs text-primary dark:text-primary-400 font-semibold hover:underline"
            >
              Buka Semua Aspirasi →
            </Link>
          </div>

          {loading ? (
            <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memuat aspirasi masyarakat...</span>
            </div>
          ) : aspirasiList.length === 0 ? (
            <Card className="p-6 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Belum ada aspirasi warga yang masuk untuk desa ini.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Warga dapat menyampaikan aspirasi langsung melalui portal publik BaktiNusantara.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {aspirasiList.slice(0, 5).map((asp) => (
                <Card
                  key={asp.id}
                  className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-navy-900 dark:text-primary-300">
                      {asp.ticket_number || `ASP-${asp.id}`}
                    </span>
                    <StatusBadge status={asp.status} size="sm" />
                  </div>
                  <h3 className="text-sm font-bold text-navy-950 dark:text-white">{asp.judul}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{asp.deskripsi}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400">
                    Diajukan oleh:{" "}
                    <span className="font-semibold text-navy-800 dark:text-slate-200">
                      {asp.nama_pengadu || (asp as any).pelapor_nama || "Warga Desa"}
                    </span>{" "}
                    {asp.nomor_kontak || (asp as any).pelapor_wa ? `(${asp.nomor_kontak || (asp as any).pelapor_wa})` : ""}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
