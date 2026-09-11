'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { MOCK_KELOMPOK_14, MOCK_LOGBOOKS } from '@/lib/mock-data';
import {
  Clock,
  BookOpen,
  Users,
  FileText,
  Award,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building,
  PlusCircle,
} from 'lucide-react';

export default function MahasiswaDashboard() {
  const { user } = useAuth();
  const kelompok = MOCK_KELOMPOK_14;

  const totalJam = 142;
  const targetJam = 200;
  const percentJam = Math.round((totalJam / targetJam) * 100);

  const pendingLogbook = MOCK_LOGBOOKS.find((l) => l.status === 'revision' || l.status === 'submitted');

  return (
    <DashboardLayout title="Portal Mahasiswa KKN">
      <div className="space-y-6">
        {/* Top Welcome Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-primary-900 to-navy-900 text-white p-6 sm:p-8 shadow-ambient-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-primary-200">
              <Sparkles className="w-3.5 h-3.5" /> KKN Tematik Semester Ganjil 2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-epilogue">
              Semangat Mengabdi, {user?.name || 'M. Rian Pratama'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-jakarta leading-relaxed">
              Anda bertugas di <span className="font-bold text-white">{kelompok.desa_nama}</span> bersama{' '}
              {kelompok.nama_kelompok}. Tetap konsisten mencatat logbook harian dan capai target luaran pengabdian.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link href="/mahasiswa/progress">
                <Button size="sm" variant="primary" className="bg-primary text-white shadow-glow-primary">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  <span>Isi Logbook Hari Ini</span>
                </Button>
              </Link>
              <Link href="/mahasiswa/kelompok">
                <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                  <Users className="w-4 h-4 mr-1.5" />
                  <span>Lihat Tim Kelompok</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Progress & Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Jam Kerja Lapangan</span>
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-navy-950 font-epilogue">{totalJam}</span>
              <span className="text-xs text-slate-400 font-medium">/ {targetJam} Jam</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${percentJam}%` }} />
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold">{percentJam}% dari target wajib</p>
          </Card>

          <Card className="p-5 border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Status Kelompok</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-navy-950 font-epilogue truncate">Kelompok 14</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Desa Sukamaju, Bogor</span>
            </div>
            <p className="text-[11px] text-slate-400">5 Mahasiswa Lintas Jurusan</p>
          </Card>

          <Card className="p-5 border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Dosen Pembimbing (DPL)</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xs font-bold text-navy-950 font-epilogue line-clamp-1">
              Dr. Ir. Hendra Gunawan, M.T.
            </p>
            <p className="text-[11px] text-slate-500">NIP: 197804122005011002</p>
            <span className="inline-flex text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              DPL Terhubung Aktif
            </span>
          </Card>

          <Card className="p-5 border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Capaian Program Kerja</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-navy-950 font-epilogue">
                {kelompok.progres_persen}%
              </span>
              <span className="text-xs text-slate-400 font-medium">Eksekusi</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${kelompok.progres_persen}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">3 dari 4 target luaran tercapai</p>
          </Card>
        </div>

        {/* Action Attention Alert if any revision */}
        {pendingLogbook && pendingLogbook.status === 'revision' && (
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-ambient-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-2xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Perhatian: Catatan Revisi Logbook dari DPL
                </p>
                <p className="text-xs text-amber-950 leading-relaxed">
                  &ldquo;{pendingLogbook.catatan_revisi_dpl}&rdquo;
                </p>
              </div>
            </div>

            <Link href="/mahasiswa/progress">
              <Button size="sm" variant="amber" className="whitespace-nowrap font-bold text-xs">
                Perbaiki & Kirim Ulang
              </Button>
            </Link>
          </div>
        )}

        {/* Two Sections: Logbook Activity Feed & Program Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Logbooks (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-navy-950 font-epilogue">
                Riwayat Logbook Harian Terakhir
              </h2>
              <Link href="/mahasiswa/progress" className="text-xs text-primary font-semibold hover:underline">
                Lihat Semua ({MOCK_LOGBOOKS.length}) →
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_LOGBOOKS.map((log) => (
                <Card key={log.id} className="p-5 border-slate-200 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{log.tanggal}</span>
                        <span>•</span>
                        <span>Minggu ke-{log.minggu_ke}</span>
                        <span>•</span>
                        <span className="font-bold text-primary">{log.durasi_jam} Jam Kerja</span>
                      </div>
                      <h3 className="text-sm font-bold text-navy-950 font-epilogue mt-1">
                        {log.judul_kegiatan}
                      </h3>
                    </div>
                    <StatusBadge status={log.status} size="sm" />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-jakarta">
                    {log.deskripsi}
                  </p>

                  {log.catatan_revisi_dpl && (
                    <div className="p-3 rounded-2xl bg-orange-50/80 border border-orange-200 text-xs text-orange-950 space-y-1">
                      <span className="font-bold text-orange-800">Catatan DPL:</span>
                      <p>{log.catatan_revisi_dpl}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Target Milestones & Quick Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-base font-bold text-navy-950 font-epilogue">
              Target Luaran & BAST Desa
            </h2>

            <Card className="p-5 border-slate-200 space-y-4 bg-white">
              <div className="space-y-2">
                {[
                  { name: 'Katalog Marketplace UMKM Desa Sukamaju', done: true },
                  { name: 'Pelatihan Foto & Branding Produk UMKM', done: true },
                  { name: 'Instalasi Monitoring Irigasi Cerdas IoT', done: true },
                  { name: 'Penerbitan BAST & Pengesahan Desa', done: false },
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-navy-900">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        task.done ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                    />
                    <span className={task.done ? 'font-medium' : 'text-slate-400'}>{task.name}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <Link href="/mahasiswa/portofolio">
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                    Kelola Berkas Luaran Akhir
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
