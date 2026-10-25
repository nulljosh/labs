// Nightstand: giant clock, screen kept awake, red after 22:00 until 07:00.
let wakeLock;
async function openStand() {
  $('stand').hidden = false; drawStand(new Date());
  try { wakeLock = await navigator.wakeLock?.request('screen'); } catch {}
  try { await document.documentElement.requestFullscreen?.(); } catch {}
}
function closeStand() {
  $('stand').hidden = true; wakeLock?.release?.(); wakeLock = null;
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}
// Three faces, a dim slider, and a slow drift so a screen left on all night does not burn in.
const HERE = COORDS[Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replaceAll('_', ' ')];
ticksInto($('standTicks'));
function drawStand(now) {
  if ($('stand').hidden) return;
  const h = now.getHours(), face = store.get('standFace', 'digits'), [dx, dy] = drift(Math.floor(now / 60000));
  $('stand').classList.toggle('night', h >= 22 || h < 7);
  $('stand').dataset.face = face;
  $('standFace').style.transform = `translate(${dx}px, ${dy}px)`;
  $('standFace').style.opacity = store.get('standDim', 100) / 100;
  $('standAnalog').toggleAttribute('hidden', face !== 'analog'); $('standSun').toggleAttribute('hidden', face !== 'sun');   // SVG has no .hidden property
  document.querySelectorAll('[data-face]').forEach(b => b.setAttribute('aria-checked', b.dataset.face === face));
  $('standTime').textContent = hm.format(now).replace(/\s?[AP]M$/i, '');
  $('standH').setAttribute('transform', `rotate(${(h % 12 + now.getMinutes() / 60) * 30})`);
  $('standM').setAttribute('transform', `rotate(${now.getMinutes() * 6})`);
  const p = dialPoint(now, HERE?.[0], HERE?.[1]);
  $('standDot').setAttribute('cx', p.x.toFixed(1)); $('standDot').setAttribute('cy', p.y.toFixed(1)); $('standDot').classList.toggle('moon', !p.day);
  const next = nextAlarm(now);
  $('standWhat').textContent = `${shortDate.format(now)}${next ? ` · Alarm ${hm.format(next.at)}` : ''}`;
}
$('standOpen').onclick = openStand;
$('stand').onclick = (e) => { if (!e.target.closest('#standBar')) closeStand(); };
$('standBar').onclick = (e) => { const f = e.target.closest('[data-face]'); if (f) { store.set('standFace', f.dataset.face); drawStand(new Date()); } };
$('standDim').value = store.get('standDim', 100);
$('standDim').oninput = () => { store.set('standDim', +$('standDim').value); drawStand(new Date()); };
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('stand').hidden) closeStand(); });
document.addEventListener('visibilitychange', async () => { if (!$('stand').hidden && document.visibilityState === 'visible') try { wakeLock = await navigator.wakeLock?.request('screen'); } catch {} });

// One loop drives everything; the stopwatch needs frames, the rest only seconds.
let lastSec = -1;
function everySecond(now) { drawClock(now); drawStand(now); tickTimers(); checkAlarms(now); if (now.getSeconds() === 0 && !worldEditing) drawZones(); }
function frame() {
  const now = new Date();
  if (!$('world').hidden) drawSweep(now);
  if (!$('stopwatch').hidden) drawSw();
  if (now.getSeconds() !== lastSec) { lastSec = now.getSeconds(); everySecond(now); }
  requestAnimationFrame(frame);
}
// rAF stalls in background tabs; this keeps alarms and timers firing there.
setInterval(() => { const now = new Date(); tickTimers(); checkAlarms(now); }, 1000);
$('ver').textContent = VERSION;
$('settingsOpen').onclick = () => $('settingsSheet').showModal();

// Backup: export everything to one file, import it on another device.
$('exportBtn').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([makeBackup({ alarms, sleep, zones, recents })], { type: 'application/json' }));
  a.download = `horula-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href);
  toast('Backup saved');
};
$('importBtn').onclick = () => $('importFile').click();
$('importFile').onchange = async () => {
  const f = $('importFile').files[0]; $('importFile').value = ''; if (!f) return;
  try {
    const d = parseBackup(await f.text());
    Object.entries(d).forEach(([k, v]) => store.set(k, v));
    toast(`Restored ${d.alarms?.length ?? 0} alarms and ${d.zones?.length ?? 0} cities`); setTimeout(() => location.reload(), 900);
  } catch (err) { toast(err.message); }
};

// Keys, like the Mac app. Plain keys only while nothing is being typed; Command or Control digits in the installed app.
$('keysBtn').onclick = () => $('keysSheet').showModal();
const TABS = ['world', 'alarms', 'stopwatch', 'timer'], tabNow = () => TABS.find(t => !$(t).hidden);
addEventListener('keydown', (e) => {
  if (e.target.closest('input, select, textarea') || document.querySelector('dialog[open]') || !$('ringing').hidden || e.altKey) return;
  const digit = '1234'.indexOf(e.key);
  if (digit >= 0 && (e.metaKey || e.ctrlKey)) { e.preventDefault(); return show(TABS[digit]); }
  if (e.metaKey || e.ctrlKey) return;
  if (digit >= 0) return show(TABS[digit]);
  const k = e.key.toLowerCase(), tab = tabNow();
  if (k === 'n') { e.preventDefault(); tab === 'alarms' ? openAlarm(-1) : tab === 'world' ? $('citySearch').focus() : (show('timer'), $('tmH').focus()); }
  else if (k === 'e') (tab === 'alarms' ? $('alarmEdit') : $('worldEdit')).click();
  else if (k === 's' && $('stand').hidden) openStand();
  else if (e.key === ',') $('settingsSheet').showModal();
  else if (e.key === '?') $('keysSheet').showModal();
});

// Links that do things: #timer=10m, #alarm=07:30&label=Gym, #tab=alarms. Shortcuts and bookmarks can drive it.
function runHash() {
  const a = parseHash(location.hash); if (!location.hash) return;
  history.replaceState(null, '', location.pathname + location.search);
  if (!a) return toast('That link does not do anything');
  if (a.tab) show(a.tab);
  if (a.timer) { show('timer'); startTimer(a.timer, a.label, 'Radar'); toast(`Timer for ${fmtDur(a.timer)}`); }
  if (a.alarm) {
    show('alarms');
    if (alarms.some(x => x.time === a.alarm && x.on && !x.days.length)) return toast(`Alarm at ${hmOf(a.alarm)} is already set`);
    alarms.push({ time: a.alarm, days: [], label: a.label, sound: 'Radar', snooze: true, snoozeMin: 9, on: true, last: '' });
    alarms.sort((x, y) => x.time.localeCompare(y.time)); saveAlarms(); drawAlarms();
    toast(`Alarm in ${untilText(fireTimes(a.alarm, [], new Date()))}`);
  }
}
addEventListener('hashchange', runHash);
drawAlarms(); drawZones(); drawTimers(); swButtons(); drawLaps(); runHash(); frame();

if (DEMO) document.documentElement.classList.add('demo');
// Demo autoplay: the planner swings, an alarm flips, laps land, so the landing shows the app working.
if (DEMO === 'world') { let t = 0; setInterval(() => { $('scrub').value = Math.round(Math.sin(t += 0.05) * 32); drawZones(); }, 120); }
if (DEMO === 'alarms') setInterval(() => { const sw = $('alarmList').querySelector('[data-on="2"]'); if (sw) sw.click(); }, 2600);
if (DEMO === 'stopwatch') setInterval(() => { if (sw.laps.length >= 7) { sw.laps = []; sw.start = Date.now(); sw.acc = 0; } else swLapReset(); drawLaps(); }, 3200);
if (!DEMO && 'serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
