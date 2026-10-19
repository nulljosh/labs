// v71: check the hand-seeded lines that have no source against their title's Wikiquote page. A line
// counts as found when 80% of its five-word runs appear on the page (quotes differ in commas and
// contractions). Found lines get that page as `source`; the rest are listed for a human to check.
// Writes scripts/verify-bank.json as { quote: source }; --merge writes the sources into every bank copy.
// Harvested lines came off their Wikiquote page, so they already carry one.
import fs from 'fs';
import { api, clean, wait } from './wq.mjs';
const BANKS = ['../quotes.json', '../ios/Quotable/Resources/quotes.json', '../macos/Quotable/Resources/quotes.json'].map(p => new URL(p, import.meta.url).pathname);
const OUT = new URL('./verify-bank.json', import.meta.url).pathname;
const norm = (s) => s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
export function found(quote, pageText) {
  const w = norm(quote).split(' '), text = ` ${norm(pageText)} `;
  if (w.length < 5) return text.includes(` ${w.join(' ')} `);
  const runs = w.slice(0, w.length - 4).map((_, i) => w.slice(i, i + 5).join(' '));
  return runs.filter(r => text.includes(` ${r} `)).length / runs.length >= 0.8;
}

if (process.argv[1]?.endsWith('verify-bank.mjs')) {
  if (process.argv[2] === '--merge') {
    const src = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    for (const p of BANKS) {
      const bank = JSON.parse(fs.readFileSync(p, 'utf8'));
      let n = 0;
      bank.forEach(q => { if (!q.source && src[q.quote]) { q.source = src[q.quote]; n++; } });
      fs.writeFileSync(p, JSON.stringify(bank, null, 2) + '\n');
      console.log(p.split('/').slice(-3).join('/'), n, 'sources added');
    }
  } else {
    const bank = JSON.parse(fs.readFileSync(BANKS[0], 'utf8'));
    const todo = bank.filter(q => !q.source && ['movie', 'tv', 'game'].includes(q.type));
    const out = {}, missed = [], pages = new Map();
    for (const q of todo) {
      const names = [q.answer, `${q.answer} (film)`, q.year && `${q.answer} (${q.year} film)`, `${q.answer} (TV series)`, `${q.answer} (video game)`].filter(Boolean);
      let hit = null;
      for (const page of names) {
        if (!pages.has(page)) {
          const d = await api('en.wikiquote.org', { action: 'parse', page, prop: 'wikitext', redirects: 1 });
          pages.set(page, d?.parse ? { title: d.parse.title, text: d.parse.wikitext.split('\n').map(clean).join(' ') } : null);
          await wait(120);
        }
        const p = pages.get(page);
        if (p && found(q.quote, p.text)) { hit = `https://en.wikiquote.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}`; break; }
      }
      if (hit) out[q.quote] = hit; else missed.push(`${q.answer}: ${q.quote}`);
    }
    fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
    console.log(Object.keys(out).length, 'of', todo.length, 'found on Wikiquote');
    console.log(missed.join('\n'));
  }
}
