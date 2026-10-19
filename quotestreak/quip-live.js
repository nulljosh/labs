// Quip lives (v95): Quip drawn in code, a line-for-line port of brand/mascot.py, so the game can show
// him reacting in the round: blinking while you think, cheering a right answer, a sweat drop on a miss,
// leaning in on a streak, wide-eyed in a speed round's last three seconds. quip-live.test.js checks the
// four poses match mascot.py's SVG files byte for byte. Outfits stay on the image Quips (dress.js).
// Classic script after game.js; window.QuipLive.
(function (root) {
  const YELLOW = '#ffcc00', INK = '#15161a', SNOW = '#f5f5f7';
  const f1 = (n) => (Math.round(n * 10) / 10).toFixed(1);
  function body(cx, cy, r, d) {
    const pts = (...xy) => xy.map(([x, y]) => `${f1(cx - x)},${f1(cy + y)}`).join(' ');
    const tail = `M${pts([r, 0])} C${pts([r, -0.56 * d], [0.35 * r, -0.85 * d], [-0.75 * r, -d])} `
      + `C${pts([-0.15 * r, -0.78 * d], [0.05 * r, -0.56 * d], [-0.2 * r, -0.33 * d])} Z`;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${YELLOW}"/><path d="${tail}" fill="${YELLOW}"/>`;
  }
  function eye(x, y, kind) {
    if (kind === 'open') return `<ellipse cx="${x}" cy="${y}" rx="17" ry="24" fill="${INK}"/><circle cx="${x + 6}" cy="${y - 9}" r="6" fill="#fff"/>`;
    if (kind === 'happy') return `<path d="M${x - 18},${y + 6} Q${x},${y - 18} ${x + 18},${y + 6}" stroke="${INK}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    if (kind === 'wide') return `<circle cx="${x}" cy="${y}" r="24" fill="#fff" stroke="${INK}" stroke-width="7"/><circle cx="${x}" cy="${y + 2}" r="9" fill="${INK}"/>`;
    if (kind === 'focus') return `<ellipse cx="${x}" cy="${y + 4}" rx="16" ry="19" fill="${INK}"/><circle cx="${x + 6}" cy="${y - 3}" r="5" fill="#fff"/>`
      + `<path d="M${x - 24},${y - 22} L${x + 22},${y - 10}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`;
    if (kind === 'shut') return `<path d="M${x - 17},${y} L${x + 17},${y}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`;   // a blink, code only
    return '';
  }
  const limb = (d, ink = INK) => `<path d="${d}" stroke="${ink}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  // name: idle | cheer | oops | streak, as mascot.py; eyes overrides the pose's eyes (blink, worry).
  function svg(name, ink = INK, eyesOverride = null) {
    const cx = 256, cy = 330, r = 132;
    let tilt = 0, extra = '';
    const feet = `<ellipse cx="${cx - 52}" cy="${cy + r + 4}" rx="34" ry="14" fill="${ink}"/><ellipse cx="${cx + 52}" cy="${cy + r + 4}" rx="34" ry="14" fill="${ink}"/>`;
    const mouth = {
      idle: `<path d="M${cx - 26},${cy + 34} Q${cx},${cy + 58} ${cx + 26},${cy + 34}" stroke="${INK}" stroke-width="10" fill="none" stroke-linecap="round"/>`,
      cheer: `<path d="M${cx - 36},${cy + 26} Q${cx},${cy + 92} ${cx + 36},${cy + 26} Z" fill="${INK}"/>`
        + `<path d="M${cx - 18},${cy + 58} Q${cx},${cy + 46} ${cx + 18},${cy + 58} Q${cx},${cy + 76} ${cx - 18},${cy + 58}" fill="#ff6fae"/>`,
      oops: `<path d="M${cx - 30},${cy + 50} q10,-12 20,0 t20,0 t20,0" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
      streak: `<path d="M${cx - 30},${cy + 36} Q${cx},${cy + 62} ${cx + 34},${cy + 30}" stroke="${INK}" stroke-width="10" fill="none" stroke-linecap="round"/>`,
    }[name];
    const eyes = eyesOverride || { idle: 'open', cheer: 'happy', oops: 'wide', streak: 'focus' }[name];
    const arms = {
      idle: limb(`M${cx - r + 6},${cy + 40} q-34,26 -26,62`, ink) + limb(`M${cx + r - 6},${cy + 40} q34,26 26,62`, ink),
      cheer: limb(`M${cx - r + 10},${cy - 10} q-40,-30 -36,-86`, ink) + limb(`M${cx + r - 10},${cy - 10} q40,-30 36,-86`, ink),
      oops: limb(`M${cx - r + 8},${cy + 30} q-30,-10 -20,-70`, ink) + limb(`M${cx + r - 8},${cy + 30} q30,-10 20,-70`, ink),
      streak: limb(`M${cx - r + 10},${cy + 50} q-30,30 -62,34`, ink) + limb(`M${cx + r - 6},${cy + 40} q44,6 64,-30`, ink),
    }[name];
    if (name === 'cheer') extra = [`M${cx - 190},${cy - 190} l-24,-24`, `M${cx + 170},${cy - 170} l26,-26`, `M${cx - 214},${cy - 110} l-32,0`, `M${cx + 200},${cy - 100} l32,0`].map(d => limb(d, ink)).join('');
    if (name === 'oops') extra = `<path d="M${cx + 150},${cy - 150} q30,40 0,62 q-30,-22 0,-62 Z" fill="#5B9BD5"/>`;
    if (name === 'streak') { tilt = -10; extra = [[22, cy - 110, 80], [6, cy - 50, 104], [34, cy + 10, 66]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="22" rx="11" fill="${ink}"/>`).join(''); }
    const face = eye(cx - 46, cy - 14, eyes) + eye(cx + 46, cy - 14, eyes) + mouth;
    const figure = `<g transform="rotate(${tilt} ${cx} ${cy})">${arms}${feet}${body(cx, cy, r, 1.95 * r)}${face}</g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${extra}${figure}</svg>\n`;
  }
  const api = { svg, INK, SNOW };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.QuipLive = api;

  // In the round: a small Quip in the card's corner. Purely decorative for screen readers.
  const host = document.createElement('div');
  host.id = 'quip-live';
  host.setAttribute('aria-hidden', 'true');
  gameEl.prepend(host);
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  let mood = 'idle', until = 0, blinkAt = 0, blinkTill = 0;
  const ink = () => (document.documentElement.dataset.theme === 'dark' ? SNOW : INK);
  let last = '';
  function draw() {
    const now = Date.now();
    if (now > until) mood = streak >= 5 ? 'streak' : 'idle';
    if (!still.matches && now > blinkAt) { blinkTill = now + 140; blinkAt = now + 2500 + Math.random() * 3000; }
    const worried = speedMode && !gameEl.classList.contains('hidden') && timeLeft <= 3 && timeLeft > 0 && mood !== 'cheer' && mood !== 'oops';
    const eyes = now < blinkTill && mood !== 'cheer' ? 'shut' : worried ? 'wide' : null;
    const html = svg(mood, ink(), eyes);
    if (html !== last) host.innerHTML = last = html;
  }
  setInterval(() => { if (!gameEl.classList.contains('hidden')) draw(); }, 120);
  const before = window.quotableBadge;
  window.quotableBadge = (event, d = {}) => {
    if (event === 'answer') { mood = d.correct ? (d.streak >= 5 && d.streak % 5 === 0 ? 'streak' : 'cheer') : 'oops'; until = Date.now() + 1100; draw(); }
    return before?.(event, d);
  };
})(this);
