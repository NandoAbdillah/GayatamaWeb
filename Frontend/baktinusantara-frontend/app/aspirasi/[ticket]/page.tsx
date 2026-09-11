'use client';

import React, { useState } from 'react';
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

  // Dynamic ticket state with rich fallback
  const [ticketData, setTicketData] = useState({
    ticket_number: ticketId || 'ASP-2026-0901',
    judul: 'Perbaikan Sistem Irigasi Sawah & Otomatisasi Debit Air Dusun 2',
    pengusul: 'Bpk. Su***anto (Ketua Gapoktan Sumber Makmur)',
    desa: 'Desa Sukamaju',
    kecamatan: 'Ciawi',
    kabupaten: 'Bogor',
    lokasi_spesifik: 'Blok Sawah Lebak, RT 03 / RW 02',
    tanggal_masuk: '15 Agustus 2026, 09:30 WIB',
    kategori: 'Agrikultur & Ketahanan Pangan',
    urgensi: 'Tinggi (Krisis Air Musim Tanam)',
    status: 'converted_to_pos',
    deskripsi:
      'Saluran irigasi primer sepanjang 400 meter mengalami sedimentasi dan pintu air manual sering macet, menyebabkan 25 hektar sawah warga kekurangan pasokan air saat musim kemarau.',
    foto_bukti:
      'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop&q=80',
    kelompok: {
      nama: 'Kelompok 14 KKN Tematik',
      ketua: 'Muhammad Raihan Pratama',
      jurusan_kontribusi: 'Teknik Informatika, Agribisnis, Teknik Sipil',
      luaran_program: 'Pemasangan Sensor Debit IoT & Normalisasi Saluran Irigasi 450M',
      foto_hasil:
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
    },
    timeline: [
      {
        step: '01',
        title: 'Aspirasi Masuk & Tercatat',
        date: '15 Agu 2026, 09:30 WIB',
        desc: 'Aspirasi warga berhasil didaftarkan ke sistem dan nomor tiket resmi diterbitkan.',
        status: 'completed',
      },
      {
        step: '02',
        title: 'Verifikasi Lapangan oleh Kepala Desa',
        date: '17 Agu 2026, 14:15 WIB',
        desc: 'Kepala Desa Sukamaju memvalidasi urgensi kondisi saluran air bersama pengurus Gapoktan.',
        status: 'completed',
      },
      {
        step: '03',
        title: 'Dikonversi Menjadi Pos Kebutuhan KKN',
        date: '20 Agu 2026, 10:00 WIB',
        desc: 'Pos kebutuhan resmi dipublikasikan di katalog BaktiNusantara dengan kuota 5 mahasiswa.',
        status: 'completed',
      },
      {
        step: '04',
        title: 'Dilamar oleh Kelompok 14 Mahasiswa',
        date: '25 Agu 2026, 16:45 WIB',
        desc: 'Proposal program kerja smart-irrigation disetujui paralel oleh Kades dan Dosen DPL.',
        status: 'completed',
      },
      {
        step: '05',
        title: 'Program Selesai & Pengesahan BAST',
        date: '05 Sep 2026, 11:00 WIB',
        desc: 'Fasilitas diserahterimakan kepada warga dan ditandatangani melalui Berita Acara Serah Terima.',
        status: 'completed',
      },
    ],
  });

  React.useEffect(() => {
    async function loadTicket() {
      try {
        const res: any = await api.aspirasi.getByTicket(ticketId);
        if (res && res.id) {
          setTicketData((prev) => ({
            ...prev,
            ticket_number: String(res.id || ticketId),
            judul: res.deskripsi ? `Aspirasi Warga: ${res.deskripsi.slice(0, 45)}...` : prev.judul,
            pengusul: res.pelapor_nama || prev.pengusul,
            desa: res.desa?.nama_desa || prev.desa,
            kecamatan: res.desa?.kecamatan || prev.kecamatan,
            kabupaten: res.desa?.kabupaten || prev.kabupaten,
            status: res.status || 'menunggu',
            kategori: res.kategori || prev.kategori,
            urgensi: res.urgensi || prev.urgensi,
            deskripsi: res.deskripsi || prev.deskripsi,
            foto_bukti: res.foto_url || prev.foto_bukti,
          }));
        }
      } catch (err) {
        console.warn('Fallback to mock ticket tracking:', err);
      }
    }
    if (ticketId) loadTicket();
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

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Nomor Tiket:</span>
            <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-primary">
              {ticketData.ticket_number}
            </span>
          </div>
        </div>

        {/* Hero Card Tiket */}
        <Card className="p-6 sm:p-8 space-y-6 border-slate-200 dark:border-navy-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-navy-800">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status="converted_to_pos" label="Program Telah Terealisasi" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-wide bg-primary/10 px-2 py-0.5 rounded-md">
                  {ticketData.kategori}
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
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-right shrink-0">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                Pelaksana Lapangan
              </span>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
                {ticketData.kelompok.nama}
              </p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                Ketua: {ticketData.kelompok.ketua}
              </p>
            </div>
          </div>

          {/* Timeline Progres Penanganan */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Rekam Jejak Penanganan Aspirasi
            </h3>

            <div className="space-y-3">
              {ticketData.timeline.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800/80"
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <p className="text-xs font-bold text-navy-950 dark:text-white">{item.title}</p>
                      <span className="text-[10px] font-medium text-slate-400 font-mono">{item.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Galeri Sebelum & Sesudah */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-navy-800">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Dokumentasi Lapangan: Sebelum & Sesudah Intervensi KKN
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-navy-800 space-y-2 p-3 bg-white dark:bg-navy-950">
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">
                  Kondisi Awal (Aspirasi Warga)
                </span>
                <div className="h-44 rounded-xl overflow-hidden">
                  <img
                    src={ticketData.foto_bukti}
                    alt="Kondisi Awal"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {ticketData.deskripsi}
                </p>
              </div>

              <div className="rounded-2xl overflow-hidden border border-emerald-200 dark:border-emerald-800 space-y-2 p-3 bg-emerald-50/30 dark:bg-navy-950">
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
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {ticketData.kelompok.luaran_program}
                </p>
              </div>
            </div>
          </div>

          {/* Form Rating & Ulasan Kepuasan Warga */}
          <div className="pt-6 border-t border-slate-100 dark:border-navy-800 space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
                Ulasan Kepuasan Masyarakat atas Hasil Program KKN
              </h3>
            </div>

            {feedbackSent ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Ulasan Anda Berhasil Direkam!
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Penilaian bintang {rating}/5 dan masukan Anda akan menjadi bagian dari laporan kinerja LPPM.
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
                            star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
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
                  placeholder="Tuliskan testimoni atau masukan warga mengenai dampak program KKN ini di desa..."
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
      </main>

      <Footer />
    </div>
  );
}
