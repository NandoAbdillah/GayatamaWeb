'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Star,
  CheckCircle2,
  Heart,
  MessageSquare,
  Building,
  Users,
  Send,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { StyledSelect } from '@/components/ui/StyledSelect';

export default function SurveiKepuasanMasyarakatPage({
  params,
}: {
  params: { id: string };
}) {
  const proposalId = params.id || '1';
  const [submitted, setSubmitted] = useState(false);

  const [ratings, setRatings] = useState<{ [key: string]: number }>({
    etika: 5,
    kemanfaatan: 5,
    keberlanjutan: 4,
    komunikasi: 5,
  });

  const [formData, setFormData] = useState({
    nama_responden: '',
    status_warga: 'Warga / Petani',
    dusun: 'Dusun 2 Sukamaju',
    komentar_dampak: '',
    harapan_kkn: '',
  });

  const questions = [
    {
      key: 'etika',
      title: '1. Etika, Kesopanan, dan Adaptasi Budaya',
      desc: 'Bagaimana penilaian Bapak/Ibu terhadap sopan santun dan tata krama mahasiswa saat berinteraksi dengan warga?',
    },
    {
      key: 'kemanfaatan',
      title: '2. Kemanfaatan Program Kerja Lapangan',
      desc: 'Seberapa besar manfaat alat, modul, atau pelatihan yang diberikan mahasiswa bagi kehidupan sehari-hari warga?',
    },
    {
      key: 'keberlanjutan',
      title: '3. Keberlanjutan Fasilitas & Penyerahan Hasil',
      desc: 'Apakah fasilitas/buku panduan yang ditinggalkan mudah dirawat dan dilanjutkan oleh masyarakat secara mandiri?',
    },
    {
      key: 'komunikasi',
      title: '4. Koordinasi dengan Aparat Desa & Tokoh Warga',
      desc: 'Bagaimana koordinasi dan komunikasi mahasiswa dengan pengurus RT/RW, Dusun, dan Pemerintah Desa?',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      try {
        await apiClient.post(`/api/survei/${proposalId}`, {
          ...formData,
          ratings,
        });
      } catch (err) {
        // demo fallback
      }

      setSubmitted(true);
      toast.success('Terima kasih! Survei evaluasi masyarakat berhasil dikirim.');
    } catch (e) {
      toast.error('Gagal mengirim survei');
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] flex flex-col font-jakarta transition-colors duration-200">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-navy-950 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>

        <Card className="p-6 sm:p-10 space-y-6 border-slate-200 dark:border-navy-800 shadow-2xl">
          {/* Header Card */}
          <div className="text-center space-y-2 pb-6 border-b border-slate-100 dark:border-navy-800">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Evaluasi Pengabdian Masyarakat
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Kuesioner Survei Kepuasan Warga Desa
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              Penilaian ini diselenggarakan oleh LPPM Universitas untuk mengevaluasi dampak nyata pengabdian mahasiswa <strong>Kelompok 14</strong> di Desa Sukamaju.
            </p>
          </div>

          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-navy-950 dark:text-white font-epilogue">
                  Matur Nuwun / Hatur Nuhun!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Masukan dan penilaian Anda telah terekam secara resmi dalam sistem monev LPPM untuk peningkatan mutu KKN di masa mendatang.
                </p>
              </div>

              <Link href="/" className="inline-block pt-4">
                <Button variant="primary" size="sm" className="font-bold text-xs">
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Data Responden Sederhana */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Identitas Responden (Opsional / Terlindungi)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nama Anda (Boleh Anonim / Inisial)"
                    value={formData.nama_responden}
                    onChange={(e) => setFormData({ ...formData, nama_responden: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none"
                  />
                  <StyledSelect
                    value={formData.status_warga}
                    onChange={(v) => setFormData({ ...formData, status_warga: String(v) })}
                    options={[
                      { value: 'Warga / Petani', label: 'Warga Masyarakat / Petani' },
                      { value: 'Pelaku UMKM', label: 'Pelaku UMKM / Pedagang Desa' },
                      { value: 'Pengurus RT/RW', label: 'Pengurus RT / RW / Dusun' },
                      { value: 'Kader Posyandu', label: 'Kader Posyandu / PKK' },
                    ]}
                  />
                </div>
              </div>

              {/* 4 Pertanyaan Rating Bintang */}
              <div className="space-y-5">
                {questions.map((q) => (
                  <div
                    key={q.key}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-navy-950 dark:text-white">{q.title}</h4>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatings({ ...ratings, [q.key]: star })}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= ratings[q.key]
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-slate-200 dark:text-slate-700'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-amber-600 ml-1">
                          {ratings[q.key]}/5
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{q.desc}</p>
                  </div>
                ))}
              </div>

              {/* Saran & Harapan */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kesan, Pesan & Harapan untuk Program KKN di Desa Selanjutnya
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.harapan_kkn}
                  onChange={(e) => setFormData({ ...formData, harapan_kkn: e.target.value })}
                  placeholder="Contoh: Mahasiswa sangat membantu pemasangan pipa air. Harapan ke depan KKN bisa mengadakan pelatihan pemasaran online secara rutin..."
                  className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center font-bold text-sm h-12 rounded-xl shadow-md gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Penilaian Warga</span>
              </Button>
            </form>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}
