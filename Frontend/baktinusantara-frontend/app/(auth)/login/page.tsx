'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('mahasiswa');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unregisteredModal, setUnregisteredModal] = useState<{
    show: boolean;
    email: string;
    message: string;
  } | null>(null);

  const roleOptions: {
    role: UserRole;
    title: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    {
      role: 'mahasiswa',
      title: 'Mahasiswa',
      description: 'Peserta & Pelaksana KKN',
      icon: GraduationCap,
    },
    {
      role: 'perangkat_desa',
      title: 'Mitra Desa',
      description: 'Pemerintah Desa / Kelurahan',
      icon: Home,
    },
    {
      role: 'dosen',
      title: 'Dosen (DPL)',
      description: 'Pembimbing Lapangan (DPL)',
      icon: BookOpen,
    },
    {
      role: 'universitas',
      title: 'LPPM Univ',
      description: 'Pengelola KKN Kampus',
      icon: ShieldCheck,
    },
  ];

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

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '411606118566-q1pupeff65t4r7enkpii2mfqg0cflj70.apps.googleusercontent.com';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const redirectUri = `${apiUrl}/api/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setUnregisteredModal(null);

    if (!email.trim() || !password.trim()) {
      const msg = 'Silakan masukkan alamat email / nomor WhatsApp dan kata sandi Anda.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    try {
      const user = await login(email.trim(), password, selectedRole);
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
    <Card className="p-4 min-[360px]:p-5 sm:p-6 lg:p-8 bg-white/85 dark:bg-navy-900/90 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none lg:dark:bg-navy-900/90 lg:dark:backdrop-blur-xl border border-white/40 dark:border-navy-800 lg:border-0 lg:dark:border lg:dark:border-navy-800 shadow-xl lg:shadow-none lg:dark:shadow-2xl rounded-2xl sm:rounded-3xl transition-all">
      {/* Role selector cards */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-navy-900 dark:text-slate-100 mb-2">
          Anda sebagai:
        </label>

        <div className="grid grid-cols-2 gap-2.5">
          {roleOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedRole === opt.role;
            return (
              <button
                key={opt.role}
                type="button"
                onClick={() => {
                  setSelectedRole(opt.role);
                  setErrorMsg(null);
                }}
                className={`group relative flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-[#377832] bg-[#377832]/10 dark:bg-[#377832]/25 text-[#255221] dark:text-emerald-300 ring-2 ring-[#377832]/30 shadow-sm font-semibold'
                    : 'border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-600 hover:bg-slate-50/80 dark:hover:bg-navy-800/60 text-navy-900 dark:text-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#377832] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 group-hover:text-navy-900 dark:group-hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">{opt.title}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#377832] dark:text-emerald-400 shrink-0 ml-1" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block font-normal">
                    {opt.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-navy-900 dark:text-slate-100 mb-1.5">
            Email atau Nomor WhatsApp
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.ac.id atau 08123456789"
              autoComplete="username"
              className="w-full pl-10 pr-4 py-2.5 bg-surface-canvas dark:bg-navy-950/80 border border-slate-300 dark:border-navy-700 rounded-xl text-xs sm:text-sm text-navy-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-navy-900 dark:text-slate-100">
              Kata Sandi
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-semibold text-[#377832] dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline transition-colors"
            >
              Lupa kata sandi?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi Anda"
              autoComplete="current-password"
              className="w-full pl-10 pr-11 py-2.5 bg-surface-canvas dark:bg-navy-950/80 border border-slate-300 dark:border-navy-700 rounded-xl text-xs sm:text-sm text-navy-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-navy-900 dark:hover:text-slate-100 transition-colors"
              title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          size="lg"
          variant="primary"
          className="w-full bg-[#377832] hover:bg-[#5ea631] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white mt-2 font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md gap-2 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
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

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
        <div>
          <span className="pr-1.5 text-slate-600 dark:text-slate-300">Belum punya akun?</span>
          <Link href="/register" className="font-bold text-[#377832] dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline transition-colors">
            Daftar akun baru
          </Link>
        </div>
        <Link
          href="/forgot-password"
          className="font-medium text-slate-500 dark:text-slate-300 hover:text-navy-800 dark:hover:text-slate-100 inline-flex items-center gap-1 transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
          <span>Bantuan Akun</span>
        </Link>
      </div>
    </Card>
  );
}

const NIGHT_STARS = [
  { top: '7%', left: '8%', size: 'w-1 h-1', opacity: 'opacity-80', delay: '0s', color: 'bg-white' },
  { top: '12%', left: '28%', size: 'w-1.5 h-1.5', opacity: 'opacity-90', delay: '1.2s', color: 'bg-sky-100' },
  { top: '5%', left: '38%', size: 'w-1 h-1', opacity: 'opacity-70', delay: '0.6s', color: 'bg-amber-100' },
  { top: '18%', left: '12%', size: 'w-0.5 h-0.5', opacity: 'opacity-75', delay: '2s', color: 'bg-white' },
  { top: '15%', left: '44%', size: 'w-1 h-1', opacity: 'opacity-65', delay: '1.8s', color: 'bg-sky-200' },
  { top: '9%', left: '52%', size: 'w-1 h-1', opacity: 'opacity-75', delay: '0.4s', color: 'bg-white' },
  { top: '22%', left: '36%', size: 'w-0.5 h-0.5', opacity: 'opacity-60', delay: '2.5s', color: 'bg-amber-50' },
  { top: '14%', left: '64%', size: 'w-1.5 h-1.5', opacity: 'opacity-85', delay: '1.5s', color: 'bg-sky-100' },
  { top: '6%', left: '72%', size: 'w-1 h-1', opacity: 'opacity-70', delay: '0.8s', color: 'bg-white' },
  { top: '24%', left: '58%', size: 'w-0.5 h-0.5', opacity: 'opacity-65', delay: '2.2s', color: 'bg-white' },
  { top: '19%', left: '82%', size: 'w-1 h-1', opacity: 'opacity-80', delay: '1.1s', color: 'bg-amber-100' },
  { top: '27%', left: '20%', size: 'w-0.5 h-0.5', opacity: 'opacity-55', delay: '3s', color: 'bg-sky-100' },
  { top: '8%', left: '92%', size: 'w-1 h-1', opacity: 'opacity-75', delay: '1.7s', color: 'bg-white' },
  { top: '28%', left: '75%', size: 'w-0.5 h-0.5', opacity: 'opacity-50', delay: '2.8s', color: 'bg-sky-200' },
];

export default function LoginPage() {
  return (
    <div className="relative min-h-[100dvh] min-h-screen w-full flex font-jakarta overflow-hidden">
      {/* Base Background Image Layer: Normal siang hari di Light Mode, Color-graded Malam di Dark Mode */}
      <div
        className="absolute inset-0 bg-cover bg-[position:30%_center] lg:bg-[position:60%_center] bg-no-repeat transition-all duration-700 dark:brightness-[0.68] dark:contrast-[1.10] dark:saturate-[0.82] dark:hue-rotate-[14deg]"
        style={{ backgroundImage: "url('/images/BGlogin.png')" }}
        aria-hidden
      />

      {/* Night Atmosphere & Color Grading Overlays (Dark Mode Only) */}
      <div className="hidden dark:block absolute inset-0 pointer-events-none transition-opacity duration-700" aria-hidden>
        {/* 1. Midnight Sky & Horizon Hue Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#051329]/80 via-[#0a2244]/50 to-[#04101e]/65 mix-blend-multiply" />

        {/* 2. Deep Twilight Navy Tint */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#031329]/40 via-transparent to-[#0e2a52]/35 mix-blend-color" />

        {/* 3. Soft Moonlight Sheen over mountains & sky */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_16%,rgba(186,230,253,0.28)_0%,rgba(56,189,248,0.08)_35%,transparent_70%)] mix-blend-screen" />
      </div>

      {/* KIRI - 50% layar di desktop, hidden di HP: Night decorative elements (Moon & Stars) */}
      <div className="hidden lg:flex flex-1 lg:basis-1/2 relative pointer-events-none overflow-hidden" aria-hidden>
        {/* Dark Mode Night Sky Elements: Subtle Moon & Twinkling Stars */}
        <div className="hidden dark:block absolute inset-0">
          {/* Subtle Ethereal Moon & Moonlight Aura */}
          <div className="absolute top-[10%] left-[18%] pointer-events-none">
            {/* Outer moonlight halo */}
            <div className="absolute -inset-6 rounded-full bg-sky-200/15 blur-xl animate-pulse" style={{ animationDuration: '6s' }} />
            {/* Moon disc with subtle glow */}
            <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-sky-200/85 via-slate-100/90 to-amber-50/95 shadow-[0_0_28px_rgba(224,242,254,0.5),0_0_55px_rgba(125,211,252,0.25)] opacity-90">
              {/* Subtle inner moon shading */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-transparent to-sky-950/20" />
            </div>
          </div>

          {/* Twinkling stars in the night sky */}
          {NIGHT_STARS.map((star, idx) => (
            <div
              key={idx}
              className={`absolute rounded-full ${star.size} ${star.color} ${star.opacity} shadow-[0_0_4px_rgba(255,255,255,0.8)] animate-star-twinkle`}
              style={{
                top: star.top,
                left: star.left,
                animationDelay: star.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* KANAN - full di HP, 50% di desktop: Dark navy background elegan di dark mode, transparan di light mode */}
      <div className="relative z-10 flex-1 lg:basis-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 overflow-y-auto dark:bg-navy-950/95 lg:dark:bg-navy-950/90 lg:dark:backdrop-blur-md lg:dark:border-l lg:dark:border-navy-800/80 transition-colors duration-200">
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
              <span className="font-epilogue font-extrabold text-xl sm:text-2xl text-navy-950 dark:text-slate-50 drop-shadow-sm">
                BaktiNusantara
              </span>
            </Link>
            <h2 className="text-xl sm:text-2xl font-bold text-navy-950 dark:text-slate-50 font-epilogue drop-shadow-sm leading-tight">
              Masuk ke Portal KKN Terpadu
            </h2>
            <p className="mt-1 text-[11px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-300 drop-shadow-sm px-2 sm:px-0">
              Pilih peran Anda atau masukkan akun yang telah terdaftar
            </p>
          </div>

          <Suspense fallback={<div className="p-8 text-center text-slate-500 dark:text-slate-300">Memuat formulir masuk...</div>}>
            <LoginFormContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
