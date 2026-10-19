// Daily Quote: one quote per UTC day, the same for everyone, with no server. The bank is
// walked in a fixed shuffled order, so nothing repeats until every quote has had its day.
// Loaded by play.html as a plain script (window.Daily) and by daily.test.js through require.
(function (root) {
  const EPOCH = Date.UTC(2026, 9, 19);   // Daily #1
  const DAY = 86400000;

  const dayNumber = (now = Date.now()) => Math.floor((now - EPOCH) / DAY) + 1;
  const msUntilNext = (now = Date.now()) => DAY - ((now - EPOCH) % DAY);

  // mulberry32: tiny, seedable, and the same in every browser
  function rng(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(arr, seed) {
    const a = [...arr], next = rng(seed);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // The day's quote, with its options in a fixed order so every player sees the same board.
  function quoteFor(day, bank) {
    const cycle = Math.floor((day - 1) / bank.length);
    const order = seededShuffle(bank.map((_, i) => i), 1000 + cycle);
    const q = bank[order[(day - 1) % bank.length]];
    return { ...q, options: seededShuffle(q.options, day) };
  }

  // The streak counts days in a row answered right; a miss or a skipped day starts over.
  function nextStreak(prev, day, correct) {
    if (!correct) return { lastDay: day, count: 0 };
    const count = prev && prev.lastDay === day - 1 && prev.count > 0 ? prev.count + 1 : 1;
    return { lastDay: day, count };
  }

  // A skipped day shows as zero without waiting for the next answer.
  const currentStreak = (s, today) => (s && s.lastDay >= today - 1 ? s.count : 0);

  const shareText = (day, correct, streak) =>
    `Coda Daily #${day}\n${correct ? 'Got it.' : 'Missed it.'} Day streak: ${streak}\nhttps://coda.jaybulb.com/play?daily`;

  const Daily = { dayNumber, msUntilNext, quoteFor, nextStreak, currentStreak, shareText, seededShuffle };
  if (typeof module !== 'undefined') module.exports = Daily;
  else root.Daily = Daily;
})(this);
