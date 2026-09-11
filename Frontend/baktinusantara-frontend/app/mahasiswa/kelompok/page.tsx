'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MOCK_KELOMPOK_14 } from '@/lib/mock-data';
import {
  Users,
  Copy,
  CheckCircle2,
  Building,
  GraduationCap,
  Sparkles,
  Award,
  Mail,
  Phone,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MahasiswaKelompokPage() {
  const kelompok = MOCK_KELOMPOK_14;
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(kelompok.kode_kelompok);
    setCopied(true);
    toast.success('Kode undangan kelompok berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout title="Manajemen Tim Kelompok KKN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
              {kelompok.nama_kelompok}
            </h1>
            <p className="text-xs text-slate-500 font-jakarta mt-0.5">
              Lokasi Pengabdian: <span className="font-semibold text-navy-900">{kelompok.desa_nama}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-mono font-bold text-primary flex items-center gap-2 shadow-sm">
              <span>{kelompok.kode_kelompok}</span>
              <button
                onClick={handleCopyCode}
                className="text-slate-400 hover:text-primary transition-colors"
                title="Salin Kode"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-5 border-slate-200 space-y-2 bg-white">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Dosen Pembimbing Lapangan
            </span>
            <p className="text-sm font-bold text-navy-950 font-epilogue">{kelompok.dosen_nama}</p>
            <p className="text-xs text-primary-700 font-medium">Teknologi Informasi & Biosistem</p>
          </Card>

          <Card className="p-5 border-slate-200 space-y-2 bg-white">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Pos Kebutuhan Terhubung
            </span>
            <p className="text-sm font-bold text-navy-950 font-epilogue line-clamp-1">
              {kelompok.pos_kebutuhan_judul}
            </p>
            <p className="text-xs text-emerald-700 font-semibold">Status: Disetujui Desa & DPL</p>
          </Card>

          <Card className="p-5 border-slate-200 space-y-2 bg-white">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Total Keanggotaan
            </span>
            <p className="text-2xl font-extrabold text-navy-950 font-epilogue">
              {kelompok.total_anggota} <span className="text-xs font-normal text-slate-400">Mahasiswa</span>
            </p>
            <p className="text-xs text-slate-500">Multidisiplin (4 Program Studi)</p>
          </Card>
        </div>

        {/* Anggota Roster Card */}
        <Card className="p-6 border-slate-200 bg-white shadow-ambient space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-navy-950 font-epilogue">
                Daftar Mahasiswa Anggota Kelompok
              </h2>
            </div>
            <span className="text-xs text-slate-500">Kuota Terisi: 5/5</span>
          </div>

          <div className="divide-y divide-slate-100">
            {kelompok.anggota.map((mhs) => (
              <div key={mhs.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={mhs.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={mhs.nama}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-navy-950">{mhs.nama}</p>
                      {mhs.role_kelompok === 'Ketua' && (
                        <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                          Ketua Tim
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {mhs.nim} • {mhs.jurusan}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Aktif di Lapangan
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
