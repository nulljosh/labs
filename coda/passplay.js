// Pass and play (v41): two to eight people share one device and take turns, a question each, round
// and round. Classic script after game.js: it picks the deal size, then follows the game through
// window.quotableShown (whose turn) and window.quotableBadge (what they scored). The pure parts are
// exported for passplay.test.js.
(function (root) {
  const MAX = 8;
  // Whose turn it is for the nth question of the game (0-based).
  const turn = (n, players) => n % players.length;
  // "Sam wins with 40." plus the rest, or a tie line. Players arrive as {name, score}.
  function verdict(players) {
    const ranked = [...players].sort((a, b) => b.score - a.score);
    const top = ranked.filter(p => p.score === ranked[0].score);
    const head = top.length > 1 ? `${top.map(p => p.name).join(' and ')} tie at ${top[0].score}.` : `${top[0].name} wins with ${top[0].score}.`;
    const rest = ranked.slice(top.length).map(p => `${p.name} ${p.score}`).join(', ');
    return rest ? `${head} ${rest}.` : head;
  }
  const api = { MAX, turn, verdict };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.PassPlay = api;

  let pp = null;   // {players: [{name, score}], asked, before} while a pass-and-play game runs
  const nameRow = (v = '') => `<input class="pass-name" maxlength="16" placeholder="Player name" value="${v.replace(/"/g, '&quot;')}">`;
  const names = () => [...document.querySelectorAll('.pass-name')].map(i => i.value.trim()).filter(Boolean);

  $('start-pass').onclick = () => {
    $('pass-names').innerHTML = nameRow() + nameRow();
    modeSelect.classList.add('hidden');
    $('pass').classList.remove('hidden');
  };
  $('start-party').onclick = () => { location.href = 'party'; };   // v42: this device becomes the big screen
  $('pass-add').onclick = () => { if (document.querySelectorAll('.pass-name').length < MAX) $('pass-names').insertAdjacentHTML('beforeend', nameRow()); };
  $('pass-back').onclick = () => { $('pass').classList.add('hidden'); modeSelect.classList.remove('hidden'); };
  $('pass-go').onclick = () => {
    const list = names();
    if (list.length < 2) return ($('pass-msg').textContent = 'Two players at least.');
    pp = { players: list.map(name => ({ name, score: 0 })), asked: 0, before: 0 };
    window.quotableOffBoard = true;   // keeps a shared device's total off the leaderboard (game.js)
    $('pass').classList.add('hidden');
    startGame(false);   // deals the first question, and showTurn marks it
    pool = pool.slice(-(list.length * +$('pass-rounds').value - 1));   // the rest, so everyone gets the same number of turns
  };

  const board = () => pp.players.map(p => `${p.name} ${p.score}`).join(' · ');
  function showTurn() {
    if (!pp) return;
    const p = pp.players[turn(pp.asked, pp.players)];
    promptEl.textContent = `${p.name}’s turn. ${promptEl.textContent}`;
    pp.before = score;
    $('score').textContent = board();
    $('streak').textContent = '';   // one streak across several people means nothing
  }
  const shownBeforePass = window.quotableShown;
  window.quotableShown = (q) => { shownBeforePass?.(q); showTurn(); };
  const badgeBeforePass = window.quotableBadge;
  window.quotableBadge = (event, d = {}) => {
    // A shared device's game counts toward nobody's badges, stats, season or high score.
    if (pp && event === 'answer') {
      pp.players[turn(pp.asked, pp.players)].score += score - pp.before;
      pp.asked++;
      setTimeout(() => { if (pp) { $('score').textContent = board(); $('streak').textContent = ''; } });   // after game.js's updateStats
      return;
    }
    if (pp && event === 'game') {
      $('final-score').textContent = verdict(pp.players);
      $('challenge-btn').classList.add('hidden');
      pp = null;
      window.quotableOffBoard = false;
      return;
    }
    badgeBeforePass(event, d);
  };
})(this);
