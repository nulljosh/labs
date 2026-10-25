process.env.TZ = 'America/Vancouver';   // before any Date: fireTimes and offsetLabel read local time
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const L = require('../lib.js');
const root = path.join(__dirname, '..');

test('repeat text', () => {
  assert.equal(L.repeatText([]), 'Never');
  assert.equal(L.repeatText([6, 0, 1, 2, 3, 4, 5]), 'Every day');
  assert.equal(L.repeatText([5, 1, 2, 3, 4]), 'Weekdays');
  assert.equal(L.repeatText([6, 0]), 'Weekends');
  assert.equal(L.repeatText([3, 1]), 'Mon Wed');
});

test('next alarm time', () => {
  const now = new Date(2026, 9, 25, 8, 0);   // Sunday 08:00
  assert.deepEqual(L.fireTimes('09:30', [], now), new Date(2026, 9, 25, 9, 30));
  assert.deepEqual(L.fireTimes('07:00', [], now), new Date(2026, 9, 26, 7, 0));
  assert.deepEqual(L.fireTimes('08:00', [], now), new Date(2026, 9, 26, 8, 0), 'this very minute waits a day');
  assert.deepEqual(L.fireTimes('07:00', [6], now), new Date(2026, 9, 31, 7, 0), 'Saturday only');
  const dst = L.fireTimes('07:00', [], new Date(2026, 9, 31, 22, 0));   // clocks fall back Nov 1
  assert.equal(dst.getDate(), 1); assert.equal(dst.getHours(), 7);
  assert.equal(L.untilText(new Date(2026, 9, 25, 15, 12), now), '7 hours 12 minutes');
  assert.equal(L.untilText(new Date(2026, 9, 25, 8, 0, 20), now), '1 minute');
});

test('sunrise and sunset, Vancouver midsummer', () => {
  const t = L.sunTimes(new Date(2026, 5, 21), 49.28, -123.12);
  const mins = (d) => d.getHours() * 60 + d.getMinutes();
  assert.ok(Math.abs(mins(t.rise) - (5 * 60 + 7)) <= 5, `rise ${t.rise}`);
  assert.ok(Math.abs(mins(t.set) - (21 * 60 + 22)) <= 5, `set ${t.set}`);
  assert.equal(L.sunTimes(new Date(2026, 5, 21), 80, 0), null, 'polar day');
});

test('timer and stopwatch formats', () => {
  assert.equal(L.fmtTm(300000), '05:00');
  assert.equal(L.fmtTm(299001), '05:00', 'rounds up so 0 shows only at the end');
  assert.equal(L.fmtTm(3723000), '01:02:03');
  assert.equal(L.fmtTm(-5), '00:00');
  assert.equal(L.fmtDur(3723000), '1 hr 2 min 3 sec');
  assert.equal(L.fmtSw(61230), '01:01.23');
});

test('best and worst lap', () => {
  assert.deepEqual(L.lapMarks([5]), { best: null, worst: null });
  assert.deepEqual(L.lapMarks([5, 5, 5]), { best: null, worst: null });
  assert.deepEqual(L.lapMarks([5, 3, 8]), { best: 3, worst: 8 });
});

test('city offset words', () => {
  assert.equal(L.offsetLabel('America/Vancouver', new Date()), 'Today, same time');
  assert.equal(L.offsetLabel('America/Toronto', new Date(2026, 9, 25, 12)), 'Today, +3 HRS');
  assert.equal(L.offsetLabel('Asia/Tokyo', new Date(2026, 9, 25, 12)), 'Tomorrow, +16 HRS');
  assert.equal(L.offsetLabel('Asia/Kolkata', new Date(2026, 9, 25, 12)), 'Tomorrow, +12.5 HRS');
});

test('AM and PM split off for small type', () => {
  const d = new Date(2026, 9, 25, 15, 7, 9);
  assert.deepEqual(L.splitAmPm(new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }), d), ['3:07', 'PM']);
  assert.deepEqual(L.splitAmPm(new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }), d), ['3:07:09', 'PM']);
  assert.deepEqual(L.splitAmPm(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit' }), d), ['15:07', '']);
  assert.equal(L.timeHTML(new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }), d), '3:07<small class="ap">PM</small>');
});

test('day or night by real sunrise', () => {
  const noon = new Date(2026, 9, 25, 12), midnight = new Date(2026, 9, 25, 0, 30);
  assert.equal(L.isDaytime(noon, 49.28, -123.12), true, 'Vancouver noon');
  assert.equal(L.isDaytime(midnight, 49.28, -123.12), false, 'Vancouver midnight');
  assert.equal(L.isDaytime(noon, 35.68, 139.69), false, 'Tokyo at Vancouver noon is 4am');
  assert.equal(L.isDaytime(noon, -36.85, 174.76), true, 'Auckland across the date line, 8am');
  assert.equal(L.isDaytime(new Date(2026, 5, 21, 12), 78.2, 15.6), true, 'Svalbard midnight sun');
});

test('alarm fades in, skips a day, names the morning', () => {
  assert.deepEqual([0, 15000, 60000].map(ms => L.fadeGain(ms).toFixed(3)), ['0.030', '0.165', '0.300']);
  const now = new Date(2026, 9, 25, 8, 0);   // Sunday
  const a = { time: '07:00', days: [1, 2, 3, 4, 5] };
  assert.deepEqual(L.nextFireOf(a, now), new Date(2026, 9, 26, 7, 0));
  assert.deepEqual(L.nextFireOf({ ...a, skip: new Date(2026, 9, 26).toDateString() }, now), new Date(2026, 9, 27, 7, 0), 'skips Monday');
  assert.equal(L.dayWord(new Date(2026, 9, 26, 7), now), 'Tomorrow Morning');
  assert.equal(L.dayWord(new Date(2026, 9, 25, 21), now), 'Today');
  assert.equal(L.dayWord(new Date(2026, 9, 30, 6, 30), now), 'Friday Morning');
});

test('durations and links', () => {
  assert.equal(L.parseDuration('10m'), 600000); assert.equal(L.parseDuration('1h30m'), 5400000); assert.equal(L.parseDuration('90s'), 90000);
  assert.equal(L.parseDuration('5:00'), 300000); assert.equal(L.parseDuration('1:02:03'), 3723000); assert.equal(L.parseDuration('25'), 1500000);
  for (const bad of ['', 'abc', '0', '25h', '-5m', 'm']) assert.equal(L.parseDuration(bad), null, bad);
  assert.deepEqual(L.parseHash('#timer=10m&label=Tea'), { timer: 600000, label: 'Tea' });
  assert.deepEqual(L.parseHash('#alarm=7:30'), { alarm: '07:30', label: '' });
  assert.deepEqual(L.parseHash('#tab=timers'), { tab: 'timer' });
  for (const bad of ['', '#alarm=25:00', '#timer=x', '#tab=settings', '#foo=1']) assert.equal(L.parseHash(bad), null, bad);
});

test('backup round trip, and import refuses junk', () => {
  const state = { alarms: [{ time: '07:30', days: [1, 2], label: 'Gym', sound: 'Radar', on: true, snooze: true, snoozeMin: 5 }], zones: [{ city: 'Tokyo', zone: 'Asia/Tokyo' }],
    recents: [{ dur: 300000, label: 'Tea', sound: 'Chimes' }], sleep: { on: true, bed: '23:00', wake: '07:00', days: [0, 1], wind: 30, sound: 'Gentle', snooze: true } };
  const back = L.parseBackup(L.makeBackup(state));
  assert.equal(back.alarms[0].label, 'Gym'); assert.equal(back.alarms[0].snoozeMin, 5); assert.equal(back.zones[0].zone, 'Asia/Tokyo'); assert.equal(back.sleep.wake, '07:00');
  assert.throws(() => L.parseBackup('nope'), /not a Horula backup/); assert.throws(() => L.parseBackup('{"app":"other","v":1}'), /not a Horula backup/);
  const dirty = L.parseBackup(JSON.stringify({ app: 'clock', v: 1, alarms: [{ time: '99:99' }, { time: '06:00', days: [9, 1, 1], label: 'x'.repeat(500), snoozeMin: 99 }], zones: [{ city: 'X', zone: 'Mars/Base' }] }));
  assert.deepEqual(dirty.alarms.map(a => [a.time, a.days, a.label.length, a.snoozeMin]), [['06:00', [1], 40, 9]]);
  assert.deepEqual(dirty.zones, []);
});

test('escape', () => assert.equal(L.esc('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;'));

test('offline shell covers the app and the cache follows the version', () => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), html = fs.readFileSync(path.join(root, 'app.html'), 'utf8');
  const shell = JSON.parse(sw.match(/const SHELL = (\[.*?\]);/)[1].replaceAll("'", '"'));
  for (const [, f] of html.matchAll(/(?:src|href)="([^"?#:]+\.(?:js|css))"/g)) assert.ok(shell.includes(f), `${f} missing from SHELL`);
  for (const f of shell) if (f !== './') assert.ok(fs.existsSync(path.join(root, f === 'app' ? 'app.html' : f)), `${f} in SHELL but not on disk`);
  assert.ok(!shell.some(f => f.endsWith('.html')), 'SHELL must use clean URLs, the host redirects .html');
  assert.match(sw, new RegExp(`const CACHE = 'horula-${L.VERSION.replaceAll('.', '\\.')}'`));
});

test('hand angles in a city', () => {
  const at = new Date(Date.UTC(2026, 9, 25, 3, 30));   // 12:30 in Tokyo, 20:30 in Vancouver
  assert.deepEqual(L.handAngles('Asia/Tokyo', at), { h: 15, m: 180 });
  assert.deepEqual(L.handAngles('America/Vancouver', at), { h: 255, m: 180 });
});
