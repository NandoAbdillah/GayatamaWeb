import apiClient from '@/lib/api-client';
import { NotificationItem } from '@/lib/types';

export const notificationService = {
  /**
   * Get notifications for authenticated user
   * Endpoint: GET /api/notifikasi
   */
  async getAll(unreadOnly = false): Promise<NotificationItem[]> {
    const res = await apiClient.get<NotificationItem[] | { data: NotificationItem[] }>('/api/notifikasi', {
      params: unreadOnly ? { unread: 1 } : undefined,
    });
    if (Array.isArray(res.data)) {
      return res.data;
    }
    return (res.data as any)?.data || [];
  },

  /**
   * Mark a single notification as read
   * Endpoint: PATCH /api/notifikasi/{id}/read
   */
  async markAsRead(id: number | string): Promise<{ message: string }> {
    const res = await apiClient.patch<{ message: string }>(`/api/notifikasi/${id}/read`);
    return res.data;
  },

  /**
   * Mark all notifications as read
   * Endpoint: PATCH /api/notifikasi/read-all
   */
  async markAllAsRead(): Promise<{ message: string }> {
    const res = await apiClient.patch<{ message: string }>('/api/notifikasi/read-all');
    return res.data;
  },
};

export default notificationService;
