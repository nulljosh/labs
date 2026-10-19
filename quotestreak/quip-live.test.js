const assert = require('assert');
const fs = require('fs');
const { svg, INK, SNOW } = require('./quip-live');
for (const pose of ['idle', 'cheer', 'oops', 'streak']) {
  assert.strictEqual(svg(pose, INK), fs.readFileSync(`${__dirname}/brand/quip-${pose}.svg`, 'utf8'), `${pose} matches mascot.py`);
  assert.strictEqual(svg(pose, SNOW), fs.readFileSync(`${__dirname}/brand/quip-${pose}-dark.svg`, 'utf8'), `${pose}-dark matches mascot.py`);
}
assert(svg('idle', INK, 'shut').includes('stroke-width="9" stroke-linecap="round"/>'), 'a blink draws shut eyes');
console.log('quip-live ok');
