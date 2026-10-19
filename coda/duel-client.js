// Loaded after game.js as a classic script, so it shares game.js's top-level bindings
// (quotes, duel, score, startGame, ...). game.js calls openDuel() for ?duel= links.
// ---- Live duels (v12) ----------------------------------------------------------------------
// quotestreak-duel (duel/worker.js) relays messages between the two players in a room. The host
// picks ten quotes when the friend arrives; both play them, and each answer sends the running
// score so the topbar shows the other side live.
const DUEL_SIZE = 10;
const duelSend = (m) => { if (duel?.ws?.readyState === 1) duel.ws.send(JSON.stringify(m)); };
function openDuel(code) {
  duel = { code, them: 0 };
  history.replaceState(null, '', `${location.pathname}?duel=${code}`);
  $('duel-link').textContent = `${location.origin}/play?duel=${code}`;
  $('duel-watch').textContent = `Spectators: ${location.origin}/play?watch=${code}`;
  $('duel-msg').textContent = 'Send this link to a friend. The duel starts when they open it.';
  modeSelect.classList.add('hidden');
  $('duel-wait').classList.remove('hidden');
  const ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}/duel/ws?room=${code}`);
  duel.ws = ws;
  ws.onerror = () => { $('duel-msg').textContent = 'That duel is full or gone. Start a new one.'; };
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.type === 'opponent') {
      const qids = shuffle(quotes).slice(0, DUEL_SIZE).map(q => Difficulty.qid(q.quote));
      duelSend({ type: 'start', qids });
      duelStart(qids);
    } else if (m.type === 'start') duelStart(m.qids);
    else if (m.type === 'answer') { duel.them = m.score; updateStats(); }
    else if (m.type === 'done') { duel.them = m.score; duel.theirDone = true; updateStats(); duelResult(); }
    else if (m.type === 'left') { duel.left = true; updateStats(); duelResult(); }
  };
}
function duelStart(qids) {
  const byId = new Map(quotes.map(q => [Difficulty.qid(q.quote), q]));
  duel.quotes = qids.map(id => byId.get(id)).filter(Boolean);
  $('duel-wait').classList.add('hidden');
  $('type-toggle').checked = false;
  startGame(false);
}
function duelResult() {
  if (!duel?.done) return;
  $('final-score').textContent = duel.theirDone || duel.left
    ? Challenge.verdict(score, duel.them, 'Your friend') + (duel.left && !duel.theirDone ? ' They left early.' : '')
    : `You scored ${score}. Waiting for your friend to finish…`;
  if ((duel.theirDone || duel.left) && score > duel.them) window.quotableBadge?.('duelWin');
  if (duel.theirDone || duel.left) {
    duel.ws.close(); duel = null; history.replaceState(null, '', location.pathname);
  }
}
$('start-duel').onclick = () => openDuel(Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join(''));
$('duel-copy').onclick = () => navigator.clipboard.writeText($('duel-link').textContent).then(() => {
  $('duel-copy').textContent = 'Copied';
  setTimeout(() => { $('duel-copy').textContent = 'Copy link'; }, 1500);
});
$('duel-cancel').onclick = () => {
  duel?.ws?.close(); duel = null;
  history.replaceState(null, '', location.pathname);
  $('duel-wait').classList.add('hidden');
  modeSelect.classList.remove('hidden');
};
