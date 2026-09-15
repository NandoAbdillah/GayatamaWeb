'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { useNotifikasi } from '@/hooks/use-notifikasi';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  Check,
  CheckCheck,
  Sparkles,
  Info,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Loader2,
  ArrowLeft,
  RefreshCw,
  BellRing,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refetch } = useNotifikasi();
  const {
    isSupported,
    permission,
    isSubscribed,
    activeSubscription,
    isLoading: isPushLoading,
    error: pushError,
    subscribe,
  } = usePushNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsPwaInstalled(isStandalone);

      const handleBeforeInstall = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      window.addEventListener('appinstalled', () => {
        setIsPwaInstalled(true);
        setDeferredPrompt(null);
      });

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      setFeedback({
        type: 'info',
        text: 'Untuk menginstal PWA di Chrome/Brave: Klik ikon Install (📥) di ujung kanan address bar atas atau menu Chrome (⋮) -> "Save and share" -> "Install BaktiNusantara Gayatama".',
      });
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsPwaInstalled(true);
      setFeedback({
        type: 'success',
        text: 'Aplikasi desktop PWA BaktiNusantara berhasil diinstal!',
      });
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'unread') return !notif.is_read;
    return true;
  });

  const handleEnablePush = async () => {
    setFeedback(null);
    const result = await subscribe();
    if (result.success) {
      setFeedback({
        type: 'success',
        text: 'Desktop notifications berhasil diaktifkan! Anda sekarang dapat menerima notifikasi saat tab atau browser ditutup.',
      });
      refetch();
    } else {
      setFeedback({
        type: 'error',
        text: result.error || 'Gagal mengaktifkan notifikasi desktop. Periksa izin di browser Anda.',
      });
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: idLocale,
      });
    } catch {
      return 'baru saja';
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] font-jakarta transition-colors duration-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 hover:text-navy-950 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
          <span>/</span>
          <span className="text-navy-950 dark:text-slate-200">Pusat Notifikasi</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-navy-800">
          <div>
            <h1 className="font-epilogue font-extrabold text-2xl sm:text-3xl text-navy-950 dark:text-white tracking-tight">
              Pusat Notifikasi
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Kelola seluruh notifikasi in-app dan pemberitahuan browser/OS secara terpadu.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => refetch()}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
              title="Perbarui notifikasi"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-300 text-xs font-bold transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
          </div>
        </div>

        {/* PWA Desktop App Installation Banner */}
        <div className="my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-navy-900 dark:via-navy-900/60 dark:to-transparent border border-primary/20 dark:border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-epilogue font-bold text-sm text-navy-950 dark:text-white">
                  Aplikasi Desktop Windows (PWA)
                </h4>
                {isPwaInstalled ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    🟢 Terinstal
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary dark:text-primary-300">
                    Siap Diinstal
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {isPwaInstalled
                  ? 'BaktiNusantara berjalan dalam mode aplikasi desktop mandiri.'
                  : 'Instal sebagai aplikasi desktop Windows mandiri untuk pengalaman notifikasi latar belakang terbaik.'}
              </p>
            </div>
          </div>

          {!isPwaInstalled && (
            <button
              type="button"
              onClick={handleInstallPWA}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Install Aplikasi Desktop</span>
            </button>
          )}
        </div>

        {/* Notification Settings / Desktop Notifications Card */}
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span>Notification Settings & Web Push</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Status Izin:</span>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-[11px] font-bold',
                  permission === 'granted'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : permission === 'denied'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                )}
              >
                {permission === 'granted' ? 'Allowed (Diizinkan)' : permission === 'denied' ? 'Blocked (Diblokir)' : 'Default (Belum Diatur)'}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="flex items-start gap-3.5">
              <div
                className={cn(
                  'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5',
                  isSubscribed
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400'
                )}
              >
                <BellRing className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-epilogue font-bold text-base text-navy-950 dark:text-white">
                    Desktop Notifications
                  </h3>
                  {isSubscribed ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Web Push Aktif & Siap
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-400">
                      Belum Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                  Terima notifikasi resmi Gayatama langsung di desktop/Windows meskipun tab atau jendela browser sedang ditutup.
                </p>
                {isSubscribed && activeSubscription && (
                  <div className="mt-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {activeSubscription.endpoint.includes('fcm')
                        ? 'Google FCM'
                        : activeSubscription.endpoint.includes('mozilla')
                        ? 'Mozilla Push'
                        : 'Web Push Service'}
                    </span>
                    <span className="truncate max-w-md opacity-80" title={activeSubscription.endpoint}>
                      {activeSubscription.endpoint.substring(0, 50)}...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Buttons: Activate Notifications & Test */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {permission === 'default' && (
                <button
                  type="button"
                  onClick={handleEnablePush}
                  disabled={isPushLoading}
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isPushLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <BellRing className="w-4 h-4" />
                  )}
                  <span>🔔 Minta Izin & Aktifkan Notifikasi</span>
                </button>
              )}

              {permission === 'granted' && !isSubscribed && (
                <button
                  type="button"
                  onClick={handleEnablePush}
                  disabled={isPushLoading}
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isPushLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>⚡ Hubungkan Web Push</span>
                </button>
              )}

              {isSubscribed && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/70 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Notifikasi Desktop Aktif</span>
                </div>
              )}
            </div>
          </div>

          {/* Denied Permission Unblock Helper Guide */}
          {permission === 'denied' && (
            <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs animate-in fade-in duration-150 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300 text-sm">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Izin Notifikasi Sedang Diblokir Browser</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Browser menolak permintaan izin otomatis karena status izin untuk <b>localhost:3000</b> saat ini disetel ke <b>Block (Tolak)</b>. Silakan ikuti langkah berikut untuk membukanya:
              </p>
              <div className="bg-white/80 dark:bg-navy-900/80 p-3 rounded-lg border border-rose-200/60 dark:border-rose-900/60 space-y-1.5 font-medium text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <span>Klik ikon gembok 🔒 atau ikon <i>Site Information / Setelan Situs</i> di sebelah kiri <b>localhost:3000</b> pada URL address bar atas.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <span>Pada baris <b>Notifications / Notifikasi</b>, ubah dari <b>Block (Tolak)</b> menjadi <b>Allow (Izinkan)</b>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  <span>Klik tombol <b>"Cek Ulang Izin Notifikasi"</b> di bawah ini.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    await handleEnablePush();
                  }}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>🔄 Cek Ulang Izin Notifikasi</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback & Error Banner */}
          {feedback && (
            <div
              className={cn(
                'p-3.5 rounded-xl text-xs font-medium border flex items-start gap-2.5 animate-in fade-in duration-150',
                feedback.type === 'success' && 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
                feedback.type === 'error' && 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300',
                feedback.type === 'info' && 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
              )}
            >
              {feedback.type === 'success' && <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {feedback.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              {feedback.type === 'info' && <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
              <div className="flex-1 leading-relaxed">{feedback.text}</div>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between gap-4 my-6">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-bold transition-all',
                activeTab === 'all'
                  ? 'bg-white dark:bg-navy-800 text-navy-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-navy-950 dark:hover:text-white'
              )}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
                activeTab === 'unread'
                  ? 'bg-white dark:bg-navy-800 text-navy-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-navy-950 dark:hover:text-white'
              )}
            >
              <span>Belum Dibaca</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-primary text-white text-[10px] rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-navy-900 rounded-2xl border border-slate-200/80 dark:border-navy-800">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-epilogue font-bold text-base text-navy-950 dark:text-white">
                {activeTab === 'unread'
                  ? 'Tidak ada notifikasi yang belum dibaca'
                  : 'Belum ada notifikasi'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {activeTab === 'unread'
                  ? 'Semua notifikasi Anda sudah dibaca.'
                  : 'Notifikasi tentang progres KKN, proposal, dan verifikasi akan tampil di sini.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = !notif.is_read;
              return (
                <div
                  key={notif.id}
                  onClick={async () => {
                    if (isUnread) await markAsRead(notif.id);
                    if (notif.action_url) router.push(notif.action_url);
                  }}
                  className={cn(
                    'p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 group relative',
                    isUnread
                      ? 'bg-white dark:bg-navy-900 border-primary/30 shadow-xs ring-1 ring-primary/10'
                      : 'bg-white/80 dark:bg-navy-900/60 border-slate-200/80 dark:border-navy-800/80 hover:bg-white dark:hover:bg-navy-900 opacity-90'
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                      notif.type === 'success' && 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
                      notif.type === 'warning' && 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
                      notif.type === 'info' && 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300',
                      (!notif.type || notif.type === 'default') && 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400'
                    )}
                  >
                    {notif.type === 'success' && <Sparkles className="w-5 h-5" />}
                    {notif.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                    {(notif.type === 'info' || !notif.type) && <Info className="w-5 h-5" />}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4
                          className={cn(
                            'text-sm leading-snug',
                            isUnread
                              ? 'font-bold text-navy-950 dark:text-white'
                              : 'font-semibold text-slate-700 dark:text-slate-300'
                          )}
                        >
                          {notif.title}
                        </h4>
                        {isUnread && (
                          <span
                            className="w-2 h-2 rounded-full bg-primary shrink-0"
                            title="Belum dibaca"
                          />
                        )}
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                        {formatTimestamp(notif.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-navy-800/60 text-xs">
                      {notif.action_url ? (
                        <span className="inline-flex items-center gap-1 font-bold text-primary dark:text-primary-400 group-hover:underline">
                          <span>Buka Halaman Terkait</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span />
                      )}

                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.id);
                          }}
                          className="text-[11px] font-semibold text-slate-400 hover:text-navy-950 dark:hover:text-white transition-colors"
                        >
                          Tandai sudah dibaca
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
