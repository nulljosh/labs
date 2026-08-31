// ponytail: network-first, cache as the offline fallback. Cache-first was
// serving stale HTML and CSS after every deploy, which is worse than a slow
// first paint on a site that redeploys constantly.
const CACHE = "journal-v3";
const FILES = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", e => {
  // A single missing file fails the whole addAll, so tolerate misses.
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  // Same-origin GETs only; APIs are cross-origin and stay network-only.
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      // Keep a copy for offline. Opaque/error responses are not worth storing.
      if (res.ok && res.type === "basic") {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() =>
      // Offline: serve what we have, and still give a navigation the app shell.
      caches.match(e.request, { ignoreSearch: true }).then(hit =>
        hit || (e.request.mode === "navigate" ? caches.match(FILES[0]) : Promise.reject(new Error("offline"))))
    )
  );
});
