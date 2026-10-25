// Timers: several at once, each tracked by its end time so reloads keep them.
const opts = (n) => Array.from({ length: n }, (_, i) => `<option value="${i}">${i}</option>`).join('');
$('tmH').innerHTML = opts(24); $('tmM').innerHTML = opts(60); $('tmS').innerHTML = opts(60);
$('tmM').value = 5;
let timers = store.get('timers', []), recents = store.get('recents', []);
const saveTimers = () => { store.set('timers', timers); store.set('recents', recents); };
const timerLeft = (t) => t.end ? t.end - Date.now() : t.left;
function startTimer(dur, label, sound) {
  if (dur <= 0) return toast('Pick a duration');
  timers.push({ id: Date.now() + Math.random(), dur, label, sound, end: Date.now() + dur, left: dur });
  recents = [{ dur, label, sound }, ...recents.filter(r => r.dur !== dur || r.label !== label)].slice(0, 6);
  saveTimers(); drawTimers(); askNotify();
}
$('tmStart').onclick = () => startTimer((+$('tmH').value * 3600 + +$('tmM').value * 60 + +$('tmS').value) * 1000, $('tmLabel').value.trim(), $('tmSound').value);
const C = 2 * Math.PI * 24;
function drawTimers() {
  $('tmActiveWrap').hidden = !timers.length; $('tmRecentWrap').hidden = !recents.length;
  $('tmActive').innerHTML = timers.map((t) => `
    <div class="row" data-id="${t.id}">
      <svg class="ring" viewBox="0 0 56 56" aria-hidden="true"><circle class="track" cx="28" cy="28" r="24"/><circle class="bar" cx="28" cy="28" r="24" stroke-dasharray="${C}"/></svg>
      <div class="grow"><div class="time num" data-left></div><div class="meta" data-meta></div></div>
      <div class="stack"><button class="icon ${t.end ? '' : 'go'}" data-pause aria-label="${t.end ? 'Pause' : 'Resume'} timer">${t.end ? 'Pause' : 'Resume'}</button>
      <button class="icon danger" data-cancel aria-label="Cancel timer">Cancel</button></div>
    </div>`).join('');
  $('tmRecent').innerHTML = recents.map((r, i) => `
    <div class="row"><div class="grow"><div class="time">${fmtTm(r.dur)}</div><div class="meta">${esc(r.label || fmtDur(r.dur))}</div></div>
    <button class="icon go" data-recent="${i}" aria-label="Start ${fmtDur(r.dur)} timer">Start</button></div>`).join('');
  tickTimers();
}
$('tmActive').onclick = (e) => {
  const row = e.target.closest('[data-id]'); if (!row) return;
  const i = timers.findIndex(t => String(t.id) === row.dataset.id); if (i < 0) return;
  const t = timers[i];
  if ('pause' in e.target.dataset) { if (t.end) { t.left = t.end - Date.now(); t.end = null; } else t.end = Date.now() + t.left; }
  else if ('cancel' in e.target.dataset) timers.splice(i, 1);
  else return;
  saveTimers(); drawTimers();
};
$('tmRecent').onclick = (e) => { const i = e.target.dataset.recent; if (i != null) { const r = recents[+i]; startTimer(r.dur, r.label, r.sound); } };
function tickTimers() {
  for (const t of [...timers]) {
    const left = timerLeft(t), row = $('tmActive').querySelector(`[data-id="${t.id}"]`);
    if (t.end && left <= 0 && $('ringing').hidden) {
      timers = timers.filter(x => x !== t); saveTimers(); drawTimers();
      ring({ when: '00:00', what: t.label || 'Timer', sound: t.sound, repeat: () => startTimer(t.dur, t.label, t.sound) });
      return;
    }
    if (!row) continue;
    row.querySelector('[data-left]').textContent = fmtTm(left);
    row.querySelector('[data-meta]').textContent = `${t.label ? t.label + ' · ' : ''}${t.end ? 'Ends ' + hm.format(new Date(t.end)) : 'Paused'}`;
    row.querySelector('.bar').setAttribute('stroke-dashoffset', C * (1 - Math.max(0, left) / t.dur));
  }
}
