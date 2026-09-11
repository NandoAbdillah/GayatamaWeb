'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GraduationCap, Users, PlusCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDosenPage() {
  const dosenRoster = [
    {
      id: 1,
      nama: 'Dr. Ir. Hendra Gunawan, M.T.',
      nip: '197804122005011002',
      fakultas: 'Teknik & Pertanian',
      kelompokBinaan: 3,
      kuota: 5,
      lokasi: 'Bogor & Cianjur',
    },
    {
      id: 2,
      nama: 'Dr. Siti Rahmawati, S.Sos., M.Si.',
      nip: '198203152008012001',
      fakultas: 'Ilmu Sosial & Politik',
      kelompokBinaan: 4,
      kuota: 5,
      lokasi: 'Sukabumi',
    },
    {
      id: 3,
      nama: 'Prof. Dr. Agus Prasetyo, M.Kes.',
      nip: '197109201997021003',
      fakultas: 'Kesehatan Masyarakat',
      kelompokBinaan: 2,
      kuota: 5,
      lokasi: 'Bogor',
    },
  ];

  return (
    <DashboardLayout title="Manajemen & Alokasi Dosen Pembimbing (DPL)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
              Dosen Pembimbing Lapangan (DPL)
            </h1>
            <p className="text-xs text-slate-500 font-jakarta mt-0.5">
              Alokasikan dosen pembimbing ke kelompok mahasiswa KKN berdasarkan kesesuaian bidang keahlian dan wilayah desa.
            </p>
          </div>

          <Button
            onClick={() => toast.info('Formulir penugasan DPL baru dibuka')}
            variant="primary"
            size="md"
            className="shadow-glow-primary gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tugaskan DPL Baru</span>
          </Button>
        </div>

        <div className="space-y-4">
          {dosenRoster.map((d) => (
            <Card key={d.id} className="p-6 border-slate-200 bg-white space-y-3 shadow-ambient">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-navy-950 font-epilogue">{d.nama}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    NIP: {d.nip} • {d.fakultas}
                  </p>
                </div>
                <span className="text-xs font-bold text-primary bg-primary-50 px-3 py-1 rounded-full">
                  Wilayah Binaan: {d.lokasi}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>
                  Beban Bimbingan: <strong className="text-navy-950">{d.kelompokBinaan} / {d.kuota} Kelompok</strong>
                </span>

                <Button variant="outline" size="sm" className="text-xs">
                  Kelola Kelompok Binaan
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
