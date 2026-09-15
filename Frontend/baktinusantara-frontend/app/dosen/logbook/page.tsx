'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MOCK_LOGBOOKS } from '@/lib/mock-data';
import { LogbookEntry } from '@/lib/types';
import {
  CheckSquare,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageSquare,
  Calendar,
  Clock,
  Send,
  X,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DosenLogbookPage() {
  const [logs, setLogs] = useState<LogbookEntry[]>(MOCK_LOGBOOKS);
  const [activeRevisionLog, setActiveRevisionLog] = useState<LogbookEntry | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [successModal, setSuccessModal] = useState(false);

  const handleApprove = (id: number) => {
    setLogs(
      logs.map((l) =>
        l.id === id
          ? {
              ...l,
              status: 'approved',
              disahkan_pada: new Date().toISOString().replace('T', ' ').slice(0, 19),
            }
          : l
      )
    );
    setSuccessModal(true);
    toast.success('Logbook berhasil disahkan oleh Dosen Pembimbing Lapangan!');
  };

  const handleSendRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRevisionLog || !revisionNotes.trim()) return;

    setLogs(
      logs.map((l) =>
        l.id === activeRevisionLog.id
          ? { ...l, status: 'revision', catatan_revisi_dpl: revisionNotes }
          : l
      )
    );

    toast.success('Catatan revisi telah dikirimkan ke mahasiswa bersangkutan!');
    setActiveRevisionLog(null);
    setRevisionNotes('');
  };

  return (
    <DashboardLayout title="Verifikasi & Pengesahan Logbook DPL">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
            Verifikasi Logbook Harian Mahasiswa
          </h1>
          <p className="text-xs text-slate-500 font-jakarta mt-0.5">
            Tinjau uraian kegiatan, bukti foto lapangan, serta jam kerja mahasiswa sebelum memberikan pengesahan resmi.
          </p>
        </div>

        {/* Logbook Items */}
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="p-6 border-slate-200 bg-white space-y-4 shadow-ambient">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{log.tanggal}</span>
                    <span>•</span>
                    <strong className="text-navy-950">{log.mahasiswa_nama} ({log.mahasiswa_nim})</strong>
                    <span>•</span>
                    <span className="font-bold text-primary bg-primary-50 px-2 py-0.5 rounded-md">
                      {log.durasi_jam} Jam Kerja
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-navy-950 font-epilogue mt-1">
                    {log.judul_kegiatan}
                  </h3>
                  <p className="text-xs text-emerald-700 font-semibold">
                    Target: {log.target_program_terkait}
                  </p>
                </div>

                <StatusBadge status={log.status} />
              </div>

              <p className="text-xs sm:text-sm text-slate-700 font-jakarta leading-relaxed whitespace-pre-line">
                {log.deskripsi}
              </p>

              {/* Revision note if any */}
              {log.catatan_revisi_dpl && (
                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-orange-800">
                    <AlertCircle className="w-4 h-4" />
                    <span>Catatan Revisi Terkirim:</span>
                  </div>
                  <p className="leading-relaxed">{log.catatan_revisi_dpl}</p>
                </div>
              )}

              {/* Photos */}
              {(log.foto_dokumentasi_urls?.length ?? 0) > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Lampiran Dokumentasi Foto:
                  </span>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {(log.foto_dokumentasi_urls ?? []).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="Dokumentasi"
                        className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-sm"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* DPL Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  onClick={() => {
                    setActiveRevisionLog(log);
                    setRevisionNotes(log.catatan_revisi_dpl || '');
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                  <span>Beri Catatan Revisi</span>
                </Button>

                {log.status !== 'approved' && (
                  <Button
                    onClick={() => handleApprove(log.id)}
                    variant="emerald"
                    size="sm"
                    className="shadow-glow-secondary gap-1.5 text-xs font-semibold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sahkan & Setujui Jam Kerja</span>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Revision Modal Dialog */}
      {activeRevisionLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-navy-950 font-epilogue">
                  Catatan Revisi Logbook DPL
                </h3>
              </div>
              <button
                onClick={() => setActiveRevisionLog(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Mahasiswa: <strong>{activeRevisionLog.mahasiswa_nama}</strong> — {activeRevisionLog.judul_kegiatan}
            </p>

            <form onSubmit={handleSendRevision} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Uraian Perbaikan yang Harus Dilengkapi Mahasiswa
                </label>
                <textarea
                  rows={4}
                  required
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Contoh: Mohon lengkapi rekapitulasi data nama-nama UMKM yang hadir dan lampirkan absensi..."
                  className="w-full p-3.5 bg-surface-canvas border border-slate-300 rounded-2xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary font-jakarta leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setActiveRevisionLog(null)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="amber" size="md" className="gap-1.5 font-bold">
                  <Send className="w-4 h-4" />
                  <span>Kirim Revisi ke Mahasiswa</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal (Stitch: Konfirmasi Sukses Logbook Disahkan DPL) */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-glow-secondary">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <h2 className="text-xl font-extrabold text-navy-950 font-epilogue">
              Logbook Sah Secara Digital
            </h2>
            <p className="text-xs text-slate-600 font-jakarta leading-relaxed">
              Jam kerja pengabdian lapangan telah disahkan dan otomatis diakumulasikan ke total target 200 jam kerja KKN mahasiswa.
            </p>

            <Button
              onClick={() => setSuccessModal(false)}
              variant="primary"
              size="md"
              className="w-full font-semibold"
            >
              Lanjut Verifikasi Lainnya
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
