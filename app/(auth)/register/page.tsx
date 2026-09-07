'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  GraduationCap,
  Home,
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  User,
  Mail,
  Lock,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('mahasiswa');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Role-specific fields
  const [nim, setNim] = useState('');
  const [jurusan, setJurusan] = useState('Teknik Informatika');
  const [namaDesa, setNamaDesa] = useState('');
  const [kabupaten, setKabupaten] = useState('');
  const [kodeKampus, setKodeKampus] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: any = {
        name,
        email,
        password,
        role: selectedRole,
      };

      if (selectedRole === 'mahasiswa') {
        payload.nim = nim || '21051204999';
        payload.jurusan = jurusan;
      } else if (selectedRole === 'perangkat_desa') {
        payload.nama_desa = namaDesa || 'Desa Makmur Jaya';
        payload.kabupaten = kabupaten || 'Bogor';
      } else if (selectedRole === 'universitas') {
        payload.kode_kampus = kodeKampus || 'UNIV-999';
      }

      await register(selectedRole, payload);
      toast.success('Pendaftaran berhasil! Selamat datang di BaktiNusantara.');

      if (selectedRole === 'mahasiswa') router.push('/mahasiswa/dashboard');
      else if (selectedRole === 'perangkat_desa') router.push('/perangkat-desa/dashboard');
      else router.push('/admin/dashboard');
    } catch (err) {
      toast.error('Gagal melakukan pendaftaran. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-canvas via-white to-surface-container flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-epilogue font-bold text-xl shadow-glow-primary group-hover:scale-105 transition-transform">
            BN
          </div>
          <span className="font-epilogue font-extrabold text-2xl text-navy-950">
            BaktiNusantara
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-navy-950 font-epilogue">
          Daftar Akun Baru KKN
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-jakarta">
          Bergabunglah dalam ekosistem pemberdayaan desa terintegrasi
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <Card className="p-6 sm:p-8 shadow-ambient-lg border-slate-200/90">
          {/* Role selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-2">
              Pilih Jenis Pendaftaran:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { role: 'mahasiswa', title: 'Mahasiswa KKN', icon: GraduationCap },
                { role: 'perangkat_desa', title: 'Perangkat Desa', icon: Home },
                { role: 'universitas', title: 'Admin Kampus / LPPM', icon: ShieldCheck },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = selectedRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setSelectedRole(item.role as UserRole)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-primary bg-primary-50 text-primary-900 ring-2 ring-primary-300 font-semibold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-navy-700'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mb-1.5 ${
                        isSelected ? 'text-primary' : 'text-slate-500'
                      }`}
                    />
                    <span className="text-xs font-medium">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@institusi.ac.id"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Role-specific dynamic fields */}
            {selectedRole === 'mahasiswa' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                    Nomor Induk Mahasiswa (NIM)
                  </label>
                  <input
                    type="text"
                    required
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    placeholder="Contoh: 21051204012"
                    className="w-full px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                    Program Studi / Jurusan
                  </label>
                  <select
                    value={jurusan}
                    onChange={(e) => setJurusan(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Teknik Informatika">Teknik Informatika</option>
                    <option value="Agribisnis">Agribisnis & Pertanian</option>
                    <option value="Ilmu Komunikasi">Ilmu Komunikasi</option>
                    <option value="Kesehatan Masyarakat">Kesehatan Masyarakat</option>
                    <option value="Farmasi">Farmasi & Herbal</option>
                    <option value="Teknik Sipil">Teknik Sipil</option>
                  </select>
                </div>
              </div>
            )}

            {selectedRole === 'perangkat_desa' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                    Nama Kelurahan / Desa
                  </label>
                  <input
                    type="text"
                    required
                    value={namaDesa}
                    onChange={(e) => setNamaDesa(e.target.value)}
                    placeholder="Contoh: Desa Sukamaju"
                    className="w-full px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                    Kabupaten / Kota
                  </label>
                  <input
                    type="text"
                    required
                    value={kabupaten}
                    onChange={(e) => setKabupaten(e.target.value)}
                    placeholder="Contoh: Kabupaten Bogor"
                    className="w-full px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Document Upload Area */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                {selectedRole === 'mahasiswa'
                  ? 'Unggah Foto Kartu Tanda Mahasiswa (KTM)'
                  : selectedRole === 'perangkat_desa'
                  ? 'Unggah Surat Keputusan (SK) Jabatan Kepala Desa / Perangkat'
                  : 'Unggah Surat Tugas / Penunjukan LPPM'}
              </label>
              <div
                onClick={() => setFileUploaded(!fileUploaded)}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                  fileUploaded
                    ? 'border-emerald-500 bg-emerald-50/60'
                    : 'border-slate-300 hover:border-primary-400 bg-surface-subtle/50'
                }`}
              >
                {fileUploaded ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-700 text-sm font-semibold">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <span>Dokumen Verifikasi Berhasil Terunggah (ktm_sk_verified.pdf)</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <UploadCloud className="w-8 h-8 text-primary mb-1" />
                    <span className="text-xs font-semibold text-navy-900">
                      Klik untuk memilih berkas atau seret berkas ke sini
                    </span>
                    <span className="text-[11px] text-slate-500">PDF, JPG, atau PNG (Maks 5MB)</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
              variant="primary"
              className="w-full mt-4 font-semibold"
            >
              <span>Daftar Sekarang</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sudah memiliki akun terdaftar?</span>
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Masuk ke akun Anda →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
