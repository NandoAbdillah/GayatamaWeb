'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { RegionLogo } from '@/components/ui/RegionLogo';
import { MOCK_POS_KEBUTUHAN } from '@/lib/mock-data';
import { Province, Regency, District, Village, WilayahStats, WilayahSearchItem } from '@/lib/wilayah-types';
import { WilayahService } from '@/lib/wilayah-api';
import { MapMarkerItem } from '@/components/maps/WilayahLeafletMap';
import { MedsosEmbedCard, MedsosPostItem } from '@/components/maps/MedsosEmbedCard';
import { RiwayatPengabdianCard, RiwayatPengabdianItem } from '@/components/maps/RiwayatPengabdianCard';
import { LiveReportCard, LiveReportItem } from '@/components/maps/LiveReportCard';
import { MapFilterSelect } from '@/components/ui/MapFilterSelect';
import { fetchWikipediaSummary, WikipediaSummary } from '@/lib/wikipedia';
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
  Home,
  Users,
  Globe2,
  Clock,
  Loader2,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  Share2,
  Star,
  BookOpen,
  Instagram,
  Activity,
  Award,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

// Dynamic import for Leaflet (CSR only)
function MapLoadingFallback() {
  return (
    <div className="w-full h-full min-h-[580px] bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white space-y-3">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-300">Memuat Peta Spasial Nusantara...</p>
    </div>
  );
}

const WilayahLeafletMap = dynamic(() => import('@/components/maps/WilayahLeafletMap'), {
  ssr: false,
  loading: () => <MapLoadingFallback />,
});

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

const SECTOR_FILTER_OPTIONS = [
  { key: 'all', label: 'Semua Sektor' },
  { key: 'digitalisasi', label: 'Digitalisasi & UMKM' },
  { key: 'agrikultur', label: 'Pertanian & Pangan' },
  { key: 'kesehatan', label: 'Kesehatan & Gizi' },
  { key: 'pendidikan', label: 'Pendidikan & Literasi' },
  { key: 'lingkungan', label: 'Lingkungan & Energi' },
];

// Mock Riwayat Pengabdian (Alumni Archives)
const MOCK_RIWAYAT_ARCHIVES: RiwayatPengabdianItem[] = [
  {
    id: 'rw-1',
    desa_nama: 'Desa Sukamaju',
    kabupaten: 'Kabupaten Jombang',
    judul_program: 'Inovasi Kemasan Merek & Marketplace UMKM Keripik Singkong',
    nama_kelompok: 'KKN UNESA 01 Sukamaju Digital',
    universitas: 'Universitas Negeri Surabaya',
    tahun: '2025/2026',
    periode: 'Semester Ganjil',
    jumlah_mahasiswa: 8,
    rating: 4.9,
    luaran_unggulan: ['Sertifikasi Halal & NIB 15 UMKM', 'Website Katalog Desa', 'SOP Kemasan Kedap Udara'],
    ringkasan_dampak: 'Peningkatan omzet rata-rata pelaku usaha keripik lokal hingga 65% dalam 30 hari pasca-pelatihan branding digital.',
    thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
    slug_portofolio: 'digitalisasi-branding-dan-e-commerce-umkm-kripik-singkong-sukamaju',
  },
  {
    id: 'rw-2',
    desa_nama: 'Desa Berkah Makmur',
    kabupaten: 'Kabupaten Pasuruan',
    judul_program: 'Instalasi Biodigester Kotoran Ternak Sapi untuk Energi Mandiri',
    nama_kelompok: 'KKN ITS Berkah Hijau',
    universitas: 'Institut Teknologi Sepuluh Nopember',
    tahun: '2024/2025',
    periode: 'Semester Genap',
    jumlah_mahasiswa: 7,
    rating: 4.8,
    luaran_unggulan: ['2 Unit Reaktor Biogas Aktif', 'Buku Panduan Pemeliharaan', 'Reduksi 40% Limbah Kandang'],
    ringkasan_dampak: 'Memasok kebutuhan gas memasak bagi 12 KK di sekitar peternakan komunal tanpa biaya LPG bulanan.',
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rw-3',
    desa_nama: 'Desa Cempaka Putih',
    kabupaten: 'Kabupaten Mojokerto',
    judul_program: 'Akademi Literasi Bahasa Inggris & Komputer Anak Pedesaan',
    nama_kelompok: 'KKN Edukasi Cempaka',
    universitas: 'Universitas Negeri Surabaya',
    tahun: '2024/2025',
    periode: 'Semester Ganjil',
    jumlah_mahasiswa: 6,
    rating: 4.9,
    luaran_unggulan: ['Kurikulum Bimbel Interaktif', 'Modul Belajar Mandiri', 'Laboratorium Komputer Sederhana'],
    ringkasan_dampak: 'Membina 95 siswa SD pedesaan dengan peningkatan nilai rerata bahasa Inggris sebesar 40%.',
    thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
  },
];

// Mock Live Reports (Ongoing real-time logs)
const MOCK_LIVE_REPORTS: LiveReportItem[] = [
  {
    id: 'lr-1',
    desa_nama: 'Desa Sukamaju',
    kabupaten: 'Kabupaten Jombang',
    penulis: 'Ahmad Fauzi',
    role: 'Ketua Tim Mahasiswa',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    waktu: '2 jam yang lalu',
    minggu_ke: 3,
    persentase: 75,
    aktivitas: 'Uji coba instalasi sistem kasir digital POS dan pendampingan input stok produk 15 pelaku UMKM di Balai Desa Sukamaju.',
    foto_dokumentasi: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    dpl_verified: true,
    dpl_nama: 'Dr. Budi Santoso, M.Kom.',
  },
  {
    id: 'lr-2',
    desa_nama: 'Desa Berkah Makmur',
    kabupaten: 'Kabupaten Pasuruan',
    penulis: 'Dimas Pratama',
    role: 'Koordinator Lapangan',
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    waktu: '5 jam yang lalu',
    minggu_ke: 2,
    persentase: 60,
    aktivitas: 'Pemasangan kubah penampung gas metana biodigester dan uji kebocoran pipa distribusi bersama teknisi desa.',
    foto_dokumentasi: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=80',
    dpl_verified: true,
    dpl_nama: 'Ir. Agus Setiawan, M.T.',
  },
];

export default function MapsPage() {
  const tmaps = useTranslations('maps');

  // Pos KKN selection & filtering
  const [selectedPos, setSelectedPos] = useState(MOCK_POS_KEBUTUHAN[0]);
  const [radiusFilter, setRadiusFilter] = useState<number>(100);
  const [selectedSector, setSelectedSector] = useState<string>('all');

  // Wilayah & Geodata state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('32'); // Default Jawa Barat
  const [selectedRegencyId, setSelectedRegencyId] = useState<string>('');
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');
  const [villages, setVillages] = useState<Village[]>([]);
  const [currentRegion, setCurrentRegion] = useState<Province | Regency | District | Village | null>(null);

  // Polygon boundary state
  const [polygonPath, setPolygonPath] = useState<any[]>([]);
  const [loadingPolygon, setLoadingPolygon] = useState<boolean>(false);
  const [stats, setStats] = useState<WilayahStats | null>(null);

  // Wikipedia Integration State
  const [wikiSummary, setWikiSummary] = useState<WikipediaSummary | null>(null);
  const [loadingWiki, setLoadingWiki] = useState<boolean>(false);

  // Social Media Embeds State
  const [medsosPosts, setMedsosPosts] = useState<MedsosPostItem[]>([]);
  const [loadingMedsos, setLoadingMedsos] = useState<boolean>(false);

  // Single Unified Spatial Inspector State (Tabs: detail, pos, riwayat, medsos)
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(true);
  const [rightPanelTab, setRightPanelTab] = useState<'detail' | 'pos' | 'riwayat' | 'medsos'>('detail');

  // Hero Card Gallery Index
  const [heroImageIdx, setHeroImageIdx] = useState(0);
  const heroGalleryImages = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611638281871-1063d3e76e1f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
  ];

  // Live Wilayah Search state (Kemendagri Live Autocomplete)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<WilayahSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Center campus coordinate (Univ. Nusantara in Bogor)
  const campusCenter: [number, number] = [-6.595, 106.8166];
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

  // Load Districts when Regency changes
  useEffect(() => {
    if (!selectedRegencyId) {
      setDistricts([]);
      setSelectedDistrictId('');
      setVillages([]);
      setSelectedVillageId('');
      return;
    }

    async function loadDistricts() {
      try {
        const dists = await WilayahService.getDistricts(selectedRegencyId);
        setDistricts(dists);
      } catch (err) {
        console.error('Failed to load districts:', err);
      }
    }
    loadDistricts();
  }, [selectedRegencyId]);

  // Load Villages when District changes
  useEffect(() => {
    if (!selectedDistrictId) {
      setVillages([]);
      setSelectedVillageId('');
      return;
    }

    async function loadVillages() {
      try {
        const vills = await WilayahService.getVillages(selectedDistrictId);
        setVillages(vills);
      } catch (err) {
        console.error('Failed to load villages:', err);
      }
    }
    loadVillages();
  }, [selectedDistrictId]);

  // Load Wikipedia details whenever selected region or selected pos changes
  useEffect(() => {
    async function loadWiki() {
      setLoadingWiki(true);
      const queryName = selectedPos?.nama_desa || currentRegion?.name || 'Jawa Barat';
      const summary = await fetchWikipediaSummary(queryName);
      setWikiSummary(summary);
      setLoadingWiki(false);
    }
    loadWiki();
  }, [selectedPos, currentRegion]);

  // Load Medsos Posts from backend
  useEffect(() => {
    async function loadMedsos() {
      setLoadingMedsos(true);
      try {
        const res = await fetch('http://localhost:8000/api/medsos-posts');
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setMedsosPosts(json.data);
        }
      } catch (e) {
        console.warn('Backend medsos posts offline, using fallback', e);
      } finally {
        setLoadingMedsos(false);
      }
    }
    loadMedsos();
  }, []);

  // Debounced Live Search against Kemendagri API
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
    }, 320);

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

  // Handler for Selecting a Search Item
  const handleSelectSearchItem = async (item: WilayahSearchItem) => {
    setShowSearchResults(false);
    setSearchQuery('');
    setIsDetailOpen(true);
    setRightPanelTab('detail');

    // Split code components (e.g., "32.01.01.1001" or "32.01")
    const parts = item.kode.split('.');

    // If item is a Province (Level 1)
    if (item.level_code === 1 || parts.length === 1 || item.kode.length === 2) {
      handleProvinceChange(item.kode);
      return;
    }

    // If item is a Regency (Level 2)
    if (item.level_code === 2 || parts.length === 2) {
      const provId = parts[0];
      setSelectedProvinceId(provId);
      setSelectedRegencyId(item.kode);
      setSelectedDistrictId('');
      setSelectedVillageId('');

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

    // If item is District (Level 3)
    if (parts.length === 3) {
      const provId = parts[0];
      const regId = `${parts[0]}.${parts[1]}`;
      setSelectedProvinceId(provId);
      setSelectedRegencyId(regId);
      setSelectedDistrictId(item.kode);
      setSelectedVillageId('');

      try {
        const detail = await WilayahService.getWilayahDetailFromApi(item.kode);
        if (detail && detail.coordinates && detail.coordinates.lat && detail.coordinates.lng) {
          setMapCenter([detail.coordinates.lat, detail.coordinates.lng]);
          setMapZoom(13);
        }
        loadPolygon(item.kode);
      } catch (e) {
        console.warn('Error loading district from search:', e);
      }
      return;
    }

    // If item is Village (Level 4)
    if (parts.length >= 4) {
      const provId = parts[0];
      const regId = `${parts[0]}.${parts[1]}`;
      const distId = `${parts[0]}.${parts[1]}.${parts[2]}`;
      setSelectedProvinceId(provId);
      setSelectedRegencyId(regId);
      setSelectedDistrictId(distId);
      setSelectedVillageId(item.kode);

      try {
        const detail = await WilayahService.getWilayahDetailFromApi(item.kode);
        if (detail && detail.coordinates && detail.coordinates.lat && detail.coordinates.lng) {
          setMapCenter([detail.coordinates.lat, detail.coordinates.lng]);
          setMapZoom(15);
        }
        loadPolygon(item.kode);
      } catch (e) {
        console.warn('Error loading village from search:', e);
      }
      return;
    }
  };

  // Handler for Province Change
  const handleProvinceChange = async (provId: string) => {
    setSelectedProvinceId(provId);
    setSelectedRegencyId('');
    setSelectedDistrictId('');
    setSelectedVillageId('');

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
    setSelectedDistrictId('');
    setSelectedVillageId('');

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

  // Handler for District Change
  const handleDistrictChange = async (distId: string) => {
    setSelectedDistrictId(distId);
    setSelectedVillageId('');

    if (!distId) {
      const reg = regencies.find((r) => r.id === selectedRegencyId);
      if (reg) {
        setCurrentRegion(reg);
        loadPolygon(reg.id);
        if (reg.lat && reg.lng) {
          setMapCenter([reg.lat, reg.lng]);
          setMapZoom(11);
        }
      }
      return;
    }

    const dist = districts.find((d) => d.id === distId);
    if (dist) {
      setCurrentRegion(dist);
      loadPolygon(dist.id);
      if (dist.lat && dist.lng) {
        setMapCenter([dist.lat, dist.lng]);
        setMapZoom(13);
      } else {
        try {
          const detail = await WilayahService.getDistrictById(distId);
          if (detail && detail.lat && detail.lng) {
            setMapCenter([detail.lat, detail.lng]);
            setMapZoom(13);
          }
        } catch (e) {
          console.warn('Could not load district coordinates:', e);
        }
      }
    }
  };

  // Handler for Village Change
  const handleVillageChange = async (villId: string) => {
    setSelectedVillageId(villId);

    if (!villId) {
      const dist = districts.find((d) => d.id === selectedDistrictId);
      if (dist) {
        setCurrentRegion(dist);
        loadPolygon(dist.id);
        if (dist.lat && dist.lng) {
          setMapCenter([dist.lat, dist.lng]);
          setMapZoom(13);
        }
      }
      return;
    }

    const vill = villages.find((v) => v.id === villId);
    if (vill) {
      setCurrentRegion(vill);
      loadPolygon(vill.id);
      if (vill.lat && vill.lng) {
        setMapCenter([vill.lat, vill.lng]);
        setMapZoom(15);
      } else {
        try {
          const detail = await WilayahService.getVillageById(villId);
          if (detail && detail.lat && detail.lng) {
            setMapCenter([detail.lat, detail.lng]);
            setMapZoom(15);
          }
        } catch (e) {
          console.warn('Could not load village coordinates:', e);
        }
      }
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

  // Filter KKN Pos by radius & sector
  const filteredPos = MOCK_POS_KEBUTUHAN.filter((pos) => {
    const matchRadius = radiusFilter === 100 || (pos.distance_km ?? 0) <= radiusFilter;
    const matchSector =
      selectedSector === 'all' ||
      pos.kategori_sektor.toLowerCase().includes(selectedSector) ||
      pos.kategori_sektor.toLowerCase().includes(selectedSector.replace('&', ''));
    return matchRadius && matchSector;
  });

  // Prepare map markers with accurate coordinates across provinces
  const mapMarkers: MapMarkerItem[] = filteredPos.map((pos) => {
    let lat = pos.latitude || campusCenter[0];
    let lng = pos.longitude || campusCenter[1];

    // If province is switched to another province, intelligently offset markers near province centroid
    if (selectedProvinceId !== '32' && currentRegion?.lat && currentRegion?.lng) {
      const latOffset = (pos.id % 2 === 0 ? 0.08 : -0.07) * (pos.id * 0.4);
      const lngOffset = (pos.id % 3 === 0 ? 0.09 : -0.08) * (pos.id * 0.35);
      lat = currentRegion.lat + latOffset;
      lng = currentRegion.lng + lngOffset;
    }

    return {
      id: pos.id.toString(),
      name: pos.nama_desa,
      lat,
      lng,
      type: 'pos',
      description: pos.deskripsi,
      distanceKm: pos.distance_km,
      data: pos,
    };
  });

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 flex flex-col font-jakarta transition-colors selection:bg-emerald-100 selection:text-emerald-900 relative">
      {/* Top Main Navigation Bar */}
      <div className="z-40 shrink-0 shadow-md">
        <Navbar />
      </div>

      {/* ========================================================================= */}
      {/* FULL-VIEWPORT SPATIAL WORKSPACE WITH MAP AS 100% BACKGROUND */}
      {/* ========================================================================= */}
      <div className="relative flex-1 w-full h-[calc(100vh-68px)] overflow-hidden">
        {/* 1. BACKGROUND FULL-CANVAS INTERACTIVE MAP */}
        <div className="absolute inset-0 w-full h-full z-0">
          <WilayahLeafletMap
            center={mapCenter}
            zoom={mapZoom}
            polygonPath={polygonPath}
            regionName={currentRegion?.name || 'Indonesia'}
            regionCode={currentRegion?.id || selectedProvinceId}
            regionLogoUrl={currentRegion && 'logo_url' in currentRegion ? currentRegion.logo_url : undefined}
            regionCapital={currentRegion && 'capital' in currentRegion ? currentRegion.capital : undefined}
            regionPopulation={currentRegion && 'population' in currentRegion ? currentRegion.population : undefined}
            regionArea={currentRegion && 'total_area' in currentRegion ? currentRegion.total_area : undefined}
            markers={mapMarkers}
            radiusKm={radiusFilter === 100 ? undefined : radiusFilter}
            selectedMarkerId={selectedPos.id.toString()}
            isLoadingPolygon={loadingPolygon}
            className="w-full h-full relative z-0"
            showFloatingBadges={false}
            onSelectMarker={(m) => {
              if (m.data) {
                setSelectedPos(m.data);
                setHeroImageIdx(0);
                setRightPanelTab('detail');
                setIsDetailOpen(true);
              }
            }}
          />
        </div>

        {/* 2. TOP FLOATING SEARCH & FILTER ISLAND */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-6 right-3 sm:right-6 z-30 pointer-events-none flex justify-center">
          <div className="pointer-events-auto w-full max-w-6xl bg-white/95 dark:bg-navy-900/95 rounded-3xl p-2.5 sm:p-3.5 border border-slate-200/90 dark:border-navy-700/90 shadow-2xl backdrop-blur-2xl space-y-2.5 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
              {/* Live search input - Elongated with Kemendagri live autocomplete */}
              <div ref={searchContainerRef} className="relative flex-1 min-w-[280px] sm:min-w-[340px]">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowSearchResults(true);
                    }}
                    placeholder="Cari desa, kecamatan, kabupaten, atau provinsi..."
                    className="w-full pl-9 pr-8 py-2 rounded-2xl border border-slate-200 dark:border-navy-700 bg-slate-50/90 dark:bg-navy-950 text-xs sm:text-sm font-semibold text-navy-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner"
                  />
                  {isSearching ? (
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  ) : searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="w-4 h-4 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-500 hover:text-slate-700 absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-xs"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  ) : null}
                </div>

                {/* Autocomplete Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 dark:bg-navy-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden max-h-72 overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-navy-800">
                    <div className="p-2 bg-slate-50 dark:bg-navy-950/80 flex items-center justify-between text-[10px] text-slate-400 font-bold px-3">
                      <span>HASIL WILAYAH RESMI KEMENDAGRI</span>
                      <span className="text-emerald-600 font-mono">38 Provinsi</span>
                    </div>
                    {searchResults.map((item) => (
                      <button
                        key={item.kode}
                        type="button"
                        onClick={() => handleSelectSearchItem(item)}
                        className="w-full text-left px-3.5 py-2 hover:bg-emerald-50/80 dark:hover:bg-navy-800 flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <RegionLogo
                            code={item.kode}
                            name={item.nama}
                            size="xs"
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
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pos Filter Dropdowns (Sektor & Radius) */}
              <div className="flex items-center gap-2 shrink-0">
                {/* 1. Sektor Dropdown */}
                <MapFilterSelect
                  label="Sektor"
                  value={selectedSector}
                  onChange={(val) => setSelectedSector(val)}
                  options={SECTOR_FILTER_OPTIONS.map((s) => ({ value: s.key, label: s.label }))}
                  icon={<Layers className="w-3.5 h-3.5 text-emerald-500" />}
                  dropdownWidth="min-w-[200px]"
                />

                {/* 2. Radius Dropdown */}
                <MapFilterSelect
                  label="Radius"
                  value={radiusFilter}
                  onChange={(val) => setRadiusFilter(Number(val))}
                  options={[
                    { value: 20, label: '< 20 km (Dekat)' },
                    { value: 50, label: '< 50 km (Sedang)' },
                    { value: 100, label: 'Semua Jarak' },
                  ]}
                  icon={<Compass className="w-3.5 h-3.5 text-sky-500" />}
                  dropdownWidth="min-w-[170px]"
                />
              </div>
            </div>

            {/* Tier 2: 4-Level Wilayah Hierarchy Filter Pills (Provinsi -> Kab/Kota -> Kecamatan -> Desa) */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-navy-800/80">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-emerald-600" /> Wilayah:
              </span>

              {/* 1. Provinsi Dropdown with Crest */}
              <MapFilterSelect
                label="Provinsi"
                value={selectedProvinceId}
                onChange={(val) => handleProvinceChange(val)}
                options={provinces.map((p) => ({
                  value: p.id,
                  label: p.name,
                  icon: <RegionLogo code={p.id} name={p.name} size="xs" showBadge={false} />,
                }))}
                prefixLogo={
                  <RegionLogo
                    code={selectedProvinceId}
                    name={currentRegion?.name}
                    size="xs"
                    showBadge={false}
                  />
                }
                dropdownWidth="min-w-[220px]"
              />

              {/* 2. Kab/Kota Dropdown */}
              <MapFilterSelect
                label="Kab/Kota"
                value={selectedRegencyId}
                onChange={(val) => handleRegencyChange(val)}
                options={[
                  { value: '', label: 'Semua Kab/Kota' },
                  ...regencies.map((r) => ({ value: r.id, label: r.name })),
                ]}
                icon={<Building className="w-3.5 h-3.5 text-emerald-600" />}
                dropdownWidth="min-w-[220px]"
              />

              {/* 3. Kecamatan / Distrik Dropdown */}
              <MapFilterSelect
                label="Kecamatan / Distrik"
                value={selectedDistrictId}
                onChange={(val) => handleDistrictChange(val)}
                options={[
                  { value: '', label: selectedRegencyId ? 'Semua Kecamatan' : 'Pilih Kab/Kota dulu' },
                  ...districts.map((d) => ({ value: d.id, label: d.name })),
                ]}
                icon={<Landmark className="w-3.5 h-3.5 text-emerald-600" />}
                dropdownWidth="min-w-[220px]"
              />

              {/* 4. Desa / Kelurahan Dropdown */}
              <MapFilterSelect
                label="Desa / Kelurahan"
                value={selectedVillageId}
                onChange={(val) => handleVillageChange(val)}
                options={[
                  { value: '', label: selectedDistrictId ? 'Semua Desa/Kel' : 'Pilih Kecamatan dulu' },
                  ...villages.map((v) => ({
                    value: v.id,
                    label: v.postal_code ? `${v.name} (${v.postal_code})` : v.name,
                  })),
                ]}
                icon={<Home className="w-3.5 h-3.5 text-emerald-600" />}
                dropdownWidth="min-w-[240px]"
              />
            </div>

            {/* Quick Province Ribbons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pt-1 border-t border-slate-100 dark:border-navy-800/80">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Landmark className="w-3 h-3 text-emerald-600" /> Jelajahi:
              </span>
              {FEATURED_PROVINCES.map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => handleProvinceChange(prov.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold shrink-0 transition-all border ${
                    selectedProvinceId === prov.id
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs scale-[1.02]'
                      : 'bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-navy-800 hover:border-emerald-300'
                  }`}
                >
                  <RegionLogo code={prov.id} name={prov.name} size="xs" showBadge={false} />
                  <span>{prov.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. UNIFIED RIGHT SPATIAL INSPECTOR DRAWER (Positioned below top island with safe screen margins) */}
        <div className="absolute top-[180px] sm:top-[185px] right-3 sm:right-6 bottom-6 sm:bottom-8 w-[390px] sm:w-[420px] max-w-[calc(100vw-24px)] z-30 pointer-events-none flex flex-col items-end">
          {isDetailOpen ? (
            <div className="pointer-events-auto w-full h-full max-h-[calc(100vh-215px)] bg-white/95 dark:bg-navy-900/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-navy-700/80 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-right-4">
              {/* Inspector Header: 4 Segmented Tabs + Minimize Button */}
              <div className="px-3.5 pt-3 pb-2.5 border-b border-slate-100 dark:border-navy-800 shrink-0 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 text-[11px] font-bold flex-1">
                  <button
                    type="button"
                    onClick={() => setRightPanelTab('detail')}
                    className={`flex-1 py-1 px-2 rounded-xl transition-all ${
                      rightPanelTab === 'detail'
                        ? 'bg-white dark:bg-navy-900 text-navy-950 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-navy-950 dark:hover:text-white'
                    }`}
                  >
                    Detail
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightPanelTab('pos')}
                    className={`flex-1 py-1 px-2 rounded-xl transition-all ${
                      rightPanelTab === 'pos'
                        ? 'bg-white dark:bg-navy-900 text-navy-950 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-navy-950 dark:hover:text-white'
                    }`}
                  >
                    Pos ({filteredPos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightPanelTab('riwayat')}
                    className={`flex-1 py-1 px-2 rounded-xl transition-all ${
                      rightPanelTab === 'riwayat'
                        ? 'bg-white dark:bg-navy-900 text-navy-950 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-navy-950 dark:hover:text-white'
                    }`}
                  >
                    Riwayat ({MOCK_RIWAYAT_ARCHIVES.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightPanelTab('medsos')}
                    className={`flex-1 py-1 px-2 rounded-xl transition-all ${
                      rightPanelTab === 'medsos'
                        ? 'bg-white dark:bg-navy-900 text-navy-950 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-navy-950 dark:hover:text-white'
                    }`}
                  >
                    Medsos ({medsosPosts.length + MOCK_LIVE_REPORTS.length})
                  </button>
                </div>

                {/* Close / Minimize Button */}
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-500 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-navy-700 flex items-center justify-center transition-colors shrink-0"
                  title="Minimalkan Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body Container */}
              <div className="flex-1 overflow-y-auto scrollbar-thin p-3.5 sm:p-4 space-y-4">
                {/* TAB 1: DETAIL WILAYAH & POS */}
                {rightPanelTab === 'detail' && (
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    {/* Photo Carousel Container */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-900 group shrink-0">
                      <img
                        src={heroGalleryImages[heroImageIdx]}
                        alt={selectedPos.judul}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                      {/* Top Overlay Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold shadow-md">
                          <Star className="w-3 h-3 text-amber-400 fill-current" />
                          <span>4.9</span>
                          <span className="text-[9px] text-emerald-400 font-semibold">• Terverifikasi</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(window.location.href);
                            alert('Tautan pos berhasil disalin ke clipboard!');
                          }}
                          className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 flex items-center justify-center transition-all border border-white/20 shadow-md"
                          title="Bagikan Pos Ini"
                        >
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Slider Arrows */}
                      <button
                        type="button"
                        onClick={() =>
                          setHeroImageIdx((prev) => (prev === 0 ? heroGalleryImages.length - 1 : prev - 1))
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setHeroImageIdx((prev) => (prev === heroGalleryImages.length - 1 ? 0 : prev + 1))
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Pagination Dots */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                        {heroGalleryImages.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setHeroImageIdx(idx)}
                            className={`h-1.5 rounded-full transition-all ${
                              heroImageIdx === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Emblem Crest & Titles */}
                    <div className="flex items-start gap-3 pb-2 border-b border-slate-100 dark:border-navy-800">
                      <RegionLogo
                        code={currentRegion?.id || selectedProvinceId}
                        name={currentRegion?.name || selectedPos.nama_desa}
                        provId={selectedProvinceId}
                        size="md"
                        className="shadow-md shrink-0 mt-0.5"
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 truncate">
                            {selectedPos.kategori_sektor}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">
                            ID: #{selectedPos.id}
                          </span>
                        </div>
                        <h2 className="text-sm sm:text-base font-extrabold text-navy-950 dark:text-white font-epilogue leading-snug">
                          {selectedPos.judul}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-jakarta flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">
                            {selectedPos.nama_desa}, {selectedPos.kabupaten}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* 4 Quick Spec Metric Chips (Zero Emojis, Pure SVG Icons) */}
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      <div className="p-2 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800/80 flex flex-col items-center justify-center">
                        <span className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" /> Mahasiswa
                        </span>
                        <strong className="text-[11px] font-bold text-navy-950 dark:text-white block mt-0.5">
                          {selectedPos.kuota_mahasiswa || 8} Mhs
                        </strong>
                      </div>
                      <div className="p-2 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800/80 flex flex-col items-center justify-center">
                        <span className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-sky-500" /> Durasi
                        </span>
                        <strong className="text-[11px] font-bold text-navy-950 dark:text-white block mt-0.5">
                          45 Hari
                        </strong>
                      </div>
                      <div className="p-2 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800/80 flex flex-col items-center justify-center">
                        <span className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-primary" /> Jarak
                        </span>
                        <strong className="text-[11px] font-bold text-primary block mt-0.5">
                          {selectedPos.distance_km ?? 15} km
                        </strong>
                      </div>
                      <div className="p-2 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800/80 flex flex-col items-center justify-center">
                        <span className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Luaran
                        </span>
                        <strong className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                          {selectedPos.target_luaran.length} Luaran
                        </strong>
                      </div>
                    </div>

                    {/* Wikipedia Encyclopedic Knowledge Box */}
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-sky-50/60 dark:from-navy-950 dark:via-navy-950/80 dark:to-navy-900 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-extrabold text-emerald-800 dark:text-emerald-300 text-[11px]">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Konteks Wilayah & Ensiklopedia</span>
                        </div>
                        {wikiSummary?.pageUrl && (
                          <a
                            href={wikiSummary.pageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            <span>Wikipedia ID</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      {loadingWiki ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400 py-0.5">
                          <Loader2 className="w-3 h-3 animate-spin text-primary" />
                          <span className="text-[11px]">Memuat data ensiklopedia wilayah...</span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3 font-jakarta">
                          {wikiSummary?.extract || selectedPos.deskripsi}
                        </p>
                      )}
                    </div>

                    {/* Target Luaran List */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-navy-950 dark:text-white block">
                        Target Capaian Luaran Utama:
                      </span>
                      <div className="space-y-1">
                        {selectedPos.target_luaran.map((tgt, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-[11px]">{tgt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Main Action Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <Link href={`/search/${selectedPos.id}`} className="flex-1">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full justify-center font-bold text-xs gap-1.5 rounded-2xl shadow-lg shadow-emerald-500/20 py-2.5"
                        >
                          <span>Buka Detail Pos</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Link href={`/aspirasi`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-2xl text-xs font-bold py-2.5 px-4"
                        >
                          Aspirasi
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* TAB 2: DAFTAR POS KKN TERKAIT */}
                {rightPanelTab === 'pos' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                      <span className="font-bold">Ditemukan {filteredPos.length} Pos KKN di wilayah ini</span>
                    </div>

                    {filteredPos.map((pos) => {
                      const isSelected = pos.id === selectedPos.id;
                      return (
                        <div
                          key={pos.id}
                          onClick={() => {
                            setSelectedPos(pos);
                            setHeroImageIdx(0);
                            if (pos.latitude && pos.longitude) {
                              setMapCenter([pos.latitude, pos.longitude]);
                              setMapZoom(12);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 space-y-2 group ${
                            isSelected
                              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-400/40 shadow-md'
                              : 'bg-slate-50/80 dark:bg-navy-950/60 border-slate-200/80 dark:border-navy-800 hover:border-emerald-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider bg-emerald-100/70 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md truncate">
                              {pos.kategori_sektor}
                            </span>
                            <span className="text-[10px] font-bold text-primary bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-primary shrink-0" />
                              <span>{pos.distance_km ?? 15} km</span>
                            </span>
                          </div>

                          <h3 className="text-xs font-bold text-navy-950 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {pos.judul}
                          </h3>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            <span className="truncate">{pos.nama_desa}, {pos.kabupaten}</span>
                          </p>

                          <div className="pt-2 border-t border-slate-200/60 dark:border-navy-800 flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{pos.kuota_mahasiswa} Mahasiswa Dibutuhkan</span>
                            </span>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPos(pos);
                                setRightPanelTab('detail');
                              }}
                              className="text-emerald-600 hover:underline flex items-center gap-0.5 text-[10px]"
                            >
                              Detail <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TAB 3: RIWAYAT PENGABDIAN ALUMNI */}
                {rightPanelTab === 'riwayat' && (
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    <div className="text-xs text-slate-500 pb-1 font-bold">
                      Arsip Hasil Program KKN yang Telah Selesai ({MOCK_RIWAYAT_ARCHIVES.length})
                    </div>
                    {MOCK_RIWAYAT_ARCHIVES.map((item) => (
                      <RiwayatPengabdianCard key={item.id} item={item} className="w-full shadow-sm" />
                    ))}
                  </div>
                )}

                {/* TAB 4: LIVE REPORT & MEDSOS FEEDS */}
                {rightPanelTab === 'medsos' && (
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    <div className="text-xs text-slate-500 pb-1 font-bold flex items-center justify-between">
                      <span>Dokumentasi Lapangan & Media Sosial</span>
                      <span className="text-emerald-600 font-bold">{medsosPosts.length + MOCK_LIVE_REPORTS.length} Postingan</span>
                    </div>

                    {/* Real-time Field Reports */}
                    {MOCK_LIVE_REPORTS.map((report) => (
                      <LiveReportCard key={report.id} report={report} className="w-full shadow-sm" />
                    ))}

                    {/* Social Media Post Cards */}
                    {medsosPosts.map((post) => (
                      <MedsosEmbedCard key={post.id} post={post} className="w-full shadow-sm" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Collapsed Floating Pill Button on Right Edge */
            <button
              type="button"
              onClick={() => setIsDetailOpen(true)}
              className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/95 dark:bg-navy-900/95 backdrop-blur-2xl shadow-2xl border border-emerald-400 dark:border-emerald-700 text-xs font-bold text-navy-950 dark:text-white hover:scale-105 hover:border-emerald-500 transition-all group"
            >
              <RegionLogo
                code={currentRegion?.id || selectedProvinceId}
                name={currentRegion?.name || selectedPos.nama_desa}
                provId={selectedProvinceId}
                size="xs"
                showBadge={false}
              />
              <div className="text-left">
                <span className="block text-[9px] text-slate-400 font-medium">Buka Panel Wilayah & Pos</span>
                <strong className="block text-xs text-navy-950 dark:text-white group-hover:text-primary transition-colors truncate max-w-[140px]">
                  {selectedPos.nama_desa} ({selectedPos.kabupaten})
                </strong>
              </div>
              <ChevronLeft className="w-4 h-4 text-emerald-600 ml-1 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
