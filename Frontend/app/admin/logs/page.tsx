'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Activity, ShieldCheck, Clock, CheckCircle2, User } from 'lucide-react';

export default function AdminLogsPage() {
  const logs = [
    {
      id: 1,
      aksi: 'Pengesahan BAST Desa Digital',
      aktor: 'H. Ahmad Subardjo (Kepala Desa Sukamaju)',
      detail: 'Menerbitkan BAST resmi untuk Kelompok 14 dengan nilai evaluasi 94/100.',
      waktu: '10 menit yang lalu',
      kategori: 'BAST & Kelulusan',
    },
    {
      id: 2,
      aksi: 'Validasi Logbook Harian Mahasiswa',
      aktor: 'Dr. Ir. Hendra Gunawan, M.T. (DPL)',
      detail: 'Mengesahkan logbook minggu ke-3 mahasiswa M. Rian Pratama (7 jam kerja).',
      waktu: '1 jam yang lalu',
      kategori: 'Logbook DPL',
    },
    {
      id: 3,
      aksi: 'Penerbitan Pos Kebutuhan Baru',
      aktor: 'Pemerintah Desa Cibodas Asri',
      detail: 'Menerbitkan pos kebutuhan sektor Agrikultur & Ketahanan Pangan (kuota 6 mahasiswa).',
      waktu: '3 jam yang lalu',
      kategori: 'Pos Kebutuhan',
    },
    {
      id: 4,
      aksi: 'Verifikasi Berkas SK Kepala Desa',
      aktor: 'Prof. Dr. Budi Santoso (LPPM Admin)',
      detail: 'Memvalidasi SK jabatan Kepala Desa Sukamaju dan mengaktifkan akun portal.',
      waktu: '1 hari yang lalu',
      kategori: 'Verifikasi Akun',
    },
  ];

  return (
    <DashboardLayout title="Audit Trail & Log Aktivitas KKN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
            Audit Trail & Log Keamanan
          </h1>
          <p className="text-xs text-slate-500 font-jakarta mt-0.5">
            Rekam jejak setiap aksi krusial mulai dari pengajuan proposal, logbook harian, evaluasi DPL, hingga tanda tangan BAST Desa.
          </p>
        </div>

        <Card className="p-6 border-slate-200 bg-white shadow-ambient space-y-4">
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="py-4 flex items-start justify-between gap-4 font-jakarta">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-primary bg-primary-50 px-2.5 py-0.5 rounded-full">
                      {log.kategori}
                    </span>
                    <h3 className="text-sm font-bold text-navy-950">{log.aksi}</h3>
                  </div>
                  <p className="text-xs text-slate-600">{log.detail}</p>
                  <p className="text-[11px] text-slate-400">
                    Oleh: <strong className="text-navy-900">{log.aktor}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{log.waktu}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
