'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MOCK_LOGBOOKS } from '@/lib/mock-data';
import { Activity, Users, Calendar, CheckCircle2, Building } from 'lucide-react';

export default function PerangkatDesaProgressPage() {
  return (
    <DashboardLayout title="Monitoring Aktivitas Lapangan KKN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
            Monitoring Lapangan Mahasiswa KKN
          </h1>
          <p className="text-xs text-slate-500 font-jakarta mt-0.5">
            Pantau seluruh catatan harian dan jam kerja mahasiswa yang bertugas di wilayah Desa Sukamaju.
          </p>
        </div>

        <div className="space-y-4">
          {MOCK_LOGBOOKS.map((log) => (
            <Card key={log.id} className="p-6 border-slate-200 bg-white space-y-3 shadow-ambient">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs text-slate-400 font-semibold">
                    {log.tanggal} • {log.mahasiswa_nama} ({log.mahasiswa_nim})
                  </span>
                  <h3 className="text-sm font-bold text-navy-950 font-epilogue mt-0.5">
                    {log.judul_kegiatan}
                  </h3>
                </div>
                <StatusBadge status={log.status} size="sm" />
              </div>

              <p className="text-xs text-slate-600 font-jakarta leading-relaxed">{log.deskripsi}</p>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                <span>Durasi: <strong className="text-navy-900">{log.durasi_jam} Jam</strong></span>
                <span className="text-emerald-700 font-semibold">Program: {log.target_program_terkait}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
