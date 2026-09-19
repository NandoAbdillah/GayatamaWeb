'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
} from 'lucide-react';
import { FALLBACK_POS_DATA, getPosById } from '@/lib/data/pos-kebutuhan-data';

function getKategoriIcon(kategori: string) {
  switch (kategori.toLowerCase()) {
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
  const pos = getPosById(id) || FALLBACK_POS_DATA.find((p) => p.id === id);

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
            <p className="text-xs text-slate-500">ID {String(params?.id)} tidak terdaftar.</p>
            <Link href="/admin/pos-kebutuhan">
              <Button size="sm" variant="outline" className="mt-2 gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Pengajuan
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
        {/* Button kembali - full width layout */}
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
              {pos.kategori}
            </span>
            <StatusBadge status={pos.status} size="sm" />
          </div>

          {/* Judul Besar */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue leading-tight">
              {pos.judul}
            </h1>
            {/* Caption */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {pos.deskripsi}
            </p>
          </div>

          {/* Deskripsi Kebutuhan */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <h2 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
              Deskripsi Kebutuhan
            </h2>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Program ini diajukan oleh <strong className="text-navy-950 dark:text-white">{pos.desa?.nama_desa || 'Desa Mitra'}</strong>{' '}
                yang berlokasi di {pos.desa?.kecamatan || '-'}, {pos.desa?.kabupaten || '-'}, {pos.desa?.provinsi || '-'}. Kebutuhan utama
                yang disampaikan adalah {pos.deskripsi.toLowerCase()} Desa berharap melalui penempatan kelompok KKN, kebutuhan tersebut
                dapat ditangani secara kolaboratif bersama mahasiswa dan DPL.
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
                {pos.deskripsi}
              </p>
            </div>
          </div>

          {/* Alamat Desa */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <h2 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Alamat Desa
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Provinsi</p>
                <p className="text-sm font-semibold text-navy-950 dark:text-white mt-1">{pos.desa?.provinsi || '-'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kabupaten / Kota</p>
                <p className="text-sm font-semibold text-navy-950 dark:text-white mt-1">{pos.desa?.kabupaten || '-'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kecamatan</p>
                <p className="text-sm font-semibold text-navy-950 dark:text-white mt-1">{pos.desa?.kecamatan || '-'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Desa / Kelurahan</p>
                <p className="text-sm font-semibold text-navy-950 dark:text-white mt-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-primary" />
                  {pos.desa?.nama_desa || '-'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
