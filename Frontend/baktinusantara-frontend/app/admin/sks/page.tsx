'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FileCheck2, CheckCircle2, Download, GraduationCap, Building } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSksPage() {
  const [kelompokList, setKelompokList] = useState([
    {
      id: 1,
      nama: 'Kelompok 14 — Desa Sukamaju',
      dpl: 'Dr. Ir. Hendra Gunawan, M.T.',
      kades: 'H. Ahmad Subardjo',
      nilaiRata: 93.4,
      sks: 4,
      status: 'approved',
      anggota: 5,
    },
    {
      id: 2,
      nama: 'Kelompok 08 — Desa Cibodas Asri',
      dpl: 'Dr. Ir. Hendra Gunawan, M.T.',
      kades: 'Drs. Mulyadi',
      nilaiRata: 91.8,
      sks: 4,
      status: 'pending',
      anggota: 6,
    },
  ]);

  const handleApproveSks = (id: number) => {
    setKelompokList(
      kelompokList.map((k) => (k.id === id ? { ...k, status: 'approved' } : k))
    );
    toast.success('Konversi 4 SKS berhasil disahkan untuk seluruh anggota kelompok!');
  };

  return (
    <DashboardLayout title="Pengesahan Konversi SKS & Kelulusan KKN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
            Konversi SKS Akademik KKN
          </h1>
          <p className="text-xs text-slate-500 font-jakarta mt-0.5">
            LPPM mengonversi nilai kumulatif BAST Desa dan evaluasi DPL ke dalam bobot 2-4 SKS mata kuliah pengabdian.
          </p>
        </div>

        <div className="space-y-4">
          {kelompokList.map((k) => (
            <Card key={k.id} className="p-6 border-slate-200 bg-white space-y-4 shadow-ambient">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-navy-950 font-epilogue">{k.nama}</h3>
                  <p className="text-xs text-slate-500">
                    DPL: <strong className="text-navy-900">{k.dpl}</strong> • Mitra Desa: <strong className="text-navy-900">{k.kades}</strong>
                  </p>
                </div>
                <StatusBadge status={k.status} size="sm" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-jakarta">
                <div className="p-3 rounded-2xl bg-surface-subtle">
                  <span className="text-slate-400 font-medium">Nilai Akhir Kumulatif:</span>
                  <p className="text-lg font-extrabold text-navy-950 mt-0.5">{k.nilaiRata} (A)</p>
                </div>

                <div className="p-3 rounded-2xl bg-surface-subtle">
                  <span className="text-slate-400 font-medium">Bobot Konversi:</span>
                  <p className="text-lg font-extrabold text-primary mt-0.5">{k.sks} SKS</p>
                </div>

                <div className="p-3 rounded-2xl bg-surface-subtle">
                  <span className="text-slate-400 font-medium">Jumlah Mahasiswa:</span>
                  <p className="text-lg font-extrabold text-navy-950 mt-0.5">{k.anggota} Orang</p>
                </div>

                <div className="p-3 rounded-2xl bg-surface-subtle">
                  <span className="text-slate-400 font-medium">Status BAST Desa:</span>
                  <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Sah
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                {k.status !== 'approved' && (
                  <Button
                    onClick={() => handleApproveSks(k.id)}
                    variant="emerald"
                    size="sm"
                    className="shadow-glow-secondary gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sahkan Konversi {k.sks} SKS</span>
                  </Button>
                )}
                <Button
                  onClick={() => toast.success('Transkrip nilai KKN berhasil diekspor!')}
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor Transkrip SKS</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
