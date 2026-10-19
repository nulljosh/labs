// Room codes (v42) and Quiz night (v43): the big-screen host in a browser, the web twin of tvos/PartyHost.swift. It opens a
// party room (duel/worker.js, Party), shows a code, and phones join at /buzz. Ten quotes; a right
// answer is worth 10 and the fastest right answer 5 more. score() is pure, for party.test.js.
(function (root) {
  const ROUNDS = 10, SECONDS = 15;
  // Quiz night (v43): four themed rounds of five. Themes come from what the bank has enough of.
  const THEMES = [['movie', 'Movies'], ['tv', 'TV'], ['game', 'Games'], ['music', 'Music'], ['book', 'First lines']];
  function plan(bank, night, rand = Math.random, pack = null) {
    const deal = (list, n) => list.map(q => [rand(), q]).sort((a, b) => a[0] - b[0]).slice(0, n).map(x => x[1]);
    // Classroom (v46): a lesson pack, ten of its lines, wrong answers from its other answers.
    if (pack) {
      const answers = [...new Set(pack.lines.map(l => l.answer))];
      const qs = pack.lines.map(l => ({ quote: l.quote, answer: l.answer, options: [l.answer, ...deal(answers.filter(a => a !== l.answer), 3)] }));
      return [{ title: pack.title, quotes: deal(qs, ROUNDS) }];
    }
    if (!night) return [{ title: '', quotes: deal(bank, ROUNDS) }];
    const themes = THEMES.filter(([t]) => bank.filter(q => q.type === t).length >= 5);
    return deal(themes, 4).map(([t, title]) => ({ title, quotes: deal(bank.filter(q => q.type === t), 5) }));
  }
  // Points for one question: every right buzz gets 10, the fastest right one 5 more.
  function score(answer, buzzes) {
    const right = buzzes.filter(b => b.option === answer).sort((a, b) => a.at - b.at);
    return Object.fromEntries(right.map((b, i) => [b.id, 10 + (i === 0 ? 5 : 0)]));
  }
  const api = { ROUNDS, SECONDS, score, plan };
  if (typeof module !== 'undefined') { module.exports = api; return; }

  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const code = Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join('');
  const players = new Map();   // id -> {name, score, buzz, at, gained}
  let bank = [], rounds = [], ri = 0, qi = 0, asked = 0, current = null, options = [], askedAt = 0, stage = 'lobby', clock = null;

  $('party-code').textContent = code;
  $('party-url').textContent = `${location.host}/buzz`;
  const ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}/duel/party?room=${code}&role=host`);
  const send = (m) => ws.readyState === 1 && ws.send(JSON.stringify(m));
  ws.onerror = () => { $('party-status').textContent = 'Can’t reach the game room.'; };
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.type === 'join') players.set(m.id, { name: m.name, score: 0 });
    else if (m.type === 'leave') players.delete(m.id);
    else if (m.type === 'buzz' && stage === 'question') {
      const p = players.get(m.id);
      if (p && !p.buzz) { p.buzz = m.option; p.at = m.at; }
      if ([...players.values()].every(p => p.buzz)) reveal();
    }
    draw();
  };
  fetch('quotes.json').then(r => r.json()).then(d => { bank = d; });

  const standings = () => [...players.entries()].map(([id, p]) => ({ id, ...p })).sort((a, b) => b.score - a.score);
  const total = () => rounds.reduce((n, r) => n + r.quotes.length, 0);
  function start() {
    if (!players.size || !bank.length) return;
    const lesson = $('party-pack').value;
    rounds = plan(bank, $('party-night').checked, Math.random, lesson ? root.Classroom.pack(lesson, bank) : null);
    ri = qi = asked = 0;
    for (const p of players.values()) { p.score = 0; p.right = 0; p.asked = 0; }
    rounds.length > 1 ? between() : next();
  }
  // Quiz night: the standings so far and the round coming up, until the host moves on.
  function between() {
    clearInterval(clock);
    stage = 'between';
    send({ type: 'between', title: rounds[ri].title, n: ri + 1, of: rounds.length });
    draw();
  }
  function next() {
    if (qi >= rounds[ri].quotes.length) {
      ri++; qi = 0;
      if (ri >= rounds.length) return finish();
      return between();
    }
    current = rounds[ri].quotes[qi++];
    asked++;
    options = [...current.options].sort(() => Math.random() - 0.5);
    for (const p of players.values()) { p.buzz = null; p.gained = 0; }
    askedAt = Date.now();
    stage = 'question';
    send({ type: 'question', n: asked, total: total(), label: rounds[ri].title, options });
    clearInterval(clock);
    clock = setInterval(() => { if (Date.now() - askedAt >= SECONDS * 1000) reveal(); else draw(); }, 250);
    draw();
  }
  function reveal() {
    if (stage !== 'question') return;
    clearInterval(clock);
    const pts = score(current.answer, [...players.entries()].filter(([, p]) => p.buzz).map(([id, p]) => ({ id, option: p.buzz, at: p.at })));
    for (const [id, p] of players) { p.gained = pts[id] || 0; p.score += p.gained; p.asked = (p.asked || 0) + 1; p.right = (p.right || 0) + (p.gained ? 1 : 0); }
    stage = 'reveal';
    send({ type: 'reveal', answer: current.answer, scores: standings().map(({ id, name, score }) => ({ id, name, score })) });
    draw();
  }
  function finish() {
    stage = 'over';
    send({ type: 'over', scores: standings().map(({ id, name, score }) => ({ id, name, score })) });
    draw();
  }

  function draw() {
    const chips = [...players.values()].map(p => `<span class="chip${p.buzz && stage === 'question' ? ' in' : ''}">${esc(p.name)}</span>`).join('');
    $('party-lobby').classList.toggle('hidden', stage !== 'lobby');
    $('party-round').classList.toggle('hidden', stage !== 'question' && stage !== 'reveal');
    $('party-between').classList.toggle('hidden', stage !== 'between');
    $('party-over').classList.toggle('hidden', stage !== 'over');
    if (stage === 'lobby') {
      $('party-players').innerHTML = chips || '<span class="prompt">Nobody yet.</span>';
      $('party-start').disabled = !players.size;
      $('party-start').textContent = players.size ? 'Start the game' : 'Waiting for players';
    } else if (stage === 'between') {
      $('party-round-title').textContent = `Round ${ri + 1} of ${rounds.length}: ${rounds[ri].title}`;
      $('party-standings').innerHTML = ri ? standings().map(p => `<li>${esc(p.name)} \u2014 ${p.score}</li>`).join('') : '';
      $('party-go').textContent = ri ? 'Next round' : 'Start round one';
    } else if (stage !== 'over') {
      const r = rounds[ri], last = qi === r.quotes.length && ri === rounds.length - 1;
      $('party-n').textContent = `${r.title ? `${r.title} \u00b7 ` : ''}Question ${asked} of ${total()}`;
      $('party-clock').textContent = stage === 'question' ? Math.max(0, Math.ceil(SECONDS - (Date.now() - askedAt) / 1000)) : '';
      $('party-quote').textContent = `“${current.quote}”`;
      $('party-options').innerHTML = options.map(o => `<div class="${stage === 'reveal' && o === current.answer ? 'right' : ''}">${esc(o)}</div>`).join('');
      $('party-who').innerHTML = stage === 'question' ? chips
        : standings().map(p => `<span class="chip${p.gained ? ' up' : ''}">${esc(p.name)} ${p.score}${p.gained ? ` +${p.gained}` : ''}</span>`).join('');
      $('party-next').textContent = stage === 'question' ? 'Show the answer' : last ? 'See who won' : qi === r.quotes.length ? 'End of the round' : 'Next question';
    } else {
      const s = standings();
      const tied = s.filter(p => s.length && p.score === s[0].score);
      $('party-winner').textContent = !s.length ? 'Game over' : tied.length > 1 ? `A tie at ${s[0].score}` : `${s[0].name} wins`;
      $('party-final').innerHTML = s.map((p, i) => `<li class="p${i + 1}">${esc(p.name)} — ${p.score}<small> \u00b7 ${p.right || 0} of ${p.asked || 0} right</small></li>`).join('');
    }
  }
  $('party-start').onclick = start;
  $('party-next').onclick = () => (stage === 'question' ? reveal() : next());
  $('party-again').onclick = start;
  $('party-go').onclick = next;
  // The teacher's view: everyone's results as CSV, for a gradebook.
  $('party-copy').onclick = () => navigator.clipboard?.writeText(root.Classroom.csv(standings().map(p => ({ name: p.name, right: p.right || 0, asked: p.asked || 0, score: p.score }))))
    .then(() => { $('party-copy').textContent = 'Results copied'; }, () => {});
  for (const [id, title] of root.Classroom.LIST) $('party-pack').insertAdjacentHTML('beforeend', `<option value="${id}">Classroom: ${title}</option>`);
  $('party-pack').onchange = () => { $('party-night').closest('label').classList.toggle('hidden', !!$('party-pack').value); };
  // A remote or keyboard: Enter or Space moves the game on.
  addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (stage === 'lobby' || stage === 'over') start(); else if (stage === 'between') next(); else $('party-next').click();
  });
  draw();
})(this);
