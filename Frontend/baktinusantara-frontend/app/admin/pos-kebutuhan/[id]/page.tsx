'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/services';
import {
  ArrowLeft,
  Building,
  MapPin,
  ClipboardList,
  BookOpen,
  Heart,
  Leaf,
  Wrench,
  Store,
  Loader2,
  Calendar,
  Users,
} from 'lucide-react';

function getKategoriIcon(kategori: string) {
  switch (kategori?.toLowerCase()) {
    case 'umkm':
      return Store;
    case 'lingkungan':
      return Leaf;
    case 'kesehatan':
      return Heart;
    case 'pendidikan':
      return BookOpen;
    case 'fasilitas':
      return Wrench;
    default:
      return ClipboardList;
  }
}

export default function PosKebutuhanDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params?.id);
  const [pos, setPos] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosDetail() {
      if (!id || Number.isNaN(id)) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.posKebutuhan.getById(id);
        if (res) {
          setPos(res);
        } else {
          setPos(null);
        }
      } catch (err) {
        console.error('Gagal mengambil detail pos kebutuhan:', err);
        setPos(null);
      } finally {
        setLoading(false);
      }
    }

    loadPosDetail();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Detail Pos Kebutuhan">
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs text-slate-500">Memuat rincian pos kebutuhan desa...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!pos) {
    return (
      <DashboardLayout title="Detail KKN">
        <div className="space-y-4 font-jakarta w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/pos-kebutuhan')}
            className="gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </Button>
          <Card className="p-12 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3">
            <p className="text-sm font-bold text-navy-950 dark:text-white">Pos kebutuhan tidak ditemukan</p>
            <p className="text-xs text-slate-500">ID {String(params?.id)} tidak terdaftar dalam server.</p>
            <Link href="/admin/pos-kebutuhan">
              <Button size="sm" variant="outline" className="mt-2 gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Pengawasan Pos
              </Button>
            </Link>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const Icon = getKategoriIcon(pos.kategori);

  return (
    <DashboardLayout title="Detail KKN">
      <div className="space-y-6 font-jakarta w-full">
        {/* Button kembali */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/pos-kebutuhan')}
          className="gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali
        </Button>

        <Card className="p-6 sm:p-8 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-6 w-full">
          {/* Kategori & Status */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary capitalize">
              <Icon className="w-4 h-4" />
              {pos.kategori || 'Umum'}
            </span>
            <StatusBadge status={pos.status} size="sm" />
          </div>

          {/* Judul Besar */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue tracking-tight">
              {pos.judul}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span className="flex items-center gap-1 font-semibold text-navy-900 dark:text-slate-200">
                <Building className="w-4 h-4 text-primary" />
                Desa {pos.desa?.nama_desa || 'Mitra'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                {pos.desa?.kecamatan ? `Kec. ${pos.desa.kecamatan}, ` : ''}{pos.desa?.kabupaten || 'Wilayah Desa'}
              </span>
            </div>
          </div>

          {/* Ringkasan & Deskripsi */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-navy-800">
            <h2 className="text-sm font-bold text-navy-950 dark:text-white uppercase tracking-wider">
              Deskripsi Kebutuhan Masyarakat
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {pos.deskripsi}
            </p>
          </div>

          {/* Info SDG & Batas Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-navy-800">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Fokus Utama SDG
              </span>
              <p className="text-sm font-bold text-navy-950 dark:text-white">
                {pos.sdg_target || 'SDG 8: Pekerjaan Layak & Pertumbuhan Ekonomi'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Batas Pengajuan Proposal
              </span>
              <p className="text-sm font-bold text-navy-950 dark:text-white">
                {pos.batas_waktu || 'Terbuka untuk Periode Berjalan'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
