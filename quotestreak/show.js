// Live show (v81): a global quiz every Sunday at 18:00 UTC. Twelve questions on one clock for everyone:
// fifteen seconds to answer, five to see the answer. Nothing is sent to drive it; each browser works
// out the question from the time (corrected by the server's Date header), so late joiners land on the
// live question. A right answer scores 10 plus up to 10 for speed. Scores go to mode "show-<date>".
// ?show=now runs a practice show at once, off the board. Classic script after cup-ui.js; show.test.js
// requires the pure part.
(function (root) {
  const DAY = 0, HOUR = 18, COUNT = 12, ASK = 15000, SHOW = 5000, STEP = ASK + SHOW;
  // The show that is on now, or the next one.
  function next(now = Date.now()) {
    const d = new Date(now);
    let start = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + ((7 + DAY - d.getUTCDay()) % 7), HOUR);
    if (now >= start + COUNT * STEP) start += 7 * 86400000;
    return start;
  }
  // Where a show starting at `start` is at `now`: waiting, asking question i, showing its answer, or over.
  function state(start, now) {
    if (now < start) return { phase: 'waiting', ms: start - now };
    const i = Math.floor((now - start) / STEP), into = (now - start) % STEP;
    if (i >= COUNT) return { phase: 'over' };
    return into < ASK ? { phase: 'ask', i, ms: ASK - into } : { phase: 'reveal', i, ms: STEP - into };
  }
  const points = (msLeft) => 10 + Math.round(10 * Math.max(0, Math.min(1, msLeft / ASK)));
  const key = (start) => new Date(start).toISOString().slice(0, 10);
  // The show's twelve lines: a seeded walk of the bank, the same in every browser.
  const pick = (k, bank, shuffle) => shuffle(bank.map((_, i) => i), [...`show-${k}`].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 11)).slice(0, COUNT).map(i => bank[i]);
  const api = { next, state, points, key, pick, COUNT, ASK, STEP };
  if (typeof module !== 'undefined') { module.exports = api; return; }

  modeSelect.insertAdjacentHTML('afterend', `<div id="show" class="panel hidden">
      <h2>Live show</h2>
      <p id="show-when" class="prompt" aria-live="polite"></p>
      <div id="show-stage" class="hidden">
        <p id="show-count" class="prompt"></p>
        <blockquote id="show-quote" translate="no"></blockquote>
        <div id="show-options" class="options"></div>
        <p id="show-score" class="prompt" aria-live="polite"></p>
      </div>
      <ol id="show-board" class="library-list"></ol>
      <button id="show-back">Back</button>
    </div>`);
  const practice = new URLSearchParams(location.search).get('show') === 'now';
  let skew = 0, start = 0, lines = [], picked = new Map(), score = 0, timer = null, sent = false;
  const now = () => Date.now() + skew;
  const mode = () => `show-${key(start)}`;
  const when = (t) => new Date(t).toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' });
  const mins = (ms) => { const m = Math.ceil(ms / 60000); return m >= 2880 ? `${Math.round(m / 1440)} days` : m >= 120 ? `${Math.round(m / 60)} hours` : m > 1 ? `${m} minutes` : 'a minute'; };

  function tick() {
    const s = state(start, now());
    const stage = $('show-stage');
    if (s.phase === 'waiting') {
      stage.classList.add('hidden');
      $('show-when').textContent = `The next show starts ${when(start)}, in ${mins(s.ms)}. Twelve questions, the same second for everyone.`;
      return;
    }
    if (s.phase === 'over') {
      stage.classList.add('hidden');
      $('show-when').textContent = `That's the show. You scored ${score}.`;
      if (!sent && !practice) { sent = true; window.quotableSubmitScore?.(score, mode()); setTimeout(board, 1500); }
      clearInterval(timer);
      return;
    }
    stage.classList.remove('hidden');
    $('show-when').textContent = s.phase === 'ask' ? `${Math.ceil(s.ms / 1000)} seconds` : 'The answer';
    const q = lines[s.i];
    $('show-count').textContent = `Question ${s.i + 1} of ${COUNT}`;
    if ($('show-quote').dataset.i !== String(s.i)) {
      $('show-quote').dataset.i = s.i;
      $('show-quote').textContent = `“${q.quote}”`;
      $('show-options').innerHTML = q.options.map(o => `<button>${o.replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`)}</button>`).join('');
    }
    [...$('show-options').children].forEach(b => {
      const mine = picked.get(s.i)?.option === b.textContent;
      b.setAttribute('aria-disabled', s.phase !== 'ask' || picked.has(s.i));   // not disabled: that washes out the reveal colours
      b.classList.toggle('picked', mine);
      b.classList.toggle('correct', s.phase === 'reveal' && b.textContent === q.answer);
      b.classList.toggle('wrong', s.phase === 'reveal' && mine && b.textContent !== q.answer);
    });
    $('show-score').textContent = `Score ${score}`;
  }
  $('show-options').onclick = (e) => {
    const b = e.target.closest('button'), s = state(start, now());
    if (!b || s.phase !== 'ask' || picked.has(s.i)) return;
    picked.set(s.i, { option: b.textContent });
    if (b.textContent === lines[s.i].answer) score += points(s.ms);
    tick();
  };
  async function board() {
    if (practice || !window.quotableBoard) return;
    const rows = await window.quotableBoard(mode());
    $('show-board').innerHTML = rows.slice(0, 20).map((r, i) => `<li><span><b>${i + 1}. ${r.name.replace(/[&<>"]/g, '')}</b></span><small>${r.score}</small></li>`).join('');
  }
  function open() {
    // The server's clock, so a phone that runs a minute fast still sees the live question.
    fetch('/api/genres', { cache: 'no-store' }).then(r => { const t = Date.parse(r.headers.get('date')); if (t) skew = t - Date.now(); }).catch(() => {});
    modeSelect.classList.add('hidden');
    $('show').classList.remove('hidden');
    start = practice ? (start || now() + 3000) : next(now());
    lines = pick(key(start), quotes, Daily.seededShuffle);   // the whole bank: family mode hides the show, like the cup
    clearInterval(timer);
    timer = setInterval(tick, 250);
    tick();
    board();
  }
  $('start-show').onclick = open;
  $('show-back').onclick = () => { clearInterval(timer); $('show').classList.add('hidden'); modeSelect.classList.remove('hidden'); };
  if (practice) { const go = () => quotes.length ? open() : setTimeout(go, 100); go(); }
})(this);
