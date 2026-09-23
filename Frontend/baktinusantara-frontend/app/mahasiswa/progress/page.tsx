'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/services';
import { LogbookEntry, Proposal } from '@/lib/types';
import {
  BookOpen,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  X,
  FileCheck,
  Sparkles,
  Send,
  Loader2,
  Camera,
  Inbox,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MahasiswaProgressPage() {
  const [logbooks, setLogbooks] = useState<LogbookEntry[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeProposalId, setActiveProposalId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal form state
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mingguKe, setMingguKe] = useState<number>(1);
  const [persentase, setPersentase] = useState<number>(25);
  const [durasiJam, setDurasiJam] = useState<number>(6);
  const [judul, setJudul] = useState<string>('');
  const [targetProgram, setTargetProgram] = useState<string>('Pelaksanaan Program Kerja Utama');
  const [deskripsi, setDeskripsi] = useState<string>('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  const fetchProgressData = async () => {
    try {
      setIsLoading(true);
      const props = await api.proposal.getMyProposals();
      const propList = Array.isArray(props) ? props : [];
      setProposals(propList);

      let targetPropId: number | null = null;
      if (propList.length > 0) {
        targetPropId = propList[0].id;
      }

      setActiveProposalId(targetPropId);

      if (targetPropId) {
        try {
          const res = await api.progress.getByProposal(targetPropId);
          const list: any[] = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : [];
          setLogbooks(list.map((item) => api.progress.normalizeEntry(item)));
        } catch {
          setLogbooks([]);
        }
      }
    } catch (err) {
      console.error('Error memuat data progress mahasiswa:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  const filteredLogs = logbooks.filter((log) => {
    if (filterStatus === 'all') return true;
    return log.status === filterStatus;
  });

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !deskripsi.trim()) {
      toast.error('Mohon lengkapi judul dan deskripsi kegiatan');
      return;
    }

    if (!activeProposalId) {
      toast.error('Belum ada proposal aktif yang terhubung untuk pelaporan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        proposal_id: activeProposalId,
        minggu_ke: mingguKe,
        persentase,
        deskripsi: `[${judul}] ${deskripsi}`,
      };
      if (fotoFile) {
        payload.foto = fotoFile;
      }

      await api.progress.submitProgress(payload);
      toast.success('Logbook mingguan berhasil dikirim ke Dosen Pembimbing Lapangan!');

      // Re-fetch fresh logbooks from server
      const res = await api.progress.getByProposal(activeProposalId);
      const list: any[] = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : [];
      setLogbooks(list.map((item) => api.progress.normalizeEntry(item)));

      setIsModalOpen(false);
      setJudul('');
      setDeskripsi('');
      setFotoFile(null);
    } catch (err: any) {
      console.error('Gagal mengirim logbook:', err);
      toast.error(err.response?.data?.message || 'Gagal mengirimkan logbook mingguan ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeProp = proposals.find((p) => p.id === activeProposalId) || proposals[0];

  return (
    <DashboardLayout title="Logbook & Progres Harian Mahasiswa">
      <div className="space-y-6">
        {/* Page Top Title & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Logbook Harian KKN
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-jakarta mt-0.5">
              Catat setiap aktivitas pengabdian di desa untuk divalidasi oleh Dosen Pembimbing (DPL).
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            size="md"
            className="shadow-glow-primary gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Entri Logbook Baru</span>
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: `Semua Logbook (${logbooks.length})` },
            { id: 'approved', label: 'Disetujui DPL' },
            { id: 'submitted', label: 'Menunggu Verifikasi' },
            { id: 'revision', label: 'Perlu Revisi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-full font-semibold transition-all whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white dark:bg-navy-900 text-navy-800 dark:text-slate-200 hover:bg-surface-subtle dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading / Empty / List state */}
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Memuat catatan logbook pengabdian...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <Card className="p-12 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-navy-800 text-primary flex items-center justify-center mx-auto">
              <Inbox className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                Belum Ada Catatan Logbook
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Mulai catat pelaksanaan program kerja lapangan Anda setiap minggunya untuk memenuhi syarat verifikasi DPL dan BAST Desa.
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Isi Logbook Baru Sekarang
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="p-6 border-slate-200 dark:border-navy-800 space-y-4 bg-white dark:bg-navy-900 shadow-ambient">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>{log.tanggal}</span>
                      <span>•</span>
                      <span>Minggu ke-{log.minggu_ke}</span>
                      {log.durasi_jam ? (
                        <>
                          <span>•</span>
                          <span className="font-bold text-navy-900 dark:text-slate-200 bg-slate-100 dark:bg-navy-800 px-2 py-0.5 rounded-md">
                            {log.durasi_jam} Jam Kerja
                          </span>
                        </>
                      ) : null}
                    </div>
                    <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue mt-1">
                      {log.judul_kegiatan}
                    </h3>
                    <p className="text-xs font-semibold text-primary-700 dark:text-primary-400">
                      Target: {log.target_program_terkait}
                    </p>
                  </div>

                  <StatusBadge status={log.status} />
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-jakarta leading-relaxed whitespace-pre-line">
                  {log.deskripsi}
                </p>

                {/* Revision note box if any */}
                {log.catatan_revisi_dpl && (
                  <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 text-xs text-orange-950 dark:text-orange-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-orange-800 dark:text-orange-300">
                      <AlertCircle className="w-4 h-4" />
                      <span>Catatan Perbaikan dari DPL:</span>
                    </div>
                    <p className="leading-relaxed">{log.catatan_revisi_dpl}</p>
                  </div>
                )}

                {/* Photos attached */}
                {(log.foto_dokumentasi_urls?.length ?? 0) > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Dokumentasi Kegiatan:
                    </span>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {(log.foto_dokumentasi_urls ?? []).map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Dokumentasi"
                          className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Popup Pengisian Logbook */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-navy-800 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950/80 text-primary dark:text-primary-300 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy-950 dark:text-white font-epilogue">
                    Formulir Logbook Harian KKN
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeProp?.posKebutuhan?.desa?.nama_desa ? `Desa ${activeProp.posKebutuhan.desa.nama_desa}` : 'Pelaporan Kegiatan Lapangan'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                    Tanggal Pelaksanaan
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                    Minggu KKN Ke-
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    required
                    value={mingguKe}
                    onChange={(e) => setMingguKe(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                    Persentase Capaian (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={persentase}
                    onChange={(e) => setPersentase(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                  Judul Ringkas Kegiatan
                </label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Sosialisasi dan Pelatihan E-Commerce Warga Desa"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                  Deskripsi Kegiatan Lapangan & Hasil Capaian
                </label>
                <textarea
                  rows={4}
                  required
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Tuliskan secara objektif apa yang dikerjakan, pihak desa yang terlibat, serta kendala/solusi..."
                  className="w-full p-3.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-2xl text-xs text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary font-jakarta leading-relaxed"
                />
              </div>

              {/* Upload Foto */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                  Unggah Foto Dokumentasi Lapangan (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 dark:file:bg-primary-950/70 file:text-primary dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-800">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  className="gap-1.5 shadow-glow-primary"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirimkan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirimkan ke DPL</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
