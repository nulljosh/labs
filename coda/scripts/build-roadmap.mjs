// v99: the public roadmap page, /roadmap, built from roadmap.md's "Road to v100" section on every
// deploy so it can't drift. Done milestones get a filled dot, open ones an empty one, and a blocked
// note shows under its line. Run by scripts/build-site.sh; node scripts/build-roadmap.mjs [out.html].
import fs from 'fs';
const md = fs.readFileSync(new URL('../roadmap.md', import.meta.url), 'utf8');
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code>$1</code>');

export function render(md) {
  const part = md.slice(md.indexOf('## Road to v100'), md.indexOf('\n## ', md.indexOf('## Road to v100') + 5));
  let html = '', open = false, done = 0, total = 0;
  for (const line of part.split('\n').slice(1)) {
    const era = line.match(/^### (.+)/), item = line.match(/^- \[( |x)\] (.+)/);
    if (era) { html += `${open ? '</ol>' : ''}<h2>${inline(era[1])}</h2><ol>`; open = true; }
    else if (item) {
      total++; if (item[1] === 'x') done++;
      const [main, note] = item[2].split(/ (?=\*[^*])/);
      html += `<li class="${item[1] === 'x' ? 'done' : 'open'}">${inline(main)}${note ? `<small>${inline(note)}</small>` : ''}</li>`;
    } else if (line.trim() && !open) html += `<p class="lead">${inline(line.trim())}</p>`;
  }
  return { html: html + (open ? '</ol>' : ''), done, total };
}

if (process.argv[1]?.endsWith('build-roadmap.mjs')) {
  const out = process.argv[2] || new URL('../dist/roadmap.html', import.meta.url).pathname;
  const { html, done, total } = render(md);
  fs.writeFileSync(out, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Coda roadmap</title><meta name="description" content="The road to Coda 100: ${done} of ${total} milestones shipped.">
<link rel="icon" href="/icon.svg" type="image/svg+xml"><link rel="stylesheet" href="/brand/jaybulb-tokens.css"><link rel="stylesheet" href="/brand/tokens.css">
<style>
:root{--ink:#15161a;--bg:#fff;--muted:#6e6e73;--line:#e5e5ea}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ink:#f5f5f7;--bg:#0f1013;--muted:#a1a1a6;--line:#2c2d33}}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Quip Sans",-apple-system,system-ui,sans-serif;line-height:1.5}
main{max-width:680px;margin:0 auto;padding:40px 16px 64px}
h1{font-size:2rem;margin:0 0 8px}h2{font-size:1.15rem;margin:32px 0 8px}
.lead,small,.meter{color:var(--muted)}
ol{list-style:none;padding:0;margin:0}
li{position:relative;padding:10px 0 10px 28px;border-bottom:1px solid var(--line)}
li::before{content:"";position:absolute;left:4px;top:16px;width:12px;height:12px;border-radius:50%;box-shadow:inset 0 0 0 2px var(--ink)}
li.done::before{background:#ffcc00;box-shadow:inset 0 0 0 2px #ffcc00}
small{display:block;font-size:.85rem;margin-top:4px}
a{color:var(--ink)}
</style></head><body><main>
<p><a href="/">Coda</a></p>
<h1>The road to 100</h1>
<p class="meter">${done} of ${total} milestones shipped. A filled dot is live; an empty one is next.</p>
${html}
<p class="lead">This page is built from <code>roadmap.md</code> on every release. <a href="/play">Play</a></p>
</main></body></html>
`);
  console.log(`roadmap: ${done} of ${total}`);
}
