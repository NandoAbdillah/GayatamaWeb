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
  MapPin,
  Navigation,
  Compass,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Building,
} from 'lucide-react';

export default function MapsPage() {
  const [selectedPos, setSelectedPos] = useState(MOCK_POS_KEBUTUHAN[0]);
  const [radiusFilter, setRadiusFilter] = useState<number>(30);

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              <Compass className="w-3.5 h-3.5 text-emerald-600" /> Haversine Geospatial Radius
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-epilogue mt-1">
              Peta Sebaran Pos KKN & Jangkauan Wilayah
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-full border border-slate-200 shadow-sm text-xs">
            <span className="font-semibold text-slate-500 pl-3">Filter Jarak:</span>
            <button
              onClick={() => setRadiusFilter(20)}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                radiusFilter === 20 ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              &lt; 20 km
            </button>
            <button
              onClick={() => setRadiusFilter(50)}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                radiusFilter === 50 ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              &lt; 50 km
            </button>
            <button
              onClick={() => setRadiusFilter(100)}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                radiusFilter === 100 ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              Semua
            </button>
          </div>
        </div>

        {/* Interactive Map Layout (Map Canvas + Sidebar Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[650px]">
          {/* Visual Map Canvas Container (8 cols) */}
          <div className="lg:col-span-8 rounded-3xl overflow-hidden border border-slate-200 shadow-ambient bg-slate-900 relative flex items-center justify-center">
            {/* Top map controls overlay */}
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-200 text-xs font-semibold text-navy-900 shadow-sm flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-primary" />
              <span>Pusat Kampus: Univ. Nusantara (-6.5950, 106.8166)</span>
            </div>

            {/* Stylized vector map presentation */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 opacity-95">
              <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
              </svg>
            </div>

            {/* Center Campus Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-20">
              <div className="w-12 h-12 rounded-full bg-primary/20 animate-ping absolute" />
              <div className="w-10 h-10 rounded-full bg-primary border-2 border-white flex items-center justify-center text-white shadow-glow-primary">
                <Building className="w-5 h-5" />
              </div>
              <span className="mt-1 px-2.5 py-0.5 rounded-full bg-navy-950/90 border border-primary-400/50 text-[10px] font-bold text-white shadow-md">
                Pusat Kampus
              </span>
            </div>

            {/* Simulated interactive village pins */}
            {MOCK_POS_KEBUTUHAN.map((pos, idx) => {
              const offsets = [
                { top: '35%', left: '65%' },
                { top: '70%', left: '75%' },
                { top: '28%', left: '38%' },
              ];
              const posStyle = offsets[idx % offsets.length];
              const isSelected = selectedPos.id === pos.id;

              return (
                <div
                  key={pos.id}
                  style={posStyle}
                  onClick={() => setSelectedPos(pos)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all z-20 ${
                    isSelected ? 'scale-110' : 'hover:scale-105 opacity-85'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg transition-all ${
                      isSelected ? 'bg-emerald-500 ring-4 ring-emerald-300/50' : 'bg-navy-800'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span
                    className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 text-white font-extrabold'
                        : 'bg-navy-950/90 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {pos.nama_desa} ({pos.distance_km} km)
                  </span>
                </div>
              );
            })}

            {/* Bottom Legend */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between bg-navy-950/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700 text-xs text-slate-300">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Kampus
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Pos Kebutuhan Terpilih
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Formula Jarak: Haversine Spherical Distance
              </span>
            </div>
          </div>

          {/* Right Selected Pos Card (4 cols) */}
          <div className="lg:col-span-4 h-full flex flex-col">
            <Card className="p-6 border-slate-200 flex-1 flex flex-col justify-between shadow-ambient">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedPos.status} size="sm" />
                  <span className="text-xs font-bold text-primary bg-primary-50 px-2.5 py-1 rounded-full">
                    {selectedPos.distance_km} km dari kampus
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    {selectedPos.kategori_sektor}
                  </span>
                  <h3 className="text-lg font-bold text-navy-950 font-epilogue mt-1 leading-snug">
                    {selectedPos.judul}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {selectedPos.nama_desa}, {selectedPos.kabupaten}
                  </p>
                </div>

                <p className="text-xs text-slate-600 font-jakarta leading-relaxed line-clamp-4">
                  {selectedPos.deskripsi}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-navy-900">Target Luaran:</span>
                  <div className="space-y-1.5">
                    {selectedPos.target_luaran.map((tgt, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{tgt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <Link href={`/search/${selectedPos.id}`}>
                  <Button size="lg" variant="primary" className="w-full shadow-glow-primary">
                    <span>Lihat Rincian Pos & Lamar</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
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
