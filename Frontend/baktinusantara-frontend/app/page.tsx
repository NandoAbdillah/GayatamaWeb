'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { HeroFireflies } from '@/components/ui/HeroFireflies';
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
  Sliders,
  Clock,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProgramType, setSelectedProgramType] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [isExpandModalOpen, setIsExpandModalOpen] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchJurusan, setSearchJurusan] = useState('');

  // Location Autocomplete State (Emsifa / API Indonesia)
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationContainerRef = useRef<HTMLDivElement>(null);

  // Major / Jurusan Autocomplete State (PDDikti / API Indonesia Standard)
  const [showJurusanDropdown, setShowJurusanDropdown] = useState(false);
  const jurusanContainerRef = useRef<HTMLDivElement>(null);

  const { metrics } = useDashboardMetrics();
  const { items: posKebutuhanList } = usePosKebutuhan();

  const tHero = useTranslations('hero');
  const tShowcase = useTranslations('showcase');
  const tExplore = useTranslations('explore');
  const tTechnology = useTranslations('technology');
  const tOpportunities = useTranslations('opportunities');
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
          setLocationSuggestions(data.data.slice(0, 7));
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
      if (jurusanContainerRef.current && !jurusanContainerRef.current.contains(e.target as Node)) {
        setShowJurusanDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered academic majors based on input & active sector
  const filteredMajors = useMemo(() => {
    const q = searchJurusan.toLowerCase().trim();
    return INDONESIA_POPULAR_MAJORS.filter((m) => {
      const matchSector = activeTab === 'all' || m.sectorKey === activeTab || m.sectorKey === 'all';
      if (!q) return matchSector;
      const matchName = m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
      const matchKeyword = m.keywords.some((k) => k.toLowerCase().includes(q));
      return matchName || matchKeyword;
    }).slice(0, 6);
  }, [searchJurusan, activeTab]);

  const exploreRegions = [
    {
      name: 'Jawa Barat & Banten',
      count: 480,
      img: 'https://images.unsplash.com/photo-1611638281871-1063d3e76e1f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmFuZHVuZ3xlbnwwfHwwfHx8MA%3D%3D',
    },
    {
      name: 'Jawa Tengah & DIY',
      count: 320,
      img: 'https://images.unsplash.com/photo-1723860795880-31325500d02d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGphd2ElMjB0ZW5nYWh8ZW58MHx8MHx8fDA%3D',
    },
    {
      name: 'Sumatera',
      count: 240,
      img: 'https://images.unsplash.com/photo-1693341195831-742a7b6f11ee?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      name: 'Sulawesi & Maluku',
      count: 160,
      img: 'https://images.unsplash.com/photo-1582426007790-f5a2e2392dd3?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      name: 'Bali & Nusa Tenggara',
      count: 130,
      img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&auto=format&fit=crop&q=80',
    },
    {
      name: 'Kalimantan',
      count: 90,
      img: 'https://images.unsplash.com/photo-1606444717545-7f5d882031cb?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-jakarta transition-colors duration-200">
      <Navbar />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Clean, Minimalist & Centered on Screen) */}
      {/* ========================================================================= */}
      <section
        className="relative -mt-20 min-h-screen flex flex-col justify-center items-center pt-32 sm:pt-40 lg:pt-44 pb-12 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-surface-canvas dark:bg-[#071629] border-b border-slate-200/80 dark:border-navy-800 transition-colors duration-200"
        style={{
          backgroundImage: "url('/images/BGhero.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 10%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* BGhero background overlay for readability */}
        <div aria-hidden className="absolute inset-0 bg-white/25 dark:bg-[#071629]/75 pointer-events-none" />
        
        {/* Ultra-realistic bioluminescent fireflies effect (Dark Mode Only) */}
        <HeroFireflies count={28} />

        {/* Subtle Ambient Radial Glow (Clean, Non-Intrusive) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[400px] sm:h-[500px] bg-gradient-to-tr from-primary/8 via-emerald-500/6 to-sky-400/8 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative z-10 w-full max-w-5xl xl:max-w-[1100px] 2xl:max-w-[1200px] mx-auto text-center space-y-6 sm:space-y-7 my-auto px-4 sm:px-0">
          {/* Big Authoritative Headline with Epilogue Font */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-950 dark:text-white font-epilogue tracking-tight leading-[1.12]">
            {tHero('titleLine1')} <br />
            <span className="text-secondary-600 dark:text-secondary-400">{tHero('titleAction')}</span> {tHero('titleWith')}{' '}
            <span className="text-primary-600 dark:text-primary-400">{tHero('titleImpact')}</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-300 font-jakarta leading-relaxed">
            {tHero('subtitle')}
          </p>

          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* SEARCH & DISCOVERY CARD (Sleek, Compact Low-Profile with Expand Filter) */}
          {/* ========================================================================= */}
          <div className="relative z-20 max-w-4xl xl:max-w-5xl mx-auto pt-1 sm:pt-2 text-left">
            <div className="relative z-20 bg-white/95 dark:bg-navy-900/95 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-navy-700/80 shadow-xl p-3.5 sm:p-4.5 lg:p-5 space-y-3 sm:space-y-3.5 backdrop-blur-xl">
              
              {/* Slim Top Header Bar */}
              <div className="relative z-10 flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-navy-800/80">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-navy-950 dark:text-white font-epilogue tracking-tight truncate">
                    Eksplorasi Pos KKN Mahasiswa
                  </span>
                  {activeTab !== 'all' && (
                    <span className="hidden sm:inline-flex items-center text-[10px] font-bold bg-primary-50 dark:bg-primary-950/80 text-primary dark:text-primary-300 px-2 py-0.5 rounded-full border border-primary-200 dark:border-primary-800 capitalize">
                      Sektor: {activeTab}
                    </span>
                  )}
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
                    {(activeTab !== 'all' || selectedProgramType !== 'all' || selectedDuration !== 'all') && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </button>
                </div>
              </div>

              {/* Main Compact Input Fields Grid */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
                {/* 1. Wilayah / Target Desa (With Emsifa / API Indonesia Autocomplete Dropdown) */}
                <div
                  ref={locationContainerRef}
                  className="sm:col-span-5 relative bg-slate-50/90 dark:bg-navy-950 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-navy-800 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
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
                      placeholder="Ketik desa, kec, atau kab/kota..."
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-navy-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none pr-6"
                    />
                    {isLoadingLocation && (
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                  </div>

                  {/* Dropdown Suggestions for Wilayah */}
                  {showLocationDropdown && locationSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden max-h-64 overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-navy-800">
                      <div className="p-2 bg-slate-50 dark:bg-navy-950/80 flex items-center justify-between text-[10px] text-slate-400 font-bold px-3">
                        <span>PILIH WILAYAH RESMI KEMENDAGRI</span>
                        <span className="text-primary font-mono">emsifa / apiindonesia</span>
                      </div>
                      {locationSuggestions.map((item) => (
                        <button
                          key={item.kode}
                          type="button"
                          onClick={() => {
                            setSearchLocation(item.nama);
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
                                {item.nama}
                              </h5>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {item.level} • Kode: {item.kode} {item.kodepos ? `• Pos: ${item.kodepos}` : ''}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary shrink-0 transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Program Studi / Jurusan (With Major Autocomplete Dropdown) */}
                <div
                  ref={jurusanContainerRef}
                  className="sm:col-span-4 relative bg-slate-50/90 dark:bg-navy-950 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-navy-800 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Program Studi / Jurusan
                    </span>
                    {searchJurusan && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchJurusan('');
                          setShowJurusanDropdown(false);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Hapus jurusan"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={searchJurusan}
                    onChange={(e) => setSearchJurusan(e.target.value)}
                    onFocus={() => setShowJurusanDropdown(true)}
                    placeholder="Contoh: Informatika, Gizi, Pertanian..."
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-navy-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none mt-0.5"
                  />

                  {/* Dropdown Suggestions for Jurusan */}
                  {showJurusanDropdown && filteredMajors.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden max-h-64 overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-navy-800">
                      <div className="p-2 bg-slate-50 dark:bg-navy-950/80 flex items-center justify-between text-[10px] text-slate-400 font-bold px-3">
                        <span>PROGRAM STUDI STANDAR NASIONAL</span>
                        <span className="text-emerald-600 font-mono">PDDikti / Kemdiktisaintek</span>
                      </div>
                      {filteredMajors.map((major) => (
                        <button
                          key={major.id}
                          type="button"
                          onClick={() => {
                            setSearchJurusan(major.name);
                            setShowJurusanDropdown(false);
                          }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/70 dark:hover:bg-navy-800 flex items-center justify-between transition-colors group"
                        >
                          <div>
                            <h5 className="text-xs font-bold text-navy-950 dark:text-white group-hover:text-primary transition-colors">
                              {major.name}
                            </h5>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                              Bidang: {major.category}
                            </span>
                          </div>
                          <Check className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Tombol Cari Pos KKN */}
                <div className="sm:col-span-3 flex items-center">
                  <Link
                    href={`/search?q=${encodeURIComponent(
                      [
                        searchLocation,
                        searchJurusan,
                        activeTab !== 'all' ? activeTab : '',
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
                      <span>Cari Pos KKN</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* EXPAND FILTER POPUP MODAL */}
          {/* ========================================================================= */}
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
                        Sesuaikan kriteria pencarian pos KKN sesuai kebutuhan
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

                {/* Section 1: Tema / Sektor Pengabdian */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                    Tema / Sektor Pengabdian:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'all', label: 'Semua Sektor', icon: Globe2, badge: '128' },
                      { key: 'agrikultur', label: 'Agrikultur & Pangan', icon: Sprout, badge: '42' },
                      { key: 'digitalisasi', label: 'Digitalisasi UMKM', icon: Laptop, badge: '38' },
                      { key: 'kesehatan', label: 'Kesehatan & Gizi', icon: HeartPulse, badge: '29' },
                      { key: 'pendidikan', label: 'Pendidikan & Literasi', icon: BookOpen, badge: '19' },
                      { key: 'infrastruktur', label: 'Tata Kelola & Infrastruktur', icon: Building, badge: '15' },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isSelected = activeTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setActiveTab(tab.key)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                            isSelected
                              ? 'bg-navy-900 dark:bg-primary text-white border-navy-900 dark:border-primary shadow-sm'
                              : 'bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-navy-800 hover:bg-slate-100 dark:hover:bg-navy-800'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate flex-1">{tab.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                              isSelected
                                ? 'bg-white/20 text-white font-bold'
                                : 'bg-slate-200/80 dark:bg-navy-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Tipe Program KKN */}
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
                    ].map((item) => {
                      const isSelected = selectedProgramType === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setSelectedProgramType(item.key)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all border ${
                            isSelected
                              ? 'bg-navy-900 dark:bg-primary text-white border-navy-900 dark:border-primary font-bold'
                              : 'bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-navy-800 hover:bg-slate-100 dark:hover:bg-navy-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Durasi Pelaksanaan */}
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
                    ].map((item) => {
                      const isSelected = selectedDuration === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setSelectedDuration(item.key)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all border ${
                            isSelected
                              ? 'bg-navy-900 dark:bg-primary text-white border-navy-900 dark:border-primary font-bold'
                              : 'bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-navy-800 hover:bg-slate-100 dark:hover:bg-navy-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('all');
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
                          searchJurusan,
                          activeTab !== 'all' ? activeTab : '',
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

      {/* Wrapper image2.png sebagai background untuk section 2 & 3 - transparan */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage: "url('/images/image2.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 80%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div aria-hidden className="absolute inset-0 bg-white/25 dark:bg-[#071629]/60 pointer-events-none" />
        {/* ========================================================================= */}
        {/* 2. REAL INDONESIA PHOTOGRAPHIC SHOWCASE */}
        {/* ========================================================================= */}
        <section className="relative pt-24 sm:pt-32 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-12 w-full max-w-7xl xl:max-w-[1280px] 2xl:max-w-[1440px] mx-auto space-y-8 sm:space-y-10 lg:space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              {tShowcase('badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {tShowcase('title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-jakarta">
              {tShowcase('subtitle')}
            </p>
          </div>

          <Link href="/portofolio/kelompok-14-sukamaju">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5">
              <span>{tShowcase('viewDoc')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Real Authentic Photo Grid - fluid di semua breakpoint tanpa sisa ruang */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {[
            {
              title: 'Modernisasi Irigasi Pertanian',
              location: 'Desa Sukamaju, Ciawi, Bogor',
              sector: 'Agrikultur & IoT',
              img: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80',
            },
            {
              title: 'Pemeriksaan Posyandu & Gizi Balita',
              location: 'Desa Tanjung Karang, Babakan Madang',
              sector: 'Kesehatan Masyarakat',
              img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80',
            },  
            {
              title: 'Digitalisasi & Kemasan Produk UMKM',
              location: 'Desa Cibodas Asri, Cianjur',
              sector: 'Ekonomi & Branding',
              img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=80',
            },
            {
              title: 'Edukasi Literasi Digital Desa',
              location: 'Desa Pabuaran, Sukabumi',
              sector: 'Pendidikan & Literasi',
              img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-navy-800 shadow-card hover:shadow-card-hover transition-all duration-200 bg-white dark:bg-navy-900 flex flex-col"
            >
              <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] lg:aspect-[4/3] xl:aspect-[16/11] overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 max-w-full"
                />
                <span className="absolute top-3 left-3 bg-navy-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                  {item.sector}
                </span>
              </div>
              <div className="p-4 space-y-1 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span>{item.location}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Real Numbers & Metrics (Clean Farmvest Style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200 dark:border-navy-800">
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
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 space-y-2">
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
      {/* 3. JELAJAHI SEBARAN WILAYAH NUSANTARA (Gaya Trippin': Circular Badges) */}
      {/* ========================================================================= */}
      <section className="relative py-10 sm:py-12 lg:py-14 bg-transparent dark:bg-transparent border-slate-200/50 dark:border-navy-800/50 px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-12 transition-colors duration-200">
        <div className="w-full max-w-7xl xl:max-w-[1280px] 2xl:max-w-[1440px] mx-auto space-y-6 sm:space-y-8 text-center">
          <div className="space-y-1 max-w-xl mx-auto">
            <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
              {tExplore('badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {tExplore('title')}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
            {exploreRegions.map((reg, idx) => (
              <Link
                key={idx}
                href={`/search?q=${encodeURIComponent(reg.name)}`}
                className="group flex flex-col items-center space-y-2.5 p-3 rounded-2xl hover:bg-white dark:hover:bg-navy-900 transition-all duration-150 border border-transparent hover:border-slate-200 dark:hover:border-navy-800 hover:shadow-card"
              >
                <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 rounded-full overflow-hidden border-2 border-white dark:border-navy-700 shadow-card group-hover:scale-105 transition-transform duration-200 shrink-0 aspect-square">
                  <img src={reg.img} alt={reg.name} loading="lazy" decoding="async" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" className="w-full h-full object-cover object-center max-w-full" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-950 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {reg.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{tExplore('postsCount', { count: reg.count })}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      </div>

      {/* ========================================================================= */}
      {/* 4. DEEP NAVY ORGANIC SECTION (Gaya Trippin': Dark Organic Wave Container) */}
      {/* ========================================================================= */}
      <section className="bg-navy-950 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-14 relative z-10">
          <div className="max-w-2xl space-y-2">
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
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary-500/50 transition-colors space-y-3"
              >
                <span className="text-3xl font-extrabold text-primary-400 font-epilogue">{step.step}</span>
                <h3 className="text-base font-bold font-epilogue text-white">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-jakarta">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wrapper image3.png sebagai background untuk section 5 & 6 - center 70% */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage: "url('/images/image3.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 1%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div aria-hidden className="absolute inset-0 bg-white/50 dark:bg-[#071629]/60 pointer-events-none" />
        {/* ========================================================================= */}
        {/* 5. POS KEBUTUHAN PILIHAN SIAP DILAMAR */}
        {/* ========================================================================= */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-12 w-full max-w-7xl xl:max-w-[1280px] 2xl:max-w-[1440px] mx-auto space-y-6 sm:space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
              {tOpportunities('badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {tOpportunities('title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {tOpportunities('subtitle')}
            </p>
          </div>

          <Link href="/search">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5">
              <span>{tOpportunities('viewCatalog')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {(posKebutuhanList.slice(0, 3)).map((pos) => (
            <Card key={pos.id} hoverEffect className="overflow-hidden flex flex-col justify-between border-slate-200 dark:border-navy-800">
              <div className="space-y-3">
                {/* Photo Thumbnail - fluid aspect, tidak menyisakan ruang */}
                <div className="relative w-full aspect-[16/9] sm:aspect-[16/10] lg:aspect-[16/9] xl:aspect-[4/3] overflow-hidden">
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
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="absolute inset-0 w-full h-full object-cover object-center max-w-full"
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

                <div className="p-5 space-y-2">
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
      </section>

      {/* ========================================================================= */}
      {/* 6. CTA BANNER (Clean & Authoritative) */}
      {/* ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto rounded-3xl bg-navy-900 dark:bg-navy-900/90 text-white p-8 sm:p-12 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-epilogue">
              {tCta('title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-jakarta leading-relaxed">
              {tCta('subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/register">
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
      </section>
      </div>

      <Footer />
    </div>
  );
}
