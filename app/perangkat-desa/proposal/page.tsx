'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FileText, CheckCircle2, XCircle, FileCheck2, User, Building } from 'lucide-react';
import { toast } from 'sonner';

export default function PerangkatDesaProposalPage() {
  const [proposals, setProposals] = useState([
    {
      id: 1,
      kelompok: 'Kelompok 14 — Sukamaju Berdaya',
      ketua: 'M. Rian Pratama (Teknik Informatika)',
      judul: 'Digitalisasi Katalog Produk UMKM & Manajemen Irigasi Cerdas',
      anggaran: 'Rp 7.500.000',
      status: 'approved',
      ringkasan:
        'Pembuatan website marketplace UMKM desa, pelatihan foto produk untuk 42 UMKM, serta instalasi sistem monitoring debit air irigasi sawah barat.',
    },
  ]);

  return (
    <DashboardLayout title="Persetujuan Proposal Program KKN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
            Proposal Mahasiswa Masuk ke Desa
          </h1>
          <p className="text-xs text-slate-500 font-jakarta mt-0.5">
            Pemerintah desa berhak menyetujui, meminta revisi, atau menolak usulan rencana kerja kelompok mahasiswa.
          </p>
        </div>

        <div className="space-y-4">
          {proposals.map((prop) => (
            <Card key={prop.id} className="p-6 border-slate-200 bg-white space-y-4 shadow-ambient">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-navy-950 font-epilogue">{prop.judul}</h3>
                  <p className="text-xs text-primary font-semibold mt-0.5">
                    {prop.kelompok} • Ketua: {prop.ketua}
                  </p>
                </div>
                <StatusBadge status={prop.status} />
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-jakarta">
                {prop.ringkasan}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  Estimasi Anggaran Diusulkan: <strong className="text-navy-900">{prop.anggaran}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => toast.success('Proposal telah disetujui oleh Kepala Desa Sukamaju!')}
                    variant="emerald"
                    size="sm"
                    className="shadow-glow-secondary gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Setujui Proposal</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
