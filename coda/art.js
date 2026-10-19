// Poster and album art: the static backdrop mosaic and the answer-reveal flash. A classic
// script loaded after game.js; it reads game.js's `current` at call time.
// Static mosaic of the bank's artwork behind the game. Reuses the fetch above rather than
// pulling quotes.json twice, and asks for thumbnails, not the full-size art flashArt() uses.
function buildBackdrop(data) {
  const el = $('backdrop');
  if (!el) return;
  el.innerHTML = '';   // rebuilt when family mode changes
  const seen = new Set();
  const art = [];
  data.forEach(q => {
    if (!q.art || seen.has(q.art)) return;
    seen.add(q.art);
    art.push({
      url: q.art.replace('/w500/', '/w185/').replace('/600x600bb.jpg', '/200x200bb.jpg'),
      sq: q.type === 'music',
    });
  });
  if (art.length < 8) return;
  const shuffled = shuffle(art);
  const cols = Math.max(3, Math.ceil(window.innerWidth / 150));
  const per = Math.ceil(window.innerHeight / 150) + 1;
  for (let c = 0; c < cols; c++) {
    const col = document.createElement('div');
    col.className = 'bcol ' + (c % 2 ? 'down' : 'up');
    col.style.setProperty('--dur', (80 + c * 13) + 's');
    // doubled so the drift loops seamlessly
    for (let r = 0; r < per * 2; r++) {
      const a = shuffled[(c * per + r % per) % shuffled.length];
      const img = new Image();
      img.decoding = 'async';          // v91: the wall never holds up the first paint or the clock
      img.fetchPriority = 'low';
      img.src = a.url;
      img.alt = '';
      img.referrerPolicy = 'no-referrer';
      img.onerror = () => img.remove();  // a dead art link leaves a gap, never a broken-image box
      if (a.sq) img.className = 'sq';
      col.appendChild(img);
    }
    el.appendChild(col);
  }
}

// Full-size art is fetched as soon as the question is shown, so a correct answer flashes
// it instantly instead of racing a cold network fetch against the 1100ms round timer.
const artCache = new Map();
function preloadArt(url) {
  if (!url || artCache.has(url)) return;
  const img = new Image();
  img.referrerPolicy = 'no-referrer';
  artCache.set(url, img);
  img.src = url;
}

let artEl = null;
let artHideTimer = null;
function flashArt(url) {
  if (!url) return;
  if (!artEl) {
    artEl = document.createElement('div');
    artEl.id = 'art-flash';
    document.body.appendChild(artEl);
  }
  const show = () => {
    // Back-to-back correct answers: kill the previous hide so it can't cut this one short.
    clearTimeout(artHideTimer);
    artEl.style.backgroundImage = `url("${url}")`;
    artEl.classList.add('show');
    artHideTimer = setTimeout(() => artEl.classList.remove('show'), 950);
  };
  const cached = artCache.get(url);
  if (cached && cached.complete && cached.naturalWidth) return show();
  // Still in flight. Show it when it lands, but only if this question is still on screen —
  // otherwise it flashes the previous round's art over the next quote. A failed load is a
  // no-op rather than a stuck overlay.
  const asked = current;
  const img = new Image();
  img.referrerPolicy = 'no-referrer';
  img.onload = () => { if (current === asked) show(); };
  img.src = url;
}

