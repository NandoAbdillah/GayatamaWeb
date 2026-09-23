'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MapFilterSelect, MapFilterOption } from '@/components/ui/MapFilterSelect';
import { RegionLogo } from '@/components/ui/RegionLogo';
import { PosKebutuhan } from '@/lib/types';
import { Province } from '@/lib/wilayah-types';
import { WilayahService } from '@/lib/wilayah-api';
import api from '@/lib/services';
import {
  Search,
  MapPin,
  Clock,
  Users,
  Target,
  ArrowRight,
  Filter,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Building,
  GraduationCap,
  Layers,
  Compass,
  HeartPulse,
  Laptop,
  Sprout,
  Globe2,
  SlidersHorizontal,
  X,
  ExternalLink,
  ShieldCheck,
  Activity,
  Award,
  Navigation,
  Check,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

// Curated high-definition cover photos for Pos KKN based on sector
const SECTOR_IMAGE_MAP: Record<string, string[]> = {
  'Agrikultur & Ketahanan Pangan': [
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
  ],
  'Digitalisasi & Teknologi Desa': [
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
  ],
  'Kesehatan & Sanitasi': [
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80',
  ],
  'Pendidikan & Literasi': [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
  ],
  'Pemberdayaan UMKM': [
    'https://images.unsplash.com/photo-1611638281871-1063d3e76e1f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80',
  ],
  'Lingkungan & Energi': [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
  ],
};

function getPosCoverImage(pos: PosKebutuhan, index: number): string {
  const images = SECTOR_IMAGE_MAP[pos.kategori_sektor] || SECTOR_IMAGE_MAP['Digitalisasi & Teknologi Desa'];
  return images[index % images.length] || images[0];
}

const SECTOR_CONFIG: Record<string, { label: string; icon: any; colorText: string; colorBg: string; colorBorder: string }> = {
  'Agrikultur & Ketahanan Pangan': {
    label: 'Agrikultur & Pangan',
    icon: Sprout,
    colorText: 'text-emerald-700 dark:text-emerald-300',
    colorBg: 'bg-emerald-50 dark:bg-emerald-950/70',
    colorBorder: 'border-emerald-200 dark:border-emerald-800',
  },
  'Digitalisasi & Teknologi Desa': {
    label: 'Digitalisasi Desa',
    icon: Laptop,
    colorText: 'text-indigo-700 dark:text-indigo-300',
    colorBg: 'bg-indigo-50 dark:bg-indigo-950/70',
    colorBorder: 'border-indigo-200 dark:border-indigo-800',
  },
  'Kesehatan & Sanitasi': {
    label: 'Kesehatan & Sanitasi',
    icon: HeartPulse,
    colorText: 'text-rose-700 dark:text-rose-300',
    colorBg: 'bg-rose-50 dark:bg-rose-950/70',
    colorBorder: 'border-rose-200 dark:border-rose-800',
  },
  'Pendidikan & Literasi': {
    label: 'Pendidikan & Literasi',
    icon: BookOpen,
    colorText: 'text-amber-700 dark:text-amber-300',
    colorBg: 'bg-amber-50 dark:bg-amber-950/70',
    colorBorder: 'border-amber-200 dark:border-amber-800',
  },
  'Pemberdayaan UMKM': {
    label: 'Pemberdayaan UMKM',
    icon: Building,
    colorText: 'text-teal-700 dark:text-teal-300',
    colorBg: 'bg-teal-50 dark:bg-teal-950/70',
    colorBorder: 'border-teal-200 dark:border-teal-800',
  },
  'Lingkungan & Energi': {
    label: 'Lingkungan & Energi',
    icon: Globe2,
    colorText: 'text-sky-700 dark:text-sky-300',
    colorBg: 'bg-sky-50 dark:bg-sky-950/70',
    colorBorder: 'border-sky-200 dark:border-sky-800',
  },
};

const SECTOR_OPTIONS = [
  { value: 'all', label: 'Semua Sektor SDG' },
  { value: 'Agrikultur & Ketahanan Pangan', label: 'Agrikultur & Pangan', icon: <Sprout className="w-3.5 h-3.5 text-emerald-500" /> },
  { value: 'Digitalisasi & Teknologi Desa', label: 'Digitalisasi Desa', icon: <Laptop className="w-3.5 h-3.5 text-indigo-500" /> },
  { value: 'Kesehatan & Sanitasi', label: 'Kesehatan & Sanitasi', icon: <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> },
  { value: 'Pendidikan & Literasi', label: 'Pendidikan & Literasi', icon: <BookOpen className="w-3.5 h-3.5 text-amber-500" /> },
  { value: 'Pemberdayaan UMKM', label: 'Pemberdayaan UMKM', icon: <Building className="w-3.5 h-3.5 text-teal-500" /> },
  { value: 'Lingkungan & Energi', label: 'Lingkungan & Energi', icon: <Globe2 className="w-3.5 h-3.5 text-sky-500" /> },
];

const MAJOR_OPTIONS = [
  { value: 'all', label: 'Semua Rumpun Jurusan' },
  { value: 'Informatika', label: 'Teknik Informatika / SI' },
  { value: 'Pertanian', label: 'Pertanian / Agribisnis' },
  { value: 'Gizi', label: 'Gizi / Kesehatan Masyarakat' },
  { value: 'Manajemen', label: 'Manajemen / Ekonomi' },
  { value: 'Sipil', label: 'Teknik Sipil / Arsitektur' },
  { value: 'Komunikasi', label: 'Ilmu Komunikasi / DKV' },
  { value: 'Pendidikan', label: 'Pendidikan / Keguruan' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status Kuota' },
  { value: 'available', label: 'Tersedia (Ada Kuota Sisa)' },
  { value: 'full', label: 'Kuota Terisi Penuh' },
];

export default function KatalogPublikPage() {
  const tkatalog = useTranslations('katalog');
  const [posList, setPosList] = useState<PosKebutuhan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSektor, setSelectedSektor] = useState<string>('all');
  const [selectedJurusan, setSelectedJurusan] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [provinces, setProvinces] = useState<Province[]>([]);

  // Load Provinces from WilayahService
  useEffect(() => {
    async function loadProvinces() {
      try {
        const provs = await WilayahService.getProvinces();
        setProvinces(provs);
      } catch (e) {
        console.warn('Failed to load provinces for filter:', e);
      }
    }
    loadProvinces();
  }, []);

  // Load Pos KKN Data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.posKebutuhan.getAll();
        if (Array.isArray(data)) {
          const normalized: PosKebutuhan[] = data.map((item: any) => ({
            id: item.id,
            desa_id: item.desa_id || 1,
            judul: item.judul || item.title || 'Pos Kebutuhan KKN',
            deskripsi: item.deskripsi || item.description || '',
            nama_desa: item.desa?.nama_desa || item.nama_desa || 'Desa Mitra',
            kecamatan: item.desa?.kecamatan || item.kecamatan || 'Kecamatan',
            kabupaten: item.desa?.kabupaten || item.kabupaten || 'Kabupaten',
            provinsi: item.desa?.provinsi || item.provinsi || 'Jawa Barat',
            latitude: item.latitude || -6.595,
            longitude: item.longitude || 106.8166,
            kategori_sektor: item.kategori || item.kategori_sektor || 'Digitalisasi & Teknologi Desa',
            kuota_mahasiswa: item.kuota_kelompok ? item.kuota_kelompok * 10 : (item.kuota_mahasiswa || 10),
            terisi_mahasiswa: item.terisi_mahasiswa || 0,
            status: item.status || 'open',
            matching_score: item.matching_score || 95,
            kriteria_jurusan: Array.isArray(item.kriteria_jurusan)
              ? item.kriteria_jurusan
              : item.jurusan_dibutuhkan
              ? Object.keys(item.jurusan_dibutuhkan)
              : ['Teknik Informatika', 'Manajemen', 'Sistem Informasi'],
            target_luaran: Array.isArray(item.target_luaran)
              ? item.target_luaran
              : ['Sistem Informasi Web Desa', 'Modul Pelatihan Aparatur', 'Laporan Akhir KKN'],
            distance_km: item.distance_km || Math.floor(Math.random() * 40) + 5,
            created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : 'Baru saja',
          }));
          setPosList(normalized);
        } else {
          setPosList([]);
        }
      } catch (err) {
        console.error('Gagal memuat katalog pos kebutuhan:', err);
        setPosList([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered List Computation
  const filteredList = useMemo(() => {
    return posList.filter((item) => {
      // Search matching
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.judul.toLowerCase().includes(q) ||
        (item.nama_desa && item.nama_desa.toLowerCase().includes(q)) ||
        (item.kecamatan && item.kecamatan.toLowerCase().includes(q)) ||
        (item.kabupaten && item.kabupaten.toLowerCase().includes(q)) ||
        (item.provinsi && item.provinsi.toLowerCase().includes(q)) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(q)) ||
        (Array.isArray(item.target_luaran) && item.target_luaran.some((t) => t.toLowerCase().includes(q))) ||
        (Array.isArray(item.kriteria_jurusan) && item.kriteria_jurusan.some((j) => j.toLowerCase().includes(q)));

      // Sector matching
      const matchSektor =
        selectedSektor === 'all' ||
        (item.kategori_sektor && item.kategori_sektor.toLowerCase().includes(selectedSektor.toLowerCase()));

      // Major matching
      const matchJurusan =
        selectedJurusan === 'all' ||
        (Array.isArray(item.kriteria_jurusan) &&
          item.kriteria_jurusan.some((j) => j.toLowerCase().includes(selectedJurusan.toLowerCase())));

      // Province matching
      const matchProv =
        selectedProvince === 'all' ||
        (item.provinsi && item.provinsi.toLowerCase().includes(selectedProvince.toLowerCase()));

      // Status quota matching
      const sisa = item.kuota_mahasiswa - item.terisi_mahasiswa;
      const matchStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'available' && sisa > 0) ||
        (selectedStatus === 'full' && sisa <= 0);

      return matchSearch && matchSektor && matchJurusan && matchProv && matchStatus;
    });
  }, [posList, searchQuery, selectedSektor, selectedJurusan, selectedProvince, selectedStatus]);

  // Province dropdown options with official crest logos
  const provinceOptions: MapFilterOption[] = useMemo(() => {
    const list: MapFilterOption[] = [{ value: 'all', label: 'Semua 38 Provinsi' }];
    provinces.forEach((p) => {
      list.push({
        value: p.name,
        label: p.name,
        icon: <RegionLogo code={p.id} name={p.name} size="xs" showBadge={false} customUrl={p.logo_url} />,
      });
    });
    return list;
  }, [provinces]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedSektor !== 'all' ||
    selectedJurusan !== 'all' ||
    selectedProvince !== 'all' ||
    selectedStatus !== 'all';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedSektor('all');
    setSelectedJurusan('all');
    setSelectedProvince('all');
    setSelectedStatus('all');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col font-jakarta transition-colors duration-200 selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10">
        {/* ========================================================================= */}
        {/* 1. HERO HEADER WITH STATS TICKER */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="uppercase tracking-wider font-extrabold">{tkatalog('badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 dark:text-white font-epilogue tracking-tight leading-[1.15]">
            {tkatalog('title')}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-jakarta leading-relaxed max-w-2xl mx-auto">
            {tkatalog('subtitle')}
          </p>

          {/* Quick Metrics Pills */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-navy-900/80 px-3 py-1 rounded-full border border-slate-200/80 dark:border-navy-800 shadow-xs">
              <Building className="w-3.5 h-3.5 text-emerald-600" />
              <span>128 Desa Mitra Terdaftar</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-navy-900/80 px-3 py-1 rounded-full border border-slate-200/80 dark:border-navy-800 shadow-xs">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>4.300+ Kampus Terhubung</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-navy-900/80 px-3 py-1 rounded-full border border-slate-200/80 dark:border-navy-800 shadow-xs">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>96% Rekomendasi Akurat</span>
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. UNIFIED SEARCH & FILTER ISLAND (MATCHING HERO & MAPS STYLE) */}
        {/* ========================================================================= */}
        <div className="w-full bg-white/95 dark:bg-navy-900/95 rounded-3xl p-3.5 sm:p-5 border border-slate-200/90 dark:border-navy-700/80 shadow-xl backdrop-blur-2xl space-y-4">
          {/* Row 1: Elongated Search Field + Filter Dropdowns */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Elongated Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={tkatalog('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-slate-50/90 dark:bg-navy-950 text-xs sm:text-sm font-semibold text-navy-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-4 h-4 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-500 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-xs"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters Group */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              {/* 1. Sektor SDG Dropdown */}
              <MapFilterSelect
                label="Sektor SDG"
                value={selectedSektor}
                onChange={(val) => setSelectedSektor(val)}
                options={SECTOR_OPTIONS}
                icon={<Layers className="w-3.5 h-3.5 text-emerald-500" />}
                dropdownWidth="min-w-[220px]"
                placeholderSearch="Cari sektor SDG..."
              />

              {/* 2. Rumpun Jurusan Dropdown */}
              <MapFilterSelect
                label="Rumpun Jurusan"
                value={selectedJurusan}
                onChange={(val) => setSelectedJurusan(val)}
                options={MAJOR_OPTIONS}
                icon={<GraduationCap className="w-3.5 h-3.5 text-indigo-500" />}
                dropdownWidth="min-w-[210px]"
                placeholderSearch="Cari jurusan..."
              />

              {/* 3. Wilayah / Provinsi Dropdown */}
              <MapFilterSelect
                label="Wilayah / Provinsi"
                value={selectedProvince}
                onChange={(val) => setSelectedProvince(val)}
                options={provinceOptions}
                icon={<Navigation className="w-3.5 h-3.5 text-sky-500" />}
                dropdownWidth="min-w-[230px]"
                placeholderSearch="Cari provinsi..."
              />

              {/* 4. Status Kuota Dropdown */}
              <MapFilterSelect
                label="Status Kuota"
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val)}
                options={STATUS_OPTIONS}
                icon={<Users className="w-3.5 h-3.5 text-amber-500" />}
                dropdownWidth="min-w-[190px]"
                searchable={false}
              />
            </div>
          </div>

          {/* Row 2: Quick Sector Pills (Single-Click Fast Filtering) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin border-t border-slate-100 dark:border-navy-800/80">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-emerald-500" /> Sektor:
            </span>

            <button
              type="button"
              onClick={() => setSelectedSektor('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 select-none ${
                selectedSektor === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100/90 dark:bg-navy-950/90 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800'
              }`}
            >
              Semua Sektor ({posList.length})
            </button>

            {Object.entries(SECTOR_CONFIG).map(([sectorKey, cfg]) => {
              const Icon = cfg.icon;
              const isSelected = selectedSektor === sectorKey;
              const count = posList.filter((p) => p.kategori_sektor === sectorKey).length;

              return (
                <button
                  key={sectorKey}
                  type="button"
                  onClick={() => setSelectedSektor(isSelected ? 'all' : sectorKey)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 select-none ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100/90 dark:bg-navy-950/90 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  <span>{cfg.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 3: Result Summary & Map Shortcut */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-navy-800/80 text-xs">
            <div className="flex items-center gap-2 flex-wrap text-slate-500 dark:text-slate-400">
              <span>
                {tkatalog('resultsPrefix')} <strong className="text-navy-950 dark:text-white font-extrabold">{filteredList.length}</strong> {tkatalog('resultsSuffix')}
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline ml-1"
                >
                  <X className="w-3 h-3" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            <Link
              href="/maps"
              className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors shrink-0"
            >
              <Compass className="w-4 h-4 text-emerald-600 animate-spin-slow" />
              <span>{tkatalog('openMap')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. POS KKN CARDS GRID (SHOWCASE & MAPS AESTHETIC) */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-[460px] rounded-3xl bg-slate-200/70 dark:bg-navy-900/70 animate-pulse border border-slate-200 dark:border-navy-800"
              />
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-4 max-w-xl mx-auto shadow-md">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-navy-800 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                Tidak ada pos kebutuhan yang sesuai
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Coba ubah kata kunci pencarian, sektor SDG, atau reset filter untuk melihat seluruh pos pengabdian desa.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetAllFilters}
              className="rounded-xl text-xs font-bold gap-1.5 mx-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Semua Filter</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredList.map((pos, idx) => {
              const coverImg = getPosCoverImage(pos, idx);
              const sectorCfg = SECTOR_CONFIG[pos.kategori_sektor] || SECTOR_CONFIG['Digitalisasi & Teknologi Desa'];
              const SectorIcon = sectorCfg.icon;
              const sisaKuota = Math.max(0, pos.kuota_mahasiswa - pos.terisi_mahasiswa);
              const quotaPercent = Math.min(100, Math.round((pos.terisi_mahasiswa / pos.kuota_mahasiswa) * 100));

              return (
                <div
                  key={pos.id}
                  className="group rounded-3xl overflow-hidden border border-slate-200/90 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative backdrop-blur-md"
                >
                  {/* Hero Cover Image Header with Badges */}
                  <div>
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
                      <img
                        src={coverImg}
                        alt={pos.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        loading="lazy"
                      />

                      {/* Top Overlay Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                        {/* Sector Badge */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-navy-900/95 backdrop-blur-md text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70 shadow-xs text-[10px] font-extrabold uppercase tracking-wide">
                          <SectorIcon className="w-3 h-3 text-emerald-600" />
                          <span>{sectorCfg.label}</span>
                        </div>

                        {/* Match Score Badge or Quota status */}
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-navy-950/80 backdrop-blur-md text-white border border-white/10 shadow-xs text-[10px] font-bold">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>{pos.matching_score || 95}% Cocok</span>
                        </div>
                      </div>

                      {/* Bottom Gradient Overlay with Location */}
                      <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-between gap-2 text-white">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="text-xs font-bold truncate drop-shadow-sm">
                            {pos.nama_desa}, {pos.kabupaten}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md text-slate-200 shrink-0">
                          {pos.distance_km || 18} km
                        </span>
                      </div>
                    </div>

                    {/* Card Body Information */}
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-bold text-navy-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-epilogue line-clamp-2 transition-colors leading-snug">
                        {pos.judul}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-jakarta line-clamp-2 leading-relaxed">
                        {pos.deskripsi}
                      </p>

                      {/* Target Luaran Tags */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Layers className="w-3 h-3 text-slate-400" />
                          <span>Target Luaran Program</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {pos.target_luaran?.slice(0, 3).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-navy-700/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Kriteria Jurusan Tags */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-navy-800/80">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <GraduationCap className="w-3 h-3 text-emerald-600" />
                          <span>{tkatalog('criteriaLabel')}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {pos.kriteria_jurusan.slice(0, 4).map((j, jIdx) => (
                            <span
                              key={jIdx}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900"
                            >
                              {j}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Quota Progress & CTA Buttons */}
                  <div className="p-4 sm:p-5 bg-slate-50/90 dark:bg-navy-950/80 border-t border-slate-100 dark:border-navy-800/80 space-y-3">
                    {/* Quota Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Kuota Mahasiswa</span>
                        </span>
                        <span className="text-navy-950 dark:text-white">
                          <strong className="text-emerald-600 dark:text-emerald-400">{pos.terisi_mahasiswa}</strong> / {pos.kuota_mahasiswa} Terisi {sisaKuota > 0 ? `(Sisa ${sisaKuota})` : '(Penuh)'}
                        </span>
                      </div>

                      {/* Visual Progress Track */}
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-navy-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            sisaKuota === 0
                              ? 'bg-rose-500'
                              : quotaPercent > 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${quotaPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={`/maps?lat=${pos.latitude}&lng=${pos.longitude}&posId=${pos.id}`}
                        className="p-2 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Buka lokasi di Peta Spasial"
                      >
                        <Compass className="w-4 h-4 text-emerald-600" />
                      </Link>

                      <Link href={`/search/${pos.id}`} className="flex-1">
                        <Button
                          variant="primary"
                          className="w-full rounded-xl text-xs font-bold gap-1.5 py-2 shadow-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          <span>{tkatalog('detailBtn')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
