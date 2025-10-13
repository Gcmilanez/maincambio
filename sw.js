// =================================================================
// SERVICE WORKER - CACHE OFFLINE
// =================================================================
// Este arquivo deve ficar na raiz do site (mesma pasta do index.html)
// Para ativar, descomente a linha no script.js

const CACHE_VERSION = 'maincambio-v1.2';
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
    console.log('[Service Worker] Instalando...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[Service Worker] Cacheando arquivos essenciais');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[Service Worker] Instalação completa');
                return self.skipWaiting(); // Ativa imediatamente
            })
            .catch(err => {
                console.error('[Service Worker] Erro na instalação:', err);
            })
    );
});

// =================================================================
// ATIVAÇÃO - Limpa caches antigos
// =================================================================
self.addEventListener('activate', event => {
    console.log('[Service Worker] Ativando...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    // Remove caches antigos
                    if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
                        console.log('[Service Worker] Removendo cache antigo:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
        .then(() => {
            console.log('[Service Worker] Ativação completa');
            return self.clients.claim(); // Assume controle imediatamente
        })
    );
});

// =================================================================
// FETCH - Estratégia de cache
// =================================================================
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignora requisições não-GET
    if (request.method !== 'GET') {
        return;
    }

    // Ignora requisições para APIs externas (exceto fontes e ícones)
    if (url.origin !== location.origin && 
        !url.href.includes('googleapis.com') && 
        !url.href.includes('cdnjs.cloudflare.com') &&
        !url.href.includes('awesomeapi.com.br')) {
        return;
    }

    // Estratégia: Cache First, falling back to Network
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    console.log('[Service Worker] Retornando do cache:', request.url);
                    return cachedResponse;
                }

                // Se não está no cache, busca da rede
                return fetch(request)
                    .then(networkResponse => {
                        // Não cacheia respostas inválidas
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                            return networkResponse;
                        }

                        // Clona a resposta (só pode ser usada uma vez)
                        const responseToCache = networkResponse.clone();

                        // Adiciona ao cache dinâmico
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                // Não cacheia a API de cotações (dados mudam)
                                if (!request.url.includes('awesomeapi.com.br')) {
                                    cache.put(request, responseToCache);
                                    console.log('[Service Worker] Adicionado ao cache dinâmico:', request.url);
                                }
                            });

                        return networkResponse;
                    })
                    .catch(error => {
                        console.error('[Service Worker] Erro ao buscar:', error);
                        
                        // Se falhou e é uma página HTML, retorna página offline (opcional)
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                        
                        // Para imagens, retorna placeholder (opcional)
                        if (request.headers.get('accept').includes('image')) {
                            // Retorna uma imagem de fallback se tiver
                            return caches.match('/imgs/logo.png');
                        }
                    });
            })
    );
});

// =================================================================
// MENSAGENS - Comunicação com a página
// =================================================================
self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cache => caches.delete(cache))
                );
            }).then(() => {
                console.log('[Service Worker] Cache limpo');
                return self.registration.unregister();
            })
        );
    }
});

// =================================================================
// SINCRONIZAÇÃO EM BACKGROUND (OPCIONAL)
// =================================================================
self.addEventListener('sync', event => {
    if (event.tag === 'sync-cotacoes') {
        event.waitUntil(
            // Atualiza dados de cotações em background
            console.log('[Service Worker] Sincronizando cotações...')
        );
    }
});

// =================================================================
// PUSH NOTIFICATIONS (FUTURO - OPCIONAL)
// =================================================================
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    
    const title = data.title || 'MainCâmbio';
    const options = {
        body: data.body || 'Nova notificação',
        icon: '/imgs/logo.png',
        badge: '/imgs/logo.png',
        vibrate: [200, 100, 200],
        data: data
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});