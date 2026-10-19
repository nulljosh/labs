const assert = require('assert');
const { parse, answers, questions, encode, decode } = require('./packs');
const text = `"Clean your room." — Mom
Pass the salt - Dad
I'm not lost, I'm exploring | Grandpa
Who ate my yogurt? — Sam

not a line at all
Dinner's ready — Mom`;
const lines = parse(text);
assert.equal(lines.length, 5, 'the line with no answer is skipped');
assert.deepEqual(lines[0], { quote: 'Clean your room.', answer: 'Mom' });
assert.equal(lines[2].answer, 'Grandpa');
assert.deepEqual(answers(lines), ['Mom', 'Dad', 'Grandpa', 'Sam']);
const qs = questions({ title: 'Family', lines });
assert(qs.every(q => q.options.length === 4 && new Set(q.options).size === 4 && q.options.includes(q.answer) && q.noTally));
(async () => {
  const code = await encode({ title: 'Family', lines });
  assert(/^[\w-]+$/.test(code), 'url-safe');
  const back = await decode(code);
  assert.deepEqual(back, { title: 'Family', lines });
  assert.equal(await decode('garbage!!'), null);
  assert.equal(await decode(await encode({ title: '', lines: lines.slice(0, 2) })), null, 'under four answers is no pack');
  console.log('packs ok', code.length, 'chars');
})();
