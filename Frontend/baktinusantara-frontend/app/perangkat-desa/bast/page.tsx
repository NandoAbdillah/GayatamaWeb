'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/services';
import { Users, Eye, Star, Calendar, Search, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface KelompokBast {
  id: number;
  proposal_id: number;
  nama_kelompok: string;
  kode_kelompok: string;
  ketua_nama: string;
  total_anggota: number;
  desa_nama: string;
  periode: string;
}

export default function PerangkatDesaBastListPage() {
  const { user } = useAuth();
  const [kelompokList, setKelompokList] = useState<KelompokBast[]>([]);
  const [loading, setLoading] = useState(true);
  const [penilaianMap, setPenilaianMap] = useState<Record<number, { nilaiAkhir: number }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'belum' | 'sudah'>('semua');

  const filterOptions: { value: typeof filterStatus; label: string }[] = [
    { value: 'semua', label: 'Semua' },
    { value: 'belum', label: 'Belum Dinilai' },
    { value: 'sudah', label: 'Sudah Dinilai' },
  ];

  const desaName = (user as any)?.profil_desa?.nama_desa || user?.name || 'Desa Mitra';

  const loadData = async () => {
    try {
      setLoading(true);
      const proposals = await api.proposal.getByDesa();
      if (Array.isArray(proposals)) {
        const normalized: KelompokBast[] = proposals
          .filter((p: any) => p.status === 'diterima' || p.status === 'approved')
          .map((p: any) => {
            const anggotaRaw = Array.isArray(p.kelompok?.anggota) ? p.kelompok.anggota : [];
            const anggotaCount = anggotaRaw.length > 0 ? anggotaRaw.length : 1;
            const start = p.pos_kebutuhan?.created_at ? new Date(p.pos_kebutuhan.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '2026';

            return {
              id: p.id,
              proposal_id: p.id,
              nama_kelompok: p.kelompok?.nama_kelompok || `Kelompok #${p.kelompok_id || p.id}`,
              kode_kelompok: p.kelompok?.kode_kelompok || `KKN-2026-${String(p.id).padStart(3, '0')}`,
              ketua_nama: p.kelompok?.ketua?.name || 'Ketua Mahasiswa',
              total_anggota: anggotaCount,
              desa_nama: p.pos_kebutuhan?.desa?.nama_desa || desaName,
              periode: `Periode Aktif ${start}`,
            };
          });
        setKelompokList(normalized);
      } else {
        setKelompokList([]);
      }
    } catch (err) {
      console.error('Gagal mengambil data kelompok BAST desa:', err);
      toast.error('Gagal memuat daftar kelompok dari server.');
      setKelompokList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    try {
      const raw = localStorage.getItem('bast-penilaian');
      if (raw) setPenilaianMap(JSON.parse(raw));
    } catch {}
  }, []);

  const filteredKelompok = useMemo(() => {
    return kelompokList.filter((k) => {
      const sudahDinilai = !!penilaianMap[k.id];
      if (filterStatus === 'belum' && sudahDinilai) return false;
      if (filterStatus === 'sudah' && !sudahDinilai) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = [k.nama_kelompok, k.kode_kelompok, k.ketua_nama, k.desa_nama].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [kelompokList, penilaianMap, searchQuery, filterStatus]);

  return (
    <DashboardLayout title="Penilaian Kelompok KKN">
      <div className="space-y-6 font-jakarta">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">Daftar Kelompok KKN di Desa</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kelompok yang sedang melaksanakan KKN di {desaName}. Berikan penilaian akhir untuk setiap kelompok.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kelompok, kode, atau ketua..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${filterStatus === opt.value ? 'bg-navy-950 dark:bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm">Memuat data kelompok untuk penilaian...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredKelompok.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-10 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada kelompok KKN yang terdaftar atau sesuai pencarian.</p>
                </Card>
              </div>
            ) : (
              filteredKelompok.map((k) => {
                const penilaian = penilaianMap[k.id];
                const sudahDinilai = !!penilaian;
                return (
                  <Card key={k.id} className="p-5 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-sm flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 px-2.5 py-1 rounded-full w-fit">
                          {k.kode_kelompok}
                        </p>
                        <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue mt-2 leading-snug">{k.nama_kelompok}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          Ketua: <strong className="text-navy-900 dark:text-slate-200">{k.ketua_nama}</strong>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {k.periode}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${sudahDinilai ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'}`}
                      >
                        {sudahDinilai ? `Dinilai ${penilaian.nilaiAkhir}` : 'Belum Dinilai'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-navy-800">
                      <Link href={`/perangkat-desa/progress/${k.proposal_id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                          <Eye className="w-3.5 h-3.5" />
                          Detail
                        </Button>
                      </Link>
                      <Link href={`/perangkat-desa/bast/${k.id}/nilai`} className="flex-1">
                        <Button variant={sudahDinilai ? 'outline' : 'emerald'} size="sm" className="w-full gap-1.5 text-xs font-bold">
                          <Star className="w-3.5 h-3.5" />
                          {sudahDinilai ? 'Lihat Nilai' : 'Beri Nilai'}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
