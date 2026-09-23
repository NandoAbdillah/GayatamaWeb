import apiClient from '@/lib/api-client';
import { NotificationItem } from '@/lib/types';

export const notificationService = {
  /**
   * Get notifications for authenticated user directly from Laravel backend
   * Endpoint: GET /api/notifikasi
   */
  async getAll(userId?: number | string, unreadOnly = false): Promise<NotificationItem[]> {
    try {
      const res = await apiClient.get<NotificationItem[] | { data: NotificationItem[] }>('/api/notifikasi', {
        params: {
          user_id: userId,
          unread: unreadOnly ? 1 : undefined,
        },
      });

      if (Array.isArray(res.data)) {
        return res.data;
      }
      if (Array.isArray((res.data as any)?.data)) {
        return (res.data as any).data;
      }
      return [];
    } catch (err) {
      console.warn('Could not fetch notifications from Laravel backend:', err);
      return [];
    }
  },

  /**
   * Mark a single notification as read
   * Endpoint: PATCH /api/notifikasi/{id}/read
   */
  async markAsRead(id: number | string): Promise<{ message: string }> {
    try {
      const res = await apiClient.patch<{ message: string }>(`/api/notifikasi/${id}/read`);
      return res.data;
    } catch (err: any) {
      return { message: err?.response?.data?.message || err?.message || 'Error' };
    }
  },

  /**
   * Mark all notifications as read
   * Endpoint: PATCH /api/notifikasi/read-all
   */
  async markAllAsRead(userId?: number | string): Promise<{ message: string }> {
    try {
      const res = await apiClient.patch<{ message: string }>('/api/notifikasi/read-all', {
        user_id: userId,
      });
      return res.data;
    } catch (err: any) {
      return { message: err?.response?.data?.message || err?.message || 'Error' };
    }
  },

  /**
   * Create a new notification directly in MySQL via Laravel backend
   * Endpoint: POST /api/notifikasi
   */
  async createNotification(payload: {
    user_id: number;
    title: string;
    message: string;
    type?: string;
    action_url?: string;
  }): Promise<NotificationItem> {
    const res = await apiClient.post<{ data: NotificationItem }>('/api/notifikasi', payload);
    return res.data.data;
  },
};

export default notificationService;
