'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
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
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('rian.pratama@student.univ.ac.id');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('mahasiswa');

  const demoAccounts: {
    role: UserRole;
    title: string;
    email: string;
    icon: React.ElementType;
    desc: string;
    path: string;
  }[] = [
    {
      role: 'mahasiswa',
      title: 'Mahasiswa',
      email: 'rian.pratama@student.univ.ac.id',
      icon: GraduationCap,
      desc: 'Isi logbook, kelola tim, & submit proposal',
      path: '/mahasiswa/dashboard',
    },
    {
      role: 'perangkat_desa',
      title: 'Mitra Desa',
      email: 'kades@sukamaju.desa.id',
      icon: Home,
      desc: 'Terbitkan pos kebutuhan & tanda tangani BAST',
      path: '/perangkat-desa/dashboard',
    },
    {
      role: 'dosen',
      title: 'Dosen (DPL)',
      email: 'hendra.gunawan@univ.ac.id',
      icon: BookOpen,
      desc: 'Verifikasi logbook & rekap nilai kelulusan',
      path: '/dosen/dashboard',
    },
    {
      role: 'universitas',
      title: 'LPPM / Admin',
      email: 'lppm@univ.ac.id',
      icon: ShieldCheck,
      desc: 'Monev agregat & konversi SKS nasional',
      path: '/admin/dashboard',
    },
  ];

  const handleSelectRole = (acc: (typeof demoAccounts)[0]) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword('password123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login(email, password, selectedRole);
      toast.success(`Selamat datang, ${user.name}!`);

      // Redirect based on role
      const redirectParam = searchParams.get('redirect');
      if (redirectParam) {
        router.push(redirectParam);
      } else if (user.role === 'mahasiswa') {
        router.push('/mahasiswa/dashboard');
      } else if (user.role === 'perangkat_desa') {
        router.push('/perangkat-desa/dashboard');
      } else if (user.role === 'dosen') {
        router.push('/dosen/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      toast.error('Gagal masuk. Periksa kembali email dan kata sandi.');
    }
  };

  return (
    <Card className="p-6 sm:p-8 shadow-ambient-lg border-slate-200/90">
      {/* Role selector chips */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-2">
          Pilih Peran Masuk Cepat (Demo):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {demoAccounts.map((acc) => {
            const Icon = acc.icon;
            const isSelected = selectedRole === acc.role;
            return (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleSelectRole(acc)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary-50/80 text-primary-800 ring-2 ring-primary-300 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-navy-700'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mb-1.5 ${
                    isSelected ? 'text-primary' : 'text-slate-500'
                  }`}
                />
                <span className="text-xs font-medium">{acc.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-navy-900 mb-1.5">
            Alamat Email Institusi / Desa
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
              className="w-full pl-10 pr-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-navy-900">
              Kata Sandi
            </label>
            <a href="#" className="text-xs text-primary hover:underline font-medium">
              Lupa kata sandi?
            </a>
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
              className="w-full pl-10 pr-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          size="lg"
          variant="primary"
          className="w-full mt-2 font-semibold"
        >
          <span>Masuk Sebagai {selectedRole.replace('_', ' ').toUpperCase()}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Belum memiliki akun KKN?</span>
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Daftar akun baru →
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
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
          Masuk ke Portal KKN Terpadu
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-jakarta">
          Pilih peran Anda atau masukkan akun yang telah terdaftar
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat formulir masuk...</div>}>
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  );
}
