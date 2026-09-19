'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import authService from '@/lib/services/auth.service';

type Step = 'IDENTIFIER' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Multi-step State
  const [step, setStep] = useState<Step>('IDENTIFIER');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [maskedTarget, setMaskedTarget] = useState<string>('');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Countdown timer for OTP resend
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot Email Lookup modal/mode
  const [isForgotEmailMode, setIsForgotEmailMode] = useState(false);
  const [lookupResult, setLookupResult] = useState<{
    name?: string;
    masked_email?: string;
    role?: string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim()) {
      const msg = 'Masukkan alamat email atau nomor WhatsApp akun Anda.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword({
        identifier: identifier.trim(),
        channel: channel,
      });

      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
      }
      setMaskedTarget(res.target || identifier);
      setResendCooldown(60);
      setStep('OTP');
      toast.success(res.message || 'Kode OTP telah berhasil dikirim!');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Akun tidak ditemukan atau gagal mengirim kode OTP. Silakan periksa kembali data Anda.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otp.length < 6) {
      const msg = 'Masukkan 6 digit kode OTP yang telah dikirimkan.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyOtp({
        identifier: identifier.trim(),
        otp: otp.trim(),
        purpose: 'forgot_password',
      });

      if (res.valid) {
        toast.success('Kode OTP berhasil diverifikasi!');
        setStep('NEW_PASSWORD');
      } else {
        const msg = res.message || 'Kode OTP tidak valid atau kadaluwarsa.';
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Kode OTP salah atau telah kadaluwarsa. Silakan minta kode baru.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await authService.resendOtp({
        identifier: identifier.trim(),
        purpose: 'forgot_password',
        channel: channel,
      });

      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
      }
      setResendCooldown(60);
      toast.success('Kode OTP baru telah dikirimkan!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Gagal mengirim ulang OTP.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      const msg = 'Kata sandi minimal 6 karakter.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (password !== passwordConfirmation) {
      const msg = 'Konfirmasi kata sandi tidak cocok.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword({
        identifier: identifier.trim(),
        otp: otp.trim(),
        password: password,
        password_confirmation: passwordConfirmation,
      });

      toast.success(res.message || 'Kata sandi berhasil diperbarui!');
      setStep('SUCCESS');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Gagal memperbarui kata sandi. Pastikan kode OTP masih valid.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Lookup Email (Forgot Email feature)
  const handleLookupEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLookupResult(null);

    if (!identifier.trim()) {
      const msg = 'Masukkan nomor WhatsApp, NIM, atau NIP Anda.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotEmail({
        identifier: identifier.trim(),
        channel: channel,
      });

      setLookupResult(res);
      toast.success(res.message || 'Informasi akun telah dikirimkan!');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Akun dengan data tersebut tidak ditemukan dalam sistem.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-[100dvh] min-h-screen w-full bg-cover bg-[position:30%_center] lg:bg-[position:60%_center] bg-no-repeat flex font-jakarta overflow-hidden"
      style={{ backgroundImage: "url('/images/BGlogin.png')" }}
    >
      {/* Left side spacer */}
      <div className="hidden lg:flex flex-1 lg:basis-1/2" aria-hidden />

      {/* Right side interactive card */}
      <div className="flex-1 lg:basis-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 overflow-y-auto">
        <div className="w-full max-w-[480px] my-auto flex flex-col">
          {/* Header */}
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
              {isForgotEmailMode
                ? 'Pencarian Email Terdaftar'
                : 'Pemulihan Kata Sandi'}
            </h2>
            <p className="mt-1 text-[11px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-300 drop-shadow-sm px-2 sm:px-0">
              {isForgotEmailMode
                ? 'Temukan alamat email yang tertaut pada akun Anda'
                : 'Pulihkan akses akun Anda dengan verifikasi OTP aman'}
            </p>
          </div>

          <Card className="p-4 min-[360px]:p-5 sm:p-6 lg:p-8 bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl sm:rounded-3xl transition-all">
            {/* Mode Switcher Banner (Forgot Password vs Forgot Email) */}
            <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-navy-900 rounded-xl mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setIsForgotEmailMode(false);
                  setStep('IDENTIFIER');
                  setErrorMsg(null);
                  setLookupResult(null);
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-lg transition-all text-center ${
                  !isForgotEmailMode
                    ? 'bg-white dark:bg-navy-800 text-navy-950 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-navy-900 dark:hover:text-slate-200'
                }`}
              >
                Lupa Kata Sandi
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsForgotEmailMode(true);
                  setErrorMsg(null);
                  setLookupResult(null);
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-lg transition-all text-center ${
                  isForgotEmailMode
                    ? 'bg-white dark:bg-navy-800 text-navy-950 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-navy-900 dark:hover:text-slate-200'
                }`}
              >
                Lupa Alamat Email
              </button>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* FORGOT EMAIL MODE */}
            {/* ========================================================= */}
            {isForgotEmailMode ? (
              <div className="space-y-4">
                <form onSubmit={handleLookupEmail} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1.5">
                      Nomor WhatsApp / NIM Mahasiswa / NIP Dosen
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Contoh: 08123456789 atau NIM 21051204001"
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-canvas dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs sm:text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1.5">
                      Kirim Informasi Ke Saluran:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                        { id: 'sms', label: 'SMS', icon: Phone },
                        { id: 'email', label: 'Email', icon: Mail },
                      ].map((ch) => {
                        const Icon = ch.icon;
                        const isSelected = channel === ch.id;
                        return (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => setChannel(ch.id as any)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all ${
                              isSelected
                                ? 'border-[#377832] bg-emerald-50 dark:bg-emerald-950/40 text-[#377832] dark:text-emerald-300 ring-2 ring-[#377832]/30'
                                : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800'
                            }`}
                          >
                            <Icon className="w-4 h-4 mb-1" />
                            <span>{ch.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    isLoading={loading}
                    variant="primary"
                    className="w-full bg-[#377832] hover:bg-[#5ea631] font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Cari Email Terdaftar</span>
                  </Button>
                </form>

                {lookupResult && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-200 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Akun Ditemukan!</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      Halo <strong>{lookupResult.name}</strong> ({lookupResult.role?.toUpperCase()}), informasi email terdaftar Anda adalah:
                    </p>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-navy-900 border border-emerald-300 dark:border-emerald-700 font-mono text-sm font-bold text-[#377832] text-center">
                      {lookupResult.masked_email}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Silakan gunakan email di atas untuk login atau reset password.
                    </p>
                    <Button
                      type="button"
                      onClick={() => {
                        setIsForgotEmailMode(false);
                        setStep('IDENTIFIER');
                      }}
                      variant="outline"
                      className="w-full mt-2 text-xs py-2"
                    >
                      Lanjut Reset Kata Sandi
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* ========================================================= */
              /* FORGOT PASSWORD MULTI-STEP FLOW */
              /* ========================================================= */
              <div>
                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-5 px-1">
                  {[
                    { id: 'IDENTIFIER', label: '1. Identitas' },
                    { id: 'OTP', label: '2. Kode OTP' },
                    { id: 'NEW_PASSWORD', label: '3. Sandi Baru' },
                  ].map((s, idx) => {
                    const stepOrder = ['IDENTIFIER', 'OTP', 'NEW_PASSWORD', 'SUCCESS'];
                    const currentIdx = stepOrder.indexOf(step);
                    const isDone = currentIdx > idx;
                    const isCurrent = step === s.id;

                    return (
                      <div key={s.id} className="flex items-center gap-1.5 text-[11px] font-bold">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-[#377832] text-white ring-2 ring-[#377832]/30'
                              : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                        </span>
                        <span
                          className={`hidden sm:inline ${
                            isCurrent
                              ? 'text-navy-950 dark:text-white'
                              : isDone
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* STEP 1: IDENTIFIER & CHANNEL */}
                {step === 'IDENTIFIER' && (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1.5">
                        Alamat Email atau Nomor WhatsApp Akun
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="nama@email.com atau 08123456789"
                          className="w-full pl-10 pr-4 py-2.5 bg-surface-canvas dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs sm:text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1.5">
                        Pilih Saluran Pengiriman OTP:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, sub: 'Cepat & Gratis' },
                          { id: 'email', label: 'Email', icon: Mail, sub: 'In-Box' },
                          { id: 'sms', label: 'SMS', icon: Phone, sub: 'Jaringan Seluler' },
                        ].map((ch) => {
                          const Icon = ch.icon;
                          const isSelected = channel === ch.id;
                          return (
                            <button
                              key={ch.id}
                              type="button"
                              onClick={() => setChannel(ch.id as any)}
                              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'border-[#377832] bg-emerald-50 dark:bg-emerald-950/40 text-[#377832] dark:text-emerald-300 ring-2 ring-[#377832]/30 font-bold'
                                  : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800'
                              }`}
                            >
                              <Icon className="w-4 h-4 mb-1" />
                              <span>{ch.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      isLoading={loading}
                      variant="primary"
                      className="w-full bg-[#377832] hover:bg-[#5ea631] font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md gap-2"
                    >
                      <span>Kirim Kode OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>
                )}

                {/* STEP 2: VERIFY OTP */}
                {step === 'OTP' && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs text-slate-700 dark:text-slate-300">
                      <p>
                        Kode OTP 6 digit telah dikirimkan ke <strong>{maskedTarget}</strong> via{' '}
                        <strong>{channel.toUpperCase()}</strong>.
                      </p>
                    </div>

                    {/* Local Dev OTP Hint Badge */}
                    {devOtp && (
                      <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Kode OTP Dev Lokal: <strong>{devOtp}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOtp(devOtp)}
                          className="text-[11px] font-bold text-amber-700 hover:underline"
                        >
                          Isi Otomatis
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1.5">
                        Masukkan 6-Digit Kode OTP
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="______"
                          className="w-full tracking-[0.5em] text-center font-mono font-bold text-lg sm:text-xl py-3 bg-surface-canvas dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setStep('IDENTIFIER')}
                        className="text-slate-500 hover:text-navy-900 dark:hover:text-slate-200 font-medium inline-flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Ganti Nomor / Email</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || loading}
                        className={`font-semibold inline-flex items-center gap-1 ${
                          resendCooldown > 0
                            ? 'text-slate-400 cursor-not-allowed'
                            : 'text-[#377832] hover:underline'
                        }`}
                      >
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        <span>
                          {resendCooldown > 0
                            ? `Kirim Ulang (${resendCooldown}s)`
                            : 'Kirim Ulang OTP'}
                        </span>
                      </button>
                    </div>

                    <Button
                      type="submit"
                      isLoading={loading}
                      variant="primary"
                      className="w-full bg-[#377832] hover:bg-[#5ea631] font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md gap-2"
                    >
                      <span>Verifikasi Kode OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>
                )}

                {/* STEP 3: CREATE NEW PASSWORD */}
                {step === 'NEW_PASSWORD' && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1.5">
                        Kata Sandi Baru
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="w-full pl-10 pr-11 py-2.5 bg-surface-canvas dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs sm:text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-navy-900 dark:hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1.5">
                        Konfirmasi Kata Sandi Baru
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={passwordConfirmation}
                          onChange={(e) => setPasswordConfirmation(e.target.value)}
                          placeholder="Ulangi kata sandi baru"
                          className="w-full pl-10 pr-11 py-2.5 bg-surface-canvas dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs sm:text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-navy-900 dark:hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      isLoading={loading}
                      variant="primary"
                      className="w-full bg-[#377832] hover:bg-[#5ea631] font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md gap-2"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Simpan Kata Sandi Baru</span>
                    </Button>
                  </form>
                )}

                {/* STEP 4: SUCCESS */}
                {step === 'SUCCESS' && (
                  <div className="text-center py-4 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#377832] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-navy-950 dark:text-white">
                        Kata Sandi Berhasil Diperbarui!
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Akses akun Anda telah dipulihkan. Silakan masuk menggunakan kata sandi baru Anda.
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={() => router.push('/login')}
                      variant="primary"
                      className="w-full bg-[#377832] hover:bg-[#5ea631] font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md gap-2"
                    >
                      <span>Masuk ke Akun Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Footer Navigation */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <Link
                href="/login"
                className="font-semibold text-[#377832] hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Masuk</span>
              </Link>

              <Link href="/register" className="text-slate-500 hover:text-navy-900 dark:hover:text-white">
                Daftar Akun Baru
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
