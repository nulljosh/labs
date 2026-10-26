process.env.TZ = 'America/Vancouver';   // before any Date: fireTimes and offsetLabel read local time
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const L = { ...require('../lib.js'), ...require('../noise.js') };
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
  const state = { alarms: [{ time: '07:30', days: [1, 2], label: 'Gym', sound: 'Radar', on: true, snooze: true, snoozeMin: 5 }], zones: [{ city: 'Tokyo', zone: 'Asia/Tokyo', nick: 'Office' }, { city: 'Paris', zone: 'Europe/Paris' }],
    recents: [{ dur: 300000, label: 'Tea', sound: 'Chimes' }], sleep: { on: true, bed: '23:00', wake: '07:00', days: [0, 1], wind: 30, sound: 'Gentle', snooze: true } };
  const back = L.parseBackup(L.makeBackup(state));
  assert.equal(back.alarms[0].label, 'Gym'); assert.equal(back.alarms[0].snoozeMin, 5); assert.equal(back.zones[0].zone, 'Asia/Tokyo'); assert.equal(back.zones[0].nick, 'Office'); assert.ok(!('nick' in back.zones[1])); assert.equal(back.sleep.wake, '07:00');
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

test('nightstand drift stays within 8px and moves each minute', () => {
  for (let m = 0; m < 200; m++) { const [x, y] = L.drift(m); assert.ok(Math.hypot(x, y) <= 8.8); }
  assert.notDeepEqual(L.drift(1), L.drift(2));
});

test('sun dial point', () => {
  const noon = L.dialPoint(new Date(2026, 9, 25, 12, 0), null, null);   // fallback sun, 6:00 to 18:00
  assert.ok(noon.day && Math.abs(noon.x) < 1e-9 && Math.abs(noon.y + 100) < 1e-9);
  const midnight = L.dialPoint(new Date(2026, 9, 26, 0, 0), null, null);
  assert.ok(!midnight.day && Math.abs(midnight.x) < 1e-9 && Math.abs(midnight.y - 18) < 1e-9);
  const dawn = L.dialPoint(new Date(2026, 9, 25, 6, 0), null, null);
  assert.ok(dawn.day && Math.abs(dawn.x + 100) < 1e-9, 'sunrise sits on the left of the horizon');
  const van = L.dialPoint(new Date(2026, 9, 25, 13, 0), 49.28, -123.12);
  assert.ok(van.day && van.y < -90, 'Vancouver early afternoon is near the top');
});

test('interval timer phases', () => {
  const t = { work: 40000, rest: 20000, rounds: 3, round: 1, phase: 'work' };
  assert.deepEqual(L.nextPhase(t), { phase: 'rest', round: 1, dur: 20000 });
  assert.deepEqual(L.nextPhase({ ...t, phase: 'rest' }), { phase: 'work', round: 2, dur: 40000 });
  assert.equal(L.nextPhase({ ...t, round: 3 }), null, 'no rest after the last round');
  assert.deepEqual(L.nextPhase({ ...t, rest: 0 }), { phase: 'work', round: 2, dur: 40000 }, 'no rest goes straight to work');
  assert.equal(L.cueText({ phase: 'rest', round: 1 }, 3), 'Rest. Up next: Work');
  assert.equal(L.cueText({ phase: 'work', round: 2 }, 3), 'Work, 2 of 3');
});

test('sleep noise', () => {
  let seed = 1; const rand = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  for (const k of ['white', 'pink', 'brown']) {
    const n = L.noise(k, 44100, rand), max = n.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
    assert.ok(max > 0.01 && max <= 1, `${k} stays in range (${max})`);
  }
  const b = L.noise('brown', 44100, rand);
  assert.ok(Math.abs(b[0] - b[b.length - 1]) < 1e-6, 'brown loops without a click');
  const step = (a) => a.reduce((s, v, i) => i ? s + Math.abs(v - a[i - 1]) : 0, 0) / a.length;
  assert.ok(step(L.noise('brown', 44100, rand)) < step(L.noise('white', 44100, rand)) / 5, 'brown is smoother than white');
});

test('routine steps', () => {
  const t = { steps: [{ label: 'Warm up', dur: 300000 }, { label: '', dur: 60000 }], step: 0 };
  assert.deepEqual(L.nextStep(t), { step: 1, dur: 60000 });
  assert.equal(L.nextStep({ ...t, step: 1 }), null, 'nothing after the last step');
  assert.equal(L.stepText(t), 'Warm up, 1 of 2');
  assert.equal(L.stepText({ ...t, step: 1 }), 'Routine, 2 of 2');
  const b = L.parseBackup(JSON.stringify({ app: 'clock', v: 1, routines: [{ name: 'Run', steps: [{ label: 'Go', dur: 60000 }, { dur: 5 }] }, { name: 'Empty', steps: [] }] }));
  assert.deepEqual(b.routines, [{ name: 'Run', steps: [{ dur: 60000, label: 'Go' }] }]);
});

test('backup keeps the wake up check', () => {
  const b = L.parseBackup(JSON.stringify({ app: 'clock', v: 1, alarms: [{ time: '07:00', check: true }, { time: '08:00', check: 'yes' }] }));
  assert.equal(b.alarms[0].check, true); assert.equal(b.alarms[1].check, undefined);
});

test('laps table', () => {
  assert.equal(L.lapsTable([20000, 41500]), 'Lap\tSplit\tTotal\n1\t00:20.00\t00:20.00\n2\t00:21.50\t00:41.50');
  assert.equal(L.lapsTable([]), 'Lap\tSplit\tTotal');
});

test('backup keeps presets', () => {
  const d = L.parseBackup(L.makeBackup({ presets: [{ dur: 240000, label: 'Tea', sound: 'Chimes' }, { dur: 5 }] }));
  assert.deepEqual(d.presets, [{ dur: 240000, label: 'Tea', sound: 'Chimes' }]);
});

test('every UI string has all 11 translations with the same blanks, and the page has no untranslated label', () => {
  const vm = require('node:vm'), ctx = { localStorage: { getItem: () => null }, navigator: { languages: ['en'] }, document: { documentElement: {} } };
  ctx.self = ctx;
  const langs = fs.readdirSync(path.join(root, 'lang')).map(f => f.replace('.js', ''));
  for (const l of langs) vm.runInNewContext(fs.readFileSync(path.join(root, 'lang', l + '.js'), 'utf8'), ctx);
  vm.runInNewContext(fs.readFileSync(path.join(root, 'i18n.js'), 'utf8') + ';this.LANGS = LANGS;', ctx);
  assert.deepEqual(langs.sort(), [...ctx.LANGS].sort(), 'one file per language');
  const guard = fs.readFileSync(path.join(root, 'app.html'), 'utf8').match(/var langs = \[([^\]]*)\]/)[1].match(/[a-z]{2}/g);
  assert.deepEqual(guard, [...ctx.LANGS], 'app.html picks from the same languages as i18n.js');
  ctx.T = ctx.LANG_TEXT.fr;   // the key list; every language must have the same keys
  const blanks = (s) => (s.match(/\{\d\}/g) || []).sort().join();
  for (const l of langs) {
    assert.deepEqual(Object.keys(ctx.LANG_TEXT[l]).sort(), Object.keys(ctx.T).sort(), `${l} has every string`);
    for (const [k, x] of Object.entries(ctx.LANG_TEXT[l])) { assert.ok(x, `${k} in ${l}`); assert.equal(blanks(x), blanks(k), `${k} in ${l}`); }
  }
  let html = fs.readFileSync(path.join(root, 'app.html'), 'utf8').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>|<kbd>[^<]*<\/kbd>/g, '');
  const texts = [...html.matchAll(/>([^<>]+)</g), ...html.matchAll(/(?:aria-label|placeholder)="([^"]+)"/g)].map(m => m[1].trim())
    .filter(s => s && /[a-z]{2}/.test(s) && !['Horula', 'horula.jaybulb.com'].includes(s));
  const missing = [...new Set(texts)].filter(s => !ctx.T[s]);
  assert.deepEqual(missing, [], 'add these to i18n.js');
});

test('embed: city lookup and countdown', () => {
  assert.deepEqual(L.findZone('tokyo'), { city: 'Tokyo', zone: 'Asia/Tokyo' });
  assert.deepEqual(L.findZone('San Francisco'), { city: 'San Francisco', zone: 'America/Los_Angeles' });
  assert.deepEqual(L.findZone('America/New_York'), { city: 'New York', zone: 'America/New_York' });
  assert.equal(L.findZone('Atlantis'), null);
  assert.equal(L.findZone(''), null);
  assert.deepEqual(L.countdown((2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000 + 999), { days: 2, hms: '03:04:05' });
  assert.deepEqual(L.countdown(-5000), { days: 0, hms: '00:00:00' });
});

test('sun overhead and the night line', () => {
  const june = L.subsolar(new Date(Date.UTC(2026, 5, 21, 12)));
  assert.ok(Math.abs(june.lat - 23.44) < 0.3 && Math.abs(june.lon) < 1.5, `June solstice noon UTC: ${june.lat}, ${june.lon}`);
  const dec = L.subsolar(new Date(Date.UTC(2026, 11, 21, 18)));
  assert.ok(Math.abs(dec.lat + 23.44) < 0.3 && Math.abs(dec.lon + 90) < 1.5, `December solstice 18:00 UTC: ${dec.lat}, ${dec.lon}`);
  assert.ok(Math.abs(L.terminatorLat(june, june.lon + 180) - (90 - june.lat)) < 0.01, 'midnight side: dark up to 90 minus the sun');
  assert.ok(Math.abs(L.terminatorLat(june, june.lon + 90)) < 0.01, 'six hours off the sun: the line crosses the equator');
  assert.ok(L.nightPath(new Date(Date.UTC(2026, 5, 21, 12))).startsWith('M0 180L'), 'June: night holds the south pole');
  assert.ok(L.nightPath(new Date(Date.UTC(2026, 11, 21, 12))).startsWith('M0 0L'), 'December: night holds the north pole');
  assert.ok(L.dayPath(new Date(Date.UTC(2026, 11, 21, 12))).startsWith('M0 180L'), 'December: day holds the south pole');
});

test('the native String Catalog has every string in every language, same blanks as the key', () => {
  const cat = JSON.parse(fs.readFileSync(path.join(root, 'apple/Shared/Localizable.xcstrings'), 'utf8'));
  const blanks = (s) => (s.match(/%(\d\$)?(lld|@)/g) || []).map(x => x.replace(/\d\$/, '')).sort().join();
  const codes = ['ar', 'de', 'es', 'fr', 'hi', 'it', 'ja', 'ko', 'nl', 'pt-BR', 'zh-Hans'];
  for (const [k, v] of Object.entries(cat.strings)) {
    assert.deepEqual(Object.keys(v.localizations).sort(), codes, k);
    for (const [l, x] of Object.entries(v.localizations)) { assert.ok(x.stringUnit.value, `${k} in ${l}`); assert.equal(blanks(x.stringUnit.value), blanks(k), `${k} in ${l}`); }
  }
  for (const k of ['World Clock', 'Next alarm %@', 'Lap %lld', '%lld hr %lld min of sleep', 'Sun Dial']) assert.ok(cat.strings[k], k);
});

test('city names: one file per language, every key a city the search knows', () => {
  const vm = require('node:vm'), ctx = {}; ctx.self = ctx;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'lib.js'), 'utf8') + ';this.ALIASES = ALIASES;', ctx);
  const known = new Set([...Object.keys(ctx.ALIASES), ...Intl.supportedValuesOf('timeZone').map(z => z.split('/').pop().replaceAll('_', ' '))]);
  const langs = fs.readdirSync(path.join(root, 'lang')).map(f => f.replace('.js', ''));
  for (const l of langs) {
    vm.runInNewContext(fs.readFileSync(path.join(root, 'cities', l + '.js'), 'utf8'), ctx);
    for (const [c, n] of Object.entries(ctx.CITY_TEXT[l])) { assert.ok(known.has(c), `${c} in ${l}`); assert.ok(n && !/[<>"&]/.test(n), `${c} in ${l}`); }
    assert.equal(fs.readFileSync(path.join(root, 'apple/Shared', `cities-${l}.json`), 'utf8').trim(), JSON.stringify(ctx.CITY_TEXT[l]), `native ${l} matches web`);
  }
  assert.equal(ctx.CITY_TEXT.ja.Tokyo, '東京'); assert.equal(ctx.CITY_TEXT.hi.Mumbai, 'मुम्बई');
});

test('countdowns to a date', () => {
  const now = new Date(2026, 9, 25, 23, 30), span = (d) => { const s = L.dateSpan(d, now); return [s.years, s.months, s.days, s.past]; };
  assert.deepEqual(span('2026-12-24'), [0, 1, 29, false]);
  assert.deepEqual(span('2026-10-25'), [0, 0, 0, false]);
  assert.deepEqual(span('2026-11-08'), [0, 0, 14, false]);   // across the November clock change
  assert.deepEqual(span('2028-01-01'), [1, 2, 7, false]);
  assert.deepEqual(span('2026-10-01'), [0, 0, 24, true]);
  assert.deepEqual(L.dateSpan('2027-03-01', new Date(2027, 0, 31)), { years: 0, months: 1, days: 1, past: false });   // Jan 31 plus a month is Feb 28
  assert.equal(L.spanText(L.dateSpan('2026-12-24', now)), '1 month, 29 days');
  assert.equal(L.spanText(L.dateSpan('2026-10-25', now)), 'Today');
  assert.equal(L.spanText(L.dateSpan('2026-10-24', now)), '1 day ago');
  const back = L.parseBackup(JSON.stringify({ app: 'clock', v: 1, countdowns: [{ label: 'Trip', date: '2026-12-24' }, { date: 'soon' }] }));
  assert.deepEqual(back.countdowns, [{ label: 'Trip', date: '2026-12-24' }]);
});

test('next clock change', () => {
  const now = new Date('2026-10-26T06:30:00Z'), v = L.nextShift('America/New_York', now);
  assert.equal(v.at.toISOString(), '2026-11-01T06:00:00.000Z'); assert.deepEqual([v.from, v.to], [-240, -300]);
  assert.equal(L.nextShift('America/Vancouver', now), null);   // BC keeps daylight time all year from 2026 (tzdata 2026e)
  assert.equal(L.nextShift('Europe/London', new Date('2026-12-01T00:00:00Z')).at.toISOString(), '2027-03-28T01:00:00.000Z');
  assert.equal(L.nextShift('Australia/Sydney', now).at.toISOString(), '2027-04-03T16:00:00.000Z');
  assert.equal(L.nextShift('Asia/Tokyo', now), null);
});
