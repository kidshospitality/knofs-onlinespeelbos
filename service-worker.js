const CACHE_NAME = 'knof-speelbos-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/games.html',
  '/games/memory.html',
  '/games/puzzle.html',
  '/games/drawing.html',
  '/coloring.html',
  '/placemat.html',
  '/chat.html',
  '/css/style.css',
  '/js/common.js',
  '/js/games.js',
  '/js/coloring.js',
  '/js/placemat.js',
  '/js/chat.js',
  '/components/top-nav.html',
  '/components/bottom-nav.html',
  '/components/settings-modal.html',
  '/images/knof.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
  // Voeg alle belangrijke bronnen toe die je wilt cachen
];

// Install event - cache belangrijke bronnen
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event - probeer eerst uit cache, daarna netwerk
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone het request omdat het maar één keer gebruikt kan worden
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Controleer of we een geldig response hebben
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone het response omdat het maar één keer gebruikt kan worden
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
    );
});

// Activate event - verwijder oude caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
