// F1 Info ARG — Service Worker v1
const CACHE_NAME = 'f1arg-v3';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/drivers.html',
    '/teams.html',
    '/calendar.html',
    '/circuits.html',
    '/compare.html',
    '/stats.html',
    '/timeline.html',
    '/predictor.html',
    '/trivia.html',
    '/rookies.html',
    '/glossary.html',
    '/today.html',
    '/livrees.html',
    '/search.html',
    '/driver.html',
    '/team.html',
    '/data.js',
    '/main.js',
    '/style.css',
    '/img/logo-f1arg.jpg',
];

// Install: cache all static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Fetch: cache-first for assets, network-first for HTML
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (event.request.method !== 'GET') return;

    // Cache-first for JS/CSS/images/fonts
    if (/\.(js|css|jpg|jpeg|png|svg|gif|ico|woff2?)$/.test(url.pathname)) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(res => {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    return res;
                }).catch(() => new Response('', { status: 408 }));
            })
        );
        return;
    }

    // Network-first for HTML pages
    event.respondWith(
        fetch(event.request)
            .then(res => {
                const clone = res.clone();
                caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                return res;
            })
            .catch(() => caches.match(event.request)
                .then(cached => cached || caches.match('/index.html'))
            )
    );
});
