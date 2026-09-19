'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  Search,
  MapPin,
} from 'lucide-react';
import api from '@/lib/services';
import { FALLBACK_UNIV_DETAIL, UnivDetail, getLogoUrl } from '@/lib/data/direktori-kampus-data';

export default function AdminDirektoriKampusPage() {
  const router = useRouter();
  const [univList, setUnivList] = useState<UnivDetail[]>(FALLBACK_UNIV_DETAIL);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const univs = await api.universitas.getUniversitasList();
        if (Array.isArray(univs) && univs.length > 0) {
          // merge API data with fallback detail for richer fields
          const merged: UnivDetail[] = (univs as any[]).map((u: any) => {
            const fallback = FALLBACK_UNIV_DETAIL.find((f) => f.kode_univ === u.kode_univ || f.id === u.id);
            const website = fallback?.website || u.website || `https://www.${u.kode_univ.toLowerCase()}.ac.id`;
            const domain = fallback?.domain || (u.domain as string) || (() => { try { return new URL(website).hostname.replace(/^www\./, ''); } catch { return `${u.kode_univ.toLowerCase()}.ac.id`; } })();
            return {
              id: u.id,
              nama_universitas: u.nama_universitas,
              kode_univ: u.kode_univ,
              kota: u.kota || fallback?.kota || 'Jawa Timur, Indonesia',
              status: (u.status as any) || fallback?.status || 'verified',
              tanggal_verifikasi: fallback?.tanggal_verifikasi || '-',
              email: fallback?.email || `${u.kode_univ.toLowerCase()}@kampus.ac.id`,
              telepon: fallback?.telepon || '-',
              alamat_lengkap: fallback?.alamat_lengkap || u.kota || '-',
              website,
              domain,
              statistik: fallback?.statistik || {
                jumlah_program_kkn: 5,
                jumlah_mahasiswa: 120,
                jumlah_dosen_dpl: 4,
                jumlah_desa_ditangani: 8,
              },
            };
          });
          setUnivList(merged);
        }
      } catch (err) {
        console.warn('Fallback to seeded campus data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredUniv = univList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.nama_universitas.toLowerCase().includes(q) ||
      u.kode_univ.toLowerCase().includes(q) ||
      (u.kota || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout title="Direktori Perguruan Tinggi">
      <div className="space-y-6 font-jakarta">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Direktori Perguruan Tinggi Terverifikasi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Super Admin memantau seluruh lembaga perguruan tinggi mitra terakreditasi di platform BaktiNusantara.
            </p>
          </div>
        </div>

        {/* Search Bar - hapus tab Dosen Pembimbing DPL */}
        <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama kampus atau kode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-950 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </Card>

        {/* Grid Perguruan Tinggi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUniv.length === 0 ? (
            <div className="col-span-full">
              <Card className="p-10 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
                <p className="text-xs text-slate-400">Tidak ada perguruan tinggi yang cocok dengan pencarian.</p>
              </Card>
            </div>
          ) : (
            filteredUniv.map((u) => (
              <Card
                key={u.id}
                className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
              >
                <div className="flex gap-3">
                  <img
                    src={getLogoUrl(u.domain)}
                    alt={`Logo ${u.kode_univ}`}
                    className="w-12 h-12 rounded-2xl object-contain bg-white dark:bg-white border border-slate-100 dark:border-navy-700 p-1.5 shadow-sm shrink-0"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div
                    className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 hidden items-center justify-center font-bold text-sm font-epilogue shrink-0"
                    style={{ display: 'none' }}
                  >
                    {u.kode_univ.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue leading-tight">
                      {u.nama_universitas}
                    </h3>
                    <p className="text-xs font-mono text-primary dark:text-primary-300 font-semibold">Kode Kampus: {u.kode_univ}</p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.kota || 'Jawa Timur, Indonesia'}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/direktori-kampus/${u.id}`)}
                    className="text-xs font-semibold"
                  >
                    Detail Kampus
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
