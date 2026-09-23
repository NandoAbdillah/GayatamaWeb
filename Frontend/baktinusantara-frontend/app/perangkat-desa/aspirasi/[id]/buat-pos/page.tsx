'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/services';
import { ArrowLeft, FileText, Layers, Target, Tag, Send, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const KATEGORI_OPTIONS: { value: string; label: string }[] = [
  { value: 'Digitalisasi & Teknologi Desa', label: 'Digitalisasi & Teknologi Desa' },
  { value: 'Agrikultur & Ketahanan Pangan', label: 'Agrikultur & Ketahanan Pangan' },
  { value: 'Kesehatan & Sanitasi', label: 'Kesehatan & Sanitasi' },
  { value: 'Pemberdayaan UMKM', label: 'Pemberdayaan UMKM' },
  { value: 'Pendidikan & Literasi', label: 'Pendidikan & Literasi' },
  { value: 'Lingkungan & Energi', label: 'Lingkungan & Energi' },
];

export default function BuatPosDariAspirasiPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params?.id);

  const [loading, setLoading] = useState(true);
  const [aspirasi, setAspirasi] = useState<any>(null);
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [luaran, setLuaran] = useState('');
  const [kategori, setKategori] = useState(KATEGORI_OPTIONS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadAspirasi() {
      try {
        setLoading(true);
        const res = await api.aspirasi.getByDesa();
        if (Array.isArray(res)) {
          const found = res.find((a: any) => a.id === id);
          if (found) {
            setAspirasi(found);
            setJudul(found.judul || '');
            setDeskripsi(found.deskripsi || '');
            setLuaran('1. Sosialisasi & Edukasi Warga Desa\n2. Penerapan Solusi & Pendampingan Berkelanjutan\n3. Laporan Akhir Hasil Pengabdian');
          } else {
            setAspirasi(null);
          }
        }
      } catch (err) {
        console.error('Gagal mengambil aspirasi:', err);
        setAspirasi(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadAspirasi();
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Buat Pos Kebutuhan">
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Memuat data aspirasi warga...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!aspirasi) {
    return (
      <DashboardLayout title="Buat Pos Kebutuhan">
        <div className="space-y-6 font-jakarta">
          <Link href="/perangkat-desa/aspirasi">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </Button>
          </Link>
          <Card className="p-12 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-navy-950 dark:text-white">Aspirasi Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Aspirasi dengan ID {params?.id} tidak ditemukan di database desa Anda.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !deskripsi.trim() || !luaran.trim() || !kategori) {
      toast.error('Harap lengkapi semua field');
      return;
    }
    setIsSubmitting(true);

    try {
      // Panggil endpoint resmi PATCH /api/desa/aspirasi/{id}/decide dengan action approve
      // yang di backend otomatis mengubah status aspirasi dan menerbitkan Pos Kebutuhan riil
      await api.aspirasi.decide(aspirasi.id, {
        action: 'approve',
        judul: judul.trim(),
        kuota_kelompok: 1,
        deadline: '2026-12-31',
        jurusan_dibutuhkan: [1, 2],
        sdg_codes: [8, 9, 11],
      } as any);

      toast.success('Aspirasi berhasil disahkan dan Pos Kebutuhan baru resmi diterbitkan!');
      router.push('/perangkat-desa/pos-kebutuhan');
    } catch (err: any) {
      console.error('Gagal menerbitkan pos kebutuhan dari aspirasi:', err);
      const errMsg = err?.response?.data?.message || 'Gagal menerbitkan Pos Kebutuhan.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Buat Pos Kebutuhan dari Aspirasi">
      <div className="space-y-6 font-jakarta max-w-4xl">
        <Link href="/perangkat-desa/aspirasi">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Aspirasi
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
            Terbitkan Pos Kebutuhan KKN dari Aspirasi Warga
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data aspirasi warga otomatis diverifikasi dan diubah menjadi program pos kebutuhan terbuka bagi mahasiswa perguruan tinggi.
          </p>
        </div>

        {/* Info Aspirasi Card */}
        <Card className="p-5 border-slate-200 dark:border-navy-800 bg-surface-subtle dark:bg-navy-950 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-primary dark:text-primary-300">
              {aspirasi.ticket_number || `ASP-#${aspirasi.id}`}
            </span>
            <span className="text-[11px] text-slate-400">
              Pengusul: {aspirasi.nama_pengadu || aspirasi.pelapor_nama || 'Warga'} ({aspirasi.nomor_kontak || aspirasi.pelapor_wa || '-'})
            </span>
          </div>
          <h3 className="text-sm font-bold text-navy-950 dark:text-white">{aspirasi.judul}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{aspirasi.deskripsi}</p>
        </Card>

        {/* Formulir Pos Kebutuhan */}
        <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy-950 dark:text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Judul Pos Kebutuhan KKN
              </label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full p-3 bg-surface-subtle dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl text-xs text-navy-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy-950 dark:text-white flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />
                Kategori Sektor KKN
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full p-3 bg-surface-subtle dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl text-xs text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              >
                {KATEGORI_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy-950 dark:text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" />
                Deskripsi Masalah & Kebutuhan Riil di Lapangan
              </label>
              <textarea
                rows={4}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full p-3 bg-surface-subtle dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl text-xs text-navy-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy-950 dark:text-white flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                Ekspektasi Target Luaran yang Diharapkan
              </label>
              <textarea
                rows={4}
                value={luaran}
                onChange={(e) => setLuaran(e.target.value)}
                placeholder="Tuliskan target per baris (contoh: 1. Aplikasi web desa, 2. Modul pelatihan)..."
                className="w-full p-3 bg-surface-subtle dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl text-xs text-navy-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
              <Link href="/perangkat-desa/aspirasi">
                <Button variant="outline" size="sm" type="button" className="text-xs" disabled={isSubmitting}>
                  Batal
                </Button>
              </Link>
              <Button
                type="submit"
                variant="emerald"
                size="sm"
                className="text-xs gap-1.5 shadow-glow-secondary"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Sahkan Aspirasi & Terbitkan Pos</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
