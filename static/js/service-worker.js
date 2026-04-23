// Fetch event: Serve resources from cache or network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open('my-pwa-cache')
            .then(cache => {
                return cache.match(event.request)
                    .then(response => {
                        return response || fetch(event.request);
                    });
            })
    );
});

const FILES_TO_CACHE = [
    '/',
    '/static/templates/index.html',
    '/static/css/styles.css',
    '/static/js/script.js',
    '/static/icons/static/icons/Cyberwatchicon (192 x 192 px).png',
    '/static/icons/static/icons/Cyberwatchicon (512 x 512 px).png'
];

// Install event: Cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching resources...');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});