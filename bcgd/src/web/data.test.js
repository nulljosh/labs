// node --test — build.js turns services.json and areas.json straight into static pages and
// the internal link graph. A duplicate slug silently overwrites a page; a missing field
// renders an empty section. Neither throws, so the build stays green while the site breaks.
// ponytail: data only. build.js does file I/O at import time and is not callable from here.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const services = require('./data/services.json');
const areas = require('./data/areas.json');

// build.js writes each page to /<slug>/ and links to it from every other page.
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

for (const [label, rows, fields] of [
  ['services', services, ['slug', 'name', 'lead', 'signs']],
  ['areas', areas, ['slug', 'name', 'blurb']],
]) {
  test(`${label}: every row has the fields build.js reads`, () => {
    assert.ok(rows.length > 0);
    for (const r of rows) {
      for (const f of fields) assert.ok(r[f], `${label} "${r.slug || r.name}" is missing ${f}`);
    }
  });

  test(`${label}: slugs are unique and URL-safe`, () => {
    const slugs = rows.map(r => r.slug);
    // A collision means one page overwrites the other and the loser 404s from the nav.
    assert.equal(new Set(slugs).size, slugs.length, `${label} has a duplicate slug`);
    for (const s of slugs) assert.match(s, SLUG, `slug "${s}" would not survive as a URL path`);
  });
}

test('services list the symptoms the page renders', () => {
  for (const s of services) {
    assert.ok(Array.isArray(s.signs) && s.signs.length > 0, `"${s.name}" has no signs to list`);
  }
});
