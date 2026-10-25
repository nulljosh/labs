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
function drawStand(now) {
  if ($('stand').hidden) return;
  const h = now.getHours();
  $('stand').classList.toggle('night', h >= 22 || h < 7);
  $('standTime').textContent = hm.format(now).replace(/\s?[AP]M$/i, '');
  const next = nextAlarm(now);
  $('standWhat').textContent = `${shortDate.format(now)}${next ? ` · Alarm ${hm.format(next.at)}` : ''}`;
}
$('standOpen').onclick = openStand;
$('stand').onclick = closeStand;
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
drawAlarms(); drawZones(); drawTimers(); swButtons(); drawLaps(); frame();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
