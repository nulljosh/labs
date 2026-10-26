const $ = (id) => document.getElementById(id);
// Demo mode (?demo=world|alarms|stopwatch): the landing page shows the real app playing by itself,
// from seeded data held in memory, so it never touches the visitor's own alarms, sound or permissions.
const DEMO = new URLSearchParams(location.search).get('demo');
const DEMO_DATA = DEMO && {
  tab: { world: 'world', alarms: 'alarms', stopwatch: 'stopwatch', timer: 'timer' }[DEMO] || 'world',
  zones: [{ city: 'New York', zone: 'America/New_York' }, { city: 'London', zone: 'Europe/London' }, { city: 'Tokyo', zone: 'Asia/Tokyo' }, { city: 'Sydney', zone: 'Australia/Sydney' }],
  alarms: [{ time: '06:30', days: [1, 2, 3, 4, 5], label: 'Run', on: true }, { time: '07:15', days: [1, 2, 3, 4, 5], label: 'Wake up', on: true }, { time: '09:00', days: [0, 6], label: 'Weekend', on: false }],
  sleep: { on: true, everSet: true, bed: '23:00', wake: '07:15', days: [1, 2, 3, 4, 5], wind: 30, sound: 'Gentle', snooze: true },
  sw: { start: Date.now() - 83000, acc: 0, laps: [19400, 40100, 61800], analog: false },
  timers: [{ id: 1, dur: 300000, label: 'Tea', end: Date.now() + 187000, left: 300000 }, { id: 2, dur: 1500000, label: 'Focus', end: Date.now() + 1302000, left: 1500000 }],
  recents: [{ dur: 300000, label: 'Tea' }, { dur: 540000, label: 'Pasta' }], warned: true,
};
// ponytail: localStorage only, per device. Cross-device sync needs an account; add with jaybulb-api if asked.
const store = DEMO ? { get: (k, d) => DEMO_DATA[k] ?? d, set: (k, v) => { DEMO_DATA[k] = v; } } : {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const hm = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit' });
const atHm = (t) => { const [h, m] = t.split(':').map(Number); const d = new Date(); d.setHours(h, m, 0, 0); return d; };
const hmOf = (t) => hm.format(atHm(t));
const hmHTML = (t) => timeHTML(hm, atHm(t));   // small AM or PM, like iOS
function toast(text, ms = 3000) {
  const t = $('toast'); t.textContent = text; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, ms);
}

// Tabs, remembered across visits.
function show(tab) {
  document.querySelectorAll('main > section').forEach(s => s.hidden = s.id !== tab);
  document.querySelectorAll('nav button').forEach(b => b.dataset.tab === tab ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  store.set('tab', tab);
}
document.querySelectorAll('nav button').forEach(b => b.onclick = () => show(b.dataset.tab));
const saved = store.get('tab', 'world');
show(document.getElementById(saved)?.matches('main > section') ? saved : 'world');   // 'clock' was a tab before v2

// Sound: tones from WebAudio, nothing to download. Browsers only allow audio
// after a tap, so the first tap anywhere unlocks it for later alarms.
let ctx;
const audio = () => (ctx ??= new (window.AudioContext || window.webkitAudioContext)());
addEventListener('pointerdown', () => audio().resume(), { once: true });
const SOUNDS = {
  Radar: [[880, 0], [880, .18], [880, .36], [880, .54]],
  Chimes: [[1047, 0], [1319, .25], [1568, .5]],
  Beacon: [[660, 0], [990, .45]],
  Gentle: [[523, 0], [659, .5], [784, 1]],
  Crystals: [[2093, 0], [1760, .12], [1568, .24], [1319, .36], [1568, .6], [2093, .72]],
  'Slow Rise': [[392, 0], [523, .55], [659, 1.1], [784, 1.65]],
};
const soundOptions = Object.keys(SOUNDS).map(s => `<option>${s}</option>`).join('');
['aSound', 'sSound', 'tmSound'].forEach(id => $(id).innerHTML = soundOptions);
function play(name = 'Radar', vol = 0.3) {
  if (DEMO) return;
  const c = audio();
  (SOUNDS[name] || SOUNDS.Radar).forEach(([f, at]) => {
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
    o.frequency.value = f; o.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.start(t); o.stop(t + 0.32);
  });
}
const notify = (title, body) => { if ('Notification' in window && Notification.permission === 'granted') try { new Notification(title, { body, icon: 'icon.svg' }); } catch {} };
const askNotify = () => { if (!DEMO && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission(); };

// Full screen ringing view. The sound repeats until Stop, capped at 10 minutes.
let ringLoop, ringCap, ringActions = {};
function ring({ when, what, sound, snooze, repeat, onStop, mission }) {
  ringActions = { snooze, repeat, onStop, mission, solved: 0 };
  $('ringMath').hidden = true; document.querySelector('#ringing .controls').hidden = false;
  $('ringWhen').textContent = when; $('ringWhat').textContent = what;
  $('ringSnooze').hidden = !snooze; $('ringRepeat').hidden = !repeat;
  $('ringing').hidden = false; $('stand').hidden = true; $('ringStop').hidden = false; $('ringUp').hidden = true;
  clearInterval(ringLoop); clearTimeout(ringCap);
  // Fades in over 30 seconds and buzzes where the phone allows it.
  const t0 = Date.now(), buzz = () => navigator.vibrate?.([400, 200, 400]);
  play(sound, fadeGain(0)); buzz();
  ringLoop = setInterval(() => { play(sound, fadeGain(Date.now() - t0)); buzz(); }, 2000);
  ringCap = setTimeout(stopRing, 600000);
  notify(what, when);
  ($('ringSnooze').hidden ? $('ringStop') : $('ringSnooze')).focus();
}
function stopRing() { navigator.vibrate?.(0); clearInterval(ringLoop); clearTimeout(ringCap); $('ringing').hidden = true; }
// A mission alarm (Solve to Stop) keeps ringing through three sums; Stop only shows the first.
function nextSum() {
  ringActions.sum = mathProblem(); $('ringQ').textContent = `${ringActions.sum.q} =`;
  $('ringLeft').textContent = tr('{0} of {1}', ringActions.solved + 1, 3); $('ringA').value = ''; $('ringA').focus();
}
$('ringStop').onclick = () => {
  if (!ringActions.mission) { stopRing(); return ringActions.onStop?.(); }
  document.querySelector('#ringing .controls').hidden = true; $('ringMath').hidden = false; nextSum();
};
$('ringA').oninput = () => {
  if (+$('ringA').value !== ringActions.sum.a) return;
  if (++ringActions.solved < 3) return nextSum();
  stopRing(); ringActions.onStop?.();
};
$('ringSnooze').onclick = () => { stopRing(); ringActions.snooze?.(); };
$('ringRepeat').onclick = () => { stopRing(); ringActions.repeat?.(); };
// Focus stays inside the ringing view until it is dismissed.
$('ringing').addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const b = [...$('ringing').querySelectorAll('button:not([hidden])')], i = b.indexOf(document.activeElement);
  e.preventDefault(); b[(i + (e.shiftKey ? -1 : 1) + b.length) % b.length].focus();
});

// Clock face.
function ticksInto(g) {
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0, a = i * 6 * Math.PI / 180, r1 = major ? 86 : 94;
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('class', 'tick');
    l.setAttribute('x1', r1 * Math.sin(a)); l.setAttribute('y1', -r1 * Math.cos(a));
    l.setAttribute('x2', 100 * Math.sin(a)); l.setAttribute('y2', -100 * Math.cos(a));
    l.setAttribute('stroke-width', major ? 3 : 1);
    g.appendChild(l);
  }
}
ticksInto($('ticks')); ticksInto($('swTicks'));
$('swMinTicks').innerHTML = Array.from({ length: 30 }, (_, i) => `<line class="tick" y1="-19" y2="${i % 5 ? -17.5 : -15.5}" stroke-width="${i % 5 ? .6 : 1}" transform="rotate(${i * 12})"/>`).join('');
const timeFmt = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit', second: '2-digit' });
const dateFmt = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', month: 'long', day: 'numeric' });
const shortDate = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', month: 'short', day: 'numeric' });
// Sweep: runs every frame, so the second hand glides instead of ticking. Reduced motion ticks once a second.
const still = matchMedia('(prefers-reduced-motion: reduce)');
function drawSweep(now) { $('sh').setAttribute('transform', `rotate(${(now.getSeconds() + (still.matches ? 0 : now.getMilliseconds() / 1000)) * 6})`); }
function drawClock(now) {
  const s = now.getSeconds(), m = now.getMinutes() + s / 60, h = (now.getHours() % 12) + m / 60;
  $('hh').setAttribute('transform', `rotate(${h * 30})`);
  $('mh').setAttribute('transform', `rotate(${m * 6})`);
  $('digital').innerHTML = timeHTML(timeFmt, now);
  $('date').textContent = dateFmt.format(now);
  const next = nextAlarm(now);
  $('nextAlarm').textContent = next ? tr('Next alarm {0}', `${tr(DAY_LONG[next.at.getDay()])} ${hm.format(next.at)}`) : '';
}

// Sunrise and sunset where the device's time zone is named for a city we know. No location prompt.
const HERE = COORDS[Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replaceAll('_', ' ')];
const hereSun = HERE && sunTimes(new Date(), HERE[0], HERE[1]);
if (hereSun) $('sun').textContent = `${tr('Sunrise')} ${hm.format(hereSun.rise)} · ${tr('Sunset')} ${hm.format(hereSun.set)}`;
