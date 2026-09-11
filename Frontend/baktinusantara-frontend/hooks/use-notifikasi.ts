'use client';

import { useState, useEffect, useCallback } from 'react';
import notificationService from '@/lib/services/notification.service';
import { NotificationItem } from '@/lib/types';

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    user_id: 1,
    title: 'Proposal KKN Disetujui',
    message: 'Proposal kelompok Anda telah disetujui oleh Kepala Desa Sukamaju.',
    type: 'success',
    is_read: false,
    action_url: '/mahasiswa/proposal',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    user_id: 1,
    title: 'Pengingat Laporan Mingguan',
    message: 'Batas akhir pengumpulan laporan progres minggu ke-3 adalah hari Minggu.',
    type: 'info',
    is_read: false,
    action_url: '/mahasiswa/progress',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function useNotifikasi(pollIntervalMs?: number) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setNotifications(data);
      }
    } catch (err: any) {
      // ignore or fallback silently
      setError(err?.message || 'Gagal memuat notifikasi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    if (pollIntervalMs && pollIntervalMs > 0) {
      const interval = setInterval(fetchNotifications, pollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, pollIntervalMs]);

  const markAsRead = async (id: number) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await notificationService.markAsRead(id);
    } catch {
      // rollback or keep
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await notificationService.markAllAsRead();
    } catch {
      // rollback or keep
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}

export default useNotifikasi;
