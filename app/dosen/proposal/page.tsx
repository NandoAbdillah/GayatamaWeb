'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FileText, CheckCircle2, Award, Building, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function DosenProposalPage() {
  const [proposals, setProposals] = useState([
    {
      id: 1,
      kelompok: 'Kelompok 14 — Sukamaju Berdaya',
      lokasi: 'Desa Sukamaju, Ciawi, Bogor',
      ketua: 'M. Rian Pratama (Teknik Informatika)',
      judul: 'Digitalisasi Katalog Produk UMKM & Manajemen Irigasi Cerdas',
      status: 'approved',
      kelayakan: 'Layak Tanpa Catatan (A)',
      catatan: 'Metodologi dan integrasi multidisiplin ilmu (IT, Pertanian, Komunikasi, Farmasi) sangat baik dan terstruktur.',
    },
    {
      id: 2,
      kelompok: 'Kelompok 08 — Cibodas Asri',
      lokasi: 'Desa Cibodas Asri, Cianjur',
      ketua: 'Anisa Maharani (Agribisnis)',
      judul: 'Pengembangan Agrowisata Organik & Edukasi Zero Waste Desa',
      status: 'approved',
      kelayakan: 'Layak dengan Perbaikan Ringan (A-)',
      catatan: 'Tambahkan instrumen survei kepuasan wisatawan pada lampiran metodologi.',
    },
  ]);

  return (
    <DashboardLayout title="Validasi Kelayakan Proposal Binaan">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
            Validasi Kelayakan Proposal Program KKN
          </h1>
          <p className="text-xs text-slate-500 font-jakarta mt-0.5">
            Dosen Pembimbing Lapangan (DPL) memastikan aspek metodologis, keselamatan lapangan, dan relevansi keilmuan mahasiswa binaan.
          </p>
        </div>

        <div className="space-y-4">
          {proposals.map((prop) => (
            <Card key={prop.id} className="p-6 border-slate-200 bg-white space-y-4 shadow-ambient">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-navy-950 font-epilogue">{prop.judul}</h3>
                  <p className="text-xs text-primary font-semibold mt-0.5">
                    {prop.kelompok} • Lokasi: {prop.lokasi}
                  </p>
                </div>
                <StatusBadge status={prop.status} />
              </div>

              <div className="p-4 rounded-2xl bg-surface-subtle border border-slate-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-navy-900">Hasil Evaluasi Kelayakan DPL:</span>
                <p>{prop.catatan}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {prop.kelayakan}
                </span>

                <Button
                  onClick={() => toast.success('Status kelayakan proposal telah diperbarui')}
                  variant="primary"
                  size="sm"
                >
                  Perbarui Validasi
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
