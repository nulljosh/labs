// Pure helpers: no DOM, no state. Loaded first by app.html, required by test/lib.test.js.
const VERSION = '13.0.0';
// UI text in the reader's language: i18n.js fills I18N in the browser; node tests see English.
const tr = (s, ...a) => ((typeof I18N === 'object' && I18N[s]) || s).replace(/\{(\d)\}/g, (_, i) => a[i]);
// The chosen language's dates; undefined keeps the browser's own region (en-GB 24 hour, fr-CA) when it is the same language.
const LOCALE = typeof LANG === 'string' ? (navigator.language?.startsWith(LANG) ? undefined : LANG) : 'en-US';
const pad = (n, w = 2) => String(Math.floor(n)).padStart(w, '0');
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_LONG = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
function repeatText(days) {
  const d = [...days].sort().join('');
  if (!d) return tr('Never');
  if (d === '0123456') return tr('Every day');
  if (d === '12345') return tr('Weekdays');
  if (d === '06') return tr('Weekends');
  return [...days].sort().map(i => tr(DAY_LONG[i])).join(' ');
}
function fireTimes(time, days, now) {
  // Next moment this hh:mm fires, today or later, on an allowed day.
  const [h, m] = time.split(':').map(Number);
  for (let i = 0; i < 8; i++) {
    const d = new Date(now); d.setDate(d.getDate() + i); d.setHours(h, m, 0, 0);
    if (d > now && (!days.length || days.includes(d.getDay()))) return d;
  }
  return null;
}
function untilText(at, now = new Date()) {
  const mins = Math.max(1, Math.round((at - now) / 60000)), h = Math.floor(mins / 60), m = mins % 60;
  return [h && `${h} ${tr(h > 1 ? 'hours' : 'hour')}`, m && `${m} ${tr(m > 1 ? 'minutes' : 'minute')}`].filter(Boolean).join(' ');
}
// Sunrise and sunset from the NOAA approximation.
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
const fmtTm = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return s >= 3600 ? `${pad(s / 3600)}:${pad(s / 60 % 60)}:${pad(s % 60)}` : `${pad(s / 60)}:${pad(s % 60)}`; };
const fmtDur = (ms) => { const s = Math.round(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, r = s % 60; return [h && `${h} ${tr('hr')}`, m && `${m} ${tr('min')}`, r && `${r} ${tr('sec')}`].filter(Boolean).join(' '); };
const fmtSw = (ms) => `${pad(ms / 60000)}:${pad(ms / 1000 % 60)}.${pad(ms / 10 % 100)}`;
// Best and worst lap need two different splits; equal splits mark nothing.
function lapMarks(splits) {
  if (splits.length < 2) return { best: null, worst: null };
  const best = Math.min(...splits), worst = Math.max(...splits);
  return best === worst ? { best: null, worst: null } : { best, worst };
}
// Alarm volume climbs from a whisper to full over 30 seconds.
const fadeGain = (ms) => 0.03 + 0.27 * Math.min(1, Math.max(0, ms) / 30000);
// Next ring of an alarm, stepping past a skipped day.
function nextFireOf(a, now) {
  const at = fireTimes(a.time, a.days, now);
  return at && a.skip === at.toDateString() ? fireTimes(a.time, a.days, at) : at;
}
// "Tomorrow Morning", "Today", "Friday Morning", like the iOS sleep row.
function dayWord(at, now) {
  const d = Math.round((new Date(at).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 864e5);
  const word = d === 0 ? tr('Today') : d === 1 ? tr('Tomorrow') : new Intl.DateTimeFormat(LOCALE, { weekday: 'long' }).format(at);
  return at.getHours() < 12 ? tr('{0} Morning', word) : word;
}
// "10m", "1h30m", "90s", "5:00", "1:02:03" or a bare number of minutes, to milliseconds. Over a day or nonsense is null.
function parseDuration(s) {
  s = String(s || '').trim().toLowerCase();
  let sec = null, m;
  if ((m = s.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/))) sec = m[3] == null ? +m[1] * 60 + +m[2] : +m[1] * 3600 + +m[2] * 60 + +m[3];
  else if ((m = s.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)) && s) sec = (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0);
  else if (/^\d+$/.test(s)) sec = +s * 60;
  return sec > 0 && sec <= 86400 ? sec * 1000 : null;
}
const HM = /^([01]\d|2[0-3]):[0-5]\d$/;
// Links that do things: #timer=10m, #alarm=07:30&label=Gym, #tab=alarms.
function parseHash(hash) {
  const p = new URLSearchParams(String(hash).replace(/^#/, '')), label = (p.get('label') || '').slice(0, 40);
  if (p.has('timer')) { const ms = parseDuration(p.get('timer')); return ms ? { timer: ms, label } : null; }
  if (p.has('alarm')) { const t = p.get('alarm').padStart(5, '0'); return HM.test(t) ? { alarm: t, label } : null; }
  if (p.has('tab')) { const t = { world: 'world', alarms: 'alarms', stopwatch: 'stopwatch', timer: 'timer', timers: 'timer' }[p.get('tab')]; return t ? { tab: t } : null; }
  return null;
}
// Backups: one JSON file. Import checks every field, since the file comes from outside.
const BACKUP_KEYS = ['alarms', 'sleep', 'zones', 'recents', 'presets'];
const makeBackup = (state) => JSON.stringify({ app: 'clock', v: 1, saved: new Date().toISOString(), ...Object.fromEntries(BACKUP_KEYS.map(k => [k, state[k]])) }, null, 2);
function parseBackup(text) {
  let d; try { d = JSON.parse(text); } catch { throw new Error(tr('That file is not a Horula backup')); }
  if (!d || d.app !== 'clock' || d.v !== 1) throw new Error(tr('That file is not a Horula backup'));
  const str = (v, n) => typeof v === 'string' ? v.slice(0, n) : '';
  const days = (v) => Array.isArray(v) ? [...new Set(v.filter(x => Number.isInteger(x) && x >= 0 && x <= 6))] : [];
  const zoneOk = (z) => { try { new Intl.DateTimeFormat('en-US', { timeZone: z }); return true; } catch { return false; } };
  const out = {};
  if (Array.isArray(d.alarms)) out.alarms = d.alarms.filter(a => a && HM.test(a.time)).slice(0, 100).map(a => ({
    time: a.time, days: days(a.days), label: str(a.label, 40), sound: str(a.sound, 20) || 'Radar', on: a.on !== false,
    snooze: a.snooze !== false, snoozeMin: Number.isInteger(a.snoozeMin) && a.snoozeMin >= 1 && a.snoozeMin <= 15 ? a.snoozeMin : 9, last: '' }));
  if (Array.isArray(d.zones)) out.zones = d.zones.filter(z => z && typeof z.zone === 'string' && zoneOk(z.zone)).slice(0, 50).map(z => ({ city: str(z.city, 60) || z.zone.split('/').pop(), zone: z.zone }));
  const timerList = (v, n) => v.filter(r => r && Number.isFinite(r.dur) && r.dur >= 1000 && r.dur <= 864e5).slice(0, n).map(r => ({ dur: r.dur, label: str(r.label, 40), sound: str(r.sound, 20) || 'Radar' }));
  if (Array.isArray(d.recents)) out.recents = timerList(d.recents, 6);
  if (Array.isArray(d.presets)) out.presets = timerList(d.presets, 20);
  const s = d.sleep;
  if (s && HM.test(s.bed) && HM.test(s.wake)) out.sleep = { on: !!s.on, everSet: true, bed: s.bed, wake: s.wake, days: days(s.days), wind: [0, 15, 30, 45, 60].includes(s.wind) ? s.wind : 30, sound: str(s.sound, 20) || 'Gentle', snooze: s.snooze !== false };
  if (!Object.keys(out).length) throw new Error(tr('That backup is empty'));
  return out;
}
// Time with its AM or PM split off, so it can be drawn smaller like iOS. 24 hour locales have no period.
function splitAmPm(fmt, date) {
  const parts = fmt.formatToParts(date), i = parts.findIndex(p => p.type === 'dayPeriod');
  if (i < 0) return [parts.map(p => p.value).join(''), ''];
  return [parts.filter((p, j) => j !== i && !(p.type === 'literal' && (j === i - 1 || j === i + 1))).map(p => p.value).join('').trim(), parts[i].value];
}
// The period goes where the language puts it: after in English, before in Japanese, Chinese and Korean.
const timeHTML = (fmt, date) => { const [t, p] = splitAmPm(fmt, date), ap = p ? `<small class="ap">${esc(p)}</small>` : '';
  return fmt.formatToParts(date)[0].type === 'dayPeriod' ? ap + esc(t) : esc(t) + ap; };
// Sun up at this place right now? Checks the days either side so places across the date line work.
function isDaytime(now, lat, lon) {
  for (const k of [-1, 0, 1]) {
    const t = sunTimes(new Date(now.getTime() + k * 864e5), lat, lon);
    if (!t) return Math.abs(lat) > 60 && (lat > 0) === [3, 4, 5, 6, 7, 8].includes(now.getMonth());   // ponytail: polar day or night by season
    if (now >= t.rise && now < t.set) return true;
  }
  return false;
}
function offsetLabel(zone, now) {
  const here = new Date(now.toLocaleString('en-US')), there = new Date(now.toLocaleString('en-US', { timeZone: zone }));
  const diff = Math.round((there - here) / 36e5 * 4) / 4;
  const day = tr(there.getDate() === here.getDate() ? 'Today' : there > here ? 'Tomorrow' : 'Yesterday');
  return `${day}, ${diff === 0 ? tr('same time') : (diff > 0 ? '+' : '') + diff + ' ' + tr('HRS')}`;
}
// Where the sun stands overhead at this moment, from the same NOAA terms as sunTimes.
function subsolar(date) {
  const rad = Math.PI / 180, mins = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const day = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - Date.UTC(date.getUTCFullYear(), 0, 0)) / 864e5);
  const g = 2 * Math.PI / 365 * (day - 1 + (mins / 60 - 12) / 24);
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g);
  const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const lon = ((720 - mins - eqt) / 4 + 540) % 360 - 180;
  return { lat: decl / rad, lon };
}
// The latitude where day meets night at a longitude.
const terminatorLat = (s, lon) => { const rad = Math.PI / 180, d = (Math.abs(s.lat) < 0.05 ? 0.05 : s.lat) * rad; return Math.atan(-Math.cos((lon - s.lon) * rad) / Math.tan(d)) / rad; };
// Night as an SVG path on a 360 by 180 map: x is longitude + 180, y is 90 - latitude. The dark side holds the pole in winter.
function nightPath(date) {
  const s = subsolar(date), edge = s.lat > 0 ? 180 : 0, pts = [];
  for (let x = 0; x <= 360; x += 3) pts.push(`${x} ${(90 - terminatorLat(s, x - 180)).toFixed(1)}`);
  return `M0 ${edge}L${pts.join('L')}L360 ${edge}Z`;
}
// Cities whose zone id is named after another city.
const ALIASES = {
  'San Francisco': 'America/Los_Angeles', 'Seattle': 'America/Los_Angeles', 'Portland': 'America/Los_Angeles', 'San Diego': 'America/Los_Angeles',
  'Boston': 'America/New_York', 'Washington DC': 'America/New_York', 'Miami': 'America/New_York', 'Atlanta': 'America/New_York', 'Philadelphia': 'America/New_York',
  'Dallas': 'America/Chicago', 'Houston': 'America/Chicago', 'Austin': 'America/Chicago', 'Las Vegas': 'America/Los_Angeles', 'Calgary': 'America/Edmonton',
  'Ottawa': 'America/Toronto', 'Montreal': 'America/Toronto', 'Beijing': 'Asia/Shanghai', 'Mumbai': 'Asia/Kolkata', 'Delhi': 'Asia/Kolkata',
  'New Delhi': 'Asia/Kolkata', 'Bangalore': 'Asia/Kolkata', 'Osaka': 'Asia/Tokyo', 'Kyoto': 'Asia/Tokyo', 'Abu Dhabi': 'Asia/Dubai',
  'Barcelona': 'Europe/Madrid', 'Milan': 'Europe/Rome', 'Munich': 'Europe/Berlin', 'Frankfurt': 'Europe/Berlin', 'Zurich': 'Europe/Zurich',
  'Manchester': 'Europe/London', 'Edinburgh': 'Europe/London', 'Melbourne': 'Australia/Melbourne', 'Auckland': 'Pacific/Auckland', 'Rio de Janeiro': 'America/Sao_Paulo',
};
// A city name or zone id to { city, zone }: the aliases, else any zone whose last part is that city. Null when unknown.
function findZone(name) {
  const n = String(name || '').trim().toLowerCase(), last = (z) => z.split('/').pop().replaceAll('_', ' ');
  const alias = Object.keys(ALIASES).find(c => c.toLowerCase() === n);
  if (alias) return { city: alias, zone: ALIASES[alias] };
  const zones = Intl.supportedValuesOf('timeZone');
  const z = n && (zones.find(z => z.toLowerCase() === n) || zones.find(z => last(z).toLowerCase() === n));
  return z ? { city: last(z), zone: z } : null;
}
// Time left to a date as whole days and hh:mm:ss, for the countdown embed. Past dates read zero.
const countdown = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return { days: Math.floor(s / 86400), hms: `${pad(s / 3600 % 24)}:${pad(s / 60 % 60)}:${pad(s % 60)}` }; };
// Interval timer: work and rest rounds. The phase after this one, or null when the last work round ends.
function nextPhase(t) {
  if (t.phase === 'work' && t.round >= t.rounds) return null;
  if (t.phase === 'work' && t.rest > 0) return { phase: 'rest', round: t.round, dur: t.rest };
  return { phase: 'work', round: t.round + 1, dur: t.work };
}
// Stopwatch laps as a tab separated table, pastes straight into a spreadsheet.
const lapsTable = (laps) => ['Lap\tSplit\tTotal', ...laps.map((t, i) => `${i + 1}\t${fmtSw(t - (laps[i - 1] || 0))}\t${fmtSw(t)}`)].join('\n');
// Nightstand burn-in guard: the face walks a slow 8px circle, one step a minute.
const drift = (minute) => [Math.round(8 * Math.cos(minute * 0.7)), Math.round(8 * Math.sin(minute * 0.7))];
// Where the sun dot sits on the nightstand's sun dial: over the horizon by day, a shallow dip under it by night.
// ponytail: no known coordinates, or a polar day, falls back to a 6:00 to 18:00 sun.
function dialPoint(now, lat, lon) {
  const day0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const times = (k) => { const d = new Date(day0.getFullYear(), day0.getMonth(), day0.getDate() + k);
    return (lat == null ? null : sunTimes(d, lat, lon)) || { rise: new Date(d.getTime() + 6 * 36e5), set: new Date(d.getTime() + 18 * 36e5) }; };
  const t = times(0);
  if (now >= t.rise && now < t.set) { const f = (now - t.rise) / (t.set - t.rise); return { x: -100 * Math.cos(Math.PI * f), y: -100 * Math.sin(Math.PI * f), day: true }; }
  const [from, to] = now < t.rise ? [times(-1).set, t.rise] : [t.set, times(1).rise];
  const f = (now - from) / (to - from);
  return { x: 100 * Math.cos(Math.PI * f), y: 18 * Math.sin(Math.PI * f), day: false };
}
// Hour and minute hand angles in a city's own time, for the wide grid of faces.
function handAngles(zone, at) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hourCycle: 'h23', timeZone: zone }).formatToParts(at).map(x => [x.type, +x.value]));
  return { h: (p.hour % 12 + p.minute / 60) * 30, m: p.minute * 6 };
}
if (typeof module === 'object') module.exports = { VERSION, subsolar, terminatorLat, nightPath, findZone, countdown, tr, nextPhase, lapsTable, handAngles, drift, dialPoint, pad, esc, toMin, repeatText, fireTimes, untilText, sunTimes, fmtTm, fmtDur, fmtSw, lapMarks, offsetLabel, splitAmPm, timeHTML, isDaytime, fadeGain, nextFireOf, dayWord, parseDuration, parseHash, makeBackup, parseBackup };
