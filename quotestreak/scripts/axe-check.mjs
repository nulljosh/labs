import { chromium } from 'playwright-core';
import http from 'http'; import fs from 'fs'; import path from 'path';
// Accessibility check (v59): axe-core on every screen of the built site. npm i axe-core and
// playwright-core somewhere, then: node scripts/axe-check.mjs light | dark. Expect 0 kinds of violation.
const root = new URL('../dist', import.meta.url).pathname;
const types = { js: 'text/javascript', json: 'application/json', css: 'text/css', svg: 'image/svg+xml', html: 'text/html', woff2: 'font/woff2' };
const srv = http.createServer((q, r) => { let f = path.join(root, q.url.split('?')[0]); if (!path.extname(f)) f += '.html'; fs.readFile(f, (e, d) => { r.writeHead(e ? 404 : 200, { 'content-type': types[path.extname(f).slice(1)] || 'text/plain' }); r.end(d); }); }).listen(0);
const axe = fs.readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const b = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const all = new Map();
const scheme = process.argv[2] || 'light';
try {
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: scheme });
  const run = async (screen) => {
    await p.waitForTimeout(600); await p.addScriptTag({ content: axe });
    const r = await p.evaluate(async () => (await axe.run(document, { resultTypes: ['violations'] })).violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n')[1]) })));
    for (const v of r) { const k = v.id; if (!all.has(k)) all.set(k, { ...v, screens: [] }); all.get(k).screens.push(screen); }
  };
  await p.goto(`http://localhost:${srv.address().port}/play`); await p.waitForFunction(() => document.querySelectorAll('#genre option').length > 1);
  await run('menu');
  await p.click('#start-normal'); await run('round');
  await p.click('#options button >> nth=0'); await p.waitForTimeout(200); await run('reveal');
  await p.waitForTimeout(1200); await p.click('#end-btn'); await run('end');
  await p.click('#restart'); await p.click('#settings-btn'); await run('settings'); await p.click('#settings-close');
  for (const [btn, close] of [['#badges-btn', '#badges-back'], ['#stats-btn', '#stats-back'], ['#season-btn', '#season-back'], ['#start-pack', '#pack-back']]) { await p.click(btn); await p.waitForTimeout(300); await run(btn); await p.click(close); }
  await p.goto(`http://localhost:${srv.address().port}/index.html`); await p.waitForTimeout(1000); await run('landing'); for (const pg of ['buzz', 'party', 'privacy']) { await p.goto(`http://localhost:${srv.address().port}/${pg}.html`); await p.waitForTimeout(800); await run(pg); }
  for (const v of all.values()) console.log(`[${v.impact}] ${v.id}: ${v.help} (${v.screens.join(',')})\n   ${v.nodes.join('\n   ')}`);
  console.log(all.size, 'kinds of violation');
} finally { await b.close(); srv.close(); }
