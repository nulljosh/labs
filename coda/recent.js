// New this week (v73). recent.json holds lines from this year's and last year's films
// (scripts/harvest-recent.mjs), apart from the bank so the Daily never reshuffles. Each week, Monday
// to Monday UTC, deals the same ten to everyone: first lines come before second lines from the same
// film, so a week rarely repeats a title, and the list wraps when it runs out.
// Classic script after game.js; recent.test.js requires it.
(function (root) {
  const EPOCH = Date.UTC(2026, 9, 19), WEEK = 7 * 86400000, SIZE = 10;   // a Monday, v73's week
  const weekNumber = (now = Date.now()) => Math.floor((now - EPOCH) / WEEK);
  function week(list, now = Date.now()) {
    const order = [...list.filter((_, i) => i % 2 === 0), ...list.filter((_, i) => i % 2)];
    if (!order.length) return [];
    const start = (weekNumber(now) * SIZE) % order.length;
    return Array.from({ length: Math.min(SIZE, order.length) }, (_, i) => order[(start + i) % order.length]);
  }
  const api = { week, weekNumber, SIZE };
  if (typeof module !== 'undefined') { module.exports = api; return; }

  let on = false;
  $('start-recent').onclick = async () => {
    const list = await fetch('recent.json').then(r => r.json()).catch(() => null);
    if (!list?.length) return;
    on = window.quotableOffBoard = true;   // a ten-line pack is not a fair leaderboard score
    startGame(false);
    pool = week(list).map(q => ({ ...q, noTally: true })).reverse();
    nextQuestion();
  };
  const before = window.quotableBadge;
  window.quotableBadge = (event, d = {}) => {
    if (on && event === 'game') on = window.quotableOffBoard = false;
    return before(event, d);
  };
})(this);
