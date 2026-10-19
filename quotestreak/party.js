// Room codes (v42): the big-screen host in a browser, the web twin of tvos/PartyHost.swift. It opens a
// party room (duel/worker.js, Party), shows a code, and phones join at /buzz. Ten quotes; a right
// answer is worth 10 and the fastest right answer 5 more. score() is pure, for party.test.js.
(function (root) {
  const ROUNDS = 10, SECONDS = 15;
  // Points for one question: every right buzz gets 10, the fastest right one 5 more.
  function score(answer, buzzes) {
    const right = buzzes.filter(b => b.option === answer).sort((a, b) => a.at - b.at);
    return Object.fromEntries(right.map((b, i) => [b.id, 10 + (i === 0 ? 5 : 0)]));
  }
  const api = { ROUNDS, SECONDS, score };
  if (typeof module !== 'undefined') { module.exports = api; return; }

  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const code = Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join('');
  const players = new Map();   // id -> {name, score, buzz, at, gained}
  let bank = [], deck = [], round = 0, current = null, options = [], askedAt = 0, stage = 'lobby', clock = null;

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
  function start() {
    if (!players.size || !bank.length) return;
    deck = [...bank].sort(() => Math.random() - 0.5).slice(0, ROUNDS);
    round = 0;
    for (const p of players.values()) p.score = 0;
    next();
  }
  function next() {
    if (round >= deck.length) return finish();
    current = deck[round++];
    options = [...current.options].sort(() => Math.random() - 0.5);
    for (const p of players.values()) { p.buzz = null; p.gained = 0; }
    askedAt = Date.now();
    stage = 'question';
    send({ type: 'question', n: round, total: deck.length, options });
    clearInterval(clock);
    clock = setInterval(() => { if (Date.now() - askedAt >= SECONDS * 1000) reveal(); else draw(); }, 250);
    draw();
  }
  function reveal() {
    if (stage !== 'question') return;
    clearInterval(clock);
    const pts = score(current.answer, [...players.entries()].filter(([, p]) => p.buzz).map(([id, p]) => ({ id, option: p.buzz, at: p.at })));
    for (const [id, p] of players) { p.gained = pts[id] || 0; p.score += p.gained; }
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
    $('party-over').classList.toggle('hidden', stage !== 'over');
    if (stage === 'lobby') {
      $('party-players').innerHTML = chips || '<span class="prompt">Nobody yet.</span>';
      $('party-start').disabled = !players.size;
      $('party-start').textContent = players.size ? 'Start the game' : 'Waiting for players';
    } else if (stage !== 'over') {
      $('party-n').textContent = `Question ${round} of ${deck.length}`;
      $('party-clock').textContent = stage === 'question' ? Math.max(0, Math.ceil(SECONDS - (Date.now() - askedAt) / 1000)) : '';
      $('party-quote').textContent = `“${current.quote}”`;
      $('party-options').innerHTML = options.map(o => `<div class="${stage === 'reveal' && o === current.answer ? 'right' : ''}">${esc(o)}</div>`).join('');
      $('party-who').innerHTML = stage === 'question' ? chips
        : standings().map(p => `<span class="chip${p.gained ? ' up' : ''}">${esc(p.name)} ${p.score}${p.gained ? ` +${p.gained}` : ''}</span>`).join('');
      $('party-next').textContent = stage === 'question' ? 'Show the answer' : round === deck.length ? 'See who won' : 'Next question';
    } else {
      const s = standings();
      $('party-winner').textContent = s.length ? `${s[0].name} wins` : 'Game over';
      $('party-final').innerHTML = s.map(p => `<li>${esc(p.name)} — ${p.score}</li>`).join('');
    }
  }
  $('party-start').onclick = start;
  $('party-next').onclick = () => (stage === 'question' ? reveal() : next());
  $('party-again').onclick = start;
  // A remote or keyboard: Enter or Space moves the game on.
  addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (stage === 'lobby') start(); else if (stage === 'over') start(); else $('party-next').click();
  });
  draw();
})(this);
