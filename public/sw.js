// Lightweight Service Worker for offline support
const CACHE_NAME = 'generas-legacy-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/icons.svg',
  '/favicon.svg'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Cache-first strategy for static assets, network-first for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip Supabase API calls - always fetch fresh
  if (url.hostname.includes('supabase')) {
    return;
  }
  
  // Cache strategy for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      // Return cached version if available
      if (cached) {
        return cached;
      }
      
      // Otherwise fetch and cache
      return fetch(request)
        .then((response) => {
          // Don't cache if not valid response
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Clone and cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // Only cache same-origin requests
            if (url.origin === self.location.origin) {
              cache.put(request, responseClone);
            }
          });
          
          return response;
        })
        .catch(() => {
          // Offline fallback for HTML
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
