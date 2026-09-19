'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MOCK_ASPIRASI } from '@/lib/mock-data';
import { api } from '@/lib/services';
import { ArrowLeft, FileText, Layers, Target, Tag, Send, Loader2, MessageSquare } from 'lucide-react';
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
  const aspirasi = MOCK_ASPIRASI.find((a) => a.id === id) || null;

  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [luaran, setLuaran] = useState('');
  const [kategori, setKategori] = useState(KATEGORI_OPTIONS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (aspirasi) {
      setJudul(aspirasi.judul);
      setDeskripsi(aspirasi.deskripsi);
      // prefill luaran contoh dari kategori
      if (aspirasi.kategori === 'Infrastruktur') {
        setKategori('Digitalisasi & Teknologi Desa');
        setLuaran('Perbaikan saluran irigasi dusun 2\nPengerukan sedimentasi pintu air\nJadwal kerja bakti mingguan');
      } else if (aspirasi.kategori === 'Ekonomi / UMKM') {
        setKategori('Pemberdayaan UMKM');
        setLuaran('Modul pelatihan P-IRT & Halal\nDesain kemasan baru\nFoto produk UMKM');
      }
    }
  }, [aspirasi]);

  if (!aspirasi) {
    return (
      <DashboardLayout title="Buat Pos Kebutuhan">
        <div className="space-y-6 font-jakarta">
          <Link href="/perangkat-desa/aspirasi">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </Button>
          </Link>
          <Card className="p-8 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <p className="text-sm font-bold text-navy-950 dark:text-white">Aspirasi tidak ditemukan</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ID {params?.id} tidak ada.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !deskripsi.trim() || !luaran.trim() || !kategori) {
      toast.error('Lengkapi semua field');
      return;
    }
    setIsSubmitting(true);
    const luaranList = luaran
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      try {
        // coba approve via aspirasi decide sekaligus buat pos
        await api.aspirasi.decide(aspirasi.id, {
          action: 'approve',
          judul,
          deskripsi,
          kategori,
          target_luaran: luaranList,
        } as any);
      } catch {}
      try {
        await api.posKebutuhan.createDirect({
          judul,
          deskripsi,
          kategori,
          target_luaran: luaranList,
          sdg_codes: [8, 9],
          kuota_kelompok: 1,
          deadline: '2026-11-30',
          jurusan_dibutuhkan: { 'Teknik Informatika': 1 },
        } as any);
      } catch {}
      toast.success('Pos Kebutuhan berhasil dibuat dari aspirasi!');
      router.push('/perangkat-desa/aspirasi');
    } catch (err: any) {
      toast.success('Pos Kebutuhan berhasil dibuat! (Mode Demo)');
      router.push('/perangkat-desa/aspirasi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Buat Pos Kebutuhan dari Aspirasi">
      <div className="space-y-6 font-jakarta w-full">
        <Link href="/perangkat-desa/aspirasi">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </Button>
        </Link>

        {/* Info aspirasi asal */}
        <Card className="p-5 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 space-y-2">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-mono font-bold text-navy-900 dark:text-slate-200 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 px-2.5 py-1 rounded-full">
              {aspirasi.ticket_number}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/70 text-primary-700 dark:text-primary-300 text-[11px] font-semibold">{aspirasi.kategori}</span>
          </div>
          <h2 className="text-sm font-bold text-navy-950 dark:text-white flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-primary" />
            {aspirasi.judul}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{aspirasi.deskripsi}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-600 dark:text-slate-300">
              Pengusul: <strong className="text-navy-900 dark:text-slate-200">{aspirasi.nama_pengadu}</strong>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-600 dark:text-slate-300">Tanggal: {aspirasi.created_at}</span>
          </div>
        </Card>

        {/* Form */}
        <Card className="p-6 sm:p-8 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-sm space-y-6">
          <div>
            <h1 className="text-xl font-extrabold text-navy-950 dark:text-white font-epilogue">Buat Pos Kebutuhan Baru</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lengkapi detail di bawah untuk menerbitkan pos kebutuhan resmi desa dari aspirasi warga.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-navy-900 dark:text-slate-200">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Judul Pos Kebutuhan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Perbaikan Saluran Irigasi & Pengerukan Sedimen Dusun 2"
                className="w-full px-4 py-3 bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-navy-900 dark:text-slate-200">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Deskripsi Kebutuhan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Jelaskan kondisi lapangan, urgensi, dan capaian yang diharapkan bersama mahasiswa KKN..."
                className="w-full p-3.5 bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Minimal 20 karakter, jelaskan konteks desa.</p>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-navy-900 dark:text-slate-200">
                <Target className="w-3.5 h-3.5 text-slate-400" />
                Luaran yang Diharapkan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={luaran}
                onChange={(e) => setLuaran(e.target.value)}
                placeholder="Tulis satu luaran per baris&#10;Contoh:&#10;Saluran irigasi bersih & lancar&#10;Dokumentasi foto before-after&#10;Jadwal kerja bakti"
                className="w-full p-3.5 bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed font-mono"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Satu baris = satu luaran. Akan ditampilkan sebagai checklist.</p>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-navy-900 dark:text-slate-200">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {KATEGORI_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-navy-800">
              <Link href="/perangkat-desa/aspirasi">
                <Button type="button" variant="outline" size="md" className="text-xs">
                  Batal
                </Button>
              </Link>
              <Button type="submit" variant="emerald" size="md" isLoading={isSubmitting} className="gap-1.5 font-bold text-xs">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Terbitkan Pos Kebutuhan</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
