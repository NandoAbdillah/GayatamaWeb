"use client";

import React from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { MOCK_ASPIRASI, MOCK_POS_KEBUTUHAN } from "@/lib/mock-data";
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
} from "lucide-react";

export default function PerangkatDesaDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Portal Mitra Pemerintah Desa">
      <div className="space-y-6">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-secondary-900 to-navy-950 text-white p-6 sm:p-8 shadow-ambient-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
              Mitra Resmi KKN Terverifikasi
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-epilogue">
              Pemerintah Desa Sukamaju
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-jakarta leading-relaxed">
              Kecamatan Ciawi, Kabupaten Bogor • Kepala Desa:{" "}
              <span className="font-bold text-white">H. Ahmad Subardjo</span>
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
              5 Orang
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Kelompok 14 (Aktif Lapangan)
            </p>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Pos Kebutuhan Diterbitkan</span>
              <ClipboardList className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              3 Pos
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              2 Dalam Pelaksanaan, 1 Terbuka
            </p>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Aspirasi Warga Masuk</span>
              <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              2 Usulan
            </p>
            <span className="inline-flex text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded-full">
              1 Perlu Tindak Lanjut
            </span>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Total Kelompok</span>
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              1 Kelompok
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Aktif di Desa Sukamaju • 2026</p>
          </Card>
        </div>

        {/* Active KKN Team in Village */}
        <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-ambient space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                Kelompok Mahasiswa KKN Aktif di Desa Sukamaju
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Program: Digitalisasi Katalog Produk UMKM & Manajemen Irigasi
                Cerdas
              </p>
            </div>
            <Link href="/perangkat-desa/progress">
              <Button variant="outline" size="sm" className="text-xs">
                Monitor Progres
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-surface-subtle dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
              <span className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold uppercase">
                Ketua Kelompok
              </span>
              <p className="text-sm font-bold text-navy-950 dark:text-white">M. Rian Pratama</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Teknik Informatika (NIM: 21051204012)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-subtle dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
              <span className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold uppercase">
                Dosen Pembimbing
              </span>
              <p className="text-sm font-bold text-navy-950 dark:text-white">
                Dr. Ir. Hendra Gunawan, M.T.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Departemen Teknologi Informasi & Biosistem
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-subtle dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
              <span className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold uppercase">
                Realisasi Program
              </span>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">71% Selesai</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                3 Luaran Produk Siap Diserahterimakan
              </p>
            </div>
          </div>
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

          <div className="space-y-3">
            {MOCK_ASPIRASI.map((asp) => (
              <Card
                key={asp.id}
                className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-navy-900 dark:text-primary-300">
                    {asp.ticket_number}
                  </span>
                  <StatusBadge status={asp.status} size="sm" />
                </div>
                <h3 className="text-sm font-bold text-navy-950 dark:text-white">{asp.judul}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">{asp.deskripsi}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400">
                  Diajukan oleh:{" "}
                  <span className="font-semibold text-navy-800 dark:text-slate-200">
                    {asp.nama_pengadu}
                  </span>{" "}
                  ({asp.nomor_kontak})
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
