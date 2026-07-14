// Verbum Service Worker
// Handles push notifications, notification click deep linking, and offline caching.

const CACHE_VERSION = 'verbum-v2';
const PRECACHE_URLS = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png'];

// ─── INSTALL: precache the app shell ─────────────────────────────────────────
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .catch(() => {}) // never block install on a failed precache
      .then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE: clean up old cache versions ───────────────────────────────────
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))
      ))
      .then(() => clients.claim())
  );
});

// ─── FETCH: offline support ──────────────────────────────────────────────────
// Navigations: network first, fall back to cached shell when offline.
// Same-origin static assets (JS/CSS/images/fonts): cache first, then network.
self.addEventListener('fetch', function(event) {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Page navigations
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put('/', copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Same-origin static assets only (leave YouTube embeds, Supabase, Wikipedia alone)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, copy)).catch(() => {});
        }
        return response;
      });
    })
  );
});

// ─── PUSH: show the notification ─────────────────────────────────────────────
self.addEventListener('push', function(event) {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
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

// ─── NOTIFICATION CLICK: deep link into the app ──────────────────────────────
// The url in the push payload should use query params the app understands,
// e.g. "/?tab=prayers&section=three-oclock" or "/?tab=home".
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  const fullUrl = self.location.origin + url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If the app is already open, focus it and tell it where to navigate
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus().then(focused => {
            (focused || client).postMessage({ type: 'NAVIGATE', url });
          });
        }
      }
      // Otherwise open a new window at the deep-linked URL
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});
