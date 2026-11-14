// Verbum Service Worker
// Offline support (precached app shell), push notifications, and notification deep links.
//
// The two values below are filled in at build time by vite-plugins/precacheManifest.js.
// In development they stay empty, so nothing is precached.
const PRECACHE_MANIFEST = [] /*__PRECACHE_MANIFEST__*/;
const CACHE_VERSION = 'verbum-dev' /*__CACHE_VERSION__*/;

// ─── INSTALL: precache the app shell ─────────────────────────────────────────
// If any file fails to download the install fails, and the previous version keeps working.
// A new version waits until the page asks for it (see SKIP_WAITING), so the app never
// reloads by itself while someone is praying.
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(PRECACHE_MANIFEST))
  );
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// ─── ACTIVATE: clean up old cache versions ───────────────────────────────────
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('verbum-') && key !== CACHE_VERSION).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── FETCH: offline support ──────────────────────────────────────────────────
// Page navigations: network first, falling back to the cached app shell when offline.
// Other same-origin files (JS, CSS, images, fonts): cache first, then network.
self.addEventListener('fetch', function(event) {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Leave other sites (YouTube, Supabase, Wikipedia) and our own API alone.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html', { ignoreVary: true }).then(shell => shell || caches.match('/', { ignoreVary: true }))
      )
    );
    return;
  }

  event.respondWith(
    // ignoreVary: our files are the same for every requester, and some servers add a Vary
    // header that would otherwise make module and font requests miss the cache.
    caches.match(request, { ignoreVary: true }).then(cached => {
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

  let data;
  try {
    data = event.data.json();
  } catch {
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
// e.g. "/prayers/three-oclock" or "/". Older links such as
// "/?tab=prayers&section=three-oclock" still work: the app maps them to the new addresses.
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  const fullUrl = self.location.origin + url;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If the app is already open, focus it and tell it where to navigate
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus().then(focused => {
            (focused || client).postMessage({ type: 'NAVIGATE', url });
          });
        }
      }
      // Otherwise open a new window at the deep-linked URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(fullUrl);
      }
    })
  );
});
