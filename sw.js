const CACHE_NAME = 'donation-bok2569-v1';
const urlsToCache = [
  '/',
  '/css/main.css',
  '/css/public.css',
  '/css/popup.css',
  '/css/responsive.css',
  '/js/utils.js',
  '/js/app.js',
  '/js/socket.js',
  '/js/popup.js',
  '/js/tts.js'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
    ))
  );
  self.clients.claim();
});

// Fetch — Network first (always bypass cache during development)
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
