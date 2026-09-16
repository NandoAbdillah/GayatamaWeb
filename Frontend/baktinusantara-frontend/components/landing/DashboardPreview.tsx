'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  FileCheck2,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  ChevronRight,
  Laptop,
  Sprout,
  HeartPulse,
  Landmark,
} from 'lucide-react';

type DashboardTab = 'mahasiswa' | 'desa' | 'dpl';

export const DashboardPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('mahasiswa');

  return (
    <div className="w-full max-w-6xl mx-auto rounded-3xl bg-slate-900/90 dark:bg-navy-950/90 border border-slate-700/80 dark:border-navy-700/80 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Top Window Bar (Browser Mockup Header) */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          <span className="text-[11px] font-mono text-slate-400 ml-2 hidden sm:inline-block">
            app.baktinusantara.id/{activeTab}/dashboard
          </span>
        </div>

        {/* Interactive Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('mahasiswa')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'mahasiswa'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Portal Mahasiswa
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('desa')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'desa'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Portal Mitra Desa
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dpl')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'dpl'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Portal DPL & LPPM
          </button>
        </div>
      </div>

      {/* Main Mockup Body */}
      <div className="p-4 sm:p-6 lg:p-8 bg-slate-900/60 text-slate-100 min-h-[420px]">
        {/* TAB 1: MAHASISWA DASHBOARD MOCKUP */}
        {activeTab === 'mahasiswa' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* User Greeting & Match Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-900/40 via-slate-800/40 to-slate-800/20 border border-primary-500/30">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 text-primary-300 flex items-center justify-center font-bold text-lg font-epilogue">
                  RA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-white font-epilogue">
                      Raditya Ardiansyah
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Terdaftar Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Teknik Informatika • Universitas Indonesia • Kelompok 14 KKN Tematik
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/mahasiswa/logbook"
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Isi Logbook Hari Ini</span>
                </Link>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Matching Kompetensi</span>
                <p className="text-xl font-extrabold text-emerald-400 font-epilogue">96% Sangat Cocok</p>
                <p className="text-[10px] text-slate-500">Sesuai bidang IT & UMKM</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Logbook Terverifikasi</span>
                <p className="text-xl font-extrabold text-white font-epilogue">28 / 30 Hari</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Validasi GPS DPL
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Target Luaran KKN</span>
                <p className="text-xl font-extrabold text-sky-400 font-epilogue">4 dari 4 Selesai</p>
                <p className="text-[10px] text-slate-500">Web UMKM, SOP, Modul, BAST</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Nilai Akhir & Konversi</span>
                <p className="text-xl font-extrabold text-amber-400 font-epilogue">A (4.00) / 4 SKS</p>
                <p className="text-[10px] text-slate-500">Tervalidasi LPPM</p>
              </div>
            </div>

            {/* Active Program Card */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-500/20 text-primary-300 border border-primary-500/30">
                    DIGITALISASI UMKM & EKONOMI DESA
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" /> Desa Sukamaju, Ciawi, Bogor
                  </span>
                </div>
                <h5 className="text-sm font-bold text-white">
                  Program Transformasi Digital 24 UMKM Kerajinan Bambu & Olahan Singkong
                </h5>
                <p className="text-xs text-slate-400 line-clamp-1">
                  Pembangunan katalog produk digital, QRIS statis, dan pelatihan pembukuan akuntansi berbasis aplikasi.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Progres Luaran</span>
                  <span className="text-sm font-extrabold text-emerald-400">100% (Siap BAST)</span>
                </div>
                <Link
                  href="/portofolio/kelompok-14-sukamaju"
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Lihat Portofolio</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERANGKAT DESA DASHBOARD MOCKUP */}
        {activeTab === 'desa' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Village Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-800/40 to-slate-800/20 border border-emerald-500/30">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-lg">
                  <Landmark className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-white font-epilogue">
                      Pemerintah Desa Karangrejo
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Desa Mitra Resmi
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Kecamatan Musuk, Kabupaten Boyolali, Jawa Tengah • Kode Desa: 33.09.05.2001
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/aspirasi"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ Tambah Kebutuhan Desa</span>
                </Link>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Aspirasi Warga Masuk</span>
                <p className="text-xl font-extrabold text-white font-epilogue">12 Masalah</p>
                <p className="text-[10px] text-slate-500">Pertanian & Kesehatan</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Pos KKN Terbuka</span>
                <p className="text-xl font-extrabold text-emerald-400 font-epilogue">3 Pos Aktif</p>
                <p className="text-[10px] text-slate-500">Kuota 24 Mahasiswa</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Mahasiswa di Lapangan</span>
                <p className="text-xl font-extrabold text-sky-400 font-epilogue">18 Mahasiswa</p>
                <p className="text-[10px] text-slate-500">UGM & UNS Solo</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">BAST Terbit & Tervalidasi</span>
                <p className="text-xl font-extrabold text-amber-400 font-epilogue">2 Berita Acara</p>
                <p className="text-[10px] text-emerald-400">QR Code Resmi</p>
              </div>
            </div>

            {/* List of Incoming Needs / Pos */}
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="text-xs font-bold text-white">Modernisasi Irigasi Pertanian Padi & Hortikultura</h6>
                    <p className="text-[10px] text-slate-400">Dibutuhkan mahasiswa: Teknik Pertanian, Elektro, Agribisnis</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Tim Terisi (8/8)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="text-xs font-bold text-white">Program Pencegahan Stunting & Edukasi Gizi Ibu Hamil</h6>
                    <p className="text-[10px] text-slate-400">Dibutuhkan mahasiswa: Ilmu Gizi, Kedokteran, Keperawatan</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  Proses Pelaksanaan
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DPL & LPPM DASHBOARD MOCKUP */}
        {activeTab === 'dpl' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* DPL Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-800/40 to-slate-800/20 border border-amber-500/30">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-lg font-epilogue">
                  Dr.
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-white font-epilogue">
                      Dr. Ir. Hendra Wicaksono, M.T.
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      DPL Terakreditasi
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Dosen Pembimbing Lapangan • Wilayah Binaan: Boyolali & Magelang • 6 Kelompok Mahasiswa
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>LPPM Monev Dashboard</span>
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Total Kelompok Binaan</span>
                <p className="text-xl font-extrabold text-white font-epilogue">6 Kelompok</p>
                <p className="text-[10px] text-slate-500">60 Mahasiswa Aktif</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Verifikasi Logbook Masuk</span>
                <p className="text-xl font-extrabold text-emerald-400 font-epilogue">142 Logbook</p>
                <p className="text-[10px] text-emerald-400">100% Geotagging Valid</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Evaluasi & Monev Lapangan</span>
                <p className="text-xl font-extrabold text-sky-400 font-epilogue">2 Kunjungan</p>
                <p className="text-[10px] text-slate-500">Status: Sesuai Target</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Pengesahan BAST Luaran</span>
                <p className="text-xl font-extrabold text-amber-400 font-epilogue">Digital TTD</p>
                <p className="text-[10px] text-slate-500">Terhubung PDDIKTI</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
              <div>
                <h6 className="text-xs font-bold text-white">Persetujuan BAST Akhir: Kelompok 14 Desa Sukamaju</h6>
                <p className="text-[10px] text-slate-400">
                  Kepala Desa telah menandatangani secara digital. Menunggu pengesahan DPL & LPPM.
                </p>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Sahkan BAST Digital
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Pill */}
      <div className="px-4 sm:px-6 py-3 bg-slate-950 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sistem Informasi Terintegrasi • PDDikti & Kemendagri Standard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-primary-400 hover:underline font-bold flex items-center gap-1">
            <span>Masuk ke Akun Portal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
