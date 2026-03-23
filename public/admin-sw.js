// public/admin-sw.js
// Service worker admin — scope izolat /admin/, cache minimal.
// Nu interferează cu SW-ul principal next-pwa.

const CACHE = "ze-admin-v1";
const PRECACHE = ["/admin/login", "/admin/inbox"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Gestionează doar request-uri din scope /admin/
  if (!url.pathname.startsWith("/admin")) return;
  // Strategie: network-first, fallback la cache
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok && event.request.method === "GET") {
          const clone = res.clone();
          void caches.open(CACHE).then((c) => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request)),
  );
});
