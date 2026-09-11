'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MOCK_ASPIRASI } from '@/lib/mock-data';
import { Aspirasi } from '@/lib/types';
import { MessageSquare, CheckCircle2, ArrowRight, Building, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function PerangkatDesaAspirasiPage() {
  const [aspirasiList, setAspirasiList] = useState<Aspirasi[]>(MOCK_ASPIRASI);

  const handleVerify = (id: number) => {
    setAspirasiList(
      aspirasiList.map((a) => (a.id === id ? { ...a, status: 'verified' } : a))
    );
    toast.success('Aspirasi berhasil diverifikasi oleh Pemerintah Desa!');
  };

  const handleConvertToPos = (id: number) => {
    setAspirasiList(
      aspirasiList.map((a) => (a.id === id ? { ...a, status: 'converted_to_pos' } : a))
    );
    toast.success('Aspirasi berhasil dikonversi menjadi Pos Kebutuhan KKN baru!');
  };

  return (
    <DashboardLayout title="Verifikasi Aspirasi Warga Desa">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
            Daftar Aspirasi Masuk dari Warga
          </h1>
          <p className="text-xs text-slate-500 font-jakarta mt-0.5">
            Tinjau usulan warga, verifikasi kebenaran lapangan, dan integrasikan menjadi program kerja KKN mahasiswa.
          </p>
        </div>

        <div className="space-y-4">
          {aspirasiList.map((item) => (
            <Card key={item.id} className="p-6 border-slate-200 bg-white space-y-4 shadow-ambient">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-navy-900 bg-slate-100 px-3 py-1 rounded-full">
                    {item.ticket_number}
                  </span>
                  <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full">
                    {item.kategori}
                  </span>
                </div>
                <StatusBadge status={item.status} size="sm" />
              </div>

              <div>
                <h3 className="text-base font-bold text-navy-950 font-epilogue">{item.judul}</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-jakarta mt-1 leading-relaxed">
                  {item.deskripsi}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mt-3">
                  <span>Pengusul: <strong className="text-navy-900">{item.nama_pengadu}</strong></span>
                  <span>•</span>
                  <span>Kontak: <strong className="text-navy-900">{item.nomor_kontak}</strong></span>
                  <span>•</span>
                  <span>Tanggal: {item.created_at}</span>
                </div>
              </div>

              {item.tanggapan_desa && (
                <div className="p-3.5 rounded-2xl bg-surface-subtle border border-slate-200 text-xs text-navy-900 space-y-1">
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" /> Catatan Tindak Lanjut Desa:
                  </span>
                  <p>{item.tanggapan_desa}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                {item.status !== 'verified' && item.status !== 'converted_to_pos' && (
                  <Button onClick={() => handleVerify(item.id)} variant="outline" size="sm">
                    Verifikasi Usulan
                  </Button>
                )}
                {item.status !== 'converted_to_pos' && (
                  <Button
                    onClick={() => handleConvertToPos(item.id)}
                    variant="emerald"
                    size="sm"
                    className="shadow-glow-secondary gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Jadikan Pos Kebutuhan KKN</span>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
