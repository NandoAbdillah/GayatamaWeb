'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NotificationCenter } from '@/components/ui/NotificationCenter';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { PanelLeftClose, Loader2 } from 'lucide-react';

export const DashboardLayout: React.FC<{
  children: React.ReactNode;
  title?: string;
  breadcrumb?: { label: string; href?: string }[];
}> = ({ children, title, breadcrumb }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Client-side authentication guard for visitors / unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname || '/')}`;
      router.replace(loginUrl);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Persist collapsed state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) setCollapsed(saved === 'true');
  }, []);
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] flex items-center justify-center font-jakarta">
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-xs font-semibold">Memverifikasi otentikasi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] flex flex-col font-jakarta transition-colors duration-200">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-navy-950/95 backdrop-blur-md border-b border-slate-200 dark:border-navy-800 px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 relative flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src="/logo.svg"
                  alt="BaktiNusantara Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain drop-shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-epilogue font-bold text-navy-950 dark:text-white text-base leading-tight hidden sm:inline">
                  BaktiNusantara
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                  Sistem Informasi KKN & Pengabdian
                </span>
              </div>
            </Link>
            {title && (
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pl-4 border-l border-slate-200 dark:border-navy-800">
                <span className="font-bold text-navy-900 dark:text-slate-200">{title}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <RoleSwitcher />

            {/* Interactive Notification Center */}
            <NotificationCenter />
          </div>
        </div>
      </header>

      {/* Main App Canvas */}
      <div className="flex flex-1 w-full items-start">
        <Sidebar collapsed={collapsed} onExpand={() => setCollapsed(false)} />
        {/* Spacer agar konten tidak tertutup sidebar fixed - sinkron halus dengan sidebar */}
        <div
          className={`hidden lg:block shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'w-[72px]' : 'w-64'}`}
          aria-hidden
        />
        <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 lg:pl-10">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium" aria-label="Breadcrumb">
              <Link href={user?.role === 'universitas' ? '/kampus/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/'} className="hover:text-primary transition-colors">
                {user?.role === 'universitas' ? 'Portal Kampus' : user?.role === 'admin' ? 'Portal Admin' : 'Portal'}
              </Link>
              {breadcrumb.map((item, idx) => (
                <React.Fragment key={idx}>
                  <span>/</span>
                  {item.href ? (
                    <Link href={item.href} className="hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-navy-950 dark:text-white font-semibold">{item.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          {children}
        </main>
      </div>

      {/* Backdrop untuk mobile - tutup sidebar saat klik di luar */}
      {!collapsed && (
        <div
          className="fixed inset-0 top-[61px] bg-black/40 backdrop-blur-sm z-10 lg:hidden"
          onClick={() => setCollapsed(true)}
          aria-hidden
        />
      )}

      {/* Toggle button di perbatasan garis sidebar - menempel rapi tanpa menutupi konten */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
        title={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
        className={`flex fixed top-[76px] left-0 z-30 w-7 h-7 items-center justify-center rounded-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 hover:text-navy-900 dark:hover:text-white will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          collapsed ? 'translate-x-[12px] lg:translate-x-[58px]' : 'translate-x-[242px]'
        }`}
      >
        <PanelLeftClose
          className={`w-4 h-4 shrink-0 will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>
    </div>
  );
};
