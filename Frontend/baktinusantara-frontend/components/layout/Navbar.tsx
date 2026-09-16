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
        return '/mahasiswa/dashboard';
    }
  };

  const navLinks = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/katalog', label: t('katalog'), icon: Compass },
    { href: '/maps', label: t('maps'), icon: MapPin },
    { href: '/aspirasi', label: t('aspirasi'), icon: MessageSquare },
    { href: '/portofolio/kelompok-14-sukamaju', label: t('portofolio'), icon: Sparkles },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-200 ${
        isScrolled
          ? 'bg-white/95 dark:bg-navy-950/95 backdrop-blur-md border-slate-200/80 dark:border-navy-800 shadow-sm'
          : 'bg-transparent dark:bg-transparent border-transparent backdrop-blur-none shadow-none'
      }`}
    >
      <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center h-20 gap-3 sm:gap-4 lg:gap-6">
          {/* Logo Brand (Farmvest / IKN Style) - fixed, never shrinks */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 relative flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shrink-0">
              <Image
                src="/logo.svg"
                alt={tCommon('appName')}
                width={44}
                height={44}
                priority
                className="w-11 h-11 object-contain drop-shadow-sm"
              />
            </div>
            <div className="flex flex-col justify-center items-center min-w-0 mt-3">
              <span className="font-epilogue font-extrabold text-navy-950 dark:text-white text-xl leading-none tracking-tight whitespace-nowrap justify-center ">
                {tCommon('appName')}
              </span>
            </div>
          </Link>

          {/* Desktop Center Navigation Links - flex-1 centered, stable width */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-5 xl:gap-7 min-w-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13px] xl:text-[14px] font-semibold font-jakarta whitespace-nowrap shrink-0 transition-colors duration-150 relative py-2 ${
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

          {/* Right Action & Controls - shrink-0, fixed layout to prevent shift on language change */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-2.5 shrink-0 ml-auto lg:ml-0">
            {/* Language Switcher - fixed min-width to avoid header jump IDN/ENG */}
            <LanguageSwitcher className="min-w-[78px] justify-center" />

            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* Notification Center */}
            <NotificationCenter />

            {/* Quick Demo Switcher Dropdown */}
            <RoleSwitcher />

            <div className="h-6 w-px bg-slate-200 dark:bg-navy-800 mx-0.5 shrink-0" />

            {isAuthenticated ? (
              <div className="flex items-center gap-2 shrink-0">
                <Link href={getDashboardLink()} className="shrink-0">
                  <Button size="md" variant="primary" className="gap-2 font-bold px-3.5 py-2 rounded-xl shadow-sm hover:shadow-md text-xs whitespace-nowrap min-w-[120px] justify-center">
                    <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[110px]">Portal {user?.name ? user.name.split(' ')[0] : 'Dashboard'}</span>
                  </Button>
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    toast.success('Sesi berhasil keluar');
                  }}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-navy-700 transition-colors shrink-0"
                  title="Keluar Sesi"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Link href="/login" className="shrink-0">
                  <Button size="sm" variant="ghost" className="text-xs font-bold text-navy-950 dark:text-slate-200 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-navy-900 whitespace-nowrap min-w-[96px] justify-center">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/register" className="shrink-0">
                  <Button size="sm" variant="primary" className="text-xs font-bold px-4 py-2 rounded-xl shadow-sm whitespace-nowrap min-w-[108px] justify-center">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button & controls on mobile/tablet */}
          <div className="flex lg:hidden items-center gap-2 shrink-0 ml-auto sm:ml-0">
            {/* Language switcher visible on very small screens where right group is hidden */}
            <div className="sm:hidden">
              <LanguageSwitcher />
            </div>
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-navy-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-900 border border-slate-200 dark:border-navy-800 transition-colors shrink-0"
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
          <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-navy-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('switchRole')}</span>
              <RoleSwitcher />
            </div>
            {/* Language & Theme row in mobile - hidden on sm because header already shows it */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bahasa / Language</span>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap ${
                    isActive
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
