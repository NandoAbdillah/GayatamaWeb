'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  Home,
  BookOpen,
  ShieldCheck,
  Shield,
  ChevronDown,
  Check,
  Sparkles,
  Loader2,
  Compass,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const RoleSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { user, isAuthenticated, switchRoleDemo, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const visitorRole = {
    role: 'visitor' as const,
    label: 'Visitor',
    subtitle: 'Tamu Publik (Belum Masuk)',
    icon: Compass,
    dashboard: '/',
  };

  const roles: {
    role: UserRole;
    label: string;
    subtitle: string;
    icon: React.ElementType;
    dashboard: string;
  }[] = [
    {
      role: 'mahasiswa',
      label: 'Mahasiswa KKN',
      subtitle: 'Ahmad Fauzi (UNESA)',
      icon: GraduationCap,
      dashboard: '/mahasiswa/dashboard',
    },
    {
      role: 'perangkat_desa',
      label: 'Mitra Desa (Kades)',
      subtitle: 'Pemdes Sukamaju',
      icon: Home,
      dashboard: '/perangkat-desa/dashboard',
    },
    {
      role: 'dosen',
      label: 'Dosen (DPL)',
      subtitle: 'Dr. Budi Santoso, M.Kom.',
      icon: BookOpen,
      dashboard: '/dosen/dashboard',
    },
    {
      role: 'universitas',
      label: 'LPPM Kampus',
      subtitle: 'LPPM UNESA Surabaya',
      icon: ShieldCheck,
      dashboard: '/kampus/dashboard',
    },
    {
      role: 'admin',
      label: 'Super Admin',
      subtitle: 'Platform BaktiNusantara',
      icon: Shield,
      dashboard: '/admin/dashboard',
    },
  ];

  const currentRole = isAuthenticated && user ? (roles.find((r) => r.role === user.role) || visitorRole) : visitorRole;
  const CurrentIcon = currentRole.icon;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = async (item: (typeof roles)[0]) => {
    setIsSwitching(true);
    try {
      const switchedUser = await switchRoleDemo(item.role);
      toast.success(`Beralih peran sebagai ${switchedUser.name}`);
      setIsOpen(false);
      // Pindahkan langsung ke dashboard peran yang dipilih dengan full refresh untuk mereset state & layout
      window.location.href = item.dashboard;
    } catch (err: any) {
      toast.error('Gagal beralih peran.');
      setIsSwitching(false);
    }
  };

  const handleSwitchToVisitor = async () => {
    setIsSwitching(true);
    try {
      await logout();
      toast.success('Beralih ke Mode Tamu / Visitor');
      setIsOpen(false);
      window.location.href = '/';
    } catch {
      toast.error('Gagal keluar sesi.');
      setIsSwitching(false);
    }
  };

  return (
    <div className={cn('relative inline-block text-left font-jakarta', className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={isSwitching}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 h-9 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-navy-900 dark:hover:bg-navy-800 text-navy-950 dark:text-slate-100 border border-slate-200/80 dark:border-navy-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 shrink-0"
        title="Ganti peran simulasi KKN"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary shrink-0">
          {isSwitching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CurrentIcon className="w-3.5 h-3.5" />
          )}
        </span>
        <div className="flex items-center gap-1 text-left shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden 2xl:inline">
            ROLE:
          </span>
          <span className="font-bold text-navy-950 dark:text-white whitespace-nowrap">
            {currentRole.label}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ml-0.5 shrink-0',
            isOpen && 'rotate-180 text-primary'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl bg-white dark:bg-navy-900 p-2 shadow-2xl ring-1 ring-slate-900/10 dark:ring-black/40 border border-slate-100 dark:border-navy-800 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {isAuthenticated ? 'Ganti Peran Pengguna' : 'Simulasi Peran / Demo'}
            </span>
            <span className="text-[10px] font-semibold text-primary dark:text-primary-400">
              {isAuthenticated ? currentRole.label : 'Mode Visitor'}
            </span>
          </div>

          <div className="space-y-1">
            {roles.map((item) => {
              const Icon = item.icon;
              const isActive = isAuthenticated && user?.role === item.role;

              return (
                <button
                  key={item.role}
                  disabled={isSwitching}
                  onClick={() => handleRoleChange(item)}
                  className={cn(
                    'w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 group',
                    isActive
                      ? 'bg-primary/10 text-primary dark:text-primary-300 border border-primary/20'
                      : 'hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-navy-700 group-hover:text-navy-950 dark:group-hover:text-white'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p
                        className={cn(
                          'text-xs font-bold leading-tight',
                          isActive ? 'text-primary dark:text-primary-300' : 'text-navy-950 dark:text-white'
                        )}
                      >
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight mt-0.5 font-normal">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {isActive && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
                </button>
              );
            })}

            {/* If currently authenticated, show option to return to Visitor / Guest */}
            {isAuthenticated && (
              <div className="pt-1.5 mt-1.5 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  disabled={isSwitching}
                  onClick={handleSwitchToVisitor}
                  className="w-full flex items-center gap-3 p-2 rounded-xl text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Kembali ke Visitor</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Keluar sesi & mode publik</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

