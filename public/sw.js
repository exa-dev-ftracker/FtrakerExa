const CACHE_NAME = 'ftraker-cache-v1';
const RUNTIME_CACHE = 'ftraker-runtime-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - no caching, pass through to network
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
