'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import {
  Sprout,
  LayoutDashboard,
  Menu,
  X,
  Compass,
  MapPin,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');

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

  const navLinks = [
    { href: '/katalog', label: t('katalog'), icon: Compass },
    { href: '/maps', label: t('maps'), icon: MapPin },
    { href: '/aspirasi', label: t('aspirasi'), icon: MessageSquare },
    { href: '/portofolio/kelompok-14-sukamaju', label: t('portofolio'), icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-navy-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-navy-800 transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand (Farmvest / IKN Style) */}
          <Link href="/" className="flex items-center gap-3.5 shrink-0 group">
            <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-epilogue font-extrabold text-navy-950 dark:text-white text-xl leading-none tracking-tight">
                {tCommon('appName')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium font-jakarta mt-1 tracking-wide">
                {tCommon('appTagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Center Navigation Links - Spacious & Clean */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[14px] font-semibold font-jakarta whitespace-nowrap transition-colors duration-150 relative py-2 ${
                    isActive
                      ? 'text-primary dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-navy-950 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action & Controls (Farmvest Style + Dark Mode + Language Switcher) */}
          <div className="hidden sm:flex items-center gap-2.5 lg:gap-3 shrink-0">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* Quick Demo Switcher Dropdown */}
            <RoleSwitcher />

            <div className="h-6 w-px bg-slate-200 dark:bg-navy-800 mx-0.5" />

            {isAuthenticated ? (
              <Link href={getDashboardLink()}>
                <Button size="md" variant="primary" className="gap-2 font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow-md">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t('dashboard')}</span>
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login">
                  <Button size="sm" variant="ghost" className="text-xs font-bold text-navy-950 dark:text-slate-200 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-navy-900">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="primary" className="text-xs font-bold px-4 py-2 rounded-xl shadow-sm">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button & Theme Toggle on mobile */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-navy-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-900 border border-slate-200 dark:border-navy-800 transition-colors"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 px-6 pt-4 pb-6 space-y-4 font-jakarta shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Peran Demo</span>
            <RoleSwitcher />
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    isActive
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300 font-bold'
                      : 'text-navy-950 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-navy-800">
            {isAuthenticated ? (
              <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center gap-2" variant="primary">
                  <LayoutDashboard className="w-4 h-4" />
                  Buka Portal ({user?.name})
                </Button>
              </Link>
            ) : (
              <div className="flex gap-2.5">
                <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center text-xs font-bold dark:border-navy-700 dark:text-slate-200">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center text-xs font-bold">
                    Daftar KKN
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
