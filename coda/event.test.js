const assert = require('assert');
const { isBirthday, age, eventOn, EVENT_START } = require('./event');
assert(isBirthday(new Date(Date.UTC(2027, 9, 18, 3))));
assert(!isBirthday(new Date(Date.UTC(2027, 9, 19, 3))));
assert.strictEqual(age(new Date(Date.UTC(2027, 9, 18))), 1);
assert(eventOn(Date.UTC(2026, 9, 19)), 'billed before the show');
assert(eventOn(EVENT_START + 60000), 'and during it');
assert(!eventOn(EVENT_START + 3600000), 'gone once it is over');
console.log('event ok');
