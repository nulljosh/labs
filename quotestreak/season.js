// Seasons (v20): a ranked ladder each calendar quarter (UTC). Your best normal-mode score in the
// season sets your tier, and each tier earns a Quip medal for that season that you keep.
// Loaded by play.html as window.Season and by season.test.js through require.
(function (root) {
  const TIERS = [  // lowest first; pose is the Quip drawn inside the medal
    { id: 'bronze', min: 100, pose: 'idle' },
    { id: 'silver', min: 250, pose: 'cheer' },
    { id: 'gold', min: 500, pose: 'streak' },
  ];
  function of(date = new Date()) {
    const y = date.getUTCFullYear(), q = Math.floor(date.getUTCMonth() / 3);
    const start = new Date(Date.UTC(y, q * 3, 1)), end = new Date(Date.UTC(y, q * 3 + 3, 1));
    return { id: `${y}-Q${q + 1}`, start: start.toISOString(), end: end.toISOString() };
  }
  const tier = (score) => [...TIERS].reverse().find(t => score >= t.min) || null;
  const next = (score) => TIERS.find(t => score < t.min) || null;
  const daysLeft = (date = new Date()) => Math.ceil((Date.parse(of(date).end) - date) / 86400000);
  // The local record { [seasonId]: best } after a game; returns a fresh object.
  const record = (bests, score, date = new Date()) => {
    const id = of(date).id;
    return { ...bests, [id]: Math.max(bests[id] || 0, score) };
  };
  // "2026-Q4" reads as "Fall 2026" (northern seasons, the quarter each one mostly fills).
  const name = (id) => `${['Winter', 'Spring', 'Summer', 'Fall'][+id.slice(-1) - 1]} ${id.slice(0, 4)}`;
  const api = { TIERS, of, tier, next, daysLeft, record, name };
  if (typeof module !== 'undefined') module.exports = api; else root.Season = api;
})(this);
