// Year in quotes (v65): a recap of your year. Every answer and game adds to that calendar year's
// tally (answers, right, games, best score, best streak, the days you played, genres); the Stats
// screen opens the recap and shares it as a card. record() and recap() are pure, for yearly.test.js.
(function (root) {
  const SIZE = 1080;
  const empty = () => ({ answers: 0, right: 0, games: 0, best: 0, streak: 0, days: [], genres: {} });
  function record(y, event, d, date = new Date()) {
    const s = { ...empty(), ...y, genres: { ...(y?.genres || {}) }, days: [...(y?.days || [])] };
    const day = date.toISOString().slice(0, 10);
    if (!s.days.includes(day)) s.days.push(day);
    if (event === 'answer') {
      s.answers++;
      if (d.correct) { s.right++; s.genres[d.q.genre] = (s.genres[d.q.genre] || 0) + 1; }
      s.streak = Math.max(s.streak, d.streak || 0);
    } else if (event === 'game') { s.games++; if (!d.speed) s.best = Math.max(s.best, d.score || 0); }
    return s;
  }
  function recap(y) {
    if (!y || y.answers < 1) return null;
    const top = Object.entries(y.genres).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    return { answers: y.answers, right: y.right, pct: Math.round(100 * y.right / y.answers), games: y.games, best: y.best, streak: y.streak, days: y.days.length, top };
  }
  const api = { record, recap, empty };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.Yearly = api;

  const key = (yr) => `quotestreak_year_${yr}`;
  const load = (yr) => { try { return JSON.parse(localStorage.getItem(key(yr))) || empty(); } catch { return empty(); } };
  const before = window.quotableBadge;
  window.quotableBadge = (event, d = {}) => {
    if (event === 'answer' || event === 'game') { const yr = new Date().getFullYear(); try { localStorage.setItem(key(yr), JSON.stringify(record(load(yr), event, d))); } catch {} }
    before(event, d);
  };
  const T = (t) => root.I18N ? root.I18N.t(t) : t;
  function lines(r, yr) {
    return [
      [String(r.answers), T('lines answered')], [`${r.pct}%`, T('right')], [String(r.days), T(r.days === 1 ? 'day played' : 'days played')],
      [String(r.best), T('best game')], [String(r.streak), T('longest streak')],
    ];
  }
  $('year-btn').textContent = T(`Your ${new Date().getFullYear()} in quotes`);
  $('year-btn').onclick = () => {
    const yr = new Date().getFullYear(), r = recap(load(yr));
    $('year-title').textContent = T(`Your ${yr} in quotes`);
    $('year-body').innerHTML = !r ? `<p class="prompt">${T('Play a game and your year starts here.')}</p>`
      : `<dl class="year-grid">${lines(r, yr).map(([n, l]) => `<div><dt>${n}</dt><dd>${l}</dd></div>`).join('')}</dl>`
        + (r.top.length ? `<p class="prompt">${T('Most at home in')} ${r.top.map(g => T(label(g))).join(', ')}</p>` : '');
    $('year-share').classList.toggle('hidden', !r);
    $('stats').classList.add('hidden');
    $('year').classList.remove('hidden');
  };
  $('year-back').onclick = () => { $('year').classList.add('hidden'); $('stats').classList.remove('hidden'); };
  $('year-share').onclick = async () => {
    const yr = new Date().getFullYear(), r = recap(load(yr));
    if (!r) return;
    const c = document.createElement('canvas');
    c.width = c.height = SIZE;
    const x = c.getContext('2d'), font = (w, px) => `${w} ${px}px "Quip Sans", -apple-system, Helvetica, sans-serif`;
    await Promise.all([500, 600, 700].map(w => document.fonts?.load(font(w, 40)).catch(() => {})));
    x.fillStyle = '#15161a'; x.fillRect(0, 0, SIZE, SIZE);
    x.fillStyle = '#ffcc00'; x.font = font(700, 72); x.fillText(T(`Your ${yr} in quotes`), 80, 160);
    lines(r, yr).forEach(([n, l], i) => {
      const col = i % 2, row = Math.floor(i / 2), X = 80 + col * 480, Y = 330 + row * 200;
      x.fillStyle = '#f5f5f7'; x.font = font(700, 96); x.fillText(n, X, Y);
      x.fillStyle = '#a1a1aa'; x.font = font(500, 36); x.fillText(l, X, Y + 52);
    });
    x.fillStyle = '#ffcc00'; x.font = font(600, 34); x.fillText('coda.jaybulb.com', 80, 1010);
    const blob = await new Promise(res => c.toBlob(res, 'image/png'));
    const files = blob ? [new File([blob], `quotestreak-${yr}.png`, { type: 'image/png' })] : [];
    if (files.length && navigator.canShare?.({ files })) return navigator.share({ files }).catch(() => {});
    if (blob) Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `quotestreak-${yr}.png` }).click();
  };
})(this);
