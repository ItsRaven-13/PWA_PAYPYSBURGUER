// Service Worker robusto: precache seguro + cache-first con fallback offline
const CACHE_NAME = "pwy-cache-v1";
const PRECACHE_URLS = [
  "/PWA_PAYPYSBURGUER/index.html",
  "/PWA_PAYPYSBURGUER/manifest.json",
  "/PWA_PAYPYSBURGUER/assets/css/style.css",
  "/PWA_PAYPYSBURGUER/assets/js/app.js",
  "/PWA_PAYPYSBURGUER/assets/js/catalogo.js",
  "/PWA_PAYPYSBURGUER/assets/js/login.js",
  "/PWA_PAYPYSBURGUER/assets/js/registro.js",
  "/PWA_PAYPYSBURGUER/assets/js/carrito.js",
  "/PWA_PAYPYSBURGUER/assets/img/logo.png",
  "/PWA_PAYPYSBURGUER/assets/img/icon.png"
  // Si añades fallback.png, inclúyelo aquí: "/PWA_PAYPYSBURGUER/assets/img/fallback.png"
];

function stripSearch(url) {
  try {
    const u = new URL(url);
    return u.origin + u.pathname;
  } catch (e) {
    return url;
  }
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(PRECACHE_URLS.map(async (url) => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res || !res.ok) throw new Error(`HTTP ${res ? res.status : "no response"}`);
        await cache.put(url, res.clone());
      } catch (err) {
        console.warn("Precache fallo para:", url, err);
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : null));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith((async () => {
    const req = event.request;
    const reqNoSearch = stripSearch(req.url);

    try {
      const cachedExact = await caches.match(req);
      if (cachedExact) return cachedExact;

      const cachedNoSearch = await caches.match(reqNoSearch);
      if (cachedNoSearch) return cachedNoSearch;

      const networkResponse = await fetch(req);
      if (networkResponse && networkResponse.status === 200 && networkResponse.type !== "opaque") {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req.clone(), networkResponse.clone());
        try { cache.put(reqNoSearch, networkResponse.clone()); } catch (e) {}
      }
      return networkResponse;
    } catch (err) {
      if (req.mode === "navigate") {
        return (await caches.match("/PWA_PAYPYSBURGUER/index.html")) ||
               (await caches.match("/index.html")) ||
               new Response("<h1>Offline</h1>", { headers: { "Content-Type": "text/html" }, status: 503 });
      }

      if (req.destination === "image") {
        return (await caches.match("/PWA_PAYPYSBURGUER/assets/img/icon.png")) ||
               new Response("", { status: 503 });
      }

      const fallback = await caches.match(reqNoSearch);
      if (fallback) return fallback;

      return new Response("Offline", { status: 503, statusText: "Offline" });
    }
  })());
});