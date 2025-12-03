// Service Worker mejorado: cache-first + fallback offline + manejo de query strings para módulos con ?v=
const CACHE_NAME = "pwy-cache-v1";
const PRECACHE_URLS = [
  "/", 
  "/PWA_PAYPYSBURGUER/index.html",
  "/PWA_PAYPYSBURGUER/manifest.json",
  "/PWA_PAYPYSBURGUER/assets/css/style.css",
  "/PWA_PAYPYSBURGUER/assets/js/app.js",
  "/PWA_PAYPYSBURGUER/assets/js/catalogo.js",
  "/PWA_PAYPYSBURGUER/assets/js/login.js",
  "/PWA_PAYPYSBURGUER/assets/js/registro.js",
  "/PWA_PAYPYSBURGUER/assets/js/carrito.js",
  "/PWA_PAYPYSBURGUER/assets/img/logo.png",
  "/PWA_PAYPYSBURGUER/assets/img/icon.png",
  "/PWA_PAYPYSBURGUER/assets/img/fallback.png" // opcional placeholder
];

// Util: devuelve URL sin query params (para coincidir módulos con ?v=)
function stripSearch(url) {
  try {
    const u = new URL(url);
    return u.origin + u.pathname;
  } catch (e) {
    return url;
  }
}

self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : null));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", event => {
  // Solo manejar GET. Para otras operaciones dejar pasar.
  if (event.request.method !== "GET") return;

  event.respondWith((async () => {
    const req = event.request;
    const reqNoSearch = stripSearch(req.url);

    try {
      // 1) Intentar respuesta desde caché (coincidencia exacta)
      const cachedExact = await caches.match(req);
      if (cachedExact) return cachedExact;

      // 2) Intentar respuesta desde cache sin query string (módulos importados con ?v=)
      const cachedNoSearch = await caches.match(reqNoSearch);
      if (cachedNoSearch) return cachedNoSearch;

      // 3) Intento de red (network-first fallback to cache)
      const networkResponse = await fetch(req);

      // Cachear respuesta GET exitosas (sin contenido cross-origin no cacheable)
      if (networkResponse && networkResponse.status === 200 && networkResponse.type !== "opaque") {
        const cache = await caches.open(CACHE_NAME);
        // Guardar con la key original y también sin query para coincidir futuras requests.
        cache.put(req.clone(), networkResponse.clone());
        try { cache.put(reqNoSearch, networkResponse.clone()); } catch(e){ /* ignore */ }
      }
      return networkResponse;
    } catch (err) {
      // Estamos offline o la red falló: devolver fallback desde cache
      // Si es navegación, servir index.html (SPA)
      if (req.mode === "navigate") {
        return (await caches.match("/PWA_PAYPYSBURGUER/index.html")) ||
               (await caches.match("/index.html")) ||
               new Response("<h1>Offline</h1>", { headers: { "Content-Type": "text/html" } , status: 503 });
      }

      // Si es imagen, devolver placeholder si existe en cache
      if (req.destination === "image") {
        return (await caches.match("/PWA_PAYPYSBURGUER/assets/img/fallback.png")) ||
               new Response("", { status: 503 });
      }

      // Como último recurso devolver recurso en cache sin query
      const fallback = await caches.match(reqNoSearch);
      if (fallback) return fallback;

      // Respuesta genérica de fallo
      return new Response("Offline", { status: 503, statusText: "Offline" });
    }
  })());
  
});