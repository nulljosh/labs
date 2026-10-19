// Weekly cup (v14): everyone plays the same ten quotes all ISO week, once, and the week's
// leaderboard is drawn as an eight-player bracket (1 v 8, 2 v 7 ...), higher score advances.
// Scores ride the existing quotestreak_scores table under mode "cup-<week>".
// Loaded by play.html as window.Cup (after daily.js) and by cup.test.js through require.
(function (root) {
  const SIZE = 10;
  function weekKey(now = new Date()) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);                     // Thursday decides the ISO year
    const week = Math.ceil(((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }
  const seed = (key) => [...key].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
  function quotes(key, bank, shuffle) {
    return shuffle(bank.map((_, i) => i), seed(key)).slice(0, SIZE).map(i => bank[i]);
  }
  // rows: [{name, score}] best first. Returns rounds: [[{a, b, winner}], ...] down to the final.
  function bracket(rows) {
    let players = rows.slice(0, 8);
    if (players.length < 2) return [];
    const size = players.length > 4 ? 8 : players.length > 2 ? 4 : 2;
    const seeds = Array.from({ length: size }, (_, i) => players[i] || null);
    let round = [];
    for (let i = 0; i < size / 2; i++) round.push([seeds[i], seeds[size - 1 - i]]);
    const rounds = [];
    while (round.length) {
      const played = round.map(([a, b]) => ({ a, b, winner: !b ? a : !a ? b : (b.score > a.score ? b : a) }));
      rounds.push(played);
      if (played.length === 1) break;
      round = [];
      for (let i = 0; i < played.length; i += 2) round.push([played[i].winner, played[played.length - 1 - i].winner]);
      round = round.slice(0, played.length / 2);
    }
    return rounds;
  }
  const api = { SIZE, weekKey, quotes, bracket };
  if (typeof module !== 'undefined') module.exports = api; else root.Cup = api;
})(this);
