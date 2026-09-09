'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  Award,
  Home,
  CheckSquare,
  MessageSquare,
  ClipboardList,
  Building,
  GraduationCap,
  FileCheck2,
  ShieldCheck,
  Activity,
  LogOut,
  Sparkles,
  User,
  BarChart3,
  History,
  FileSignature,
  ThumbsUp,
  MapPin,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getRoleNavItems = () => {
    switch (user?.role) {
      case 'mahasiswa':
        return [
          { href: '/mahasiswa/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/mahasiswa/progress', label: 'Logbook Harian', icon: BookOpen, badge: 'Aktif' },
          { href: '/mahasiswa/lokasi', label: 'Presensi Lokasi GPS', icon: MapPin, badge: 'GPS' },
          { href: '/mahasiswa/kelompok', label: 'Kelompok KKN', icon: Users },
          { href: '/mahasiswa/proposal', label: 'Proposal Program', icon: FileText },
          { href: '/mahasiswa/izin', label: 'Surat Izin Orang Tua', icon: FileCheck2, badge: '>50km' },
          { href: '/mahasiswa/portofolio', label: 'Luaran & Portofolio', icon: Award },
          { href: '/mahasiswa/verifikasi', label: 'Verifikasi Identitas', icon: ShieldCheck },
          { href: '/mahasiswa/profile', label: 'Profil & Skill Mahasiswa', icon: User },
        ];
      case 'perangkat_desa':
        return [
          { href: '/perangkat-desa/dashboard', label: 'Dashboard Desa', icon: Home },
          { href: '/perangkat-desa/pos-kebutuhan', label: 'Pos Kebutuhan', icon: ClipboardList },
          { href: '/perangkat-desa/proposal', label: 'Proposal Masuk', icon: FileCheck2 },
          { href: '/perangkat-desa/surat-tugas', label: 'Surat Tugas Desa', icon: FileSignature },
          { href: '/perangkat-desa/luaran', label: 'Verifikasi Luaran', icon: Award },
          { href: '/perangkat-desa/aspirasi', label: 'Aspirasi Warga', icon: MessageSquare, badge: '2 Baru' },
          { href: '/perangkat-desa/progress', label: 'Monitoring Mahasiswa', icon: Activity },
          { href: '/perangkat-desa/bast', label: 'Penilaian & BAST', icon: Award },
          { href: '/perangkat-desa/riwayat', label: 'Riwayat KKN Desa', icon: History },
        ];
      case 'dosen':
        return [
          { href: '/dosen/dashboard', label: 'Dashboard DPL', icon: GraduationCap },
          { href: '/dosen/logbook', label: 'Verifikasi Logbook', icon: CheckSquare, badge: '1 Revisi' },
          { href: '/dosen/proposal', label: 'Kelayakan Proposal', icon: FileText },
          { href: '/dosen/penilaian', label: 'Rekap Nilai & Berita Acara', icon: Award },
        ];
      case 'universitas':
      case 'admin':
      default:
        return [
          { href: '/admin/dashboard', label: 'Monev LPPM', icon: LayoutDashboard },
          { href: '/admin/monitoring', label: 'Live Monitoring Spasial', icon: MapPin, badge: 'Live' },
          { href: '/admin/analytics', label: 'Analisis & Statistik SDG', icon: BarChart3 },
          { href: '/admin/laporan-dosen', label: 'Tinjau Laporan DPL', icon: FileText, badge: '1 Baru' },
          { href: '/admin/dosen', label: 'Alokasi Dosen DPL', icon: GraduationCap },
          { href: '/admin/sks', label: 'Konversi SKS & Kelulusan', icon: FileCheck2 },
          { href: '/admin/verifikasi', label: 'Verifikasi Berkas SK/KTM', icon: ShieldCheck },
          { href: '/admin/documentation', label: 'Pusat SOP & Regulasi', icon: BookOpen },
          { href: '/admin/feedback', label: 'Feedback Stakeholder', icon: ThumbsUp },
          { href: '/admin/logs', label: 'Audit Trail & Sistem', icon: Activity },
        ];
    }
  };

  const navItems = getRoleNavItems();

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col bg-white dark:bg-navy-950 border-r border-slate-200 dark:border-navy-800 min-h-[calc(100vh-4rem)] p-4 justify-between select-none transition-colors duration-200">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
          <div className="flex items-center gap-3">
            <img
              src={
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
              }
              alt={user?.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-navy-700 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-navy-950 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-primary dark:text-primary-400 font-semibold capitalize flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-primary text-white shadow-sm font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900 hover:text-navy-950 dark:hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-transform group-hover:scale-110',
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation Action */}
      <div className="pt-4 border-t border-slate-100 dark:border-navy-800 space-y-1.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-900 transition-colors"
        >
          <Building className="w-4 h-4 text-slate-400" />
          <span>Halaman Beranda Utama</span>
        </Link>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
};
