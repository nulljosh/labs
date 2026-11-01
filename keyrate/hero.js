// Hero wall: Keyrate's test, typing itself. Real words and quotes from the test's own list; now and then a wrong
// letter goes red and is fixed with backspace, like the test. Live words per minute on the standard 5-character word.
import { WORDS, QUOTES } from './words.js';
const wall = document.getElementById('kwall');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (wall) {
  const n = innerWidth <= 560 ? 5 : innerWidth <= 900 ? 6 : 9;
  const list = (Array.isArray(WORDS) ? WORDS : String(WORDS).split(/\s+/)).filter(Boolean).slice(0, 200);
  const pick = (i) => i % 2 ? QUOTES[(i * 7) % QUOTES.length] : Array.from({ length: 14 }, (_, k) => list[(i * 31 + k * 17) % list.length]).join(' ');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  for (let i = 0; i < n; i++) {
    const c = wall.appendChild(el('div', 'kc')), hd = c.appendChild(el('div', 'kc-hd')), txt = c.appendChild(el('div', 'kc-txt'));
    const wpm = el('b', '', '0'), acc = el('span', '', '100%'), mode = el('span', '', i % 2 ? 'quote' : '30s');
    hd.append(wpm, el('span', '', 'wpm'), acc, mode);
    const speed = 62 + (i * 13) % 55; // each card a different typist, 62 to 116 wpm
    let round = i;
    const play = async () => {
      const s = pick(round++), spans = [...s].map((ch) => el('span', '', ch));
      txt.replaceChildren(...spans);
      if (still) { spans.forEach((sp) => sp.className = 'ok'); wpm.textContent = speed; return; }
      const gap = 60000 / (speed * 5); let errs = 0, keys = 0; const t0 = performance.now();
      for (let k = 0; k < spans.length; k++) {
        spans[k].classList.add('cur');
        if (Math.random() < .035 && s[k] !== ' ') { // a slip: red, then backspace
          spans[k].className = 'bad'; errs++; keys++; await wait(gap * 2.5); spans[k].className = 'cur'; await wait(gap);
        }
        await wait(gap * (.6 + Math.random() * .8)); keys++;
        spans[k].className = 'ok';
        const min = (performance.now() - t0) / 60000;
        wpm.textContent = Math.round((k + 1) / 5 / Math.max(min, 1 / 60)); acc.textContent = Math.round((1 - errs / keys) * 100) + '%';
      }
      await wait(2600);
    };
    (async () => { await wait(i * 220); if (still) return play(); for (;;) await play(); })();
  }
}

// Hero parallax: the wall drifts at 0.45, the copy lifts at 0.2 and fades. Off under reduced motion.
const bg = document.querySelector('.hero-bg'), copy = document.querySelector('.lp-hero .hero-copy');
if (bg && copy && !still) {
  let t = 0;
  addEventListener('scroll', () => {
    if (t) return;
    t = requestAnimationFrame(() => {
      t = 0; const y = scrollY, h = innerHeight; if (y > h * 1.2) return;
      bg.style.setProperty('--py', `${y * .45}px`);
      copy.style.transform = `translate3d(0,${y * .2}px,0)`; copy.style.opacity = Math.max(0, 1 - y / (h * .7));
    });
  }, { passive: true });
}
