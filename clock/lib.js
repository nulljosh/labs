// Pure helpers: no DOM, no state. Loaded first by app.html, required by test/lib.test.js.
const VERSION = '3.0.0';
const pad = (n, w = 2) => String(Math.floor(n)).padStart(w, '0');
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_LONG = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
function repeatText(days) {
  const d = [...days].sort().join('');
  if (!d) return 'Never';
  if (d === '0123456') return 'Every day';
  if (d === '12345') return 'Weekdays';
  if (d === '06') return 'Weekends';
  return [...days].sort().map(i => DAY_LONG[i]).join(' ');
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
  return [h && `${h} hour${h > 1 ? 's' : ''}`, m && `${m} minute${m > 1 ? 's' : ''}`].filter(Boolean).join(' ');
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
const fmtDur = (ms) => { const s = Math.round(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, r = s % 60; return [h && `${h} hr`, m && `${m} min`, r && `${r} sec`].filter(Boolean).join(' '); };
const fmtSw = (ms) => `${pad(ms / 60000)}:${pad(ms / 1000 % 60)}.${pad(ms / 10 % 100)}`;
// Best and worst lap need two different splits; equal splits mark nothing.
function lapMarks(splits) {
  if (splits.length < 2) return { best: null, worst: null };
  const best = Math.min(...splits), worst = Math.max(...splits);
  return best === worst ? { best: null, worst: null } : { best, worst };
}
// Time with its AM or PM split off, so it can be drawn smaller like iOS. 24 hour locales have no period.
function splitAmPm(fmt, date) {
  const parts = fmt.formatToParts(date), i = parts.findIndex(p => p.type === 'dayPeriod');
  if (i < 0) return [parts.map(p => p.value).join(''), ''];
  return [parts.filter((p, j) => j !== i && !(p.type === 'literal' && (j === i - 1 || j === i + 1))).map(p => p.value).join('').trim(), parts[i].value];
}
const timeHTML = (fmt, date) => { const [t, p] = splitAmPm(fmt, date); return esc(t) + (p ? `<small class="ap">${esc(p)}</small>` : ''); };
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
  const day = there.getDate() === here.getDate() ? 'Today' : there > here ? 'Tomorrow' : 'Yesterday';
  return `${day}, ${diff === 0 ? 'same time' : (diff > 0 ? '+' : '') + diff + ' HRS'}`;
}
if (typeof module === 'object') module.exports = { VERSION, pad, esc, toMin, repeatText, fireTimes, untilText, sunTimes, fmtTm, fmtDur, fmtSw, lapMarks, offsetLabel, splitAmPm, timeHTML, isDaytime };
