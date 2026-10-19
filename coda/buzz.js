// The buzzer (v34): a phone joins a party room (duel/worker.js, Party) by code and name, gets each
// question's options from the big screen, and taps one. The screen keeps score; this page only
// shows what it says. buzz.html?room=ABCD fills the code in.
const $ = (id) => document.getElementById(id);
const esc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const params = new URLSearchParams(location.search);
$('buzz-code').value = (params.get('room') || '').toUpperCase();
try { $('buzz-name').value = localStorage.getItem('quotestreak_buzz_name') || ''; } catch {}
let ws = null, me = null, picked = null;

const status = (t) => { $('buzz-status').textContent = t; };
const board = (scores) => {
  $('buzz-board').innerHTML = scores.map(s => `<li>${esc(s.name)}${s.id === me ? ' (you)' : ''} — ${s.score}</li>`).join('');
  const mine = scores.find(s => s.id === me);
  if (mine) $('buzz-me').textContent = `Score: ${mine.score}`;
};

$('buzz-join').onsubmit = (e) => {
  e.preventDefault();
  const code = $('buzz-code').value.trim().toUpperCase(), name = $('buzz-name').value.trim() || 'Player';
  if (!/^[A-Z]{4}$/.test(code)) return status('The code is four letters.');
  try { localStorage.setItem('quotestreak_buzz_name', name); } catch {}
  ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}/duel/party?room=${code}&name=${encodeURIComponent(name)}`);
  $('buzz-join').classList.add('hidden');
  $('buzz-play').classList.remove('hidden');
  status('Joining…');
  ws.onerror = () => { status('That room is full or the code is wrong.'); $('buzz-join').classList.remove('hidden'); };
  ws.onmessage = (ev) => handle(JSON.parse(ev.data));
};

function handle(m) {
  if (m.type === 'hello') { me = m.id; status(m.screen ? 'You’re in. Watch the TV.' : 'You’re in. Waiting for the screen.'); }
  else if (m.type === 'question') {
    picked = null;
    $('buzz-board').innerHTML = '';
    status(`${m.label ? `${m.label} \u00b7 ` : ''}Question ${m.n} of ${m.total}`);
    $('buzz-options').innerHTML = '';
    for (const o of m.options) {
      const b = document.createElement('button');
      b.textContent = o;
      b.onclick = () => {
        if (picked) return;
        picked = o;
        b.classList.add('picked');
        ws.send(JSON.stringify({ type: 'buzz', option: o }));
        status('Locked in.');
      };
      $('buzz-options').appendChild(b);
    }
  } else if (m.type === 'reveal') {
    for (const b of $('buzz-options').children) {
      if (b.textContent === m.answer) b.classList.add('correct');
      else if (b.textContent === picked) b.classList.add('wrong');
      b.disabled = true;
    }
    status(picked === m.answer ? 'Right!' : picked ? 'Not this time.' : 'Too slow.');
    board(m.scores || []);
  } else if (m.type === 'over') {
    $('buzz-options').innerHTML = '';
    const top = (m.scores || [])[0];
    status(top ? (top.id === me ? 'You won!' : `${top.name} won.`) : 'Game over.');
    board(m.scores || []);
  } else if (m.type === 'between') {
    $('buzz-options').innerHTML = '';
    status(`Round ${m.n} of ${m.of}: ${m.title}. Eyes on the screen.`);
  } else if (m.type === 'screen-left') status('The screen left the game.');
}
