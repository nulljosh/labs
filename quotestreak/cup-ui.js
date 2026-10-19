// Weekly cup screen. A classic script after game.js (shares its top-level bindings: quotes,
// cupRound, startGame, ...). One go per week per browser; scores go to mode "cup-<week>".
const CUP_KEY = 'quotestreak_cup_played';
const cupMode = () => `cup-${Cup.weekKey()}`;
async function showCup(msg = '') {
  modeSelect.classList.add('hidden');
  endEl.classList.add('hidden');
  $('cup').classList.remove('hidden');
  const played = localStorage.getItem(CUP_KEY) === Cup.weekKey();
  $('cup-title').textContent = 'This week\u2019s cup';
  $('cup-msg').textContent = msg || (played ? 'You have played this week. The cup resets on Monday (UTC).'
    : window.quotableSignedIn?.() ? 'Ten quotes, one go, same for everyone this week.' : 'Sign in to put your cup score on the board.');
  $('cup-play').classList.toggle('hidden', played);
  const rows = window.quotableBoard ? await window.quotableBoard(cupMode()) : [];
  const ol = $('cup-list');
  ol.innerHTML = rows.length ? '' : '<li class="note">No cup scores yet this week.</li>';
  rows.slice(0, 20).forEach(r => { const li = document.createElement('li'); li.textContent = `${r.name} \u2014 ${r.score}`; ol.appendChild(li); });
  const names = ['Quarterfinals', 'Semifinals', 'Final'];
  const rounds = Cup.bracket(rows);
  const box = $('cup-bracket');
  box.innerHTML = '';
  rounds.forEach((round, i) => {
    const col = document.createElement('div');
    col.className = 'cup-round';
    const h = document.createElement('h3');
    h.textContent = names[names.length - rounds.length + i] || `Round ${i + 1}`;
    col.appendChild(h);
    for (const m of round) {
      const p = document.createElement('p');
      p.textContent = [m.a, m.b].map(x => x ? `${x.name} ${x.score}` : 'bye').join(' v ');
      if (m.winner) p.title = `${m.winner.name} advances`;
      col.appendChild(p);
    }
    box.appendChild(col);
  });
}
function cupFinish(score) {
  localStorage.setItem(CUP_KEY, Cup.weekKey());
  window.quotableSubmitScore?.(score, cupMode());
  cupRound = null;
  setTimeout(() => showCup(`You scored ${score} in this week's cup.`), 600);
}
$('start-cup').onclick = () => showCup();
$('cup-back').onclick = () => { $('cup').classList.add('hidden'); modeSelect.classList.remove('hidden'); };
$('cup-play').onclick = () => {
  cupRound = Cup.quotes(Cup.weekKey(), quotes, Daily.seededShuffle);
  $('cup').classList.add('hidden');
  $('type-toggle').checked = false;
  startGame(false);
};
