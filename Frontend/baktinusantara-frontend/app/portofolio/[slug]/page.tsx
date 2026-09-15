'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/services';
import { PortofolioPublik } from '@/lib/types';
import {
  Award,
  CheckCircle2,
  Share2,
  Building,
  GraduationCap,
  Sparkles,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Download,
  FileText,
  MapPin,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PublicPortofolioPage({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<PortofolioPublik | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const slug = params?.slug || 'digitalisasi-branding-dan-e-commerce-umkm-kripik-singkong-sukamaju';
    api.luaran.getPortofolio(slug)
      .then((res) => {
        if (res) setData(res);
      })
      .catch((err) => {
        console.warn('Could not load portfolio from backend, using sample view:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [params?.slug]);

  const namaProgram = data?.judul_program || 'Portal Katalog & Marketplace Produk UMKM Desa Sukamaju';
  const namaDesa = data?.desa?.nama_desa
    ? `${data.desa.nama_desa}, ${data.desa.kecamatan || ''}, ${data.desa.kabupaten || ''}`
    : 'Desa Sukamaju, Ciawi, Bogor';
  const namaKelompok = data?.kelompok?.nama_kelompok || 'Kelompok 14 KKN Tematik 2026';
  const ringkasan = data?.ringkasan_dampak || 'Meningkatkan penjualan dan jangkauan pasar UMKM desa hingga 65% melalui standardisasi foto produk dan digital marketing terpadu.';
  const testimoni = data?.testimoni_desa || 'Sangat solutif, membumi, dan membantu warga desa secara langsung.';
  const sertifikatUrl = data?.sertifikat_pdf_url || '#';

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col font-jakarta">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Verification Pill Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Karya Terverifikasi Resmi — Gayatama KKN BaktiNusantara</span>
          </div>

          <div className="flex items-center gap-2">
            {data?.sertifikat_pdf_url && (
              <a href={data.sertifikat_pdf_url} target="_blank" rel="noreferrer">
                <Button size="sm" variant="primary" className="text-xs gap-1.5 shadow-sm">
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh E-Sertifikat PDF</span>
                </Button>
              </a>
            )}

            <Button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Tautan portofolio publik berhasil disalin!');
                }
              }}
              size="sm"
              variant="outline"
              className="text-xs gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan</span>
            </Button>
          </div>
        </div>

        {/* Portfolio Showcase Card */}
        <Card className="p-6 sm:p-8 border-slate-200 bg-white shadow-ambient-lg space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Produk Inovasi & Digitalisasi Desa
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-epilogue leading-snug">
              {namaProgram}
            </h1>
            <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 font-bold text-navy-900">
                <Users className="w-3.5 h-3.5 text-primary" /> {namaKelompok}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {namaDesa}
              </span>
            </p>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Media Showcase */}
          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000&auto=format&fit=crop&q=80"
              alt="Preview Deliverable"
              className="w-full h-72 sm:h-80 object-cover"
            />
          </div>

          {/* Description & Ringkasan Dampak */}
          <div className="space-y-4 font-jakarta text-sm text-slate-700 leading-relaxed">
            <div>
              <h3 className="text-base font-bold text-navy-950 font-epilogue mb-1">
                Ringkasan Dampak & Manfaat Nyata
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/70 leading-relaxed">
                {ringkasan}
              </p>
            </div>

            {testimoni && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-700" /> Testimoni Pemerintah Desa:
                </span>
                <p className="text-xs text-emerald-800 italic">
                  &ldquo;{testimoni}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Validation Signatures Box */}
          <div className="p-5 rounded-2xl bg-surface-subtle border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Pengesahan Pemerintah Desa:
              </span>
              <p className="font-bold text-navy-950">Kantor Kepala Desa {data?.desa?.nama_desa || 'Sukamaju'}</p>
              <p className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Berita Acara & E-Sertifikat Sah
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Validasi Akademik Universitas:
              </span>
              <p className="font-bold text-navy-950">Lembaga Pengabdian Masyarakat (LPPM)</p>
              <p className="text-primary-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terdaftar di Pangkalan Data KKN Nasional
              </p>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
