// Badges (v16): fifty achievements read off a small bag of counters kept in localStorage.
// Each badge is drawn as a medal around one of Quip's poses, in bronze, silver or gold.
// Loaded by play.html as window.Badges and by badges.test.js through require.
(function (root) {
  const GENRES = ['action', 'comedy', 'drama', 'scifi', 'classic', 'pop', 'rock', 'hiphop', 'rnb', 'country', 'sitcom', 'tvdrama', 'cartoon', 'game', 'book'];
  const LABEL = { scifi: 'Sci-fi', hiphop: 'Hip-hop', rnb: 'R&B', tvdrama: 'TV drama', game: 'Games', book: 'First lines' };
  const name = (g) => LABEL[g] || g[0].toUpperCase() + g.slice(1);
  const tier = (i) => ['bronze', 'silver', 'gold'][i];
  const LIST = [
    ...[1, 50, 500].map((n, i) => ({ id: `right-${n}`, title: n === 1 ? 'First right answer' : `${n} right answers`, pose: 'cheer', tier: tier(i), test: s => s.right >= n })),
    ...[1000, 2500].map((n, i) => ({ id: `right-${n}`, title: `${n} right answers`, pose: 'cheer', tier: tier(i + 1), test: s => s.right >= n })),
    ...[5, 10, 25, 50].map((n, i) => ({ id: `streak-${n}`, title: `${n} in a row`, pose: 'streak', tier: tier(Math.min(2, i)), test: s => s.bestStreak >= n })),
    ...[1, 10, 100].map((n, i) => ({ id: `games-${n}`, title: n === 1 ? 'First game' : `${n} games`, pose: 'idle', tier: tier(i), test: s => s.games >= n })),
    ...[100, 300, 600].map((n, i) => ({ id: `score-${n}`, title: `Score ${n} in one game`, pose: 'cheer', tier: tier(i), test: s => s.bestScore >= n })),
    ...[100, 300].map((n, i) => ({ id: `speed-${n}`, title: `Score ${n} in a speed round`, pose: 'streak', tier: tier(i + 1), test: s => s.bestSpeed >= n })),
    ...[1, 7, 30].map((n, i) => ({ id: `daily-${n}`, title: n === 1 ? 'First daily' : `${n} day daily streak`, pose: 'idle', tier: tier(i), test: s => s.dailyStreak >= n })),
    ...GENRES.map(g => ({ id: `genre-${g}`, title: `10 right in ${name(g)}`, pose: 'cheer', tier: 'bronze', test: s => (s.genres[g] || 0) >= 10 })),
    { id: 'all-genres', title: 'A right answer in every genre', pose: 'streak', tier: 'gold', test: s => GENRES.every(g => (s.genres[g] || 0) >= 1) },
    ...[5, 10].map((n, i) => ({ id: `decades-${n}`, title: `Right answers from ${n} decades`, pose: 'idle', tier: tier(i + 1), test: s => Object.keys(s.decades).length >= n })),
    ...[10, 100].map((n, i) => ({ id: `typed-${n}`, title: `${n} typed answers right`, pose: 'cheer', tier: tier(i), test: s => s.typed >= n })),
    { id: 'no-hints', title: 'A 10 streak with no hints', pose: 'streak', tier: 'silver', test: s => s.cleanStreak >= 10 },
    { id: 'hint-saved', title: 'Right after two hints', pose: 'oops', tier: 'bronze', test: s => s.hintWins >= 1 },
    { id: 'miss', title: 'First miss (it happens)', pose: 'oops', tier: 'bronze', test: s => s.wrong >= 1 },
    { id: 'miss-100', title: '100 misses and still here', pose: 'oops', tier: 'silver', test: s => s.wrong >= 100 },
    ...[1, 5].map((n, i) => ({ id: `duel-${n}`, title: n === 1 ? 'Win a live duel' : `Win ${n} live duels`, pose: 'cheer', tier: tier(i + 1), test: s => s.duelWins >= n })),
    { id: 'challenge', title: 'Send a challenge link', pose: 'idle', tier: 'bronze', test: s => s.challenges >= 1 },
  ];
  const empty = () => ({ right: 0, wrong: 0, bestStreak: 0, games: 0, bestScore: 0, bestSpeed: 0, dailyStreak: 0, genres: {}, decades: {}, typed: 0, cleanStreak: 0, hintWins: 0, duelWins: 0, challenges: 0, cups: 0, perfectCup: 0 });
  const unlocked = (s) => LIST.filter(b => b.test({ ...empty(), ...s })).map(b => b.id);
  const COLORS = { bronze: '#c07a3f', silver: '#b8bec6', gold: '#ffcc00' };
  // A medal: tier-coloured ring on night ink, Quip's pose inside.
  const svg = (b, lit) => `<svg viewBox="0 0 100 100" class="medal${lit ? '' : ' locked'}" role="img" aria-label="${b.title}">`
    + `<circle cx="50" cy="50" r="46" fill="#16161d" stroke="${COLORS[b.tier]}" stroke-width="7"/>`
    + `<image href="brand/quip-${b.pose}-dark.svg" x="18" y="16" width="64" height="64"/></svg>`;
  const api = { LIST, GENRES, empty, unlocked, svg };
  if (typeof module !== 'undefined') module.exports = api; else root.Badges = api;
})(this);
