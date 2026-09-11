import webpush from 'web-push';
import { NotificationItem } from '@/lib/types';

export interface StoredPushSubscription {
  id: string;
  user_id: number | string;
  role?: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

// Global persistent in-memory store across Next.js dev server hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var __gayatama_push_subscriptions__: StoredPushSubscription[] | undefined;
  // eslint-disable-next-line no-var
  var __gayatama_notifications__: NotificationItem[] | undefined;
}

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BGHxRpbw6tkPk01tgL65p2ThaT3zrzwRtnlSWbK6lJZC51GdYf2CdY-rrI0ol_SbhTjTeiUElZ0yeBpvQEENa1Y';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || 'bLFQtbjHSSzDYN9Lbuvi60S4tYlAnoWIbljgpBPCWCg';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@gayatama.univ.ac.id';

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
  console.warn('Failed to set VAPID details:', e);
}

if (!global.__gayatama_push_subscriptions__) {
  global.__gayatama_push_subscriptions__ = [];
}

if (!global.__gayatama_notifications__) {
  global.__gayatama_notifications__ = [
    {
      id: 1,
      user_id: 101, // Mahasiswa
      title: 'Proposal KKN Disetujui',
      message: 'Proposal KKN Kelompok 14 telah disahkan oleh Dr. Ir. Hendra Gunawan (Dosen DPL).',
      type: 'success',
      is_read: false,
      action_url: '/mahasiswa/proposal',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      user_id: 101, // Mahasiswa
      title: 'Pengingat Logbook Mingguan',
      message: 'Batas akhir pengunggahan logbook progres minggu ke-4 adalah hari Minggu.',
      type: 'info',
      is_read: false,
      action_url: '/mahasiswa/progress',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 3,
      user_id: 201, // Perangkat Desa
      title: 'Pengajuan Proposal KKN Baru',
      message: 'Kelompok 14 telah mengajukan proposal program kerja Digitalisasi UMKM.',
      type: 'info',
      is_read: false,
      action_url: '/perangkat-desa/proposal',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 4,
      user_id: 301, // Dosen
      title: 'Logbook Mahasiswa Masuk',
      message: 'M. Rian Pratama mengunggah logbook minggu ke-4 yang memerlukan review.',
      type: 'info',
      is_read: false,
      action_url: '/dosen/logbook',
      created_at: new Date(Date.now() - 10800000).toISOString(),
    },
  ];
}

export const pushStore = {
  getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY;
  },

  /**
   * Save or update push subscription for a user
   */
  saveSubscription(
    userId: number | string,
    subscriptionData: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
      role?: string;
      user_agent?: string;
    }
  ): StoredPushSubscription {
    const list = global.__gayatama_push_subscriptions__ || [];
    const normalizedUserId = String(userId);

    // Check if this endpoint is already registered
    const existingIndex = list.findIndex(
      (s) => s.endpoint === subscriptionData.endpoint
    );

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        user_id: normalizedUserId,
        role: subscriptionData.role || list[existingIndex].role,
        keys: subscriptionData.keys,
        user_agent: subscriptionData.user_agent || list[existingIndex].user_agent,
        updated_at: now,
      };
      global.__gayatama_push_subscriptions__ = list;
      return list[existingIndex];
    }

    const newSub: StoredPushSubscription = {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      user_id: normalizedUserId,
      role: subscriptionData.role || 'mahasiswa',
      endpoint: subscriptionData.endpoint,
      keys: subscriptionData.keys,
      user_agent: subscriptionData.user_agent,
      created_at: now,
      updated_at: now,
    };

    list.push(newSub);
    global.__gayatama_push_subscriptions__ = list;
    return newSub;
  },

  /**
   * Remove subscription
   */
  removeSubscription(userId: number | string, endpoint: string): boolean {
    const list = global.__gayatama_push_subscriptions__ || [];
    const initialLen = list.length;
    global.__gayatama_push_subscriptions__ = list.filter(
      (s) => !(String(s.user_id) === String(userId) && s.endpoint === endpoint)
    );
    return (global.__gayatama_push_subscriptions__?.length || 0) < initialLen;
  },

  /**
   * Get all subscriptions for a specific user ID
   */
  getUserSubscriptions(userId: number | string): StoredPushSubscription[] {
    const list = global.__gayatama_push_subscriptions__ || [];
    const matched = list.filter((s) => String(s.user_id) === String(userId));
    if (matched.length > 0) return matched;
    // Fallback in demo environment: if there is any active subscription registered in this session
    if (list.length === 1) return list;
    return list.filter((s) => String(s.user_id) === '101' || String(s.user_id) === '1');
  },

  /**
   * Get all notifications for user
   */
  getUserNotifications(userId: number | string): NotificationItem[] {
    const list = global.__gayatama_notifications__ || [];
    const normalizedUserId = Number(userId) || 101;
    return list
      .filter((n) => n.user_id === normalizedUserId || n.user_id === 1)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  /**
   * Create a new notification record in database
   */
  createNotification(item: {
    user_id: number;
    title: string;
    message: string;
    type?: string;
    action_url?: string;
  }): NotificationItem {
    const list = global.__gayatama_notifications__ || [];
    const newNotif: NotificationItem = {
      id: Date.now(),
      user_id: Number(item.user_id),
      title: item.title,
      message: item.message,
      type: item.type || 'info',
      action_url: item.action_url || '/',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    list.unshift(newNotif);
    global.__gayatama_notifications__ = list;
    return newNotif;
  },

  /**
   * Mark single notification as read
   */
  markAsRead(id: number | string): boolean {
    const list = global.__gayatama_notifications__ || [];
    const notif = list.find((n) => String(n.id) === String(id));
    if (notif) {
      notif.is_read = true;
      return true;
    }
    return false;
  },

  /**
   * Mark all notifications for user as read
   */
  markAllAsRead(userId: number | string): number {
    const list = global.__gayatama_notifications__ || [];
    const normalizedUserId = Number(userId) || 101;
    let count = 0;
    list.forEach((n) => {
      if ((n.user_id === normalizedUserId || n.user_id === 1) && !n.is_read) {
        n.is_read = true;
        count++;
      }
    });
    return count;
  },

  /**
   * Send Web Push to all active subscriptions of user, with automatic cleanup of expired/invalid subscriptions
   */
  async sendPushToUser(
    userId: number | string,
    payload: {
      title: string;
      message: string;
      url: string;
      id?: number;
      type?: string;
    }
  ): Promise<{ sent: number; failed: number; cleaned: number }> {
    const subscriptions = this.getUserSubscriptions(userId);
    let sent = 0;
    let failed = 0;
    let cleaned = 0;

    const nowUnix = Date.now();
    const nowIso = new Date().toISOString();

    const payloadString = JSON.stringify({
      title: payload.title,
      message: payload.message,
      url: payload.url,
      id: payload.id,
      type: payload.type || 'info',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      sent_at_unix: nowUnix,
      sent_at_iso: nowIso,
      timestamp: nowUnix,
    });

    const pushOptions: webpush.RequestOptions = {
      TTL: 86400, // 24 hours in FCM queue
      urgency: 'high', // RFC 8030 high priority wake-up signal
      headers: {
        Urgency: 'high',
      },
    };

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: sub.keys,
        };
        console.log(`[Web Push Server] [${nowIso}] Sending Web Push to FCM -> Endpoint: ${sub.endpoint.substring(0, 45)}...`);
        const res = await webpush.sendNotification(pushSubscription, payloadString, pushOptions);
        console.log(`[Web Push Server] [${nowIso}] FCM accepted message! HTTP ${res.statusCode} | Headers:`, res.headers);
        sent++;
      } catch (err: any) {
        failed++;
        console.error(`[Web Push Server] [${nowIso}] Push delivery failed to endpoint: ${sub.endpoint.substring(0, 45)}... | Status: ${err.statusCode || 'N/A'} | Error: ${err.message || err}`);
        // If subscription is 404 or 410 (expired/unsubscribed), remove it from store
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log(`[Web Push Server] Cleaning up expired/unsubscribed subscription for user ${userId}`);
          this.removeSubscription(userId, sub.endpoint);
          cleaned++;
        }
      }
    });

    await Promise.all(sendPromises);
    return { sent, failed, cleaned };
  },
};
