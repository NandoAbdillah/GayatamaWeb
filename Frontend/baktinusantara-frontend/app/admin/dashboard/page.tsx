'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Building,
  Users,
  GraduationCap,
  Award,
  TrendingUp,
  Activity,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Download,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Pusat Kendali Monev LPPM Universitas">
      <div className="space-y-6">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-primary-950 text-white p-6 sm:p-8 shadow-ambient-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-primary-200">
              Dashboard Monev LPPM Universitas
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-epilogue">
              Sistem Monitoring & Evaluasi KKN
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-jakarta leading-relaxed">
              Tinjau kinerja sebaran 1,420 desa mitra, 18,500 mahasiswa aktif, dan konversi SKS kurikulum merdeka secara real-time.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link href="/admin/sks">
                <Button size="sm" variant="primary" className="shadow-glow-primary gap-1.5">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Approval Konversi SKS</span>
                </Button>
              </Link>
              <Link href="/admin/verifikasi">
                <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  <span>Verifikasi Berkas Mitra</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Aggregated Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-slate-200 space-y-2 bg-white">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total Mahasiswa Terjun</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950 font-epilogue">18,540</p>
            <p className="text-xs text-emerald-700 font-medium">100% Terdistribusi ke Kelompok</p>
          </Card>

          <Card className="p-5 border-slate-200 space-y-2 bg-white">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Desa Mitra Terverifikasi</span>
              <Building className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950 font-epilogue">1,420 Desa</p>
            <p className="text-xs text-slate-500">Tersebar di 38 Kabupaten</p>
          </Card>

          <Card className="p-5 border-slate-200 space-y-2 bg-white">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Dosen Pembimbing (DPL)</span>
              <GraduationCap className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950 font-epilogue">480 DPL</p>
            <p className="text-xs text-emerald-700 font-medium">Rata-rata 3.8 Kelompok / DPL</p>
          </Card>

          <Card className="p-5 border-slate-200 space-y-2 bg-white">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>BAST Resmi Selesai</span>
              <Award className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-extrabold text-navy-950 font-epilogue">89.4%</p>
            <p className="text-xs text-slate-500">Telah Disahkan Kepala Desa</p>
          </Card>
        </div>

        {/* Real-time Cluster Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <Card className="p-6 border-slate-200 bg-white shadow-ambient space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-navy-950 font-epilogue">
                  Sebaran Program KKN Per Sektor Prioritas
                </h2>
                <span className="text-xs font-semibold text-primary">Tahun 2026</span>
              </div>

              <div className="space-y-3 font-jakarta">
                {[
                  { sector: 'Digitalisasi & Teknologi Desa', pct: 38, count: '540 Program' },
                  { sector: 'Agrikultur & Ketahanan Pangan', pct: 28, count: '398 Program' },
                  { sector: 'Kesehatan & Sanitasi Posyandu', pct: 20, count: '284 Program' },
                  { sector: 'Pemberdayaan UMKM & Koperasi', pct: 14, count: '198 Program' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-navy-900">{item.sector}</span>
                      <span className="text-slate-500 font-medium">
                        {item.count} ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <Card className="p-6 border-slate-200 bg-white shadow-ambient space-y-4">
              <h2 className="text-base font-bold text-navy-950 font-epilogue">
                Tindakan Cepat LPPM
              </h2>

              <div className="space-y-2.5">
                <Link href="/admin/sks" className="block">
                  <div className="p-3.5 rounded-2xl bg-surface-subtle hover:bg-surface-container border border-slate-200/80 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-navy-950">Konversi SKS 48 Kelompok</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </Link>

                <Link href="/admin/verifikasi" className="block">
                  <div className="p-3.5 rounded-2xl bg-surface-subtle hover:bg-surface-container border border-slate-200/80 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-navy-950">12 Berkas SK Desa Masuk</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </Link>

                <Link href="/admin/dosen" className="block">
                  <div className="p-3.5 rounded-2xl bg-surface-subtle hover:bg-surface-container border border-slate-200/80 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-navy-950">Alokasi DPL Wilayah</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
