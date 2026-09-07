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
  TrendingUp,
  Award,
  Users,
  Building,
  Sprout,
  HeartPulse,
  Laptop,
  ShoppingBag,
  FileCheck2,
  CheckCircle2,
  Calendar,
  Compass,
} from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = [
    { name: 'Semua', icon: Sparkles, count: 24 },
    { name: 'Digitalisasi & Teknologi', icon: Laptop, count: 8 },
    { name: 'Agrikultur & Pangan', icon: Sprout, count: 6 },
    { name: 'Kesehatan & Sanitasi', icon: HeartPulse, count: 5 },
    { name: 'Pemberdayaan UMKM', icon: ShoppingBag, count: 5 },
  ];

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col selection:bg-primary-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-primary-100/60 via-surface-subtle/30 to-transparent blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-secondary-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/4 -right-32 w-80 h-80 bg-tertiary-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-primary-200/80 shadow-ambient-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary-900 font-jakarta">
              Platform KKN Tematik Terintegrasi No. 1 Indonesia
            </span>
          </div>

          {/* Headline with Epilogue Font */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-950 font-epilogue tracking-tight leading-[1.15]">
            Membangun Desa, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary to-emerald-600">
              Mengabdi dengan Karya Nyata.
            </span>
          </h1>

          {/* Subtitle with Plus Jakarta Sans */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-jakarta leading-relaxed">
            Menghubungkan mahasiswa perguruan tinggi dengan ribuan pos kebutuhan desa di seluruh nusantara.
            Transparan, terukur, dan berdampak langsung bagi kemandirian warga.
          </p>

          {/* Floating Pill Search Bar Island (from Stitch) */}
          <div className="max-w-3xl mx-auto pt-4">
            <div className="bg-white/95 backdrop-blur-xl p-2.5 sm:p-3 rounded-full border border-primary-200 shadow-ambient-lg flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-3 px-4 flex-1 w-full">
                <Search className="w-5 h-5 text-primary shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari desa, kabupaten, program kerja, atau keahlian..."
                  className="w-full bg-transparent text-sm text-navy-950 placeholder-slate-400 focus:outline-none font-jakarta"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link href="/maps" className="hidden md:flex">
                  <Button variant="secondary" size="md" className="gap-1.5 text-xs whitespace-nowrap">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Peta Radius</span>
                  </Button>
                </Link>
                <Link href={`/search?q=${encodeURIComponent(searchQuery)}`} className="w-full sm:w-auto">
                  <Button variant="primary" size="md" className="w-full gap-2 shadow-glow-primary">
                    <span>Temukan Pos KKN</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick popular tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-500 font-medium">
              <span className="font-semibold text-navy-800">Populer:</span>
              {['Digitalisasi UMKM', 'Irigasi Cerdas', 'Stunting Posyandu', 'Agrowisata', 'Energi Surya'].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1 rounded-full bg-white/80 hover:bg-primary-50 hover:text-primary-700 border border-slate-200/80 transition-colors shadow-sm"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Live Metrics Showcase */}
        <div className="max-w-6xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Desa Terdaftar & Aktif', val: '1,420+', icon: Building, color: 'text-primary' },
            { label: 'Mahasiswa Berkontribusi', val: '18,500+', icon: Users, color: 'text-emerald-600' },
            { label: 'Program Kerja Terlaksana', val: '3,890+', icon: FileCheck2, color: 'text-amber-600' },
            { label: 'Indeks Kepuasan Mitra Desa', val: '98.4%', icon: Award, color: 'text-indigo-600' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="p-5 text-center bg-white/90 border-slate-200/80 hoverEffect">
                <div className="inline-flex p-3 rounded-2xl bg-surface-subtle mb-3">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-epilogue">{stat.val}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Featured Pos Kebutuhan Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Pos Kebutuhan Terverifikasi
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-epilogue">
                Peluang Pengabdian KKN Siap Dilamar
              </h2>
              <p className="text-sm text-slate-500 font-jakarta mt-1">
                Kebutuhan riil dari pemerintah desa yang telah terverifikasi oleh LPPM
              </p>
            </div>

            <Link href="/search">
              <Button variant="outline" size="sm" className="gap-1.5">
                <span>Lihat Semua 240+ Pos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Sektor Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-canvas text-navy-700 hover:bg-surface-subtle border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_POS_KEBUTUHAN.map((pos) => (
              <Card key={pos.id} hoverEffect className="p-6 flex flex-col justify-between border-slate-200">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <StatusBadge status={pos.status} size="sm" />
                    {pos.matching_score && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        {pos.matching_score}% Cocok
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-primary-700 tracking-wide uppercase">
                      {pos.kategori_sektor}
                    </span>
                    <h3 className="text-base font-bold text-navy-950 font-epilogue mt-1 line-clamp-2 leading-snug">
                      {pos.judul}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 font-jakarta line-clamp-3 leading-relaxed">
                    {pos.deskripsi}
                  </p>

                  <div className="pt-2 flex items-center gap-4 text-xs text-slate-500 font-medium border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>
                        {pos.nama_desa}, {pos.kabupaten}
                      </span>
                    </div>
                    {pos.distance_km && (
                      <div className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {pos.distance_km} km
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400">Kuota: </span>
                    <span className="font-bold text-navy-900">
                      {pos.terisi_mahasiswa}/{pos.kuota_mahasiswa} Mahasiswa
                    </span>
                  </div>

                  <Link href={`/search/${pos.id}`}>
                    <Button size="sm" variant="primary">
                      Detail Program
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Step Collaborative Workflow */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Alur Kerja Terstandarisasi
          </span>
          <h2 className="text-3xl font-extrabold text-navy-950 font-epilogue">
            Bagaimana Ekosistem KKN Terintegrasi
          </h2>
          <p className="text-sm text-slate-600">
            Kolaborasi mulus dari penyerapan aspirasi warga hingga penerbitan Berita Acara Serah Terima (BAST)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Aspirasi & Pos Desa',
              desc: 'Masyarakat dan Perangkat Desa mengajukan kebutuhan riil wilayah yang otomatis dikonversi menjadi pos KKN.',
              icon: Building,
              color: 'bg-primary-50 text-primary border-primary-200',
            },
            {
              step: '02',
              title: 'Proposal & Tim Mahasiswa',
              desc: 'Kelompok mahasiswa lintas disiplin melamar pos kebutuhan dengan menyusun rencana kerja terukur.',
              icon: Users,
              color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            },
            {
              step: '03',
              title: 'Bimbingan & Logbook DPL',
              desc: 'Dosen Pembimbing memverifikasi progres mingguan, memberikan catatan revisi real-time di lapangan.',
              icon: HeartPulse,
              color: 'bg-amber-50 text-amber-700 border-amber-200',
            },
            {
              step: '04',
              title: 'BAST & Konversi SKS',
              desc: 'Kepala Desa mengesahkan luaran akhir melalui BAST digital, LPPM mengonversi nilai ke SKS akademik.',
              icon: Award,
              color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="p-6 relative bg-white border-slate-200/90 shadow-ambient">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-epilogue font-extrabold text-2xl text-slate-300">
                    {item.step}
                  </span>
                  <div className={`p-2.5 rounded-2xl border ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-navy-950 font-epilogue mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-jakarta">{item.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-primary-900 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-epilogue tracking-tight leading-tight">
              Siap Menjalankan Pengabdian Nyata di Desa?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-jakarta leading-relaxed">
              Daftarkan diri Anda atau kelompok sekarang, jelajahi ribuan pos kebutuhan desa, dan jadilah
              agen perubahan nyata bagi Indonesia.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button size="lg" variant="primary" className="bg-primary text-white shadow-glow-primary">
                  Daftar KKN Sekarang
                </Button>
              </Link>
              <Link href="/aspirasi">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Kirim Aspirasi Desa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
