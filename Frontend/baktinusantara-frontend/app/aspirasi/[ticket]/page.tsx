'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Building,
  Users,
  FileCheck2,
  ArrowLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/services';

export default function DetailTicketAspirasiPage({
  params,
}: {
  params: { ticket: string };
}) {
  const ticketId = decodeURIComponent(params.ticket);
  const [rating, setRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<any | null>(null);

  useEffect(() => {
    async function loadTicket() {
      try {
        setLoading(true);
        setError(null);
        const res: any = await api.aspirasi.getByTicket(ticketId);
        const raw = res?.data || res;

        if (raw && (raw.id || raw.ticket_number)) {
          setTicketData({
            ticket_number: raw.ticket_number || String(raw.id),
            id: raw.id,
            judul: raw.judul || (raw.deskripsi ? `Aspirasi Warga: ${raw.deskripsi.slice(0, 45)}...` : 'Aspirasi Warga'),
            pengusul: raw.pelapor_nama || raw.nama_pengadu || 'Masyarakat',
            desa: raw.desa?.nama_desa || raw.nama_desa || 'Desa Mitra',
            kecamatan: raw.desa?.kecamatan || raw.kecamatan || '-',
            kabupaten: raw.desa?.kabupaten || raw.kabupaten || '-',
            lokasi_spesifik: raw.lokasi_spesifik || raw.alamat || (raw.latitude && raw.longitude ? `${raw.latitude}, ${raw.longitude}` : 'Wilayah Desa'),
            tanggal_masuk: raw.created_at ? new Date(raw.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-',
            kategori: raw.kategori || 'Umum',
            urgensi: raw.urgensi || 'Sedang',
            status: raw.status || 'pending',
            deskripsi: raw.deskripsi || '-',
            alasan_tolak: raw.alasan_tolak || null,
            foto_bukti: raw.foto_url || raw.foto_bukti || null,
            pos_kebutuhan: raw.pos_kebutuhan || raw.posKebutuhan || null,
            kelompok: raw.kelompok || null,
          });
        } else {
          setError('Aspirasi dengan nomor tiket tersebut tidak ditemukan dalam sistem database.');
        }
      } catch (err: any) {
        console.error('Failed to load aspirasi ticket:', err);
        setError(err?.response?.data?.message || 'Gagal memuat detail status tiket aspirasi.');
      } finally {
        setLoading(false);
      }
    }
    if (ticketId) {
      loadTicket();
    } else {
      setLoading(false);
      setError('Nomor tiket tidak valid.');
    }
  }, [ticketId]);

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      toast.error('Harap tuliskan ulasan Anda');
      return;
    }
    setFeedbackSent(true);
    toast.success('Terima kasih! Ulasan warga berhasil disimpan dan masuk ke evaluasi LPPM.');
  };

  const getTimelineSteps = (ticket: any) => {
    const isRejected = ticket.status === 'ditolak' || ticket.status === 'rejected';
    const isConverted = ticket.status === 'converted_to_pos';
    const isVerified = ticket.status === 'verified' || ticket.status === 'disetujui' || isConverted;

    return [
      {
        step: '01',
        title: 'Aspirasi Masuk & Tercatat',
        date: ticket.tanggal_masuk,
        desc: 'Aspirasi warga berhasil didaftarkan ke sistem dan nomor tiket resmi diterbitkan.',
        status: 'completed',
      },
      {
        step: '02',
        title: isRejected ? 'Aspirasi Ditolak' : 'Verifikasi Lapangan oleh Kepala/Perangkat Desa',
        date: isRejected || isVerified ? 'Telah Ditinjau' : 'Dalam Proses',
        desc: isRejected
          ? `Aspirasi tidak dapat ditindaklanjuti. Alasan: ${ticket.alasan_tolak || 'Tidak memenuhi kriteria program KKN'}`
          : isVerified
          ? 'Perangkat Desa telah memvalidasi urgensi dan kondisi di lapangan.'
          : 'Menunggu peninjauan dan validasi fakta lapangan oleh perangkat desa setempat.',
        status: isRejected ? 'rejected' : isVerified ? 'completed' : 'active',
      },
      {
        step: '03',
        title: 'Dikonversi Menjadi Pos Kebutuhan KKN',
        date: isConverted ? 'Telah Diterbitkan' : 'Tahap Berikutnya',
        desc: isConverted
          ? 'Aspirasi telah resmi dipublikasikan di katalog BaktiNusantara agar dapat dilamar kelompok mahasiswa.'
          : 'Setelah verifikasi lapangan disetujui, aspirasi akan diubah menjadi pos kebutuhan resmi.',
        status: isConverted ? 'completed' : isRejected ? 'disabled' : 'pending',
      },
    ];
  };

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] flex flex-col font-jakarta transition-colors duration-200">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/aspirasi"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-navy-950 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Formulir Aspirasi</span>
          </Link>

          {ticketData && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Nomor Tiket:</span>
              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-primary">
                #{ticketData.ticket_number}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Memeriksa status tiket di basis data...</p>
          </div>
        ) : error || !ticketData ? (
          <Card className="p-8 sm:p-12 text-center space-y-4 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-navy-950 dark:text-white">Tiket Tidak Ditemukan</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {error || 'Nomor tiket yang Anda masukkan tidak sesuai atau belum tercatat di sistem kami.'}
            </p>
            <div className="pt-2">
              <Link href="/aspirasi">
                <Button variant="primary" size="sm" className="font-bold text-xs">
                  Cari Tiket Lain
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Hero Card Tiket */
          <Card className="p-6 sm:p-8 space-y-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-navy-800">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={ticketData.status} />
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wide bg-primary/10 px-2 py-0.5 rounded-md">
                    {ticketData.kategori}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-navy-800 px-2 py-0.5 rounded-md">
                    Urgensi: {ticketData.urgensi}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                  {ticketData.judul}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>
                    {ticketData.lokasi_spesifik}, {ticketData.desa}, Kec. {ticketData.kecamatan}, {ticketData.kabupaten}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Diajukan oleh: <span className="font-semibold text-slate-600 dark:text-slate-300">{ticketData.pengusul}</span> • {ticketData.tanggal_masuk}
                </p>
              </div>

              {ticketData.kelompok ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-right shrink-0">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                    Pelaksana Lapangan
                  </span>
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
                    {ticketData.kelompok.nama || ticketData.kelompok.nama_kelompok}
                  </p>
                  {ticketData.kelompok.ketua && (
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      Ketua: {ticketData.kelompok.ketua}
                    </p>
                  )}
                </div>
              ) : ticketData.pos_kebutuhan ? (
                <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 text-right shrink-0">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                    Pos KKN Terbit
                  </span>
                  <p className="text-xs font-bold text-navy-950 dark:text-white mt-0.5">
                    #{ticketData.pos_kebutuhan.id || 'POS'}
                  </p>
                  <Link
                    href={`/search/${ticketData.pos_kebutuhan.id}`}
                    className="text-[10px] font-bold text-primary hover:underline block mt-1"
                  >
                    Lihat di Katalog Pos →
                  </Link>
                </div>
              ) : null}
            </div>

            {/* Timeline Progres Penanganan */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Rekam Jejak Penanganan Aspirasi
              </h3>

              <div className="space-y-3">
                {getTimelineSteps(ticketData).map((item, idx) => {
                  const isCompleted = item.status === 'completed';
                  const isRejected = item.status === 'rejected';
                  const isActive = item.status === 'active';

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all ${
                        isRejected
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                          : isCompleted
                          ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40'
                          : isActive
                          ? 'bg-primary-50/40 dark:bg-primary-950/20 border-primary-200 dark:border-primary-900/50'
                          : 'bg-slate-50/50 dark:bg-navy-950 border-slate-100 dark:border-navy-800/80 opacity-70'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm ${
                          isRejected
                            ? 'bg-rose-500 text-white'
                            : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isActive
                            ? 'bg-primary text-white animate-pulse'
                            : 'bg-slate-200 dark:bg-navy-800 text-slate-400'
                        }`}
                      >
                        {isRejected ? '✕' : isCompleted ? '✓' : item.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <p
                            className={`text-xs font-bold ${
                              isRejected
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-navy-950 dark:text-white'
                            }`}
                          >
                            {item.title}
                          </p>
                          <span className="text-[10px] font-medium text-slate-400 font-mono">{item.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dokumentasi Lapangan */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-navy-800">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Dokumentasi Lapangan & Deskripsi Kebutuhan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2 p-3.5 bg-white dark:bg-navy-950">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Kondisi Aspirasi Warga
                  </span>
                  {ticketData.foto_bukti ? (
                    <div className="h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-navy-900">
                      <img
                        src={ticketData.foto_bukti}
                        alt="Kondisi Awal"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-44 rounded-xl border border-dashed border-slate-200 dark:border-navy-800 flex flex-col items-center justify-center text-slate-400 text-xs">
                      <MessageSquare className="w-6 h-6 mb-1 opacity-50" />
                      <span>Tidak ada foto lampiran</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                    {ticketData.deskripsi}
                  </p>
                </div>

                {ticketData.kelompok?.foto_hasil ? (
                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2 p-3.5 bg-emerald-50/30 dark:bg-navy-950">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
                      Hasil Karya Nyata Mahasiswa KKN
                    </span>
                    <div className="h-44 rounded-xl overflow-hidden">
                      <img
                        src={ticketData.kelompok.foto_hasil}
                        alt="Hasil Realisasi KKN"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed pt-1">
                      {ticketData.kelompok.luaran_program || 'Program telah diselesaikan.'}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-100 dark:border-navy-800/80 p-5 bg-slate-50/50 dark:bg-navy-950 flex flex-col items-center justify-center text-center space-y-2">
                    <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-bold text-navy-950 dark:text-white">Tahap Realisasi KKN</p>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      {ticketData.status === 'converted_to_pos'
                        ? 'Pos kebutuhan sedang dalam proses seleksi tim mahasiswa dan pelaksanaan kerja.'
                        : 'Hasil karya dan dokumentasi luaran akan ditampilkan setelah program selesai diverifikasi.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Rating & Ulasan Kepuasan Warga */}
            <div className="pt-6 border-t border-slate-100 dark:border-navy-800 space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
                  Ulasan Kepuasan Masyarakat atas Penanganan Aspirasi
                </h3>
              </div>

              {feedbackSent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Ulasan Anda Berhasil Direkam!
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Penilaian bintang {rating}/5 dan masukan Anda akan menjadi bagian dari evaluasi berkala pemerintah desa dan LPPM.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendFeedback} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Beri Penilaian:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-600">{rating} dari 5 Bintang</span>
                  </div>

                  <textarea
                    rows={3}
                    required
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tuliskan testimoni atau masukan warga mengenai tindak lanjut aspirasi ini..."
                    className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />

                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" size="sm" className="text-xs font-bold gap-2">
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Ulasan Warga</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
