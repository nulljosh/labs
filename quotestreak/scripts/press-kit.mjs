import { chromium } from 'playwright-core';
import fs from 'fs'; import { execFileSync } from 'child_process';
// Press kit (v84): fresh screenshots and a short gameplay video of the live site, for brand/press/.
// npm i playwright-core somewhere, copy this there and run: node press-kit.mjs [site] [outDir]
// Needs ffmpeg for the video. Every badge is pre-earned so no toast lands in a shot, and rounds play
// in family mode so no sworn line lands in a shot either.
const site = process.argv[2] || 'https://coda.jaybulb.com';
const out = process.argv[3] || new URL('../brand/press', import.meta.url).pathname;
fs.mkdirSync(out, { recursive: true });
const genres = Object.fromEntries(['action', 'comedy', 'drama', 'scifi', 'classic', 'pop', 'rock', 'hiphop', 'rnb', 'country', 'sitcom', 'tvdrama', 'cartoon', 'game', 'book'].map(g => [g, 50]));
const seed = { right: 5000, wrong: 200, bestStreak: 60, games: 200, bestScore: 700, bestSpeed: 400, dailyStreak: 40, genres,
  decades: Object.fromEntries([1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map(d => [d, 5])), typed: 200, cleanStreak: 20, hintWins: 2, duelWins: 6, challenges: 2, cups: 5, perfectCup: 1 };
const b = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const ready = (p) => p.waitForFunction(() => document.querySelectorAll('#genre option').length > 1).then(() => p.waitForTimeout(1500));
const right = (p) => p.evaluate(() => current.answer).then(a => p.click(`#options button:has-text(${JSON.stringify(a)})`));
async function page(w, h, scheme, video, family = true) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: video ? 1 : 2, colorScheme: scheme, ...(video ? { recordVideo: { dir: out, size: { width: w, height: h } } } : {}) });
  await ctx.addInitScript(([s, f]) => { localStorage.setItem('quotestreak_badges', JSON.stringify(s)); localStorage.setItem('quotestreak_family', String(f)); }, [seed, family]);
  return [ctx, await ctx.newPage()];
}
const shot = (p, name) => p.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 82 });
try {
  for (const scheme of ['light', 'dark']) {
    if (scheme === 'light') { const [mctx, m] = await page(390, 844, scheme, false, false); await m.goto(`${site}/play`); await ready(m); await shot(m, 'phone-menu'); await mctx.close(); }
    const [ctx, p] = await page(390, 844, scheme);
    await p.goto(`${site}/play`); await ready(p);
    await p.click('#start-normal'); await p.waitForTimeout(600);
    await shot(p, `phone-question-${scheme}`);
    if (scheme === 'light') { await right(p); await p.waitForTimeout(350); await shot(p, 'phone-right'); }
    await ctx.close();
  }
  const [dctx, d] = await page(1440, 900, 'light');
  await d.goto(`${site}/play`); await ready(d); await d.click('#start-normal'); await d.waitForTimeout(600); await shot(d, 'desktop-question');
  await dctx.close();
  // About twenty seconds of play: three right answers and a miss, on a phone.
  const [vctx, v] = await page(390, 844, 'light', true);
  await v.goto(`${site}/play`); await ready(v);
  await v.click('#start-normal'); await v.waitForTimeout(1500);
  for (let i = 0; i < 3; i++) { await right(v); await v.waitForTimeout(3200); }
  await v.click('#options button >> nth=0'); await v.waitForTimeout(3000);
  const webm = await v.video().path();
  await vctx.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '2', '-i', webm,   // skip the blank frames before the page paints
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-movflags', '+faststart', `${out}/gameplay.mp4`]);
  fs.unlinkSync(webm);
  console.log(fs.readdirSync(out).join(' '));
} finally { await b.close(); }
