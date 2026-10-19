import assert from 'assert';
import { cast, actorFor } from './harvest-actors.mjs';
const wt = `== Cast ==
{{cast listing|
* [[Humphrey Bogart]] - Rick Blaine
* [[w:Ingrid Bergman|Ingrid Bergman]] – Ilsa Lund
* Claude Rains as Captain Louis Renault
* Paul Henreid - Victor Laszlo
* Dooley Wilson - Sam
}}
== See also ==`;
const e = cast(wt);
assert.equal(e.length, 5);
assert.deepEqual(e[0], { actor: 'Humphrey Bogart', roles: ['Rick Blaine'] });
assert.equal(actorFor('Rick Blaine', e), 'Humphrey Bogart');
assert.equal(actorFor('Rick', e), 'Humphrey Bogart', 'a first name alone, when only one role fits');
assert.equal(actorFor('Renault', e), 'Claude Rains');
assert.equal(actorFor('Sam', e), 'Dooley Wilson');
assert.equal(actorFor('Narrator', e), null);
console.log('harvest-actors ok');
