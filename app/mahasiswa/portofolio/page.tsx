'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Award,
  ExternalLink,
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  Share2,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MahasiswaPortofolioPage() {
  const [luaranList, setLuaranList] = useState([
    {
      id: 1,
      judul: 'Portal Katalog & Marketplace Produk UMKM Desa Sukamaju',
      jenis: 'Produk UMKM Inovasi',
      status_desa: 'approved',
      status_dpl: 'approved',
      nilai: 95,
      slug: 'katalog-umkm-sukamaju-2026',
    },
    {
      id: 2,
      judul: 'Video Dokumenter 4K: Denyut Pengabdian & Pesona Desa Sukamaju',
      jenis: 'Video Dokumenter',
      status_desa: 'approved',
      status_dpl: 'approved',
      nilai: 92,
      slug: 'video-dokumenter-sukamaju-2026',
    },
    {
      id: 3,
      judul: 'Buku Saku SOP Pengelolaan Irigasi Cerdas Berbasis Komunitas Tani',
      jenis: 'Modul / Panduan Desa',
      status_desa: 'approved',
      status_dpl: 'pending',
      nilai: null,
      slug: 'buku-irigasi-sukamaju-2026',
    },
  ]);

  return (
    <DashboardLayout title="Luaran Akhir & Portofolio Publik KKN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
              Luaran Akhir & Portofolio
            </h1>
            <p className="text-xs text-slate-500 font-jakarta mt-0.5">
              Setiap karya pengabdian yang disahkan akan diterbitkan menjadi portofolio publik terverifikasi.
            </p>
          </div>

          <Link href="/portofolio/kelompok-14-sukamaju" target="_blank">
            <Button variant="secondary" size="md" className="gap-2 text-xs font-semibold">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Portofolio Publik</span>
            </Button>
          </Link>
        </div>

        {/* Certificate Claim Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-ambient flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold font-epilogue">
                Sertifikat Digital KKN BaktiNusantara
              </h3>
              <p className="text-xs text-emerald-100 font-jakarta">
                Disahkan oleh LPPM & Kepala Desa Sukamaju setelah seluruh BAST tuntas ditandatangani.
              </p>
            </div>
          </div>

          <Button
            onClick={() => toast.success('Pratinjau sertifikat digital terunduh (E-Sertifikat KKN 2026)')}
            size="sm"
            variant="emerald"
            className="whitespace-nowrap font-bold"
          >
            <span>Klaim E-Sertifikat Digital</span>
          </Button>
        </div>

        {/* Luaran Grid */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-navy-950 font-epilogue">
            Daftar Berkas Luaran Kelompok 14
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {luaranList.map((item) => (
              <Card key={item.id} className="p-5 border-slate-200 bg-white flex flex-col justify-between space-y-4 shadow-ambient">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full">
                      {item.jenis}
                    </span>
                    <StatusBadge status={item.status_desa} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-navy-950 font-epilogue leading-snug">
                    {item.judul}
                  </h3>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Verifikasi DPL:</span>
                    <span className="font-semibold text-navy-900 capitalize">{item.status_dpl}</span>
                  </div>
                  {item.nilai && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Nilai Luaran:</span>
                      <span className="font-bold text-emerald-700">{item.nilai} / 100</span>
                    </div>
                  )}

                  <Link href={`/portofolio/${item.slug}`} target="_blank">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 mt-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Halaman Publik</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
