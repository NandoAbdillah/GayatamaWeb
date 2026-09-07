'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MOCK_POS_KEBUTUHAN } from '@/lib/mock-data';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin,
  Sparkles,
  Users,
  Target,
  FileCheck2,
  Calendar,
  Building,
  ArrowLeft,
  Share2,
  Bookmark,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PosDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Number(params?.id || '1');

  const pos = MOCK_POS_KEBUTUHAN.find((p) => p.id === id) || MOCK_POS_KEBUTUHAN[0];

  const handleApply = () => {
    if (!user) {
      router.push(`/login?redirect=/search/${id}`);
      return;
    }
    if (user.role !== 'mahasiswa') {
      toast.error('Hanya mahasiswa yang dapat mengajukan proposal KKN untuk pos ini.');
      return;
    }
    router.push(`/mahasiswa/proposal?pos_id=${pos.id}`);
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col font-jakarta">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back navigation */}
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-navy-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog Pos Kebutuhan</span>
        </Link>

        {/* Hero Photo Banner */}
        <div className="h-64 sm:h-80 rounded-3xl overflow-hidden relative border border-slate-200 shadow-card">
          <img
            src={
              pos.id === 1
                ? 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=1200&auto=format&fit=crop&q=80'
                : pos.id === 2
                ? 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=80'
            }
            alt={pos.judul}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
            <span className="text-xs font-bold px-3 py-1 rounded-md bg-white/20 backdrop-blur-md uppercase tracking-wider">
              {pos.kategori_sektor}
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold font-epilogue leading-snug">
              {pos.judul}
            </h1>
            <p className="text-xs text-slate-200 flex items-center gap-1.5 pt-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>
                {pos.nama_desa}, {pos.kecamatan}, {pos.kabupaten}
              </span>
            </p>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 sm:p-8 space-y-6 border-slate-200 shadow-card">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={pos.status} />
                {pos.matching_score && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    {pos.matching_score}% Kesesuaian Jurusan
                  </span>
                )}
              </div>

              <div className="h-px bg-slate-100" />

              {/* Deskripsi Lengkap */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-navy-950 font-epilogue">
                  Deskripsi Kebutuhan Wilayah
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {pos.deskripsi}
                </p>
              </div>

              {/* Target Luaran */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-navy-950 font-epilogue">
                  Target Luaran Program KKN
                </h3>
                <div className="space-y-2">
                  {pos.target_luaran.map((luaran, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs font-semibold text-navy-900">{luaran}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jurusan yang Diprioritaskan */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-navy-950 font-epilogue">
                  Komposisi Keilmuan yang Diharapkan
                </h3>
                <div className="flex flex-wrap gap-2">
                  {pos.kriteria_jurusan.map((jur, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-navy-800 border border-slate-200"
                    >
                      {jur}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Actions & Meta */}
          <div className="space-y-6">
            <Card className="p-6 space-y-5 border-slate-200 bg-white shadow-card">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
                  Ringkasan Kuota
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary-700" />
                    <div>
                      <p className="text-[11px] text-slate-500">Kuota Terisi</p>
                      <p className="text-base font-extrabold text-navy-950 font-epilogue">
                        {pos.terisi_mahasiswa} / {pos.kuota_mahasiswa} Mahasiswa
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200">
                    {pos.kuota_mahasiswa - pos.terisi_mahasiswa} Tersedia
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Jarak dari Kampus:</span>
                  <span className="font-bold text-navy-900">{pos.distance_km || 18.4} km</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Periode KKN:</span>
                  <span className="font-bold text-navy-900">Semester Ganjil 2026</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Durasi Pengabdian:</span>
                  <span className="font-bold text-navy-900">45 Hari (200 Jam)</span>
                </div>
              </div>

              <Button
                onClick={handleApply}
                size="lg"
                variant="primary"
                className="w-full font-bold text-xs sm:text-sm"
              >
                <span>Ajukan Proposal Kelompok</span>
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={() => toast.success('Tautan berhasil disalin ke papan klip')}
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs font-semibold"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan Pos</span>
                </Button>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 bg-slate-50 space-y-2 text-xs">
              <h4 className="font-bold text-navy-900 uppercase tracking-wider">
                Verifikasi Mitra Desa
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Pos kebutuhan ini telah ditinjau dan divalidasi oleh Pemerintah Desa{' '}
                <strong className="text-navy-950">{pos.nama_desa}</strong> serta disetujui oleh LPPM
                Universitas.
              </p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
