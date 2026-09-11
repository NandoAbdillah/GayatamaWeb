'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RegionLogo } from '@/components/ui/RegionLogo';
import { MOCK_POS_KEBUTUHAN } from '@/lib/mock-data';
import { Province, Regency, WilayahStats, WilayahSearchItem } from '@/lib/wilayah-types';
import { WilayahService } from '@/lib/wilayah-api';
import { MapMarkerItem } from '@/components/maps/WilayahLeafletMap';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Building,
  Landmark,
  Users,
  Maximize2,
  Globe2,
  Mountain,
  Clock,
  Loader2,
  Search,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

// Dynamic import for Leaflet (CSR only to avoid SSR window is not defined error)
const WilayahLeafletMap = dynamic(
  () => import('@/components/maps/WilayahLeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[550px] bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-300">Menyiapkan Engine Peta Geospasial & Lambang Daerah...</p>
      </div>
    ),
  }
);

// Featured quick provinces for instant preview
const FEATURED_PROVINCES = [
  { id: '32', name: 'Jawa Barat' },
  { id: '31', name: 'DKI Jakarta' },
  { id: '33', name: 'Jawa Tengah' },
  { id: '34', name: 'DI Yogyakarta' },
  { id: '35', name: 'Jawa Timur' },
  { id: '51', name: 'Bali' },
  { id: '12', name: 'Sumatera Utara' },
  { id: '73', name: 'Sulawesi Selatan' },
];

export default function MapsPage() {
  // Pos KKN selection & filtering
  const [selectedPos, setSelectedPos] = useState(MOCK_POS_KEBUTUHAN[0]);
  const [radiusFilter, setRadiusFilter] = useState<number>(50);

  // Wilayah & Geodata state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('32'); // Default Jawa Barat
  const [selectedRegencyId, setSelectedRegencyId] = useState<string>('');
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [currentRegion, setCurrentRegion] = useState<Province | Regency | null>(null);

  // Polygon boundary state
  const [polygonPath, setPolygonPath] = useState<any[]>([]);
  const [loadingPolygon, setLoadingPolygon] = useState<boolean>(false);
  const [stats, setStats] = useState<WilayahStats | null>(null);

  // Live Wilayah Search state (powered by edopandoyo/wilayah-indonesia-api)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<WilayahSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Center campus coordinate (Univ. Nusantara in Bogor)
  const campusCenter: [number, number] = [-6.5950, 106.8166];
  const [mapCenter, setMapCenter] = useState<[number, number]>(campusCenter);
  const [mapZoom, setMapZoom] = useState<number>(9);

  // Load provinces and stats on mount
  useEffect(() => {
    async function initData() {
      try {
        const [provList, nationalStats] = await Promise.all([
          WilayahService.getProvinces(),
          WilayahService.getStats().catch(() => null),
        ]);
        setProvinces(provList);
        if (nationalStats) setStats(nationalStats);

        const defaultProv = provList.find((p) => p.id === '32');
        if (defaultProv) {
          setCurrentRegion(defaultProv);
          loadPolygon('32');
        }
      } catch (err) {
        console.error('Failed to init wilayah data:', err);
      }
    }
    initData();
  }, []);

  // Load Regencies when Province changes
  useEffect(() => {
    if (!selectedProvinceId) return;

    async function loadRegs() {
      try {
        const regs = await WilayahService.getRegencies(selectedProvinceId);
        setRegencies(regs);
      } catch (err) {
        console.error('Failed to load regencies:', err);
      }
    }
    loadRegs();
  }, [selectedProvinceId]);

  // Debounced Live Search against edopandoyo API
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/wilayah/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data && data.success && Array.isArray(data.data)) {
          setSearchResults(data.data);
          setShowSearchResults(true);
        } else {
          setSearchResults([]);
        }
      } catch (e) {
        console.warn('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handler for Selecting a Search Item from edopandoyo API
  const handleSelectSearchItem = async (item: WilayahSearchItem) => {
    setShowSearchResults(false);
    setSearchQuery('');

    // If item is a Province (code length 2)
    if (item.level_code === 1 || item.kode.length === 2) {
      handleProvinceChange(item.kode);
      return;
    }

    // If item is a Regency (code length 5 or format "XX.YY")
    if (item.level_code === 2 || (item.kode.length === 5 && item.kode.includes('.'))) {
      const provId = item.kode.split('.')[0];
      setSelectedProvinceId(provId);
      setSelectedRegencyId(item.kode);

      // Load regency details
      try {
        const reg = await WilayahService.getRegencyById(item.kode);
        if (reg) {
          setCurrentRegion(reg);
          if (reg.lat && reg.lng) {
            setMapCenter([reg.lat, reg.lng]);
            setMapZoom(11);
          }
          loadPolygon(reg.id);
        }
      } catch (err) {
        console.warn('Could not load regency detail:', err);
      }
      return;
    }

    // If item is District or Village, fetch coordinate via edopandoyo detail API
    try {
      const detail = await WilayahService.getWilayahDetailFromApi(item.kode);
      if (detail && detail.coordinates && detail.coordinates.lat && detail.coordinates.lng) {
        setMapCenter([detail.coordinates.lat, detail.coordinates.lng]);
        setMapZoom(13);
        if (detail.parents && detail.parents.province) {
          setSelectedProvinceId(detail.parents.province);
        }
      }
    } catch (e) {
      console.warn('Error flying to detail coordinate', e);
    }
  };

  // Handler for Province Change
  const handleProvinceChange = async (provId: string) => {
    setSelectedProvinceId(provId);
    setSelectedRegencyId('');

    const prov = provinces.find((p) => p.id === provId);
    if (prov) {
      setCurrentRegion(prov);
      if (prov.lat && prov.lng) {
        setMapCenter([prov.lat, prov.lng]);
        setMapZoom(8);
      }
      loadPolygon(prov.id);
    }
  };

  // Handler for Regency Change
  const handleRegencyChange = async (regId: string) => {
    setSelectedRegencyId(regId);
    if (!regId) {
      const prov = provinces.find((p) => p.id === selectedProvinceId);
      if (prov) {
        setCurrentRegion(prov);
        loadPolygon(prov.id);
        if (prov.lat && prov.lng) setMapCenter([prov.lat, prov.lng]);
      }
      return;
    }

    const reg = regencies.find((r) => r.id === regId);
    if (reg) {
      setCurrentRegion(reg);
      if (reg.lat && reg.lng) {
        setMapCenter([reg.lat, reg.lng]);
        setMapZoom(11);
      }
      loadPolygon(reg.id);
    }
  };

  // Fetch polygon from emsifa paths API
  const loadPolygon = async (regionId: string) => {
    setLoadingPolygon(true);
    try {
      const pathData = await WilayahService.getRegionPath(regionId);
      if (pathData && pathData.path) {
        const normalized = WilayahService.normalizeLeafletPositions(pathData.path);
        setPolygonPath(normalized);
      } else {
        setPolygonPath([]);
      }
    } catch (err) {
      console.warn(`Polygon not found for region ${regionId}`, err);
      setPolygonPath([]);
    } finally {
      setLoadingPolygon(false);
    }
  };

  // Filter KKN Pos by radius
  const filteredPos = MOCK_POS_KEBUTUHAN.filter((pos) => {
    if (radiusFilter === 100) return true; // All
    return (pos.distance_km ?? 0) <= radiusFilter;
  });

  // Prepare map markers
  const mapMarkers: MapMarkerItem[] = filteredPos.map((pos) => {
    // Offset slightly for demo markers
    const latOffset = (pos.id % 2 === 0 ? 0.05 : -0.04) * (pos.id * 0.7);
    const lngOffset = (pos.id % 3 === 0 ? 0.06 : -0.05) * (pos.id * 0.6);
    return {
      id: pos.id.toString(),
      name: pos.nama_desa,
      lat: campusCenter[0] + latOffset,
      lng: campusCenter[1] + lngOffset,
      type: 'pos',
      description: pos.deskripsi,
      distanceKm: pos.distance_km,
      data: pos,
    };
  });

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] flex flex-col font-jakarta transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>GIS Geospasial & Lambang Daerah • API Wilayah Indonesia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue mt-1">
              Peta Sebaran Wilayah & Lambang Resmi Daerah
            </h1>
          </div>

          {/* Quick stats pill */}
          {stats && (
            <div className="flex items-center gap-3 bg-white dark:bg-navy-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Globe2 className="w-4 h-4 text-primary shrink-0" />
              <span>
                <strong className="text-navy-950 dark:text-white">{stats.total_provinces}</strong> Prov •{' '}
                <strong className="text-navy-950 dark:text-white">{stats.total_regencies}</strong> Kab/Kota •{' '}
                <strong className="text-navy-950 dark:text-white">{stats.total_districts.toLocaleString()}</strong> Kec
              </span>
            </div>
          )}
        </div>

        {/* Live Search Wilayah Se-Indonesia (Powered by edopandoyo/wilayah-indonesia-api) */}
        <div ref={searchContainerRef} className="relative z-30">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchResults(true);
              }}
              placeholder="Cari wilayah se-Indonesia (contoh: 'Bogor', 'Bandung', 'Surabaya', 'Denpasar', 'Malang')..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs sm:text-sm font-semibold text-navy-950 dark:text-white placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="w-5 h-5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-500 hover:text-slate-700 absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            ) : null}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden max-h-80 overflow-y-auto z-50">
              <div className="p-2 border-b border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold px-3">
                <span>Hasil Pencarian ({searchResults.length} Wilayah)</span>
                <span className="text-primary font-mono text-[10px]">edopandoyo/wilayah-indonesia-api</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-navy-800">
                {searchResults.map((item) => (
                  <button
                    key={item.kode}
                    type="button"
                    onClick={() => handleSelectSearchItem(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-navy-800 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <RegionLogo
                        code={item.kode}
                        name={item.nama}
                        size="sm"
                        showBadge={true}
                        customUrl={item.logo_url || undefined}
                      />
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-navy-950 dark:text-white group-hover:text-primary transition-colors truncate">
                          {item.nama}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {item.level} • Kode: {item.kode} {item.kodepos ? `• Pos: ${item.kodepos}` : ''}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Province Selector Ribbons with Mini Logos */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
            <Landmark className="w-3.5 h-3.5 text-primary" /> Cepat:
          </span>
          {FEATURED_PROVINCES.map((prov) => (
            <button
              key={prov.id}
              type="button"
              onClick={() => handleProvinceChange(prov.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                selectedProvinceId === prov.id
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-800 hover:border-emerald-300'
              }`}
            >
              <RegionLogo code={prov.id} name={prov.name} size="xs" showBadge={false} />
              <span>{prov.name}</span>
            </button>
          ))}
        </div>

        {/* Filter Bar: Wilayah Selector & Radius Filter */}
        <Card className="p-4 sm:p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* 1. Pilih Provinsi */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-primary" />
                  Pilih Provinsi
                </span>
                {selectedProvinceId && (
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">
                    ID: {selectedProvinceId}
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <RegionLogo code={selectedProvinceId} name={currentRegion?.name} size="sm" />
                <select
                  value={selectedProvinceId}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {provinces.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.name} {prov.capital ? `(Ibukota: ${prov.capital})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Pilih Kab/Kota */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-600" />
                  Filter Kabupaten / Kota
                </span>
                {selectedRegencyId && (
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">
                    ID: {selectedRegencyId}
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                {selectedRegencyId ? (
                  <RegionLogo code={selectedRegencyId} name={currentRegion?.name} provId={selectedProvinceId} size="sm" />
                ) : null}
                <select
                  value={selectedRegencyId}
                  onChange={(e) => handleRegencyChange(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">Semua Kab/Kota di {currentRegion?.name || 'Provinsi'}</option>
                  {regencies.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Radius Filter Buttons */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-600" />
                Radius Jarak dari Kampus
              </label>
              <div className="flex items-center gap-2">
                {[20, 50, 100].map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => setRadiusFilter(dist)}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                      radiusFilter === dist
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-800'
                    }`}
                  >
                    {dist === 100 ? 'Semua' : `< ${dist} km`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Interactive Map Layout (Map Canvas + Sidebar Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
          {/* Visual Leaflet Map Container (8 cols) */}
          <div className="lg:col-span-8 h-[620px] rounded-3xl relative">
            <WilayahLeafletMap
              center={mapCenter}
              zoom={mapZoom}
              polygonPath={polygonPath}
              regionName={currentRegion?.name || 'Indonesia'}
              regionCode={currentRegion?.id || selectedProvinceId}
              regionLogoUrl={currentRegion?.logo_url}
              regionCapital={currentRegion?.capital}
              regionPopulation={currentRegion?.population}
              regionArea={currentRegion?.total_area}
              markers={mapMarkers}
              radiusKm={radiusFilter === 100 ? undefined : radiusFilter}
              selectedMarkerId={selectedPos.id.toString()}
              isLoadingPolygon={loadingPolygon}
              onSelectMarker={(m) => {
                if (m.data) setSelectedPos(m.data);
              }}
            />
          </div>

          {/* Right Selected Pos Card & Wilayah Stats Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
            {/* Region Details & Official Government Crest Panel */}
            {currentRegion && (
              <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-3.5">
                {/* Header with Official Emblem Logo */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-navy-800">
                  <RegionLogo
                    code={currentRegion.id}
                    name={currentRegion.name}
                    provId={selectedProvinceId}
                    size="lg"
                    className="shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        {currentRegion.id.length === 2 ? 'Pemerintah Provinsi' : 'Pemerintah Daerah'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-950 text-slate-500 font-mono font-bold text-[10px]">
                        ID: {currentRegion.id}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm text-navy-950 dark:text-white leading-snug mt-0.5 truncate">
                      {currentRegion.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Logo & Batas Resmi Kemendagri & BIG
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {currentRegion.capital && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                      <span className="text-[10px] text-slate-500 block">Ibukota:</span>
                      <strong className="text-navy-950 dark:text-white font-semibold block truncate">
                        {currentRegion.capital}
                      </strong>
                    </div>
                  )}

                  {currentRegion.population && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                      <span className="text-[10px] text-slate-500 block">Populasi:</span>
                      <strong className="text-navy-950 dark:text-white font-semibold block truncate">
                        {currentRegion.population.toLocaleString('id-ID')} jiwa
                      </strong>
                    </div>
                  )}

                  {currentRegion.total_area && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                      <span className="text-[10px] text-slate-500 block">Luas Wilayah:</span>
                      <strong className="text-navy-950 dark:text-white font-semibold block truncate">
                        {currentRegion.total_area.toLocaleString('id-ID')} km²
                      </strong>
                    </div>
                  )}

                  {currentRegion.elv !== undefined && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                      <span className="text-[10px] text-slate-500 block">Ketinggian:</span>
                      <strong className="text-navy-950 dark:text-white font-semibold block truncate">
                        {currentRegion.elv} mdpl
                      </strong>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Selected Pos Card */}
            <Card className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 flex-1 flex flex-col justify-between shadow-ambient">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedPos.status} size="sm" />
                  <span className="text-xs font-bold text-primary bg-primary-50 dark:bg-primary-950/80 px-2.5 py-1 rounded-full">
                    {selectedPos.distance_km} km dari kampus
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    {selectedPos.kategori_sektor}
                  </span>
                  <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue mt-0.5 leading-snug">
                    {selectedPos.judul}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {selectedPos.nama_desa}, {selectedPos.kabupaten}
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-jakarta leading-relaxed line-clamp-3">
                  {selectedPos.deskripsi}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-navy-800">
                  <span className="text-xs font-bold text-navy-900 dark:text-slate-200">Target Luaran Pos:</span>
                  <div className="space-y-1">
                    {selectedPos.target_luaran.slice(0, 2).map((tgt, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{tgt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-navy-800 space-y-2">
                <Link href={`/search/${selectedPos.id}`}>
                  <Button size="lg" variant="primary" className="w-full shadow-glow-primary justify-center font-bold">
                    <span>Lihat Rincian Pos & Lamar</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
