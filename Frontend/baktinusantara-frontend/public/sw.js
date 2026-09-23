/*
 * Service Worker for Gayatama Web Push Notifications
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through fetch event handler required for Chrome PWA installability
self.addEventListener('fetch', (event) => {
  // Let browser handle requests with standard network cache
});

self.addEventListener('push', (event) => {
  const receivedAtUnix = Date.now();
  const receivedAtIso = new Date(receivedAtUnix).toLocaleTimeString();
  console.log(`[Service Worker] [${receivedAtIso}] Web Push event received from Push Service:`, event);

  let data = {
    title: 'Gayatama',
    message: 'Ada pembaruan penting di sistem Gayatama.',
    url: '/notifications',
    tag: 'gayatama-notification-' + receivedAtUnix,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-96x96.png',
    sent_at_iso: null,
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log(`[Service Worker] [${receivedAtIso}] Push payload JSON:`, payload);
      data = {
        title: payload.title || data.title,
        message: payload.message || payload.body || data.message,
        url: payload.url || payload.action_url || payload.link || data.url,
        tag: 'gayatama-' + receivedAtUnix,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-96x96.png',
        id: payload.id,
        sent_at_iso: payload.sent_at_iso,
        timestamp: payload.timestamp || receivedAtUnix,
      };
      if (payload.sent_at_iso) {
        console.log(`[Service Worker] ⏱️ Message Sent by Backend at: ${payload.sent_at_iso} | Delivered by FCM at: ${new Date().toISOString()}`);
      }
    } catch (e) {
      data.message = event.data.text();
    }
  }

  const options = {
    body: data.message,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: {
      url: data.url,
      id: data.id,
      timestamp: data.timestamp,
    },
    vibrate: [200, 100, 200],
    renotify: true,
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options).then(() => {
      console.log(`[Service Worker] [${receivedAtIso}] Desktop notification displayed successfully for:`, data.title);
      // Notify active client tabs to refresh their notification bell if open
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'GAYATAMA_PUSH_RECEIVED',
            payload: data,
          });
        });
      });
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. Try to find a client that is already open
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl) {
            // Navigate the tab if not already on the page
            const currentUrl = new URL(client.url);
            const targetUrlObj = new URL(targetUrl, self.location.origin);
            if (currentUrl.pathname !== targetUrlObj.pathname) {
              client.navigate(targetUrl);
            }
          }
          // Send click message to mark as read
          client.postMessage({
            type: 'GAYATAMA_NOTIFICATION_CLICKED',
            id: event.notification.data?.id,
            url: targetUrl,
          });
          return;
        }
      }

      // 2. If no client is open, open a new window
      if (self.clients.openWindow) {
        const fullUrl = new URL(targetUrl, self.location.origin).href;
        return self.clients.openWindow(fullUrl);
      }
    })
  );
});

// Handle direct message from frontend clients (for testing or when Push Service FCM is restricted in Brave)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const payload = event.data.payload || {};
    const options = {
      body: payload.message || payload.body || 'Desktop notification Gayatama berhasil diterima.',
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge || '/favicon.ico',
      tag: payload.tag || 'gayatama-' + Date.now(),
      data: {
        url: payload.url || '/',
        id: payload.id || Date.now(),
        timestamp: Date.now(),
      },
      vibrate: [150, 50, 150],
      renotify: true,
      requireInteraction: false,
    };

    event.waitUntil(
      self.registration.showNotification(payload.title || 'Gayatama', options)
    );
  }

  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const delay = (event.data.delaySeconds || 5) * 1000;
    const payload = event.data.payload || {};
    const options = {
      body: payload.message || payload.body || 'Desktop notification Gayatama berhasil diterima.',
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge || '/favicon.ico',
      tag: payload.tag || 'gayatama-' + Date.now(),
      data: {
        url: payload.url || '/',
        id: payload.id || Date.now(),
        timestamp: Date.now(),
      },
      vibrate: [150, 50, 150],
      renotify: true,
      requireInteraction: false,
    };

    setTimeout(() => {
      self.registration.showNotification(payload.title || 'Gayatama', options);
    }, delay);
  }
});

