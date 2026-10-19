// Taste card (v64): what you play and where you shine, on one square image to share. From the player's
// own stats (stats.js): the genres you answer most, each with your hit rate, and your best decade.
// summary() is pure, for taste.test.js; draw() paints the card in the browser like sharecard.js.
(function (root) {
  const SIZE = 1080;
  function summary(stats) {
    const rows = (bag) => Object.entries(bag || {}).map(([key, [right, seen]]) => ({ key, right, seen, pct: Math.round(100 * right / seen) }));
    const genres = rows(stats.genres).sort((a, b) => b.seen - a.seen || b.pct - a.pct);
    const total = genres.reduce((n, g) => n + g.seen, 0);
    const decades = rows(stats.decades).filter(d => d.seen >= 5).sort((a, b) => b.pct - a.pct || b.seen - a.seen);
    return total < 10 ? null : {
      total, right: genres.reduce((n, g) => n + g.right, 0),
      top: genres.slice(0, 4).map(g => ({ ...g, share: g.seen / total })),
      decade: decades[0] ? +decades[0].key : null,
    };
  }
  async function draw(s, labelOf = (k) => k) {
    const c = document.createElement('canvas');
    c.width = c.height = SIZE;
    const x = c.getContext('2d'), font = (w, px) => `${w} ${px}px "Quip Sans", -apple-system, Helvetica, sans-serif`;
    const T = root.I18N ? root.I18N.t : (t) => t;   // canvas text is out of the page translator's reach
    await Promise.all([500, 600, 700].map(w => document.fonts?.load(font(w, 40)).catch(() => {})));
    x.fillStyle = '#15161a'; x.fillRect(0, 0, SIZE, SIZE);
    x.fillStyle = '#ffcc00'; x.font = font(700, 64); x.fillText(T('My taste in lines'), 80, 150);
    x.fillStyle = '#f5f5f7'; x.font = font(500, 36);
    x.fillText(T(`${s.total} answered, ${Math.round(100 * s.right / s.total)}% right`), 80, 215);
    s.top.forEach((g, i) => {
      const y = 330 + i * 140;
      x.fillStyle = '#f5f5f7'; x.font = font(600, 44); x.fillText(labelOf(g.key), 80, y);
      x.font = font(500, 32); x.fillStyle = '#a1a1aa'; x.textAlign = 'right'; x.fillText(T(`${g.pct}% right`), SIZE - 80, y); x.textAlign = 'left';
      x.fillStyle = '#2e3039'; x.fillRect(80, y + 22, SIZE - 160, 22);
      x.fillStyle = '#ffcc00'; x.fillRect(80, y + 22, Math.max(8, (SIZE - 160) * g.share), 22);
    });
    if (s.decade) { x.fillStyle = '#f5f5f7'; x.font = font(600, 40); x.fillText(T(`Best decade: the ${s.decade}s`), 80, 920); }
    x.fillStyle = '#ffcc00'; x.font = font(600, 34); x.fillText('coda.jaybulb.com', 80, 1010);
    return new Promise(res => c.toBlob(res, 'image/png'));
  }
  const api = { summary, draw, SIZE };
  if (typeof module !== 'undefined') module.exports = api; else root.Taste = api;
})(this);
