// Settings and sound. Classic script after game.js (uses its $); game.js calls beep() at answer time.
// Sounds are synthesized with Web Audio, no audio files.
const SFX_ON_KEY = 'quotable_sfx_on';
const SFX_VOL_KEY = 'quotable_sfx_vol';

let audioCtx = null;
function beep(freq, duration) {
  if ($('sfx-toggle') && !$('sfx-toggle').checked) return;
  const vol = ($('sfx-volume') ? $('sfx-volume').value : 60) / 100;
  if (vol <= 0) return;
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.value = freq;
  gain.gain.value = vol * 0.2;
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function initSettings() {
  const toggle = $('sfx-toggle');
  const volume = $('sfx-volume');
  toggle.checked = localStorage.getItem(SFX_ON_KEY) !== 'false';
  volume.value = localStorage.getItem(SFX_VOL_KEY) || '60';
  toggle.onchange = () => localStorage.setItem(SFX_ON_KEY, toggle.checked);
  volume.oninput = () => localStorage.setItem(SFX_VOL_KEY, volume.value);
  $('hints-toggle').checked = localStorage.getItem('quotestreak_hints') === 'true';  // off unless the player turns them on
  $('hints-toggle').onchange = () => localStorage.setItem('quotestreak_hints', $('hints-toggle').checked);
  $('settings-btn').onclick = () => $('settings').classList.remove('hidden');
  $('settings-close').onclick = () => $('settings').classList.add('hidden');
}
initSettings();

// High contrast (v59): follows the system's Increase Contrast until the player flips the switch.
const contrastOn = () => { try { const v = localStorage.getItem('quotestreak_contrast'); return v === null ? matchMedia('(prefers-contrast: more)').matches : v === 'true'; } catch { return false; } };
const applyContrast = () => { document.documentElement.classList.toggle('contrast', contrastOn()); document.documentElement.classList.toggle('no-contrast', !contrastOn()); $('contrast-toggle').checked = contrastOn(); };
$('contrast-toggle').onchange = () => { try { localStorage.setItem('quotestreak_contrast', $('contrast-toggle').checked); } catch {} applyContrast(); };
applyContrast();

// Keys 1 to 4 pick an answer, for keyboard and switch players; Enter on a focused answer works as ever.
addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(document.activeElement?.tagName)) return;
  const n = '1234'.indexOf(e.key);
  const btn = n >= 0 && !gameEl.classList.contains('hidden') && optionsEl.children[n];
  if (btn && !btn.disabled) { e.preventDefault(); btn.click(); }
});

// Family mode (v60, family.js): only kid-safe lines, a poster wall to match, and no Daily, Duel,
// Cup or other shared modes that deal everyone the same unfiltered lines.
const SHARED = ['start-daily', 'start-duel', 'start-party', 'start-library'];
const familyOn = () => { try { return localStorage.getItem('quotestreak_family') === 'true'; } catch { return false; } };
function applyFamily() {
  window.quotableFamily = familyOn();
  $('family-toggle').checked = window.quotableFamily;
  for (const id of [...SHARED]) $(id)?.classList.toggle('hidden', window.quotableFamily);
  $('family-note').classList.toggle('hidden', !window.quotableFamily);
  if (quotes.length) buildBackdrop(window.quotableFamily ? quotes.filter(Family.ok) : quotes);
}
$('family-toggle').onchange = () => { try { localStorage.setItem('quotestreak_family', $('family-toggle').checked); } catch {} applyFamily(); };
applyFamily();

// Themes (v67): the head script reads the choice before paint, so a change reloads. Drive-in is night
// on any system, so the <picture> Quips that follow the system scheme are pointed at their dark twin.
$('look-select').value = document.documentElement.dataset.look;
$('look-select').onchange = () => { try { localStorage.setItem('quotestreak_look', $('look-select').value); } catch {} location.reload(); };
if (document.documentElement.dataset.look === 'drivein') document.querySelectorAll('picture source[media*="dark"]').forEach(s => s.media = 'all');
