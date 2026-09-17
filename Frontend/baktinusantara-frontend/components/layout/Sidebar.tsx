'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
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

type SidebarProps = {
  collapsed?: boolean;
  onExpand?: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onExpand }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const getRoleNavItems = () => {
    switch (user?.role) {
      case 'mahasiswa':
        return [
          { href: '/mahasiswa/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/mahasiswa/progress', label: 'Logbook Harian', icon: BookOpen, badge: 'Aktif' },
          { href: '/mahasiswa/lokasi', label: 'Presensi Lokasi', icon: MapPin, badge: 'GPS' },
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
          { href: '/dosen/penilaian', label: 'Rekap Nilai', icon: Award },
        ];
      case 'admin':
        return [
          { href: '/admin/dashboard', label: 'Dashboard Eksekutif', icon: LayoutDashboard },
          { href: '/admin/verifikasi', label: 'Verifikasi Entitas', icon: ShieldCheck, badge: 'Aksi' },
          { href: '/admin/pos-kebutuhan', label: 'Pos Kebutuhan Desa', icon: ClipboardList },
          { href: '/admin/direktori-kampus', label: 'Direktori Kampus & DPL', icon: Building },
          { href: '/admin/monitoring', label: 'Sebaran Program KKN', icon: MapPin, badge: 'Live' },
          { href: '/admin/analytics', label: 'Analisis & Statistik SDG', icon: BarChart3 },
        ];
      case 'universitas':
        return [
          { href: '/kampus/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/kampus/dosen', label: 'Dosen DPL', icon: GraduationCap },
          { href: '/kampus/laporan-dosen', label: 'Laporan DPL', icon: FileText, badge: '1 Baru' },
          { href: '/kampus/sks', label: 'Konversi SKS', icon: FileCheck2 },
          { href: '/kampus/documentation', label: 'SOP & Regulasi', icon: BookOpen },
          { href: '/kampus/feedback', label: 'Feedback', icon: ThumbsUp },
          { href: '/kampus/logs', label: 'Aktivitas', icon: Activity },
        ];
      default:
        return [
          { href: '/admin/dashboard', label: 'Dashboard Admin', icon: LayoutDashboard },
          { href: '/admin/verifikasi', label: 'Verifikasi Entitas', icon: ShieldCheck },
          { href: '/admin/pos-kebutuhan', label: 'Pos Kebutuhan', icon: ClipboardList },
          { href: '/admin/direktori-kampus', label: 'Direktori Kampus', icon: Building },
          { href: '/admin/analytics', label: 'Statistik SDG', icon: BarChart3 },
        ];
    }
  };

  const navItems = getRoleNavItems();

  return (
    <>
      <aside
        className={cn(
          'shrink-0 flex flex-col bg-white dark:bg-navy-950 border-r border-slate-200 dark:border-navy-800 fixed top-[61px] left-0 bottom-0 justify-between select-none overscroll-none z-20 will-change-transform transition-[width,padding,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          collapsed
            ? 'w-64 p-4 -translate-x-full lg:translate-x-0 lg:w-[72px] lg:px-2 lg:py-4 overflow-x-hidden overflow-y-auto'
            : 'w-64 p-4 translate-x-0 overflow-hidden'
        )}
      >
      <div className="space-y-6">
        {/* User Card - tinggi tetap, fade halus sinkron dengan lebar */}
        <div
          className={cn(
            'rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 will-change-transform transition-[padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
            collapsed ? 'px-2 py-3.5' : 'p-3.5'
          )}
        >
          <div className="flex items-center gap-3">
            <img
              src={
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
              }
              alt={user?.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-navy-700 shadow-sm shrink-0"
            />
            <div
              className={cn(
                'overflow-hidden whitespace-nowrap will-change-transform transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                collapsed ? 'max-w-0 opacity-0 flex-none delay-0' : 'max-w-[160px] opacity-100 flex-1 min-w-0 delay-75'
              )}
            >
              <p className="text-sm font-bold text-navy-950 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-primary dark:text-primary-400 font-semibold capitalize flex items-center gap-1 truncate">
                {user?.role === 'admin' ? 'Super Admin Platform' : user?.role === 'universitas' ? 'LPPM Universitas' : user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Section - tinggi header tetap, menu hanya ikon saat tertutup dengan transisi halus */}
        <div className="space-y-1">
          <p
            className={cn(
              'px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider h-4 flex items-center whitespace-nowrap overflow-hidden will-change-transform transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
              collapsed ? 'opacity-0 mb-2' : 'opacity-100 mb-2 delay-75'
            )}
          >
            Menu Utama
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onClick={() => {
                  if (collapsed) onExpand?.();
                }}
                className={cn(
                  'flex items-center rounded-xl text-sm font-medium will-change-transform transition-[padding,justify-content] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group overflow-hidden',
                  collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3.5 py-2.5',
                  isActive
                    ? 'bg-primary text-white shadow-sm font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900 hover:text-navy-950 dark:hover:text-white'
                )}
              >
                <div
                  className={cn(
                    'flex items-center overflow-hidden will-change-transform transition-[gap] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    collapsed ? 'gap-0 justify-center' : 'gap-3'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-110',
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary'
                    )}
                  />
                  <span
                    className={cn(
                      'whitespace-nowrap overflow-hidden will-change-transform transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                      collapsed ? 'max-w-0 opacity-0' : 'max-w-[140px] opacity-100 delay-75'
                    )}
                  >
                    {item.label}
                  </span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'whitespace-nowrap overflow-hidden text-[10px] font-bold px-2 py-0.5 rounded-full will-change-transform transition-[max-width,opacity,margin,padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0',
                      collapsed ? 'max-w-0 opacity-0 px-0 ml-0' : 'max-w-[80px] opacity-100 ml-2 delay-75',
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

      {/* Footer Navigation Action - tinggi tetap, hanya ikon saat tertutup dengan fade */}
      <div className="pt-4 border-t border-slate-100 dark:border-navy-800 space-y-1.5">
        <Link
          href="/"
          title={collapsed ? 'Halaman Beranda Utama' : undefined}
          onClick={(e) => {
            if (collapsed) {
              e.preventDefault();
              onExpand?.();
              setTimeout(() => router.push('/'), 300);
            }
          }}
          className={cn(
            'flex items-center rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-900 will-change-transform transition-[padding,justify-content] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden',
            collapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-3.5 py-2'
          )}
        >
          <Building className="w-4 h-4 text-slate-400 shrink-0" />
          <span
            className={cn(
              'whitespace-nowrap overflow-hidden will-change-transform transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
              collapsed ? 'max-w-0 opacity-0' : 'max-w-[140px] opacity-100 delay-75'
            )}
          >
            Halaman Beranda Utama
          </span>
        </Link>
        <button
          onClick={async () => {
            await logout();
            toast.success('Sesi berhasil keluar');
            router.push('/login');
          }}
          title={collapsed ? 'Keluar Sesi' : undefined}
          className={cn(
            'flex items-center rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-300 ease-in-out overflow-hidden',
            collapsed ? 'justify-center px-2 py-2 w-full' : 'gap-2.5 px-3.5 py-2 w-full'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span
            className={cn(
              'whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out',
              collapsed ? 'max-w-0 opacity-0' : 'max-w-[100px] opacity-100'
            )}
          >
            Keluar Sesi
          </span>
        </button>
      </div>
    </aside>
    </>
  );
};
