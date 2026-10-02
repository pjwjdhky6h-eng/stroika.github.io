const CACHE_NAME = 'stroika-shell-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil((async () => { const keys = await caches.keys(); await Promise.all(keys.filter(key => key.startsWith('stroika-') && key !== CACHE_NAME).map(key => caches.delete(key))); await self.clients.claim(); })()); });
self.addEventListener('fetch', event => {
 const request = event.request; if (request.method !== 'GET') return;
 const url = new URL(request.url);
 if (url.origin !== self.location.origin) { if (request.destination === 'image') event.respondWith((async () => { const cache = await caches.open(CACHE_NAME); const cached = await cache.match(request); if (cached) return cached; try { const response = await fetch(request); if (response.ok || response.type === 'opaque') await cache.put(request, response.clone()); return response; } catch { return (await cache.match(request)) || Response.error(); } })()); return; }
 if (request.mode === 'navigate') { event.respondWith((async () => { try { const response = await fetch(request); if (response.ok) (await caches.open(CACHE_NAME)).put('./index.html', response.clone()); return response; } catch { return (await caches.match(request)) || (await caches.match('./index.html')) || (await caches.match('./')); } })()); return; }
 event.respondWith((async () => { const cache = await caches.open(CACHE_NAME); const cached = await cache.match(request); if (cached) return cached; try { const response = await fetch(request); if (response.ok) await cache.put(request, response.clone()); return response; } catch { return Response.error(); } })());
});
