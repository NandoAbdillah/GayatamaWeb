'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
} from 'lucide-react';
import { toast } from 'sonner';

export default function PublicPortofolioPage() {
  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Verification Pill Header */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Karya Terverifikasi Resmi — Gayatama KKN BaktiNusantara</span>
          </div>

          <Button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Tautan portofolio disalin!');
            }}
            size="sm"
            variant="outline"
            className="text-xs gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Bagikan Portofolio</span>
          </Button>
        </div>

        {/* Portfolio Showcase Card */}
        <Card className="p-8 border-slate-200 bg-white shadow-ambient-lg space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Produk Inovasi & Digitalisasi Desa
            </span>
            <h1 className="text-3xl font-extrabold text-navy-950 font-epilogue leading-snug">
              Portal Katalog & Marketplace Produk UMKM Desa Sukamaju
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Diterbitkan oleh: <span className="font-bold text-navy-900">Kelompok 14 KKN Tematik 2026</span> • Lokasi:{' '}
              <span className="font-bold text-navy-900">Desa Sukamaju, Ciawi, Bogor</span>
            </p>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Media Showcase */}
          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000&auto=format&fit=crop&q=80"
              alt="Preview Website UMKM"
              className="w-full h-80 object-cover"
            />
          </div>

          {/* Description */}
          <div className="space-y-3 font-jakarta text-sm text-slate-700 leading-relaxed">
            <h3 className="text-base font-bold text-navy-950 font-epilogue">
              Deskripsi Proyek & Dampak Masyarakat
            </h3>
            <p>
              Platform ini dibangun untuk mengangkat potensi 42 pelaku UMKM di Desa Sukamaju, meliputi
              komoditas olahan talas bogor, madu hutan murni, dan kerajinan anyaman bambu. Website ini
              mengintegrasikan katalog digital berbasis foto produk profesional, fitur pemesanan langsung
              ke WhatsApp penjual, serta modul tracking order terpadu.
            </p>
          </div>

          {/* Validation Signatures Box */}
          <div className="p-5 rounded-2xl bg-surface-subtle border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">
                Pengesahan Pemerintah Desa:
              </span>
              <p className="font-bold text-navy-950">H. Ahmad Subardjo (Kepala Desa Sukamaju)</p>
              <p className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> BAST Terbit: No. BAST/014/KKN-SKM/IX/2026
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">
                Pengesahan Dosen Pembimbing:
              </span>
              <p className="font-bold text-navy-950">Dr. Ir. Hendra Gunawan, M.T.</p>
              <p className="text-primary-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Nilai Evaluasi Lapangan: 95 / 100
              </p>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
