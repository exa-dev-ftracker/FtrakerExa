const CACHE_NAME = 'ftraker-cache-v4';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

// Install event: Cache core static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network-first for most things, Cache-first for static assets
self.addEventListener('fetch', (event) => {
  // Hanya proses request HTTP/HTTPS (hindari error chrome-extension://)
  if (!event.request.url.startsWith('http')) return;
  // Jangan cache request selain GET (seperti POST, PUT, DELETE)
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // MATIKAN CACHE UNTUK LOCALHOST (DEVELOPMENT)
  // Vite memproses file CSS sebagai JS Modules, caching di dev mode akan membuat error Strict MIME Type.
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

  // Jangan cache request dari Vite dev server atau yang mengandung query string spesifik Vite
  if (url.search.includes('import') || url.search.includes('v=') || url.pathname.includes('/@vite/') || url.pathname.includes('/@fs/')) {
    return; // Biarkan browser yang handle (pass-through)
  }

  // Cache-First strategy untuk aset statis dari Nuxt (_nuxt) atau images
  if (url.pathname.startsWith('/_nuxt/') || url.pathname.match(/\.(png|jpg|jpeg|svg|gif|css|js)$/)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          // Hanya cache response yang sukses (status 200) dan bukan opaque response yang bisa bermasalah
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network-First strategy untuk halaman HTML dan API
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Jika offline atau gagal fetch, ambil dari cache
        return caches.match(event.request);
      })
  );
});

