// Sync without an account (v69). The native apps carry the best score over iCloud; on the web a transfer
// link carries everything this browser keeps (badges, stats, streaks, watchlist, settings) to another one.
// The progress rides in the #hash, which never reaches a server. Opening the link asks before replacing
// anything, and nothing is lost: see merge. Classic script after settings.js; transfer.test.js requires it.
(function (root) {
  const KEEP = /^(quotable|quotestreak)[_.]/;
  const LOCAL = new Set(['quotestreak_offline']);   // describes this browser's cache, not the player
  const HIGH = 'quotable_high_score';
  const b64 = (s) => (typeof Buffer !== 'undefined' ? Buffer.from(s, 'utf8').toString('base64')
    : btoa(String.fromCharCode(...new TextEncoder().encode(s)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/');
    return typeof Buffer !== 'undefined' ? Buffer.from(s, 'base64').toString('utf8')
      : new TextDecoder().decode(Uint8Array.from(atob(s), c => c.charCodeAt(0))); };
  // {key: value} of what a player owns, from any Storage-like list of entries.
  const pick = (entries) => Object.fromEntries(entries.filter(([k]) => KEEP.test(k) && !LOCAL.has(k)));
  const pack = (data) => b64(JSON.stringify(data));
  const unpack = (code) => { try { const d = JSON.parse(unb64(code)); return d && typeof d === 'object' && !Array.isArray(d) ? pick(Object.entries(d).filter(([, v]) => typeof v === 'string')) : null; } catch { return null; } };
  // Never lose (v92): progress from both devices is kept. Counts keep the larger, lists join, the
  // daily streak keeps the later day, and settings stay as this device has them.
  const deep = (a, b) => {
    if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.every(x => typeof x === 'number') && b.every(x => typeof x === 'number')) return a.length >= b.length ? a.map((x, i) => Math.max(x, b[i] ?? 0)) : deep(b, a);
      const seen = new Map();   // lists of things (the watchlist): one of each
      for (const x of [...a, ...b]) { const k = typeof x === 'object' && x ? `${x.title}|${x.year}|${x.kind}` : JSON.stringify(x); if (!seen.has(k)) seen.set(k, x); }
      return [...seen.values()];
    }
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const out = { ...b, ...a };
      for (const k of Object.keys(b)) if (k in a) out[k] = deep(a[k], b[k]);
      return out;
    }
    return a ?? b;
  };
  const PROGRESS = new Set(['quotestreak_badges', 'quotestreak_stats', 'quotestreak_seasons', 'quotestreak_practice', 'quotestreak_watchlist', 'quotestreak_profiles']);
  const DAYS = new Set(['quotable_daily_streak', 'quotable_daily']);
  function combine(key, mine, theirs) {
    if (mine == null) return theirs;
    if (theirs == null) return mine;
    if (key === HIGH) return String(Math.max(+mine || 0, +theirs || 0));
    if (key === 'quotestreak_cup_played') return mine > theirs ? mine : theirs;
    if (!PROGRESS.has(key) && !DAYS.has(key)) return mine;   // a setting: this device's choice stays
    let a, b;
    try { a = JSON.parse(mine); b = JSON.parse(theirs); } catch { return mine; }
    if (DAYS.has(key)) { const da = a.lastDay ?? a.day ?? 0, db = b.lastDay ?? b.day ?? 0; return JSON.stringify(da > db || (da === db && (a.count ?? 0) >= (b.count ?? 0)) ? a : b); }
    const out = deep(a, b);
    if (key === 'quotestreak_stats') out.history = (a.history || []).length >= (b.history || []).length ? a.history : b.history;
    if (key === 'quotestreak_profiles') out.active = a.active;
    return JSON.stringify(out);
  }
  const merge = (local, incoming) => Object.fromEntries([...new Set([...Object.keys(local), ...Object.keys(incoming)])].map(k => [k, combine(k, local[k], incoming[k])]));
  const api = { pick, pack, unpack, merge, combine };
  if (typeof module !== 'undefined') { module.exports = api; return; }

  // The incoming panel's markup lives here, not in play.html, which is at the size limit.
  modeSelect.insertAdjacentHTML('beforebegin', `<div id="transfer-in" class="panel hidden">
      <h2>Bring your progress over?</h2>
      <p class="prompt">This link carries badges, stats, streaks and settings from another device. Nothing is lost: counts keep the larger, lists join, and this device keeps its own settings.</p>
      <button id="transfer-yes">Bring it over</button>
      <button id="transfer-no" class="secondary">Not now</button>
    </div>`);
  const mine = () => pick(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)]));
  $('transfer-copy').onclick = async () => {
    const link = `${location.origin}${location.pathname}#sync=${pack(mine())}`;
    try { await navigator.clipboard.writeText(link); $('transfer-note').textContent = 'Link copied. Open it on your other device.'; }
    catch { $('transfer-note').textContent = link; }
  };
  const incoming = (location.hash.match(/^#sync=([\w-]+)$/) || [])[1];
  const data = incoming && unpack(incoming);
  if (!data) return;
  history.replaceState(null, '', location.pathname);   // keep the progress out of the address bar and history
  $('transfer-in').classList.remove('hidden');
  modeSelect.classList.add('hidden');
  $('transfer-yes').onclick = () => {
    try { Object.entries(merge(mine(), data)).forEach(([k, v]) => localStorage.setItem(k, v)); } catch {}
    location.reload();
  };
  $('transfer-no').onclick = () => { $('transfer-in').classList.add('hidden'); modeSelect.classList.remove('hidden'); };
})(this);
