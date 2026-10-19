// Adds hand-written translations to every locale and the master list: node scripts/i18n-add.mjs file.json
// where file.json is { "English": { "es": "...", "fr": "...", ... } } covering all 19 languages.
import fs from 'fs';
const add = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const ui = new Set(JSON.parse(fs.readFileSync('i18n/ui.json', 'utf8')));
for (const [en, tr] of Object.entries(add)) {
  ui.add(en);
  for (const [code, text] of Object.entries(tr)) {
    const f = `locales/${code}.json`, d = JSON.parse(fs.readFileSync(f, 'utf8'));
    if ((en.match(/\{[nx]\}/g) || []).join() !== (text.match(/\{[nx]\}/g) || []).join()) throw new Error(`placeholders differ: ${code} ${en}`);
    d[en] = text;
    fs.writeFileSync(f, JSON.stringify(d, null, 1) + '\n');
  }
}
fs.writeFileSync('i18n/ui.json', JSON.stringify([...ui].sort(), null, 1) + '\n');
console.log(Object.keys(add).length, 'strings added');
