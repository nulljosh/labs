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
function fireTimes(time, days, now) {
  // Next moment this hh:mm fires, today or later, on an allowed day.
  const [h, m] = time.split(':').map(Number);
  for (let i = 0; i < 8; i++) {
    const d = new Date(now); d.setDate(d.getDate() + i); d.setHours(h, m, 0, 0);
    if (d > now && (!days.length || days.includes(d.getDay()))) return d;
  }
  return null;
}
function nextAlarm(now) {
  const list = alarms.filter(a => a.on).map(a => ({ at: fireTimes(a.time, a.days, now), label: a.label }));
  if (sleep.on) list.push({ at: fireTimes(sleep.wake, sleep.days, now), label: 'Wake Up' });
  snoozes.forEach(s => list.push({ at: new Date(s.at), label: s.label }));
  return list.filter(x => x.at).sort((a, b) => a.at - b.at)[0] || null;
}
function untilText(at, now = new Date()) {
  const mins = Math.max(1, Math.round((at - now) / 60000)), h = Math.floor(mins / 60), m = mins % 60;
  return [h && `${h} hour${h > 1 ? 's' : ''}`, m && `${m} minute${m > 1 ? 's' : ''}`].filter(Boolean).join(' ');
}
function drawAlarms() {
  const hours = ((toMin(sleep.wake) - toMin(sleep.bed) + 1440) % 1440) / 60;
  $('sleepRow').className = `row tap${sleep.on ? '' : ' off'}`;
  $('sleepRow').innerHTML = `<div class="grow"><div class="time num">${hmOf(sleep.bed)} to ${hmOf(sleep.wake)}</div>
    <div class="meta">${hours.toFixed(hours % 1 ? 1 : 0)} hours · ${repeatText(sleep.days)}${sleep.wind ? ` · Wind down ${sleep.wind} min` : ''}</div></div>
    <input type="checkbox" class="switch" id="sleepOn" ${sleep.on ? 'checked' : ''} aria-label="Sleep schedule on">`;
  $('alarmList').innerHTML = alarms.length ? alarms.map((a, i) => `
    <div class="row tap${a.on ? '' : ' off'}" data-edit="${i}"><div class="grow"><div class="time xl num">${hmOf(a.time)}</div>
    <div class="meta">${esc(a.label || 'Alarm')}${a.days.length ? ', ' + repeatText(a.days) : ''}</div></div>
    <input type="checkbox" class="switch" data-on="${i}" ${a.on ? 'checked' : ''} aria-label="Alarm ${a.time} on"></div>`).join('')
    : '<div class="empty">No alarms. Tap Add.</div>';
}
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
$('alarmList').onclick = (e) => {
  const on = e.target.dataset.on;
  if (on != null) {
    alarms[+on].on = e.target.checked; saveAlarms(); drawAlarms();
    if (e.target.checked) { const at = fireTimes(alarms[+on].time, alarms[+on].days, new Date()); toast(`Alarm in ${untilText(at)}`); }
    return;
  }
  const row = e.target.closest('[data-edit]'); if (row) openAlarm(+row.dataset.edit);
};
let editing = -1;
function openAlarm(i) {
  editing = i;
  const a = alarms[i] || { time: `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`, days: [], label: '', sound: 'Radar', snooze: true };
  $('alarmSheetTitle').textContent = i < 0 ? 'Add Alarm' : 'Edit Alarm';
  $('aTime').value = a.time; aDays.set(a.days); $('aLabel').value = a.label; $('aSound').value = a.sound; $('aSnooze').checked = a.snooze;
  $('alarmDelete').hidden = i < 0;
  $('alarmSheet').showModal();
}
$('alarmNew').onclick = () => openAlarm(-1);
$('aSound').onchange = () => play($('aSound').value);
$('alarmDelete').onclick = () => { alarms.splice(editing, 1); saveAlarms(); drawAlarms(); $('alarmSheet').close(); };
$('alarmSheet').onclose = () => {
  if ($('alarmSheet').returnValue !== 'save' || !$('aTime').value) return;
  const a = { time: $('aTime').value, days: aDays.get(), label: $('aLabel').value.trim(), sound: $('aSound').value, snooze: $('aSnooze').checked, on: true, last: '' };
  if (editing < 0) alarms.push(a); else alarms[editing] = a;
  alarms.sort((x, y) => x.time.localeCompare(y.time));
  saveAlarms(); drawAlarms(); askNotify();
  toast(`Alarm in ${untilText(fireTimes(a.time, a.days, new Date()))}`);
};
$('sleepRow').onclick = (e) => {
  if (e.target.id === 'sleepOn') { sleep.on = e.target.checked; store.set('sleep', sleep); drawAlarms(); if (sleep.on) { askNotify(); toast(`Wake up in ${untilText(fireTimes(sleep.wake, sleep.days, new Date()))}`); } return; }
  $('sBed').value = sleep.bed; $('sWake').value = sleep.wake; sDays.set(sleep.days); $('sWind').value = sleep.wind; $('sSound').value = sleep.sound; $('sSnooze').checked = sleep.snooze;
  sleepHours(); $('sleepSheet').showModal();
};
function sleepHours() { if ($('sBed').value && $('sWake').value) $('sHours').textContent = `${(((toMin($('sWake').value) - toMin($('sBed').value) + 1440) % 1440) / 60).toFixed(1).replace('.0', '')} hours of sleep`; }
$('sBed').oninput = $('sWake').oninput = sleepHours;
$('sSound').onchange = () => play($('sSound').value);
$('sleepSheet').onclose = () => {
  if ($('sleepSheet').returnValue !== 'save') return;
  sleep = { ...sleep, on: true, bed: $('sBed').value, wake: $('sWake').value, days: sDays.get(), wind: +$('sWind').value, sound: $('sSound').value, snooze: $('sSnooze').checked };
  store.set('sleep', sleep); drawAlarms(); askNotify();
};
function snoozeFor(label, sound) {
  snoozes.push({ at: Date.now() + 9 * 60000, label, sound }); saveAlarms(); toast('Snoozed for 9 minutes');
}
function checkAlarms(now) {
  if (!$('ringing').hidden) return;
  const t = `${pad(now.getHours())}:${pad(now.getMinutes())}`, today = now.toDateString(), wd = now.getDay();
  for (const a of alarms) {
    if (a.on && a.time === t && a.last !== today && (!a.days.length || a.days.includes(wd))) {
      a.last = today; if (!a.days.length) a.on = false; saveAlarms(); drawAlarms();
      return ring({ when: hm.format(now), what: a.label || 'Alarm', sound: a.sound, snooze: a.snooze && (() => snoozeFor(a.label || 'Alarm', a.sound)) });
    }
  }
  const due = snoozes.findIndex(s => s.at <= now.getTime());
  if (due >= 0) { const [s] = snoozes.splice(due, 1); saveAlarms(); return ring({ when: hm.format(now), what: s.label, sound: s.sound, snooze: () => snoozeFor(s.label, s.sound) }); }
  if (!sleep.on) return;
  if (sleep.wake === t && sleep.lastWake !== today && sleep.days.includes(wd)) {
    sleep.lastWake = today; store.set('sleep', sleep);
    return ring({ when: hm.format(now), what: 'Good morning', sound: sleep.sound, snooze: sleep.snooze && (() => snoozeFor('Good morning', sleep.sound)) });
  }
  const bedDay = new Date(now.getTime() + 864e5).getDay(); // bedtime belongs to the night before a wake day
  if (sleep.days.includes(bedDay) || sleep.days.includes(wd)) {
    const windAt = (toMin(sleep.bed) - sleep.wind + 1440) % 1440, nowMin = now.getHours() * 60 + now.getMinutes();
    if (sleep.wind && nowMin === windAt && sleep.lastWind !== today) { sleep.lastWind = today; store.set('sleep', sleep); play('Gentle'); notify('Wind Down', `Bedtime at ${hmOf(sleep.bed)}`); toast(`Wind down. Bedtime at ${hmOf(sleep.bed)}`); }
    if (sleep.bed === t && sleep.lastBed !== today) { sleep.lastBed = today; store.set('sleep', sleep); play('Gentle'); notify('Bedtime', `Wake up at ${hmOf(sleep.wake)}`); toast(`Bedtime. Wake up at ${hmOf(sleep.wake)}`); }
  }
}
