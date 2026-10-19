// Dress Quip (v66): six outfits drawn by brand/mascot.py into brand/outfits/, unlocked by badges.
// The chosen one is swapped into every Quip on the page by rewriting its src or srcset, including
// the ones game.js sets later (a MutationObserver), so the game code never knows. Medals stay plain.
// Loaded by play.html after badges-ui.js as window.Dress and by dress.test.js through require.
(function (root) {
  const LIST = [
    { id: 'bowtie', title: 'Bow tie', badges: 2 },
    { id: 'headphones', title: 'Headphones', badges: 3 },
    { id: 'beret', title: 'Beret', badges: 6 },
    { id: 'shades', title: 'Sunglasses', badges: 10 },
    { id: 'tophat', title: 'Top hat', badges: 15 },
    { id: 'mortarboard', title: 'Mortarboard', badges: 25 },
  ];
  const open = (count) => LIST.filter(o => count >= o.badges).map(o => o.id);
  // Any Quip path, dressed or not, to the same pose in the given outfit (or none).
  const src = (url, wear) => url.replace(/brand\/(?:outfits\/)?quip-(idle|cheer|oops|streak)(?:-(?!dark\b)[a-z]+)?(-dark)?\.svg/g,
    (_, pose, dark = '') => wear ? `brand/outfits/quip-${pose}-${wear}${dark}.svg` : `brand/quip-${pose}${dark}.svg`);
  const api = { LIST, open, src };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.Dress = api;

  const KEY = 'quotestreak_outfit';
  const sel = document.getElementById('outfit-select');
  const count = Badges.unlocked(badgeStats()).length;
  let wear = '';
  try { wear = localStorage.getItem(KEY) || ''; } catch {}
  if (!open(count).includes(wear)) wear = '';
  function dress(el) {
    for (const a of ['src', 'srcset']) {
      const v = el.getAttribute(a);
      if (v && v.includes('quip-')) { const to = src(v, wear); if (to !== v) el.setAttribute(a, to); }
    }
  }
  const all = () => document.querySelectorAll('img.quip, picture source').forEach(dress);
  sel.innerHTML = `<option value="">None</option>` + LIST.map(o => count >= o.badges
    ? `<option value="${o.id}"${o.id === wear ? ' selected' : ''}>${o.title}</option>`
    : `<option value="${o.id}" disabled>${o.title}, ${o.badges} badges to unlock</option>`).join('');
  sel.onchange = () => { wear = sel.value; try { localStorage.setItem(KEY, wear); } catch {} all(); };
  root.Dress.wearFor = (w) => { wear = w; all(); };   // a day's costume (event.js), not saved
  all();
  new MutationObserver((list) => list.forEach(m => dress(m.target)))
    .observe(document.body, { subtree: true, attributes: true, attributeFilter: ['src', 'srcset'] });
})(this);
