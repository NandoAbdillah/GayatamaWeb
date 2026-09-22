'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Home, Search, MapPin } from 'lucide-react';
import api from '@/lib/services';
import { VerifikasiItem, INITIAL_VERIFIKASI_DATA } from '@/lib/data/verifikasi-data';

export default function AdminDirektoriDesaPage() {
  const router = useRouter();
  const [desaList, setDesaList] = useState<VerifikasiItem[]>(
    INITIAL_VERIFIKASI_DATA.filter((v) => v.entity_type === 'desa' && v.status === 'verified')
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.admin.getVerifikasiList();
        if (res && Array.isArray(res.data)) {
          const filtered: VerifikasiItem[] = (res.data as VerifikasiItem[]).filter(
            (v) => v.entity_type === 'desa' && v.status === 'verified'
          );
          setDesaList(filtered);
        }
      } catch (err) {
        console.warn('Fallback to seeded desa data:', err);
        setDesaList(INITIAL_VERIFIKASI_DATA.filter((v) => v.entity_type === 'desa' && v.status === 'verified'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredDesa = desaList.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.nama.toLowerCase().includes(q) ||
      (d.sub_info || '').toLowerCase().includes(q) ||
      (d.email || '').toLowerCase().includes(q) ||
      (d.kontak || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout title="Direktori Desa">
      <div className="space-y-6 font-jakarta">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Direktori Desa Mitra Terverifikasi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Super Admin memantau seluruh desa mitra terverifikasi di platform BaktiNusantara.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama desa, wilayah, atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-950 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </Card>

        {/* Grid Desa */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card
                key={i}
                className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 h-[180px] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDesa.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-10 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
                  <p className="text-xs text-slate-400">Tidak ada desa yang cocok dengan pencarian.</p>
                </Card>
              </div>
            ) : (
              filteredDesa.map((d) => (
                <Card
                  key={`${d.entity_type}-${d.id}`}
                  className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold text-sm font-epilogue shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                      <Home className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue leading-tight truncate">
                        {d.nama}
                      </h3>
                      <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                        ID Desa: {d.id}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{d.sub_info || 'Wilayah Belum Diatur'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Pemohon:</span> {d.pemohon}
                    </p>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
                      {d.email}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/direktori-desa/${d.id}`)}
                      className="text-xs font-semibold"
                    >
                      Detail Desa
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
