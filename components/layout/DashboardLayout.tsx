'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Bell, Search, Sparkles } from 'lucide-react';

export const DashboardLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({
  children,
  title,
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col font-jakarta">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-epilogue font-bold text-sm shadow-glow-primary">
                BN
              </div>
              <span className="font-epilogue font-bold text-navy-950 text-base hidden sm:inline">
                BaktiNusantara
              </span>
            </Link>
            {title && (
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 pl-4 border-l border-slate-200">
                <span className="font-medium text-navy-900">{title}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <RoleSwitcher />

            {/* Notification Icon */}
            <button className="relative p-2 rounded-full text-slate-500 hover:text-navy hover:bg-surface-subtle transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            </button>
          </div>
        </div>
      </header>

      {/* Main App Canvas */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
