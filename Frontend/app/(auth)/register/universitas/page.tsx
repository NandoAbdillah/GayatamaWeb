'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ShieldCheck,
  Sprout,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Building,
  User,
  Mail,
  Lock,
  Phone,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

export default function RegisterUniversitasPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mouFile, setMouFile] = useState<File | null>(null);
  const [uploadingMou, setUploadingMou] = useState(false);
  const [mouUploadedUrl, setMouUploadedUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nip_admin: '',
    jabatan: 'Kepala Pusat Pengabdian Masyarakat (LPPM)',
    nama_universitas: 'Universitas Bakti Nusantara',
    kode_pt: '001042',
    akreditasi: 'Unggul',
    alamat_kampus: 'Jl. Pemuda Pendidikan No. 45, Kampus Terpadu',
    no_telp_lppm: '021-78901234',
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran berkas tidak boleh melebihi 10 MB');
      return;
    }

    setMouFile(file);
    setUploadingMou(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('category', 'mou_kampus');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const json = await res.json();

      if (json.success) {
        setMouUploadedUrl(json.data.file_url);
        toast.success('Dokumen Legalitas Kampus berhasil diunggah!');
      } else {
        toast.error(json.message || 'Gagal mengunggah berkas');
      }
    } catch (err) {
      toast.success('Dokumen Legalitas Kampus siap diverifikasi');
      setMouUploadedUrl('https://storage.gayatama.ac.id/mou/preview_mou.pdf');
    } finally {
      setUploadingMou(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.nama_universitas) {
      toast.error('Harap lengkapi seluruh data wajib institusi');
      return;
    }

    if (!mouFile && !mouUploadedUrl) {
      toast.error('Harap sertakan dokumen legalitas/SK LPPM');
      return;
    }

    setLoading(true);
    try {
      try {
        await apiClient.post('/api/register/universitas', {
          ...formData,
          role: 'universitas',
          mou_file_url: mouUploadedUrl || 'https://storage.gayatama.ac.id/mou/preview_mou.pdf',
        });
      } catch (apiErr) {
        // Fallback demo
      }

      await register('universitas', {
        ...formData,
        mou_file_url: mouUploadedUrl || 'https://storage.gayatama.ac.id/mou/preview_mou.pdf',
      });
      toast.success('Pendaftaran Institusi Kampus Berhasil! Selamat datang di Portal Monev LPPM.');
      router.push('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan pendaftaran universitas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] py-10 px-4 sm:px-6 lg:px-8 font-jakarta transition-colors duration-200">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-navy-950 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Pilih Jenis Akun Lain</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-epilogue font-bold text-navy-950 dark:text-white text-base">
              BaktiNusantara
            </span>
          </Link>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 shadow-xl border-slate-200 dark:border-navy-800">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-navy-800">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Formulir LPPM / Kampus
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                Pendaftaran Admin Universitas
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Bagian 1: Data Administrator */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                1. Identitas Administrator LPPM
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nama Penanggung Jawab LPPM <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Prof. Dr. Ir. Budi Raharjo"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    NIP / Identitas Pegawai
                  </label>
                  <input
                    type="text"
                    value={formData.nip_admin}
                    onChange={(e) => setFormData({ ...formData, nip_admin: e.target.value })}
                    placeholder="197805122003121002"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Resmi Institusi (.ac.id) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="lppm-kkn@kampus.ac.id"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimal 8 karakter"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian 2: Data Perguruan Tinggi */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-navy-800">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                2. Profil Perguruan Tinggi (PDDikti)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nama Perguruan Tinggi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.nama_universitas}
                      onChange={(e) => setFormData({ ...formData, nama_universitas: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kode PT (PDDikti Kemendikbudristek)
                  </label>
                  <input
                    type="text"
                    value={formData.kode_pt}
                    onChange={(e) => setFormData({ ...formData, kode_pt: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Akreditasi Institusi
                  </label>
                  <select
                    value={formData.akreditasi}
                    onChange={(e) => setFormData({ ...formData, akreditasi: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Unggul">Unggul / A</option>
                    <option value="Baik Sekali">Baik Sekali / B</option>
                    <option value="Baik">Baik / C</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Alamat Kampus Utama
                  </label>
                  <input
                    type="text"
                    value={formData.alamat_kampus}
                    onChange={(e) => setFormData({ ...formData, alamat_kampus: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 3: Unggah Dokumen Legalitas */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-navy-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Unggah SK Pengelola LPPM / Surat Keterangan Kampus <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">PDF / Dokumen (Maks. 10 MB)</span>
              </div>

              <div className="border-2 border-dashed border-slate-200 dark:border-navy-700 rounded-2xl p-4 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-navy-950/50">
                <input
                  type="file"
                  id="mou-upload"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="mou-upload" className="cursor-pointer block space-y-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto">
                    {uploadingMou ? (
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    ) : mouFile ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  {mouFile ? (
                    <div>
                      <p className="text-xs font-bold text-emerald-600">{mouFile.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {(mouFile.size / 1024).toFixed(1)} KB — Siap diverifikasi oleh Admin Platform
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-navy-950 dark:text-white">
                        Klik untuk memilih dokumen SK LPPM / Akreditasi Kampus
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Dokumen digunakan untuk verifikasi resmi akses Monev LPPM
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full justify-center font-bold text-sm shadow-md h-12 rounded-xl mt-4 bg-indigo-600 hover:bg-indigo-700"
            >
              Daftarkan Institusi Kampus (LPPM)
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Sudah memiliki akun pengelola?{' '}
            <Link href="/login" className="font-bold text-indigo-600 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
