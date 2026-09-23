'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/services';
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
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DosenDashboard() {
  const { user } = useAuth();
  const [kelompokList, setKelompokList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const dosenName = user?.name || 'Dosen Pembimbing Lapangan';
  const dosenNip = (user as any)?.profil_dosen?.nip || (user as any)?.nip || '-';

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.dosen.getBimbinganKelompok();
      if (Array.isArray(res)) {
        setKelompokList(res);
      } else {
        setKelompokList([]);
      }
    } catch (err) {
      console.error('Gagal mengambil data bimbingan dosen:', err);
      toast.error('Gagal memuat kelompok bimbingan dari server.');
      setKelompokList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics from real kelompok data
  const totalKelompok = kelompokList.length;
  const totalMahasiswa = kelompokList.reduce((acc, k) => {
    const count = Array.isArray(k.anggota) ? k.anggota.length : 1;
    return acc + count;
  }, 0);

  const approvedProposals = kelompokList.filter((k) => k.proposal?.status === 'diterima' || k.proposal?.status_kelayakan_dosen === 'layak').length;

  // Flatten all weekly logbooks from all proposals
  const allLogs: any[] = [];
  kelompokList.forEach((k) => {
    const logs = Array.isArray(k.proposal?.progress_mingguan) ? k.proposal.progress_mingguan : [];
    logs.forEach((log: any) => {
      allLogs.push({
        id: log.id,
        kelompok_nama: k.nama_kelompok || `Kelompok #${k.id}`,
        judul_kegiatan: log.catatan_kegiatan || log.deskripsi || `Logbook Minggu ${log.minggu_ke || 1}`,
        mahasiswa_nama: k.ketua?.name || 'Mahasiswa Binaan',
        mahasiswa_nim: k.ketua?.profil_mahasiswa?.nim || '-',
        tanggal: log.created_at ? new Date(log.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Baru saja',
        durasi_jam: 40,
        deskripsi: log.catatan_kegiatan || log.deskripsi || 'Laporan capaian mingguan pengabdian di desa mitra.',
        status: log.persentase >= 100 ? 'approved' : 'submitted',
      });
    });
  });

  const pendingLogs = allLogs.filter((l) => l.status === 'submitted' || l.status === 'revision');

  return (
    <DashboardLayout title="Portal Dosen Pembimbing Lapangan (DPL)">
      <div className="space-y-6 font-jakarta">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-primary-950 to-slate-900 text-white p-6 sm:p-8 shadow-ambient-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-primary-200">
              Dosen Pembimbing Lapangan KKN
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-epilogue">
              {dosenName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono">
              NIP: {dosenNip}
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link href="/dosen/logbook">
                <Button size="sm" variant="primary" className="shadow-glow-primary gap-1.5 font-bold text-xs">
                  <CheckSquare className="w-4 h-4" />
                  <span>Verifikasi Logbook</span>
                </Button>
              </Link>
              <Link href="/dosen/penilaian">
                <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-white/20 font-bold text-xs">
                  <Award className="w-4 h-4 mr-1.5" />
                  <span>Rekap Nilai & Berita Acara</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs">Memuat metrik bimbingan DPL...</p>
          </div>
        ) : (
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
                {pendingLogs.length > 0 ? `${pendingLogs.length} Menunggu Validasi` : 'Semua Tuntas'}
              </span>
            </Card>

            <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Kelompok Binaan</span>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                {totalKelompok} Kelompok
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {kelompokList.map((k) => k.nama_kelompok).join(', ') || 'Belum ada kelompok binaan'}
              </p>
            </Card>

            <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Mahasiswa Binaan</span>
                <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                {totalMahasiswa} Mahasiswa
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                dari {totalKelompok} kelompok binaan
              </p>
            </Card>

            <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Proposal Divalidasi</span>
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                {approvedProposals} / {totalKelompok} Disetujui
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                {totalKelompok > 0 ? `${Math.round((approvedProposals / totalKelompok) * 100)}% Terevaluasi` : '0%'}
              </p>
            </Card>
          </div>
        )}

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
            {pendingLogs.length === 0 ? (
              <Card className="p-8 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tidak ada logbook mingguan yang menunggu validasi DPL saat ini.
                </p>
              </Card>
            ) : (
              pendingLogs.map((log) => (
                <Card key={log.id} className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3 shadow-ambient">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 dark:border-navy-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span>{log.tanggal}</span>
                        <span>•</span>
                        <strong className="text-navy-900 dark:text-slate-200">{log.kelompok_nama} ({log.mahasiswa_nama})</strong>
                        <span>•</span>
                        <span className="text-primary dark:text-primary-400 font-bold">{log.durasi_jam} Jam</span>
                      </div>
                      <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue mt-1">
                        {log.judul_kegiatan}
                      </h3>
                    </div>
                    <StatusBadge status={log.status} size="sm" />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{log.deskripsi}</p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                    <Link href="/dosen/logbook">
                      <Button variant="primary" size="sm" className="text-xs font-bold">
                        Tinjau & Berikan Penilaian
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
