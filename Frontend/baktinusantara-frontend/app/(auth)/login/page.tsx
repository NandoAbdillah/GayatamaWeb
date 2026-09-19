'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, SEEDED_ACCOUNTS } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  GraduationCap,
  Home,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle, isLoading } = useAuth();

  const [email, setEmail] = useState('ketua.ahmad@mhs.unesa.ac.id');
  const [password, setPassword] = useState('password');
  const [selectedRole, setSelectedRole] = useState<UserRole>('mahasiswa');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unregisteredModal, setUnregisteredModal] = useState<{
    show: boolean;
    email: string;
    message: string;
  } | null>(null);

  const demoAccounts: {
    role: UserRole;
    title: string;
    subtitle: string;
    email: string;
    icon: React.ElementType;
    badge: string;
    color: string;
  }[] = [
    {
      role: 'mahasiswa',
      title: 'Mahasiswa',
      subtitle: 'Ahmad Fauzi (Ketua Tim UNESA)',
      email: SEEDED_ACCOUNTS.mahasiswa.email,
      icon: GraduationCap,
      badge: 'Mahasiswa KKN',
      color: 'border-primary/40 text-primary bg-primary/5',
    },
    {
      role: 'perangkat_desa',
      title: 'Mitra Desa',
      subtitle: 'Kantor Pemdes Sukamaju',
      email: SEEDED_ACCOUNTS.perangkat_desa.email,
      icon: Home,
      badge: 'Pemerintah Desa',
      color: 'border-emerald-500/40 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30',
    },
    {
      role: 'dosen',
      title: 'Dosen (DPL)',
      subtitle: 'Dr. Budi Santoso, M.Kom.',
      email: SEEDED_ACCOUNTS.dosen.email,
      icon: BookOpen,
      badge: 'Dosen Pembimbing',
      color: 'border-amber-500/40 text-amber-600 bg-amber-50/50 dark:bg-amber-950/30',
    },
    {
      role: 'universitas',
      title: 'LPPM Univ',
      subtitle: 'LPPM UNESA Surabaya',
      email: SEEDED_ACCOUNTS.universitas.email,
      icon: ShieldCheck,
      badge: 'Pengelola Kampus',
      color: 'border-indigo-500/40 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30',
    },
    {
      role: 'admin',
      title: 'Super Admin',
      subtitle: 'Admin Platform Pusat',
      email: SEEDED_ACCOUNTS.admin.email,
      icon: Shield,
      badge: 'Administrator',
      color: 'border-purple-500/40 text-purple-600 bg-purple-50/50 dark:bg-purple-950/30',
    },
  ];

  const handleSelectRole = (acc: (typeof demoAccounts)[0]) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword('password');
    setErrorMsg(null);
  };

  const getDashboardRoute = (role: UserRole) => {
    switch (role) {
      case 'mahasiswa':
        return '/mahasiswa/dashboard';
      case 'perangkat_desa':
        return '/perangkat-desa/dashboard';
      case 'dosen':
        return '/dosen/dashboard';
      case 'universitas':
        return '/kampus/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/mahasiswa/dashboard';
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setUnregisteredModal(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    // Redirect langsung ke endpoint OAuth Google di Backend
    window.location.href = `${apiUrl}/api/auth/google/redirect`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setUnregisteredModal(null);

    try {
      const user = await login(email, password, selectedRole);
      toast.success(`Selamat datang kembali, ${user.name}!`);

      const redirectParam = searchParams.get('redirect');
      if (redirectParam) {
        router.push(redirectParam);
      } else {
        router.push(getDashboardRoute(user.role));
      }
    } catch (err: any) {
      const respData = err?.response?.data;
      if (respData?.error_code === 'UNREGISTERED_ACCOUNT') {
        setUnregisteredModal({
          show: true,
          email: respData.email || email,
          message: respData.message || 'Akun Google belum terdaftar di sistem.',
        });
        return;
      }
      const msg = respData?.message || err.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <Card className="p-4 min-[360px]:p-5 sm:p-6 lg:p-8 bg-white/85 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none border border-white/40 lg:border-0 shadow-xl lg:shadow-none rounded-2xl sm:rounded-3xl transition-all">
      {/* Role selector quick fill chips */}
      <div className="mb-6">

        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
          {demoAccounts.map((acc) => {
            const Icon = acc.icon;
            const isSelected = selectedRole === acc.role;
            return (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleSelectRole(acc)}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary-50/90 dark:bg-primary-950/40 text-primary-900 dark:text-white ring-2 ring-primary/40 font-semibold'
                    : 'border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-600 hover:bg-slate-50 dark:hover:bg-navy-800 text-navy-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 w-full mb-1">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? 'text-primary' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  <span className="text-xs font-bold truncate">{acc.title}</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full font-normal">
                  {acc.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1.5">
            Alamat Email Akun
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
              placeholder="nama@univ.ac.id"
              className="w-full pl-10 pr-4 py-2.5 bg-surface-canvas dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs sm:text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200">
              Kata Sandi
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-canvas dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs sm:text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          size="lg"
          variant="primary"
          className="w-full bg-[#377832] hover:bg-[#5ea631] mt-2 font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md gap-2"
        >
          <span>Masuk Sebagai {selectedRole.replace('_', ' ').toUpperCase()}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        {/* Separator */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-navy-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-navy-900 px-3 text-slate-500 dark:text-slate-400 font-medium">
              Atau masuk dengan
            </span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-navy-800 border border-slate-300 dark:border-navy-600 hover:bg-slate-50 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Masuk dengan Akun Google</span>
        </button>
      </form>

      {/* Modal Akun Belum Terdaftar */}
      {unregisteredModal?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-navy-900 dark:text-white font-epilogue">
                Akun Belum Terdaftar di LPPM
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {unregisteredModal.message}
              </p>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-800 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                {unregisteredModal.email}
              </div>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/register"
                onClick={() => setUnregisteredModal(null)}
                className="w-full py-2.5 px-4 bg-[#377832] hover:bg-[#5ea631] text-white rounded-xl text-xs font-bold text-center transition-all shadow-sm"
              >
                Daftar sebagai Mitra Desa / LPPM
              </Link>
              <button
                type="button"
                onClick={() => setUnregisteredModal(null)}
                className="w-full py-2 px-4 border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-navy-800 flex items-center text-xs text-slate-500 dark:text-slate-400">
        <span className='pr-2'>Belum memiliki akun KKN?</span>
        <Link href="/register" className="font-bold text-[#377832] hover:underline">
          Daftar akun baru
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    // === BACKGROUND & POSISI IMAGE: ubah bg-[position:...] di bawah untuk geser (30%=kiri, 70%=kanan) ===
    <div
      className="relative min-h-[100dvh] min-h-screen w-full bg-cover bg-[position:30%_center] lg:bg-[position:60%_center] bg-no-repeat flex font-jakarta overflow-hidden"
      style={{ backgroundImage: "url('/images/BGlogin.png')" }}
    >
      {/* KIRI - 50% layar di desktop, hidden di HP */}
      <div className="hidden lg:flex flex-1 lg:basis-1/2" aria-hidden />

      {/* KANAN - full di HP, 50% di desktop, form center simetris */}
      <div className="flex-1 lg:basis-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 overflow-y-auto">
        <div className="w-full max-w-[480px] my-auto flex flex-col">
        <div className="text-center mb-4 sm:mb-6 px-1">
          <Link href="/" className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
              <Image
                src="/logo.svg"
                alt="BaktiNusantara Logo"
                width={48}
                height={48}
                priority
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md"
              />
            </div>
            <span className="font-epilogue font-extrabold text-xl sm:text-2xl text-navy-950 dark:text-white drop-shadow-sm">
              BaktiNusantara
            </span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold text-navy-950 dark:text-white font-epilogue drop-shadow-sm leading-tight">
            Masuk ke Portal KKN Terpadu
          </h2>
          <p className="mt-1 text-[11px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-300 drop-shadow-sm px-2 sm:px-0">
            Pilih peran Anda atau masukkan akun yang telah terdaftar
          </p>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat formulir masuk...</div>}>
          <LoginFormContent />
        </Suspense>
        </div>
      </div>
    </div>
  );
}

