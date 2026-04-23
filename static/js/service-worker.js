const STATIC_CACHE = "cyberwatch-static-v2";
const PAGE_CACHE = "cyberwatch-pages-v2";
const OFFLINE_FALLBACK_URL = "/";

const STATIC_FILES_TO_CACHE = [
    "/",
    "/static/css/styles.css",
    "/static/js/script.js",
    "/static/manifest.json",
    "/static/icons/Cyberwatch-icon (192 x 192 px).png",
    "/static/icons/Cyberwatch-icon (512 x 512 px).png",
    "/static/images/Cyberwatch-icon (192 x 192 px) copy.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_FILES_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    const allowedCaches = [STATIC_CACHE, PAGE_CACHE];

    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName.startsWith("cyberwatch-") && !allowedCaches.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                    return Promise.resolve();
                })
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(event.request.url);

    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    if (requestUrl.pathname.startsWith("/static/")) {
        event.respondWith(cacheFirst(event.request));
        return;
    }

    if (event.request.mode === "navigate") {
        event.respondWith(networkFirstPage(event.request));
        return;
    }
});

async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
    }

    return networkResponse;
}

async function networkFirstPage(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(PAGE_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const fallbackResponse = await caches.match(OFFLINE_FALLBACK_URL);
        if (fallbackResponse) {
            return fallbackResponse;
        }

        throw error;
    }
}
