// PantryFit Service Worker
// Caches the app so it works offline and loads instantly

const CACHE = 'pantryfit-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

// Install — cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache first, then network
self.addEventListener('fetch', e => {
  // Don't cache API calls (Supabase, Anthropic, Open Food Facts)
  if (e.request.url.includes('supabase.co') ||
      e.request.url.includes('anthropic.com') ||
      e.request.url.includes('openfoodfacts') ||
      e.request.url.includes('googleapis.com')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache new HTML/CSS/JS responses
        if (response.ok && e.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback — return cached index
        if (e.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
