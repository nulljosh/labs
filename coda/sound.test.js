const assert = require('assert');
const { CUES } = require('./sound');
for (const [name, notes] of Object.entries(CUES)) {
  assert(notes.length >= 1, name);
  for (const [f, at, len] of notes) assert(f >= 100 && f <= 2000 && at >= 0 && len > 0 && at + len <= 0.6, `${name} stays short and audible`);
}
assert(CUES.right[CUES.right.length - 1][0] > CUES.right[0][0], 'right goes up');
assert(CUES.over[CUES.over.length - 1][0] < CUES.over[0][0], 'game over comes down');
console.log('sound ok');
