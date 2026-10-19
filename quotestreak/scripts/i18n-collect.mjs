// v58: which on-screen strings are interface (to translate) rather than content (quotes, titles,
// names, never translated). A string is interface when its words come from the page or script source,
// leaving out the files that hold content. Numbers become {n}, so "21% right over 14 quotes" and
// "50% right over 3 quotes" are one template. Input: a list of on-screen strings (the QA browser
// collects them); output: i18n/ui.json, the sorted English templates.
import fs from 'fs';
const CONTENT = /^(misquotes|improv|classroom|phrases|phrases-data|world|world-data|quotes)\./;
const src = ['play.html', 'index.html', ...fs.readdirSync('.').filter(f => f.endsWith('.js') && !CONTENT.test(f) && !f.endsWith('.test.js'))]
  .map(f => fs.readFileSync(f, 'utf8')).join('\n').replace(/\\u2019/g, '’').replace(/\\u2014/g, '—').replace(/\\u00b7/g, '·').replace(/\\u2026/g, '…');
const template = (s) => s.replace(/\d[\d,]*(\.\d+)?/g, '{n}');
const seen = JSON.parse(fs.readFileSync(process.argv[2]));
const ui = new Set();
for (const s of seen) {
  if (s.length > 160 || /\n/.test(s)) continue;
  const frags = template(s).split('{n}').map(f => f.trim()).filter(f => f.length > 2);
  if (!frags.length) continue;
  if (frags.every(f => src.includes(f))) ui.add(template(s));
}
fs.writeFileSync('i18n/ui.json', JSON.stringify([...ui].sort(), null, 1) + '\n');
console.log(seen.length, 'on screen,', ui.size, 'interface templates');
