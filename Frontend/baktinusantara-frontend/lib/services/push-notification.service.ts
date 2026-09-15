'use client';

import axios from 'axios';

/**
 * Utility to convert VAPID public key base64 URL to Uint8Array for PushManager
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface PushNotificationPayload {
  userId: number | string;
  role?: string;
  title: string;
  message: string;
  url: string;
  type?: 'success' | 'info' | 'warning' | 'urgent' | string;
}

export class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;

  /**
   * Check if Web Push API and Service Workers are supported in the current browser
   */
  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  /**
   * Get current Notification permission
   */
  public getPermissionState(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Register the Gayatama Service Worker
   */
  public async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) return null;

    try {
      if (this.swRegistration) {
        return this.swRegistration;
      }

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      this.swRegistration = registration;
      await navigator.serviceWorker.ready;
      return registration;
    } catch (error) {
      console.error('Failed to register Service Worker for Push Notifications:', error);
      return null;
    }
  }

  /**
   * Fetch or retrieve the VAPID Public Key
   */
  public async getVapidPublicKey(): Promise<string> {
    const envKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (envKey) return envKey;

    try {
      const res = await axios.get<{ publicKey: string }>('/api/push/vapid-public-key');
      return res.data.publicKey;
    } catch (e) {
      console.warn('Could not fetch VAPID public key from backend API, using fallback:', e);
      return 'BGHxRpbw6tkPk01tgL65p2ThaT3zrzwRtnlSWbK6lJZC51GdYf2CdY-rrI0ol_SbhTjTeiUElZ0yeBpvQEENa1Y';
    }
  }

  /**
   * Get existing active PushSubscription from browser PushManager
   */
  public async getSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;

    try {
      const reg = await this.registerServiceWorker();
      if (!reg) return null;
      return await reg.pushManager.getSubscription();
    } catch (error) {
      console.error('[Push Client] Error reading PushSubscription:', error);
      return null;
    }
  }

  /**
   * Request Notification permission directly from browser with cross-browser compatibility
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      return Notification.permission;
    }

    try {
      return await Notification.requestPermission();
    } catch {
      return await new Promise<NotificationPermission>((resolve) => {
        Notification.requestPermission((res) => resolve(res));
      });
    }
  }

  /**
   * Request permission, create authentic PushSubscription with browser PushManager (FCM/WNS), and store in backend
   */
  public async subscribeUser(
    userId?: number | string,
    userRole?: string
  ): Promise<{ success: boolean; subscription?: PushSubscription; error?: string; permission?: NotificationPermission }> {
    if (!this.isSupported()) {
      return { success: false, error: 'Web Push tidak didukung oleh browser ini.' };
    }

    const effectiveUserId = userId || 101;
    const effectiveUserRole = userRole || 'mahasiswa';

    try {
      // 1. Request notification permission safely (supporting both Promise and Callback)
      let perm: NotificationPermission = this.getPermissionState();
      if (perm === 'default') {
        perm = await this.requestPermission();
      }

      if (perm !== 'granted') {
        if (perm === 'denied') {
          return {
            success: false,
            permission: 'denied',
            error:
              'Izin notifikasi diblokir oleh browser. Silakan klik ikon gembok 🔒 atau ikon perizinan di sebelah kiri URL address bar (localhost:3000), ubah "Notifications" menjadi "Allow" (Izinkan), lalu klik tombol "Cek Ulang Izin Notifikasi".',
          };
        }
        return {
          success: false,
          permission: 'default',
          error:
            'Permintaan izin notifikasi belum diizinkan. Silakan klik tombol "Minta Izin Notifikasi" kembali dan pilih "Allow / Izinkan" pada dialog browser.',
        };
      }

      // 2. Ensure Service Worker is ready
      const reg = await this.registerServiceWorker();
      if (!reg) {
        return { success: false, permission: 'granted', error: 'Gagal menginisialisasi Service Worker (/sw.js).' };
      }

      // 3. Fetch VAPID public key
      const vapidPublicKey = await this.getVapidPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // 4. Subscribe to Push Manager (FCM / Mozilla / Edge)
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        try {
          subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey as unknown as BufferSource,
          });
        } catch (subErr: any) {
          console.error('[Push Client] pushManager.subscribe error:', subErr);
          const errMsg = subErr?.message || '';
          if (errMsg.includes('push service error') || subErr?.name === 'AbortError') {
            return {
              success: false,
              permission: 'granted',
              error:
                'Izin browser sudah diberikan (Granted)! Namun browser Brave memblokir koneksi FCM. Buka tab baru ke brave://settings/privacy, aktifkan "Use Google services for push messaging", lalu restart Brave.',
            };
          }
          return {
            success: false,
            permission: 'granted',
            error: `Gagal membuat Push Subscription: ${errMsg || 'Push service unavailable.'}`,
          };
        }
      }

      // 5. Send real subscription to backend
      const rawSub = subscription.toJSON();
      if (!rawSub.keys || !rawSub.keys.p256dh || !rawSub.keys.auth) {
        return { success: false, permission: 'granted', error: 'PushSubscription keys tidak valid dari browser.' };
      }

      console.log('[Push Client] Generated PushSubscription endpoint:', subscription.endpoint);

      await axios.post('/api/push/subscribe', {
        user_id: effectiveUserId,
        role: effectiveUserRole,
        endpoint: subscription.endpoint,
        keys: rawSub.keys,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      });

      return { success: true, subscription, permission: 'granted' };
    } catch (error: any) {
      console.error('[Push Client] Failed to subscribe user to Web Push:', error);
      return {
        success: false,
        error: error?.response?.data?.message || error?.message || 'Gagal mengaktifkan Web Push Notification.',
      };
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  public async unsubscribeUser(userId: number | string): Promise<{ success: boolean; error?: string }> {
    if (!this.isSupported()) {
      return { success: true };
    }

    try {
      const reg = await this.registerServiceWorker();
      if (reg) {
        const subscription = await reg.pushManager.getSubscription();
        if (subscription) {
          const endpoint = subscription.endpoint;
          await subscription.unsubscribe();
          try {
            await axios.delete('/api/push/subscribe', {
              data: { user_id: userId, endpoint },
            });
          } catch {
            // Ignore backend cleanup error
          }
        }
      }
      return { success: true };
    } catch (error: any) {
      console.error('[Push Client] Failed to unsubscribe:', error);
      return { success: false, error: error?.message || 'Gagal menonaktifkan notifikasi.' };
    }
  }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
