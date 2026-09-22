'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  CalendarCheck,
  ShieldCheck,
  GraduationCap,
  Users,
  BookOpen,
  Home,
  Award,
  Loader2,
} from 'lucide-react';
import { FALLBACK_UNIV_DETAIL, getKampusById, getLogoUrl, UnivDetail } from '@/lib/data/direktori-kampus-data';
import api from '@/lib/services';
import { toast } from 'sonner';

export default function DirektoriKampusDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params?.id);
  const [kampus, setKampus] = useState<UnivDetail | undefined>(() => getKampusById(id));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setLoading(false);
      return;
    }
    async function loadFromProfilUniversitas() {
      try {
        // Opsi A: ambil langsung dari tabel profil_universitas via verifikasi-entitas detail
        // GET /api/admin/verifikasi-entitas/universitas/{id} -> AdminVerifikasiController@show
        const res = await api.admin.getVerifikasiDetail('universitas', id);
        const data = (res as any)?.data;
        if (data && data.entity_type === 'universitas') {
          const fallback = getKampusById(id) || FALLBACK_UNIV_DETAIL[0];
          const kodeUniv =
            data.detail_info?.find((d: any) => d.label === 'Kode Institusi')?.value ||
            fallback?.kode_univ ||
            `UNIV-${id}`;
          const website =
            fallback?.website || `https://www.${String(kodeUniv).toLowerCase()}.ac.id`;
          const domain =
            fallback?.domain ||
            (() => {
              try {
                return new URL(website).hostname.replace(/^www\./, '');
              } catch {
                return `${String(kodeUniv).toLowerCase()}.ac.id`;
              }
            })();

          const mapped: UnivDetail = {
            id: data.id,
            nama_universitas: data.nama,
            kode_univ: kodeUniv,
            kota: fallback?.kota || data.sub_info || 'Indonesia',
            status: data.status,
            tanggal_verifikasi: data.status === 'verified' ? data.tanggal_pengajuan : '-',
            email: data.email || fallback?.email || '-',
            telepon: data.kontak || fallback?.telepon || '-',
            alamat_lengkap: fallback?.alamat_lengkap || data.sub_info || '-',
            website,
            domain,
            statistik: fallback?.statistik || {
              jumlah_program_kkn: 0,
              jumlah_mahasiswa: 0,
              jumlah_dosen_dpl: Number(
                data.detail_info?.find((d: any) => d.label === 'DPL Terdaftar')?.value?.match(/\d+/)?.[0] || 0
              ),
              jumlah_desa_ditangani: 0,
            },
          };
          setKampus(mapped);
        }
      } catch (err: any) {
        console.warn('Gagal ambil detail profil_universitas, pakai fallback:', err);
        // keep fallback; don't toast to avoid noise if offline, but show if 404
        if (err?.response?.status === 404) {
          toast.error('Data kampus tidak ditemukan di tabel profil_universitas');
        }
      } finally {
        setLoading(false);
      }
    }
    loadFromProfilUniversitas();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Detail Kampus">
        <div className="space-y-4 font-jakarta w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/direktori-kampus')}
            className="gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </Button>
          <Card className="p-12 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-sm font-bold text-navy-950 dark:text-white">Memuat detail kampus dari profil_universitas...</p>
            <p className="text-xs text-slate-500">Mengambil data terverifikasi dari database.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!kampus) {
    return (
      <DashboardLayout title="Detail Kampus">
        <div className="space-y-4 font-jakarta w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/direktori-kampus')}
            className="gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </Button>
          <Card className="p-12 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3">
            <p className="text-sm font-bold text-navy-950 dark:text-white">Kampus tidak ditemukan</p>
            <p className="text-xs text-slate-500">ID {String(params?.id)} tidak terdaftar di tabel profil_universitas.</p>
            <Link href="/admin/direktori-kampus">
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

  return (
    <DashboardLayout title="Detail Kampus">
      <div className="space-y-6 font-jakarta w-full">
        {/* Back button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/direktori-kampus')}
          className="gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali
        </Button>

        {/* Header Kampus - full width */}
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-6 w-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-transparent to-primary/5 dark:from-indigo-950/20 pointer-events-none" />
          <div className="relative">
            <span
              className={`absolute top-0 right-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 ${
                kampus.status === 'verified'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {kampus.status === 'verified' ? 'Terverifikasi' : 'Menunggu Verifikasi'}
            </span>
            <div className="flex items-center gap-4 pr-28 sm:pr-36">
              <img
                src={getLogoUrl(kampus.domain)}
                alt={`Logo ${kampus.kode_univ}`}
                className="w-20 h-20 rounded-2xl object-contain bg-white dark:bg-navy-950 border border-slate-100 dark:border-navy-700 p-1 shrink-0"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div
                className="w-20 h-20 rounded-2xl bg-indigo-600 text-white hidden items-center justify-center font-extrabold text-xl font-epilogue shrink-0"
                style={{ display: 'none' }}
              >
                {kampus.kode_univ.slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue leading-tight">
                  {kampus.nama_universitas}
                </h1>
                <p className="text-sm font-mono text-primary font-bold">{kampus.domain}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Nama Universitas
                </p>
                <p className="text-sm font-bold text-navy-950 dark:text-white mt-1.5 leading-snug">{kampus.nama_universitas}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Kode Universitas
                </p>
                <p className="text-sm font-bold font-mono text-primary mt-1.5">{kampus.kode_univ}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Lokasi
                </p>
                <p className="text-sm font-semibold text-navy-950 dark:text-white mt-1.5">{kampus.kota}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <CalendarCheck className="w-3 h-3" />
                  Tanggal Verifikasi
                </p>
                <p className="text-sm font-bold mt-1.5">
                  <span className="text-slate-500 font-normal">{kampus.tanggal_verifikasi}</span>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Informasi Kampus - full width */}
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm w-full">
          <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Informasi Kampus
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Detail kontak dan alamat resmi perguruan tinggi mitra.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nama Universitas</p>
                <p className="text-sm font-semibold text-navy-950 dark:text-white mt-0.5">{kampus.nama_universitas}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kode Universitas</p>
                <p className="text-sm font-mono font-bold text-navy-950 dark:text-white mt-0.5">{kampus.kode_univ}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-sm font-mono font-medium text-navy-950 dark:text-white mt-0.5 break-all">{kampus.email}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nomor WhatsApp / Telepon</p>
                <p className="text-sm font-mono font-semibold text-navy-950 dark:text-white mt-0.5">{kampus.telepon}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex gap-3 md:col-span-1">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alamat Lengkap</p>
                <p className="text-sm font-medium text-navy-950 dark:text-white mt-0.5 leading-relaxed">{kampus.alamat_lengkap}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Website</p>
                <a href={kampus.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline mt-0.5 inline-block break-all">
                  {kampus.website}
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistik Kampus - full width */}
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm w-full">
          <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Statistik Kampus
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ringkasan capaian dan kontribusi kampus dalam program KKN.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-navy-950 border border-emerald-100 dark:border-emerald-900/50">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue mt-3">
                {kampus.statistik.jumlah_mahasiswa.toLocaleString('id-ID')}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Jumlah Mahasiswa</p>
              <p className="text-[11px] text-slate-400 mt-1">Terlibat KKN</p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-navy-950 border border-amber-100 dark:border-amber-900/50">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue mt-3">
                {kampus.statistik.jumlah_dosen_dpl}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Jumlah Dosen DPL</p>
              <p className="text-[11px] text-slate-400 mt-1">Pembimbing lapangan</p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-white dark:from-sky-950/30 dark:to-navy-950 border border-sky-100 dark:border-sky-900/50">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                <Home className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue mt-3">
                {kampus.statistik.jumlah_desa_ditangani}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Jumlah Desa Ditangani</p>
              <p className="text-[11px] text-slate-400 mt-1">Desa mitra aktif</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
