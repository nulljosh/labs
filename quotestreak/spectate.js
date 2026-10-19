// Spectate (v19). Classic script after duel-client.js. ?watch=ABCD opens a read-only socket into
// that duel's room (duel/worker.js) and redraws both players from each {type: "state"} snapshot.
let watching = null;
function openWatch(code) {
  const byId = new Map(quotes.map(q => [Difficulty.qid(q.quote), q]));
  $('watch-code').textContent = code;
  $('watch-body').innerHTML = '<p class="prompt">Connecting…</p>';
  modeSelect.classList.add('hidden');
  $('watch').classList.remove('hidden');
  const ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}/duel/ws?room=${code}&watch=1`);
  watching = ws;
  ws.onerror = () => { $('watch-body').innerHTML = '<p class="prompt">That duel is gone.</p>'; };
  let final = false;
  ws.onmessage = (e) => {
    const s = JSON.parse(e.data);
    if (final || s.type !== 'state') return;
    final = s.players.length === 2 && s.players.every(p => p.done);  // keep the result after both leave
    if (!s.qids) {
      $('watch-body').innerHTML = `<p class="prompt">${s.players.length ? 'Waiting for the second player.' : 'Waiting for the duel to start.'}</p>`;
      return;
    }
    const rows = s.players.map(p => {
      const q = byId.get(s.qids[p.i]);
      return `<div class="watch-player"><h3>${esc(p.name || (p.host ? 'Host' : 'Guest'))} <span>${p.score}</span></h3>
        <p class="prompt">${p.done ? 'Finished' : `Question ${p.i + 1} of ${s.qids.length}`}</p>
        ${!p.done && q ? `<blockquote>${esc(q.quote)}</blockquote><p class="watch-answer">${esc(q.answer)}</p>` : ''}</div>`;
    }).join('');
    const [a, b] = s.players;
    const verdict = final ? `<p class="prompt">${a.score === b.score ? 'A draw.' : `${esc((a.score > b.score ? a : b).name || (a.score > b.score ? 'Host' : 'Guest'))} wins.`}</p>` : '';
    $('watch-body').innerHTML = verdict + rows + (s.players.length < 2 && !final ? '<p class="prompt">A player left.</p>' : '');
  };
}
const esc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
$('watch-back').onclick = () => {
  watching?.close(); watching = null;
  history.replaceState(null, '', location.pathname);
  $('watch').classList.add('hidden');
  modeSelect.classList.remove('hidden');
};
