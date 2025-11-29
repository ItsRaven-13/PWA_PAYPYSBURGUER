// sw.js - Service Worker básico
const CACHE_NAME = 'paypys-burguer-v1.0.0';

self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Puedes agregar lógica de cache aquí después
  event.respondWith(fetch(event.request));
});