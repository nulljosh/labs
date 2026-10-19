// Practice (v61): lines you missed come back until you know them. A Leitner schedule: a miss puts the
// line in box 1 (due tomorrow); each right answer moves it up a box (1, 3, 7, then 21 days) and a miss
// sends it back to box 1. After box 4 it counts as learned and leaves. The pure part is tested in
// practice.test.js; the page part keeps the state in localStorage.
(function (root) {
  const DAY = 86400000, WAIT = [1, 3, 7, 21];
  // state: { [qid]: { box, due } }
  function record(state, qid, correct, now = Date.now()) {
    const s = { ...state }, cur = s[qid];
    if (!correct) s[qid] = { box: 1, due: now + WAIT[0] * DAY };
    else if (cur) {
      if (cur.box >= WAIT.length) delete s[qid];   // learned
      else s[qid] = { box: cur.box + 1, due: now + WAIT[cur.box] * DAY };
    }
    return s;
  }
  // Practice deals what is due now, the longest overdue first; today's fresh misses come too, so a
  // second go is right there.
  const due = (state, now = Date.now(), includeNew = true) => Object.entries(state)
    .filter(([, v]) => v.due <= now || (includeNew && v.box === 1 && v.due - now >= (WAIT[0] * DAY) - 6 * 3600000))
    .sort((a, b) => a[1].due - b[1].due).map(([id]) => id);
  const api = { record, due, WAIT };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.Practice = api;

  const KEY = 'quotestreak_practice';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
  // Questions for Modes.pool('practice'): the due lines from the bank, in classic form.
  root.Practice.questions = (bank) => {
    const byId = new Map(bank.map(q => [Difficulty.qid(q.quote), q]));
    return due(load()).map(id => byId.get(id)).filter(Boolean).reverse();   // game.js pops from the end
  };
  // Every bank answer anywhere in the game updates the schedule.
  const before = window.quotableBadge;
  window.quotableBadge = (event, d = {}) => {
    if (event === 'answer' && d.q && !d.q.noTally && d.q.type !== 'pack') save(record(load(), Difficulty.qid(d.q.quote), d.correct));
    before(event, d);
  };
  // The menu shows how many are waiting, and Practice with nothing waiting says so instead of starting.
  const label = () => { const n = due(load()).length, o = document.querySelector('#mode option[value="practice"]'); if (o) o.textContent = n ? `Practice (${n} to go)` : 'Practice'; return n; };
  label();
  document.addEventListener('click', (e) => {
    if (e.target.id !== 'start-normal' || $('mode').value !== 'practice') return;
    if (!label()) { e.stopImmediatePropagation(); promptNote('Nothing to practice yet. Missed lines land here.'); }
  }, true);
  const promptNote = (t) => { const p = document.querySelector('#mode-select > p'); if (p) { const was = p.textContent; p.textContent = t; setTimeout(() => { p.textContent = was; }, 2500); } };
  $('restart').addEventListener('click', label);
})(this);
