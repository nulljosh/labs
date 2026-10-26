// Offline: serve the shell from cache, refresh it in the background.
const CACHE = 'horula-21.4.0';   // must contain VERSION from lib.js, test/lib.test.js checks
// Clean URLs only: Cloudflare redirects /app.html to /app, and a cached redirect breaks the next launch.
const SHELL = ['./', 'app', 'tokens.css', 'landing.css', 'style.css', 'i18n.js', 'lang/fr.js', 'lang/es.js', 'lang/de.js', 'lang/ja.js', 'lang/zh.js', 'lang/pt.js', 'lang/ko.js', 'lang/it.js', 'lang/nl.js', 'lang/ar.js', 'lang/hi.js', 'cities/fr.js', 'cities/es.js', 'cities/de.js', 'cities/ja.js', 'cities/zh.js', 'cities/pt.js', 'cities/ko.js', 'cities/it.js', 'cities/nl.js', 'cities/ar.js', 'cities/hi.js', 'lib.js', 'coords.js', 'core.js', 'world.js', 'alarms.js', 'stopwatch.js', 'timers.js', 'app.js', 'manifest.webmanifest', 'icon.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(r => { if (r.ok && !r.redirected) caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; }).catch(() => hit);
    return hit || net;
  }));
});
