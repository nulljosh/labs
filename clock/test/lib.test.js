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

test('escape', () => assert.equal(L.esc('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;'));

test('offline shell covers the app and the cache follows the version', () => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), html = fs.readFileSync(path.join(root, 'app.html'), 'utf8');
  const shell = JSON.parse(sw.match(/const SHELL = (\[.*?\]);/)[1].replaceAll("'", '"'));
  for (const [, f] of html.matchAll(/(?:src|href)="([^"?#:]+\.(?:js|css))"/g)) assert.ok(shell.includes(f), `${f} missing from SHELL`);
  for (const f of shell) if (f !== './') assert.ok(fs.existsSync(path.join(root, f === 'app' ? 'app.html' : f)), `${f} in SHELL but not on disk`);
  assert.ok(!shell.some(f => f.endsWith('.html')), 'SHELL must use clean URLs, the host redirects .html');
  assert.match(sw, new RegExp(`const CACHE = 'clock-${L.VERSION.replaceAll('.', '\\.')}'`));
});
