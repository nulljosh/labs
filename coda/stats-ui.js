// Stats screen. Classic script after badges-ui.js: it wraps window.quotableBadge so every
// answer and game also lands in the stats store. Best streaks come from the badge counters.
const STATS_KEY = 'quotestreak_stats';
const statsLoad = () => { try { return { ...Stats.empty(), ...JSON.parse(localStorage.getItem(STATS_KEY)) }; } catch { return Stats.empty(); } };
const badgeEvent = window.quotableBadge;
window.quotableBadge = (event, d = {}) => {
  if (event === 'answer' || event === 'game') {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(Stats.record(statsLoad(), event, d))); } catch {}
  }
  badgeEvent(event, d);
};
const statsTable = (title, list, label) => list.length
  ? `<h3>${title}</h3><table>${list.map(r => `<tr><td>${label(r.key)}</td><td>${r.right} of ${r.seen}</td><td><span class="stat-bar" style="width:${r.pct}%"></span>${r.pct}%</td></tr>`).join('')}</table>` : '';
$('stats-btn').onclick = () => {
  const s = statsLoad(), b = badgeStats(), pts = Stats.graph(s.history, 300, 80);
  const right = b.right, seen = b.right + b.wrong;
  $('stats-body').innerHTML = `
    <p class="prompt">${seen ? `${Math.round(100 * right / seen)}% right over ${seen} quotes, ${b.games} game${b.games === 1 ? "" : "s"}` : 'Play a game to start your stats.'}</p>
    <p class="prompt">Best streak ${b.bestStreak} · Best without hints ${b.cleanStreak} · Best score ${b.bestScore} · Best speed ${b.bestSpeed}</p>
    ${pts ? `<h3>Last ${s.history.length} games</h3><svg class="stat-graph" viewBox="-4 -4 308 88"><polyline points="${pts}"/></svg>` : ''}
    ${statsTable('By genre', Stats.rows(s.genres), label)}
    ${statsTable('By decade', Stats.rows(s.decades).sort((x, y) => x.key - y.key), k => `${k}s`)}`;
  modeSelect.classList.add('hidden');
  $('stats').classList.remove('hidden');
};
$('stats-back').onclick = () => { $('stats').classList.add('hidden'); modeSelect.classList.remove('hidden'); };

// The taste card (v64, taste.js): the same sharing path as the score card in game.js.
$('taste-share').onclick = async () => {
  const s = Taste.summary(statsLoad());
  if (!s) { $('taste-share').textContent = 'Answer ten lines first'; return setTimeout(() => { $('taste-share').textContent = 'Share my taste card'; }, 1800); }
  const blob = await Taste.draw(s, (k) => window.I18N ? I18N.t(label(k)) : label(k));
  const files = blob ? [new File([blob], 'quotestreak-taste.png', { type: 'image/png' })] : [];
  if (files.length && navigator.canShare?.({ files })) return navigator.share({ files }).catch(() => {});
  if (blob) Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'quotestreak-taste.png' }).click();
};
