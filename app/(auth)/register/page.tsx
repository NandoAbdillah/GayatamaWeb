'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  GraduationCap,
  Home,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Sprout,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';

export default function RegisterHubPage() {
  const roles = [
    {
      role: 'mahasiswa',
      title: 'Mahasiswa KKN',
      badge: 'Registrasi Mandiri',
      desc: 'Daftar untuk memilih pos kebutuhan desa, bentuk kelompok KKN, upload progres logbook harian, dan klaim E-Sertifikat resmi.',
      icon: GraduationCap,
      href: '/register/mahasiswa',
      color: 'text-primary bg-primary/10 border-primary/20',
      buttonVariant: 'primary' as const,
      features: ['Upload KTM & Verifikasi Kampus', 'Smart-Matching Pos KKN', 'Logbook GPS Terintegrasi'],
    },
    {
      role: 'perangkat_desa',
      title: 'Mitra Pemerintah Desa',
      badge: 'Verifikasi SK Kades',
      desc: 'Daftarkan desa Anda untuk mempublikasikan pos kebutuhan pengabdian, menyetujui proposal mahasiswa, dan menerbitkan BAST resmi.',
      icon: Home,
      href: '/register/perangkat-desa',
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
      buttonVariant: 'emerald' as const,
      features: ['Upload SK Pengangkatan Kades', 'Penetapan Titik GPS Balai Desa', 'Penerbitan Surat Tugas Digital'],
    },
    {
      role: 'universitas',
      title: 'Admin LPPM / Kampus',
      badge: 'Legalitas MoU',
      desc: 'Daftarkan institusi perguruan tinggi Anda untuk mengelola roster dosen pembimbing (DPL), monitoring monev, dan approval konversi SKS.',
      icon: ShieldCheck,
      href: '/register/universitas',
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800',
      buttonVariant: 'primary' as const,
      features: ['Kode PT PDDikti Terintegrasi', 'Distribusi DPL Lintas Wilayah', 'Konversi SKS & Rekap Berita Acara'],
    },
  ];

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] py-12 px-4 sm:px-6 lg:px-8 font-jakarta flex flex-col justify-between transition-colors duration-200">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Brand & Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="font-epilogue font-extrabold text-2xl text-navy-950 dark:text-white">
              BaktiNusantara
            </span>
          </Link>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Pilih Kategori Pendaftaran KKN
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              Silakan pilih kategori peran yang sesuai untuk mendapatkan alur pendaftaran dan verifikasi berkas yang tepat.
            </p>
          </div>
        </div>

        {/* 3 Main Role Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.role}
                hoverEffect
                className="p-6 flex flex-col justify-between border-slate-200 dark:border-navy-800 relative group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${item.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                      {item.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-navy-800 space-y-1.5">
                    {item.features.map((f, idx) => (
                      <p
                        key={idx}
                        className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Link href={item.href} className="block">
                    <Button
                      variant={item.buttonVariant}
                      className="w-full justify-center text-xs font-bold gap-2 py-2.5 rounded-xl shadow-sm"
                    >
                      <span>Lanjut Daftar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Dosen DPL Note */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Pendaftaran Dosen Pembimbing Lapangan (DPL)
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                Akun DPL diterbitkan langsung oleh admin LPPM Universitas. Silakan hubungi sekretariat LPPM kampus Anda.
              </p>
            </div>
          </div>

          <Link href="/login" className="shrink-0">
            <Button size="sm" variant="outline" className="text-xs font-bold border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200">
              Masuk Akun DPL
            </Button>
          </Link>
        </div>

        {/* Bottom Login Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sudah memiliki akun terdaftar?{' '}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Masuk ke akun Anda di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
