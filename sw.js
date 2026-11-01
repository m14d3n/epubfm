/**
 * Service Worker for epubfm (PWA)
 * Enables offline PWA capabilities and fast asset loading.
 */

const CACHE_NAME = 'epubfm-pwa-v2';
const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg',
    './icon-192.png',
    './icon-512.png',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CORE_ASSETS).catch((err) => {
                console.warn('Some non-critical PWA assets failed to cache:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    // Only handle GET requests and http/https schemes (ignore chrome-extension:, blob:, etc.)
    if (req.method !== 'GET' || !req.url.startsWith('http')) return;

    event.respondWith(
        caches.match(req).then((cachedResp) => {
            if (cachedResp) {
                // Fetch fresh copy in background for CDN/scripts
                fetch(req).then((networkResp) => {
                    if (networkResp && networkResp.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResp));
                    }
                }).catch(() => {});
                return cachedResp;
            }

            return fetch(req).then((networkResp) => {
                if (networkResp && networkResp.status === 200 && networkResp.type !== 'opaque') {
                    const respClone = networkResp.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, respClone));
                }
                return networkResp;
            }).catch(() => {
                // If offline and requesting an HTML page, serve cached index.html
                if (req.headers.get('accept')?.includes('text/html')) {
                    return caches.match('./index.html') || caches.match('./');
                }
            });
        })
    );
});

