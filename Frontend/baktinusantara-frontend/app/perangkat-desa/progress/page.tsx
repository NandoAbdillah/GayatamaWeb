'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MOCK_KELOMPOK_14, MOCK_POS_KEBUTUHAN } from '@/lib/mock-data';
import { Users, MapPin, Layers, TrendingUp, Calendar, ArrowRight, Search, GraduationCap } from 'lucide-react';

// Data kelompok aktif di Desa Sukamaju (compact list)
// Menggunakan MOCK_KELOMPOK_14 sebagai base + 2 kelompok tambahan untuk variasi
const KELOMPOK_LIST = [
  MOCK_KELOMPOK_14,
  {
    id: 15,
    nama_kelompok: 'Kelompok 15 - Sukamaju Sejahtera',
    kode_kelompok: 'KKN-2026-SKM-015',
    ketua_id: 102,
    ketua_nama: 'Salsabila Putri',
    dosen_id: 301,
    dosen_nama: 'Dr. Ir. Hendra Gunawan, M.T.',
    pos_kebutuhan_id: 3,
    pos_kebutuhan_judul: 'Pemberdayaan Posyandu Digital & Pencegahan Stunting Balita',
    desa_nama: 'Desa Sukamaju, Bogor',
    total_anggota: 4,
    status_program: 'pelaksanaan' as const,
    progres_persen: 45,
    anggota: [
      { id: 2, user_id: 102, nama: 'Salsabila Putri', nim: '21051204045', jurusan: 'Agribisnis', role_kelompok: 'Ketua' as const },
      { id: 6, user_id: 106, nama: 'Rizki Maulana', nim: '21051204077', jurusan: 'Gizi', role_kelompok: 'Anggota' as const },
      { id: 7, user_id: 107, nama: 'Anisa Rahma', nim: '21051204111', jurusan: 'Kesehatan Masyarakat', role_kelompok: 'Anggota' as const },
      { id: 8, user_id: 108, nama: 'Fajar Nugroho', nim: '21051204099', jurusan: 'Sistem Informasi', role_kelompok: 'Anggota' as const },
    ],
  },
  {
    id: 11,
    nama_kelompok: 'Kelompok 11 - Sukamaju Kreatif',
    kode_kelompok: 'KKN-2026-SKM-011',
    ketua_id: 103,
    ketua_nama: 'Dimas Arya Pamungkas',
    dosen_id: 301,
    dosen_nama: 'Dr. Ir. Hendra Gunawan, M.T.',
    pos_kebutuhan_id: 4,
    pos_kebutuhan_judul: 'Digitalisasi Sentra Bunga & Edukasi Sains Literasi Anak Lereng',
    desa_nama: 'Desa Sukamaju, Bogor',
    total_anggota: 6,
    status_program: 'perencanaan' as const,
    progres_persen: 18,
    anggota: [
      { id: 3, user_id: 103, nama: 'Dimas Arya Pamungkas', nim: '21051204088', jurusan: 'Ilmu Komunikasi', role_kelompok: 'Ketua' as const },
      { id: 9, user_id: 109, nama: 'Maya Sari', nim: '21051204120', jurusan: 'PGSD', role_kelompok: 'Anggota' as const },
      { id: 10, user_id: 110, nama: 'Andi Wijaya', nim: '21051204131', jurusan: 'Biologi', role_kelompok: 'Anggota' as const },
      { id: 11, user_id: 111, nama: 'Lestari Dewi', nim: '21051204142', jurusan: 'DKV', role_kelompok: 'Anggota' as const },
      { id: 12, user_id: 112, nama: 'Budi Santoso', nim: '21051204153', jurusan: 'Sistem Informasi', role_kelompok: 'Anggota' as const },
      { id: 13, user_id: 113, nama: 'Citra Lestari', nim: '21051204164', jurusan: 'Pendidikan', role_kelompok: 'Anggota' as const },
    ],
  },
];

const statusLabel: Record<string, { label: string; className: string }> = {
  perencanaan: { label: 'Persiapan', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  pelaksanaan: { label: 'Pelaksanaan', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  penyusunan_luaran: { label: 'Penyusunan Luaran', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  selesai: { label: 'Selesai', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export default function PerangkatDesaProgressPage() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return KELOMPOK_LIST;
    const q = search.toLowerCase();
    return KELOMPOK_LIST.filter(
      (k) =>
        k.nama_kelompok.toLowerCase().includes(q) ||
        k.pos_kebutuhan_judul?.toLowerCase().includes(q) ||
        k.ketua_nama.toLowerCase().includes(q) ||
        k.kode_kelompok.toLowerCase().includes(q)
    );
  }, [search]);

  const totalMahasiswa = KELOMPOK_LIST.reduce((a, b) => a + b.total_anggota, 0);
  const avgProgres = Math.round(KELOMPOK_LIST.reduce((a, b) => a + b.progres_persen, 0) / KELOMPOK_LIST.length);

  return (
    <DashboardLayout title="Monitoring Kelompok KKN Desa">
      <div className="space-y-6 font-jakarta">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">Kelompok KKN Aktif di Desa</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar kelompok mahasiswa yang sedang melaksanakan pengabdian di wilayah Desa Sukamaju. Klik detail untuk melihat anggota, projek, dan logbook mingguan.
          </p>
        </div>

        {/* Summary ringkas */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-center">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Kelompok</p>
            <p className="text-xl font-extrabold text-navy-950 dark:text-white mt-1">{KELOMPOK_LIST.length}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Aktif 2026</p>
          </Card>
          <Card className="p-4 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-center">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Mahasiswa</p>
            <p className="text-xl font-extrabold text-navy-950 dark:text-white mt-1">{totalMahasiswa} Orang</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Tergabung</p>
          </Card>
          <Card className="p-4 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-center">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Rata-rata Progres</p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{avgProgres}%</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Pelaksanaan</p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kelompok, projek, atau ketua..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl text-sm text-navy-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
          />
        </div>

        {/* Grid Card Kelompok - singkat */}
        {filtered.length === 0 ? (
          <Card className="p-10 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada kelompok yang sesuai pencarian.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((k) => {
              const pos = MOCK_POS_KEBUTUHAN.find((p) => p.id === k.pos_kebutuhan_id);
              return (
                <Card key={k.id} className="p-5 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  {/* Top: kode + status */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 px-2 py-0.5 rounded-full">
                      {k.kode_kelompok}
                    </span>
                  </div>

                  {/* Nama kelompok */}
                  <h3 className="text-sm font-extrabold text-navy-950 dark:text-white font-epilogue mt-3 line-clamp-1 leading-tight">{k.nama_kelompok}</h3>

                  {/* Meta singkat */}
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary dark:text-primary-400" />
                      {k.total_anggota} Anggota
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {k.progres_persen}%
                    </span>
                  </div>

                  {/* Progress bar tipis */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-navy-800 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${k.progres_persen}%` }} />
                  </div>

                  {/* Projek - singkat 2 baris */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950/70 border border-slate-100 dark:border-navy-800">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <Layers className="w-3 h-3" />
                      Projek
                    </div>
                    <p className="text-xs font-semibold text-navy-900 dark:text-slate-100 leading-snug line-clamp-2 mt-1">{k.pos_kebutuhan_judul}</p>
                    {pos && <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{pos.kategori_sektor}</p>}
                  </div>

                  {/* Ketua & DPL singkat */}
                  <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-600 dark:text-slate-300">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                    <span className="truncate">
                      Ketua: <strong className="text-navy-900 dark:text-white">{k.ketua_nama}</strong>
                    </span>
                  </div>

                  {/* Button detail full width */}
                  <Link href={`/perangkat-desa/progress/${k.id}`} className="mt-4 block">
                    <Button variant="outline" size="sm" className="w-full justify-between text-xs font-bold dark:border-navy-700 dark:text-slate-200">
                      <span>Lihat Detail</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
