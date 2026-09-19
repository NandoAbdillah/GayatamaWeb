'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MOCK_KELOMPOK_14 } from '@/lib/mock-data';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const KELOMPOK_MAP: Record<number, { nama_kelompok: string; kode_kelompok: string }> = {
  14: { nama_kelompok: MOCK_KELOMPOK_14.nama_kelompok, kode_kelompok: MOCK_KELOMPOK_14.kode_kelompok },
  15: { nama_kelompok: 'Kelompok 15 - Sukamaju Sejahtera', kode_kelompok: 'KKN-2026-SKM-015' },
  11: { nama_kelompok: 'Kelompok 11 - Sukamaju Kreatif', kode_kelompok: 'KKN-2026-SKM-011' },
};

export default function BastNilaiPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params?.id);
  const kelompok = KELOMPOK_MAP[id] || { nama_kelompok: `Kelompok ${id}`, kode_kelompok: `KKN-2026-SKM-${String(id).padStart(3, '0')}` };

  const [skor1, setSkor1] = useState(0);
  const [skor2, setSkor2] = useState(0);
  const [skor3, setSkor3] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('bast-penilaian');
      if (raw) {
        const map = JSON.parse(raw);
        if (map[id]) {
          setSkor1(map[id].skor1 ?? 0);
          setSkor2(map[id].skor2 ?? 0);
          setSkor3(map[id].skor3 ?? 0);
        }
      }
    } catch {}
  }, [id]);

  const nilaiAkhir = Math.round((Number(skor1) + Number(skor2) + Number(skor3)) / 3) || 0;

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    const s1 = Number(skor1);
    const s2 = Number(skor2);
    const s3 = Number(skor3);
    if (s1 < 0 || s1 > 100 || s2 < 0 || s2 > 100 || s3 < 0 || s3 > 100) {
      toast.error('Nilai harus 0 - 100');
      return;
    }
    try {
      const raw = localStorage.getItem('bast-penilaian');
      const map = raw ? JSON.parse(raw) : {};
      map[id] = { skor1: s1, skor2: s2, skor3: s3, nilaiAkhir };
      localStorage.setItem('bast-penilaian', JSON.stringify(map));
    } catch {}
    toast.success('Penilaian berhasil disimpan');
    router.push('/perangkat-desa/bast');
  };

  return (
    <DashboardLayout title={`Penilaian ${kelompok.nama_kelompok}`}>
      <div className="space-y-6 font-jakarta w-full max-w-2xl">
        <Link href="/perangkat-desa/bast">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </Button>
        </Link>

        <div>
          <h1 className="text-xl font-extrabold text-navy-950 dark:text-white font-epilogue">Penilaian Kelompok</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {kelompok.nama_kelompok} • {kelompok.kode_kelompok}
          </p>
        </div>

        <Card className="p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-sm">
          <form onSubmit={handleSimpan} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-navy-900 dark:text-slate-200">1. Kedisiplinan & Kesantunan Sosial di Desa:</label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={skor1}
                onChange={(e) => setSkor1(Number(e.target.value))}
                placeholder="0 - 100"
                className="w-full px-4 py-3 bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-navy-900 dark:text-slate-200">2. Kebermanfaatan & Dampak Nyata bagi Warga:</label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={skor2}
                onChange={(e) => setSkor2(Number(e.target.value))}
                placeholder="0 - 100"
                className="w-full px-4 py-3 bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-navy-900 dark:text-slate-200">3. Kualitas Produk / Luaran yang Diserahkan:</label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={skor3}
                onChange={(e) => setSkor3(Number(e.target.value))}
                placeholder="0 - 100"
                className="w-full px-4 py-3 bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-center">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nilai Akhir</p>
              <p className="text-2xl font-extrabold text-navy-950 dark:text-white mt-1">{nilaiAkhir} / 100</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-navy-800">
              <Link href="/perangkat-desa/bast">
                <Button type="button" variant="outline" size="md" className="text-xs">
                  Batal
                </Button>
              </Link>
              <Button type="submit" variant="emerald" size="md" className="text-xs font-bold">
                Simpan
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
