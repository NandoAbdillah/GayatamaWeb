'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Home,
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ProvinceData {
  id: string;
  name: string;
  capital: string;
  region: 'jawa_bali' | 'sumatera' | 'kalimantan' | 'sulawesi' | 'nusra' | 'maluku_papua';
  regionLabel: string;
  posCount: number;
  desaCount: number;
  mahasiswaCount: number;
  prioritySector: string;
  badge?: string;
  color: string;
}

export const PROVINCES_38_DATA: ProvinceData[] = [
  // 1. JAWA & BALI (610 Pos)
  {
    id: 'dki-jakarta',
    name: 'DKI Jakarta',
    capital: 'Jakarta Pusat',
    region: 'jawa_bali',
    regionLabel: 'Jawa & Bali',
    posCount: 75,
    desaCount: 14,
    mahasiswaCount: 480,
    prioritySector: 'Smart City & Pemberdayaan Urban',
    badge: 'Hub Utama',
    color: 'from-sky-500/20 to-blue-600/20 border-sky-500/30 text-sky-600 dark:text-sky-400',
  },
  {
    id: 'jawa-barat',
    name: 'Jawa Barat',
    capital: 'Bandung',
    region: 'jawa_bali',
    regionLabel: 'Jawa & Bali',
    posCount: 140,
    desaCount: 28,
    mahasiswaCount: 890,
    prioritySector: 'Digitalisasi UMKM & Agribisnis',
    badge: 'Terbanyak',
    color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'jawa-tengah',
    name: 'Jawa Tengah',
    capital: 'Semarang',
    region: 'jawa_bali',
    regionLabel: 'Jawa & Bali',
    posCount: 125,
    desaCount: 24,
    mahasiswaCount: 780,
    prioritySector: 'Desa Wisata & Ketahanan Pangan',
    badge: 'Prioritas',
    color: 'from-teal-500/20 to-emerald-600/20 border-teal-500/30 text-teal-600 dark:text-teal-400',
  },
  {
    id: 'di-yogyakarta',
    name: 'D.I. Yogyakarta',
    capital: 'Yogyakarta',
    region: 'jawa_bali',
    regionLabel: 'Jawa & Bali',
    posCount: 70,
    desaCount: 16,
    mahasiswaCount: 470,
    prioritySector: 'Ekonomi Kreatif & Budaya Digital',
    badge: 'Pusat Edukasi',
    color: 'from-amber-500/20 to-orange-600/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'jawa-timur',
    name: 'Jawa Timur',
    capital: 'Surabaya',
    region: 'jawa_bali',
    regionLabel: 'Jawa & Bali',
    posCount: 130,
    desaCount: 26,
    mahasiswaCount: 790,
    prioritySector: 'Industri Desa & Modernisasi Pertanian',
    badge: 'Sentra Agro',
    color: 'from-indigo-500/20 to-blue-600/20 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'banten',
    name: 'Banten',
    capital: 'Serang',
    region: 'jawa_bali',
    regionLabel: 'Jawa & Bali',
    posCount: 42,
    desaCount: 10,
    mahasiswaCount: 260,
    prioritySector: 'Pesisir & Pemberdayaan Nelayan',
    color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'bali',
    name: 'Bali',
    capital: 'Denpasar',
    region: 'jawa_bali',
    regionLabel: 'Jawa & Bali',
    posCount: 28,
    desaCount: 8,
    mahasiswaCount: 180,
    prioritySector: 'Green Tourism & Desa Adat Digital',
    badge: 'Kawasan Global',
    color: 'from-emerald-500/20 to-lime-600/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
  },

  // 2. SUMATERA (240 Pos)
  {
    id: 'aceh',
    name: 'Aceh',
    capital: 'Banda Aceh',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 30,
    desaCount: 8,
    mahasiswaCount: 190,
    prioritySector: 'Kopi Gayo & Ekonomi Syariah',
    badge: 'Pesisir Barat',
    color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'sumatera-utara',
    name: 'Sumatera Utara',
    capital: 'Medan',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 46,
    desaCount: 10,
    mahasiswaCount: 300,
    prioritySector: 'Agrowisata Toba & Sawit Berkelanjutan',
    badge: 'Kawasan Strategis',
    color: 'from-sky-500/20 to-indigo-600/20 border-sky-500/30 text-sky-600 dark:text-sky-400',
  },
  {
    id: 'sumatera-barat',
    name: 'Sumatera Barat',
    capital: 'Padang',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 24,
    desaCount: 6,
    mahasiswaCount: 150,
    prioritySector: 'Nagari Digital & Kuliner Tradisional',
    color: 'from-amber-500/20 to-yellow-600/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'riau',
    name: 'Riau',
    capital: 'Pekanbaru',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 22,
    desaCount: 5,
    mahasiswaCount: 140,
    prioritySector: 'Restorasi Gambut & Perkebunan Rakyat',
    color: 'from-teal-500/20 to-emerald-600/20 border-teal-500/30 text-teal-600 dark:text-teal-400',
  },
  {
    id: 'kepulauan-riau',
    name: 'Kepulauan Riau',
    capital: 'Tanjung Pinang',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 18,
    desaCount: 4,
    mahasiswaCount: 110,
    prioritySector: 'Konektivitas Pulau & Maritim',
    badge: 'Gugus Pulau',
    color: 'from-blue-500/20 to-cyan-600/20 border-blue-500/30 text-blue-600 dark:text-blue-400',
  },
  {
    id: 'jambi',
    name: 'Jambi',
    capital: 'Jambi',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 16,
    desaCount: 4,
    mahasiswaCount: 100,
    prioritySector: 'Hutan Adat & Agroforestri',
    color: 'from-emerald-500/20 to-green-600/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'sumatera-selatan',
    name: 'Sumatera Selatan',
    capital: 'Palembang',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 32,
    desaCount: 7,
    mahasiswaCount: 200,
    prioritySector: 'Kemandirian Pangan & DAS Musi',
    color: 'from-amber-500/20 to-orange-600/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'kep-bangka-belitung',
    name: 'Bangka Belitung',
    capital: 'Pangkal Pinang',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 12,
    desaCount: 3,
    mahasiswaCount: 80,
    prioritySector: 'Pasca Tambang & Wisata Bahari',
    color: 'from-cyan-500/20 to-teal-600/20 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'bengkulu',
    name: 'Bengkulu',
    capital: 'Bengkulu',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 16,
    desaCount: 3,
    mahasiswaCount: 100,
    prioritySector: 'Mitigasi Bencana Pesisir & Kopi',
    color: 'from-rose-500/20 to-red-600/20 border-rose-500/30 text-rose-600 dark:text-rose-400',
  },
  {
    id: 'lampung',
    name: 'Lampung',
    capital: 'Bandar Lampung',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 24,
    desaCount: 5,
    mahasiswaCount: 150,
    prioritySector: 'Hortikultura & Logistik Selat Sunda',
    badge: 'Gerbang Sumatera',
    color: 'from-indigo-500/20 to-purple-600/20 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
  },

  // 3. KALIMANTAN (90 Pos)
  {
    id: 'kalimantan-barat',
    name: 'Kalimantan Barat',
    capital: 'Pontianak',
    region: 'kalimantan',
    regionLabel: 'Kalimantan',
    posCount: 20,
    desaCount: 5,
    mahasiswaCount: 130,
    prioritySector: 'Pemberdayaan Dayak & Tenun Ikat',
    badge: 'Perbatasan',
    color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'kalimantan-tengah',
    name: 'Kalimantan Tengah',
    capital: 'Palangka Raya',
    region: 'kalimantan',
    regionLabel: 'Kalimantan',
    posCount: 14,
    desaCount: 3,
    mahasiswaCount: 90,
    prioritySector: 'Food Estate & Kerajinan Rotan',
    color: 'from-amber-500/20 to-yellow-600/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'kalimantan-selatan',
    name: 'Kalimantan Selatan',
    capital: 'Banjarmasin',
    region: 'kalimantan',
    regionLabel: 'Kalimantan',
    posCount: 16,
    desaCount: 4,
    mahasiswaCount: 100,
    prioritySector: 'Pasar Terapung & Pertanian Rawa',
    color: 'from-teal-500/20 to-cyan-600/20 border-teal-500/30 text-teal-600 dark:text-teal-400',
  },
  {
    id: 'kalimantan-timur',
    name: 'Kalimantan Timur (IKN)',
    capital: 'Samarinda / Nusantara',
    region: 'kalimantan',
    regionLabel: 'Kalimantan',
    posCount: 30,
    desaCount: 7,
    mahasiswaCount: 190,
    prioritySector: 'Penyangga IKN & Smart Village',
    badge: 'Prioritas IKN',
    color: 'from-emerald-500/20 to-sky-600/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'kalimantan-utara',
    name: 'Kalimantan Utara',
    capital: 'Tanjung Selor',
    region: 'kalimantan',
    regionLabel: 'Kalimantan',
    posCount: 10,
    desaCount: 3,
    mahasiswaCount: 65,
    prioritySector: 'Kawasan Perbatasan & PLTA Hijau',
    color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
  },

  // 4. SULAWESI (160 Pos)
  {
    id: 'sulawesi-utara',
    name: 'Sulawesi Utara',
    capital: 'Manado',
    region: 'sulawesi',
    regionLabel: 'Sulawesi',
    posCount: 20,
    desaCount: 4,
    mahasiswaCount: 120,
    prioritySector: 'Ekowisata Bahari & Olahan Kelapa',
    badge: 'Pesisir Utara',
    color: 'from-sky-500/20 to-blue-600/20 border-sky-500/30 text-sky-600 dark:text-sky-400',
  },
  {
    id: 'gorontalo',
    name: 'Gorontalo',
    capital: 'Gorontalo',
    region: 'sulawesi',
    regionLabel: 'Sulawesi',
    posCount: 14,
    desaCount: 3,
    mahasiswaCount: 90,
    prioritySector: 'Sentra Jagung & Teluk Tomini',
    color: 'from-amber-500/20 to-yellow-600/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'sulawesi-tengah',
    name: 'Sulawesi Tengah',
    capital: 'Palu',
    region: 'sulawesi',
    regionLabel: 'Sulawesi',
    posCount: 24,
    desaCount: 5,
    mahasiswaCount: 150,
    prioritySector: 'Kakao Berkelanjutan & Ketahanan Bencana',
    color: 'from-teal-500/20 to-emerald-600/20 border-teal-500/30 text-teal-600 dark:text-teal-400',
  },
  {
    id: 'sulawesi-barat',
    name: 'Sulawesi Barat',
    capital: 'Mamuju',
    region: 'sulawesi',
    regionLabel: 'Sulawesi',
    posCount: 16,
    desaCount: 3,
    mahasiswaCount: 100,
    prioritySector: 'Sutra Mandar & Kakao Organik',
    color: 'from-rose-500/20 to-pink-600/20 border-rose-500/30 text-rose-600 dark:text-rose-400',
  },
  {
    id: 'sulawesi-selatan',
    name: 'Sulawesi Selatan',
    capital: 'Makassar',
    region: 'sulawesi',
    regionLabel: 'Sulawesi',
    posCount: 58,
    desaCount: 12,
    mahasiswaCount: 360,
    prioritySector: 'Lumbung Beras Timur & Desa Adat Toraja',
    badge: 'Hub Timur',
    color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'sulawesi-tenggara',
    name: 'Sulawesi Tenggara',
    capital: 'Kendari',
    region: 'sulawesi',
    regionLabel: 'Sulawesi',
    posCount: 28,
    desaCount: 6,
    mahasiswaCount: 180,
    prioritySector: 'Wakatobi Maritim & Rumput Laut',
    color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
  },

  // 5. NUSA TENGGARA (130 Pos)
  {
    id: 'nusa-tenggara-barat',
    name: 'Nusa Tenggara Barat',
    capital: 'Mataram',
    region: 'nusra',
    regionLabel: 'Nusa Tenggara',
    posCount: 58,
    desaCount: 12,
    mahasiswaCount: 360,
    prioritySector: 'Mandalika Tourism & Peternakan Sapi',
    badge: 'Pariwisata Halal',
    color: 'from-amber-500/20 to-orange-600/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'nusa-tenggara-timur',
    name: 'Nusa Tenggara Timur',
    capital: 'Kupang',
    region: 'nusra',
    regionLabel: 'Nusa Tenggara',
    posCount: 72,
    desaCount: 15,
    mahasiswaCount: 450,
    prioritySector: 'Inovasi Air Bersih, Tenun Ikat & Labuan Bajo',
    badge: 'Prioritas 3T',
    color: 'from-rose-500/20 to-amber-600/20 border-rose-500/30 text-rose-600 dark:text-rose-400',
  },

  // 6. MALUKU & PAPUA (180 Pos)
  {
    id: 'maluku',
    name: 'Maluku',
    capital: 'Ambon',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 26,
    desaCount: 5,
    mahasiswaCount: 160,
    prioritySector: 'Rempah Pala-Cengkeh & Lumbung Ikan',
    badge: 'Kepulauan Rempah',
    color: 'from-sky-500/20 to-indigo-600/20 border-sky-500/30 text-sky-600 dark:text-sky-400',
  },
  {
    id: 'maluku-utara',
    name: 'Maluku Utara',
    capital: 'Sofifi',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 18,
    desaCount: 4,
    mahasiswaCount: 110,
    prioritySector: 'Pulau Mandiri Energi & Perikanan Tangkap',
    color: 'from-teal-500/20 to-emerald-600/20 border-teal-500/30 text-teal-600 dark:text-teal-400',
  },
  {
    id: 'papua',
    name: 'Papua',
    capital: 'Jayapura',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 38,
    desaCount: 8,
    mahasiswaCount: 240,
    prioritySector: 'Literasi Digital & Kopi Wamena',
    badge: 'Perbatasan Timur',
    color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'papua-barat',
    name: 'Papua Barat',
    capital: 'Manokwari',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 22,
    desaCount: 5,
    mahasiswaCount: 140,
    prioritySector: 'Konservasi Raja Ampat & Pala Fakfak',
    badge: 'Ekowisata Dunia',
    color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'papua-selatan',
    name: 'Papua Selatan',
    capital: 'Merauke',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 20,
    desaCount: 4,
    mahasiswaCount: 130,
    prioritySector: 'Pertanian Terpadu Merauke & Ukir Asmat',
    badge: 'Ujung Timur',
    color: 'from-amber-500/20 to-orange-600/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'papua-tengah',
    name: 'Papua Tengah',
    capital: 'Nabire',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 18,
    desaCount: 4,
    mahasiswaCount: 110,
    prioritySector: 'Kopi Organik & Pemberdayaan Pemuda Adat',
    color: 'from-emerald-500/20 to-green-600/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'papua-pegunungan',
    name: 'Papua Pegunungan',
    capital: 'Wamena',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 18,
    desaCount: 4,
    mahasiswaCount: 110,
    prioritySector: 'Pertanian Lembah Baliem & Sanitasi Sehat',
    color: 'from-teal-500/20 to-emerald-600/20 border-teal-500/30 text-teal-600 dark:text-teal-400',
  },
  {
    id: 'papua-barat-daya',
    name: 'Papua Barat Daya',
    capital: 'Sorong',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 20,
    desaCount: 4,
    mahasiswaCount: 130,
    prioritySector: 'Gerbang Maritim Papua & Konservasi Mangrove',
    badge: 'Gerbang Papua',
    color: 'from-blue-500/20 to-indigo-600/20 border-blue-500/30 text-blue-600 dark:text-blue-400',
  },
];

export const REGION_TABS = [
  { key: 'all', label: 'Semua Wilayah', count: 1280 },
  { key: 'jawa_bali', label: 'Jawa & Bali', count: 610 },
  { key: 'sumatera', label: 'Sumatera', count: 240 },
  { key: 'kalimantan', label: 'Kalimantan', count: 90 },
  { key: 'sulawesi', label: 'Sulawesi', count: 160 },
  { key: 'nusra', label: 'Nusa Tenggara', count: 130 },
  { key: 'maluku_papua', label: 'Maluku & Papua', count: 180 },
];

export const REGION_SUMMARIES: Record<
  string,
  {
    name: string;
    count: number;
    desaCount: number;
    mahasiswaCount: number;
    topSector: string;
    description: string;
  }
> = {
  all: {
    name: 'Seluruh Nusantara (38 Provinsi)',
    count: 1280,
    desaCount: 128,
    mahasiswaCount: 8450,
    topSector: 'Digitalisasi & Pertanian',
    description: '1.280+ pos pengabdian mahasiswa aktif tersebar di Sabang s/d Merauke.',
  },
  jawa_bali: {
    name: 'Jawa & Bali',
    count: 610,
    desaCount: 64,
    mahasiswaCount: 3870,
    topSector: 'Digitalisasi UMKM & Smart Village',
    description: 'Fokus pada akselerasi UMKM desa, kemasan ekspor, dan modernisasi pertanian.',
  },
  sumatera: {
    name: 'Sumatera',
    count: 240,
    desaCount: 28,
    mahasiswaCount: 1620,
    topSector: 'Ketahanan Pangan & Perkebunan',
    description: 'Pemberdayaan komoditas kelapa sawit, kopi rakyat, dan tata kelola desa adat.',
  },
  kalimantan: {
    name: 'Kalimantan',
    count: 90,
    desaCount: 14,
    mahasiswaCount: 610,
    topSector: 'Pemberdayaan Penyangga IKN & Kehutanan',
    description: 'Penyangga Ibu Kota Nusantara dan kelestarian hutan adat Kalimantan.',
  },
  sulawesi: {
    name: 'Sulawesi',
    count: 160,
    desaCount: 19,
    mahasiswaCount: 1040,
    topSector: 'Kemaritiman & Kakao Rakyat',
    description: 'Hilirisasi hasil laut pesisir, perikanan tangkap, dan pariwisata bahari.',
  },
  nusra: {
    name: 'Nusa Tenggara',
    count: 130,
    desaCount: 15,
    mahasiswaCount: 860,
    topSector: 'Ketahanan Air & Ekowisata',
    description: 'Inovasi penampungan air bersih, peternakan terpadu, dan tenun tradisional.',
  },
  maluku_papua: {
    name: 'Maluku & Papua',
    count: 180,
    desaCount: 22,
    mahasiswaCount: 1150,
    topSector: 'Pendidikan & Kesehatan Perbatasan',
    description: 'Penguatan literasi anak pedalaman, posyandu terpencil, dan pangan lokal sagu.',
  },
};

export const ProvinceDistributionCarousel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const activeSummary = useMemo(() => {
    return REGION_SUMMARIES[activeTab] || REGION_SUMMARIES.all;
  }, [activeTab]);

  const filteredProvinces = useMemo(() => {
    if (activeTab === 'all') return PROVINCES_38_DATA;
    return PROVINCES_38_DATA.filter((p) => p.region === activeTab);
  }, [activeTab]);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [filteredProvinces]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -380 : 380;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Region Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {REGION_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                if (scrollRef.current) {
                  scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                }
              }}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 shrink-0 border backdrop-blur-md ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]'
                  : 'bg-white/80 dark:bg-navy-900/80 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-navy-800 hover:bg-white dark:hover:bg-navy-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Active Region Summary Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/90 via-navy-900/95 to-slate-900/90 text-white p-5 sm:p-6 border border-emerald-500/30 shadow-xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-bold text-emerald-300">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{activeSummary.name}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold font-epilogue tracking-tight text-white">
              {activeSummary.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-jakarta leading-relaxed">
              {activeSummary.description}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Stat 1: Pos KKN Terbuka */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-300 block leading-tight">Pos Terbuka</span>
                <span className="text-sm font-extrabold text-white font-epilogue">
                  {activeSummary.count.toLocaleString('id-ID')} Pos KKN
                </span>
              </div>
            </div>

            {/* Stat 2: Desa Binaan */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-300 block leading-tight">Desa Binaan</span>
                <span className="text-sm font-extrabold text-white font-epilogue">
                  {activeSummary.desaCount} Desa
                </span>
              </div>
            </div>

            {/* Stat 3: Sektor Prioritas */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-300 block leading-tight">Sektor Prioritas</span>
                <span className="text-xs font-bold text-amber-300 font-epilogue max-w-[150px] truncate block">
                  {activeSummary.topSector}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Carousel Header & Controls Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Menampilkan <strong className="text-navy-950 dark:text-white font-bold">{filteredProvinces.length}</strong> Provinsi di{' '}
            <strong className="text-primary font-bold">
              {REGION_TABS.find((t) => t.key === activeTab)?.label}
            </strong>
          </span>
        </div>

        {/* Prev / Next Carousel Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              canScrollLeft
                ? 'bg-white dark:bg-navy-900 text-navy-950 dark:text-white border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 shadow-sm'
                : 'bg-slate-100/50 dark:bg-navy-950/40 text-slate-400 dark:text-slate-600 border-slate-200/40 dark:border-navy-800/40 cursor-not-allowed opacity-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              canScrollRight
                ? 'bg-white dark:bg-navy-900 text-navy-950 dark:text-white border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 shadow-sm'
                : 'bg-slate-100/50 dark:bg-navy-950/40 text-slate-400 dark:text-slate-600 border-slate-200/40 dark:border-navy-800/40 cursor-not-allowed opacity-50'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Horizontal Scroll Carousel Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
      >
        {filteredProvinces.map((prov) => (
          <div
            key={prov.id}
            className="w-[290px] sm:w-[320px] lg:w-[340px] shrink-0 snap-start rounded-3xl bg-white/95 dark:bg-navy-900/95 border border-slate-200/90 dark:border-navy-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between space-y-4 backdrop-blur-md group"
          >
            {/* Card Header: Region & Badge */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-navy-800/80 px-2.5 py-1 rounded-lg">
                  {prov.regionLabel}
                </span>
                {prov.badge && (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-2.5 h-2.5" />
                    {prov.badge}
                  </span>
                )}
              </div>

              {/* Province Title & Capital */}
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-navy-950 dark:text-white font-epilogue leading-snug group-hover:text-primary transition-colors">
                  {prov.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-jakarta flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Ibukota: {prov.capital}
                </p>
              </div>

              {/* Key Metric: Pos KKN Terbuka */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-sky-50/50 dark:from-navy-950/80 dark:via-navy-950/60 dark:to-navy-900/80 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    Pos Terbuka
                  </span>
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-epilogue leading-none mt-1">
                    {prov.posCount} <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Pos KKN</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
              </div>

              {/* Secondary Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-navy-800/80">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                    Desa Binaan
                  </span>
                  <span className="text-xs font-extrabold text-navy-950 dark:text-white font-epilogue flex items-center gap-1 mt-0.5">
                    <Home className="w-3 h-3 text-slate-400" />
                    {prov.desaCount} Desa
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-navy-800/80">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                    Kebutuhan Mhs
                  </span>
                  <span className="text-xs font-extrabold text-navy-950 dark:text-white font-epilogue flex items-center gap-1 mt-0.5">
                    <Users className="w-3 h-3 text-slate-400" />
                    {prov.mahasiswaCount} Mhs
                  </span>
                </div>
              </div>

              {/* Priority Sector */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Sektor Prioritas:
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 bg-slate-50 dark:bg-navy-950 px-2.5 py-1.5 rounded-lg border border-slate-200/60 dark:border-navy-800">
                  {prov.prioritySector}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <Link
              href={`/katalog?search=${encodeURIComponent(prov.name)}`}
              className="w-full block pt-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center text-xs font-bold gap-1.5 rounded-xl group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-200"
              >
                <span>Jelajahi Pos KKN</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProvinceDistributionCarousel;
