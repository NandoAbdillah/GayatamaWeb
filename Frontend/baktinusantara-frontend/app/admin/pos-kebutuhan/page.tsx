'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ClipboardList,
  Search,
  Building,
  MapPin,
  BookOpen,
  Heart,
  Leaf,
  Wrench,
  Store,
  ChevronRight,
} from 'lucide-react';
import api from '@/lib/services';
import { FALLBACK_POS_DATA, PosKebutuhanItem } from '@/lib/data/pos-kebutuhan-data';



export default function AdminPosKebutuhanPage() {
  const router = useRouter();
  const [posList, setPosList] = useState<PosKebutuhanItem[]>(FALLBACK_POS_DATA);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKategori, setActiveKategori] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');

  useEffect(() => {
    async function loadPosKebutuhan() {
      try {
        const res: any = await api.posKebutuhan.getAll({});
        if (Array.isArray(res) && res.length > 0) {
          setPosList(res as PosKebutuhanItem[]);
        }
      } catch (err) {
        console.warn('Fallback to seeded pos data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosKebutuhan();
  }, []);

  const getKategoriIcon = (kategori: string) => {
    switch (kategori.toLowerCase()) {
      case 'umkm':
        return Store;
      case 'lingkungan':
        return Leaf;
      case 'kesehatan':
        return Heart;
      case 'pendidikan':
        return BookOpen;
      case 'fasilitas':
        return Wrench;
      default:
        return ClipboardList;
    }
  };

  const filteredList = posList.filter((item) => {
    const matchKategori = activeKategori === 'all' || item.kategori.toLowerCase() === activeKategori.toLowerCase();
    const matchStatus = activeStatus === 'all' || item.status === activeStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      item.judul.toLowerCase().includes(q) ||
      item.deskripsi.toLowerCase().includes(q) ||
      (item.desa?.nama_desa || '').toLowerCase().includes(q) ||
      (item.desa?.kabupaten || '').toLowerCase().includes(q);
    return matchKategori && matchStatus && matchSearch;
  });

  return (
    <DashboardLayout title="Pengawasan Pos Kebutuhan & Program KKN Desa">
      <div className="space-y-6 font-jakarta">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Pengajuan Kebutuhan Desa/KKN
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Super Admin mengawasi seluruh pos aspirasi dan kebutuhan riil desa mitra di seluruh Indonesia yang siap atau sedang dikerjakan mahasiswa KKN.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Kategori Filters */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {[
                { key: 'all', label: 'Semua Kategori' },
                { key: 'umkm', label: 'UMKM' },
                { key: 'lingkungan', label: 'Lingkungan' },
                { key: 'kesehatan', label: 'Kesehatan' },
                { key: 'pendidikan', label: 'Pendidikan' },
                { key: 'fasilitas', label: 'Fasilitas' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveKategori(cat.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                    activeKategori === cat.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 self-end md:self-auto">
              {[
                { key: 'all', label: 'Semua' },
                { key: 'open', label: 'Terbuka' },
                { key: 'in_progress', label: 'Sedang Berjalan' },
                { key: 'completed', label: 'Selesai' },
              ].map((st) => (
                <button
                  key={st.key}
                  onClick={() => setActiveStatus(st.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeStatus === st.key
                      ? 'bg-navy-900 dark:bg-white text-white dark:text-navy-950 font-bold'
                      : 'text-slate-500 hover:text-navy-950 dark:hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul pos kebutuhan, desa mitra, kabupaten, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </Card>

        {/* Pos Kebutuhan Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.length === 0 ? (
            <div className="col-span-full">
              <Card className="p-12 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-2">
                <p className="text-sm font-bold text-navy-950 dark:text-white">Tidak ada pos kebutuhan yang sesuai filter</p>
                <p className="text-xs text-slate-400">Silakan ubah kata kunci atau kategori pencarian.</p>
              </Card>
            </div>
          ) : (
            filteredList.map((pos) => {
              const Icon = getKategoriIcon(pos.kategori);

              return (
                <Card
                  key={pos.id}
                  className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{pos.kategori}</span>
                      </span>

                      <StatusBadge status={pos.status} size="sm" />
                    </div>

                    {/* Judul & Deskripsi */}
                    <div>
                      <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue line-clamp-2 group-hover:text-primary transition-colors">
                        {pos.judul}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {pos.deskripsi}
                      </p>
                    </div>

                    {/* Desa Info */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800/80 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 font-bold text-navy-950 dark:text-white">
                        <Building className="w-3.5 h-3.5 text-primary" />
                        <span>{pos.desa?.nama_desa || 'Desa Mitra'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{pos.desa?.kecamatan}, {pos.desa?.kabupaten}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer - hanya Detail */}
                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/pos-kebutuhan/${pos.id}`)}
                      className="text-xs font-semibold gap-1"
                    >
                      <span>Detail</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
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
