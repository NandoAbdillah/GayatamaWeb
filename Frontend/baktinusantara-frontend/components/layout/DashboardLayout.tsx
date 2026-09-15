'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NotificationCenter } from '@/components/ui/NotificationCenter';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Sprout } from 'lucide-react';

export const DashboardLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({
  children,
  title,
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] flex flex-col font-jakarta transition-colors duration-200">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-navy-950/95 backdrop-blur-md border-b border-slate-200 dark:border-navy-800 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-epilogue font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
                <Sprout className="w-4 h-4 text-white" />
              </div>
              <span className="font-epilogue font-bold text-navy-950 dark:text-white text-base hidden sm:inline">
                BaktiNusantara
              </span>
            </Link>
            {title && (
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 pl-4 border-l border-slate-200 dark:border-navy-800">
                <span className="font-medium text-navy-900 dark:text-slate-200">{title}</span>
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
      <div className="flex-1 max-w-7xl w-full mx-auto flex items-start">
        <Sidebar />
        {/* Spacer agar konten tidak tertutup sidebar fixed */}
        <div className="hidden lg:block w-64 shrink-0" aria-hidden />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
