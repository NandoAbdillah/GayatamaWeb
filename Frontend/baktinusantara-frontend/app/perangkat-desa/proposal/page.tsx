'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  ShieldCheck,
  Filter,
  ChevronDown,
  ChevronUp,
  Users,
  MapPin,
  Download,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/services';
import apiClient from '@/lib/api-client';

type ProposalStatus = 'menunggu' | 'revision' | 'approved';
type FilterStatus = 'semua' | 'menunggu' | 'revisi' | 'disetujui';

interface NormalizedProposal {
  id: number;
  judul: string;
  kelompok: string;
  lokasi: string;
  tujuan: string;
  file_name: string;
  file_url: string;
  status: ProposalStatus;
  catatan_revisi?: string;
  created_at: string;
  disetujui_pada?: string;
}

export default function PerangkatDesaProposalPage() {
  const [proposals, setProposals] = useState<NormalizedProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('semua');
  const [activeRevisionId, setActiveRevisionId] = useState<number | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [expandedRevisions, setExpandedRevisions] = useState<Set<number>>(new Set());
  const [pendingApprove, setPendingApprove] = useState<NormalizedProposal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const data = await api.proposal.getByDesa();
      if (Array.isArray(data)) {
        const normalized: NormalizedProposal[] = data.map((p: any) => {
          let status: ProposalStatus = 'menunggu';
          if (p.status === 'diterima' || p.status === 'approved') status = 'approved';
          else if (p.status === 'ditolak' || p.status === 'revision' || p.catatan_desa) status = 'revision';

          return {
            id: p.id,
            judul: p.pos_kebutuhan?.judul || p.draf_proker?.slice(0, 60) || 'Proposal Pengabdian KKN',
            kelompok: p.kelompok?.nama_kelompok || `Kelompok #${p.kelompok_id}`,
            lokasi: p.pos_kebutuhan?.desa?.nama_desa ? `Desa ${p.pos_kebutuhan.desa.nama_desa}` : 'Desa Mitra',
            tujuan: p.draf_proker || p.pos_kebutuhan?.deskripsi || 'Rancangan kerja program pengabdian mahasiswa.',
            file_name: p.file_proposal_url ? p.file_proposal_url.split('/').pop() || 'Proposal_KKN.pdf' : 'Proposal_KKN.pdf',
            file_url: p.file_proposal_url || '#',
            status,
            catatan_revisi: p.catatan_desa || '',
            created_at: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '2026-08-24',
            disetujui_pada: p.updated_at && status === 'approved' ? p.updated_at : undefined,
          };
        });
        setProposals(normalized);
        setExpandedRevisions(new Set(normalized.filter((p) => !!p.catatan_revisi).map((p) => p.id)));
      } else {
        setProposals([]);
      }
    } catch (err: any) {
      console.error('Gagal mengambil daftar proposal desa:', err);
      toast.error('Gagal memuat proposal dari server.');
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      if (filterStatus === 'menunggu' && p.status !== 'menunggu') return false;
      if (filterStatus === 'revisi' && p.status !== 'revision') return false;
      if (filterStatus === 'disetujui' && p.status !== 'approved') return false;
      return true;
    });
  }, [proposals, filterStatus]);

  const handleSendRevision = async (e: React.FormEvent, prop: NormalizedProposal) => {
    e.preventDefault();
    if (!revisionNotes.trim()) {
      toast.error('Harap masukkan catatan revisi untuk mahasiswa');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.proposal.decideByDesa(prop.id, {
        action: 'reject',
        catatan_desa: revisionNotes.trim(),
      });
      toast.success('Catatan revisi berhasil dikirim ke kelompok mahasiswa!');
      setActiveRevisionId(null);
      setRevisionNotes('');
      await fetchProposals();
    } catch (err: any) {
      console.error('Gagal mengirim revisi proposal:', err);
      const errMsg = err?.response?.data?.message || 'Gagal mengirim revisi ke server.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRevision = () => {
    setActiveRevisionId(null);
    setRevisionNotes('');
  };

  const toggleRevision = (id: number) => {
    setExpandedRevisions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmApprove = async () => {
    if (!pendingApprove) return;
    setIsSubmitting(true);
    try {
      await api.proposal.decideByDesa(pendingApprove.id, {
        action: 'approve',
      });
      toast.success('Proposal berhasil disetujui Pemerintah Desa!');
      setPendingApprove(null);
      await fetchProposals();
    } catch (err: any) {
      console.error('Gagal menyetujui proposal:', err);
      const errMsg = err?.response?.data?.message || 'Gagal menyetujui proposal.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (prop: NormalizedProposal) => {
    try {
      const response = await apiClient.get(`/api/proposal/${prop.id}/file`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', prop.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Mengunduh berkas ${prop.file_name}`);
    } catch (err: any) {
      console.error('Gagal mengunduh berkas proposal:', err);
      toast.error('Berkas fisik proposal belum tersedia di penyimpanan server.');
    }
  };

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'semua', label: 'Semua' },
    { value: 'menunggu', label: 'Menunggu' },
    { value: 'revisi', label: 'Revisi' },
    { value: 'disetujui', label: 'Disetujui' },
  ];

  const getStatusBadgeProps = (status: ProposalStatus) => {
    if (status === 'approved') return { status: 'approved' as const, label: 'Disetujui' };
    if (status === 'revision') return { status: 'revision' as const, label: 'Perlu Revisi' };
    return { status: 'submitted' as const, label: 'Menunggu' };
  };

  return (
    <DashboardLayout title="Validasi Proposal Masuk Desa">
      <div className="space-y-6 font-jakarta">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
            Validasi Proposal Program KKN Masuk Desa
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Perangkat Desa memastikan usulan mahasiswa selaras dengan kebutuhan warga, kearifan lokal, dan kesiapan fasilitas desa sebelum program lapangan dimulai.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-1.5 shadow-sm w-fit">
          <Filter className="w-4 h-4 text-slate-400 ml-2 mr-1" />
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === opt.value
                  ? 'bg-navy-950 dark:bg-primary text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Proposal List */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm">Memuat daftar proposal dari server...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-navy-950 dark:text-white">Tidak Ada Proposal</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Belum ada proposal program KKN yang diajukan ke pos kebutuhan desa Anda dengan status filter ini.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((prop) => {
              const badge = getStatusBadgeProps(prop.status);
              const isRevisionExpanded = expandedRevisions.has(prop.id);
              const isEditingRevision = activeRevisionId === prop.id;

              return (
                <Card
                  key={prop.id}
                  className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-4 transition-all"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-navy-800 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-primary dark:text-primary-300 bg-primary/10 dark:bg-primary-950/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {prop.kelompok}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {prop.lokasi}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-navy-950 dark:text-white font-epilogue">
                        {prop.judul}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <StatusBadge status={badge.status} size="sm" />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Tujuan & Ringkasan Program</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-surface-subtle dark:bg-navy-950 p-3.5 rounded-xl border border-slate-100 dark:border-navy-800">
                      {prop.tujuan}
                    </p>
                  </div>

                  {/* File Download Bar */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-950/50 border border-slate-200 dark:border-navy-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy-950 dark:text-white">{prop.file_name}</p>
                        <p className="text-[10px] text-slate-400">Diajukan: {prop.created_at}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(prop)}
                      className="text-xs gap-1.5 bg-white dark:bg-navy-900"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Berkas</span>
                    </Button>
                  </div>

                  {/* Catatan Revisi Section */}
                  {prop.catatan_revisi && (
                    <div className="border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleRevision(prop.id)}
                        className="w-full flex items-center justify-between p-3 text-left transition-colors hover:bg-amber-100/40 dark:hover:bg-amber-900/30"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>Catatan Revisi dari Pemerintah Desa</span>
                        </div>
                        {isRevisionExpanded ? (
                          <ChevronUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        )}
                      </button>

                      {isRevisionExpanded && (
                        <div className="p-3 pt-0 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed border-t border-amber-200/60 dark:border-amber-900/40">
                          {prop.catatan_revisi}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Form Kirim Catatan Revisi (Jika Desa klik revisi) */}
                  {isEditingRevision && (
                    <form
                      onSubmit={(e) => handleSendRevision(e, prop)}
                      className="space-y-3 p-4 rounded-xl bg-surface-subtle dark:bg-navy-950 border border-slate-200 dark:border-navy-800 animate-fadeIn"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-navy-950 dark:text-white">
                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                        <span>Form Catatan Koreksi & Revisi untuk Mahasiswa</span>
                      </div>
                      <textarea
                        rows={3}
                        value={revisionNotes}
                        onChange={(e) => setRevisionNotes(e.target.value)}
                        placeholder="Contoh: Jadwal penyuluhan perlu diselaraskan dengan hari pasar desa (Jumat). Rincian anggaran pengadaan filter air mohon dilengkapi pada lampiran 2..."
                        className="w-full p-3 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl text-xs text-navy-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCancelRevision}
                          className="text-xs"
                          disabled={isSubmitting}
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          className="text-xs gap-1.5"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>Kirim Catatan Revisi</span>
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Bottom Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <p className="text-[11px] text-slate-400">
                      {prop.status === 'approved' && prop.disetujui_pada ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Disetujui pada {prop.disetujui_pada}
                        </span>
                      ) : (
                        <span>Status verifikasi mengikat secara resmi antara Desa & Perguruan Tinggi.</span>
                      )}
                    </p>

                    <div className="flex items-center gap-2">
                      {prop.status !== 'approved' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveRevisionId(prop.id);
                              setRevisionNotes(prop.catatan_revisi || '');
                            }}
                            className="text-xs gap-1 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                            disabled={isSubmitting}
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Minta Revisi</span>
                          </Button>
                          <Button
                            variant="emerald"
                            size="sm"
                            onClick={() => setPendingApprove(prop)}
                            className="text-xs gap-1 shadow-glow-secondary"
                            disabled={isSubmitting}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sahkan & Setujui</span>
                          </Button>
                        </>
                      )}
                      {prop.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Disahkan Pemerintah Desa
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal Konfirmasi Persetujuan */}
        {pendingApprove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-md w-full p-6 shadow-ambient-xl space-y-4 font-jakarta">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                    Konfirmasi Pengesahan Proposal
                  </h3>
                  <p className="text-xs text-slate-500">Persetujuan Resmi Program Pengabdian KKN</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-subtle dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  Dengan menyetujui, Pemerintah Desa menyatakan menerima program kerja:{' '}
                  <span className="font-bold text-navy-950 dark:text-white">{pendingApprove.judul}</span> oleh{' '}
                  <span className="font-semibold text-primary">{pendingApprove.kelompok}</span>.
                </p>
                <p className="text-[11px] text-slate-400">
                  Notifikasi real-time akan dikirimkan ke Ketua Kelompok Mahasiswa dan Dosen Pembimbing Lapangan.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPendingApprove(null)}
                  className="text-xs"
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  variant="emerald"
                  size="sm"
                  onClick={confirmApprove}
                  className="text-xs gap-1.5 shadow-glow-secondary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Ya, Sahkan Proposal</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
