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
    <div className="min-h-screen bg-surface-canvas flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back navigation */}
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog Pos Kebutuhan</span>
        </Link>

        {/* Main Content Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 sm:p-8 space-y-6 border-slate-200">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={pos.status} />
                  <span className="text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-full">
                    {pos.kategori_sektor}
                  </span>
                  {pos.matching_score && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      {pos.matching_score}% Kesesuaian Jurusan
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-epilogue leading-snug">
                  {pos.judul}
                </h1>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span className="font-semibold text-navy-900">{pos.nama_desa}</span>,{' '}
                  <span>
                    {pos.kecamatan}, {pos.kabupaten}, {pos.provinsi}
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Deskripsi Lengkap */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-navy-950 font-epilogue">
                  Deskripsi Kebutuhan Wilayah
                </h3>
                <p className="text-sm text-slate-600 font-jakarta leading-relaxed whitespace-pre-line">
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
                      className="flex items-start gap-3 p-3 rounded-2xl bg-surface-subtle border border-slate-200/60"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
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
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-navy-800 border border-slate-200"
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
            <Card className="p-6 space-y-5 border-slate-200 bg-white">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                  Ringkasan Kuota
                </h3>
                <div className="p-4 rounded-2xl bg-surface-container border border-primary-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    <div>
                      <p className="text-xs text-slate-500">Kuota Terisi</p>
                      <p className="text-lg font-extrabold text-navy-950 font-epilogue">
                        {pos.terisi_mahasiswa} / {pos.kuota_mahasiswa} Mahasiswa
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-white shadow-sm">
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
                  <span className="text-slate-400">Durasi:</span>
                  <span className="font-bold text-navy-900">45 Hari (200 Jam Kerja)</span>
                </div>
              </div>

              <Button
                onClick={handleApply}
                size="lg"
                variant="primary"
                className="w-full shadow-glow-primary font-bold"
              >
                <span>Ajukan Proposal Kelompok</span>
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={() => toast.success('Tautan berhasil disalin ke papan klip')}
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </Button>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 bg-surface-subtle/50 space-y-3">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Verifikasi Mitra Desa
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pos kebutuhan ini telah ditinjau dan divalidasi oleh Pemerintah Desa{' '}
                <span className="font-bold text-navy-900">{pos.nama_desa}</span> serta disetujui oleh
                LPPM Universitas.
              </p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
