const CACHE_NAME = 'paypys-burguer-v1.0.1';
const urlsToCache = [
  '/PWA_PAYPYSBURGUER/',
  '/PWA_PAYPYSBURGUER/index.html',
  '/PWA_PAYPYSBURGUER/manifest.json',

  // CSS
  '/PWA_PAYPYSBURGUER/assets/css/style.css',

  // JS
  '/PWA_PAYPYSBURGUER/assets/js/app.js',
  '/PWA_PAYPYSBURGUER/assets/js/firebase.js',
  '/PWA_PAYPYSBURGUER/assets/js/login.js',
  '/PWA_PAYPYSBURGUER/assets/js/registro.js',
  '/PWA_PAYPYSBURGUER/assets/js/catalogo.js',
  '/PWA_PAYPYSBURGUER/assets/js/admin.js',
  '/PWA_PAYPYSBURGUER/assets/js/session.js',

  // IMG
  '/PWA_PAYPYSBURGUER/assets/img/logo.png'
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