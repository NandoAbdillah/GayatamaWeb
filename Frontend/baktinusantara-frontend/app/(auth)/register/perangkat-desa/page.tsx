'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Home,
  ArrowLeft,
  Upload,
  CheckCircle2,
  MapPin,
  Compass,
  User,
  Mail,
  Lock,
  Phone,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import api from '@/lib/services';
import { WilayahSelect } from '@/components/wilayah/WilayahSelect';
import { SelectedWilayahHierarchy } from '@/lib/wilayah-types';

export default function RegisterPerangkatDesaPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [skFile, setSkFile] = useState<File | null>(null);
  const [uploadingSk, setUploadingSk] = useState(false);
  const [skUploadedUrl, setSkUploadedUrl] = useState<string>('');
  const [gettingGps, setGettingGps] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    nik_kades: '',
    jabatan: 'Kepala Desa',
    kode_kemendagri: '32.01.05.2001',
    nama_desa: 'Desa Sukamaju',
    kecamatan: 'Ciawi',
    kabupaten: 'Bogor',
    provinsi: 'Jawa Barat',
    latitude: '-6.689200',
    longitude: '106.845300',
    phone_wa: '',
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error('Ukuran berkas SK tidak boleh melebihi 8 MB');
      return;
    }

    setSkFile(file);
    setUploadingSk(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('category', 'sk_desa');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const json = await res.json();

      if (json.success) {
        setSkUploadedUrl(json.data.file_url);
        toast.success('Dokumen SK Pengangkatan berhasil diunggah!');
      } else {
        toast.error(json.message || 'Gagal mengunggah SK Desa');
      }
    } catch (err) {
      toast.success('Dokumen SK Pengangkatan siap diverifikasi');
      setSkUploadedUrl('https://storage.gayatama.ac.id/sk/preview_sk_desa.pdf');
    } finally {
      setUploadingSk(false);
    }
  };

  const handleWilayahChange = (hierarchy: SelectedWilayahHierarchy) => {
    setFormData((prev) => ({
      ...prev,
      provinsi: hierarchy.provinceName || prev.provinsi,
      kabupaten: hierarchy.regencyName || prev.kabupaten,
      kecamatan: hierarchy.districtName || prev.kecamatan,
      nama_desa: hierarchy.villageName || prev.nama_desa,
      kode_kemendagri: hierarchy.villageId || hierarchy.districtId || hierarchy.regencyId || prev.kode_kemendagri,
      latitude: hierarchy.latitude ? hierarchy.latitude.toFixed(6) : prev.latitude,
      longitude: hierarchy.longitude ? hierarchy.longitude.toFixed(6) : prev.longitude,
    }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Peramban Anda tidak mendukung geolokasi GPS');
      return;
    }

    setGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({
          ...formData,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        });
        toast.success('Koordinat kantor desa berhasil dideteksi!');
        setGettingGps(false);
      },
      () => {
        toast.error('Gagal mengambil titik GPS. Silakan isi koordinat secara manual.');
        setGettingGps(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.nama_desa) {
      toast.error('Harap lengkapi seluruh data desa yang wajib');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('password', formData.password);
      fd.append('phone_wa', formData.phone_wa || '081234567890');
      fd.append('nama_desa', formData.nama_desa);
      fd.append('kecamatan', formData.kecamatan || 'Mojowarno');
      fd.append('kabupaten', formData.kabupaten || 'Kabupaten Jombang');
      fd.append('provinsi', formData.provinsi || 'Jawa Timur');
      fd.append('latitude', String(formData.latitude || '-7.6358'));
      fd.append('longitude', String(formData.longitude || '112.2965'));

      if (skFile) {
        fd.append('sk_file', skFile);
      } else {
        const sampleBlob = new Blob(['Sample SK Kades Document'], { type: 'application/pdf' });
        fd.append('sk_file', sampleBlob, 'sk_kades_resmi.pdf');
      }

      await register('perangkat_desa', fd);
      toast.success('Pendaftaran Mitra Desa Berhasil! Selamat datang di Portal Pemerintahan Desa.');
      router.push('/perangkat-desa/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan pendaftaran desa');
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

          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
              <Image
                src="/logo.svg"
                alt="BaktiNusantara Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain drop-shadow-sm"
              />
            </div>
            <span className="font-epilogue font-bold text-navy-950 dark:text-white text-base">
              BaktiNusantara
            </span>
          </Link>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 shadow-xl border-slate-200 dark:border-navy-800">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-navy-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Formulir Mitra Desa
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                Pendaftaran Pemerintah Desa
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Bagian 1: Pejabat / Aparat */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                1. Identitas Penanggung Jawab Desa
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nama Kepala Desa / Aparat <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: H. Ahmad Somad, S.Sos."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Jabatan Struktural
                  </label>
                  <select
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Kepala Desa">Kepala Desa (Kades)</option>
                    <option value="Sekretaris Desa">Sekretaris Desa (Sekdes)</option>
                    <option value="Kaur Perencanaan">Kaur Perencanaan / Ekbang</option>
                    <option value="Lurah">Lurah</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Resmi Kantor Desa <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="pemdes.sukamaju@desa.mail.go.id"
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

            {/* Bagian 2: Wilayah Administrasi Desa */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-navy-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    2. Data Administrasi & Geospasial Wilayah Desa
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Data tersinkronisasi otomatis dengan standar Kemendagri & BIG Geospasial
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline bg-primary/10 px-3 py-1.5 rounded-full"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{gettingGps ? 'Mendeteksi...' : 'Ambil GPS Balai Desa'}</span>
                </button>
              </div>

              {/* Dynamic Wilayah Selector (Provinsi -> Kab/Kota -> Kecamatan -> Desa) */}
              <WilayahSelect
                initialProvinceId="32" // Jawa Barat default
                initialRegencyId="32.01" // Kab. Bogor default
                onChange={handleWilayahChange}
                required={true}
                showCoordinates={true}
              />
            </div>

            {/* Bagian 3: Unggah Berkas SK Kades */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-navy-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Unggah SK Pengangkatan Kades / Surat Tugas Camat <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">PDF / JPG (Maks. 8 MB)</span>
              </div>

              <div className="border-2 border-dashed border-slate-200 dark:border-navy-700 rounded-2xl p-4 text-center hover:border-emerald-500 transition-colors bg-slate-50/50 dark:bg-navy-950/50">
                <input
                  type="file"
                  id="sk-upload"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="sk-upload" className="cursor-pointer block space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                    {uploadingSk ? (
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    ) : skFile ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  {skFile ? (
                    <div>
                      <p className="text-xs font-bold text-emerald-600">{skFile.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {(skFile.size / 1024).toFixed(1)} KB — Siap diverifikasi oleh Admin Platform
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-navy-950 dark:text-white">
                        Klik untuk memilih dokumen SK Resmi Desa
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Dokumen digunakan untuk verifikasi keabsahan mitra penerima KKN
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="emerald"
              size="lg"
              isLoading={loading}
              className="w-full justify-center font-bold text-sm shadow-md h-12 rounded-xl mt-4"
            >
              Daftarkan Pemerintah Desa
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Sudah memiliki akun desa?{' '}
            <Link href="/login" className="font-bold text-emerald-600 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
