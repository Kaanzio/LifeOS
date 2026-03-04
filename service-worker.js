const CACHE_NAME = 'lifeos-v6.97-mobile-pwa';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './css/dashboard_layout.css',
    './css/mobile.css',
    './css/youtube.css',
    './css/settings_header.css',
    './manifest.json',
    './js/app.js',
    './js/auth.js',
    './js/books.js',
    './js/dashboard.js',
    './js/exams.js',
    './js/games.js',
    './js/habits.js',
    './js/lessons.js',
    './js/notes.js',
    './js/notifications.js',
    './js/planning.js',
    './js/pomodoro.js',
    './js/profile.js',
    './js/schedule.js',
    './js/shows.js',
    './js/sites.js',
    './js/storage.js',
    './js/youtube.js',
    './js/drive-sync.js',
    './assets/logo.png',
    './assets/icons/pomo-bg.png'
];

// Install Event
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching critical assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate Event - Cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// Fetch Event - Dynamic Caching Strategy
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Stale-while-revalidate for everything except index.html
                    if (event.request.url.endsWith('index.html') || event.request.url === self.location.origin + '/') {
                        return fetch(event.request).catch(() => cachedResponse);
                    }

                    // Fetch and update cache in background
                    fetch(event.request).then(response => {
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                        }
                    }).catch(() => { });

                    return cachedResponse;
                }

                return fetch(event.request).then((response) => {
                    // Cache new resources on the fly
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return response;
                });
            })
    );
});
