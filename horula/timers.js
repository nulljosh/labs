// Timers: several at once, each tracked by its end time so reloads keep them.
const opts = (n) => Array.from({ length: n }, (_, i) => `<option value="${i}">${i}</option>`).join('');
$('tmH').innerHTML = opts(24); $('tmM').innerHTML = opts(60); $('tmS').innerHTML = opts(60);
$('tmM').value = 5;
const REST = [10, 15, 20, 30, 45, 60, 90, 120, 180, 300];
$('tmRest').innerHTML = REST.map(s => `<option value="${s}">${fmtDur(s * 1000)}</option>`).join(''); $('tmRest').value = 30;
$('tmRounds').innerHTML = Array.from({ length: 19 }, (_, i) => `<option>${i + 2}</option>`).join(''); $('tmRounds').value = 8;
$('tmSound').onchange = () => play($('tmSound').value);   // hear it before you pick it, like iOS
$('tmSpeak').checked = store.get('tmSpeak', false); $('tmSpeak').onchange = () => store.set('tmSpeak', $('tmSpeak').checked);
// Spoken cues on a new interval phase, in the page's language; off until turned on.
function say(text) {
  if (!store.get('tmSpeak', false) || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text); u.lang = document.documentElement.lang; speechSynthesis.speak(u);
}
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
      <div class="grow"><div class="time num" data-left></div><div class="meta" data-meta></div>
      <button class="icon add" data-add aria-label="Add 1 minute">+1 ${tr('min')}</button></div>
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
  else if ('add' in e.target.dataset) { if (t.end) t.end += 60000; else t.left += 60000; t.dur += 60000; }   // like Timer+: one more minute, the ring rescales
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
// Routines, like Timer+: named steps (Warm up 5 min, Run 20 min, Cool down 5 min) that run back to back.
// A step is the wheel's time and the Label field, so building one uses the controls already on screen.
let routines = store.get('routines', []), draft = [];
const fmtSteps = (steps) => `${tr('{0} steps', steps.length)} · ${fmtDur(steps.reduce((n, s) => n + s.dur, 0))}`;
function drawRoutines() {
  $('rtList').hidden = !routines.length;
  $('rtList').innerHTML = routines.map((r, i) => { const name = esc(r.name || tr('Routine'));
    return `<div class="row"><div class="grow"><div class="label">${name}</div><div class="meta">${fmtSteps(r.steps)} · ${esc(r.steps.map(s => s.label || fmtDur(s.dur)).join(', '))}</div></div>
      <button class="icon" data-rtrm="${i}" aria-label="${tr('Remove')} ${name}">${tr('Remove')}</button><button class="icon go" data-rtgo="${i}" aria-label="${tr('Start')} ${name}">${tr('Start')}</button></div>`; }).join('');
  $('rtSteps').innerHTML = draft.map((s, i) => `<div class="row"><div class="grow label">${i + 1}. ${esc(s.label || tr('Timer'))}</div><div class="meta">${fmtDur(s.dur)}</div>
    <button class="icon danger" data-stepdel="${i}" aria-label="${tr('Remove')} ${i + 1}">${tr('Remove')}</button></div>`).join('');
}
function startRoutine(r) {
  const s = r.steps[0];
  timers.push({ id: Date.now() + Math.random(), dur: s.dur, label: r.name, sound: $('tmSound').value, end: Date.now() + s.dur, left: s.dur, steps: r.steps, step: 0 });
  saveTimers(); drawTimers(); askNotify(); say(stepText(timers.at(-1)));
}
$('rtAdd').onclick = () => {
  const dur = (+$('tmH').value * 3600 + +$('tmM').value * 60 + +$('tmS').value) * 1000; if (!dur) return toast(tr('Pick a duration'));
  draft = [...draft, { dur, label: $('tmLabel').value.trim() }].slice(0, 30); $('tmLabel').value = ''; drawRoutines();
};
$('rtSave').onclick = () => {
  if (!draft.length) return $('rtAdd').focus();
  routines = [...routines, { name: $('rtName').value.trim(), steps: draft }].slice(0, 20); draft = []; $('rtName').value = '';
  store.set('routines', routines); drawRoutines();
};
$('rtSteps').onclick = (e) => { const i = e.target.dataset.stepdel; if (i != null) { draft.splice(+i, 1); drawRoutines(); } };
$('rtList').onclick = (e) => {
  const { rtgo, rtrm } = e.target.dataset;
  if (rtgo != null) startRoutine(routines[+rtgo]);
  else if (rtrm != null) { routines.splice(+rtrm, 1); store.set('routines', routines); drawRoutines(); }
};
drawRoutines();
// Countdowns to a date ("Vacation, 1 month, 29 days"), like Timer+. Counted in days, so they redraw when the day turns.
let countdowns = store.get('countdowns', []), cdDay = '';
const cdFmt = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' });
function drawCountdowns() {
  cdDay = new Date().toDateString();
  $('cdList').hidden = !countdowns.length;
  $('cdList').innerHTML = countdowns.map((c, i) => { const name = esc(c.label || tr('Countdown'));
    return `<div class="row"><div class="grow"><div class="label">${name}</div><div class="meta">${cdFmt.format(new Date(c.date + 'T00:00'))}</div></div>
      <div class="label">${esc(spanText(dateSpan(c.date)))}</div><button class="icon danger" data-cdrm="${i}" aria-label="Remove ${name}">${tr('Remove')}</button></div>`; }).join('');
}
$('cdAdd').onclick = () => {
  const date = $('cdDate').value; if (!date) return $('cdDate').focus();
  countdowns = [...countdowns, { label: $('cdLabel').value.trim(), date }].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 50);
  store.set('countdowns', countdowns); $('cdLabel').value = ''; $('cdDate').value = ''; drawCountdowns();
};
$('cdList').onclick = (e) => { const i = e.target.dataset.cdrm; if (i == null) return; countdowns.splice(+i, 1); store.set('countdowns', countdowns); drawCountdowns(); };
drawCountdowns();
function tickTimers() {
  if (cdDay !== new Date().toDateString()) drawCountdowns();
  for (const t of [...timers]) {
    const left = timerLeft(t), row = $('tmActive').querySelector(`[data-id="${t.id}"]`);
    // Interval rounds roll on with a short sound, a different one for rest; only the last round rings.
    const step = t.end && left <= 0 && t.steps && nextStep(t);
    if (step) {
      Object.assign(t, step, { end: Date.now() + step.dur, left: step.dur });
      play(t.sound === 'Chimes' ? 'Gentle' : 'Chimes'); say(stepText(t)); notify(t.label || tr('Routine'), stepText(t));
      saveTimers(); drawTimers(); return;
    }
    const next = t.end && left <= 0 && t.rounds && nextPhase(t);
    if (next) {
      Object.assign(t, next, { end: Date.now() + next.dur, left: next.dur });
      play(next.phase === 'rest' ? (t.sound === 'Chimes' ? 'Gentle' : 'Chimes') : t.sound);
      say(cueText(next, t.rounds));
      notify(t.label || tr('Timer'), `${tr(next.phase === 'rest' ? 'Rest' : 'Work')}, ${tr('{0} of {1}', next.round, t.rounds)}`);
      saveTimers(); drawTimers(); return;
    }
    if (t.end && left <= 0 && $('ringing').hidden) {
      timers = timers.filter(x => x !== t); saveTimers(); drawTimers();
      const iv = t.rounds && { rest: t.rest, rounds: t.rounds };
      ring({ when: '00:00', what: t.label || tr('Timer'), sound: t.sound, repeat: t.steps ? () => startRoutine({ name: t.label, steps: t.steps }) : () => startTimer(t.work || t.dur, t.label, t.sound, iv) });
      return;
    }
    if (!row) continue;
    row.querySelector('[data-left]').textContent = fmtTm(left);
    row.querySelector('[data-meta]').textContent = `${t.steps ? `${esc(stepText(t))} · ` : ''}${t.rounds ? `${tr(t.phase === 'rest' ? 'Rest' : 'Work')} ${tr('{0} of {1}', t.round, t.rounds)} · ` : ''}${t.label ? t.label + ' · ' : ''}${t.end ? tr('Ends {0}', hm.format(new Date(t.end))) : tr('Paused')}`;
    row.querySelector('.bar').setAttribute('stroke-dashoffset', C * (1 - Math.max(0, left) / t.dur));
  }
}
