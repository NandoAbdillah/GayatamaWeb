'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import {
  Compass,
  MapPin,
  MessageSquare,
  Search,
  LogIn,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'mahasiswa':
        return '/mahasiswa/dashboard';
      case 'perangkat_desa':
        return '/perangkat-desa/dashboard';
      case 'dosen':
        return '/dosen/dashboard';
      case 'universitas':
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/mahasiswa/dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 py-3 transition-all duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-md rounded-full px-5 py-2.5 border border-slate-200/90 shadow-ambient">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-400 flex items-center justify-center text-white font-epilogue font-bold text-lg shadow-glow-primary group-hover:scale-105 transition-transform">
              BN
            </div>
            <div className="flex flex-col">
              <span className="font-epilogue font-extrabold text-navy-950 text-base leading-tight tracking-tight flex items-center gap-1.5">
                BaktiNusantara
                <span className="inline-flex items-center gap-0.5 text-[10px] font-jakarta font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                  <Sparkles className="w-2.5 h-2.5" /> KKN
                </span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Kolaborasi Mahasiswa & Desa Mandiri
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/search"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium text-navy-800 hover:text-primary hover:bg-surface-subtle transition-colors"
            >
              <Search className="w-4 h-4 text-primary" />
              <span>Pos Kebutuhan</span>
            </Link>
            <Link
              href="/maps"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium text-navy-800 hover:text-primary hover:bg-surface-subtle transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Peta KKN</span>
            </Link>
            <Link
              href="/aspirasi"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium text-navy-800 hover:text-primary hover:bg-surface-subtle transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-tertiary-600" />
              <span>Aspirasi Warga</span>
            </Link>
          </nav>

          {/* Right Action & Auth */}
          <div className="hidden lg:flex items-center gap-3">
            <RoleSwitcher />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href={getDashboardLink()}>
                  <Button size="sm" variant="primary" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Portal Saya</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="primary">
                    Daftar KKN
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-navy-800 hover:bg-surface-subtle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 bg-white/95 backdrop-blur-lg rounded-3xl border border-slate-200 shadow-ambient-lg flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
            <RoleSwitcher className="w-full justify-center overflow-x-auto" />
            <div className="h-px bg-slate-100 my-1" />
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-navy-900 hover:bg-surface-subtle"
            >
              <Search className="w-4 h-4 text-primary" /> Pos Kebutuhan KKN
            </Link>
            <Link
              href="/maps"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-navy-900 hover:bg-surface-subtle"
            >
              <MapPin className="w-4 h-4 text-emerald-600" /> Peta Sebaran Desa
            </Link>
            <Link
              href="/aspirasi"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-navy-900 hover:bg-surface-subtle"
            >
              <MessageSquare className="w-4 h-4 text-tertiary-600" /> Aspirasi Warga Desa
            </Link>
            <div className="h-px bg-slate-100 my-1" />
            {isAuthenticated ? (
              <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full" variant="primary">
                  Buka Portal ({user?.name})
                </Button>
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Daftar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
