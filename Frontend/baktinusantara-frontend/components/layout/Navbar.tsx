'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { NotificationCenter } from '@/components/ui/NotificationCenter';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Home,
  Menu,
  X,
  Compass,
  MapPin,
  MessageSquare,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        return '/kampus/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  const navLinks = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/katalog', label: t('katalog'), icon: Compass },
    { href: '/maps', label: t('maps'), icon: MapPin },
    { href: '/aspirasi', label: t('aspirasi'), icon: MessageSquare },
    { href: '/portofolio/kelompok-14-sukamaju', label: t('portofolio'), icon: Sparkles },
  ];

  // Halaman peta (maps) memakai layout fullscreen dengan map sebagai background,
  // navbar harus selalu solid agar tidak transparan di atas peta
  const isMapsPage = pathname === '/maps' || pathname.startsWith('/maps');
  const useSolidNavbar = isScrolled || isMapsPage;

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-200 ${useSolidNavbar
          ? 'bg-white/95 dark:bg-navy-950/95 backdrop-blur-md border-slate-200/80 dark:border-navy-800 shadow-sm'
          : 'bg-white/80 dark:bg-navy-950/80 backdrop-blur-sm border-slate-200/50 dark:border-navy-800/50 shadow-none lg:bg-transparent lg:dark:bg-transparent lg:border-transparent lg:backdrop-blur-none lg:shadow-none'
        }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-8 w-full">
        <div className="flex items-center justify-between h-20 w-full">
          {/* Left Group: Brand + Desktop Nav Links */}
          <div className="flex items-center shrink-0">
            {/* Section 1: Brand (Logo + Text) */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-10 h-10 relative flex items-center justify-center shrink-0">
                <Image
                  src="/logo.svg"
                  alt={tCommon('appName')}
                  width={40}
                  height={40}
                  priority
                  className="w-10 h-10 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                />
              </div>
              <span className="font-epilogue font-extrabold text-navy-950 dark:text-white text-xl leading-none tracking-tight whitespace-nowrap">
                {tCommon('appName')}
              </span>
            </Link>

            {/* Section 2: Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-3.5 2xl:gap-6 ml-5 2xl:ml-8 shrink-0">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-[13px] 2xl:text-[14px] font-semibold font-jakarta whitespace-nowrap shrink-0 transition-colors duration-150 relative py-2 ${isActive
                        ? 'text-primary dark:text-primary-400 font-bold'
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
          </div>

          {/* Section 3: Right Action & Controls for Desktop (xl+) */}
          <div className="hidden xl:flex items-center gap-1.5 2xl:gap-2.5 shrink-0 ml-auto pl-3 2xl:pl-4">
            {/* Language Switcher */}
            <LanguageSwitcher className="min-w-[72px] justify-center shrink-0" />

            {/* Dark Mode Toggle */}
            <ThemeToggle className="shrink-0" />

            {/* Notification Center */}
            <NotificationCenter className="shrink-0" />

            {/* Quick Demo Switcher Dropdown */}
            <RoleSwitcher className="shrink-0" />

            <div className="h-5 w-px bg-slate-200 dark:bg-navy-800 mx-0.5 shrink-0" />

            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 2xl:gap-2 shrink-0">
                <Link href={getDashboardLink()} className="shrink-0">
                  <Button size="sm" variant="primary" className="h-9 gap-1.5 font-bold px-3 2xl:px-3.5 rounded-xl shadow-xs hover:shadow-sm text-xs whitespace-nowrap min-w-[95px] justify-center">
                    <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[90px]">Portal {user?.name ? user.name.split(' ')[0] : 'Dashboard'}</span>
                  </Button>
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    toast.success('Sesi berhasil keluar');
                  }}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200/80 dark:border-navy-700 transition-colors shrink-0"
                  title="Keluar Sesi"
                  aria-label="Keluar Sesi"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 2xl:gap-2 shrink-0">
                <Link href="/login" className="shrink-0">
                  <Button size="sm" variant="ghost" className="h-9 text-xs font-bold text-navy-950 dark:text-slate-200 px-3 hover:bg-slate-100 dark:hover:bg-navy-900 whitespace-nowrap min-w-[75px] justify-center">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/register" className="shrink-0">
                  <Button size="sm" variant="primary" className="h-9 text-xs font-bold px-3.5 2xl:px-4 rounded-xl shadow-xs whitespace-nowrap min-w-[85px] justify-center">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile/Tablet Controls & Menu Toggle (< xl) */}
          <div className="flex xl:hidden items-center gap-2 shrink-0 ml-auto">
            {/* Language switcher visible on tablet/mobile header */}
            <div className="hidden sm:inline-block">
              <LanguageSwitcher />
            </div>
            <ThemeToggle />
            {isAuthenticated && <NotificationCenter />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 inline-flex items-center justify-center rounded-xl text-navy-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-900 border border-slate-200/80 dark:border-navy-800 transition-colors shrink-0"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown - absolute overlay agar tidak mendorong layout peta & tidak ter-clip overflow-hidden */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 px-6 pt-4 pb-6 space-y-4 font-jakarta shadow-xl">
          <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-navy-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('switchRole')}</span>
              <RoleSwitcher />
            </div>
            {/* Language & Theme row in mobile */}
            <div className="flex sm:hidden items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bahasa / Language</span>
              <LanguageSwitcher />
            </div>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap ${isActive
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300 font-bold'
                      : 'text-navy-950 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-900'
                    }`}
                >
                  <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-navy-800">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center gap-2" variant="primary">
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    <span className="truncate">Portal {user?.name ? user.name.split(' ')[0] : 'Dashboard'}</span>
                  </Button>
                </Link>
                <Button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                    toast.success('Sesi berhasil keluar');
                  }}
                  variant="outline"
                  className="w-full justify-center gap-2 text-rose-600 border-rose-200 dark:border-rose-900 dark:text-rose-400"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2.5">
                <Link href="/login" className="flex-1 min-w-0" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center text-xs font-bold dark:border-navy-700 dark:text-slate-200 whitespace-nowrap">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/register" className="flex-1 min-w-0" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center text-xs font-bold whitespace-nowrap">
                    {t('register')}
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
