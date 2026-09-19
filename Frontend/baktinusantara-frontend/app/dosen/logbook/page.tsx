'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MOCK_LOGBOOKS, MOCK_KELOMPOK_14 } from '@/lib/mock-data';
import { LogbookEntry } from '@/lib/types';
import {
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  ShieldCheck,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

type FilterStatus = 'semua' | 'menunggu' | 'revisi' | 'disetujui';

const getKelompokLabel = (log: LogbookEntry) => {
  if (log.kelompok_id === MOCK_KELOMPOK_14.id) return MOCK_KELOMPOK_14.nama_kelompok;
  return `Kelompok ${log.kelompok_id}`;
};

export default function DosenLogbookPage() {
  const [logs, setLogs] = useState<LogbookEntry[]>(MOCK_LOGBOOKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('semua');

  // inline revisi
  const [activeRevisionId, setActiveRevisionId] = useState<number | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [expandedRevisions, setExpandedRevisions] = useState<Set<number>>(
    () => new Set(logs.filter((l) => !!l.catatan_revisi_dpl).map((l) => l.id))
  );

  // approve confirmation
  const [pendingApproveLog, setPendingApproveLog] = useState<LogbookEntry | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // status filter
      if (filterStatus !== 'semua') {
        const statusMap: Record<FilterStatus, string[]> = {
          semua: [],
          menunggu: ['submitted', 'pending', 'draft'],
          revisi: ['revision'],
          disetujui: ['approved'],
        };
        if (!statusMap[filterStatus].includes(log.status)) return false;
      }
      // search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = [
          log.judul_kegiatan,
          log.deskripsi,
          log.target_program_terkait,
          getKelompokLabel(log),
          log.mahasiswa_nama,
          log.tanggal,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [logs, searchQuery, filterStatus]);

  const confirmApprove = () => {
    if (!pendingApproveLog) return;
    const id = pendingApproveLog.id;
    setLogs(
      logs.map((l) =>
        l.id === id
          ? {
              ...l,
              status: 'approved' as const,
              disahkan_pada: new Date().toISOString().replace('T', ' ').slice(0, 19),
            }
          : l
      )
    );
    setPendingApproveLog(null);
    toast.success('Logbook berhasil disahkan oleh Dosen Pembimbing Lapangan!');
  };

  const handleSendRevision = (e: React.FormEvent, log: LogbookEntry) => {
    e.preventDefault();
    if (!revisionNotes.trim()) return;

    setLogs(
      logs.map((l) =>
        l.id === log.id ? { ...l, status: 'revision' as const, catatan_revisi_dpl: revisionNotes } : l
      )
    );
    toast.success('Catatan revisi telah dikirimkan ke mahasiswa bersangkutan!');
    // keep dropdown visible after send
    setExpandedRevisions((prev) => new Set(prev).add(log.id));
    setActiveRevisionId(null);
    setRevisionNotes('');
  };

  const handleCancelRevision = () => {
    setActiveRevisionId(null);
    setRevisionNotes('');
  };

  const toggleRevisionDropdown = (id: number) => {
    setExpandedRevisions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'semua', label: 'Semua' },
    { value: 'menunggu', label: 'Menunggu' },
    { value: 'revisi', label: 'Revisi' },
    { value: 'disetujui', label: 'Disetujui' },
  ];

  return (
    <DashboardLayout title="Verifikasi & Pengesahan Logbook DPL">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
            Verifikasi Logbook Harian Mahasiswa
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-jakarta mt-0.5">
            Tinjau uraian kegiatan, bukti foto lapangan, serta jam kerja mahasiswa sebelum memberikan pengesahan resmi.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul kegiatan, deskripsi, atau nama kelompok..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl text-sm text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm font-jakarta"
            />
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
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
        </div>

        {/* Logbook Items */}
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <Card className="p-10 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-jakarta">Tidak ada logbook yang sesuai dengan pencarian / filter.</p>
            </Card>
          ) : (
            filteredLogs.map((log) => {
              const isRevisionActive = activeRevisionId === log.id;
              const isExpanded = expandedRevisions.has(log.id);
              const showActions = log.status !== 'approved';

              return (
                <Card key={log.id} className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-4 shadow-ambient">
                  {/* Header: nama kelompok + badge (tanggal dipindah ke bawah) */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 dark:border-navy-800 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <strong className="text-navy-950 dark:text-white">{getKelompokLabel(log)}</strong>
                      </div>
                      <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue mt-1">
                        {log.judul_kegiatan}
                      </h3>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                        Target: {log.target_program_terkait}
                      </p>
                    </div>

                    <StatusBadge
                      status={log.status}
                      label={
                        log.status === 'approved'
                          ? 'Disetujui'
                          : log.status === 'revision'
                            ? 'Perlu Revisi'
                            : 'Menunggu'
                      }
                    />
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-jakarta leading-relaxed whitespace-pre-line">
                    {log.deskripsi}
                  </p>

                  {/* Photos */}
                  {(log.foto_dokumentasi_urls?.length ?? 0) > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Lampiran Dokumentasi Foto:
                      </span>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {(log.foto_dokumentasi_urls ?? []).map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt="Dokumentasi"
                            className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm shrink-0"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Catatan revisi - dropdown (collapsible) */}
                  {log.catatan_revisi_dpl && (
                    <div className="rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleRevisionDropdown(log.id)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="flex items-center gap-1.5 font-bold text-orange-800 dark:text-orange-300 text-xs">
                          <AlertCircle className="w-4 h-4" />
                          Catatan Revisi:
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 -mt-1">
                          <p className="text-xs text-orange-950 dark:text-orange-200 leading-relaxed whitespace-pre-line">
                            {log.catatan_revisi_dpl}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inline input revisi */}
                  {isRevisionActive && (
                    <form
                      onSubmit={(e) => handleSendRevision(e, log)}
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
                        placeholder="Contoh: Mohon lengkapi rekapitulasi data nama-nama UMKM yang hadir dan lampirkan absensi..."
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

                  {/* Bottom bar: tanggal kiri bawah sejajar dengan button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium order-1">
                      <span>{log.tanggal}</span>
                    </div>

                    {/* DPL Action Buttons - hanya jika menunggu / revisi */}
                    {showActions ? (
                      <div className="flex items-center gap-2 order-2 sm:justify-end">
                        <Button
                          onClick={() => {
                            setActiveRevisionId(log.id);
                            setRevisionNotes(log.catatan_revisi_dpl || '');
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                          <span>Beri Catatan Revisi</span>
                        </Button>

                        <Button
                          onClick={() => setPendingApproveLog(log)}
                          variant="emerald"
                          size="sm"
                          className="shadow-glow-secondary gap-1.5 text-xs font-semibold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sahkan & Setujui Jam Kerja</span>
                        </Button>
                      </div>
                    ) : (
                      <span className="order-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Disetujui {(log.disahkan_pada ?? log.tanggal).split(' ')[0].slice(0, 10)}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Popup konfirmasi Sahkan */}
      {pendingApproveLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-navy-800 space-y-5">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-navy-950 dark:text-white font-epilogue">Sahkan Logbook Ini?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-jakarta leading-relaxed">
                Anda akan menyetujui <strong>{pendingApproveLog.judul_kegiatan}</strong> dari{' '}
                <strong>{getKelompokLabel(pendingApproveLog)}</strong> pada tanggal{' '}
                <strong>{pendingApproveLog.tanggal}</strong>. Pastikan logbook sudah sesuai.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="md" className="flex-1" onClick={() => setPendingApproveLog(null)}>
                Batal
              </Button>
              <Button variant="emerald" size="md" className="flex-1 font-semibold" onClick={confirmApprove}>
                Ya, Setujui
              </Button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
