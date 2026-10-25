// Offline: serve the shell from cache, refresh it in the background.
const CACHE = 'clock-v8';
const SHELL = ['./', 'index.html', 'app.html', 'tokens.css', 'landing.css', 'fonts/ClockSans-Regular.woff2', 'fonts/ClockSans-Medium.woff2', 'fonts/ClockSans-Semibold.woff2', 'fonts/ClockSans-Bold.woff2', 'fonts/ClockDisplay-Bold.woff2', 'style.css', 'core.js', 'world.js', 'alarms.js', 'stopwatch.js', 'timers.js', 'app.js', 'manifest.webmanifest', 'icon.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(r => { if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; }).catch(() => hit);
    return hit || net;
  }));
});
