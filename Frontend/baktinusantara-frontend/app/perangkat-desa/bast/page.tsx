'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MOCK_KELOMPOK_14 } from '@/lib/mock-data';
import { Users, Eye, Star, Calendar, MapPin, Search } from 'lucide-react';

interface KelompokBast {
  id: number;
  nama_kelompok: string;
  kode_kelompok: string;
  ketua_nama: string;
  total_anggota: number;
  desa_nama: string;
  periode: string;
}

const KELOMPOK_BAST: KelompokBast[] = [
  MOCK_KELOMPOK_14 as unknown as KelompokBast,
  {
    id: 15,
    nama_kelompok: 'Kelompok 15 - Sukamaju Sejahtera',
    kode_kelompok: 'KKN-2026-SKM-015',
    ketua_nama: 'Salsabila Putri',
    total_anggota: 4,
    desa_nama: 'Desa Sukamaju, Bogor',
    periode: '04 Agu - 06 Sep 2026',
  },
  {
    id: 11,
    nama_kelompok: 'Kelompok 11 - Sukamaju Kreatif',
    kode_kelompok: 'KKN-2026-SKM-011',
    ketua_nama: 'Dimas Arya Pamungkas',
    total_anggota: 6,
    desa_nama: 'Desa Sukamaju, Bogor',
    periode: '04 Agu - 06 Sep 2026',
  },
];

const normalizedKelompok: KelompokBast[] = KELOMPOK_BAST.map((k) => ({
  ...k,
  kode_kelompok: (k as any).kode_kelompok || 'KKN-2026-SKM-014',
  periode: (k as any).periode || '04 Agu - 06 Sep 2026',
  desa_nama: (k as any).desa_nama || 'Desa Sukamaju, Bogor',
}));

export default function PerangkatDesaBastListPage() {
  const [penilaianMap, setPenilaianMap] = useState<Record<number, { nilaiAkhir: number }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'belum' | 'sudah'>('semua');

  const filterOptions: { value: typeof filterStatus; label: string }[] = [
    { value: 'semua', label: 'Semua' },
    { value: 'belum', label: 'Belum Dinilai' },
    { value: 'sudah', label: 'Sudah Dinilai' },
  ];

  useEffect(() => {
    try {
      const raw = localStorage.getItem('bast-penilaian');
      if (raw) setPenilaianMap(JSON.parse(raw));
    } catch {}
  }, []);

  const filteredKelompok = useMemo(() => {
    return normalizedKelompok.filter((k) => {
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
  }, [penilaianMap, searchQuery, filterStatus]);

  return (
    <DashboardLayout title="Penilaian Kelompok KKN">
      <div className="space-y-6 font-jakarta">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">Daftar Kelompok KKN di Desa</h1>
          <p className="text-xs text-slate-500 mt-1">Kelompok yang sedang melaksanakan KKN di Desa Sukamaju. Berikan penilaian akhir untuk setiap kelompok.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kelompok, kode, atau ketua..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${filterStatus === opt.value ? 'bg-navy-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKelompok.length === 0 ? (
            <div className="col-span-full">
              <Card className="p-10 text-center bg-white border-slate-200">
                <p className="text-sm text-slate-500">Tidak ada kelompok yang sesuai pencarian / filter.</p>
              </Card>
            </div>
          ) : (
            filteredKelompok.map((k) => {
              const penilaian = penilaianMap[k.id];
              const sudahDinilai = !!penilaian;
              return (
                <Card key={k.id} className="p-5 bg-white border-slate-200 shadow-sm flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full w-fit">
                        {k.kode_kelompok}
                      </p>
                      <h3 className="text-sm font-bold text-navy-950 font-epilogue mt-2 leading-snug">{k.nama_kelompok}</h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Ketua: <strong className="text-navy-900">{k.ketua_nama}</strong>
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {k.periode}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${sudahDinilai ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                    >
                      {sudahDinilai ? `Dinilai ${penilaian.nilaiAkhir}` : 'Belum Dinilai'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                    <Link href={`/perangkat-desa/progress/${k.id}`} className="flex-1">
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
      </div>
    </DashboardLayout>
  );
}
