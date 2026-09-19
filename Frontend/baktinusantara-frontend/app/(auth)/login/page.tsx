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
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('mahasiswa');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    setErrorMsg(null);
  };

  const handleFillDemoAccount = () => {
    const activeAcc = demoAccounts.find((a) => a.role === selectedRole) || demoAccounts[0];
    setEmail(activeAcc.email);
    setPassword('password');
    toast.info(`Kredensial demo untuk peran ${activeAcc.title} telah diisi.`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

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
      const msg = err.message || 'Gagal masuk. Periksa kembali akun dan kata sandi Anda.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <Card className="p-4 min-[360px]:p-5 sm:p-6 lg:p-8 bg-white/85 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none border border-white/40 lg:border-0 shadow-xl lg:shadow-none rounded-2xl sm:rounded-3xl transition-all">
      {/* Role selector chips (tanpa auto-fill) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-navy-900 dark:text-slate-200">
            Masuk Sebagai Peran:
          </label>
          <button
            type="button"
            onClick={handleFillDemoAccount}
            className="text-[11px] font-semibold text-[#377832] dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            title="Klik jika ingin mengisi form dengan akun demo peran terpilih"
          >
            <Sparkles className="w-3 h-3" />
            <span>Isi Demo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
          {demoAccounts.map((acc) => {
            const Icon = acc.icon;
            const isSelected = selectedRole === acc.role;
            return (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleSelectRole(acc)}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-200 ${isSelected
                    ? 'border-primary bg-primary-50/90 dark:bg-primary-950/40 text-primary-900 dark:text-white ring-2 ring-primary/40 font-semibold shadow-sm'
                    : 'border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-600 hover:bg-slate-50 dark:hover:bg-navy-800 text-navy-800 dark:text-slate-200'
                  }`}
              >
                <div className="flex items-center gap-1.5 w-full mb-1">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isSelected ? 'text-primary' : 'text-slate-500 dark:text-slate-400'
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
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1.5">
            Email atau Nomor WhatsApp
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.ac.id atau 08123456789"
              autoComplete="username"
              className="w-full pl-10 pr-4 py-2.5 bg-surface-canvas dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs sm:text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200">
              Kata Sandi
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-semibold text-[#377832] dark:text-emerald-400 hover:underline"
            >
              Lupa kata sandi?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi Anda"
              autoComplete="current-password"
              className="w-full pl-10 pr-11 py-2.5 bg-surface-canvas dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs sm:text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-navy-900 dark:hover:text-white transition-colors"
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
          className="w-full bg-[#377832] hover:bg-[#5ea631] mt-2 font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md gap-2 transition-all"
        >
          <span>Masuk Sebagai {selectedRole.replace('_', ' ').toUpperCase()}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          <span className='pr-1.5'>Belum punya akun?</span>
          <Link href="/register" className="font-bold text-[#377832] hover:underline">
            Daftar akun baru
          </Link>
        </div>
        <Link
          href="/forgot-password"
          className="font-medium text-slate-500 hover:text-navy-800 dark:hover:text-slate-200 inline-flex items-center gap-1"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Bantuan Akun</span>
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

