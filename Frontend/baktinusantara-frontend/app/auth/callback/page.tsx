'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import authService from '@/lib/services/auth.service';
import { toast } from 'sonner';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleAuth() {
      const token = searchParams.get('token');
      const role = searchParams.get('role');
      const redirect = searchParams.get('redirect') || '/mahasiswa/dashboard';

      if (!token) {
        toast.error('Token autentikasi Google tidak ditemukan.');
        router.push('/login');
        return;
      }

      try {
        localStorage.setItem('sanctum_token', token);
        document.cookie = `sanctum_token=${token}; path=/; max-age=86400; SameSite=Lax`;
        if (role) {
          document.cookie = `user_role=${role}; path=/; max-age=86400; SameSite=Lax`;
        }

        const user = await authService.getMe();
        if (user) {
          localStorage.setItem('user_data', JSON.stringify(user));
          document.cookie = `user_role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
          toast.success(`Selamat datang, ${user.name}!`);
        }

        router.push(redirect);
      } catch (err) {
        console.error('Failed to resolve Google user profile:', err);
        router.push(redirect);
      }
    }

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-navy-950 p-6">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="text-base font-bold text-navy-900 dark:text-white font-epilogue">
        Menghubungkan Akun Google...
      </h2>
      <p className="text-xs text-slate-500 mt-1">
        Memvalidasi sesi dan mengarahkan ke dashboard Anda.
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-navy-950">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
