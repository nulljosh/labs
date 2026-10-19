// Seasons of film (v74): a Halloween pack in October, a holiday pack in December, a summer pack in
// the summer, from the films scripts/harvest-seasons.mjs tagged on Wikidata (`seasons` in the bank).
// The menu shows the pack only in its season; ?season=holiday opens one any time, for sharing.
// Classic script after game.js; seasons.test.js requires it.
(function (root) {
  const LIST = [
    { id: 'halloween', title: 'Halloween pack', from: [10, 1], to: [11, 2] },
    { id: 'holiday', title: 'Holiday pack', from: [12, 1], to: [1, 6] },
    { id: 'summer', title: 'Summer pack', from: [6, 1], to: [8, 31] },
  ];
  const within = (m, d, [fm, fd], [tm, td]) => {
    const v = m * 100 + d, a = fm * 100 + fd, b = tm * 100 + td;
    return a <= b ? v >= a && v <= b : v >= a || v <= b;   // the holidays wrap the new year
  };
  const current = (date = new Date()) => LIST.find(s => within(date.getUTCMonth() + 1, date.getUTCDate(), s.from, s.to)) || null;
  const lines = (bank, id) => bank.filter(q => q.seasons?.includes(id));
  const api = { LIST, current, lines };
  if (typeof module !== 'undefined') { module.exports = api; return; }

  const asked = new URLSearchParams(location.search).get('season');
  const season = LIST.find(s => s.id === asked) || current();
  const btn = $('start-season');
  let on = false;
  const show = () => {
    if (!quotes.length) return setTimeout(show, 100);
    if (!season || lines(quotes, season.id).length < 10) return;
    btn.textContent = season.title;
    btn.classList.remove('hidden');
  };
  show();
  btn.onclick = () => {
    on = window.quotableOffBoard = true;   // ten lines from one shelf is not a fair leaderboard score
    startGame(false);
    pool = shuffle(lines(window.quotableFamily ? quotes.filter(Family.ok) : quotes, season.id)).slice(0, 10);
    nextQuestion();
  };
  const before = window.quotableBadge;
  window.quotableBadge = (event, d = {}) => {
    if (on && event === 'game') on = window.quotableOffBoard = false;
    return before(event, d);
  };
})(this);
