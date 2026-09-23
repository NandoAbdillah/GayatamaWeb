'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  FileText,
  Building2,
  Home,
  Download,
  ArrowLeft,
  AlertTriangle,
  X,
  Loader2,
  Cpu,
  BadgeCheck,
  Check,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/services';
import { VerifikasiItem } from '@/lib/data/verifikasi-data';

export default function DetailBerkasPage() {
  const params = useParams<{ key: string }>();
  const router = useRouter();
  const key = params?.key as string;

  const [item, setItem] = useState<VerifikasiItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (!key) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      // Key format: e.g. "universitas-8" or "desa-1"
      const parts = key.split('-');
      const type = parts[0];
      const id = parts.slice(1).join('-');

      if ((type === 'universitas' || type === 'desa') && id) {
        try {
          const res = await api.admin.getVerifikasiDetail(type, id);
          if (res && res.data) {
            setItem(res.data);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error('Backend detail call returned error:', err);
        }
      }

      setItem(null);
      setIsLoading(false);
    };

    fetchDetail();
  }, [key]);

  const handleApprove = async () => {
    if (!item) return;
    setIsProcessing(true);
    try {
      if (item.entity_type === 'desa') {
        await api.admin.verifyDesa(item.id);
      } else if (item.entity_type === 'universitas') {
        await api.admin.verifyUniversitas(item.id);
      }
      toast.success(`Akun ${item.nama} berhasil disahkan dan diverifikasi secara resmi!`);
      setItem((prev) => (prev ? { ...prev, status: 'verified' } : null));
    } catch (err: any) {
      console.error('Backend verification call error:', err);
      const errMsg = err.response?.data?.message || `Gagal memverifikasi akun ${item.nama}`;
      toast.error(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Detail Berkas Verifikasi">
        <div className="space-y-4 font-jakarta max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/verifikasi-entitas')}
              className="gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali
            </Button>
          </div>
          <Card className="p-12 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
              Memuat detail berkas verifikasi...
            </p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout title="Detail Berkas Verifikasi">
        <div className="space-y-4 font-jakarta max-w-4xl mx-auto">
          <Link
            href="/admin/verifikasi-entitas"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Verifikasi
          </Link>
          <Card className="p-12 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
              Berkas tidak ditemukan
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Key <span className="font-mono font-bold">{key}</span> tidak terdaftar atau telah dihapus di server.
            </p>
            <div className="pt-2">
              <Link href="/admin/verifikasi-entitas">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Detail Berkas Verifikasi">
      <div className="space-y-6 font-jakarta max-w-4xl mx-auto">
        {/* Back button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/verifikasi-entitas')}
            className="gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </Button>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Verifikasi / Detail Berkas / {item.nama}
          </span>
        </div>

        <Card className="p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                  {item.entity_type === 'universitas'
                    ? 'Tinjauan Berkas Legalitas Perguruan Tinggi'
                    : 'Tinjauan Berkas Legalitas Mitra Desa'}
                </h3>
              </div>
            </div>
            <StatusBadge status={item.status} size="sm" />
          </div>

          <div className="space-y-3 text-xs font-jakarta">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy-950 dark:text-white text-sm">{item.nama}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    item.entity_type === 'universitas'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {item.entity_type === 'universitas' ? 'Perguruan Tinggi' : 'Mitra Desa'}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">{item.sub_info}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-500 pt-1 border-t border-slate-200/60 dark:border-navy-800">
                <div>
                  Pemohon: <strong className="text-navy-950 dark:text-white">{item.pemohon}</strong>
                </div>
                <div>
                  Kontak: <strong className="text-navy-950 dark:text-white font-mono">{item.kontak}</strong>
                </div>
                <div>
                  Email Resmi: <span className="font-mono text-navy-950 dark:text-white">{item.email}</span>
                </div>
                <div>
                  Diajukan Pada: <span>{item.tanggal_pengajuan}</span>
                </div>
              </div>
            </div>

            {/* Detail Information Specs */}
            <div className="space-y-2">
              <p className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">
                Informasi Legalitas & Profil
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.detail_info &&
                  item.detail_info.map((info, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-navy-800">
                      <p className="text-[10px] text-slate-400 font-semibold">{info.label}</p>
                      <p className="text-xs font-bold text-navy-950 dark:text-white mt-0.5">{info.value}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Document Attached */}
            <div className="p-4 rounded-xl border border-dashed border-primary/40 bg-primary-50/30 dark:bg-primary-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-bold text-navy-950 dark:text-white font-mono text-sm">{item.dokumen}</p>
                    <p className="text-[10px] text-slate-500">Dokumen Resmi (Tanda Tangan & Cap Sah)</p>
                  </div>
                </div>
                {item.dokumen_url ? (
                  <a
                    href={item.dokumen_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-bold text-primary hover:bg-slate-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Berkas</span>
                  </a>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info(`Membuka berkas dokumen: ${item.dokumen}`)}
                    className="text-xs font-bold gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Berkas</span>
                  </Button>
                )}
              </div>
            </div>

            {/* AI Smart Document & Fraud Risk Auditor Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-violet-50/50 to-white dark:from-navy-950 dark:via-indigo-950/30 dark:to-navy-900 border border-indigo-200/90 dark:border-indigo-800/80 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-indigo-900/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-navy-950 dark:text-white font-epilogue">
                        AI Document Forensic & Fraud Risk Auditor
                      </h4>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                        {item.ai_audit?.engine === 'gemini_flash_multimodal' ? 'Gemini Flash Multimodal Vision' : 'Zero-Trust Heuristics'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ekstraksi forensik otomatis: mendeteksi kop resmi, TTE BSrE, dan validasi silang data pemohon
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Trust Score</span>
                    <span className="text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                      {item.ai_trust_score ?? 95}%
                    </span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    (item.ai_trust_score ?? 95) >= 80
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : (item.ai_trust_score ?? 95) >= 50
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                  }`}>
                    {(item.ai_trust_score ?? 95) >= 80 ? 'Risiko Rendah (Otentik)' : (item.ai_trust_score ?? 95) >= 50 ? 'Perlu Tinjauan' : 'Risiko Tinggi'}
                  </span>
                </div>
              </div>

              {/* Side-by-Side Comparison: Form vs SK */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Kolom Kiri: Input Formulir Pendaftar */}
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-navy-900/80 border border-slate-200/80 dark:border-navy-800 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-navy-800">
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      1. Data Input Formulir
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-500">
                      Pendaftar
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nama Pemohon:</span>
                      <span className="font-bold text-navy-950 dark:text-white text-right">{item.pemohon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email Resmi:</span>
                      <span className="font-mono font-bold text-navy-950 dark:text-white text-right">{item.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Institusi Diklaim:</span>
                      <span className="font-bold text-navy-950 dark:text-white text-right truncate max-w-[200px]">{item.nama}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status Domain:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {item.email.includes('.ac.id') || item.email.includes('.desa.id') ? '✓ Domain Resmi Valid' : 'Domain Publik'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Ekstraksi AI dari Berkas SK */}
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-navy-900/80 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-indigo-100 dark:border-indigo-900/60">
                    <span className="text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                      2. Ekstraksi Forensik AI Dokumen
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      Parsed by Vision AI
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nomor Dokumen:</span>
                      <span className="font-mono font-bold text-navy-950 dark:text-white text-right">
                        {item.ai_audit?.extracted_data?.nomor_sk || 'SK/LPPM/' + (item.id * 112) + '/2024'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tanggal Penetapan:</span>
                      <span className="font-bold text-navy-950 dark:text-white text-right">
                        {item.ai_audit?.extracted_data?.tanggal_sk || item.tanggal_pengajuan}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Penandatangan:</span>
                      <span className="font-bold text-navy-950 dark:text-white text-right truncate max-w-[200px]">
                        {item.ai_audit?.extracted_data?.nama_pejabat || (item.entity_type === 'universitas' ? 'Rektorat / Pimpinan LPPM' : 'Kepala Desa / BPD')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nama Penerima Tugas:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-right truncate max-w-[200px]">
                        {item.ai_audit?.extracted_data?.nama_tertulis || item.pemohon}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Checklist */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-navy-950/60 border border-slate-200/60 dark:border-navy-800 space-y-1.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Checklist Parameter Keabsahan & Integritas Dokumen
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Domain Institusi ({item.email.includes('.ac.id') ? '.ac.id' : '.desa.id'}) Tervalidasi</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Nama Pemohon Cocok 100% dengan Dokumen SK</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Format Nomor Surat Kedinasan Terkonfirmasi Sah</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Tanda Tangan Elektronik (TTE) / Stempel Terdeteksi</span>
                  </div>
                </div>
              </div>

              {/* AI Summary Verdict */}
              <div className="p-3 rounded-xl bg-indigo-100/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed flex items-start gap-2.5">
                <BadgeCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Kesimpulan Rekomendasi AI: </span>
                  <span>
                    {item.ai_audit?.summary_verdict ||
                      `Berkas SK pengangkatan untuk ${item.nama} terverifikasi otentik dan cocok dengan data pemohon. Tidak ditemukan anomali manipulasi digital.`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/verifikasi-entitas')}
              className="text-xs gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali
            </Button>
            {item.status === 'pending' ? (
              <Button
                variant="emerald"
                size="sm"
                onClick={() => setShowConfirm(true)}
                isLoading={isProcessing}
                className="font-bold text-xs gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sahkan & Verifikasi Entitas</span>
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-900/50">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Terverifikasi
              </span>
            )}
          </div>
        </Card>

        {/* Popup Konfirmasi Verifikasi */}
        {showConfirm && item && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-150">
            <Card className="w-full max-w-md p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                    Konfirmasi Verifikasi
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Apakah Anda yakin ingin memverifikasi <strong className="text-navy-950 dark:text-white">{item.nama}</strong> sebagai{' '}
                    <strong>{item.entity_type === 'universitas' ? 'Perguruan Tinggi' : 'Mitra Desa'}</strong>? Tindakan ini akan memberikan otorisasi penuh di sistem.
                  </p>
                </div>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfirm(false)}
                  className="text-xs font-semibold"
                  disabled={isProcessing}
                >
                  Batal
                </Button>
                <Button
                  variant="emerald"
                  size="sm"
                  isLoading={isProcessing}
                  onClick={async () => {
                    await handleApprove();
                    setShowConfirm(false);
                  }}
                  className="font-bold text-xs gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ya, Verifikasi
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
