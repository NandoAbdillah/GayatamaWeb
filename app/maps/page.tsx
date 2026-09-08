'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MOCK_POS_KEBUTUHAN } from '@/lib/mock-data';
import { Province, Regency, WilayahStats } from '@/lib/wilayah-types';
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
} from 'lucide-react';

// Dynamic import for Leaflet (CSR only to avoid SSR window is not defined error)
const WilayahLeafletMap = dynamic(
  () => import('@/components/maps/WilayahLeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[550px] bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-300">Menyiapkan Engine Peta Geospasial...</p>
      </div>
    ),
  }
);

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
              <span>GIS Geospasial Kemendagri & BIG • API Wilayah Indonesia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue mt-1">
              Peta Sebaran Pos KKN & Polygon Wilayah Indonesia
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

        {/* Filter Bar: Wilayah Selector & Radius Filter */}
        <Card className="p-4 sm:p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* 1. Pilih Provinsi */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-primary" />
                Pilih Provinsi (Batas Wilayah)
              </label>
              <select
                value={selectedProvinceId}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                {provinces.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.name} {prov.capital ? `(Ibukota: ${prov.capital})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Pilih Kab/Kota */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                Filter Kabupaten / Kota
              </label>
              <select
                value={selectedRegencyId}
                onChange={(e) => handleRegencyChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">Semua Kab/Kota di {currentRegion?.name || 'Provinsi'}</option>
                {regencies.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.name}
                  </option>
                ))}
              </select>
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
            {/* Region Details Panel */}
            {currentRegion && (
              <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Informasi Wilayah Terpilih
                    </span>
                    <h3 className="font-bold text-sm text-navy-950 dark:text-white">
                      {currentRegion.name}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-300 font-mono font-bold text-[11px]">
                    ID: {currentRegion.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {currentRegion.capital && (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-950">
                      <span className="text-[10px] text-slate-500 block">Ibukota:</span>
                      <strong className="text-navy-950 dark:text-white font-semibold">
                        {currentRegion.capital}
                      </strong>
                    </div>
                  )}

                  {currentRegion.population && (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-950">
                      <span className="text-[10px] text-slate-500 block">Populasi:</span>
                      <strong className="text-navy-950 dark:text-white font-semibold">
                        {currentRegion.population.toLocaleString('id-ID')} jiwa
                      </strong>
                    </div>
                  )}

                  {currentRegion.total_area && (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-950">
                      <span className="text-[10px] text-slate-500 block">Luas Wilayah:</span>
                      <strong className="text-navy-950 dark:text-white font-semibold">
                        {currentRegion.total_area.toLocaleString('id-ID')} km²
                      </strong>
                    </div>
                  )}

                  {currentRegion.elv !== undefined && (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-950">
                      <span className="text-[10px] text-slate-500 block">Ketinggian:</span>
                      <strong className="text-navy-950 dark:text-white font-semibold">
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
