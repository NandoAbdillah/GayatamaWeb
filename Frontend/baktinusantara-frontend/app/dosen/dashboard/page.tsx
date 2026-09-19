'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { MOCK_LOGBOOKS } from '@/lib/mock-data';
import {
  GraduationCap,
  CheckSquare,
  FileText,
  Award,
  Users,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function DosenDashboard() {
  const { user } = useAuth();
  const pendingLogs = MOCK_LOGBOOKS.filter((l) => l.status === 'submitted' || l.status === 'revision');

  return (
    <DashboardLayout title="Portal Dosen Pembimbing Lapangan (DPL)">
      <div className="space-y-6">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-primary-950 to-slate-900 text-white p-6 sm:p-8 shadow-ambient-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-primary-200">
              Dosen Pembimbing Lapangan KKN 2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-epilogue">
              {user?.name || 'Dr. Ir. Hendra Gunawan, M.T.'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-jakarta leading-relaxed">
              NIP: 197804122005011002
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link href="/dosen/logbook">
                <Button size="sm" variant="primary" className="shadow-glow-primary gap-1.5">
                  <CheckSquare className="w-4 h-4" />
                  <span>Verifikasi Logbook Pending</span>
                </Button>
              </Link>
              <Link href="/dosen/penilaian">
                <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                  <Award className="w-4 h-4 mr-1.5" />
                  <span>Rekap Nilai & Berita Acara</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Logbook Perlu Tindakan</span>
              <CheckSquare className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {pendingLogs.length} Entri
            </p>
            <span className="inline-flex text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded-full">
              1 Menunggu Validasi, 1 Dalam Revisi
            </span>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Kelompok Binaan</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">3 Kelompok</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Desa Sukamaju, Desa Cibodas, Desa Tanjung Karang</p>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Mahasiswa Binaan</span>
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">15 Mahasiswa</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">dari 3 kelompok binaan</p>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Proposal Divalidasi</span>
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">3 / 3 Disetujui</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Kelayakan Akademik 100%</p>
          </Card>
        </div>

        {/* Action List of Pending Logbooks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
              Logbook Mahasiswa Menunggu Tinjauan DPL
            </h2>
            <Link href="/dosen/logbook" className="text-xs text-primary dark:text-primary-400 font-semibold hover:underline">
              Buka Semua Logbook →
            </Link>
          </div>

          <div className="space-y-3">
            {pendingLogs.map((log) => (
              <Card key={log.id} className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3 shadow-ambient">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 dark:border-navy-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>{log.tanggal}</span>
                      <span>•</span>
                      <strong className="text-navy-900 dark:text-slate-200">{log.mahasiswa_nama} ({log.mahasiswa_nim})</strong>
                      <span>•</span>
                      <span className="text-primary dark:text-primary-400 font-bold">{log.durasi_jam} Jam</span>
                    </div>
                    <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue mt-1">
                      {log.judul_kegiatan}
                    </h3>
                  </div>
                  <StatusBadge status={log.status} size="sm" />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-jakarta leading-relaxed">{log.deskripsi}</p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                  <Link href="/dosen/logbook">
                    <Button variant="primary" size="sm" className="text-xs">
                      Tinjau & Berikan Penilaian
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
