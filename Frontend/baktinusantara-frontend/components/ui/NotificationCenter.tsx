'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifikasi } from '@/hooks/use-notifikasi';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Sparkles,
  Info,
  AlertTriangle,
  Send,
  ExternalLink,
  ShieldAlert,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function NotificationCenter({ className = '' }: { className?: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, refetch } = useNotifikasi();
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading: isPushLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: (typeof notifications)[0]) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.action_url) {
      router.push(notif.action_url);
    }
  };

  const handleEnablePush = async () => {
    setFeedbackMessage(null);
    const result = await subscribe();
    if (result.success) {
      setFeedbackMessage('Notifikasi desktop berhasil diaktifkan!');
      setTimeout(() => setFeedbackMessage(null), 4000);
      refetch();
    } else {
      setFeedbackMessage(result.error || 'Gagal mengaktifkan notifikasi. Silakan cek izin browser.');
      setTimeout(() => setFeedbackMessage(null), 6000);
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
    <div className={cn('relative inline-block text-left font-jakarta', className)} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifikasi"
        className={cn(
          'relative p-2 rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20',
          isOpen
            ? 'bg-primary/10 text-primary border-primary/30 dark:bg-primary/20 dark:text-primary-300'
            : 'text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200/80 dark:bg-navy-900 dark:hover:bg-navy-800 border-slate-200/80 dark:border-navy-700'
        )}
        title="Pusat Notifikasi"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-navy-950 animate-in zoom-in-75 duration-150">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Center Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-2xl bg-white dark:bg-navy-900 shadow-2xl ring-1 ring-slate-900/10 dark:ring-black/40 border border-slate-100 dark:border-navy-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between bg-slate-50/50 dark:bg-navy-950/40">
            <div className="flex items-center gap-2">
              <span className="font-epilogue font-bold text-sm text-navy-950 dark:text-white">
                Notifikasi
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-primary/10 text-primary dark:text-primary-300 rounded-full">
                  {unreadCount} baru
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-primary hover:text-primary-600 dark:text-primary-400 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
          </div>

          {/* Web Push Status / Permission Banner */}
          <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950/80 border-b border-slate-100 dark:border-navy-800/80">
            {permission === 'denied' ? (
              <div className="flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Izin Notifikasi Diblokir</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Aktifkan izin notifikasi pada pengaturan browser untuk menerima pemberitahuan di desktop.
                  </p>
                </div>
              </div>
            ) : isSubscribed ? (
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Notifikasi Desktop Aktif</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Web Push
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-navy-950 dark:text-white block">
                    Desktop Notifications
                  </span>
                  <span>Terima alert saat ada pembaruan</span>
                </div>
                <button
                  type="button"
                  onClick={handleEnablePush}
                  disabled={isPushLoading}
                  className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 active:scale-95"
                >
                  {isPushLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <BellRing className="w-3.5 h-3.5" />
                  )}
                  <span>Aktifkan Notifikasi</span>
                </button>
              </div>
            )}

            {/* Feedback notification message */}
            {feedbackMessage && (
              <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                {feedbackMessage}
              </div>
            )}
          </div>

          {/* Notifications Scrollable List */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100 dark:divide-navy-800/60">
            {notifications.length === 0 ? (
              <div className="py-10 text-center px-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-slate-400 mx-auto mb-2">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-navy-950 dark:text-white">
                  Belum ada notifikasi
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Notifikasi penting terkait proposal, logbook, dan verifikasi akan muncul di sini.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.is_read;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      'p-3.5 hover:bg-slate-50 dark:hover:bg-navy-800/60 transition-colors cursor-pointer flex items-start gap-3 group relative',
                      isUnread && 'bg-primary/[0.03] dark:bg-primary/[0.06]'
                    )}
                  >
                    {/* Icon Avatar */}
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                        notif.type === 'success' && 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
                        notif.type === 'warning' && 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
                        notif.type === 'info' && 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300',
                        (!notif.type || notif.type === 'default') && 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400'
                      )}
                    >
                      {notif.type === 'success' && <Sparkles className="w-4 h-4" />}
                      {notif.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                      {(notif.type === 'info' || !notif.type) && <Info className="w-4 h-4" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <p
                          className={cn(
                            'text-xs leading-snug truncate',
                            isUnread
                              ? 'font-bold text-navy-950 dark:text-white'
                              : 'font-semibold text-slate-700 dark:text-slate-300'
                          )}
                        >
                          {notif.title}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                        <span>{formatTimestamp(notif.created_at)}</span>
                        {notif.action_url && (
                          <span className="flex items-center gap-0.5 text-primary dark:text-primary-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Buka</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Footer: View all notifications */}
          <div className="p-2 border-t border-slate-100 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/70 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/notifications');
              }}
              className="w-full py-2 px-3 text-xs font-bold text-primary hover:text-primary-600 dark:text-primary-400 hover:bg-primary/10 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Lihat semua notifikasi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
