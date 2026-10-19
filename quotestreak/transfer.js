// Sync without an account (v69). The native apps carry the best score over iCloud; on the web a transfer
// link carries everything this browser keeps (badges, stats, streaks, watchlist, settings) to another one.
// The progress rides in the #hash, which never reaches a server. Opening the link asks before replacing
// anything, and the higher best score wins. Classic script after settings.js; transfer.test.js requires it.
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
  const merge = (local, incoming) => {
    const out = { ...incoming };
    if (local[HIGH] && +local[HIGH] > +(incoming[HIGH] || 0)) out[HIGH] = local[HIGH];
    return out;
  };
  const api = { pick, pack, unpack, merge };
  if (typeof module !== 'undefined') { module.exports = api; return; }

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
