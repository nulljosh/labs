// Share cards (v18): a 1080 square image of the game just played, with the Quip pose that fits it.
// pose() and caption() are pure (sharecard.test.js); draw() paints the card on a canvas in the browser.
(function (root) {
  const SIZE = 1080;
  // Longest run of answers in a row that scored.
  const bestRun = (run) => run.reduce(([best, cur], r) => (cur = r.pts > 0 ? cur + 1 : 0, [Math.max(best, cur), cur]), [0, 0])[0];
  const pose = ({ score, high, run }) => score > 0 && score >= high ? 'cheer' : bestRun(run) >= 5 ? 'streak' : score > 0 ? 'idle' : 'oops';
  const caption = ({ score, high, run, speed }) => [
    speed ? 'Speed round' : 'Coda',
    `${run.filter(r => r.pts > 0).length} of ${run.length} right · best run ${bestRun(run)}`,
    score > 0 && score >= high ? 'New high score' : `High score ${high}`,
  ];
  async function draw(game) {
    const c = document.createElement('canvas');
    c.width = c.height = SIZE;
    const x = c.getContext('2d'), font = (w, px) => `${w} ${px}px "Quip Sans", -apple-system, Helvetica, sans-serif`;
    await Promise.all([500, 600, 700].map(w => document.fonts?.load(font(w, 40)).catch(() => {})));  // load each weight before painting
    x.fillStyle = '#15161a';
    x.fillRect(0, 0, SIZE, SIZE);
    const img = new Image();
    img.src = `brand/quip-${pose(game)}-dark.svg`;
    await img.decode().catch(() => {});
    if (img.naturalWidth) x.drawImage(img, SIZE / 2 - 220, 70, 440, 440);
    const T = root.I18N ? root.I18N.t : (t) => t;   // canvas text goes through the translator by hand
    const [title, line, high] = caption(game).map(t => T(t));
    x.textAlign = 'center';
    x.fillStyle = '#ffcc00';
    x.font = font(700, 220);
    x.fillText(game.score, SIZE / 2, 740);
    x.fillStyle = '#f5f5f7';
    x.font = font(600, 56);
    x.fillText(title, SIZE / 2, 830);
    x.font = font(500, 44);
    x.fillText(line, SIZE / 2, 900);
    x.fillText(high, SIZE / 2, 960);
    x.fillStyle = '#ffcc00';
    x.font = font(600, 36);
    x.fillText('coda.jaybulb.com', SIZE / 2, 1040);
    return new Promise(res => c.toBlob(res, 'image/png'));
  }
  const api = { bestRun, pose, caption, draw, SIZE };
  if (typeof module !== 'undefined') module.exports = api; else root.ShareCard = api;
})(this);
