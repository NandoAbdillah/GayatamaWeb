'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MOCK_POS_KEBUTUHAN } from '@/lib/mock-data';
import {
  ClipboardList,
  PlusCircle,
  MapPin,
  Sparkles,
  CheckCircle2,
  Users,
  Send,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PerangkatDesaPosKebutuhanPage() {
  const [judul, setJudul] = useState('');
  const [sektor, setSektor] = useState('Digitalisasi & Teknologi Desa');
  const [deskripsi, setDeskripsi] = useState('');
  const [kuota, setKuota] = useState(5);
  const [targetLuaran, setTargetLuaran] = useState('Website Katalog Desa, Modul Pelatihan');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Pos Kebutuhan berhasil diterbitkan dan siap dilamar mahasiswa KKN!');
    setShowCreateModal(false);
    setJudul('');
    setDeskripsi('');
  };

  return (
    <DashboardLayout title="Manajemen Pos Kebutuhan KKN Desa">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
              Pos Kebutuhan KKN Desa Sukamaju
            </h1>
            <p className="text-xs text-slate-500 font-jakarta mt-0.5">
              Publikasikan kebutuhan riil masyarakat desa agar mahasiswa perguruan tinggi dapat mengajukan proposal pengabdian.
            </p>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            variant="emerald"
            size="md"
            className="shadow-glow-secondary gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Terbitkan Pos Baru</span>
          </Button>
        </div>

        {/* Existing Pos List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_POS_KEBUTUHAN.map((pos) => (
            <Card key={pos.id} className="p-6 border-slate-200 bg-white flex flex-col justify-between space-y-4 shadow-ambient">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={pos.status} size="sm" />
                  <span className="text-xs font-semibold text-primary">{pos.kategori_sektor}</span>
                </div>

                <h3 className="text-base font-bold text-navy-950 font-epilogue leading-snug">
                  {pos.judul}
                </h3>

                <p className="text-xs text-slate-600 font-jakarta line-clamp-3 leading-relaxed">
                  {pos.deskripsi}
                </p>

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Target Luaran:</span>
                  <div className="space-y-1 text-xs text-slate-700">
                    {pos.target_luaran.slice(0, 2).map((luar, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span className="truncate">{luar}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Kuota Mahasiswa:{' '}
                  <span className="font-bold text-navy-900">
                    {pos.terisi_mahasiswa}/{pos.kuota_mahasiswa}
                  </span>
                </span>
                <span className="text-primary font-semibold">Aktif</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal Create Pos Kebutuhan */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-xl font-bold text-navy-950 font-epilogue">
              Terbitkan Pos Kebutuhan KKN Baru
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Judul Program Kebutuhan Desa
                </label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Digitalisasi Pembukuan Koperasi & Bank Sampah Desa"
                  className="w-full px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Sektor Prioritas
                  </label>
                  <select
                    value={sektor}
                    onChange={(e) => setSektor(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Digitalisasi & Teknologi Desa">Digitalisasi & Teknologi</option>
                    <option value="Agrikultur & Ketahanan Pangan">Agrikultur & Ketahanan Pangan</option>
                    <option value="Kesehatan & Sanitasi">Kesehatan & Sanitasi</option>
                    <option value="Pemberdayaan UMKM">Pemberdayaan UMKM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Kuota Mahasiswa
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    required
                    value={kuota}
                    onChange={(e) => setKuota(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Deskripsi Kebutuhan Lapangan
                </label>
                <textarea
                  rows={3}
                  required
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Jelaskan kondisi saat ini dan apa yang ingin dicapai bersama mahasiswa..."
                  className="w-full p-3.5 bg-surface-canvas border border-slate-300 rounded-2xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary font-jakarta leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Target Luaran yang Diharapkan (Pisahkan Koma)
                </label>
                <input
                  type="text"
                  required
                  value={targetLuaran}
                  onChange={(e) => setTargetLuaran(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="md" onClick={() => setShowCreateModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="emerald" size="md" className="shadow-glow-secondary">
                  Publikasikan Pos
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
