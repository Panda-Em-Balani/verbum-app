// Verbum Service Worker
// Handles push notifications and notification click deep linking

self.addEventListener('push', function(event) {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch(e) {
    data = { title: 'Verbum', body: event.data.text(), url: '/' };
  }

  const title = data.title || 'Verbum — The Word';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'verbum-notif',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  const fullUrl = self.location.origin + url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If app is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NAVIGATE', url });
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});

// Cache essential assets on install
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});
