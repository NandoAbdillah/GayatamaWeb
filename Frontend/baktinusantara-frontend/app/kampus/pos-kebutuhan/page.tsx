'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  Building,
  MapPin,
  Users,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  Heart,
  Leaf,
  Wrench,
  GraduationCap,
  X,
  ExternalLink,
  ChevronRight,
  Landmark,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/services';

interface PosKebutuhanItem {
  id: number;
  judul: string;
  desa_id: number;
  deskripsi: string;
  kategori: string;
  sdg_codes?: number[];
  kuota_kelompok: number;
  deadline?: string;
  jurusan_dibutuhkan?: Record<string, number>;
  status: 'open' | 'in_progress' | 'completed';
  desa?: {
    id: number;
    nama_desa: string;
    kecamatan?: string;
    kabupaten?: string;
    provinsi?: string;
    kontak_resmi?: string;
    latitude?: number;
    longitude?: number;
  };
}

const FALLBACK_POS_DATA: PosKebutuhanItem[] = [
  {
    id: 1,
    judul: 'Digitalisasi Branding dan E-Commerce UMKM Kripik Singkong',
    desa_id: 1,
    deskripsi: 'Pengembangan identitas visual merek kemasan modern, pendaftaran marketplace (Shopee/Tokopedia), dan pelatihan pembukuan keuangan digital untuk 15 pelaku UMKM.',
    kategori: 'umkm',
    sdg_codes: [8, 9],
    kuota_kelompok: 1,
    deadline: '2026-10-30',
    jurusan_dibutuhkan: {
      'Teknik Informatika': 1,
      'Desain Komunikasi Visual': 1,
      'Manajemen': 1,
    },
    status: 'in_progress',
    desa: {
      id: 1,
      nama_desa: 'Desa Sukamaju',
      kecamatan: 'Mojowarno',
      kabupaten: 'Kabupaten Jombang',
      provinsi: 'Jawa Timur',
      kontak_resmi: '081234567201',
    },
  },
  {
    id: 2,
    judul: 'Pemetaan Sistem Pengolahan Sampah Organik dan Biogas',
    desa_id: 2,
    deskripsi: 'Perancangan instalasi prototipe biogas dari limbah kotoran ternak dan penyuluhan manajemen sampah ramah lingkungan.',
    kategori: 'lingkungan',
    sdg_codes: [13, 15],
    kuota_kelompok: 1,
    deadline: '2026-11-15',
    jurusan_dibutuhkan: {
      'Teknik Lingkungan': 1,
      'Sistem Informasi': 1,
    },
    status: 'in_progress',
    desa: {
      id: 2,
      nama_desa: 'Desa Berkah Makmur',
      kecamatan: 'Prigen',
      kabupaten: 'Kabupaten Pasuruan',
      provinsi: 'Jawa Timur',
      kontak_resmi: '081234567202',
    },
  },
  {
    id: 3,
    judul: 'Pemberdayaan Posyandu Digital & Pencegahan Stunting Anak',
    desa_id: 1,
    deskripsi: 'Digitalisasi pencatatan data tumbuh kembang balita di 5 posyandu desa serta edukasi gizi seimbang bagi ibu hamil.',
    kategori: 'kesehatan',
    sdg_codes: [3],
    kuota_kelompok: 2,
    deadline: '2026-10-15',
    jurusan_dibutuhkan: {
      'Kesehatan Masyarakat': 2,
      'Gizi': 1,
      'Teknik Informatika': 1,
    },
    status: 'open',
    desa: {
      id: 1,
      nama_desa: 'Desa Sukamaju',
      kecamatan: 'Mojowarno',
      kabupaten: 'Kabupaten Jombang',
      provinsi: 'Jawa Timur',
      kontak_resmi: '081234567201',
    },
  },
  {
    id: 4,
    judul: 'Bimbingan Belajar Bahasa Inggris dan Literasi Digital SD',
    desa_id: 3,
    deskripsi: 'Penguatan kemampuan dasar bahasa Inggris interaktif dan pengenalan literasi komputer bagi siswa SDN Pacet 01.',
    kategori: 'pendidikan',
    sdg_codes: [4],
    kuota_kelompok: 1,
    deadline: '2026-10-05',
    jurusan_dibutuhkan: {
      'Pendidikan Bahasa Inggris': 1,
      'Pendidikan Guru Sekolah Dasar': 1,
    },
    status: 'open',
    desa: {
      id: 3,
      nama_desa: 'Desa Cempaka Putih',
      kecamatan: 'Pacet',
      kabupaten: 'Kabupaten Mojokerto',
      provinsi: 'Jawa Timur',
      kontak_resmi: '081234567203',
    },
  },
  {
    id: 5,
    judul: 'Perencanaan Masterplan Ruang Terbuka Hijau & Sarana Olahraga Desa',
    desa_id: 2,
    deskripsi: 'Penyusunan dokumen desain teknis dan anggaran rencana pembangunan taman desa terpadu ramah lansia dan anak.',
    kategori: 'fasilitas',
    sdg_codes: [9, 11],
    kuota_kelompok: 1,
    deadline: '2026-08-30',
    jurusan_dibutuhkan: {
      'Teknik Sipil': 1,
      'Arsitektur': 1,
    },
    status: 'completed',
    desa: {
      id: 2,
      nama_desa: 'Desa Berkah Makmur',
      kecamatan: 'Prigen',
      kabupaten: 'Kabupaten Pasuruan',
      provinsi: 'Jawa Timur',
      kontak_resmi: '081234567202',
    },
  },
];

export default function AdminPosKebutuhanPage() {
  const [posList, setPosList] = useState<PosKebutuhanItem[]>(FALLBACK_POS_DATA);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKategori, setActiveKategori] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [selectedPos, setSelectedPos] = useState<PosKebutuhanItem | null>(null);

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
        return Sparkles;
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
    <DashboardLayout
      title="Pengawasan Pos Kebutuhan & Program KKN Desa"
      breadcrumb={[
        { label: 'Pos Kebutuhan Desa' },
      ]}
    >
      <div className="space-y-6 font-jakarta">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <ClipboardList className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                Katalog & Pemantauan Pos Kebutuhan Desa
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Super Admin mengawasi seluruh pos aspirasi dan kebutuhan riil desa mitra di seluruh Indonesia yang siap atau sedang dikerjakan mahasiswa KKN.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary dark:text-primary-300 text-xs font-bold">
              Total {posList.length} Pos Terdata
            </span>
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
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              {[
                { key: 'all', label: 'Semua' },
                { key: 'open', label: 'Open' },
                { key: 'in_progress', label: 'In Progress' },
                { key: 'completed', label: 'Completed' },
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

                    {/* SDGs Badges */}
                    {pos.sdg_codes && pos.sdg_codes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {pos.sdg_codes.map((sdg) => (
                          <span
                            key={sdg}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300"
                          >
                            SDG {sdg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Kuota: <strong className="text-navy-950 dark:text-white">{pos.kuota_kelompok} Kelompok</strong>
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedPos(pos)}
                      className="text-xs font-semibold gap-1"
                    >
                      <span>Rincian</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Modal Detail Pos Kebutuhan */}
        {selectedPos && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
            <Card className="w-full max-w-xl p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                      Rincian Pos Kebutuhan Desa
                    </h3>
                    <p className="text-xs text-slate-500">
                      ID Pos: #{selectedPos.id} • Kategori: <span className="capitalize font-semibold">{selectedPos.kategori}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPos(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-jakarta">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Judul Pos Kebutuhan</span>
                    <StatusBadge status={selectedPos.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
                    {selectedPos.judul}
                  </h4>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-2">
                  <p className="font-bold text-slate-700 dark:text-slate-300">Deskripsi Lengkap Program:</p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedPos.deskripsi}
                  </p>
                </div>

                {/* Profil Desa Mitra */}
                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <Building className="w-4 h-4" />
                    <span>{selectedPos.desa?.nama_desa}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
                    <div>Kecamatan: {selectedPos.desa?.kecamatan}</div>
                    <div>Kabupaten: {selectedPos.desa?.kabupaten}</div>
                    <div>Provinsi: {selectedPos.desa?.provinsi}</div>
                    <div>Kontak Resmi: <span className="font-mono">{selectedPos.desa?.kontak_resmi || '-'}</span></div>
                  </div>
                </div>

                {/* Jurusan Dibutuhkan */}
                {selectedPos.jurusan_dibutuhkan && (
                  <div className="space-y-1.5">
                    <p className="font-bold text-navy-950 dark:text-white uppercase tracking-wider text-[11px]">
                      Kualifikasi / Jurusan Mahasiswa yang Dibutuhkan
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(selectedPos.jurusan_dibutuhkan).map(([jurusan, kuota]) => (
                        <div key={jurusan} className="p-2 rounded-lg bg-slate-100 dark:bg-navy-800 flex items-center justify-between">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{jurusan}</span>
                          <span className="font-mono font-bold text-primary">{kuota} Mahasiswa</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPos(null)}
                  className="text-xs"
                >
                  Tutup
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
