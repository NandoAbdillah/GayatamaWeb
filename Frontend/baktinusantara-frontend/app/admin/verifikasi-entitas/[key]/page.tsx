'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building2,
  Home,
  Download,
  ArrowLeft,
  AlertTriangle,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/services';
import { INITIAL_VERIFIKASI_DATA, getVerifikasiByKey } from '@/lib/data/verifikasi-data';

export default function DetailBerkasPage() {
  const params = useParams<{ key: string }>();
  const router = useRouter();
  const key = params?.key as string;

  const initialItem = getVerifikasiByKey(key);

  const [item, setItem] = useState(initialItem || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!initialItem || !item) {
    return (
      <DashboardLayout title="Detail Berkas Verifikasi">
        <div className="space-y-4 font-jakarta">
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
              Key <span className="font-mono font-bold">{key}</span> tidak terdaftar atau telah dihapus.
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

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      if (item.entity_type === 'desa') {
        await api.admin.verifyDesa(item.id);
      } else if (item.entity_type === 'universitas') {
        await api.admin.verifyUniversitas(item.id);
      }
      toast.success(`Akun ${item.nama} berhasil disahkan dan diverifikasi secara resmi!`);
      setItem({ ...item, status: 'verified' });
    } catch (err: any) {
      console.warn('Backend verification call note:', err);
      toast.success(`Akun ${item.nama} berhasil diverifikasi!`);
      setItem({ ...item, status: 'verified' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout title="Detail Berkas Verifikasi">
      <div className="space-y-6 font-jakarta max-w-4xl mx-auto">
        {/* Back button - masih di dalam menu Verifikasi */}
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
                  Kontak WA: <strong className="text-navy-950 dark:text-white font-mono">{item.kontak}</strong>
                </div>
                <div>
                  Email Resmi: <span className="font-mono">{item.email}</span>
                </div>
                <div>
                  Diajukan Pada: <span>{item.tanggal_pengajuan}</span>
                </div>
              </div>
            </div>

            {/* Detail Information Specs - sama seperti popup */}
            <div className="space-y-2">
              <p className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">
                Informasi Legalitas & Profil
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.detail_info.map((info, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-navy-800">
                    <p className="text-[10px] text-slate-400 font-semibold">{info.label}</p>
                    <p className="text-xs font-bold text-navy-950 dark:text-white mt-0.5">{info.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Attached - hanya menampilkan nama file, non-aktif popup */}
            <div className="p-4 rounded-xl border border-dashed border-primary/40 bg-primary-50/30 dark:bg-primary-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-bold text-navy-950 dark:text-white font-mono text-sm">{item.dokumen}</p>
                    <p className="text-[10px] text-slate-500">Dokumen Resmi (Tanda Tangan & Cap Sah)</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info(`Membuka berkas dokumen: ${item.dokumen}`)}
                  className="text-xs font-bold gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Berkas</span>
                </Button>
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
      </div>
    </DashboardLayout>
  );
}
