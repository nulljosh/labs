// Day chips shared by the alarm and sleep sheets.
function dayChips(el) {
  el.innerHTML = DAY.map((d, i) => `<button type="button" data-d="${i}" aria-pressed="false" aria-label="${DAY_LONG[i]}">${d}</button>`).join('');
  el.onclick = (e) => { const b = e.target.closest('button'); if (b) b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); };
  return {
    get: () => [...el.children].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => +b.dataset.d),
    set: (days) => [...el.children].forEach(b => b.setAttribute('aria-pressed', days.includes(+b.dataset.d))),
  };
}
const aDays = dayChips($('aDays')), sDays = dayChips($('sDays'));

// Alarms. A repeating alarm fires on its days; a one-time alarm switches off after it rings.
let alarms = store.get('alarms', []).map(a => ({ days: [], sound: 'Radar', snooze: true, ...a }));
let snoozes = store.get('snoozes', []);
let sleep = store.get('sleep', { on: false, bed: '23:00', wake: '07:00', days: [0, 1, 2, 3, 4, 5, 6], wind: 30, sound: 'Gentle', snooze: true });
const saveAlarms = () => { store.set('alarms', alarms); store.set('snoozes', snoozes); };
function nextAlarm(now) {
  const list = alarms.filter(a => a.on).map(a => ({ at: nextFireOf(a, now), label: a.label }));
  if (sleep.on) list.push({ at: fireTimes(sleep.wake, sleep.days, now), label: tr('Wake Up') });
  snoozes.forEach(s => list.push({ at: new Date(s.at), label: s.label }));
  return list.filter(x => x.at).sort((a, b) => a.at - b.at)[0] || null;
}
function drawAlarms() {
  // Sleep row like iOS: the wake time big, which morning, and one button to change it.
  const now = new Date(), wake = sleep.on && fireTimes(sleep.wake, sleep.days, now);
  $('sleepRow').innerHTML = wake
    ? `<div class="grow"><div class="time xl">${hmHTML(sleep.wake)}</div><div class="meta">${dayWord(wake, now)}</div></div><button class="pill" id="sleepEdit">${tr('Change')}</button>`
    : `<div class="grow"><div class="time">${tr('No Alarm')}</div><div class="meta">${tr('Set a bedtime and a wake up time')}</div></div><button class="pill" id="sleepEdit">${tr('Set Up')}</button>`;
  $('alarmEdit').hidden = !alarms.length; if (!alarms.length) alarmEditing = false;
  $('alarmEdit').textContent = tr(alarmEditing ? 'Done' : 'Edit');
  $('alarmList').innerHTML = alarms.length ? alarms.map((a, i) => {
    const skip = a.on && a.skip && nextFireOf(a, now) && fireTimes(a.time, a.days, now)?.toDateString() === a.skip;
    return `<div class="row${a.on ? '' : ' off'}"><button class="grow rowbtn" data-edit="${i}"><div class="time xl">${hmHTML(a.time)}</div>
    <div class="meta">${esc(a.label || tr('Alarm'))}${a.days.length ? ', ' + repeatText(a.days) : ''}${skip ? ` · ${tr('Skipping {0}', tr(DAY_LONG[new Date(a.skip).getDay()]))}` : ''}</div></button>
    ${alarmEditing ? `<button class="icon danger" data-del="${i}" aria-label="${tr('Delete')} ${a.time}">${tr('Delete')}</button>`
      : `<input type="checkbox" class="switch" data-on="${i}" ${a.on ? 'checked' : ''} aria-label="Alarm ${a.time} on">`}</div>`;
  }).join('') : '<div class="empty">No alarms. Tap + to add one.</div>';
}
let alarmEditing = false;
$('alarmEdit').onclick = () => { alarmEditing = !alarmEditing; drawAlarms(); };
$('alarmList').onclick = (e) => {
  const del = e.target.dataset.del;
  if (del != null) { alarms.splice(+del, 1); saveAlarms(); drawAlarms(); return; }
  const on = e.target.dataset.on;
  if (on != null) {
    alarms[+on].on = e.target.checked; saveAlarms(); drawAlarms();
    if (e.target.checked) toast(tr('Alarm in {0}', untilText(nextFireOf(alarms[+on], new Date()))));
    return;
  }
  const row = e.target.closest('[data-edit]'); if (row && !alarmEditing) openAlarm(+row.dataset.edit);
};
let editing = -1;
function openAlarm(i) {
  editing = i;
  const a = alarms[i] || { time: `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`, days: [], label: '', sound: 'Radar', snooze: true, snoozeMin: 9 };
  $('alarmSheetTitle').textContent = tr(i < 0 ? 'Add Alarm' : 'Edit Alarm');
  $('aTime').value = a.time; aDays.set(a.days); $('aLabel').value = a.label; $('aSound').value = a.sound; $('aSnooze').checked = a.snooze; $('aSnoozeMin').value = a.snoozeMin || 9; $('aCheck').checked = !!a.check;
  $('alarmSkip').hidden = !(a.on && a.days.length);   // skipping only makes sense for a repeating alarm
  $('alarmDelete').hidden = i < 0;
  $('alarmSheet').returnValue = '';   // a dialog keeps the last returnValue; without this, Skip and Delete re-saved
  $('alarmSheet').showModal();
}
$('alarmNew').onclick = () => openAlarm(-1);
$('aSound').onchange = () => play($('aSound').value);
$('aSnoozeMin').innerHTML = Array.from({ length: 15 }, (_, i) => `<option value="${i + 1}">${i + 1} min</option>`).join('');
$('alarmSkip').onclick = () => {
  const a = alarms[editing], at = fireTimes(a.time, a.days, new Date());
  a.skip = at.toDateString(); saveAlarms(); drawAlarms(); $('alarmSheet').close();
  toast(tr('Skipping {0}. Next alarm {1}', tr(DAY_LONG[at.getDay()]), tr(DAY_LONG[nextFireOf(a, new Date()).getDay()])));
};
$('alarmDelete').onclick = () => { alarms.splice(editing, 1); saveAlarms(); drawAlarms(); $('alarmSheet').close(); };
$('alarmSheet').onclose = () => {
  if ($('alarmSheet').returnValue !== 'save' || !$('aTime').value) return;
  const a = { time: $('aTime').value, days: aDays.get(), label: $('aLabel').value.trim(), sound: $('aSound').value, snooze: $('aSnooze').checked, snoozeMin: +$('aSnoozeMin').value, check: $('aCheck').checked, on: true, last: '' };
  const n = new Date();
  if (a.time === `${pad(n.getHours())}:${pad(n.getMinutes())}`) a.last = n.toDateString();   // set for this very minute: next time, as the toast says
  if (editing < 0) alarms.push(a); else alarms[editing] = a;
  alarms.sort((x, y) => x.time.localeCompare(y.time));
  saveAlarms(); drawAlarms(); askNotify();
  if (!store.get('warned', false)) { store.set('warned', true); return toast(tr('Keep this tab open. A closed tab cannot ring.'), 6000); }
  toast(tr('Alarm in {0}', untilText(fireTimes(a.time, a.days, new Date()))));
};
$('sleepRow').onclick = (e) => {
  if (!e.target.closest('#sleepEdit')) return;
  $('sOn').checked = sleep.on || !sleep.everSet; $('sBed').value = sleep.bed; $('sWake').value = sleep.wake; sDays.set(sleep.days); $('sWind').value = sleep.wind; $('sSound').value = sleep.sound; $('sSnooze').checked = sleep.snooze;
  sleepHours(); $('sleepSheet').returnValue = ''; $('sleepSheet').showModal();
};
function sleepHours() { if ($('sBed').value && $('sWake').value) $('sHours').textContent = tr('{0} hours of sleep', (((toMin($('sWake').value) - toMin($('sBed').value) + 1440) % 1440) / 60).toFixed(1).replace('.0', '')); }
$('sBed').oninput = $('sWake').oninput = sleepHours;
$('sSound').onchange = () => play($('sSound').value);
$('sleepSheet').onclose = () => {
  if ($('sleepSheet').returnValue !== 'save') return;
  sleep = { ...sleep, on: $('sOn').checked, everSet: true, bed: $('sBed').value, wake: $('sWake').value, days: sDays.get(), wind: +$('sWind').value, sound: $('sSound').value, snooze: $('sSnooze').checked };
  store.set('sleep', sleep); drawAlarms();
  if (sleep.on) { askNotify(); toast(tr('Wake up in {0}', untilText(fireTimes(sleep.wake, sleep.days, new Date())))); }
};
// Sleep sounds: noise made on the device, looped, fading out over the last minute of the sleep timer.
let nz = null;
$('nzFor').innerHTML = [15, 30, 45, 60, 90, 120].map(m => `<option value="${m}">${fmtDur(m * 60000)}</option>`).join('');
$('nzFor').value = store.get('nzFor', 30); $('nzKind').value = store.get('nzKind', 'pink');
function nzDraw() { $('nzPlay').textContent = tr(nz ? 'Stop' : 'Play'); $('nzPlay').classList.toggle('go', !nz); $('nzLeft').textContent = nz ? tr('Stops at {0}', hm.format(new Date(nz.end))) : ''; }
function nzStop() { if (!nz) return; try { nz.src.stop(); } catch {} clearTimeout(nz.timer); nz = null; nzDraw(); }
function nzPlay() {
  const c = audio(), kind = $('nzKind').value, mins = +$('nzFor').value, s = mins * 60;
  store.set('nzKind', kind); store.set('nzFor', mins);
  const buf = c.createBuffer(1, c.sampleRate * 8, c.sampleRate), src = c.createBufferSource(), g = c.createGain(), t = c.currentTime;
  buf.copyToChannel(noise(kind, buf.length), 0);
  src.buffer = buf; src.loop = true; src.connect(g); g.connect(c.destination);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 3); g.gain.setValueAtTime(0.5, t + s - 60); g.gain.linearRampToValueAtTime(0.0001, t + s);
  src.start(t);
  nz = { src, end: Date.now() + s * 1000, timer: setTimeout(nzStop, s * 1000) }; nzDraw();
}
$('nzPlay').onclick = () => nz ? nzStop() : nzPlay();
$('nzKind').onchange = $('nzFor').onchange = () => { if (nz) { nzStop(); nzPlay(); } };
nzDraw();
function snoozeFor(label, sound, min = 9) {
  snoozes.push({ at: Date.now() + min * 60000, label, sound, min }); saveAlarms(); toast(tr('Snoozed for {0}', `${min} ${tr(min > 1 ? 'minutes' : 'minute')}`));
}
// Wake Up Check, like Alarmy: after Stop it rings again in 3 minutes unless you say you are up.
let wake = store.get('wakeCheck', null);
if (wake && Date.now() - wake.at > 600000) wake = null;   // a check left over from a closed tab is stale
function wakeCheck(a) { wake = { at: Date.now() + 180000, label: a.label || tr('Alarm'), sound: a.sound }; store.set('wakeCheck', wake); showCheck(); }
function showCheck() {
  $('ringWhen').textContent = tr('Are you up?'); $('ringWhat').textContent = tr('Rings again at {0}', hm.format(new Date(wake.at)));
  for (const b of ['ringSnooze', 'ringRepeat', 'ringStop']) $(b).hidden = true;
  $('ringUp').hidden = false; $('ringing').hidden = false; $('ringUp').focus();
}
$('ringUp').onclick = () => { wake = null; store.set('wakeCheck', null); $('ringing').hidden = true; };
if (wake) showCheck();
function checkAlarms(now) {
  if (wake && wake.at <= now.getTime()) { const w = wake; wake = null; store.set('wakeCheck', null); return ring({ when: hm.format(now), what: w.label, sound: w.sound, onStop: () => wakeCheck(w) }); }
  if (!$('ringing').hidden) return;
  const t = `${pad(now.getHours())}:${pad(now.getMinutes())}`, today = now.toDateString(), wd = now.getDay();
  for (const a of alarms) {
    if (a.on && a.time === t && a.last !== today && (!a.days.length || a.days.includes(wd))) {
      a.last = today;
      if (a.skip === today) { delete a.skip; saveAlarms(); drawAlarms(); continue; }   // skipped this one, ring next time
      if (!a.days.length) a.on = false; saveAlarms(); drawAlarms();
      return ring({ when: hm.format(now), what: a.label || tr('Alarm'), sound: a.sound, snooze: a.snooze && (() => snoozeFor(a.label || tr('Alarm'), a.sound, a.snoozeMin)), onStop: a.check && (() => wakeCheck(a)) });
    }
  }
  const due = snoozes.findIndex(s => s.at <= now.getTime());
  if (due >= 0) { const [s] = snoozes.splice(due, 1); saveAlarms(); return ring({ when: hm.format(now), what: s.label, sound: s.sound, snooze: () => snoozeFor(s.label, s.sound, s.min) }); }
  if (!sleep.on) return;
  if (sleep.wake === t && sleep.lastWake !== today && sleep.days.includes(wd)) {
    sleep.lastWake = today; store.set('sleep', sleep);
    return ring({ when: hm.format(now), what: tr('Good morning'), sound: sleep.sound, snooze: sleep.snooze && (() => snoozeFor(tr('Good morning'), sleep.sound)) });
  }
  const bedDay = new Date(now.getTime() + 864e5).getDay(); // bedtime belongs to the night before a wake day
  if (sleep.days.includes(bedDay) || sleep.days.includes(wd)) {
    const windAt = (toMin(sleep.bed) - sleep.wind + 1440) % 1440, nowMin = now.getHours() * 60 + now.getMinutes();
    if (sleep.wind && nowMin === windAt && sleep.lastWind !== today) { sleep.lastWind = today; store.set('sleep', sleep); play('Gentle'); notify(tr('Wind Down'), tr('Bedtime at {0}', hmOf(sleep.bed))); toast(tr('Wind down. Bedtime at {0}', hmOf(sleep.bed))); }
    if (sleep.bed === t && sleep.lastBed !== today) { sleep.lastBed = today; store.set('sleep', sleep); play('Gentle'); notify(tr('Bedtime'), tr('Wake up at {0}', hmOf(sleep.wake))); toast(tr('Bedtime. Wake up at {0}', hmOf(sleep.wake))); }
  }
}
