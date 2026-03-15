/* =====================================================
   ENEM MASTER — Service Worker (sw.js)
   Cache-first para assets • Network-first para API
   ===================================================== */

const CACHE_NAME = 'enem-master-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/api.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
];

/* ---- Install: pré-cachear assets ---- */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http') || url.includes('fonts.googleapis')));
        }).then(() => self.skipWaiting())
    );
});

/* ---- Activate: limpar caches antigos ---- */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

/* ---- Fetch: estratégia por tipo de request ---- */
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // API do ENEM → Network first, cache fallback
    if (url.hostname === 'api.enem.dev') {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // Imagens do ENEM → Cache first
    if (url.hostname === 'enem.dev') {
        event.respondWith(cacheFirst(event.request));
        return;
    }

    // Assets estáticos → Cache first
    if (event.request.method === 'GET') {
        event.respondWith(cacheFirst(event.request));
    }
});

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok && response.status < 400) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('Offline — conteúdo indisponível', { status: 503 });
    }
}

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        return cached || new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
