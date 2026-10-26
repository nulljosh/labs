// Timers: several at once, each tracked by its end time so reloads keep them.
const opts = (n) => Array.from({ length: n }, (_, i) => `<option value="${i}">${i}</option>`).join('');
$('tmH').innerHTML = opts(24); $('tmM').innerHTML = opts(60); $('tmS').innerHTML = opts(60);
$('tmM').value = 5;
const REST = [10, 15, 20, 30, 45, 60, 90, 120, 180, 300];
$('tmRest').innerHTML = REST.map(s => `<option value="${s}">${fmtDur(s * 1000)}</option>`).join(''); $('tmRest').value = 30;
$('tmRounds').innerHTML = Array.from({ length: 19 }, (_, i) => `<option>${i + 2}</option>`).join(''); $('tmRounds').value = 8;
$('tmSound').onchange = () => play($('tmSound').value);   // hear it before you pick it, like iOS
$('tmIv').onchange = () => document.querySelectorAll('#timer .iv').forEach(r => r.hidden = !$('tmIv').checked);
let timers = store.get('timers', []), recents = store.get('recents', []), presets = store.get('presets', []);
const saveTimers = () => { store.set('timers', timers); store.set('recents', recents); store.set('presets', presets); };
const timerLeft = (t) => t.end ? t.end - Date.now() : t.left;
// iv is { rest, rounds } for an interval timer: dur is the work round, rest the pause between rounds.
function startTimer(dur, label, sound, iv) {
  if (dur <= 0) return toast(tr('Pick a duration'));
  const t = { id: Date.now() + Math.random(), dur, label, sound, end: Date.now() + dur, left: dur };
  if (iv) Object.assign(t, { work: dur, rest: iv.rest, rounds: iv.rounds, round: 1, phase: 'work' });
  timers.push(t);
  recents = [{ dur, label, sound, ...(iv && { iv }) }, ...recents.filter(r => r.dur !== dur || r.label !== label || !!r.iv !== !!iv)].slice(0, 6);
  saveTimers(); drawTimers(); askNotify();
}
$('tmStart').onclick = () => startTimer((+$('tmH').value * 3600 + +$('tmM').value * 60 + +$('tmS').value) * 1000, $('tmLabel').value.trim(), $('tmSound').value,
  $('tmIv').checked ? { rest: +$('tmRest').value * 1000, rounds: +$('tmRounds').value } : null);
const timerMeta = (r) => esc(r.label || fmtDur(r.dur)) + (r.iv ? ` · ${tr('{0} rounds', r.iv.rounds)}` : '');
const C = 2 * Math.PI * 24;
function drawTimers() {
  $('tmActiveWrap').hidden = !timers.length; $('tmRecentWrap').hidden = !recents.length; $('tmPresetWrap').hidden = !presets.length;
  $('tmPreset').innerHTML = presets.map((r, i) => `
    <div class="row"><div class="grow"><div class="time">${fmtTm(r.dur)}</div><div class="meta">${timerMeta(r)}</div></div>
    <button class="icon" data-unpin="${i}" aria-label="Remove ${esc(r.label || fmtDur(r.dur))} preset">${tr('Remove')}</button>
    <button class="icon go" data-preset="${i}" aria-label="Start ${esc(r.label || fmtDur(r.dur))}">${tr('Start')}</button></div>`).join('');
  $('tmActive').innerHTML = timers.map((t) => `
    <div class="row" data-id="${t.id}">
      <svg class="ring" viewBox="0 0 56 56" aria-hidden="true"><circle class="track" cx="28" cy="28" r="24"/><circle class="bar" cx="28" cy="28" r="24" stroke-dasharray="${C}"/></svg>
      <div class="grow"><div class="time num" data-left></div><div class="meta" data-meta></div></div>
      <div class="stack"><button class="icon ${t.end ? '' : 'go'}" data-pause aria-label="${t.end ? 'Pause' : 'Resume'} timer">${tr(t.end ? 'Pause' : 'Resume')}</button>
      <button class="icon danger" data-cancel aria-label="Cancel timer">${tr('Cancel')}</button></div>
    </div>`).join('');
  $('tmRecent').innerHTML = recents.map((r, i) => `
    <div class="row"><div class="grow"><div class="time">${fmtTm(r.dur)}</div><div class="meta">${timerMeta(r)}</div></div>
    <button class="icon" data-pin="${i}" aria-label="Pin ${fmtDur(r.dur)} as a preset">${tr('Pin')}</button>
    <button class="icon go" data-recent="${i}" aria-label="Start ${fmtDur(r.dur)} timer">${tr('Start')}</button></div>`).join('');
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
$('tmRecent').onclick = (e) => {
  const { recent, pin } = e.target.dataset;
  if (recent != null) { const r = recents[+recent]; startTimer(r.dur, r.label, r.sound, r.iv); }
  else if (pin != null) { const r = recents[+pin]; if (!presets.some(p => p.dur === r.dur && p.label === r.label && !!p.iv === !!r.iv)) { presets.push(r); saveTimers(); drawTimers(); toast(tr('Pinned')); } }
};
$('tmPreset').onclick = (e) => {
  const { preset, unpin } = e.target.dataset;
  if (preset != null) { const r = presets[+preset]; startTimer(r.dur, r.label, r.sound, r.iv); }
  else if (unpin != null) { presets.splice(+unpin, 1); saveTimers(); drawTimers(); }
};
function tickTimers() {
  for (const t of [...timers]) {
    const left = timerLeft(t), row = $('tmActive').querySelector(`[data-id="${t.id}"]`);
    // Interval rounds roll on with a short sound, a different one for rest; only the last round rings.
    const next = t.end && left <= 0 && t.rounds && nextPhase(t);
    if (next) {
      Object.assign(t, next, { end: Date.now() + next.dur, left: next.dur });
      play(next.phase === 'rest' ? (t.sound === 'Chimes' ? 'Gentle' : 'Chimes') : t.sound);
      notify(t.label || tr('Timer'), `${tr(next.phase === 'rest' ? 'Rest' : 'Work')}, ${tr('{0} of {1}', next.round, t.rounds)}`);
      saveTimers(); drawTimers(); return;
    }
    if (t.end && left <= 0 && $('ringing').hidden) {
      timers = timers.filter(x => x !== t); saveTimers(); drawTimers();
      const iv = t.rounds && { rest: t.rest, rounds: t.rounds };
      ring({ when: '00:00', what: t.label || tr('Timer'), sound: t.sound, repeat: () => startTimer(t.work || t.dur, t.label, t.sound, iv) });
      return;
    }
    if (!row) continue;
    row.querySelector('[data-left]').textContent = fmtTm(left);
    row.querySelector('[data-meta]').textContent = `${t.rounds ? `${tr(t.phase === 'rest' ? 'Rest' : 'Work')} ${tr('{0} of {1}', t.round, t.rounds)} · ` : ''}${t.label ? t.label + ' · ' : ''}${t.end ? tr('Ends {0}', hm.format(new Date(t.end))) : tr('Paused')}`;
    row.querySelector('.bar').setAttribute('stroke-dashoffset', C * (1 - Math.max(0, left) / t.dur));
  }
}
