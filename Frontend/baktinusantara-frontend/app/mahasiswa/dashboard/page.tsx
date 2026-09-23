'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/services';
import { LogbookEntry, Proposal, Kelompok } from '@/lib/types';
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
  Loader2,
  Inbox,
} from 'lucide-react';

export default function MahasiswaDashboard() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [kelompok, setKelompok] = useState<Kelompok | null>(null);
  const [logbooks, setLogbooks] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMahasiswaData() {
      try {
        setLoading(true);
        // 1. Fetch current student's proposals
        const props = await api.proposal.getMyProposals();
        const propList = Array.isArray(props) ? props : [];
        setProposals(propList);

        if (propList.length > 0) {
          const activeProp = propList[0];
          // 2. Fetch kelompok detail if available
          const kId = activeProp.kelompok_id || (activeProp.kelompok as any)?.id;
          if (kId) {
            try {
              const kData = await api.kelompok.getDetail(kId);
              if (kData) setKelompok(kData);
            } catch (err) {
              console.warn('Gagal memuat detail kelompok:', err);
            }
          }

          // 3. Fetch progress logbooks for this proposal
          try {
            const rawLogs = await api.progress.getByProposal(activeProp.id);
            const list: any[] = Array.isArray(rawLogs)
              ? rawLogs
              : Array.isArray((rawLogs as any)?.data)
              ? (rawLogs as any).data
              : [];
            setLogbooks(list.map((item) => api.progress.normalizeEntry(item)));
          } catch (err) {
            console.warn('Gagal memuat logbook mahasiswa:', err);
          }
        }
      } catch (err) {
        console.error('Error memuat data dashboard mahasiswa:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMahasiswaData();
  }, []);

  const totalJam = useMemo(() => {
    return logbooks.reduce((acc, l) => acc + (Number(l.durasi_jam) || 0), 0);
  }, [logbooks]);

  const targetJam = 200;
  const percentJam = Math.min(100, Math.round((totalJam / targetJam) * 100));

  const activeProposal = proposals[0] || null;
  const desaName =
    activeProposal?.posKebutuhan?.desa?.nama_desa ||
    (kelompok as any)?.desa_nama ||
    'Belum terhubung ke desa';
  const regencyName = activeProposal?.posKebutuhan?.desa?.kabupaten || '';

  const dosenName =
    kelompok?.dosen?.user?.name ||
    kelompok?.dosen_nama ||
    'Belum ditetapkan';
  const dosenNip =
    kelompok?.dosen?.nip || '-';

  const pendingLogbook = useMemo(() => {
    return logbooks.find((l) => l.status === 'revision' || l.status === 'submitted');
  }, [logbooks]);

  const capaianPersen = activeProposal
    ? logbooks.length > 0
      ? Math.min(100, logbooks.length * 20)
      : 0
    : 0;

  return (
    <DashboardLayout title="Portal Mahasiswa KKN">
      <div className="space-y-6">
        {/* Top Welcome Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-primary-900 to-navy-900 text-white p-6 sm:p-8 shadow-ambient-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-primary-200">
              KKN Tematik Periode Aktif
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-epilogue">
              Semangat Mengabdi, {user?.name || 'Mahasiswa'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-jakarta leading-relaxed">
              {kelompok ? (
                <>
                  Anda bertugas di{' '}
                  <span className="font-bold text-white">
                    {desaName} {regencyName ? `(${regencyName})` : ''}
                  </span>{' '}
                  bersama {kelompok.nama_kelompok}. Tetap konsisten mencatat logbook harian dan capai target luaran pengabdian.
                </>
              ) : (
                'Selamat datang di sistem KKN BaktiNusantara. Siapkan kelompok dan ajukan proposal pengabdian untuk mulai berkontribusi nyata bagi desa.'
              )}
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
                  <span>{kelompok ? 'Lihat Tim Kelompok' : 'Kelola / Buat Tim'}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Progress & Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Jam Kerja Lapangan</span>
              <Clock className="w-4 h-4 text-primary dark:text-primary-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">{totalJam}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">/ {targetJam} Jam</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-navy-800 rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${percentJam}%` }} />
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">{percentJam}% dari target wajib</p>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Status Kelompok</span>
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-navy-950 dark:text-white font-epilogue truncate">
              {kelompok?.nama_kelompok || 'Belum Ada Kelompok'}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
              <span className="truncate">{desaName}</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {kelompok?.anggota ? `${kelompok.anggota.length} Anggota Terdaftar` : '0 Mahasiswa'}
            </p>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Dosen Pembimbing (DPL)</span>
              <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="text-xs font-bold text-navy-950 dark:text-white font-epilogue line-clamp-1">
              {dosenName}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">NIP: {dosenNip}</p>
            <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${
              dosenName !== 'Belum ditetapkan'
                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60'
            }`}>
              {dosenName !== 'Belum ditetapkan' ? 'DPL Terhubung Aktif' : 'Menunggu Penetapan'}
            </span>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Capaian Program Kerja</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                {capaianPersen}%
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Eksekusi</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-navy-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${capaianPersen}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {logbooks.length} laporan mingguan tercatat
            </p>
          </Card>
        </div>

        {/* Action Attention Alert if any revision */}
        {pendingLogbook && pendingLogbook.status === 'revision' && (
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-ambient-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                  Perhatian: Catatan Revisi Logbook dari DPL
                </p>
                <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                  &ldquo;{pendingLogbook.catatan_revisi_dpl || 'Mohon lengkapi dokumentasi dan rincian jam kerja'}&rdquo;
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
              <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                Riwayat Logbook Harian Terakhir
              </h2>
              {logbooks.length > 0 && (
                <Link href="/mahasiswa/progress" className="text-xs text-primary dark:text-primary-400 font-semibold hover:underline">
                  Lihat Semua ({logbooks.length}) →
                </Link>
              )}
            </div>

            {loading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Memuat riwayat logbook...</p>
              </div>
            ) : logbooks.length === 0 ? (
              <Card className="p-8 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center mx-auto text-slate-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
                    Belum Ada Logbook Tercatat
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Catat setiap aktivitas, dokumentasi foto, dan jam kerja pengabdian Anda di lapangan setiap minggu.
                  </p>
                </div>
                <Link href="/mahasiswa/progress" className="inline-block pt-1">
                  <Button size="sm" variant="primary" className="text-xs">
                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                    Buat Laporan Mingguan Pertama
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {logbooks.slice(0, 5).map((log) => (
                  <Card key={log.id} className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{log.tanggal}</span>
                          <span>•</span>
                          <span>Minggu ke-{log.minggu_ke}</span>
                          {log.durasi_jam ? (
                            <>
                              <span>•</span>
                              <span className="font-bold text-primary dark:text-primary-400">{log.durasi_jam} Jam Kerja</span>
                            </>
                          ) : null}
                        </div>
                        <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue mt-1">
                          {log.judul_kegiatan}
                        </h3>
                      </div>
                      <StatusBadge status={log.status} size="sm" />
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-jakarta">
                      {log.deskripsi}
                    </p>

                    {log.catatan_revisi_dpl && (
                      <div className="p-3 rounded-2xl bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-xs text-orange-950 dark:text-orange-200 space-y-1">
                        <span className="font-bold text-orange-800 dark:text-orange-300">Catatan DPL:</span>
                        <p>{log.catatan_revisi_dpl}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Target Milestones & Quick Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
              Status Proposal & Berkas
            </h2>

            <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-4 bg-white dark:bg-navy-900">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-navy-900 dark:text-slate-200">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      kelompok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                  <span className={kelompok ? 'font-medium' : 'text-slate-400 dark:text-slate-500'}>
                    Pembentukan & Anggota Kelompok
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-navy-900 dark:text-slate-200">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      activeProposal ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                  <span className={activeProposal ? 'font-medium' : 'text-slate-400 dark:text-slate-500'}>
                    Pengajuan Proposal Program Kerja
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-navy-900 dark:text-slate-200">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      activeProposal?.status_desa === 'approved' || activeProposal?.status_kelayakan_dosen === 'layak'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                  <span className={activeProposal?.status_desa === 'approved' ? 'font-medium' : 'text-slate-400 dark:text-slate-500'}>
                    Persetujuan Kelayakan Desa & DPL
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-navy-900 dark:text-slate-200">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      logbooks.length >= 4 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                  <span className={logbooks.length >= 4 ? 'font-medium' : 'text-slate-400 dark:text-slate-500'}>
                    Pelaporan Logbook Mingguan Berjalan
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-navy-800 space-y-2">
                <Link href="/mahasiswa/proposal">
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold dark:border-navy-700 dark:text-slate-200">
                    {activeProposal ? 'Kelola Status Proposal' : 'Ajukan Proposal KKN'}
                  </Button>
                </Link>
                <Link href="/mahasiswa/portofolio">
                  <Button variant="ghost" size="sm" className="w-full text-xs font-semibold text-slate-500 dark:text-slate-400">
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
