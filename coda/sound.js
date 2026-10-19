// Sound kit (v94): every sound the game makes, by name, synthesized with Web Audio (no files). Each cue
// is a few notes of [frequency in Hz, start in s, length in s] on one voice. They follow the Sound effects
// switch and Volume in Settings through settings.js's beep(), so muting stays one place.
// See docs/MOTION.md. Loaded by play.html as window.Sound and by sound.test.js through require.
(function (root) {
  const CUES = {
    right: [[660, 0, 0.09], [880, 0.08, 0.12]],                  // up a fifth: yes
    streak: [[660, 0, 0.08], [880, 0.07, 0.08], [1100, 0.14, 0.16]],   // every fifth in a row
    wrong: [[196, 0, 0.22]],                                      // one low note, not a buzzer
    tick: [[1000, 0, 0.04]],                                      // each of a speed round's last three seconds
    badge: [[1320, 0, 0.06], [1760, 0.06, 0.1]],                  // a small sparkle
    over: [[523, 0, 0.12], [392, 0.12, 0.12], [330, 0.24, 0.22]], // down to rest
  };
  const api = { CUES };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  api.play = (name) => { for (const [f, at, len] of CUES[name] || []) setTimeout(() => beep(f, len), at * 1000); };
  root.Sound = api;
})(this);
