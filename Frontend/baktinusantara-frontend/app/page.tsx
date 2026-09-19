'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { HeroFireflies } from '@/components/ui/HeroFireflies';
import { IndonesiaMapBackdrop } from '@/components/ui/IndonesiaMapBackdrop';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { ProvinceDistributionCarousel } from '@/components/landing/ProvinceDistributionCarousel';
import { RegionLogo } from '@/components/ui/RegionLogo';
import { INDONESIA_POPULAR_MAJORS } from '@/data/indonesia-majors';
import { useDashboardMetrics, usePosKebutuhan } from '@/hooks';
import { useTranslations } from 'next-intl';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  Award,
  Users,
  Building,
  Sprout,
  HeartPulse,
  Laptop,
  Globe2,
  FileCheck2,
  GraduationCap,
  BookOpen,
  Compass,
  X,
  Loader2,
  ChevronRight,
  Check,
  SlidersHorizontal,
  Clock,
  Layers,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  HelpCircle,
  Send,
  FileText,
  Activity,
  FileBadge,
} from 'lucide-react';

const SECTOR_OPTIONS = [
  { key: 'agrikultur', label: 'Agrikultur & Ketahanan Pangan', shortLabel: 'Agrikultur & Pangan', icon: Sprout, count: 42 },
  { key: 'digitalisasi', label: 'Digitalisasi UMKM & Ekonomi Desa', shortLabel: 'Digitalisasi UMKM', icon: Laptop, count: 38 },
  { key: 'kesehatan', label: 'Kesehatan Masyarakat & Gizi', shortLabel: 'Kesehatan & Gizi', icon: HeartPulse, count: 29 },
  { key: 'pendidikan', label: 'Pendidikan & Literasi Desa', shortLabel: 'Pendidikan & Literasi', icon: BookOpen, count: 19 },
  { key: 'infrastruktur', label: 'Tata Kelola & Infrastruktur', shortLabel: 'Tata Kelola & Infrastruktur', icon: Building, count: 15 },
  { key: 'lingkungan', label: 'Lingkungan Hidup & Ekowisata', shortLabel: 'Lingkungan & Wisata', icon: Globe2, count: 12 },
];

interface RegionExplorerItem {
  id: string;
  name: string;
  shortName: string;
  count: number;
  activeVillages: number;
  topSector: string;
  img: string;
  description: string;
}

const REGION_EXPLORER_DATA: RegionExplorerItem[] = [
  {
    id: 'all',
    name: 'Seluruh Nusantara (38 Provinsi)',
    shortName: 'Semua Wilayah',
    count: 1280,
    activeVillages: 128,
    topSector: 'Digitalisasi & Pertanian',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    description: '1.280+ pos pengabdian mahasiswa aktif tersebar di Sabang s/d Merauke.',
  },
  {
    id: 'jawa-bali',
    name: 'Jawa & Bali',
    shortName: 'Jawa & Bali',
    count: 610,
    activeVillages: 64,
    topSector: 'Digitalisasi UMKM & Smart Village',
    img: 'https://images.unsplash.com/photo-1611638281871-1063d3e76e1f?w=600&auto=format&fit=crop&q=60',
    description: 'Fokus pada akselerasi UMKM desa, kemasan ekspor, dan modernisasi pertanian.',
  },
  {
    id: 'sumatera',
    name: 'Sumatera',
    shortName: 'Sumatera',
    count: 240,
    activeVillages: 28,
    topSector: 'Ketahanan Pangan & Perkebunan',
    img: 'https://images.unsplash.com/photo-1693341195831-742a7b6f11ee?q=80&w=764&auto=format&fit=crop',
    description: 'Pemberdayaan komoditas kelapa sawit, kopi rakyat, dan tata kelola desa adat.',
  },
  {
    id: 'kalimantan',
    name: 'Kalimantan & IKN',
    shortName: 'Kalimantan',
    count: 90,
    activeVillages: 14,
    topSector: 'Pemberdayaan Daerah Penyangga IKN',
    img: 'https://images.unsplash.com/photo-1606444717545-7f5d882031cb?q=80&w=1074&auto=format&fit=crop',
    description: 'Penyangga Ibu Kota Nusantara dan kelestarian hutan adat Kalimantan.',
  },
  {
    id: 'sulawesi',
    name: 'Sulawesi & Gorontalo',
    shortName: 'Sulawesi',
    count: 160,
    activeVillages: 19,
    topSector: 'Kemaritiman & Kakao Rakyat',
    img: 'https://images.unsplash.com/photo-1582426007790-f5a2e2392dd3?q=80&w=1074&auto=format&fit=crop',
    description: 'Hilirisasi hasil laut pesisir, perikanan tangkap, dan pariwisata bahari.',
  },
  {
    id: 'nusra',
    name: 'Nusa Tenggara Barat & Timur',
    shortName: 'Nusa Tenggara',
    count: 130,
    activeVillages: 15,
    topSector: 'Ketahanan Air & Ekowisata',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80',
    description: 'Inovasi penampungan air bersih, peternakan terpadu, dan tenun tradisional.',
  },
  {
    id: 'maluku-papua',
    name: 'Maluku & Papua',
    shortName: 'Maluku & Papua',
    count: 180,
    activeVillages: 22,
    topSector: 'Pendidikan & Kesehatan Perbatasan',
    img: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80',
    description: 'Penguatan literasi anak pedalaman, posyandu terpencil, dan pangan lokal sagu.',
  },
];

export default function HomePage() {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const sectorContainerRef = useRef<HTMLDivElement>(null);

  const [selectedProgramType, setSelectedProgramType] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [isExpandModalOpen, setIsExpandModalOpen] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchJurusan, setSearchJurusan] = useState('');

  // Location Autocomplete State (Kemendagri / API Indonesia with Full Hierarchy)
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationContainerRef = useRef<HTMLDivElement>(null);

  // Major / Jurusan Autocomplete State (PDDikti / API Indonesia Standard)
  const [showJurusanDropdown, setShowJurusanDropdown] = useState(false);
  const jurusanContainerRef = useRef<HTMLDivElement>(null);

  // Active Region Tab for Interactive Map Section
  const [activeRegionTab, setActiveRegionTab] = useState('all');

  const { metrics } = useDashboardMetrics();
  const { items: posKebutuhanList } = usePosKebutuhan();

  const tHero = useTranslations('hero');
  const tGeographic = useTranslations('geographic');
  const tProblem = useTranslations('problem');
  const tWorkflow = useTranslations('workflow');
  const tRoles = useTranslations('roles');
  const tShowcase = useTranslations('showcase');
  const tExplore = useTranslations('explore');
  const tDashboard = useTranslations('dashboardPreview');
  const tTechnology = useTranslations('technology');
  const tOpportunities = useTranslations('opportunities');
  const tImpact = useTranslations('impactPortfolio');
  const tCta = useTranslations('cta');

  // Debounced live search for Indonesian regions (Desa, Kec, Kab, Prov)
  useEffect(() => {
    if (!searchLocation || searchLocation.trim().length < 2) {
      setLocationSuggestions([]);
      setIsLoadingLocation(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingLocation(true);
      try {
        const res = await fetch(`/api/wilayah/search?q=${encodeURIComponent(searchLocation.trim())}`);
        const data = await res.json();
        if (data && data.success && Array.isArray(data.data)) {
          setLocationSuggestions(data.data.slice(0, 8));
          setShowLocationDropdown(true);
        } else {
          setLocationSuggestions([]);
        }
      } catch (err) {
        console.warn('Location search error:', err);
      } finally {
        setIsLoadingLocation(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchLocation]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (locationContainerRef.current && !locationContainerRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (sectorContainerRef.current && !sectorContainerRef.current.contains(e.target as Node)) {
        setShowSectorDropdown(false);
      }
      if (jurusanContainerRef.current && !jurusanContainerRef.current.contains(e.target as Node)) {
        setShowJurusanDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle multiple sector selection
  const toggleSector = (key: string) => {
    if (selectedSectors.includes(key)) {
      setSelectedSectors(selectedSectors.filter((s) => s !== key));
    } else {
      setSelectedSectors([...selectedSectors, key]);
    }
  };

  // Filtered academic majors based on input & sector
  const filteredMajors = useMemo(() => {
    const q = searchJurusan.toLowerCase().trim();
    return INDONESIA_POPULAR_MAJORS.filter((m) => {
      const matchSector =
        selectedSectors.length === 0 ||
        selectedSectors.some((sec) => m.sectorKey === sec || m.sectorKey === 'all');
      if (!q) return matchSector;
      const matchName = m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
      const matchKeyword = m.keywords.some((k) => k.toLowerCase().includes(q));
      return matchName || matchKeyword;
    }).slice(0, 7);
  }, [searchJurusan, selectedSectors]);

  const activeRegionData = useMemo(() => {
    return REGION_EXPLORER_DATA.find((r) => r.id === activeRegionTab) || REGION_EXPLORER_DATA[0];
  }, [activeRegionTab]);

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-jakarta transition-colors duration-200">
      <Navbar />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Clear Storytelling & Gateway) */}
      {/* ========================================================================= */}
      <section
        className="relative -mt-20 min-h-screen flex flex-col justify-center items-center pt-32 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-surface-canvas dark:bg-[#071629] border-b border-slate-200/80 dark:border-navy-800 transition-colors duration-200"
        style={{
          backgroundImage: "url('/images/BGhero.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 10%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Background Overlay */}
        <div aria-hidden className="absolute inset-0 bg-white/20 dark:bg-[#071629]/75 pointer-events-none" />

        {/* Bioluminescent fireflies effect (Dark Mode Only) */}
        <HeroFireflies count={28} />

        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[400px] sm:h-[500px] bg-gradient-to-tr from-primary/10 via-emerald-500/8 to-sky-400/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative z-10 w-full max-w-5xl xl:max-w-[1100px] 2xl:max-w-[1200px] mx-auto text-center space-y-6 sm:space-y-7 my-auto px-4 sm:px-0">

          {/* Top Badge: Platform Kolaborasi KKN Nasional */}
          {/* <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-navy-900/95 border border-emerald-500/40 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 font-jakarta tracking-wide uppercase">
              {tHero('badge')}
            </span>
          </div> */}

          {/* Headline with Epilogue Font */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-navy-950 dark:text-white font-epilogue tracking-tight leading-[1.12]">
            {tHero('titleLine1')} <br />
            <span className="text-primary-600 dark:text-secondary-400">{tHero('titleLine2')}</span>{' '}
            <span className="text-secondary-600 dark:text-primary-400">{tHero('titleLine3')}</span>
          </h1>

          {/* Subheadline (Ecosystem Value Proposition) */}
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-700 dark:text-slate-300 font-jakarta leading-relaxed">
            {tHero('subtitle')}
          </p>

          {/* Search Box Card */}
          <div className="relative z-20 max-w-4xl xl:max-w-5xl mx-auto pt-1 sm:pt-2 text-left">
            <div className="relative z-20 bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-navy-700/80 shadow-xl p-3.5 sm:p-4.5 lg:p-5 space-y-3 sm:space-y-3.5">

              {/* Top Header Bar */}
              <div className="relative z-10 flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-navy-800/80">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-navy-950 dark:text-white font-epilogue tracking-tight truncate">
                    {tHero('searchHeader')}
                  </span>
                  <span className="hidden md:inline-block text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    — {tHero('searchMicrocopy')}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/maps"
                    className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Peta</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsExpandModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-primary dark:text-primary-400 bg-primary-50/90 dark:bg-primary-950/70 hover:bg-primary-100 dark:hover:bg-primary-900/90 border border-primary-200/80 dark:border-primary-800/80 transition-all shadow-xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Expand Filter</span>
                    {(selectedSectors.length > 0 || searchJurusan || selectedProgramType !== 'all' || selectedDuration !== 'all') && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </button>
                </div>
              </div>

              {/* Main Compact Input Fields Grid */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
                {/* 1. Wilayah / Target Desa */}
                <div
                  ref={locationContainerRef}
                  className="sm:col-span-5 relative bg-slate-50/90 dark:bg-navy-950 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-navy-800 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      Wilayah / Target Desa
                    </span>
                    {searchLocation && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchLocation('');
                          setLocationSuggestions([]);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Hapus lokasi"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="relative mt-0.5">
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      onFocus={() => {
                        if (locationSuggestions.length > 0) setShowLocationDropdown(true);
                      }}
                      placeholder="Ketik nama desa, kec, kab/kota..."
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-navy-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none pr-6 truncate"
                    />
                    {isLoadingLocation && (
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                  </div>

                  {showLocationDropdown && locationSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden max-h-72 overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-navy-800">
                      <div className="p-2 bg-slate-50 dark:bg-navy-950/80 flex items-center justify-between text-[10px] text-slate-400 font-bold px-3">
                        <span>PILIH WILAYAH RESMI KEMENDAGRI</span>
                        <span className="text-emerald-600 font-mono">38 Provinsi</span>
                      </div>
                      {locationSuggestions.map((item) => (
                        <button
                          key={item.kode}
                          type="button"
                          onClick={() => {
                            setSearchLocation(item.nama_lengkap || item.nama);
                            setShowLocationDropdown(false);
                          }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/70 dark:hover:bg-navy-800 flex items-center justify-between transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <RegionLogo
                              code={item.kode}
                              name={item.nama}
                              size="xs"
                              showBadge={true}
                              customUrl={item.logo_url || undefined}
                            />
                            <div className="truncate">
                              <h5 className="text-xs font-bold text-navy-950 dark:text-white group-hover:text-primary transition-colors truncate">
                                {item.nama_lengkap || item.nama}
                              </h5>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {item.level} {item.kodepos ? `• Pos: ${item.kodepos}` : ''}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary shrink-0 transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Tema / Sektor Pengabdian */}
                <div
                  ref={sectorContainerRef}
                  className="sm:col-span-4 relative bg-slate-50/90 dark:bg-navy-950 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-navy-800 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3 h-3 text-emerald-500" />
                      Tema / Sektor Pengabdian
                    </span>
                    {selectedSectors.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedSectors([])}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] font-semibold"
                        title="Reset sektor"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSectorDropdown(!showSectorDropdown)}
                    className="w-full text-left flex items-center justify-between mt-0.5 focus:outline-none"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-navy-950 dark:text-white truncate">
                      {selectedSectors.length === 0
                        ? 'Semua Sektor (Bisa Pilih Banyak)'
                        : selectedSectors.length === 1
                          ? SECTOR_OPTIONS.find((s) => s.key === selectedSectors[0])?.shortLabel || selectedSectors[0]
                          : `${selectedSectors.length} Sektor Terpilih`}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] ml-1 shrink-0">
                      ▼
                    </span>
                  </button>

                  {showSectorDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden max-h-72 overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-navy-800">
                      <div className="p-2 bg-slate-50 dark:bg-navy-950/80 flex items-center justify-between text-[10px] text-slate-400 font-bold px-3">
                        <span>PILIH SEKTOR (MULTI-PILIHAN)</span>
                        <button
                          type="button"
                          onClick={() => setSelectedSectors([])}
                          className="text-primary hover:underline"
                        >
                          Semua Sektor
                        </button>
                      </div>
                      {SECTOR_OPTIONS.map((sec) => {
                        const Icon = sec.icon;
                        const isChecked = selectedSectors.includes(sec.key);
                        return (
                          <button
                            key={sec.key}
                            type="button"
                            onClick={() => toggleSector(sec.key)}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors ${isChecked
                                ? 'bg-primary-50/70 dark:bg-primary-950/40 text-primary dark:text-primary-300'
                                : 'hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isChecked
                                    ? 'bg-primary border-primary text-white'
                                    : 'border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-950'
                                  }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-primary" />
                              <span className="text-xs font-semibold truncate">{sec.label}</span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md font-mono bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                              {sec.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Tombol Cari Pos KKN */}
                <div className="sm:col-span-3 flex items-center">
                  <Link
                    href={`/search?q=${encodeURIComponent(
                      [
                        searchLocation,
                        selectedSectors.join(' '),
                        searchJurusan,
                        selectedProgramType !== 'all' ? selectedProgramType : '',
                        selectedDuration !== 'all' ? selectedDuration : '',
                      ]
                        .filter(Boolean)
                        .join(' ')
                    )}`}
                    className="w-full h-full block"
                  >
                    <Button
                      size="lg"
                      variant="primary"
                      className="w-full h-full min-h-[48px] sm:min-h-[50px] rounded-2xl text-xs sm:text-sm font-bold gap-2 shadow-glow-primary justify-center whitespace-nowrap"
                    >
                      <Search className="w-4 h-4" />
                      <span>{tHero('searchBtn')}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Expand Filter Popup Modal */}
          {isExpandModalOpen && (
            <div
              className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setIsExpandModalOpen(false)}
            >
              <div
                className="relative bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-700 shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-5 my-8 text-left animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/80 border border-primary-200 dark:border-primary-800 text-primary flex items-center justify-center">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-navy-950 dark:text-white font-epilogue tracking-tight">
                        Filter Lengkap Pos KKN
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Sesuaikan jurusan akademik dan parameter pengabdian
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsExpandModalOpen(false)}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Section 1: Program Studi / Jurusan */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Program Studi / Jurusan Akademik:
                  </label>
                  <div ref={jurusanContainerRef} className="relative">
                    <div className="relative bg-slate-50 dark:bg-navy-950 p-2.5 rounded-2xl border border-slate-200 dark:border-navy-800 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center justify-between">
                      <input
                        type="text"
                        value={searchJurusan}
                        onChange={(e) => setSearchJurusan(e.target.value)}
                        onFocus={() => setShowJurusanDropdown(true)}
                        placeholder="Ketik jurusan (contoh: Informatika, Gizi, Pertanian, Hukum...)"
                        className="w-full bg-transparent text-xs sm:text-sm font-semibold text-navy-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none pr-6"
                      />
                      {searchJurusan && (
                        <button
                          type="button"
                          onClick={() => setSearchJurusan('')}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {showJurusanDropdown && filteredMajors.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden max-h-56 overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-navy-800">
                        <div className="p-2 bg-slate-50 dark:bg-navy-950/80 flex items-center justify-between text-[10px] text-slate-400 font-bold px-3">
                          <span>STANDAR PDDikti / KEMDIKTISAINTEK</span>
                          <span className="text-emerald-600 font-mono">Resmi</span>
                        </div>
                        {filteredMajors.map((major) => (
                          <button
                            key={major.id}
                            type="button"
                            onClick={() => {
                              setSearchJurusan(major.name);
                              setShowJurusanDropdown(false);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-emerald-50/70 dark:hover:bg-navy-800 flex items-center justify-between transition-colors group"
                          >
                            <div>
                              <h5 className="text-xs font-bold text-navy-950 dark:text-white group-hover:text-primary transition-colors">
                                {major.name}
                              </h5>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                Bidang: {major.category}
                              </span>
                            </div>
                            <Check className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      'Teknik Informatika',
                      'Agribisnis',
                      'Ilmu Gizi',
                      'Manajemen Bisnis',
                      'Pendidikan SD',
                      'DKV & Desain',
                      'Ilmu Hukum',
                      'Teknik Sipil',
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setSearchJurusan(chip)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${searchJurusan === chip
                            ? 'bg-primary text-white border-primary font-bold'
                            : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-navy-700 hover:bg-slate-200 dark:hover:bg-navy-700'
                          }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 2: Tipe Program */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                    Tipe Program KKN:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'all', label: 'Semua Tipe' },
                      { key: 'tematik', label: 'KKN Tematik' },
                      { key: 'reguler', label: 'KKN Reguler' },
                      { key: 'mbkm', label: 'KKN MBKM / Mandiri' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSelectedProgramType(item.key)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all border ${selectedProgramType === item.key
                            ? 'bg-navy-900 dark:bg-primary text-white border-navy-900 dark:border-primary font-bold'
                            : 'bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-navy-800 hover:bg-slate-100 dark:hover:bg-navy-800'
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 3: Durasi */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                    Durasi Pelaksanaan:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'all', label: 'Semua Durasi' },
                      { key: '1-bulan', label: '1 Bulan' },
                      { key: '2-bulan', label: '2 Bulan' },
                      { key: '1-semester', label: '1 Semester (MBKM)' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSelectedDuration(item.key)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all border ${selectedDuration === item.key
                            ? 'bg-navy-900 dark:bg-primary text-white border-navy-900 dark:border-primary font-bold'
                            : 'bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-navy-800 hover:bg-slate-100 dark:hover:bg-navy-800'
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSectors([]);
                      setSearchJurusan('');
                      setSelectedProgramType('all');
                      setSelectedDuration('all');
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline"
                  >
                    Reset Filter
                  </button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsExpandModalOpen(false)}
                      className="rounded-xl text-xs"
                    >
                      Batal
                    </Button>
                    <Link
                      href={`/search?q=${encodeURIComponent(
                        [
                          searchLocation,
                          selectedSectors.join(' '),
                          searchJurusan,
                          selectedProgramType !== 'all' ? selectedProgramType : '',
                          selectedDuration !== 'all' ? selectedDuration : '',
                        ]
                          .filter(Boolean)
                          .join(' ')
                      )}`}
                      onClick={() => setIsExpandModalOpen(false)}
                    >
                      <Button variant="primary" size="sm" className="rounded-xl text-xs font-bold gap-1.5 shadow-md">
                        <span>Terapkan Filter</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* WRAPPER 1: IMAGE2.PNG (Gunung & Burung-burung Panorama Latar Belakang) */}
      {/* ========================================================================= */}
      <div
        className="relative overflow-hidden w-full bg-cover sm:bg-[length:100%_auto] lg:bg-cover xl:bg-[length:100%_auto] bg-top bg-no-repeat"
        style={{
          backgroundImage: "url('/images/image2.png')",
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          contain: 'paint',
        }}
      >
        {/* Transparent Overlay for High Readability & Keeping Mountain/Bird Art Visible */}
        <div aria-hidden className="absolute inset-0 bg-white/20 dark:bg-[#071629]/70 pointer-events-none" />

        {/* ========================================================================= */}
        {/* 2. GEOGRAPHIC DISTRIBUTION SECTION */}
        {/* ========================================================================= */}
        <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-12 max-w-7xl 2xl:max-w-[1380px] mx-auto space-y-8 sm:space-y-10">
          {/* Header Row: Left-Aligned Distribution Statement + Right-Aligned Peta Nusantara (Papua Flush Right) */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10">
            {/* Left Column: Heading & Description (Align Left) */}
            <div className="space-y-3.5 max-w-xl xl:max-w-2xl text-left shrink-0">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
                
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider font-jakarta">
                  {tGeographic('badge')}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 dark:text-white font-epilogue tracking-tight leading-[1.18]">
                {tGeographic('title')}
              </h2>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-jakarta leading-relaxed max-w-xl">
                {tGeographic('subtitle')}
              </p>
            </div>

            {/* Right Column: Indonesia Map (Right-Aligned, Papua Flush with Right Edge) */}
            <div className="relative w-full lg:w-[460px] xl:w-[560px] 2xl:w-[620px] aspect-[16/9] flex-shrink-0 flex items-center justify-end overflow-visible ml-auto">
              <IndonesiaMapBackdrop position="inline-right" className="opacity-95" />
            </div>
          </div>

          {/* 38-Province Interactive Carousel & Regional Tabs */}
          <div className="relative z-10">
            <ProvinceDistributionCarousel />
          </div>

          {/* Transition Banner */}
          <div className="relative z-10 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-50/95 via-teal-50/95 to-sky-50/95 dark:from-navy-900/95 dark:via-navy-900/95 dark:to-navy-950/95 border border-emerald-200/80 dark:border-emerald-800/60 shadow-md text-center max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-navy-950 dark:text-white font-epilogue">
                  {tProblem('transition')}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-jakarta">
                  Dari aspirasi warga desa → pencarian cerdas → validasi → pelaksanaan → pembuktian dampak.
                </p>
              </div>
            </div>

            <Link href="/katalog" className="shrink-0">
              <Button variant="primary" size="sm" className="rounded-xl text-xs font-bold gap-1.5 shadow-sm">
                <span>Jelajahi Katalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. WORKFLOW / SOLUTION JOURNEY ("Bagaimana BaktiNusantara Bekerja?") */}
        {/* ========================================================================= */}
        <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 sm:space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
              {tWorkflow('badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 dark:text-white font-epilogue tracking-tight">
              {tWorkflow('title')}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-jakarta leading-relaxed">
              {tWorkflow('subtitle')}
            </p>
          </div>

          {/* 6-Step Connected Journey Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {[
              {
                step: '01',
                icon: Send,
                title: tWorkflow('steps.0.title'),
                desc: tWorkflow('steps.0.desc'),
                tag: 'Input Kebutuhan',
              },
              {
                step: '02',
                icon: Search,
                title: tWorkflow('steps.1.title'),
                desc: tWorkflow('steps.1.desc'),
                tag: 'Matching Prodi',
              },
              {
                step: '03',
                icon: FileText,
                title: tWorkflow('steps.2.title'),
                desc: tWorkflow('steps.2.desc'),
                tag: 'Proposal Tim',
              },
              {
                step: '04',
                icon: ShieldCheck,
                title: tWorkflow('steps.3.title'),
                desc: tWorkflow('steps.3.desc'),
                tag: 'Validasi Resmi',
              },
              {
                step: '05',
                icon: MapPin,
                title: tWorkflow('steps.4.title'),
                desc: tWorkflow('steps.4.desc'),
                tag: 'Logbook GPS',
              },
              {
                step: '06',
                icon: FileBadge,
                title: tWorkflow('steps.5.title'),
                desc: tWorkflow('steps.5.desc'),
                tag: 'BAST & Portofolio',
              },
            ].map((st, idx) => {
              const Icon = st.icon;
              return (
                <div
                  key={idx}
                  className="relative p-6 rounded-3xl bg-white/95 dark:bg-navy-900/95 border border-slate-200/90 dark:border-navy-800 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400 font-epilogue">
                        {st.step}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                        {st.tag}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue leading-snug">
                      {st.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-jakarta leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. USER ROLE / MULTI-STAKEHOLDER SECTION ("Satu Platform, Tiga Peran") */}
        {/* ========================================================================= */}
        <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 sm:space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              {tRoles('badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 dark:text-white font-epilogue tracking-tight">
              {tRoles('title')}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-jakarta leading-relaxed">
              {tRoles('subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Role 1: Mahasiswa */}
            <div className="p-7 rounded-3xl bg-white/95 dark:bg-navy-900/95 border border-primary-200 dark:border-primary-900/60 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950 text-primary flex items-center justify-center border border-primary-200 dark:border-primary-800">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                    {tRoles('mahasiswa.role')}
                  </span>
                  <h3 className="text-lg font-extrabold text-navy-950 dark:text-white font-epilogue mt-1">
                    {tRoles('mahasiswa.tagline')}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-jakarta leading-relaxed">
                  {tRoles('mahasiswa.desc')}
                </p>
              </div>

              <Link href="/search">
                <Button variant="primary" className="w-full rounded-xl text-xs sm:text-sm font-bold gap-2">
                  <span>{tRoles('mahasiswa.cta')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Role 2: Pemerintah Desa */}
            <div className="p-7 rounded-3xl bg-white/95 dark:bg-navy-900/95 border border-emerald-200 dark:border-emerald-900/60 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    {tRoles('desa.role')}
                  </span>
                  <h3 className="text-lg font-extrabold text-navy-950 dark:text-white font-epilogue mt-1">
                    {tRoles('desa.tagline')}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-jakarta leading-relaxed">
                  {tRoles('desa.desc')}
                </p>
              </div>

              <Link href="/aspirasi">
                <Button variant="secondary" className="w-full rounded-xl text-xs sm:text-sm font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white">
                  <span>{tRoles('desa.cta')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Role 3: DPL & Pengelola LPPM */}
            <div className="p-7 rounded-3xl bg-white/95 dark:bg-navy-900/95 border border-amber-200 dark:border-amber-900/60 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                    {tRoles('dpl.role')}
                  </span>
                  <h3 className="text-lg font-extrabold text-navy-950 dark:text-white font-epilogue mt-1">
                    {tRoles('dpl.tagline')}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-jakarta leading-relaxed">
                  {tRoles('dpl.desc')}
                </p>
              </div>

              <Link href="/login">
                <Button variant="outline" className="w-full rounded-xl text-xs sm:text-sm font-bold gap-2 border-slate-300 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800">
                  <span>{tRoles('dpl.cta')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. REAL IMPACT STORIES (Real Cases: Problem -> Solution -> Impact) */}
        {/* ========================================================================= */}
        <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 sm:space-y-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                {tShowcase('badge')}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                {tShowcase('title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-jakarta leading-relaxed">
                {tShowcase('subtitle')}
              </p>
            </div>

            <Link href="/portofolio/kelompok-14-sukamaju">
              <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 bg-white/90 dark:bg-navy-900/90">
                <span>{tShowcase('viewDoc')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* 4 Real Case Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {[
              {
                village: 'Desa Sukamaju, Ciawi, Bogor',
                sector: 'Digitalisasi UMKM',
                title: 'Transformasi Digital 24 Pengrajin Bambu',
                desc: 'Mahasiswa membantu katalog produk digital, QRIS statis, dan pencatatan buku kas sederhana.',
                impactBadge: '+24 UMKM Terdigitalisasi & Omzet +35%',
                img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=80',
              },
              {
                village: 'Desa Sumberagung, Bantul, DIY',
                sector: 'Kesehatan & Gizi Balita',
                title: 'Aplikasi Posyandu & Intervensi PMT',
                desc: 'Pemetaan data antropometri balita real-time dan pendampingan menu gizi hewani lokal.',
                impactBadge: 'Penurunan Stunting Balita -14%',
                img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80',
              },
              {
                village: 'Desa Karangrejo, Boyolali, Jateng',
                sector: 'Agrikultur & IoT',
                title: 'Sistem Otomasi Irigasi Pintar Hortikultura',
                desc: 'Pemasangan sensor kelembaban tanah dan katup solenoid otomatis untuk lahan padi & cabai.',
                impactBadge: '15 Ha Sawah Cerdas & Hemat Air 40%',
                img: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80',
              },
              {
                village: 'Desa Bahoi, Minahasa Utara, Sulut',
                sector: 'Ekowisata & Bahari',
                title: 'Zonasi Terumbu Karang & Ekowisata Mangrove',
                desc: 'Pembuatan peta terumbu karang digital dan platform reservasi homestay warga desa pesisir.',
                impactBadge: 'Katalog Wisata & 100% Zona Konservasi',
                img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group rounded-3xl overflow-hidden border border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/95 dark:bg-navy-900/95 flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full aspect-[16/10] overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-navy-950/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                      {item.sector}
                    </span>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{item.village}</span>
                    </p>
                    <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-jakarta">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Impact Metric Pill */}
                <div className="p-5 pt-0">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{item.impactBadge}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Real Numbers & Metrics Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200/80 dark:border-navy-800">
            {[
              {
                num: `${metrics.total_desa_terbantu || 128}+`,
                label: tShowcase('stats.stat1'),
                icon: Building,
                color: 'text-primary-600 dark:text-primary-400',
              },
              {
                num: `${metrics.total_mahasiswa_terlibat || 850}+`,
                label: tShowcase('stats.stat2'),
                icon: Users,
                color: 'text-secondary-600 dark:text-secondary-400',
              },
              {
                num: `${metrics.total_luaran_terverifikasi || 37}+`,
                label: tShowcase('stats.stat3'),
                icon: FileCheck2,
                color: 'text-tertiary-600 dark:text-tertiary-400',
              },
              {
                num: `${metrics.total_jam_pengabdian ? metrics.total_jam_pengabdian.toLocaleString('id-ID') : '40.800'}+`,
                label: tShowcase('stats.stat4'),
                icon: Award,
                color: 'text-indigo-600 dark:text-indigo-400',
              },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white/95 dark:bg-navy-900/95 border border-slate-200/80 dark:border-navy-800 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                      {m.num}
                    </span>
                    <Icon className={`w-5 h-5 ${m.color}`} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{m.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. INTERACTIVE NUSANTARA MAP SECTION */}
        {/* ========================================================================= */}
        <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
              {tExplore('badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {tExplore('title')}
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-jakarta">
              {tExplore('subtitle')}
            </p>
          </div>

          {/* Interactive Region Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {REGION_EXPLORER_DATA.map((reg) => (
              <button
                key={reg.id}
                type="button"
                onClick={() => setActiveRegionTab(reg.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${activeRegionTab === reg.id
                    ? 'bg-primary text-white border-primary shadow-md scale-105'
                    : 'bg-white/95 dark:bg-navy-900/95 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-800 hover:bg-white dark:hover:bg-navy-800'
                  }`}
              >
                <span>{reg.shortName}</span>
                <span className="ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] bg-black/10 dark:bg-white/10 font-mono">
                  {reg.count}
                </span>
              </button>
            ))}
          </div>

          {/* Active Region Highlights Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-navy-900/95 border border-slate-200/90 dark:border-navy-800 shadow-xl max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full md:w-1/3 aspect-[16/10] rounded-2xl overflow-hidden shadow-md shrink-0">
              <img
                src={activeRegionData.img}
                alt={activeRegionData.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3 flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 dark:bg-primary-950 text-primary border border-primary-200 dark:border-primary-800">
                  {activeRegionData.count} Pos KKN Terbuka
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activeRegionData.activeVillages} Desa Binaan
                </span>
              </div>

              <h3 className="text-lg font-bold text-navy-950 dark:text-white font-epilogue">
                {activeRegionData.name}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-jakarta leading-relaxed">
                {activeRegionData.description}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Sektor Prioritas: <strong className="text-emerald-600 dark:text-emerald-400">{activeRegionData.topSector}</strong>
                </span>
                <Link href={`/search?q=${encodeURIComponent(activeRegionData.shortName)}`}>
                  <Button variant="primary" size="sm" className="rounded-xl text-xs font-bold gap-1">
                    <span>Lihat Pos Wilayah Ini</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 7. DEEP NAVY SYSTEM ARCHITECTURE & DATA PIPELINE */}
      {/* ========================================================================= */}
      {/* <section className="bg-navy-950 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-y border-navy-800">
        <div className="max-w-7xl mx-auto space-y-14 relative z-10">
          <div className="max-w-2xl space-y-2 text-left">
            <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
              {tTechnology('badge')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-epilogue leading-snug">
              {tTechnology('title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-jakarta">
              {tTechnology('subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: tTechnology('steps.step1.title'),
                desc: tTechnology('steps.step1.desc'),
              },
              {
                step: '02',
                title: tTechnology('steps.step2.title'),
                desc: tTechnology('steps.step2.desc'),
              },
              {
                step: '03',
                title: tTechnology('steps.step3.title'),
                desc: tTechnology('steps.step3.desc'),
              },
              {
                step: '04',
                title: tTechnology('steps.step4.title'),
                desc: tTechnology('steps.step4.desc'),
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary-500/50 transition-colors space-y-3 text-left"
              >
                <span className="text-3xl font-extrabold text-primary-400 font-epilogue">{step.step}</span>
                <h3 className="text-base font-bold font-epilogue text-white">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-jakarta">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ========================================================================= */}
      {/* WRAPPER 2: IMAGE3.PNG (Landscape Alam Nusantara Latar Belakang) */}
      {/* ========================================================================= */}
     
     
      <div
        className="relative overflow-hidden w-full bg-cover sm:bg-[length:100%_auto] lg:bg-cover xl:bg-[length:100%_auto] bg-top bg-no-repeat"
        style={{
          backgroundImage: "url('/images/image3.png')",
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          contain: 'paint',
        }}
      >
        {/* Transparent Overlay for Visibility */}
        <div aria-hidden className="absolute inset-0 bg-white/30 dark:bg-[#071629]/70 pointer-events-none" />

        {/* ========================================================================= */}
        {/* 8. PRODUCT PREVIEW SECTION ("BaktiNusantara dalam Satu Dashboard") */}
        {/* ========================================================================= */}
        {/* <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
              {tDashboard('badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {tDashboard('title')}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-jakarta leading-relaxed">
              {tDashboard('subtitle')}
            </p>
          </div>

          <DashboardPreview />
        </section> */}

        {/* ========================================================================= */}
        {/* 9. POS KEBUTUHAN SIAP DILAMAR */}
        {/* ========================================================================= */}
        {/* <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1 text-left">
              <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
                {tOpportunities('badge')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                {tOpportunities('title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {tOpportunities('subtitle')}
              </p>
            </div>

            <Link href="/search">
              <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md">
                <span>{tOpportunities('viewCatalog')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(posKebutuhanList.slice(0, 3)).map((pos) => (
              <Card key={pos.id} hoverEffect className="overflow-hidden flex flex-col justify-between border-slate-200 dark:border-navy-800 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md">
                <div className="space-y-3">
                  <div className="relative w-full aspect-[16/9] overflow-hidden">
                    <img
                      src={
                        pos.id === 1
                          ? 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80'
                          : pos.id === 2
                            ? 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80'
                            : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={pos.judul}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={pos.status} size="sm" />
                    </div>
                    {pos.matching_score && (
                      <div className="absolute top-3 right-3 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                        {tOpportunities('matchBadge', { score: pos.matching_score })}
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-2 text-left">
                    <span className="text-[11px] font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wide">
                      {pos.kategori_sektor}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-navy-950 dark:text-white font-epilogue line-clamp-2">
                      {pos.judul}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {pos.deskripsi}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-navy-800">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {pos.nama_desa}, {pos.kabupaten}
                      </span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">{pos.distance_km} km</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-navy-800 mt-2">
                  <div className="text-xs">
                    <span className="text-slate-400 dark:text-slate-500">{tOpportunities('quotaLabel')} </span>
                    <strong className="text-navy-950 dark:text-slate-200">
                      {tOpportunities('quotaValue', { filled: pos.terisi_mahasiswa, quota: pos.kuota_mahasiswa })}
                    </strong>
                  </div>

                  <Link href={`/search/${pos.id}`}>
                    <Button size="sm" variant="primary" className="text-xs font-semibold">
                      {tOpportunities('detailBtn')}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section> */}

        {/* ========================================================================= */}
        {/* 10. IMPACT PORTFOLIO CALLOUT ("Setiap Program Meninggalkan Jejak...") */}
        {/* ========================================================================= */}
        {/* <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900/95 via-navy-900/95 to-navy-950/95 text-white border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-left backdrop-blur-md">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {tImpact('badge')}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold font-epilogue">
                {tImpact('title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-jakarta leading-relaxed">
                {tImpact('subtitle')}
              </p>
            </div>

            <Link href="/portofolio/kelompok-14-sukamaju" className="shrink-0">
              <Button variant="primary" size="lg" className="rounded-xl font-bold text-xs sm:text-sm gap-2">
                <span>{tImpact('cta')}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section> */}

        {/* ========================================================================= */}
        {/* 11. FINAL CTA BANNER (Multi-Directional: Desa + Mahasiswa) */}
        {/* ========================================================================= */}
          {/* <section className="relative px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-6xl mx-auto rounded-3xl bg-navy-900/95 dark:bg-navy-900/95 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-left backdrop-blur-md">
              <div className="space-y-2 max-w-xl">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-epilogue leading-snug">
                  {tCta('title')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-jakarta leading-relaxed">
                  {tCta('subtitle')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link href="/search">
                  <Button size="lg" variant="primary" className="font-bold text-xs sm:text-sm">
                    {tCta('registerBtn')}
                  </Button>
                </Link>
                <Link href="/aspirasi">
                  <Button size="lg" variant="outline" className="border-slate-600 text-navy-950 dark:text-white bg-white dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-700 font-bold text-xs sm:text-sm">
                    {tCta('aspirasiBtn')}
                  </Button>
                </Link>
              </div>
            </div>
          </section> */}
      </div>
       
      <Footer />
    </div>
  );
}
