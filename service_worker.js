// service-worker.js

const CACHE_NAME = 'offline-cache';
const OFFLINE_URL = 'offline-mode/error.html';

const urlsToCache = [
  '/',
  'offline-mode/error.css',
  'offline-mode/error.png',
  'offline-mode/error.json',
  OFFLINE_URL
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .catch(() => caches.match(OFFLINE_URL));
      })
  );
});
