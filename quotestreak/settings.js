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
