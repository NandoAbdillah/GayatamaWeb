'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Home,
  MapPin,
  Mail,
  Phone,
  CalendarCheck,
  ShieldCheck,
  FileText,
  Navigation,
  Loader2,
} from 'lucide-react';
import { VerifikasiItem } from '@/lib/data/verifikasi-data';
import api from '@/lib/services';
import { toast } from 'sonner';

export default function DirektoriDesaDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params?.id);
  const [desa, setDesa] = useState<VerifikasiItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setLoading(false);
      return;
    }
    async function loadFromProfilDesa() {
      try {
        const res = await api.admin.getVerifikasiDetail('desa', id);
        const data = (res as any)?.data;
        if (data && data.entity_type === 'desa') {
          setDesa(data as VerifikasiItem);
        }
      } catch (err: any) {
        console.warn('Gagal ambil detail profil_desa:', err);
        if (err?.response?.status === 404) {
          toast.error('Data desa tidak ditemukan di tabel profil_desa');
        }
      } finally {
        setLoading(false);
      }
    }
    loadFromProfilDesa();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Detail Desa">
        <div className="space-y-4 font-jakarta w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/direktori-desa')}
            className="gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </Button>
          <Card className="p-12 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-navy-950 dark:text-white">Memuat detail desa dari profil_desa...</p>
            <p className="text-xs text-slate-500">Mengambil data terverifikasi dari database.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!desa) {
    return (
      <DashboardLayout title="Detail Desa">
        <div className="space-y-4 font-jakarta w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/direktori-desa')}
            className="gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </Button>
          <Card className="p-12 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3">
            <p className="text-sm font-bold text-navy-950 dark:text-white">Desa tidak ditemukan</p>
            <p className="text-xs text-slate-500">ID {String(params?.id)} tidak terdaftar di tabel profil_desa.</p>
            <Link href="/admin/direktori-desa">
              <Button size="sm" variant="outline" className="mt-2 gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Direktori
              </Button>
            </Link>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const getDetailValue = (label: string) =>
    desa.detail_info?.find((d) => d.label === label)?.value || '-';

  const wilayah = getDetailValue('Wilayah Administratif');
  const koordinat = getDetailValue('Koordinat Lokasi');
  const posCount = getDetailValue('Pos Kebutuhan Terdata');
  const kontakResmi = getDetailValue('Kontak Resmi Perangkat');

  return (
    <DashboardLayout title="Detail Desa">
      <div className="space-y-6 font-jakarta w-full">
        {/* Back button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/direktori-desa')}
          className="gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali
        </Button>

        {/* Header Desa - full width */}
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-6 w-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-teal-50/40 dark:from-emerald-950/20 pointer-events-none" />
          <div className="relative">
            <span
              className={`absolute top-0 right-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 ${
                desa.status === 'verified'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {desa.status === 'verified' ? 'Terverifikasi' : 'Menunggu Verifikasi'}
            </span>
            <div className="flex items-center gap-4 pr-28 sm:pr-36">
              <div className="w-20 h-20 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xl font-epilogue shrink-0 shadow-sm">
                <Home className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue leading-tight">
                  {desa.nama}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {wilayah !== '-' ? wilayah : desa.sub_info}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  Nama Desa
                </p>
                <p className="text-sm font-bold text-navy-950 dark:text-white mt-1.5 leading-snug">{desa.nama}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  Wilayah Administratif
                </p>
                <p className="text-sm font-semibold text-navy-950 dark:text-white mt-1.5 leading-snug">{wilayah}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Koordinat Lokasi
                </p>
                <p className="text-sm font-mono font-semibold text-navy-950 dark:text-white mt-1.5">{koordinat}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <CalendarCheck className="w-3 h-3" />
                  Tanggal Verifikasi
                </p>
                <p className="text-sm font-bold mt-1.5">
                  <span className="text-slate-500 font-normal">{desa.tanggal_pengajuan || '-'}</span>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Informasi Desa - full width */}
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm w-full">
          <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue flex items-center gap-2">
            <Home className="w-4 h-4 text-emerald-600" />
            Informasi Desa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Detail kontak dan lokasi resmi desa mitra.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                <Home className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nama Desa</p>
                <p className="text-sm font-semibold text-navy-950 dark:text-white mt-0.5">{desa.nama}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Wilayah Administratif</p>
                <p className="text-sm font-medium text-navy-950 dark:text-white mt-0.5 leading-relaxed">{wilayah}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Koordinat Lokasi</p>
                <p className="text-sm font-mono font-semibold text-navy-950 dark:text-white mt-0.5">{koordinat}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kontak Resmi Perangkat</p>
                <p className="text-sm font-mono font-semibold text-navy-950 dark:text-white mt-0.5">{kontakResmi}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-sm font-mono font-medium text-navy-950 dark:text-white mt-0.5 break-all">{desa.email || '-'}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Pemohon: {desa.pemohon}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dokumen SK</p>
                <p className="text-sm font-medium text-navy-950 dark:text-white mt-0.5 truncate" title={desa.dokumen}>
                  {desa.dokumen}
                </p>
                {desa.dokumen_url ? (
                  <a href={desa.dokumen_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Lihat Dokumen
                  </a>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">Tidak ada file</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Statistik Desa - full width */}
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm w-full">
          <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-600" />
            Statistik Desa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ringkasan capaian desa dalam program KKN.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-navy-950 border border-emerald-100 dark:border-emerald-900/50">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue mt-3">
                {posCount !== '-' ? posCount : '0'}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Pos Kebutuhan Aktif</p>
              <p className="text-[11px] text-slate-400 mt-1">Program desa terdata</p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-white dark:from-sky-950/30 dark:to-navy-950 border border-sky-100 dark:border-sky-900/50">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-3">Koordinat</p>
              <p className="text-sm font-mono font-bold text-navy-950 dark:text-white mt-1">{koordinat}</p>
              <p className="text-[11px] text-slate-400 mt-1">Lokasi geospasial</p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-navy-950 border border-amber-100 dark:border-amber-900/50">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-navy-950 dark:text-white font-epilogue mt-3">
                {desa.status === 'verified' ? 'Terverifikasi Resmi' : 'Menunggu Verifikasi'}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Status Legalitas</p>
              <p className="text-[11px] text-slate-400 mt-1">{desa.tanggal_pengajuan}</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
