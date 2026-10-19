// v8 harvest: real opening lines. Books are Project Gutenberg's 500 most downloaded, kept only
// when the novel's Wikipedia article is well read; the line is read off the book's own text: the first
// sentence after the first chapter heading. Books with no chapter heading (plays, poems,
// letters) are skipped. Writes scripts/harvest-books.json; merge with
// node scripts/merge-harvest.mjs <target> harvest-books.json
import fs from 'fs';
import { UA, wait, views, get } from './wq.mjs';
const OUT = new URL('./harvest-books.json', import.meta.url).pathname;
const text = async (u) => { for (let i = 0; i < 3; i++) { try { const r = await fetch(u, { headers: UA, signal: AbortSignal.timeout(30000) }); if (r.ok) return await r.text(); } catch {} await wait(1500); } return ''; };
const seen = new Set(), books = [];
for (let start = 1; start <= 476; start += 25) {
  const page = await text(`https://www.gutenberg.org/ebooks/search/?sort_order=downloads&start_index=${start}`);
  for (const [, id, title, author] of page.matchAll(/href="\/ebooks\/(\d+)"[\s\S]*?<span class="title">([^<]+)<\/span>\s*(?:<span class="subtitle">([^<]+)<\/span>)?/g)) {
    if (seen.has(id) || !author) continue;
    seen.add(id);
    const unesc = (x) => x.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
    books.push({ id, title: unesc(title), author: unesc(author) });
  }
  await wait(500);
}
console.log(books.length, 'candidates');
// Canonical Wikipedia title (follows redirects), then a year of views on it.
async function fame(t) {
  let best = 0;
  for (const q of [`${t} (novel)`, t]) {
    const s = await get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.replace(/ /g, '_'))}`);
    if (s?.title && /novel|book|story|novella|memoir/i.test(s.description || '')) best = Math.max(best, await views(s.titles?.canonical || s.title));
  }
  return best;
}
const HEAD = /^\s*(CHAPTER|Chapter|BOOK ONE|PART ONE|STAVE)\s+(I|1|ONE|THE FIRST)\b[^\n]*\n/m;
const rows = [];
for (const b of books) {
  const raw = (await text(`https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}.txt`)).replace(/\r/g, '');
  const body = raw.split(/\*\*\* ?START OF[^\n]*\n/)[1]?.split(/\*\*\* ?END OF/)[0] || '';
  // The first "Chapter 1" is often the table of contents: walk the headings and take the first
  // one followed (after blank lines and at most one short subtitle line) by a real paragraph.
  let rest = null;
  for (const h of body.matchAll(new RegExp(HEAD.source, 'gm'))) {
    const lines = body.slice(h.index + h[0].length, h.index + h[0].length + 3000).split('\n');
    let i = 0, skipped = 0;
    while (i < lines.length && (!lines[i].trim() || (lines[i].trim().length < 60 && skipped++ < 2))) i++;
    const para = lines.slice(i).join('\n');
    if (/^[\u201C"'A-Z][^\n]{40,}/.test(para)) { rest = para; break; }
  }
  if (!rest) continue;
  // Skip an all-caps chapter title and a verse epigraph (every line short) before the prose.
  const paras = rest.split(/\n\s*\n/).filter(p => p.trim() && /[a-z]/.test(p) && !p.trim().split('\n').every(l => l.trim().length < 60));
  const flat = (paras[0] || '').slice(0, 1500).replace(/_/g, '').replace(/\s*\n\s*/g, ' ').trim();
  // A full stop after a title or an initial (Mr., St., S., MM.) does not end the sentence.
  const s = flat.match(/^(.{30,260}?(?<!\b(?:Mr|Mrs|Ms|Dr|St|Mt|MM|Messrs|[A-Z]))[.!?][\u201D"'\u2019]?)(?=\s+[\u201C"'A-Z]|$)/);
  if (!s) continue;
  // Gutenberg titles are often lower case ("A farewell to arms"); title-case them.
  const small = /^(a|an|and|the|of|in|on|to|for|with|at|by|or)$/i;
  const answer = b.title.split(/[:;]|, or,? | \u2014 /i)[0].trim().split(' ')
    .map((w, i) => i && small.test(w) ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1)).join(' ');
  const quote = s[1].trim();
  if (quote.toLowerCase().includes(answer.toLowerCase()) || rows.some(r => r.answer === answer)) continue;
  // Famous books only: a year of English Wikipedia views on the novel's article.
  if (await fame(answer) < 150000) continue;
  rows.push({ answer, genre: 'book', type: 'book', source: `https://www.gutenberg.org/ebooks/${b.id}`, lines: [{ quote, character: b.author }] });
  await wait(300);
  console.log(rows.length, b.title);
}
fs.writeFileSync(OUT, JSON.stringify({ gutenberg: rows }));
console.log(books.length, 'books', rows.length, 'opening lines');
