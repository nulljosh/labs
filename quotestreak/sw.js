// ponytail: network-first for pages, cache-first for the hashed assets they name.
// Bump CACHE to evict everything a previous version stored.
const CACHE = "quotestreak-v119";
const OFFLINE = "quotestreak-offline";   // offline packs (v68): kept across releases, filled by offline.js
const FILES = ["/", "/index.html","/play.html","/privacy.html", "/manifest.webmanifest"];

self.addEventListener("install", e => {
  // A single missing file fails the whole addAll, so tolerate misses.
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== OFFLINE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const save = (req, res) => {
  if (res.ok && res.type === "basic") {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy));
  }
  return res;
};

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // Poster and album art saved by an offline pack; art is immutable, so the saved copy wins.
  if (new URL(e.request.url).origin !== location.origin) {
    if (e.request.destination === "image") e.respondWith(caches.open(OFFLINE)
      .then(c => c.match(e.request, { ignoreVary: true })).then(hit => hit || fetch(e.request)));
    // The shared jaybulb tokens can change, so the saved copy is only the fallback.
    else if (e.request.destination === "style") e.respondWith(fetch(e.request)
      .catch(() => caches.open(OFFLINE).then(c => c.match(e.request, { ignoreVary: true }))));
    return;   // APIs stay network-only
  }

  // HTML must never come from cache first: it names the hashed bundles, so one
  // stale page pins a whole stale build and the site stops shipping updates to
  // anyone who has already visited. Network first, cache only as an offline fallback.
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(res => save(e.request, res))
        .catch(() => caches.match(e.request, { ignoreSearch: true })
          .then(hit => hit || caches.match(FILES[0])))
    );
    return;
  }

  // Everything else: this release's cache, then the network, then an offline pack's older copy.
  e.respondWith(
    caches.open(CACHE).then(c => c.match(e.request, { ignoreSearch: true })).then(hit => hit ||
      fetch(e.request).then(res => save(e.request, res))
        .catch(() => caches.match(e.request, { ignoreSearch: true })))
  );
});
