// Archive (v96): every past Daily Quote, playable any time. Each day's line is the same one everyone got
// (Daily.quoteFor), so an old daily can be argued about too. Playing one never touches the daily streak
// or the board; the archive keeps its own right or wrong per day. Classic script after game.js and
// daily.js; archive.test.js requires the pure part.
(function (root) {
  // Past days, newest first: [{ day, date }]. Today is not past until tomorrow.
  const days = (today, epoch = Date.UTC(2026, 9, 19)) => Array.from({ length: Math.max(0, today - 1) }, (_, i) => {
    const day = today - 1 - i;
    return { day, date: new Date(epoch + (day - 1) * 86400000).toISOString().slice(0, 10) };
  });
  const api = { days };
  if (typeof module !== 'undefined') { module.exports = api; return; }

  const KEY = 'quotestreak_archive';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  $('daily-share').insertAdjacentHTML('beforebegin', '<button id="archive-btn">Past dailies</button>');
  modeSelect.insertAdjacentHTML('afterend', `<div id="archive" class="panel hidden">
      <h2>Past dailies</h2>
      <p class="prompt">Every Daily Quote so far, the same line everyone got that day. Playing one doesn't touch your streak.</p>
      <ol id="archive-list" class="library-list"></ol>
      <button id="archive-back">Back</button>
    </div>`);
  let playing = null;
  function show() {
    for (const id of ['daily-end', 'mode-select']) $(id).classList.add('hidden');
    endEl.classList.add('hidden');
    $('archive').classList.remove('hidden');
    const done = load(), list = days(Daily.dayNumber());
    const when = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    $('archive-list').innerHTML = list.length ? list.map(({ day, date }) => `<li><span><b>Daily #${day}</b><small>${when(date)}${day in done ? (done[day] ? ' · right' : ' · missed') : ''}</small></span><button data-day="${day}">Play</button></li>`).join('')
      : '<li class="note">Past dailies show up here from tomorrow.</li>';
  }
  $('archive-btn').onclick = show;
  $('archive-back').onclick = () => { $('archive').classList.add('hidden'); modeSelect.classList.remove('hidden'); };
  $('archive-list').onclick = (e) => {
    const b = e.target.closest('button[data-day]');
    if (!b) return;
    playing = +b.dataset.day;
    $('archive').classList.add('hidden');
    window.quotableOffBoard = true;
    startGame(false);
    pool = [{ ...Daily.quoteFor(playing, core), noTally: true }];
    nextQuestion();
  };
  const before = window.quotableBadge;
  window.quotableBadge = (event, d = {}) => {
    if (playing && event === 'answer') { const s = load(); s[playing] = d.correct; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
    if (playing && event === 'game') { playing = null; window.quotableOffBoard = false; setTimeout(show, 900); }
    return before?.(event, d);
  };
})(this);
