const CACHE_NAME = 'paypys-burguer-v1.0.1';
const urlsToCache = [
  '/ItsRaven-13.github.io-PWA_PAYPYSBURGUER/',
  '/ItsRaven-13.github.io-PWA_PAYPYSBURGUER/index.html',
  '/ItsRaven-13.github.io-PWA_PAYPYSBURGUER/style.css',
  '/ItsRaven-13.github.io-PWA_PAYPYSBURGUER/app.js',
  '/ItsRaven-13.github.io-PWA_PAYPYSBURGUER/firebase.js',
  '/ItsRaven-13.github.io-PWA_PAYPYSBURGUER/login.js',
  '/ItsRaven-13.github.io-PWA_PAYPYSBURGUER/manifest.json',
  '/ItsRaven-13.github.io-PWA_PAYPYSBURGUER/assets/img/logo.png'
];

self.addEventListener("install", event => {
  console.log("Service Worker instalado");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cacheando archivos esenciales');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  console.log("Service Worker activo");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve el recurso cacheado o haz la petición normal
        return response || fetch(event.request);
      })
  );
});