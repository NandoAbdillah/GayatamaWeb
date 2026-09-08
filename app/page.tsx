'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MOCK_POS_KEBUTUHAN } from '@/lib/mock-data';
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
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('Semua');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchJurusan, setSearchJurusan] = useState('');

  const exploreRegions = [
    {
      name: 'Jawa Barat & Banten',
      desc: '480 Pos Kebutuhan',
      img: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=300&auto=format&fit=crop&q=80',
    },
    {
      name: 'Jawa Tengah & DIY',
      desc: '320 Pos Kebutuhan',
      img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sumatera',
      desc: '240 Pos Kebutuhan',
      img: 'https://images.unsplash.com/photo-1609137144822-0a18e97f6c77?w=300&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sulawesi & Maluku',
      desc: '160 Pos Kebutuhan',
      img: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=300&auto=format&fit=crop&q=80',
    },
    {
      name: 'Bali & Nusa Tenggara',
      desc: '130 Pos Kebutuhan',
      img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&auto=format&fit=crop&q=80',
    },
    {
      name: 'Kalimantan',
      desc: '90 Pos Kebutuhan',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-jakarta transition-colors duration-200">
      <Navbar />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Clean, Minimalist & Centered on Screen) */}
      {/* ========================================================================= */}
      <section className="relative min-h-[calc(100vh-4.5rem)] flex flex-col justify-center items-center py-12 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-surface-canvas dark:bg-[#071629] border-b border-slate-200/80 dark:border-navy-800 transition-colors duration-200">
        {/* Subtle Ambient Radial Glow (Clean, Non-Intrusive) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[400px] sm:h-[500px] bg-gradient-to-tr from-primary/8 via-emerald-500/6 to-sky-400/8 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative max-w-5xl w-full mx-auto text-center space-y-6 sm:space-y-7 my-auto">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-xs text-xs font-semibold text-navy-900 dark:text-slate-200 font-jakarta">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pendaftaran KKN Tematik Semester Ganjil 2026/2027 Dibuka</span>
          </div>

          {/* Big Authoritative Headline with Epilogue Font */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-950 dark:text-white font-epilogue tracking-tight leading-[1.12]">
            Membangun Desa, <br />
            <span className="text-primary-600 dark:text-primary-400">Mengabdi</span> dengan{' '}
            <span className="text-secondary-600 dark:text-secondary-400">Karya Nyata.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-300 font-jakarta leading-relaxed">
            Platform terpadu yang menghubungkan mahasiswa perguruan tinggi dengan ribuan pos kebutuhan riil
            pemerintah desa di seluruh Indonesia secara transparan dan terukur.
          </p>

          {/* ========================================================================= */}
          {/* SEARCH CARD (Clean multi-input card) */}
          {/* ========================================================================= */}
          <div className="max-w-4xl mx-auto pt-2 sm:pt-4 text-left">
            <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-navy-800 shadow-xl p-3.5 sm:p-5 space-y-4">
              {/* Category selector tabs */}
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100 dark:border-navy-800">
                {[
                  { label: 'Semua Pos', icon: Globe2 },
                  { label: 'Agrikultur & Pangan', icon: Sprout },
                  { label: 'Digitalisasi UMKM', icon: Laptop },
                  { label: 'Kesehatan Posyandu', icon: HeartPulse },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.label;
                  return (
                    <button
                      key={tab.label}
                      onClick={() => setActiveTab(tab.label)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-navy-900 dark:bg-primary text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Wilayah / Lokasi */}
                <div className="sm:col-span-5 bg-slate-50 dark:bg-navy-950 hover:bg-slate-100/80 dark:hover:bg-navy-950/80 p-3 rounded-xl border border-slate-200/80 dark:border-navy-800 transition-colors">
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Lokasi Wilayah
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="Cari desa, kecamatan, kabupaten..."
                      className="w-full bg-transparent text-xs font-semibold text-navy-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Minat Jurusan / Keahlian */}
                <div className="sm:col-span-4 bg-slate-50 dark:bg-navy-950 hover:bg-slate-100/80 dark:hover:bg-navy-950/80 p-3 rounded-xl border border-slate-200/80 dark:border-navy-800 transition-colors">
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Keahlian / Jurusan
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <input
                      type="text"
                      value={searchJurusan}
                      onChange={(e) => setSearchJurusan(e.target.value)}
                      placeholder="Teknik, Agribisnis, Gizi, DKV..."
                      className="w-full bg-transparent text-xs font-semibold text-navy-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Tombol Cari */}
                <div className="sm:col-span-3">
                  <Link
                    href={`/search?q=${encodeURIComponent(searchLocation || searchJurusan)}`}
                    className="block"
                  >
                    <Button
                      size="lg"
                      variant="primary"
                      className="w-full h-12 rounded-xl text-xs font-bold gap-2 shadow-sm"
                    >
                      <Search className="w-4 h-4" />
                      <span>Cari Pos KKN</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. REAL INDONESIA PHOTOGRAPHIC SHOWCASE */}
      {/* ========================================================================= */}
      <section className="pt-24 sm:pt-32 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Dokumentasi Aksi Lapangan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Sinergi Nyata Mahasiswa & Warga Desa
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-jakarta">
              Dari modernisasi irigasi pertanian hingga penguatan UMKM lokal, KKN hadir menjawab tantangan riil desa.
            </p>
          </div>

          <Link href="/portofolio/kelompok-14-sukamaju">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5">
              <span>Lihat Dokumentasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Real Authentic Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
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
              <div className="h-48 overflow-hidden relative">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
            { num: '1,420+', label: 'Desa Terdaftar & Aktif', icon: Building, color: 'text-primary-600 dark:text-primary-400' },
            { num: '18,500+', label: 'Mahasiswa Berkontribusi', icon: Users, color: 'text-secondary-600 dark:text-secondary-400' },
            { num: '3,890+', label: 'Program Selesai & BAST', icon: FileCheck2, color: 'text-tertiary-600 dark:text-tertiary-400' },
            { num: '98.4%', label: 'Kepuasan Pemerintah Desa', icon: Award, color: 'text-indigo-600 dark:text-indigo-400' },
          ].map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 space-y-2">
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
      <section className="py-14 bg-surface-sand dark:bg-navy-950 border-y border-slate-200 dark:border-navy-800 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-8 text-center">
          <div className="space-y-1 max-w-xl mx-auto">
            <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
              Sebaran Geografis KKN
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Jelajahi Pengabdian di Seluruh Nusantara
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {exploreRegions.map((reg, idx) => (
              <Link
                key={idx}
                href={`/search?q=${encodeURIComponent(reg.name)}`}
                className="group flex flex-col items-center space-y-2.5 p-3 rounded-2xl hover:bg-white dark:hover:bg-navy-900 transition-all duration-150 border border-transparent hover:border-slate-200 dark:hover:border-navy-800 hover:shadow-card"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white dark:border-navy-700 shadow-card group-hover:scale-105 transition-transform duration-200">
                  <img src={reg.img} alt={reg.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-950 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {reg.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{reg.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DEEP NAVY ORGANIC SECTION (Gaya Trippin': Dark Organic Wave Container) */}
      {/* ========================================================================= */}
      <section className="bg-navy-950 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-14 relative z-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
              Arsitektur Terpadu
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-epilogue leading-snug">
              Teknologi Tepat Guna untuk Tata Kelola KKN yang Transparan
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-jakarta">
              Setiap tahapan pengabdian terekam secara digital, mulai dari perumusan kebutuhan warga hingga
              pengesahan Berita Acara Serah Terima resmi (BAST).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Aspirasi & Pos Kebutuhan',
                desc: 'Masyarakat mengajukan usulan fasilitas desa secara terbuka yang divalidasi oleh Kepala Desa.',
                icon: Building,
                badge: 'Desa Mandiri',
              },
              {
                step: '02',
                title: 'Smart-Matching & Tim',
                desc: 'Pencocokan kompetensi lintas disiplin mahasiswa dengan kebutuhan nyata di lapangan.',
                icon: Sparkles,
                badge: 'Multidisiplin',
              },
              {
                step: '03',
                title: 'Logbook & Bimbingan DPL',
                desc: 'Verifikasi jam kerja harian dan revisi catatan lapangan langsung dari Dosen Pembimbing.',
                icon: HeartPulse,
                badge: 'Validasi Real-time',
              },
              {
                step: '04',
                title: 'BAST & Konversi SKS',
                desc: 'Penandatanganan Berita Acara Serah Terima digital dan konversi nilai ke 2-4 SKS kurikulum.',
                icon: Award,
                badge: 'Sah & Legal',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary-400">{item.step}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-navy-950 px-2 py-0.5 rounded-md border border-slate-800">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-epilogue text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. POS KEBUTUHAN PILIHAN SIAP DILAMAR */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
              Peluang Pengabdian Terverifikasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Pos Kebutuhan Siap Dilamar Mahasiswa
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Pilih program pengabdian yang telah disahkan oleh perangkat desa dan tim LPPM.
            </p>
          </div>

          <Link href="/search">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5">
              <span>Buka Katalog Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_POS_KEBUTUHAN.map((pos) => (
            <Card key={pos.id} hoverEffect className="overflow-hidden flex flex-col justify-between border-slate-200 dark:border-navy-800">
              <div className="space-y-3">
                {/* Photo Thumbnail */}
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={
                      pos.id === 1
                        ? 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80'
                        : pos.id === 2
                        ? 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80'
                        : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80'
                    }
                    alt={pos.judul}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={pos.status} size="sm" />
                  </div>
                  {pos.matching_score && (
                    <div className="absolute top-3 right-3 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                      {pos.matching_score}% Cocok
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
                  <span className="text-slate-400 dark:text-slate-500">Kuota: </span>
                  <strong className="text-navy-950 dark:text-slate-200">
                    {pos.terisi_mahasiswa}/{pos.kuota_mahasiswa} Mahasiswa
                  </strong>
                </div>

                <Link href={`/search/${pos.id}`}>
                  <Button size="sm" variant="primary" className="text-xs font-semibold">
                    Detail Pos
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
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto rounded-3xl bg-navy-900 dark:bg-navy-900/90 text-white p-8 sm:p-12 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-epilogue">
              Siap Mendedikasikan Ilmu untuk Kemajuan Desa?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-jakarta leading-relaxed">
              Bergabunglah bersama ribuan mahasiswa dan dosen pembimbing dalam memajukan desa-desa di Indonesia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/register">
              <Button size="lg" variant="primary" className="font-bold text-xs sm:text-sm">
                Daftar KKN Sekarang
              </Button>
            </Link>
            <Link href="/aspirasi">
              <Button size="lg" variant="outline" className="border-slate-600 text-navy-950 dark:text-white bg-white dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-700 font-bold text-xs sm:text-sm">
                Kirim Aspirasi Desa
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
