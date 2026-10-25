const $ = (id) => document.getElementById(id);
const pad = (n, w = 2) => String(Math.floor(n)).padStart(w, '0');
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// ponytail: localStorage only, per device. Cross-device sync needs an account; add with jaybulb-api if asked.
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const DAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_LONG = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hm = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const hmOf = (t) => { const [h, m] = t.split(':').map(Number); const d = new Date(); d.setHours(h, m, 0, 0); return hm.format(d); };
function repeatText(days) {
  const d = [...days].sort().join('');
  if (!d) return 'Never';
  if (d === '0123456') return 'Every day';
  if (d === '12345') return 'Weekdays';
  if (d === '06') return 'Weekends';
  return [...days].sort().map(i => DAY_LONG[i]).join(' ');
}
function toast(text) {
  const t = $('toast'); t.textContent = text; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 3000);
}

// Tabs, remembered across visits.
function show(tab) {
  document.querySelectorAll('main > section').forEach(s => s.hidden = s.id !== tab);
  document.querySelectorAll('nav button').forEach(b => b.dataset.tab === tab ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  store.set('tab', tab);
}
document.querySelectorAll('nav button').forEach(b => b.onclick = () => show(b.dataset.tab));
show(store.get('tab', 'clock'));

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
};
const soundOptions = Object.keys(SOUNDS).map(s => `<option>${s}</option>`).join('');
['aSound', 'sSound', 'tmSound'].forEach(id => $(id).innerHTML = soundOptions);
function play(name = 'Radar') {
  const c = audio();
  (SOUNDS[name] || SOUNDS.Radar).forEach(([f, at]) => {
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
    o.frequency.value = f; o.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.start(t); o.stop(t + 0.32);
  });
}
const notify = (title, body) => { if ('Notification' in window && Notification.permission === 'granted') try { new Notification(title, { body, icon: 'icon.svg' }); } catch {} };
const askNotify = () => { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); };

// Full screen ringing view. The sound repeats until Stop, capped at 10 minutes.
let ringLoop, ringCap, ringActions = {};
function ring({ when, what, sound, snooze, repeat, onStop }) {
  ringActions = { snooze, repeat, onStop };
  $('ringWhen').textContent = when; $('ringWhat').textContent = what;
  $('ringSnooze').hidden = !snooze; $('ringRepeat').hidden = !repeat;
  $('ringing').hidden = false; $('stand').hidden = true;
  clearInterval(ringLoop); clearTimeout(ringCap);
  play(sound); ringLoop = setInterval(() => play(sound), 2000);
  ringCap = setTimeout(stopRing, 600000);
  notify(what, when);
  ($('ringSnooze').hidden ? $('ringStop') : $('ringSnooze')).focus();
}
function stopRing() { clearInterval(ringLoop); clearTimeout(ringCap); $('ringing').hidden = true; }
$('ringStop').onclick = () => { stopRing(); ringActions.onStop?.(); };
$('ringSnooze').onclick = () => { stopRing(); ringActions.snooze?.(); };
$('ringRepeat').onclick = () => { stopRing(); ringActions.repeat?.(); };

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
const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' });
const dateFmt = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
const shortDate = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
function drawClock(now) {
  const s = now.getSeconds(), m = now.getMinutes() + s / 60, h = (now.getHours() % 12) + m / 60;
  $('hh').setAttribute('transform', `rotate(${h * 30})`);
  $('mh').setAttribute('transform', `rotate(${m * 6})`);
  $('sh').setAttribute('transform', `rotate(${s * 6})`);
  $('digital').textContent = timeFmt.format(now);
  $('date').textContent = dateFmt.format(now);
  const next = nextAlarm(now);
  $('nextAlarm').textContent = next ? `Next alarm ${DAY_LONG[next.at.getDay()]} ${hm.format(next.at)}` : '';
}

// Sunrise and sunset from the NOAA approximation, only if location is allowed.
function sunTimes(date, lat, lon) {
  const rad = Math.PI / 180, day = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 864e5);
  const g = 2 * Math.PI / 365 * (day - 1);
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g);
  const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const cosH = (Math.cos(90.833 * rad) / (Math.cos(lat * rad) * Math.cos(decl))) - Math.tan(lat * rad) * Math.tan(decl);
  if (cosH > 1 || cosH < -1) return null; // polar day or night
  const ha = Math.acos(cosH) / rad;
  const utcMid = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const at = (mins) => new Date(utcMid + mins * 60000);
  return { rise: at(720 - 4 * (lon + ha) - eqt), set: at(720 - 4 * (lon - ha) - eqt) };
}
if ('geolocation' in navigator) navigator.geolocation.getCurrentPosition(p => {
  const t = sunTimes(new Date(), p.coords.latitude, p.coords.longitude);
  if (t) $('sun').textContent = `Sunrise ${hm.format(t.rise)} · Sunset ${hm.format(t.set)}`;
}, () => {}, { maximumAge: 36e5 });
