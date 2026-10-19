// Stats (v17): accuracy by genre and decade, best streaks, and a graph of recent game scores.
// Pure functions over one small object kept in localStorage by stats-ui.js.
// Loaded by play.html as window.Stats and by stats.test.js through require.
(function (root) {
  const KEEP = 50;  // games on the history graph
  const empty = () => ({ genres: {}, decades: {}, history: [] });
  const tally = (bag, key, right) => { const t = bag[key] || (bag[key] = [0, 0]); t[0] += right ? 1 : 0; t[1]++; };
  function record(s, event, d) {
    if (event === 'answer') {
      tally(s.genres, d.q.genre, d.correct);
      if (d.q.year) tally(s.decades, Math.floor(d.q.year / 10) * 10, d.correct);
    } else if (event === 'game') {
      s.history.push({ score: d.score, speed: !!d.speed });
      s.history = s.history.slice(-KEEP);
    }
    return s;
  }
  // Rows of { key, right, seen, pct }, most played first.
  const rows = (bag) => Object.entries(bag).map(([key, [right, seen]]) => ({ key, right, seen, pct: Math.round(100 * right / seen) }))
    .sort((a, b) => b.seen - a.seen || a.key.localeCompare(b.key));
  // Polyline points for the history graph in a w by h box; empty string under two games.
  function graph(history, w, h) {
    if (history.length < 2) return '';
    const max = Math.max(1, ...history.map(g => g.score));
    return history.map((g, i) => `${Math.round(i * w / (history.length - 1))},${Math.round(h - g.score * h / max)}`).join(' ');
  }
  const api = { empty, record, rows, graph, KEEP };
  if (typeof module !== 'undefined') module.exports = api; else root.Stats = api;
})(this);
