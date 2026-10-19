// Watchlist (v63): every film or show you couldn't name goes on a list you can keep, prune and take
// away: a CSV in the shape Letterboxd imports (Title, Year), or plain text to paste anywhere. The pure
// parts are tested in watchlist.test.js; the page keeps the list in localStorage.
(function (root) {
  const KINDS = { movie: 'Film', tv: 'Show' };
  const key = (t) => `${t.title}|${t.year || ''}`;
  function add(list, q, now = Date.now()) {
    if (!KINDS[q.type] || q.noTally) return list;
    const item = { title: q.title || q.answer, year: q.titleYear || q.year || null, kind: q.type, added: now };
    return list.some(t => key(t) === key(item)) ? list : [item, ...list];
  }
  const remove = (list, k) => list.filter(t => key(t) !== k);
  const cell = (s) => /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  const csv = (list) => ['Title,Year', ...list.filter(t => t.kind === 'movie').map(t => `${cell(t.title)},${t.year || ''}`)].join('\n');
  const text = (list) => list.map(t => `${t.title}${t.year ? ` (${t.year})` : ''}`).join('\n');
  const api = { add, remove, csv, text, key, KINDS };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.Watchlist = api;

  const KEY = 'quotestreak_watchlist';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = (l) => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {} };
  const before = window.quotableBadge;
  window.quotableBadge = (event, d = {}) => {
    if (event === 'answer' && d.q && !d.correct) save(add(load(), d.q));
    before(event, d);
  };
  const wEsc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function draw() {
    const list = load();
    $('watchlist-count').textContent = list.length ? `${list.length} to watch` : 'Nothing yet. Titles you can’t name land here.';
    $('watchlist-list').innerHTML = list.map(t => `<li><span><b>${wEsc(t.title)}</b><small>${KINDS[t.kind]}${t.year ? `, ${t.year}` : ''}</small></span><button data-drop="${wEsc(key(t))}" aria-label="Remove ${wEsc(t.title)}">Remove</button></li>`).join('');
    $('watchlist-csv').classList.toggle('hidden', !list.some(t => t.kind === 'movie'));
    $('watchlist-copy').classList.toggle('hidden', !list.length);
  }
  $('start-watchlist').onclick = () => { modeSelect.classList.add('hidden'); $('watchlist').classList.remove('hidden'); draw(); };
  $('watchlist-back').onclick = () => { $('watchlist').classList.add('hidden'); modeSelect.classList.remove('hidden'); };
  $('watchlist-list').onclick = (e) => { const k = e.target.closest('button')?.dataset.drop; if (k) { save(remove(load(), k)); draw(); } };
  $('watchlist-csv').onclick = () => {
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv(load())], { type: 'text/csv' })), download: 'quotestreak-watchlist.csv' });
    a.click();
  };
  $('watchlist-copy').onclick = () => navigator.clipboard?.writeText(text(load())).then(() => { $('watchlist-copy').textContent = 'Copied'; setTimeout(() => { $('watchlist-copy').textContent = 'Copy the list'; }, 1500); }, () => {});
})(this);
