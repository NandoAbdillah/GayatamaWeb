'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/services';
import { Users, MapPin, Layers, TrendingUp, Calendar, ArrowRight, Search, GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface VillageKelompokItem {
  id: number;
  proposal_id: number;
  nama_kelompok: string;
  kode_kelompok: string;
  ketua_nama: string;
  dosen_nama: string;
  pos_kebutuhan_judul: string;
  desa_nama: string;
  total_anggota: number;
  status_program: 'perencanaan' | 'pelaksanaan' | 'penyusunan_luaran' | 'selesai';
  progres_persen: number;
  anggota: any[];
}

const statusLabel: Record<string, { label: string; className: string }> = {
  perencanaan: { label: 'Persiapan', className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  pelaksanaan: { label: 'Pelaksanaan', className: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  penyusunan_luaran: { label: 'Penyusunan Luaran', className: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
  selesai: { label: 'Selesai', className: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
};

export default function PerangkatDesaProgressPage() {
  const { user } = useAuth();
  const [kelompokList, setKelompokList] = useState<VillageKelompokItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const desaName = (user as any)?.profil_desa?.nama_desa || user?.name || 'Desa Mitra';

  const loadData = async () => {
    try {
      setLoading(true);
      const proposals = await api.proposal.getByDesa();
      if (Array.isArray(proposals)) {
        const normalized: VillageKelompokItem[] = proposals
          .filter((p: any) => p.status === 'diterima' || p.status === 'approved' || p.status === 'menunggu')
          .map((p: any, idx: number) => {
            const anggotaRaw = Array.isArray(p.kelompok?.anggota) ? p.kelompok.anggota : [];
            const anggotaCount = anggotaRaw.length > 0 ? anggotaRaw.length : 1;
            const progressList = Array.isArray(p.progressMingguan) ? p.progressMingguan : [];
            const maxPercent = progressList.length > 0
              ? Math.max(...progressList.map((pr: any) => Number(pr.persentase || 0)))
              : (p.status === 'diterima' || p.status === 'approved' ? 25 : 5);

            let statusProg: VillageKelompokItem['status_program'] = 'perencanaan';
            if (maxPercent >= 100) statusProg = 'selesai';
            else if (maxPercent >= 75) statusProg = 'penyusunan_luaran';
            else if (maxPercent >= 20) statusProg = 'pelaksanaan';

            return {
              id: p.kelompok?.id || p.kelompok_id || idx + 1,
              proposal_id: p.id,
              nama_kelompok: p.kelompok?.nama_kelompok || `Kelompok #${p.kelompok_id || p.id}`,
              kode_kelompok: p.kelompok?.kode_kelompok || `KKN-2026-${String(p.id).padStart(3, '0')}`,
              ketua_nama: p.kelompok?.ketua?.name || 'Ketua Mahasiswa',
              dosen_nama: p.kelompok?.dosen?.name || 'DPL KKN',
              pos_kebutuhan_judul: p.pos_kebutuhan?.judul || p.draf_proker || 'Program KKN',
              desa_nama: p.pos_kebutuhan?.desa?.nama_desa || desaName,
              total_anggota: anggotaCount,
              status_program: statusProg,
              progres_persen: Math.min(100, Math.max(0, maxPercent)),
              anggota: anggotaRaw,
            };
          });
        setKelompokList(normalized);
      } else {
        setKelompokList([]);
      }
    } catch (err) {
      console.error('Gagal mengambil data monitoring kelompok desa:', err);
      toast.error('Gagal memuat kelompok dari server.');
      setKelompokList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return kelompokList;
    const q = search.toLowerCase();
    return kelompokList.filter(
      (k) =>
        k.nama_kelompok.toLowerCase().includes(q) ||
        k.pos_kebutuhan_judul.toLowerCase().includes(q) ||
        k.ketua_nama.toLowerCase().includes(q) ||
        k.kode_kelompok.toLowerCase().includes(q)
    );
  }, [kelompokList, search]);

  const totalMahasiswa = kelompokList.reduce((a, b) => a + b.total_anggota, 0);
  const avgProgres = kelompokList.length > 0
    ? Math.round(kelompokList.reduce((a, b) => a + b.progres_persen, 0) / kelompokList.length)
    : 0;

  return (
    <DashboardLayout title="Monitoring Kelompok KKN Desa">
      <div className="space-y-6 font-jakarta">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
            Kelompok KKN Aktif di {desaName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar kelompok mahasiswa yang sedang melaksanakan pengabdian di wilayah {desaName}. Klik detail untuk melihat anggota, projek, dan logbook mingguan.
          </p>
        </div>

        {/* Summary ringkas */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-center">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Kelompok</p>
            <p className="text-2xl font-black text-navy-950 dark:text-white mt-1 font-epilogue">
              {loading ? '-' : `${kelompokList.length} Tim`}
            </p>
          </Card>
          <Card className="p-4 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-center">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Mahasiswa</p>
            <p className="text-2xl font-black text-navy-950 dark:text-white mt-1 font-epilogue">
              {loading ? '-' : `${totalMahasiswa} Orang`}
            </p>
          </Card>
          <Card className="p-4 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-center">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Rata-rata Progres</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-epilogue">
              {loading ? '-' : `${avgProgres}%`}
            </p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kelompok, ketua, kode, atau judul program..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl text-xs text-navy-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
          />
        </div>

        {/* List Kelompok */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm">Memuat data pemantauan kelompok KKN...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-navy-950 dark:text-white">Tidak Ada Kelompok Aktif</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Belum ada kelompok KKN yang aktif di desa ini atau tidak ada hasil yang cocok dengan pencarian Anda.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((k) => {
              const statusCfg = statusLabel[k.status_program] || statusLabel.perencanaan;

              return (
                <Card
                  key={k.proposal_id}
                  className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 hover:border-primary/40 transition-all shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-navy-800 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-primary dark:text-primary-300 bg-primary/10 dark:bg-primary-950/70 px-2 py-0.5 rounded-full">
                          {k.kode_kelompok}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                        {k.nama_kelompok}
                      </h2>
                    </div>

                    <Link href={`/perangkat-desa/progress/${k.proposal_id}`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1.5 self-start sm:self-center">
                        <span>Lihat Logbook & Detail</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                    <span className="font-semibold text-navy-950 dark:text-white">Program:</span> {k.pos_kebutuhan_judul}
                  </p>

                  {/* Metadata grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-surface-subtle dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-0.5">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Ketua</p>
                      <p className="font-bold text-navy-950 dark:text-white truncate">{k.ketua_nama}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-subtle dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-0.5">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">DPL</p>
                      <p className="font-bold text-navy-950 dark:text-white truncate">{k.dosen_nama}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-subtle dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-0.5">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Mahasiswa</p>
                      <p className="font-bold text-navy-950 dark:text-white">{k.total_anggota} Orang</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-subtle dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-0.5">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Progres</p>
                      <p className="font-bold text-emerald-700 dark:text-emerald-400">{k.progres_persen}% Selesai</p>
                    </div>
                  </div>

                  {/* Progres Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Capaian Program Kerja</span>
                      <span className="font-bold text-navy-950 dark:text-white">{k.progres_persen}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-navy-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${k.progres_persen}%` }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
