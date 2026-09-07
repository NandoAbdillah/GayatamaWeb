'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MOCK_POS_KEBUTUHAN } from '@/lib/mock-data';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  Building,
  GraduationCap,
  FileCheck,
  Send,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MahasiswaProposalPage() {
  const [judul, setJudul] = useState(
    'Pengembangan Sistem Katalog Digital UMKM & Manajemen Irigasi Cerdas Terintegrasi di Desa Sukamaju'
  );
  const [anggaran, setAnggaran] = useState('7500000');
  const [ringkasan, setRingkasan] = useState(
    'Program ini bertujuan memberdayakan 42 UMKM melalui pembuatan website e-katalog desa, pelatihan branding kemasan, dan instalasi sensor irigasi terpadu.'
  );
  const [fileUploaded, setFileUploaded] = useState(true);

  // Status simulation
  const [statusDesa, setStatusDesa] = useState<'approved' | 'pending' | 'revision'>('approved');
  const [statusDosen, setStatusDosen] = useState<'approved' | 'pending' | 'revision'>('approved');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Proposal berhasil diperbarui dan diajukan ulang!');
  };

  return (
    <DashboardLayout title="Pengajuan & Validasi Proposal KKN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
            Proposal Program Kerja KKN
          </h1>
          <p className="text-xs text-slate-500 font-jakarta mt-0.5">
            Proposal harus disetujui secara paralel oleh Mitra Perangkat Desa dan Dosen Pembimbing Lapangan (DPL).
          </p>
        </div>

        {/* Approval Flow Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-navy-950">Persetujuan Mitra Desa</span>
              </div>
              <StatusBadge status={statusDesa} size="sm" />
            </div>
            <p className="text-xs text-slate-600">
              Desa Sukamaju telah menyetujui program kerja ini untuk dieksekusi di wilayah RW 01 - RW 04.
            </p>
          </Card>

          <Card className="p-5 border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-navy-950">Validasi Kelayakan DPL</span>
              </div>
              <StatusBadge status={statusDosen} size="sm" />
            </div>
            <p className="text-xs text-slate-600">
              Dr. Ir. Hendra Gunawan telah mengesahkan metodologi dan instrumen monev lapangan.
            </p>
          </Card>
        </div>

        {/* Proposal Details Form */}
        <Card className="p-6 sm:p-8 border-slate-200 bg-white shadow-ambient space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-navy-950 font-epilogue">
              Rincian Dokumen Proposal Program
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Judul Program Kerja KKN
              </label>
              <input
                type="text"
                required
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-xs font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Pos Kebutuhan Target
                </label>
                <input
                  type="text"
                  disabled
                  value="Desa Sukamaju - Digitalisasi UMKM & Irigasi Cerdas"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Estimasi Anggaran Program (IDR)
                </label>
                <input
                  type="number"
                  required
                  value={anggaran}
                  onChange={(e) => setAnggaran(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Ringkasan Eksekutif & Sasaran Manfaat
              </label>
              <textarea
                rows={4}
                required
                value={ringkasan}
                onChange={(e) => setRingkasan(e.target.value)}
                className="w-full p-4 bg-surface-canvas border border-slate-300 rounded-2xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary font-jakarta leading-relaxed"
              />
            </div>

            {/* Proposal PDF Attachment */}
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Berkas PDF Dokumen Proposal Lengkap
              </label>
              <div
                onClick={() => setFileUploaded(!fileUploaded)}
                className="border-2 border-dashed border-emerald-400 bg-emerald-50/50 rounded-2xl p-4 text-center cursor-pointer transition-all"
              >
                <div className="flex items-center justify-center gap-2 text-emerald-800 text-xs font-semibold">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <span>Proposal_KKN_Kelompok14_Sukamaju_Signed.pdf (2.4 MB) — Terunggah</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <Button type="submit" variant="primary" size="md" className="gap-2 shadow-glow-primary">
                <Send className="w-4 h-4" />
                <span>Simpan & Perbarui Proposal</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
