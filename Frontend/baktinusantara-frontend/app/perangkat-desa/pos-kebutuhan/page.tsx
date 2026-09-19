'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/services';
import { MOCK_POS_KEBUTUHAN } from '@/lib/mock-data';
import { PosKebutuhan } from '@/lib/types';
import { PlusCircle, CheckCircle2, Search } from 'lucide-react';

export default function PerangkatDesaPosKebutuhanPage() {
  const [posList, setPosList] = useState<PosKebutuhan[]>(MOCK_POS_KEBUTUHAN);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'terbuka' | 'berjalan' | 'selesai'>('semua');

  const filterOptions: { value: typeof filterStatus; label: string }[] = [
    { value: 'semua', label: 'Semua' },
    { value: 'terbuka', label: 'Terbuka' },
    { value: 'berjalan', label: 'Sedang Berjalan' },
    { value: 'selesai', label: 'Selesai' },
  ];

  const getFilterStatus = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'open') return 'terbuka';
    if (s === 'in_progress') return 'berjalan';
    if (s === 'completed') return 'selesai';
    return 'terbuka';
  };

  const filteredPos = useMemo(() => {
    return posList.filter((pos) => {
      if (filterStatus !== 'semua' && getFilterStatus(pos.status) !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = [pos.judul, pos.deskripsi, pos.kategori_sektor, pos.nama_desa].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [posList, searchQuery, filterStatus]);

  const fetchDesaPos = () => {
    api.posKebutuhan
      .getByDesa()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setPosList(res);
        }
      })
      .catch((err) => {
        console.warn('Could not load desa pos kebutuhan, using fallback:', err);
      });
  };

  useEffect(() => {
    fetchDesaPos();
  }, []);

  return (
    <DashboardLayout title="Manajemen Pos Kebutuhan KKN Desa">
      <div className="space-y-6 font-jakarta">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">Pos Kebutuhan KKN Desa Sukamaju</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Publikasikan kebutuhan riil masyarakat desa agar mahasiswa perguruan tinggi dapat mengajukan proposal pengabdian.
            </p>
          </div>

          <Link href="/perangkat-desa/pos-kebutuhan/buat">
            <Button variant="emerald" size="md" className="shadow-glow-secondary gap-2">
              <PlusCircle className="w-4 h-4" />
              <span>Terbitkan Pos Baru</span>
            </Button>
          </Link>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, deskripsi, atau kategori..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl text-sm text-navy-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === opt.value
                    ? 'bg-navy-950 dark:bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pos List - 3 grid, pakai filteredPos */}
        {filteredPos.length === 0 ? (
          <Card className="p-10 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada pos kebutuhan yang sesuai pencarian / filter.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPos.map((pos) => (
              <Card key={pos.id} className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 flex flex-col justify-between space-y-4 shadow-ambient">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={pos.status} size="sm" />
                    <span className="text-xs font-semibold text-primary dark:text-primary-400">{pos.kategori_sektor}</span>
                  </div>

                  <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue leading-snug">{pos.judul}</h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-jakarta line-clamp-3 leading-relaxed">{pos.deskripsi}</p>

                  <div className="pt-2 border-t border-slate-100 dark:border-navy-800 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Target Luaran:</span>
                    <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {pos.target_luaran.slice(0, 2).map((luar, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="truncate">{luar}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
