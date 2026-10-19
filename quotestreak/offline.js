// Offline packs (v68): pick genres before a flight and their poster and album art is saved, along with
// the game itself, in a cache the service worker keeps across releases ('quotestreak-offline').
// Without it the game still runs offline from the release cache, but the art flash comes up blank.
// Classic script after game.js (uses $, quotes, label, modeSelect); offline.test.js requires it.
(function (root) {
  const CACHE = 'quotestreak-offline';
  // The art a set of genres needs, once each.
  const art = (bank, genres) => [...new Set(bank.filter(q => q.art && genres.includes(q.genre)).map(q => q.art))];
  const api = { CACHE, art };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.Offline = api;

  const KEY = 'quotestreak_offline';
  const saved = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const status = (t) => { $('offline-status').textContent = t; };
  function list() {
    const have = saved(), count = {};
    quotes.forEach(q => count[q.genre] = (count[q.genre] || 0) + 1);
    $('offline-list').innerHTML = Object.keys(count).sort().map(g =>
      `<li><label><input type="checkbox" value="${g}"${have.includes(g) ? ' checked' : ''}> ${label(g)}</label><small>${count[g]} lines</small></li>`).join('');
    status(have.length ? `Saved for offline: ${have.map(label).join(', ')}` : 'Nothing saved yet.');
  }
  // The game's own files, as this page loaded them, so a cold start on a plane still opens.
  const shell = () => [location.pathname, 'quotes.json', 'quotes-more.json', 'world-data.json', 'icon.svg',
    ...(I18N.lang === 'en' ? [] : [`locales/${I18N.lang}.json`]),
    ...[...document.scripts].map(s => s.src).filter(Boolean),
    ...[...document.querySelectorAll('link[rel=stylesheet]')].map(l => l.href), 'brand/tokens.css', 'brand/jaybulb-tokens.css', 'features.css',
    ...['idle', 'cheer', 'oops', 'streak'].flatMap(p => [`brand/quip-${p}.svg`, `brand/quip-${p}-dark.svg`]),   // medals use these too
    ...['Regular', 'Medium', 'Semibold', 'Bold'].map(w => `/fonts/QuipSans-${w}.woff2`),
    ...[...document.querySelectorAll('img.quip')].map(i => i.currentSrc || i.src)];

  async function save() {
    const genres = [...$('offline-list').querySelectorAll('input:checked')].map(i => i.value);
    if (!genres.length || !window.caches) return status('Pick at least one genre.');
    $('offline-save').disabled = true;
    const c = await caches.open(CACHE), urls = [...shell(), ...art(quotes, genres)];
    let done = 0;
    for (const u of urls) {
      // ponytail: one at a time, a few hundred files at most; parallel if it ever feels slow.
      await fetch(u, { mode: 'cors' }).then(r => r.ok && c.put(u, r)).catch(() => {});
      status(`Saving ${++done} of ${urls.length}`);
    }
    try { localStorage.setItem(KEY, JSON.stringify(genres)); } catch {}
    $('offline-save').disabled = false;
    list();
  }

  $('start-offline').onclick = () => { modeSelect.classList.add('hidden'); $('offline').classList.remove('hidden'); list(); };
  $('offline-back').onclick = () => { $('offline').classList.add('hidden'); modeSelect.classList.remove('hidden'); };
  $('offline-save').onclick = save;
  $('offline-clear').onclick = async () => { await caches.delete(CACHE); try { localStorage.removeItem(KEY); } catch {} list(); };
})(this);
