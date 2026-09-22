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
import api from '@/lib/services';
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
import { StyledSelect } from '@/components/ui/StyledSelect';

export default function SearchPage() {
  const [items, setItems] = useState<PosKebutuhan[]>(MOCK_POS_KEBUTUHAN);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('Semua');
  const [maxDistance, setMaxDistance] = useState<number>(50);

  React.useEffect(() => {
    async function loadPos() {
      try {
        setLoading(true);
        const data = await api.posKebutuhan.getAll();
        if (Array.isArray(data) && data.length > 0) {
          const normalized: PosKebutuhan[] = data.map((item: any) => ({
            id: item.id,
            desa_id: item.desa_id || 1,
            judul: item.judul || item.title || 'Pos Kebutuhan KKN',
            deskripsi: item.deskripsi || item.description || '',
            nama_desa: item.desa?.nama_desa || item.nama_desa || 'Desa Mitra',
            kecamatan: item.desa?.kecamatan || item.kecamatan || 'Kecamatan',
            kabupaten: item.desa?.kabupaten || item.kabupaten || 'Kabupaten',
            provinsi: item.desa?.provinsi || item.provinsi || 'Jawa Timur',
            latitude: item.latitude || -6.595,
            longitude: item.longitude || 106.8166,
            kategori_sektor: item.kategori || item.kategori_sektor || 'Digitalisasi & Teknologi Desa',
            kuota_mahasiswa: item.kuota_kelompok ? item.kuota_kelompok * 10 : (item.kuota_mahasiswa || 10),
            terisi_mahasiswa: item.terisi_mahasiswa || 0,
            status: item.status || 'terbuka',
            matching_score: item.matching_score || 92,
            kriteria_jurusan: Array.isArray(item.kriteria_jurusan)
              ? item.kriteria_jurusan
              : item.jurusan_dibutuhkan
              ? Object.keys(item.jurusan_dibutuhkan)
              : ['Teknik Informatika', 'Manajemen', 'Sistem Informasi'],
            target_luaran: Array.isArray(item.target_luaran)
              ? item.target_luaran
              : ['Sistem Informasi Web Desa', 'Modul Pelatihan Aparatur', 'Laporan Akhir KKN'],
            distance_km: item.distance_km || Math.floor(Math.random() * 40) + 5,
            created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : 'Baru saja',
          }));
          setItems(normalized);
        }
      } catch (err) {
        console.warn('Fallback to mock search items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPos();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesQuery =
      item.judul.toLowerCase().includes(query.toLowerCase()) ||
      (item.nama_desa && item.nama_desa.toLowerCase().includes(query.toLowerCase())) ||
      (item.kabupaten && item.kabupaten.toLowerCase().includes(query.toLowerCase())) ||
      (Array.isArray(item.kriteria_jurusan) &&
        item.kriteria_jurusan.some((j) => j.toLowerCase().includes(query.toLowerCase())));

    const matchesSector =
      selectedSector === 'Semua' ||
      (item.kategori_sektor && item.kategori_sektor.toLowerCase().includes(selectedSector.toLowerCase()));

    const matchesDistance = !item.distance_km || item.distance_km <= maxDistance;

    return matchesQuery && matchesSector && matchesDistance;
  });

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] flex flex-col font-jakarta transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
            Eksplorasi Program Pengabdian Desa
          </span>
          <h1 className="text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
            Katalog Pos Kebutuhan KKN Tematik
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Temukan pos KKN yang relevan dengan latar belakang keilmuan dan minat pengabdian kelompok Anda.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-navy-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kata kunci desa, tema, atau jurusan..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 rounded-xl text-xs sm:text-sm text-navy-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <StyledSelect
                value={selectedSector}
                onChange={(v) => setSelectedSector(String(v))}
                options={[
                  { value: 'Semua', label: 'Semua Sektor' },
                  { value: 'Digitalisasi', label: 'Digitalisasi & Teknologi' },
                  { value: 'Agrikultur', label: 'Agrikultur & Ketahanan Pangan' },
                  { value: 'Kesehatan', label: 'Kesehatan & Sanitasi' },
                  { value: 'UMKM', label: 'Pemberdayaan UMKM' },
                ]}
              />

              <Link href="/maps">
                <Button variant="secondary" size="md" className="gap-1.5 text-xs whitespace-nowrap rounded-xl">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Peta</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Distance Filter Slider */}
          <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-navy-900 dark:text-slate-100">Maksimal Jarak dari Kampus:</span>
              <input
                type="range"
                min="5"
                max="100"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="accent-primary w-36"
              />
              <span className="font-bold text-navy-900 dark:text-slate-100 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800">
                {maxDistance} km
              </span>
            </div>

            <div className="text-slate-500 dark:text-slate-400">
              Menampilkan <span className="font-bold text-navy-950 dark:text-white">{filteredItems.length}</span> pos kebutuhan
            </div>
          </div>
        </div>

        {/* Results Grid with Authentic Photos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((pos) => (
            <Card key={pos.id} hoverEffect className="overflow-hidden flex flex-col justify-between border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-card">
              <div className="space-y-3">
                {/* Photo Header */}
                <div className="h-44 overflow-hidden relative">
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
                  <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue line-clamp-2">
                    {pos.judul}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {pos.deskripsi}
                  </p>

                  <div className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-navy-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {pos.nama_desa}, {pos.kabupaten}
                      </span>
                      {pos.distance_km && (
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          {pos.distance_km} km
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {pos.kriteria_jurusan.map((jur, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300"
                        >
                          {jur}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-5 flex items-center justify-between border-t border-slate-100 dark:border-navy-800 mt-2">
                <div className="text-xs">
                  <span className="text-slate-400 dark:text-slate-400">Kuota: </span>
                  <strong className="text-navy-950 dark:text-white">
                    {pos.terisi_mahasiswa}/{pos.kuota_mahasiswa}
                  </strong>
                </div>

                <Link href={`/search/${pos.id}`}>
                  <Button size="sm" variant="primary" className="text-xs font-semibold">
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
