const CACHE_NAME = 'play9-cache-v2'; // Updated version to force cache refresh
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/fav.png'
];

// Install event
self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache addAll failed:', error);
      })
  );
});

// Fetch event - Network first strategy for API calls, cache first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip caching for API calls and dynamic content
  if (url.pathname.startsWith('/api/') || 
      url.pathname.includes('auth') || 
      url.pathname.includes('user') ||
      url.pathname.includes('transaction') ||
      url.searchParams.has('_t') || // Cache busting parameter
      request.method !== 'GET') {
    // Network only for API calls
    event.respondWith(fetch(request));
    return;
  }
  
  // Cache first for static assets
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Cache hit - return response but also fetch fresh version
        if (response) {
          // Fetch fresh version in background
          fetch(request).then((freshResponse) => {
            if (freshResponse && freshResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, freshResponse.clone());
              });
            }
          }).catch(() => {
            // Ignore fetch errors in background
          });
          
          return response;
        }

        // No cache hit - fetch from network
        return fetch(request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it's a stream that can only be consumed once
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              // Only cache static assets, not dynamic content
              if (!request.url.includes('?') && 
                  !request.url.includes('#') &&
                  (request.url.endsWith('.js') || 
                   request.url.endsWith('.css') || 
                   request.url.endsWith('.png') || 
                   request.url.endsWith('.jpg') || 
                   request.url.endsWith('.jpeg') || 
                   request.url.endsWith('.gif') || 
                   request.url.endsWith('.svg') ||
                   request.url.endsWith('.webp'))) {
                cache.put(request, responseToCache);
              }
            });

          return response;
        });
      })
      .catch(() => {
        // Fallback for offline
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  // Take control of all clients immediately
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});

// Handle push notifications (optional)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Play9!',
    icon: '/fav.png',
    badge: '/fav.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Play9', options)
  );
}); 