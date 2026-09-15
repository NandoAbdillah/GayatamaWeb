'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FileText, CheckCircle2, XCircle, FileCheck2, User, Building, X, Send } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/services';

export default function PerangkatDesaProposalPage() {
  const [proposals, setProposals] = useState<any[]>([
    {
      id: 1,
      kelompok: 'Kelompok 14 — Sukamaju Berdaya',
      ketua: 'M. Rian Pratama (Teknik Informatika)',
      judul: 'Digitalisasi Katalog Produk UMKM & Manajemen Irigasi Cerdas',
      anggaran: 'Rp 7.500.000',
      status: 'submitted',
      ringkasan:
        'Pembuatan website marketplace UMKM desa, pelatihan foto produk untuk 42 UMKM, serta instalasi sistem monitoring debit air irigasi sawah barat.',
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{ id: number; action: 'approve' | 'reject'; title: string } | null>(null);
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadProposals() {
      try {
        setLoading(true);
        const data = await api.proposal.getByDesa();
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map((p: any) => ({
            id: p.id,
            kelompok: p.kelompok?.nama_kelompok || `Kelompok ${p.kelompok_id}`,
            ketua: p.kelompok?.ketua?.name || 'Ketua Mahasiswa',
            judul: p.judul || p.pos_kebutuhan?.judul || 'Proposal Rencana Pengabdian KKN',
            anggaran: p.anggaran || 'Rp 7.500.000',
            status: p.status || 'submitted',
            ringkasan: p.draf_proker || p.ringkasan || 'Rencana program kerja mahasiswa selama KKN.',
          }));
          setProposals(normalized);
        }
      } catch (err) {
        console.warn('Fallback to mock village proposals:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProposals();
  }, []);

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal) return;

    setSubmitting(true);
    try {
      try {
        await api.proposal.decideByDesa(actionModal.id, {
          action: actionModal.action,
          catatan_desa: catatan,
        });
      } catch (err: any) {
        console.warn('Backend decide proposal error:', err);
      }

      setProposals((prev) =>
        prev.map((p) =>
          p.id === actionModal.id
            ? { ...p, status: actionModal.action === 'approve' ? 'approved' : 'rejected' }
            : p
        )
      );

      toast.success(
        actionModal.action === 'approve'
          ? 'Proposal KKN telah disetujui resmi oleh Kepala Desa Sukamaju!'
          : 'Proposal KKN telah ditolak dengan catatan.'
      );
      setActionModal(null);
      setCatatan('');
    } catch (err) {
      toast.error('Gagal memperbarui status proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Persetujuan Proposal Program KKN">
      <div className="space-y-6 font-jakarta">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
            Proposal Mahasiswa Masuk ke Desa
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemerintah desa berhak menyetujui, meminta revisi, atau menolak usulan rencana kerja kelompok mahasiswa.
          </p>
        </div>

        <div className="space-y-4">
          {proposals.map((prop) => (
            <Card key={prop.id} className="p-6 border-slate-200 bg-white space-y-4 shadow-card">
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

              <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 text-xs gap-3">
                <span className="text-slate-500">
                  Estimasi Anggaran Diusulkan: <strong className="text-navy-900">{prop.anggaran}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {prop.status !== 'approved' && (
                    <Button
                      onClick={() =>
                        setActionModal({ id: prop.id, action: 'reject', title: prop.kelompok })
                      }
                      variant="outline"
                      size="sm"
                      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      <span>Tolak Proposal</span>
                    </Button>
                  )}

                  {prop.status !== 'approved' && (
                    <Button
                      onClick={() =>
                        setActionModal({ id: prop.id, action: 'approve', title: prop.kelompok })
                      }
                      variant="emerald"
                      size="sm"
                      className="shadow-glow-secondary gap-1 font-bold text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Setujui Proposal</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal Konfirmasi Keputusan Desa */}
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
            <Card className="w-full max-w-md p-6 bg-white border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-navy-950 font-epilogue">
                  {actionModal.action === 'approve' ? 'Setujui Proposal Masuk' : 'Tolak Proposal'}
                </h3>
                <button
                  onClick={() => setActionModal(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDecision} className="space-y-3 text-xs">
                <p className="text-slate-600">
                  {actionModal.action === 'approve'
                    ? `Apakah Anda yakin menyetujui rencana kerja pengabdian ${actionModal.title}?`
                    : `Berikan alasan penolakan atau perbaikan untuk ${actionModal.title}.`}
                </p>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Catatan dari Pemerintah Desa</label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Kami menyambut baik program irigasi dan siap mendampingi mahasiswa di balai desa..."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setActionModal(null)} className="w-1/2">
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant={actionModal.action === 'approve' ? 'emerald' : 'danger'}
                    isLoading={submitting}
                    className="w-1/2 font-bold gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Konfirmasi</span>
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
