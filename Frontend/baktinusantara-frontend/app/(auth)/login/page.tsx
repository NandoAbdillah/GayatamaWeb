'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
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
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('ketua.ahmad@mhs.unesa.ac.id');
  const [password, setPassword] = useState('password');
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
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/mahasiswa/dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

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
      const msg = err.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <Card className="p-6 sm:p-8 bg-transparent border-0 shadow-none backdrop-blur-none">
      {/* Role selector quick fill chips */}
      <div className="mb-6">

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
          className="w-full mt-2 font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md gap-2"
        >
          <span>Masuk Sebagai {selectedRole.replace('_', ' ').toUpperCase()}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-navy-800 flex items-center text-xs text-slate-500 dark:text-slate-400">
        <span className='pr-2'>Belum memiliki akun KKN?</span>
        <Link href="/register" className="font-bold text-primary hover:underline">
          Daftar akun baru
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center lg:justify-end p-4 sm:p-6 lg:p-8 font-jakarta"
      style={{ backgroundImage: "url('/images/BGlogin.png')" }}
    >
      <div className="w-full max-w-xl lg:mr-8 xl:mr-16 bg-transparent">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-white font-epilogue font-bold text-xl shadow-glow-primary group-hover:scale-105 transition-transform">
              BN
            </div>
            <span className="font-epilogue font-extrabold text-2xl text-navy-950 dark:text-white drop-shadow-sm">
              BaktiNusantara
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-navy-950 dark:text-white font-epilogue drop-shadow-sm">
            Masuk ke Portal KKN Terpadu
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 drop-shadow-sm">
            Pilih peran Anda atau masukkan akun yang telah terdaftar
          </p>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat formulir masuk...</div>}>
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  );
}

