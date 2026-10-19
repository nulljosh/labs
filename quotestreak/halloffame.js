// Hall of fame (v97): the ten best checked runs ever on each board, kept for good by jaybulb-api.
// A run gets in only after the server has checked it (v87). If a player deletes their account, the run
// stays as "A former player". Classic script after clubs.js (uses its rpc).
$('lb-btn').insertAdjacentHTML('afterend', '<button id="hall-btn">Hall of fame</button>');
modeSelect.insertAdjacentHTML('afterend', `<div id="hall" class="panel hidden">
    <h2>Hall of fame</h2>
    <p class="prompt">The best runs ever, checked and kept for good.</p>
    <h3>Classic</h3><ol id="hall-normal" class="library-list"></ol>
    <h3>Speed Round</h3><ol id="hall-speed" class="library-list"></ol>
    <button id="hall-back">Back</button>
  </div>`);
const hallEsc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
$('hall-btn').onclick = async () => {
  modeSelect.classList.add('hidden');
  $('hall').classList.remove('hidden');
  const r = await fetch(`${API}/rpc/quotestreak_hall_of_fame`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }).then(x => x.json()).catch(() => null);
  const when = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const list = (rows) => rows?.length ? rows.map((x, i) => `<li><span><b>${i + 1}. ${hallEsc(x.name)}</b><small>${when(x.date)}</small></span><b>${x.score}</b></li>`).join('')
    : `<li class="note">${r ? 'Nobody yet. The first great run goes here.' : 'The hall is out of reach right now.'}</li>`;
  $('hall-normal').innerHTML = list(r?.normal);
  $('hall-speed').innerHTML = list(r?.speed);
};
$('hall-back').onclick = () => { $('hall').classList.add('hidden'); modeSelect.classList.remove('hidden'); };
