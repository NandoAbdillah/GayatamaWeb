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
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RegionLogo } from '@/components/ui/RegionLogo';

export interface ProvinceData {
  id: string;
  code: string;
  name: string;
  capital: string;
  region: 'jawa_bali' | 'sumatera' | 'kalimantan' | 'sulawesi' | 'nusra' | 'maluku_papua';
  regionLabel: string;
  posCount: number;
  desaCount: number;
  mahasiswaCount: number;
  prioritySector: string;
  image: string;
  badge?: string;
  color?: string;
}

export const PROVINCES_38_DATA: ProvinceData[] = [
  // 1. JAWA & BALI (610 Pos)
  {
    id: 'dki-jakarta',
    code: '31',
    name: 'DKI Jakarta',
    capital: 'Jakarta Pusat',
    region: 'jawa_bali',
    regionLabel: 'Jawa & Bali',
    posCount: 75,
    desaCount: 14,
    mahasiswaCount: 480,
    prioritySector: 'Smart City & Pemberdayaan Urban',
    image: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=800&auto=format&fit=crop&q=80',
    badge: 'Hub Utama',
  },
  {
    id: 'jawa-barat',
    code: '32',
    name: 'Jawa Barat',
    capital: 'Bandung',
    region: 'jawa_bali',
    regionLabel: 'Jawa & Bali',
    posCount: 140,
    desaCount: 28,
    mahasiswaCount: 890,
    prioritySector: 'Digitalisasi UMKM & Agribisnis',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=80',
    badge: 'Terbanyak',
  },
  {
    id: 'jawa-tengah',
    code: '33',
    name: 'Jawa Tengah',
    capital: 'Semarang',
    region: 'jawa_bali',
    regionLabel: 'Jawa & Bali',
    posCount: 125,
    desaCount: 24,
    mahasiswaCount: 780,
    prioritySector: 'Desa Wisata & Ketahanan Pangan',
    image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=800&auto=format&fit=crop&q=80',
    badge: 'Prioritas',
  },
  {
    id: 'di-yogyakarta',
    code: '34',
    name: 'D.I. Yogyakarta',
    capital: 'Yogyakarta',
    region: 'jawa_bali',
    regionLabel: 'Jawa & Bali',
    posCount: 70,
    desaCount: 16,
    mahasiswaCount: 470,
    prioritySector: 'Ekonomi Kreatif & Budaya Digital',
    image: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=800&auto=format&fit=crop&q=80',
    badge: 'Pusat Edukasi',
  },
  {
    id: 'jawa-timur',
    code: '35',
    name: 'Jawa Timur',
    capital: 'Surabaya',
    region: 'jawa_bali',
    regionLabel: 'Jawa & Bali',
    posCount: 130,
    desaCount: 26,
    mahasiswaCount: 790,
    prioritySector: 'Industri Desa & Modernisasi Pertanian',
    image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&auto=format&fit=crop&q=80',
    badge: 'Sentra Agro',
  },
  {
    id: 'banten',
    code: '36',
    name: 'Banten',
    capital: 'Serang',
    region: 'jawa_bali',
    regionLabel: 'Jawa & Bali',
    posCount: 42,
    desaCount: 10,
    mahasiswaCount: 260,
    prioritySector: 'Pesisir & Pemberdayaan Nelayan',
    image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'bali',
    code: '51',
    name: 'Bali',
    capital: 'Denpasar',
    region: 'jawa_bali',
    regionLabel: 'Jawa & Bali',
    posCount: 28,
    desaCount: 8,
    mahasiswaCount: 180,
    prioritySector: 'Green Tourism & Desa Adat Digital',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    badge: 'Kawasan Global',
  },

  // 2. SUMATERA (240 Pos)
  {
    id: 'aceh',
    code: '11',
    name: 'Aceh',
    capital: 'Banda Aceh',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 30,
    desaCount: 8,
    mahasiswaCount: 190,
    prioritySector: 'Kopi Gayo & Ekonomi Syariah',
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&auto=format&fit=crop&q=80',
    badge: 'Pesisir Barat',
  },
  {
    id: 'sumatera-utara',
    code: '12',
    name: 'Sumatera Utara',
    capital: 'Medan',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 46,
    desaCount: 10,
    mahasiswaCount: 300,
    prioritySector: 'Agrowisata Toba & Sawit Berkelanjutan',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
    badge: 'Kawasan Strategis',
  },
  {
    id: 'sumatera-barat',
    code: '13',
    name: 'Sumatera Barat',
    capital: 'Padang',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 24,
    desaCount: 6,
    mahasiswaCount: 150,
    prioritySector: 'Nagari Digital & Kuliner Tradisional',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'riau',
    code: '14',
    name: 'Riau',
    capital: 'Pekanbaru',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 22,
    desaCount: 5,
    mahasiswaCount: 140,
    prioritySector: 'Restorasi Gambut & Perkebunan Rakyat',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'kepulauan-riau',
    code: '21',
    name: 'Kepulauan Riau',
    capital: 'Tanjung Pinang',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 18,
    desaCount: 4,
    mahasiswaCount: 110,
    prioritySector: 'Konektivitas Pulau & Maritim',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    badge: 'Gugus Pulau',
  },
  {
    id: 'jambi',
    code: '15',
    name: 'Jambi',
    capital: 'Jambi',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 16,
    desaCount: 4,
    mahasiswaCount: 100,
    prioritySector: 'Hutan Adat & Agroforestri',
    image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sumatera-selatan',
    code: '16',
    name: 'Sumatera Selatan',
    capital: 'Palembang',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 32,
    desaCount: 7,
    mahasiswaCount: 200,
    prioritySector: 'Kemandirian Pangan & DAS Musi',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'kep-bangka-belitung',
    code: '19',
    name: 'Bangka Belitung',
    capital: 'Pangkal Pinang',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 12,
    desaCount: 3,
    mahasiswaCount: 80,
    prioritySector: 'Pasca Tambang & Wisata Bahari',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'bengkulu',
    code: '17',
    name: 'Bengkulu',
    capital: 'Bengkulu',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 16,
    desaCount: 3,
    mahasiswaCount: 100,
    prioritySector: 'Mitigasi Bencana Pesisir & Kopi',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'lampung',
    code: '18',
    name: 'Lampung',
    capital: 'Bandar Lampung',
    region: 'sumatera',
    regionLabel: 'Sumatera',
    posCount: 24,
    desaCount: 5,
    mahasiswaCount: 150,
    prioritySector: 'Hortikultura & Logistik Selat Sunda',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
    badge: 'Gerbang Sumatera',
  },

  // 3. KALIMANTAN (90 Pos)
  {
    id: 'kalimantan-barat',
    code: '61',
    name: 'Kalimantan Barat',
    capital: 'Pontianak',
    region: 'kalimantan',
    regionLabel: 'Kalimantan',
    posCount: 20,
    desaCount: 5,
    mahasiswaCount: 130,
    prioritySector: 'Pemberdayaan Dayak & Tenun Ikat',
    image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&auto=format&fit=crop&q=80',
    badge: 'Perbatasan',
  },
  {
    id: 'kalimantan-tengah',
    code: '62',
    name: 'Kalimantan Tengah',
    capital: 'Palangka Raya',
    region: 'kalimantan',
    regionLabel: 'Kalimantan',
    posCount: 14,
    desaCount: 3,
    mahasiswaCount: 90,
    prioritySector: 'Food Estate & Kerajinan Rotan',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'kalimantan-selatan',
    code: '63',
    name: 'Kalimantan Selatan',
    capital: 'Banjarmasin',
    region: 'kalimantan',
    regionLabel: 'Kalimantan',
    posCount: 16,
    desaCount: 4,
    mahasiswaCount: 100,
    prioritySector: 'Pasar Terapung & Pertanian Rawa',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'kalimantan-timur',
    code: '64',
    name: 'Kalimantan Timur (IKN)',
    capital: 'Samarinda / Nusantara',
    region: 'kalimantan',
    regionLabel: 'Kalimantan',
    posCount: 30,
    desaCount: 7,
    mahasiswaCount: 190,
    prioritySector: 'Penyangga IKN & Smart Village',
    image: 'https://images.unsplash.com/photo-1606444717545-7f5d882031cb?w=800&auto=format&fit=crop&q=80',
    badge: 'Prioritas IKN',
  },
  {
    id: 'kalimantan-utara',
    code: '65',
    name: 'Kalimantan Utara',
    capital: 'Tanjung Selor',
    region: 'kalimantan',
    regionLabel: 'Kalimantan',
    posCount: 10,
    desaCount: 3,
    mahasiswaCount: 65,
    prioritySector: 'Kawasan Perbatasan & PLTA Hijau',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
  },

  // 4. SULAWESI (160 Pos)
  {
    id: 'sulawesi-utara',
    code: '71',
    name: 'Sulawesi Utara',
    capital: 'Manado',
    region: 'sulawesi',
    regionLabel: 'Sulawesi',
    posCount: 20,
    desaCount: 4,
    mahasiswaCount: 120,
    prioritySector: 'Ekowisata Bahari & Olahan Kelapa',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    badge: 'Pesisir Utara',
  },
  {
    id: 'gorontalo',
    code: '75',
    name: 'Gorontalo',
    capital: 'Gorontalo',
    region: 'sulawesi',
    regionLabel: 'Sulawesi',
    posCount: 14,
    desaCount: 3,
    mahasiswaCount: 90,
    prioritySector: 'Sentra Jagung & Teluk Tomini',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sulawesi-tengah',
    code: '72',
    name: 'Sulawesi Tengah',
    capital: 'Palu',
    region: 'sulawesi',
    regionLabel: 'Sulawesi',
    posCount: 24,
    desaCount: 5,
    mahasiswaCount: 150,
    prioritySector: 'Kakao Berkelanjutan & Ketahanan Bencana',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sulawesi-barat',
    code: '76',
    name: 'Sulawesi Barat',
    capital: 'Mamuju',
    region: 'sulawesi',
    regionLabel: 'Sulawesi',
    posCount: 16,
    desaCount: 3,
    mahasiswaCount: 100,
    prioritySector: 'Sutra Mandar & Kakao Organik',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sulawesi-selatan',
    code: '73',
    name: 'Sulawesi Selatan',
    capital: 'Makassar',
    region: 'sulawesi',
    regionLabel: 'Sulawesi',
    posCount: 58,
    desaCount: 12,
    mahasiswaCount: 360,
    prioritySector: 'Lumbung Beras Timur & Desa Adat Toraja',
    image: 'https://images.unsplash.com/photo-1582426007790-f5a2e2392dd3?w=800&auto=format&fit=crop&q=80',
    badge: 'Hub Timur',
  },
  {
    id: 'sulawesi-tenggara',
    code: '74',
    name: 'Sulawesi Tenggara',
    capital: 'Kendari',
    region: 'sulawesi',
    regionLabel: 'Sulawesi',
    posCount: 28,
    desaCount: 6,
    mahasiswaCount: 180,
    prioritySector: 'Wakatobi Maritim & Rumput Laut',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
  },

  // 5. NUSA TENGGARA (130 Pos)
  {
    id: 'nusa-tenggara-barat',
    code: '52',
    name: 'Nusa Tenggara Barat',
    capital: 'Mataram',
    region: 'nusra',
    regionLabel: 'Nusa Tenggara',
    posCount: 58,
    desaCount: 12,
    mahasiswaCount: 360,
    prioritySector: 'Mandalika Tourism & Peternakan Sapi',
    image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&auto=format&fit=crop&q=80',
    badge: 'Pariwisata Halal',
  },
  {
    id: 'nusa-tenggara-timur',
    code: '53',
    name: 'Nusa Tenggara Timur',
    capital: 'Kupang',
    region: 'nusra',
    regionLabel: 'Nusa Tenggara',
    posCount: 72,
    desaCount: 15,
    mahasiswaCount: 450,
    prioritySector: 'Inovasi Air Bersih, Tenun Ikat & Labuan Bajo',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop&q=80',
    badge: 'Prioritas 3T',
  },

  // 6. MALUKU & PAPUA (180 Pos)
  {
    id: 'maluku',
    code: '81',
    name: 'Maluku',
    capital: 'Ambon',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 26,
    desaCount: 5,
    mahasiswaCount: 160,
    prioritySector: 'Rempah Pala-Cengkeh & Lumbung Ikan',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    badge: 'Kepulauan Rempah',
  },
  {
    id: 'maluku-utara',
    code: '82',
    name: 'Maluku Utara',
    capital: 'Sofifi',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 18,
    desaCount: 4,
    mahasiswaCount: 110,
    prioritySector: 'Pulau Mandiri Energi & Perikanan Tangkap',
    image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'papua',
    code: '91',
    name: 'Papua',
    capital: 'Jayapura',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 38,
    desaCount: 8,
    mahasiswaCount: 240,
    prioritySector: 'Literasi Digital & Kopi Wamena',
    image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop&q=80',
    badge: 'Perbatasan Timur',
  },
  {
    id: 'papua-barat',
    code: '92',
    name: 'Papua Barat',
    capital: 'Manokwari',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 22,
    desaCount: 5,
    mahasiswaCount: 140,
    prioritySector: 'Konservasi Raja Ampat & Pala Fakfak',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    badge: 'Ekowisata Dunia',
  },
  {
    id: 'papua-selatan',
    code: '93',
    name: 'Papua Selatan',
    capital: 'Merauke',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 20,
    desaCount: 4,
    mahasiswaCount: 130,
    prioritySector: 'Pertanian Terpadu Merauke & Ukir Asmat',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
    badge: 'Ujung Timur',
  },
  {
    id: 'papua-tengah',
    code: '94',
    name: 'Papua Tengah',
    capital: 'Nabire',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 18,
    desaCount: 4,
    mahasiswaCount: 110,
    prioritySector: 'Kopi Organik & Pemberdayaan Pemuda Adat',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'papua-pegunungan',
    code: '95',
    name: 'Papua Pegunungan',
    capital: 'Wamena',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 18,
    desaCount: 4,
    mahasiswaCount: 110,
    prioritySector: 'Pertanian Lembah Baliem & Sanitasi Sehat',
    image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'papua-barat-daya',
    code: '96',
    name: 'Papua Barat Daya',
    capital: 'Sorong',
    region: 'maluku_papua',
    regionLabel: 'Maluku & Papua',
    posCount: 20,
    desaCount: 4,
    mahasiswaCount: 130,
    prioritySector: 'Gerbang Maritim Papua & Konservasi Mangrove',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    badge: 'Gerbang Papua',
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

// Animated Number Counter Component (Supports counting up and down smoothly)
function AnimatedCounter({
  value,
  duration = 550,
  suffix = '',
  className = '',
}: {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isChanging, setIsChanging] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    prevValueRef.current = value;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    setDirection(endValue > startValue ? 'up' : 'down');
    setIsChanging(true);

    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * ease);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplayValue(endValue);
        setTimeout(() => setIsChanging(false), 120);
      }
    };

    const animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  return (
    <span
      className={`inline-flex items-center transition-all duration-200 ${
        isChanging
          ? direction === 'up'
            ? 'scale-105 text-emerald-600 dark:text-emerald-400 font-black'
            : 'scale-95 text-sky-600 dark:text-sky-400 font-black'
          : ''
      } ${className}`}
    >
      {displayValue.toLocaleString('id-ID')}
      {suffix}
    </span>
  );
}

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
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 shrink-0 border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20 scale-[1.02]'
                  : 'bg-white/95 dark:bg-navy-900/95 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800'
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

      {/* 2. Active Region Summary Card (Theme-Aligned, Elegant, Animated Numbers) */}
      <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-navy-900/95 p-5 sm:p-6 border border-slate-200/90 dark:border-navy-700/80 shadow-lg shadow-slate-100/80 dark:shadow-none transition-all">
        {/* Subtle Decorative Background Accents */}
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{activeSummary.name}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold font-epilogue tracking-tight text-navy-950 dark:text-white">
              {activeSummary.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-jakarta leading-relaxed">
              {activeSummary.description}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Stat 1: Pos KKN Terbuka */}
            <div className="px-4 py-3 rounded-2xl bg-slate-50/90 dark:bg-navy-950/80 border border-slate-200/80 dark:border-navy-800 flex items-center gap-3 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block leading-tight">
                  Pos Terbuka
                </span>
                <span className="text-sm sm:base font-black text-navy-950 dark:text-white font-epilogue flex items-center gap-1">
                  <AnimatedCounter value={activeSummary.count} />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pos KKN</span>
                </span>
              </div>
            </div>

            {/* Stat 2: Desa Binaan */}
            <div className="px-4 py-3 rounded-2xl bg-slate-50/90 dark:bg-navy-950/80 border border-slate-200/80 dark:border-navy-800 flex items-center gap-3 shadow-xs hover:border-sky-300 dark:hover:border-sky-700 transition-all">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/80 border border-sky-200/80 dark:border-sky-800/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shrink-0">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block leading-tight">
                  Desa Binaan
                </span>
                <span className="text-sm sm:text-base font-black text-navy-950 dark:text-white font-epilogue flex items-center gap-1">
                  <AnimatedCounter value={activeSummary.desaCount} />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Desa</span>
                </span>
              </div>
            </div>

            {/* Stat 3: Sektor Prioritas */}
            <div className="px-4 py-3 rounded-2xl bg-slate-50/90 dark:bg-navy-950/80 border border-slate-200/80 dark:border-navy-800 flex items-center gap-3 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition-all">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200/80 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block leading-tight">
                  Sektor Prioritas
                </span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 font-epilogue max-w-[150px] truncate block mt-0.5">
                  {activeSummary.topSector}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Carousel Header & Controls Bar */}
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

      {/* 4. Horizontal Scroll Carousel: PICTURE-BASED CARDS (Matching Reference Image #2) */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto pt-4 pb-8 px-2 sm:px-3 scroll-smooth snap-x snap-mandatory scrollbar-none [contain:paint]"
      >
        {filteredProvinces.map((prov) => (
          <div
            key={prov.id}
            className="w-[290px] sm:w-[320px] lg:w-[340px] aspect-[10/14.5] shrink-0 snap-start rounded-[32px] overflow-hidden relative border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between p-4 sm:p-5 select-none bg-slate-900"
          >
            {/* 1. Full Cover Background Image */}
            <img
              src={prov.image}
              alt={prov.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80';
              }}
            />
            {/* Smooth Vignette & Gradient Overlay (Ensures crystal clear text legibility at bottom) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/25 pointer-events-none" />

            {/* 2. Top Bar: Official Provincial Emblem (Top-Left, Large, Elevated Shadow, No Background) + Region Tag & Badge (Top-Right) */}
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] hover:scale-110 transition-transform duration-300 shrink-0">
                <RegionLogo code={prov.code} name={prov.name} size="lg" showBadge={false} />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-end pt-1">
                <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-black/60 text-white border border-white/20 shadow-md">
                  {prov.regionLabel}
                </span>
                {prov.badge && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-600/95 text-white shadow-md flex items-center gap-1 border border-emerald-400/40">
                    <Sparkles className="w-2.5 h-2.5" />
                    {prov.badge}
                  </span>
                )}
              </div>
            </div>

            {/* 3. Bottom Content Info Container (Clean, Legible & Non-Obscured) */}
            <div className="relative z-10 space-y-2.5">
              {/* Province Name & Capital */}
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-epilogue leading-tight drop-shadow-md group-hover:text-emerald-300 transition-colors">
                  {prov.name}
                </h3>
                <p className="text-xs text-white/85 font-jakarta flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Ibukota: {prov.capital}</span>
                </p>
              </div>

              {/* 3 Key Stats Badges Row (Using Lucide Icons instead of Emojis) */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-950/80 text-emerald-200 border border-emerald-500/50 shadow-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-300 shrink-0" />
                  <span>{prov.posCount} Pos KKN</span>
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-sky-950/80 text-sky-200 border border-sky-500/50 shadow-xs flex items-center gap-1">
                  <Home className="w-3 h-3 text-sky-300 shrink-0" />
                  <span>{prov.desaCount} Desa</span>
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-slate-900/80 text-white/95 border border-white/30 shadow-xs flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-200 shrink-0" />
                  <span>{prov.mahasiswaCount} Mhs</span>
                </span>
              </div>

              {/* Priority Sector Description Snippet (Using Lucide Icon instead of Emoji) */}
              <div className="text-xs text-white/95 line-clamp-1 bg-black/70 px-3 py-1.5 rounded-xl border border-white/15 font-jakarta leading-relaxed flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="truncate">
                  <strong className="text-white font-bold">Sektor:</strong> {prov.prioritySector}
                </span>
              </div>

              {/* Bottom Action Footer Row (matching Reference Image #2) */}
              <div className="pt-1.5 flex items-center justify-between gap-2 border-t border-white/15">
                <div className="flex items-center gap-1.5 text-[11px] text-white/85 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>45 Hari KKN</span>
                </div>

                <Link
                  href={`/katalog?search=${encodeURIComponent(prov.name)}`}
                  className="shrink-0"
                >
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-full bg-white text-navy-950 font-bold text-xs hover:bg-emerald-400 hover:text-white transition-all shadow-lg flex items-center gap-1.5 group/btn"
                  >
                    <span>Read more</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProvinceDistributionCarousel;
