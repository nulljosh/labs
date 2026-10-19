const assert = require('assert');
const { qid, level } = require('./difficulty');
assert.equal(qid(''), '811c9dc5');
assert.equal(qid('a'), 'e40c292c');            // FNV-1a reference vector
assert.equal(qid('Héllo'), qid('Héllo'));
const q = { quote: 'Here is looking at you, kid.' };
assert.equal(level(q, {}), 'easy');
assert.equal(level({ ...q, source: 'x' }, {}), 'medium');
assert.equal(level(q, { [qid(q.quote)]: { plays: 20, correct: 5 } }), 'hard');
assert.equal(level({ ...q, source: 'x' }, { [qid(q.quote)]: { plays: 20, correct: 18 } }), 'easy');
assert.equal(level(q, { [qid(q.quote)]: { plays: 9, correct: 0 } }), 'easy');  // too few plays to judge
console.log('difficulty ok');
