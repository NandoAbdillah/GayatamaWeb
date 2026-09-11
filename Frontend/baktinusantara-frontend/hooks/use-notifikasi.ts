'use client';

import { useState, useEffect, useCallback } from 'react';
import notificationService from '@/lib/services/notification.service';
import { NotificationItem } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export function useNotifikasi(pollIntervalMs: number = 10000) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      const data = await notificationService.getAll(user.id);
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat notifikasi.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    if (pollIntervalMs && pollIntervalMs > 0) {
      const interval = setInterval(fetchNotifications, pollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, pollIntervalMs]);

  // Listen for push notifications received in Service Worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleSwMessage = (event: MessageEvent) => {
      if (
        event.data?.type === 'GAYATAMA_PUSH_RECEIVED' ||
        event.data?.type === 'GAYATAMA_NOTIFICATION_CLICKED'
      ) {
        fetchNotifications();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleSwMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    };
  }, [fetchNotifications]);

  const markAsRead = async (id: number | string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (String(n.id) === String(id) ? { ...n, is_read: true } : n))
    );
    try {
      await notificationService.markAsRead(id);
    } catch {
      // Keep optimistic
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await notificationService.markAllAsRead(user?.id);
    } catch {
      // Keep optimistic
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
