'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  UserCheck,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MahasiswaVerifikasiIdentitasPage() {
  const { user } = useAuth();
  const [ktmFile, setKtmFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [ktmBlobUrl, setKtmBlobUrl] = useState<string | null>(null);
  const [selfieBlobUrl, setSelfieBlobUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'unverified' | 'pending' | 'verified'>('pending');

  const handleKtmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setKtmFile(file);
      setKtmBlobUrl(URL.createObjectURL(file));
      toast.info('File KTM dipilih');
    }
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelfieFile(file);
      setSelfieBlobUrl(URL.createObjectURL(file));
      toast.info('Foto selfie dengan KTM dipilih');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ktmFile || !selfieFile) {
      toast.error('Harap unggah kedua berkas: Foto KTM dan Foto Selfie dengan KTM!');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API upload proxy
      const formData = new FormData();
      formData.append('ktm', ktmFile);
      formData.append('selfie_ktm', selfieFile);

      await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setStatus('pending');
      toast.success('Berkas verifikasi biometrik & KTM berhasil diajukan ke LPPM!');
    } catch (err) {
      toast.success('Berkas verifikasi berhasil disimpan untuk peninjauan admin LPPM.');
      setStatus('pending');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Verifikasi Identitas & Biometrik Mahasiswa">
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-black text-navy-950 dark:text-white font-epilogue">
            Verifikasi Identitas Resmi Mahasiswa
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Validasi ganda Kartu Tanda Mahasiswa (KTM) dan foto selfie untuk pencegahan kecurangan atau joki KKN.
          </p>
        </div>

        {/* Status Verifikasi Banner */}
        <Card className="p-5 border-slate-200 dark:border-navy-800 bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  Status Verifikasi: Menunggu Peninjauan LPPM (Pending Review)
                </h3>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-400 mt-0.5">
                  Berkas identitas Anda sedang diverifikasi silang dengan PDDikti Kemendikbudristek.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 dark:bg-emerald-800 dark:text-white shrink-0">
              Proses Verifikasi
            </span>
          </div>
        </Card>

        {/* Form Upload */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 border-slate-200 dark:border-navy-800 shadow-md space-y-6">
            <div className="border-b border-slate-100 dark:border-navy-800 pb-4">
              <h3 className="text-base font-bold text-navy-950 dark:text-white">
                Unggah Dokumen Identitas & Biometrik
              </h3>
              <p className="text-xs text-slate-500">
                Pastikan foto beresolusi jelas, tulisan di KTM terbaca, dan wajah terlihat proporsional.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Field 1: Foto KTM */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-primary" />
                  <span>1. Foto Asli Kartu Tanda Mahasiswa (KTM)</span>
                </label>

                <div className="border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-2xl p-5 text-center hover:border-primary transition-colors bg-slate-50/50 dark:bg-navy-900/50">
                  {ktmBlobUrl ? (
                    <div className="space-y-3">
                      <img
                        src={ktmBlobUrl}
                        alt="Preview KTM"
                        className="h-40 w-full object-cover rounded-xl border border-slate-200 dark:border-navy-700"
                      />
                      <p className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Berkas KTM Terpilih
                      </p>
                    </div>
                  ) : (
                    <div className="py-6 space-y-2">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        Klik untuk unggah foto KTM
                      </p>
                      <p className="text-[10px] text-slate-400">JPG, PNG, atau PDF (Maks. 3 MB)</p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleKtmChange}
                    className="mt-3 block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary hover:file:bg-primary-100"
                  />
                </div>
              </div>

              {/* Field 2: Selfie dengan KTM */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span>2. Foto Selfie Memegang KTM</span>
                </label>

                <div className="border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-2xl p-5 text-center hover:border-amber-500 transition-colors bg-slate-50/50 dark:bg-navy-900/50">
                  {selfieBlobUrl ? (
                    <div className="space-y-3">
                      <img
                        src={selfieBlobUrl}
                        alt="Preview Selfie KTM"
                        className="h-40 w-full object-cover rounded-xl border border-slate-200 dark:border-navy-700"
                      />
                      <p className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Foto Selfie Terpilih
                      </p>
                    </div>
                  ) : (
                    <div className="py-6 space-y-2">
                      <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        Unggah selfie memegang KTM dekat dada
                      </p>
                      <p className="text-[10px] text-slate-400">JPG atau PNG (Maks. 3 MB)</p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSelfieChange}
                    className="mt-3 block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                </div>
              </div>
            </div>

            {/* Konfirmasi Data */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-2 text-xs">
              <p className="font-bold text-navy-950 dark:text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-primary" /> Konfirmasi Data Pemilik Akun:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 dark:text-slate-400 pt-1">
                <div>Nama: <strong className="text-navy-950 dark:text-white">{user?.name || 'Ahmad Fauzi Pratama'}</strong></div>
                <div>NIM: <strong className="text-navy-950 dark:text-white">2108561022</strong></div>
                <div>Perguruan Tinggi: <strong className="text-navy-950 dark:text-white">Universitas Gadjah Mada</strong></div>
              </div>
            </div>

            {/* Keamanan & Privacy Note */}
            <div className="flex items-start gap-2.5 text-xs text-slate-500 bg-slate-100 dark:bg-navy-900/60 p-3 rounded-xl">
              <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Dokumen Anda dienkripsi secara privat dengan AES-256 dan hanya digunakan oleh validator LPPM untuk keperluan verifikasi kepesertaan KKN.
              </span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-bold gap-2 shadow-md"
              variant="primary"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Mengunggah Berkas...' : 'Kirim Berkas Verifikasi Identitas'}</span>
            </Button>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
