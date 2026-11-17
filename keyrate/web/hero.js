// Hero scene, after Cartons. The keyboard under the title types real quotes from the test at about 80 wpm; now and then
// a neighbouring key flashes red, the slip is fixed, and the five keys missed most keep a red ring, the way the result
// screen shows them. Loose keycaps drift at three depths. Every layer eases toward the scroll position at its own
// speed, and the scene leans away from the pointer on desktop. Reduced motion gets a still scene.
import { QUOTES } from './words.js';
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const NEAR = {}; // keys next to each other on the board, for believable slips
ROWS.forEach((r, i) => [...r].forEach((ch, j) => {
  NEAR[ch] = [r[j - 1], r[j + 1], ROWS[i - 1]?.[j], ROWS[i - 1]?.[j + 1], ROWS[i + 1]?.[j], ROWS[i + 1]?.[j - 1]].filter(Boolean);
}));

const ground = document.querySelector('.ground'), board = document.getElementById('kboard');
const keys = {};
if (board) {
  const kb = board.appendChild(el('div', 'kb'));
  for (const r of ROWS) { const row = kb.appendChild(el('div', 'kb-row')); for (const ch of r) keys[ch] = row.appendChild(el('span', 'key', ch)); }
  keys[' '] = kb.appendChild(el('div', 'kb-row')).appendChild(el('span', 'key space'));
  const misses = {};
  const ring = () => {
    const worst = Object.entries(misses).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k);
    for (const k in keys) keys[k].classList.toggle('worst', worst.includes(k));
  };
  if (still) { ['e', 't', 'a', 'h', 'n'].forEach((k) => (misses[k] = 1)); ring(); }
  else (async () => {
    await wait(700);
    for (let q = Math.floor(Math.random() * QUOTES.length); ; q++) {
      const text = QUOTES[q % QUOTES.length].toLowerCase();
      for (const ch of text) {
        const k = keys[ch];
        if (!k) { await wait(90); continue; } // punctuation: no key on this board
        const near = NEAR[ch];
        if (near && Math.random() < .045) { // a slip: the wrong key goes red, then backspace
          const bad = keys[near[Math.floor(Math.random() * near.length)]];
          bad.classList.add('miss'); await wait(240); bad.classList.remove('miss');
          misses[ch] = (misses[ch] || 0) + 1; ring(); await wait(160);
        }
        k.classList.add('down'); await wait(70); k.classList.remove('down');
        await wait(60 + Math.random() * 110 + (ch === ' ' ? 40 : 0));
      }
      await wait(1400);
    }
  })();
}

// Loose keycaps at three depths; the middle stays clear for the title.
const sky = document.getElementById('ksky');
const layers = [];
if (sky) {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const few = innerWidth < 600;
  const letters = 'qwertyuiopasdfghjklzxcvbnm';
  const depths = [
    { cls: 'far', n: 12, size: 22, lag: .7, o: .45, tilt: 10, spin: .02 },
    { cls: 'mid', n: 9, size: 38, lag: .35, o: .7, tilt: 20, spin: .05 },
    { cls: 'near', n: 6, size: 68, lag: -.35, o: .95, tilt: 36, spin: .1 },
  ];
  for (const d of depths) {
    const layer = sky.appendChild(el('div', 'layer ' + d.cls));
    const n = few ? (d.cls === 'near' ? 0 : Math.ceil(d.n / 2)) : d.n;
    for (let i = 0; i < n; i++) {
      // stratified: alternate sides, each cap in its own slice of height, jittered, so none pile up
      const side = i % 2, slot = Math.floor(i / 2), slots = Math.ceil(n / 2);
      const band = d.cls === 'far' ? 24 : 13; // big caps keep to the edges, clear of the headline
      const x = side ? 98 - band + rnd() * band - 4 : 2 + rnd() * band;
      const y = 4 + (slot + .15 + rnd() * .7) * (78 / slots);
      const red = d.cls !== 'far' && rnd() < .2;
      const c = layer.appendChild(el('span', 'cap' + (red ? ' red' : ''), letters[(i * 11 + layers.length * 5 + 3) % letters.length]));
      c.style.cssText = `left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;--s:${d.size}px;opacity:${d.o};` +
        `animation-duration:${(5 + rnd() * 5).toFixed(1)}s;animation-delay:${(-rnd() * 10).toFixed(1)}s;--r:${Math.round(rnd() * 40 - 20)}deg`;
      c.dataset.spin = ((rnd() < .5 ? -1 : 1) * d.spin * (.6 + rnd() * .8)).toFixed(3);
    }
    layers.push({ layer, lag: d.lag, tilt: d.tilt, caps: [...layer.children] });
  }
}

// Parallax, eased toward the target each frame so a flick of the wheel glides. The copy lifts and fades.
const copy = document.querySelector('.lp-hero .hero-copy');
if (!still) {
  const now = { y: scrollY, px: 0, py: 0 }, goal = { y: scrollY, px: 0, py: 0 };
  let running = false;
  const frame = () => {
    let moving = false;
    for (const k in now) {
      const d = goal[k] - now[k];
      now[k] = Math.abs(d) < .05 ? goal[k] : now[k] + d * .12;
      if (now[k] !== goal[k]) moving = true;
    }
    const y = now.y;
    if (y < innerHeight * 1.4) {
      if (ground) ground.style.transform = `translate3d(${(now.px * 8).toFixed(2)}px,${(y * .55 + now.py * 5).toFixed(2)}px,0)`;
      for (const { layer, lag, tilt, caps } of layers) {
        layer.style.transform = `translate3d(${(now.px * tilt).toFixed(2)}px,${(y * lag + now.py * tilt * .6).toFixed(2)}px,0)`;
        for (const c of caps) c.style.rotate = `${(y * c.dataset.spin).toFixed(2)}deg`;
      }
      if (copy) { copy.style.transform = `translate3d(0,${(y * .2).toFixed(2)}px,0)`; copy.style.opacity = Math.max(0, 1 - y / (innerHeight * .7)); }
    }
    running = moving;
    if (moving) requestAnimationFrame(frame);
  };
  const kick = () => { if (!running) { running = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', () => { goal.y = scrollY; kick(); }, { passive: true });
  if (matchMedia('(pointer: fine)').matches) addEventListener('pointermove', (e) => {
    goal.px = -(e.clientX / innerWidth - .5) * 2; goal.py = -(e.clientY / innerHeight - .5) * 2; kick();
  }, { passive: true });
}
