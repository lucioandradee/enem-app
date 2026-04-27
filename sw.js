/* =====================================================
   ENEM MASTER — Service Worker (sw.js)
   Cache-first para assets • Network-first para API
   ===================================================== */

const CACHE_NAME = 'enem-master-v20';
const STATIC_ASSETS = [
    '/app',
    '/style.css',
    '/manifest.json',
    'https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900&display=swap',
];

/* ---- Install: pré-cachear assets ---- */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http') || url.includes('fonts.bunny')));
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

    // SW, arquivos JS, HTML principais e páginas de auth → sempre Network first (nunca cache stale)
    if (
        url.pathname === '/sw.js' ||
        url.pathname.endsWith('.js') ||
        url.pathname === '/app' ||
        url.pathname === '/app.html' ||
        url.pathname === '/' ||
        url.pathname === '/index.html' ||
        url.pathname === '/auth/callback' ||    // ← CRÍTICO: nunca cachear página de callback OAuth
        url.pathname === '/auth-callback.html'
    ) {
        event.respondWith(networkFirst(event.request));
        return;
    }

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

    // Demais assets estáticos (CSS, fontes, imagens locais) → Cache first
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

/* ---- Push Notifications ---- */
self.addEventListener('push', (event) => {
    let data = { title: 'ENEM Master', body: 'Hora de estudar! 💡', icon: '/favicon.ico' };
    try {
        if (event.data) data = { ...data, ...event.data.json() };
    } catch { /* noop */ }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || '/favicon.ico',
            badge: '/favicon.ico',
            tag: data.tag || 'enem-master',
            data: { url: data.url || '/' },
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url === targetUrl && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});
