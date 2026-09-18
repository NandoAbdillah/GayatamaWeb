'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

export default function PublicPortofolioPage() {
  const routeParams = useParams();
  const rawSlug = routeParams?.slug;
  const slug = (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug) || 'kelompok-14-sukamaju';
  const [data, setData] = useState<PortofolioPublik | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, [slug]);

  const namaProgram = data?.judul_program || 'Portal Katalog & Marketplace Produk UMKM Desa Sukamaju';
  const namaDesa = data?.desa?.nama_desa
    ? `${data.desa.nama_desa}, ${data.desa.kecamatan || ''}, ${data.desa.kabupaten || ''}`
    : 'Desa Sukamaju, Ciawi, Bogor';
  const namaKelompok = data?.kelompok?.nama_kelompok || 'Kelompok 14 KKN Tematik 2026';
  const ringkasan = data?.ringkasan_dampak || 'Meningkatkan penjualan dan jangkauan pasar UMKM desa hingga 65% melalui standardisasi foto produk dan digital marketing terpadu.';
  const testimoni = data?.testimoni_desa || 'Sangat solutif, membumi, dan membantu warga desa secara langsung.';
  const sertifikatUrl = data?.sertifikat_pdf_url || '#';

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] flex flex-col font-jakarta transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Verification Pill Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
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
              className="text-xs gap-1.5 border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-navy-800"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan</span>
            </Button>
          </div>
        </div>

        {/* Portfolio Showcase Card */}
        <Card className="p-6 sm:p-8 border-slate-200/90 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-card space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/70 border border-primary-100 dark:border-primary-800/50 px-3 py-1 rounded-full uppercase tracking-wider">
              Produk Inovasi & Digitalisasi Desa
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue leading-snug">
              {namaProgram}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 font-bold text-navy-900 dark:text-slate-200">
                <Users className="w-3.5 h-3.5 text-primary dark:text-primary-400" /> {namaKelompok}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {namaDesa}
              </span>
            </p>
          </div>

          <div className="h-px bg-slate-100 dark:bg-navy-800" />

          {/* Media Showcase */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-navy-700/80">
            <img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000&auto=format&fit=crop&q=80"
              alt="Preview Deliverable"
              className="w-full h-72 sm:h-80 object-cover"
            />
          </div>

          {/* Description & Ringkasan Dampak */}
          <div className="space-y-4 font-jakarta text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <div>
              <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue mb-1.5">
                Ringkasan Dampak & Manfaat Nyata
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-navy-950/80 p-4 rounded-xl border border-slate-200/70 dark:border-navy-800 leading-relaxed">
                {ringkasan}
              </p>
            </div>

            {testimoni && (
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" /> Testimoni Pemerintah Desa:
                </span>
                <p className="text-xs text-emerald-800 dark:text-emerald-200/90 italic leading-relaxed">
                  &ldquo;{testimoni}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Validation Signatures Box */}
          <div className="p-5 rounded-2xl bg-surface-subtle dark:bg-navy-950/70 border border-slate-200 dark:border-navy-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Pengesahan Pemerintah Desa:
              </span>
              <p className="font-bold text-navy-950 dark:text-white">Kantor Kepala Desa {data?.desa?.nama_desa || 'Sukamaju'}</p>
              <p className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Berita Acara & E-Sertifikat Sah
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Validasi Akademik Universitas:
              </span>
              <p className="font-bold text-navy-950 dark:text-white">Lembaga Pengabdian Masyarakat (LPPM)</p>
              <p className="text-primary-700 dark:text-primary-400 font-semibold flex items-center gap-1">
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
