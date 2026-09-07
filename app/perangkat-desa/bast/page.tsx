'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MOCK_BAST } from '@/lib/mock-data';
import {
  Award,
  CheckCircle2,
  FileCheck2,
  Building,
  User,
  Star,
  Sparkles,
  QrCode,
  Printer,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PerangkatDesaBASTPage() {
  const [isSigned, setIsSigned] = useState(true);
  const [skorKedisiplinan, setSkorKedisiplinan] = useState(95);
  const [skorDampak, setSkorDampak] = useState(94);
  const [skorKualitas, setSkorKualitas] = useState(93);
  const [komentar, setKomentar] = useState(MOCK_BAST.komentar_evaluasi_desa);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const averageScore = Math.round((skorKedisiplinan + skorDampak + skorKualitas) / 3);

  const handleSignBAST = () => {
    setIsSigned(true);
    setShowSuccessModal(true);
    toast.success('Berita Acara Serah Terima (BAST) Berhasil Divalidasi & Diterbitkan!');
  };

  return (
    <DashboardLayout title="Penilaian Mitra Desa & Pengesahan BAST">
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-1">
            <Award className="w-3.5 h-3.5" /> Berita Acara Serah Terima (BAST) KKN
          </div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
            Penilaian Mitra Desa & Pengesahan Hasil KKN
          </h1>
          <p className="text-xs text-slate-500 font-jakarta">
            Kepala Desa melakukan evaluasi performa mahasiswa dan menandatangani BAST digital serah terima program kerja.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Evaluation Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6 sm:p-8 border-slate-200 bg-white shadow-ambient space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-navy-950 font-epilogue">
                  Instrumen Evaluasi Kinerja Kelompok 14
                </h2>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Nilai Akhir: {averageScore} / 100
                </span>
              </div>

              {/* Scoring Sliders */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-navy-900">
                    <span>1. Kedisiplinan & Kesantunan Sosial di Desa:</span>
                    <span className="text-primary font-bold">{skorKedisiplinan} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={skorKedisiplinan}
                    onChange={(e) => setSkorKedisiplinan(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-navy-900">
                    <span>2. Kebermanfaatan & Dampak Nyata bagi Warga:</span>
                    <span className="text-primary font-bold">{skorDampak} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={skorDampak}
                    onChange={(e) => setSkorDampak(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-navy-900">
                    <span>3. Kualitas Produk / Luaran yang Diserahkan:</span>
                    <span className="text-primary font-bold">{skorKualitas} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={skorKualitas}
                    onChange={(e) => setSkorKualitas(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>

              {/* Luaran Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-navy-900">
                  Daftar Luaran yang Diterima Pemerintah Desa:
                </span>
                <div className="space-y-2">
                  {MOCK_BAST.daftar_luaran_diserahkan.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-2xl bg-surface-subtle text-xs text-navy-900 font-medium border border-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Textarea Evaluasi */}
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Catatan Apresiasi & Rekomendasi Kepala Desa
                </label>
                <textarea
                  rows={3}
                  value={komentar}
                  onChange={(e) => setKomentar(e.target.value)}
                  className="w-full p-3.5 bg-surface-canvas border border-slate-300 rounded-2xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary font-jakarta leading-relaxed"
                />
              </div>

              <Button
                onClick={handleSignBAST}
                size="lg"
                variant="emerald"
                className="w-full shadow-glow-secondary font-bold text-sm"
              >
                <FileCheck2 className="w-4 h-4 mr-2" />
                <span>Bubuhkan Tanda Tangan Digital BAST Kepala Desa</span>
              </Button>
            </Card>
          </div>

          {/* Right Column: BAST Official Document Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 border-slate-200 bg-white shadow-ambient space-y-4 font-jakarta">
              <div className="text-center pb-3 border-b border-slate-200 space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Pratinjau Berita Acara Resmi
                </p>
                <h3 className="text-sm font-bold text-navy-950 font-epilogue">
                  PEMERINTAH DESA SUKAMAJU
                </h3>
                <p className="text-[10px] text-slate-500">
                  Kecamatan Ciawi, Kabupaten Bogor, Jawa Barat
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-surface-subtle text-center">
                <span className="text-[10px] text-slate-400 font-mono">NOMOR DOKUMEN BAST:</span>
                <p className="font-mono font-bold text-xs text-navy-950">{MOCK_BAST.nomor_surat}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Pada hari ini, <span className="font-bold text-navy-900">Minggu, 06 September 2026</span>, telah
                diselesaikan kegiatan Kuliah Kerja Nyata (KKN) oleh kelompok mahasiswa dan seluruh luaran telah
                diterima dengan baik oleh Pemerintah Desa Sukamaju.
              </p>

              {/* Signature status preview */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[11px] text-slate-400">Kepala Desa Sukamaju:</p>
                  <p className="font-bold text-navy-950">{MOCK_BAST.nama_kades}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> Tanda Tangan Digital Sah
                  </span>
                </div>

                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-navy-900" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Modal (Stitch: Konfirmasi Sukses Penerbitan BAST Desa - BaktiNusantara) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-glow-secondary">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <h2 className="text-2xl font-extrabold text-navy-950 font-epilogue">
              BAST Resmi Berhasil Diterbitkan!
            </h2>

            <p className="text-xs text-slate-600 font-jakarta leading-relaxed">
              Dokumen Berita Acara Serah Terima nomor{' '}
              <span className="font-mono font-bold text-navy-900">{MOCK_BAST.nomor_surat}</span> telah sah secara digital.
              Data nilai evaluasi ({averageScore}/100) otomatis diteruskan ke portal DPL dan sistem LPPM Universitas.
            </p>

            <div className="p-4 rounded-2xl bg-surface-subtle border border-slate-200 flex items-center justify-between text-left text-xs">
              <div>
                <p className="font-bold text-navy-950">Kelompok 14 — Sukamaju Berdaya</p>
                <p className="text-slate-500">Nilai Evaluasi Mitra: {averageScore} (Sangat Memuaskan)</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowSuccessModal(false)}
                variant="primary"
                size="md"
                className="flex-1 font-semibold"
              >
                Kembali ke Dashboard Desa
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
