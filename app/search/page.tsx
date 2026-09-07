'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MOCK_POS_KEBUTUHAN } from '@/lib/mock-data';
import { PosKebutuhan } from '@/lib/types';
import {
  Search,
  Filter,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Building,
  SlidersHorizontal,
} from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('Semua');
  const [maxDistance, setMaxDistance] = useState<number>(50);

  const filteredItems = MOCK_POS_KEBUTUHAN.filter((item) => {
    const matchesQuery =
      item.judul.toLowerCase().includes(query.toLowerCase()) ||
      item.nama_desa.toLowerCase().includes(query.toLowerCase()) ||
      item.kabupaten.toLowerCase().includes(query.toLowerCase()) ||
      item.kriteria_jurusan.some((j) => j.toLowerCase().includes(query.toLowerCase()));

    const matchesSector =
      selectedSector === 'Semua' || item.kategori_sektor.includes(selectedSector);

    const matchesDistance = !item.distance_km || item.distance_km <= maxDistance;

    return matchesQuery && matchesSector && matchesDistance;
  });

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Search className="w-3.5 h-3.5" /> Eksplorasi Program Pengabdian
          </div>
          <h1 className="text-3xl font-extrabold text-navy-950 font-epilogue">
            Katalog Pos Kebutuhan KKN Desa
          </h1>
          <p className="text-sm text-slate-500 font-jakarta">
            Cari program kerja KKN yang relevan dengan latar belakang keilmuan dan minat pengabdian kelompok Anda.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-ambient space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kata kunci desa, tema, atau jurusan..."
                className="w-full pl-11 pr-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-xs font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Semua">Semua Sektor</option>
                <option value="Digitalisasi">Digitalisasi & Teknologi</option>
                <option value="Agrikultur">Agrikultur & Ketahanan Pangan</option>
                <option value="Kesehatan">Kesehatan & Sanitasi</option>
                <option value="UMKM">Pemberdayaan UMKM</option>
              </select>

              <Link href="/maps">
                <Button variant="secondary" size="md" className="gap-1.5 text-xs whitespace-nowrap">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Peta</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Distance Filter Slider */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-navy-900">Maksimal Radius Jarak Kampus:</span>
              <input
                type="range"
                min="5"
                max="100"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="accent-primary w-36"
              />
              <span className="font-bold text-primary px-2 py-0.5 rounded-md bg-primary-50">
                {maxDistance} km
              </span>
            </div>

            <div className="text-slate-500">
              Menampilkan <span className="font-bold text-navy-900">{filteredItems.length}</span> pos kebutuhan
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((pos) => (
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
                  <span className="text-xs font-bold text-primary-700 uppercase tracking-wide">
                    {pos.kategori_sektor}
                  </span>
                  <h3 className="text-base font-bold text-navy-950 font-epilogue mt-1 line-clamp-2">
                    {pos.judul}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 font-jakarta line-clamp-3 leading-relaxed">
                  {pos.deskripsi}
                </p>

                <div className="pt-2 space-y-1.5 border-t border-slate-100">
                  <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {pos.nama_desa}, {pos.kabupaten}
                    </span>
                    {pos.distance_km && (
                      <span className="text-[11px] font-semibold text-slate-600">
                        {pos.distance_km} km
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {pos.kriteria_jurusan.map((jur, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                      >
                        {jur}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">Kuota: </span>
                  <span className="font-bold text-navy-900">
                    {pos.terisi_mahasiswa}/{pos.kuota_mahasiswa}
                  </span>
                </div>

                <Link href={`/search/${pos.id}`}>
                  <Button size="sm" variant="primary">
                    Lihat Detail
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
