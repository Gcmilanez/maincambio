// =================================================================
// SERVICE WORKER - CACHE OFFLINE
// =================================================================

const CACHE_VERSION = 'maincambio-v1.5'; // VERSÃO ATUALIZADA
const STATIC_CACHE = 'static-' + CACHE_VERSION;
const DYNAMIC_CACHE = 'dynamic-' + CACHE_VERSION;

// Arquivos para cache inicial (instalar)
const urlsToCache = [
    '/',
    '/index.html',
    '/cotacoes.html',
    '/politica-de-privacidade.html',
    '/style.css',
    '/script.js',
    '/cotacoes.js',
    '/imgs/logo.png',
    '/imgs/navio.jpg',
    '/imgs/container.jpg',
    '/imgs/business.jpg',
    '/imgs/cambio.png',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// =================================================================
// INSTALAÇÃO - Cacheia os arquivos essenciais
// =================================================================
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// =================================================================
// ATIVAÇÃO - Limpa caches antigos
// =================================================================
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// =================================================================
// FETCH - Estratégia de cache
// =================================================================
self.addEventListener('fetch', event => {
    const { request } = event;

    if (request.method !== 'GET') return;

    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then(networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                            return networkResponse;
                        }

                        const responseToCache = networkResponse.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                if (!request.url.includes('awesomeapi.com.br')) {
                                    cache.put(request, responseToCache);
                                }
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});