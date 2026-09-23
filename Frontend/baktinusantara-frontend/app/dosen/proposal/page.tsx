'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/services';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Users,
  MapPin,
  Download,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

type ProposalStatus = 'menunggu' | 'revision' | 'approved';
type FilterStatus = 'semua' | 'menunggu' | 'revisi' | 'disetujui';

interface ProposalItem {
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

export default function DosenProposalPage() {
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('semua');
  const [activeRevisionId, setActiveRevisionId] = useState<number | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [expandedRevisions, setExpandedRevisions] = useState<Set<number>>(new Set());
  const [pendingApprove, setPendingApprove] = useState<ProposalItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const groups = await api.dosen.getBimbinganKelompok();
      if (Array.isArray(groups)) {
        const list: ProposalItem[] = [];
        groups.forEach((k: any) => {
          if (k.proposal) {
            const p = k.proposal;
            const statusKelayakan = p.status_kelayakan_dosen;
            let uiStatus: ProposalStatus = 'menunggu';
            if (statusKelayakan === 'layak') uiStatus = 'approved';
            else if (statusKelayakan === 'revisi') uiStatus = 'revision';

            const desaObj = p.pos_kebutuhan?.desa;
            const desaStr = desaObj
              ? `Desa ${desaObj.nama_desa || ''}, ${desaObj.kabupaten || desaObj.kecamatan || ''}`
              : 'Desa Mitra';

            list.push({
              id: p.id,
              judul: p.pos_kebutuhan?.judul || p.draf_proker || `Proposal Program #${p.id}`,
              kelompok: k.nama_kelompok || `Kelompok #${k.id}`,
              lokasi: desaStr,
              tujuan: p.pos_kebutuhan?.deskripsi || p.draf_proker || 'Pengabdian masyarakat dan implementasi teknologi.',
              file_name: p.file_proposal_url ? p.file_proposal_url.split('/').pop() || 'Proposal_KKN.pdf' : 'Proposal_KKN.pdf',
              file_url: `/api/proposal/${p.id}/file`,
              status: uiStatus,
              catatan_revisi: p.catatan_dosen || '',
              created_at: p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '2026',
              disetujui_pada: p.dosen_reviewed_at || undefined,
            });
          }
        });
        setProposals(list);
        setExpandedRevisions(new Set(list.filter((x) => !!x.catatan_revisi).map((x) => x.id)));
      } else {
        setProposals([]);
      }
    } catch (err) {
      console.error('Gagal mengambil proposal bimbingan dosen:', err);
      toast.error('Gagal memuat proposal dari server.');
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      if (filterStatus === 'menunggu' && p.status !== 'menunggu') return false;
      if (filterStatus === 'revisi' && p.status !== 'revision') return false;
      if (filterStatus === 'disetujui' && p.status !== 'approved') return false;
      return true;
    });
  }, [proposals, filterStatus]);

  const handleSendRevision = async (e: React.FormEvent, prop: ProposalItem) => {
    e.preventDefault();
    if (!revisionNotes.trim()) return;

    try {
      setSubmitting(true);
      await api.dosen.reviewKelayakanProposal(prop.id, {
        status_kelayakan: 'revisi',
        catatan_dosen: revisionNotes.trim(),
      });
      toast.success('Catatan revisi berhasil dikirim ke kelompok mahasiswa!');
      setActiveRevisionId(null);
      setRevisionNotes('');
      await loadProposals();
    } catch (err: any) {
      console.error('Gagal mengirim revisi proposal:', err);
      toast.error('Gagal mengirim catatan revisi ke server.');
    } finally {
      setSubmitting(false);
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
    try {
      setSubmitting(true);
      await api.dosen.reviewKelayakanProposal(pendingApprove.id, {
        status_kelayakan: 'layak',
        catatan_dosen: 'Proposal telah memenuhi seluruh standar kelayakan akademik & operasional DPL.',
      });
      toast.success('Proposal berhasil disetujui!');
      setPendingApprove(null);
      await loadProposals();
    } catch (err) {
      console.error('Gagal menyetujui proposal:', err);
      toast.error('Gagal menyetujui proposal di server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadFile = async (prop: ProposalItem) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sanctum_token') : null;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const fileUrl = `${baseUrl}/api/proposal/${prop.id}/file`;
      
      const res = await fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf, application/octet-stream, */*',
        },
      });

      if (!res.ok) {
        toast.error('Berkas proposal belum diunggah atau tidak ditemukan di server.');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = prop.file_name || `Proposal_${prop.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Berkas proposal berhasil diunduh');
    } catch (err) {
      toast.error('Gagal mengunduh berkas proposal.');
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
    <DashboardLayout title="Validasi Kelayakan Proposal Binaan">
      <div className="space-y-6 font-jakarta">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">Validasi Kelayakan Proposal Program KKN</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dosen Pembimbing Lapangan (DPL) memastikan aspek metodologis, keselamatan lapangan, dan relevansi keilmuan mahasiswa binaan.
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-1.5 shadow-sm w-fit">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === opt.value
                  ? 'bg-navy-950 dark:bg-white text-white dark:text-navy-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <Card className="p-10 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada proposal pada filter ini.</p>
            </Card>
          ) : (
            filtered.map((prop) => {
              const isRevisionActive = activeRevisionId === prop.id;
              const isExpanded = expandedRevisions.has(prop.id);
              const badge = getStatusBadgeProps(prop.status);
              const showActions = prop.status === 'menunggu' || prop.status === 'revision';

              return (
                <Card key={prop.id} className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-4 shadow-card">
                  {/* Judul sejajar dengan status */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 dark:border-navy-800 pb-3">
                    <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue leading-snug flex-1 pr-2">{prop.judul}</h3>
                    <StatusBadge status={badge.status} label={badge.label} className="shrink-0" />
                  </div>

                  {/* Kelompok & Lokasi di bawah judul */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      {prop.kelompok}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {prop.lokasi}
                    </span>
                  </div>

                  {/* Tujuan */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tujuan Program KKN:</span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{prop.tujuan}</p>
                  </div>

                  {/* File proposal + download icon (menggantikan layak badge) */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-navy-950 dark:text-white truncate">{prop.file_name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(prop)}
                      className="w-8 h-8 rounded-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-navy-950 hover:text-white dark:hover:bg-navy-800 transition-colors shrink-0"
                      title="Download proposal"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Catatan revisi dropdown (jika ada) */}
                  {prop.catatan_revisi && (
                    <div className="rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleRevision(prop.id)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="flex items-center gap-1.5 font-bold text-orange-800 dark:text-orange-300 text-xs">
                          <AlertCircle className="w-4 h-4" />
                          Catatan Revisi:
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-orange-700 dark:text-orange-400" /> : <ChevronDown className="w-4 h-4 text-orange-700 dark:text-orange-400" />}
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 -mt-1">
                          <p className="text-xs text-orange-950 dark:text-orange-200 leading-relaxed whitespace-pre-line">{prop.catatan_revisi}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inline input revisi (mirip logbook) */}
                  {isRevisionActive && (
                    <form
                      onSubmit={(e) => handleSendRevision(e, prop)}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-3 animate-in fade-in"
                    >
                      <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200">
                        Alasan Revisi <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        autoFocus
                        value={revisionNotes}
                        onChange={(e) => setRevisionNotes(e.target.value)}
                        placeholder="Contoh: Mohon perbaiki metodologi, tambahkan mitigasi risiko lapangan dan rincian anggaran..."
                        className="w-full p-3.5 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary font-jakarta leading-relaxed"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={handleCancelRevision}>
                          Batal
                        </Button>
                        <Button type="submit" variant="amber" size="sm" className="gap-1.5 font-bold">
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim</span>
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Bottom bar: tanggal kiri, button kanan */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium order-1">{prop.created_at}</span>
                    {showActions ? (
                      <div className="flex items-center gap-2 order-2 sm:justify-end">
                        <Button
                          onClick={() => {
                            setActiveRevisionId(prop.id);
                            setRevisionNotes(prop.catatan_revisi || '');
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                          <span>Beri Catatan Revisi</span>
                        </Button>
                        <Button
                          onClick={() => setPendingApprove(prop)}
                          variant="emerald"
                          size="sm"
                          className="shadow-glow-secondary gap-1.5 text-xs font-semibold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui Proposal</span>
                        </Button>
                      </div>
                    ) : (
                      <span className="order-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Disetujui {(prop.disetujui_pada ?? prop.created_at).split(' ')[0].slice(0, 10)}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Popup konfirmasi Setujui */}
        {pendingApprove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-navy-800 space-y-5">
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-extrabold text-navy-950 dark:text-white font-epilogue">Setujui Proposal Ini?</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-jakarta leading-relaxed">
                  Anda akan menyetujui <strong>{pendingApprove.judul}</strong> dari <strong>{pendingApprove.kelompok}</strong>.
                  Aksi ini tidak dapat dibatalkan. Pastikan proposal sudah sesuai.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="md" className="flex-1" onClick={() => setPendingApprove(null)}>
                  Batal
                </Button>
                <Button variant="emerald" size="md" className="flex-1 font-semibold" onClick={confirmApprove}>
                  Ya, Setujui
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
