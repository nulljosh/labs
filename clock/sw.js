// Offline: serve the shell from cache, refresh it in the background.
const CACHE = 'clock-3.0.0';   // must contain VERSION from lib.js, test/lib.test.js checks
// Clean URLs only: Cloudflare redirects /app.html to /app, and a cached redirect breaks the next launch.
const SHELL = ['./', 'app', 'tokens.css', 'landing.css', 'style.css', 'lib.js', 'coords.js', 'core.js', 'world.js', 'alarms.js', 'stopwatch.js', 'timers.js', 'app.js', 'manifest.webmanifest', 'icon.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(r => { if (r.ok && !r.redirected) caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; }).catch(() => hit);
    return hit || net;
  }));
});
