// Champions (v50): last season's top eight play a seeded bracket of live duels (duel/worker.js rooms)
// that anyone can watch (spectate.js). Seeds 1v8, 4v5, 2v7, 3v6; winners meet in the semis and the
// final. Both players report the duel's score; when the two reports agree, the winner moves on.
// The bracket below is pure, for champions.test.js; the page part needs play.html.
(function (root) {
  const SEEDS = [[0, 7], [3, 4], [1, 6], [2, 5]];   // quarterfinals by seed index
  const FEEDS = { 4: [0, 1], 5: [2, 3], 6: [4, 5] }; // semis and final take the winners of these matches
  // Every match of the bracket: who plays (null until known), their scores and the winner.
  function bracket(players, results) {
    const byMatch = new Map(results.map(r => [r.match, r]));
    const matches = [];
    for (let m = 0; m < 7; m++) {
      const [a, b] = m < 4 ? SEEDS[m].map(i => players[i] || null) : FEEDS[m].map(f => matches[f].winner);
      const r = byMatch.get(m);
      const winner = a && b && r?.winner ? (r.winner === a.code ? a : r.winner === b.code ? b : null) : (a && !b && m < 4 ? a : null);  // a missing seed is a bye
      matches.push({ match: m, round: m < 4 ? 'Quarterfinal' : m < 6 ? 'Semifinal' : 'Final', a, b, scoreA: r?.score_a ?? null, scoreB: r?.score_b ?? null, winner });
    }
    return matches;
  }
  // A duel room code for one match, the same on every device: four letters from the season and match.
  function room(season, match) {
    let h = 2166136261;
    for (const ch of `${season}#${match}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    return Array.from({ length: 4 }, (_, i) => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[(h >>> (i * 5)) % 24]).join('');
  }
  const api = { bracket, room };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.Champions = api;

  // The page: the bracket, a Play button on your own ready match and Watch on every live one.
  const cEsc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  let state = null, myMatch = null;
  async function load() {
    const [{ data }, mine] = await Promise.all([rpc('quotestreak_champions'), rpc('quotestreak_my_code')]);
    state = data;
    const me = mine.data?.code;
    if (!data) { $('champions-body').innerHTML = '<p class="prompt">The bracket is out of reach right now.</p>'; return; }
    $('champions-title').textContent = `${Season.name(data.season)} champions`;
    if (!data.players.length) {
      $('champions-body').innerHTML = `<p class="prompt">Nobody made the ${cEsc(Season.name(data.season))} ladder, so there is no bracket. This season's top eight play when ${cEsc(Season.name(Season.of().id))} ends.</p>`;
      return;
    }
    const name = (p, m) => p ? cEsc(p.name) : m < 4 ? 'Bye' : 'Winner to come';
    let round = '';
    $('champions-body').innerHTML = bracket(data.players, data.results).map(m => {
      const head = m.round !== round ? `<h3>${(round = m.round)}${m.round === 'Final' ? '' : 's'}</h3>` : '';
      const settled = m.scoreA !== null, ready = m.a && m.b && !settled;
      const mineNow = ready && me && (m.a.code === me || m.b.code === me);
      const line = (p, s) => `<span class="${m.winner && p && m.winner.code === p.code ? 'won' : ''}">${name(p, m.match)}${settled ? ` <b>${s}</b>` : ''}</span>`;
      return `${head}<div class="champ-match">${line(m.a, m.scoreA)}<span class="vs">v</span>${line(m.b, m.scoreB)}
        ${mineNow ? `<button data-play="${m.match}">Play your match</button>` : ready ? `<button data-watch="${m.match}" class="secondary">Watch</button>` : ''}</div>`;
    }).join('');
  }
  $('start-champions').onclick = () => { modeSelect.classList.add('hidden'); $('champions').classList.remove('hidden'); load(); };
  $('champions-back').onclick = () => { $('champions').classList.add('hidden'); modeSelect.classList.remove('hidden'); };
  $('champions').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b || !state || (!b.dataset.play && !b.dataset.watch)) return;
    const m = +(b.dataset.play ?? b.dataset.watch), code = room(state.season, m);
    $('champions').classList.add('hidden');
    if (b.dataset.play) { myMatch = m; openDuel(code); } else openWatch(code);
  };
  // When your bracket duel ends, report the score; the match settles once your opponent's report agrees.
  window.quotableDuelDone = async (mine, theirs) => {
    if (myMatch === null) return;
    const m = myMatch;
    myMatch = null;
    const { data, error } = await rpc('quotestreak_champion_report', { match: m, mine, theirs });
    $('final-score').textContent += error ? ` (${error.message})` : data?.settled ? ' The bracket is updated.' : data?.tie ? ' A tie: play the match again.' : ' Waiting for your opponent to confirm the score.';
  };
})(this);
