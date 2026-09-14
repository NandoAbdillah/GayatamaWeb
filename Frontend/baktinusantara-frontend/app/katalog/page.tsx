'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MOCK_POS_KEBUTUHAN } from '@/lib/mock-data';
import { PosKebutuhan } from '@/lib/types';
import api from '@/lib/services';
import {
  Search,
  MapPin,
  Clock,
  Users,
  Target,
  ArrowRight,
  Filter,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function KatalogPublikPage() {
  const tkatalog = useTranslations('katalog');
  const [posList, setPosList] = useState<PosKebutuhan[]>(MOCK_POS_KEBUTUHAN);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSektor, setSelectedSektor] = useState<string>('all');
  const [selectedJurusan, setSelectedJurusan] = useState<string>('all');

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.posKebutuhan.getAll();
        if (Array.isArray(data) && data.length > 0) {
          // Normalize if backend field format differs
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
            matching_score: item.matching_score || 95,
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
          setPosList(normalized);
        }
      } catch (err) {
        console.warn('Fallback to mock catalog data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredList = posList.filter((item) => {
    const matchSearch =
      item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nama_desa && item.nama_desa.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchSektor =
      selectedSektor === 'all' ||
      (item.kategori_sektor && item.kategori_sektor.toLowerCase().includes(selectedSektor.toLowerCase()));
    const matchJurusan =
      selectedJurusan === 'all' ||
      (Array.isArray(item.kriteria_jurusan) &&
        item.kriteria_jurusan.some((j) => j.toLowerCase().includes(selectedJurusan.toLowerCase())));

    return matchSearch && matchSektor && matchJurusan;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary dark:text-primary-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tkatalog('badge')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-navy-950 dark:text-white font-epilogue tracking-tight">
            {tkatalog('title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-jakarta leading-relaxed">
            {tkatalog('subtitle')}
          </p>
        </div>

        {/* Filter & Search Bar */}
        <Card className="p-4 border-slate-200 dark:border-navy-800 shadow-md bg-white dark:bg-navy-900 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={tkatalog('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <select
                value={selectedSektor}
                onChange={(e) => setSelectedSektor(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">{tkatalog('filters.sectors.all')}</option>
                <option value="Agrikultur & Ketahanan Pangan">{tkatalog('filters.sectors.agrikultur')}</option>
                <option value="Kesehatan & Sanitasi">{tkatalog('filters.sectors.kesehatan')}</option>
                <option value="Digitalisasi & Teknologi Desa">{tkatalog('filters.sectors.digitalisasi')}</option>
                <option value="Pemberdayaan UMKM">{tkatalog('filters.sectors.umkm')}</option>
                <option value="Pendidikan & Literasi">{tkatalog('filters.sectors.pendidikan')}</option>
              </select>
            </div>

            <div>
              <select
                value={selectedJurusan}
                onChange={(e) => setSelectedJurusan(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">{tkatalog('filters.majors.all')}</option>
                <option value="Informatika">{tkatalog('filters.majors.informatika')}</option>
                <option value="Pertanian">{tkatalog('filters.majors.pertanian')}</option>
                <option value="Gizi">{tkatalog('filters.majors.gizi')}</option>
                <option value="Manajemen">{tkatalog('filters.majors.manajemen')}</option>
                <option value="Sipil">{tkatalog('filters.majors.sipil')}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-tkatalog border-slate-100 dark:border-navy-800 text-xs text-slate-500">
            <span>
              {tkatalog('resultsPrefix')} <strong className="text-navy-950 dark:text-white">{filteredList.length}</strong> {tkatalog('resultsSuffix')}
            </span>

            <Link
              href="/maps"
              className="font-bold text-primary dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{tkatalog('openMap')}</span>
            </Link>
          </div>
        </Card>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((pos) => {
            const sisaKuota = pos.kuota_mahasiswa - pos.terisi_mahasiswa;

            return (
              <Card
                key={pos.id}
                className="border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 space-y-4">
                  {/* Header Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-900">
                      {pos.kategori_sektor}
                    </span>

                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{pos.created_at}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-navy-950 dark:text-white group-hover:text-primary transition-colors font-epilogue line-clamp-2">
                      {pos.judul}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>
                        {pos.nama_desa}, {pos.kabupaten}
                      </span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {pos.deskripsi}
                  </p>

                  {/* Target Luaran Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {pos.target_luaran?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Jurusan Tags */}
                  <div className="pt-2 border-tkatalog border-slate-100 dark:border-navy-800">
                    <p className="text-[11px] font-bold text-slate-400 mb-1.5">{tkatalog('criteriaLabel')}</p>
                    <div className="flex flex-wrap gap-1">
                      {pos.kriteria_jurusan.map((j, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900"
                        >
                          {j}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50 dark:bg-navy-950/60 border-tkatalog border-slate-100 dark:border-navy-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {tkatalog('quotaLabel')}{' '}
                      <strong className="text-navy-950 dark:text-white">
                        {tkatalog('quotaValue', { filled: pos.terisi_mahasiswa, quota: pos.kuota_mahasiswa })}
                      </strong>
                    </span>
                  </div>

                  <Link href={`/search/${pos.id}`}>
                    <Button size="sm" variant="primary" className="font-bold text-xs gap-1">
                      <span>{tkatalog('detailBtn')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-tkatalog border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 py-6 text-center text-xs text-slate-500 mt-12">
        <p>{tkatalog('footer')}</p>
      </footer>
    </div>
  );
}
