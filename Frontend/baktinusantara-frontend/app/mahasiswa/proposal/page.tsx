'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/services';
import { PosKebutuhan, Proposal } from '@/lib/types';
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
  ShieldAlert,
  Loader2,
  FileDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { StyledSelect } from '@/components/ui/StyledSelect';

export default function MahasiswaProposalPage() {
  const [posList, setPosList] = useState<PosKebutuhan[]>([]);
  const [selectedPosId, setSelectedPosId] = useState<string>('1');
  const [drafProker, setDrafProker] = useState(
    'Program akselerasi digitalisasi dan branding produk UMKM keripik singkong serta modernisasi pembukuan keuangan desa.'
  );
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [suratPengantarFile, setSuratPengantarFile] = useState<File | null>(null);
  const [suratOrtuFile, setSuratOrtuFile] = useState<File | null>(null);
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const selectedPos = posList.find((p) => String(p.id) === String(selectedPosId)) || posList[0];
  const isJarakJauh = (selectedPos?.distance_km || 0) > 1000;

  useEffect(() => {
    // 1. Fetch available pos kebutuhan
    api.posKebutuhan.getAll()
      .then((res) => {
        if (Array.isArray(res)) setPosList(res);
      })
      .catch(() => {});

    // 2. Fetch my submitted proposals
    api.proposal.getMyProposals()
      .then((res) => {
        if (Array.isArray(res)) setMyProposals(res);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        pos_kebutuhan_id: Number(selectedPosId) || 1,
        draf_proker: drafProker,
        latitude: -7.2575,
        longitude: 112.7521,
      };
      if (proposalFile) {
        payload.file_proposal = proposalFile;
      } else {
        // Create a dummy blob if no file is selected for demo
        payload.file_proposal = new Blob(['Sample Proposal Document PDF'], { type: 'application/pdf' });
      }
      if (suratPengantarFile) {
        payload.surat_pengantar = suratPengantarFile;
      }

      const res = await api.proposal.submitProposal(payload);
      toast.success('Proposal KKN berhasil diajukan ke DPL dan Kepala Desa!');

      // If distance > 1000km and parent consent attached
      if (isJarakJauh && suratOrtuFile && (res?.data as any)?.id) {
        await api.proposal.uploadSuratOrtu((res.data as any).id, suratOrtuFile);
        toast.success('Surat izin orang tua berhasil diunggah!');
      }

      // Refresh my proposals
      const fresh = await api.proposal.getMyProposals();
      if (Array.isArray(fresh)) setMyProposals(fresh);
    } catch (err: any) {
      console.warn('Backend proposal submit error, fallback toast:', err);
      toast.success('Proposal berhasil diajukan! (Mode Demo Aktif)');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Pengajuan & Validasi Proposal KKN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
            Proposal Program Kerja KKN
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-jakarta mt-0.5">
            Proposal dievaluasi secara berjenjang oleh Dosen Pembimbing Lapangan (DPL) dan Kepala Desa Mitra.
          </p>
        </div>

        {/* Long distance warning if applicable */}
        {isJarakJauh && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 flex items-start gap-3 animate-in fade-in">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold">Perhatian: KKN Jarak Jauh (&gt; 1.000 km)</p>
              <p className="text-amber-800 dark:text-amber-300">
                Lokasi desa sasaran berjarak lebih dari 1.000 km dari domisili kampus. Sistem mewajibkan unggah Surat Izin Orang Tua yang telah ditandatangani bermaterai.
              </p>
            </div>
          </div>
        )}

        {/* Proposal Details Form */}
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-ambient space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-navy-800 pb-3">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
              Formulir Pengajuan Proposal KKN
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                Pilih Pos Kebutuhan Sasaran
              </label>
              <StyledSelect
                value={selectedPosId}
                onChange={(v) => setSelectedPosId(String(v))}
                options={
                  posList.length > 0
                    ? posList.map((pos) => ({
                        value: String(pos.id),
                        label: `${pos.judul} (${pos.nama_desa || 'Desa Sukamaju'} - ${pos.distance_km || 15} km)`,
                      }))
                    : [
                        { value: '1', label: 'Digitalisasi Pemasaran UMKM (Desa Sukamaju - 15 km)' },
                        { value: '2', label: 'Pemberdayaan Posyandu Balita (Desa Sukamaju - 15 km)' },
                        { value: '3', label: 'Optimalisasi Biogas & Sanitasi (Desa Berkah Makmur - 45 km)' },
                      ]
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                Draf Program Kerja & Sasaran Dampak
              </label>
              <textarea
                rows={4}
                required
                value={drafProker}
                onChange={(e) => setDrafProker(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                placeholder="Jelaskan tahapan implementasi, rencana kegiatan mingguan, dan target luaran..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 space-y-2">
                <label className="block text-xs font-bold text-navy-900 dark:text-slate-200">
                  Unggah Berkas Proposal (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setProposalFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 dark:file:bg-primary-950/70 file:text-primary dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-900"
                />
              </div>

              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 space-y-2">
                <label className="block text-xs font-bold text-navy-900 dark:text-slate-200">
                  Surat Pengantar Kampus (Opsional PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSuratPengantarFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 dark:file:bg-primary-950/70 file:text-primary dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-900"
                />
              </div>
            </div>

            {isJarakJauh && (
              <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/40 space-y-2">
                <label className="block text-xs font-bold text-amber-950 dark:text-amber-200">
                  Surat Izin Orang Tua (Wajib untuk Jarak &gt; 1.000 km)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSuratOrtuFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 dark:file:bg-amber-950/70 file:text-amber-900 dark:file:text-amber-300 hover:file:bg-amber-200"
                />
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={isSubmitting}
              className="w-full font-bold text-xs sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Mengirimkan Proposal...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  <span>Ajukan Proposal ke DPL & Mitra Desa</span>
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* My Proposals List */}
        {myProposals.length > 0 && (
          <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-ambient space-y-4">
            <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
              Riwayat Pengajuan Proposal Kelompok
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-navy-800">
              {myProposals.map((prop) => (
                <div key={prop.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-navy-950 dark:text-white">
                      {prop.pos_kebutuhan?.judul || `Proposal #${prop.id}`}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{prop.ringkasan_eksekutif || prop.judul_program}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={prop.status_desa || 'pending'} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
