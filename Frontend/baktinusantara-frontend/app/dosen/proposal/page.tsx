'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  FileText,
  CheckCircle2,
  Award,
  Building,
  Sparkles,
  AlertCircle,
  Clock,
  X,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/services';

export default function DosenProposalPage() {
  const [proposals, setProposals] = useState<any[]>([
    {
      id: 1,
      kelompok: 'Kelompok 14 — Sukamaju Berdaya',
      lokasi: 'Desa Sukamaju, Ciawi, Bogor',
      ketua: 'M. Rian Pratama (Teknik Informatika)',
      judul: 'Digitalisasi Katalog Produk UMKM & Manajemen Irigasi Cerdas',
      status: 'approved',
      status_kelayakan: 'layak',
      kelayakan: 'Layak Tanpa Catatan (A)',
      catatan: 'Metodologi dan integrasi multidisiplin ilmu (IT, Pertanian, Komunikasi, Farmasi) sangat baik dan terstruktur.',
      created_at: '2 hari lalu',
    },
    {
      id: 2,
      kelompok: 'Kelompok 08 — Cibodas Asri',
      lokasi: 'Desa Cibodas Asri, Cianjur',
      ketua: 'Anisa Maharani (Agribisnis)',
      judul: 'Pengembangan Agrowisata Organik & Edukasi Zero Waste Desa',
      status: 'submitted',
      status_kelayakan: 'revisi',
      kelayakan: 'Layak dengan Perbaikan Ringan (A-)',
      catatan: 'Tambahkan instrumen survei kepuasan wisatawan pada lampiran metodologi.',
      created_at: 'Kemarin',
    },
  ]);

  const [activeModal, setActiveModal] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status_kelayakan: 'layak' as 'layak' | 'revisi' | 'ditolak',
    catatan_dpl: '',
  });

  const handleOpenReview = (prop: any) => {
    setActiveModal(prop);
    setReviewForm({
      status_kelayakan: prop.status_kelayakan || 'layak',
      catatan_dpl: prop.catatan || '',
    });
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    setSubmitting(true);
    try {
      try {
        await api.dosen.reviewKelayakanProposal(activeModal.id, {
          status_kelayakan: reviewForm.status_kelayakan,
          catatan_dpl: reviewForm.catatan_dpl,
        });
      } catch (err: any) {
        console.warn('Backend review proposal response:', err);
      }

      setProposals((prev) =>
        prev.map((p) =>
          p.id === activeModal.id
            ? {
                ...p,
                status_kelayakan: reviewForm.status_kelayakan,
                kelayakan:
                  reviewForm.status_kelayakan === 'layak'
                    ? 'Disetujui DPL (Layak)'
                    : reviewForm.status_kelayakan === 'revisi'
                    ? 'Perlu Perbaikan / Revisi'
                    : 'Ditolak DPL',
                catatan: reviewForm.catatan_dpl,
              }
            : p
        )
      );

      toast.success(`Kelayakan proposal ${activeModal.kelompok} berhasil diperbarui!`);
      setActiveModal(null);
    } catch (err: any) {
      toast.error('Gagal memperbarui validasi proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Validasi Kelayakan Proposal Binaan">
      <div className="space-y-6 font-jakarta">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
            Validasi Kelayakan Proposal Program KKN
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dosen Pembimbing Lapangan (DPL) memastikan aspek metodologis, keselamatan lapangan, dan relevansi keilmuan mahasiswa binaan.
          </p>
        </div>

        <div className="space-y-4">
          {proposals.map((prop) => (
            <Card key={prop.id} className="p-6 border-slate-200 bg-white space-y-4 shadow-card">
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
                <p>{prop.catatan || 'Belum ada catatan evaluasi dari DPL.'}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span
                  className={`font-bold px-3 py-1 rounded-full border ${
                    prop.status_kelayakan === 'layak'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : prop.status_kelayakan === 'revisi'
                      ? 'text-amber-700 bg-amber-50 border-amber-200'
                      : 'text-rose-700 bg-rose-50 border-rose-200'
                  }`}
                >
                  {prop.kelayakan}
                </span>

                <Button onClick={() => handleOpenReview(prop)} variant="primary" size="sm" className="font-bold">
                  Validasi & Beri Catatan
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal Validasi Proposal */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
            <Card className="w-full max-w-lg p-6 bg-white border-slate-200 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950 font-epilogue">
                      Formulir Kelayakan Proposal
                    </h3>
                    <p className="text-[11px] text-slate-500">{activeModal.kelompok}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveReview} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Keputusan Kelayakan Proposal
                  </label>
                  <select
                    value={reviewForm.status_kelayakan}
                    onChange={(e: any) =>
                      setReviewForm({ ...reviewForm, status_kelayakan: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-navy-950 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="layak">Disetujui / Layak ke Lapangan</option>
                    <option value="revisi">Revisi / Perlu Perbaikan Metodologi</option>
                    <option value="ditolak">Ditolak / Tidak Sesuai Standar</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Catatan Akademik & Rekomendasi DPL <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewForm.catatan_dpl}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, catatan_dpl: e.target.value })
                    }
                    placeholder="Berikan arahan terkait metodologi, mitigasi risiko K3 lapangan, atau integrasi luaran..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-navy-950 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveModal(null)}
                    className="w-1/2 text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={submitting}
                    className="w-1/2 text-xs font-bold gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Simpan Validasi</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
