// Family profiles (v70): several players on one device. The active player's progress lives in the usual
// keys, so no other script changes; switching files it away under 'quotestreak_profiles' and brings the
// other player's back, then reloads. Sound, language, theme, contrast and offline packs belong to the
// device and stay put; family mode belongs to the player, so a kid's profile stays kid-safe.
// Classic script after settings.js; profiles.test.js requires it.
(function (root) {
  const BOOK = 'quotestreak_profiles';
  const DEVICE = new Set(['quotable_sfx_on', 'quotable_sfx_vol', 'quotable.lang', 'quotestreak_lang', 'quotestreak_look', 'quotestreak_contrast', 'quotestreak_offline', BOOK]);
  const own = (entries) => Object.fromEntries(entries.filter(([k]) => /^(quotable|quotestreak)[_.]/.test(k) && !DEVICE.has(k)));
  const FIRST = 'Player 1';
  const read = (raw) => { try { const b = JSON.parse(raw); if (b && b.active && b.list) return b; } catch {} return { active: FIRST, list: { [FIRST]: {} } }; };
  // From the live keys and the book, what to remove, what to set, and the new book.
  function swap(book, live, to) {
    const mine = own(live);
    const list = { ...book.list, [book.active]: mine };
    if (!(to in list)) list[to] = {};
    return { book: { active: to, list }, remove: Object.keys(mine), set: list[to] };
  }
  const api = { own, read, swap, FIRST };
  if (typeof module !== 'undefined') { module.exports = api; return; }

  const live = () => Object.keys(localStorage).map(k => [k, localStorage.getItem(k)]);
  let book;
  try { book = read(localStorage.getItem(BOOK)); } catch { book = read(null); }
  const sel = $('player-select');
  const esc = (t) => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  sel.innerHTML = Object.keys(book.list).map(n => `<option${n === book.active ? ' selected' : ''}>${esc(n)}</option>`).join('');
  function go(to) {
    const s = swap(book, live(), to);
    try {
      s.remove.forEach(k => localStorage.removeItem(k));
      Object.entries(s.set).forEach(([k, v]) => localStorage.setItem(k, v));
      localStorage.setItem(BOOK, JSON.stringify(s.book));
    } catch {}
    location.reload();
  }
  sel.onchange = () => go(sel.value);
  $('player-add').onclick = () => {
    const name = $('player-name').value.trim().slice(0, 24);
    if (name && !(name in book.list)) go(name);
  };
  // With more than one player, the menu says whose turn it is.
  if (Object.keys(book.list).length > 1) {
    $('player-now').textContent = `Playing as ${book.active}`;
    $('player-now').classList.remove('hidden');
  }
})(this);
