// v7 harvest: real video game lines from Wikiquote, nothing typed from memory. Games come
// from Wikiquote's "<year> video games" categories, ranked by a year of English Wikipedia
// pageviews so the famous ones win. Writes scripts/harvest-games.json (resumable);
// fold it in with: node scripts/merge-harvest.mjs <target> harvest-games.json
import fs from 'fs';
import { api, views, lines, pick, wait } from './wq.mjs';
const OUT = new URL('./harvest-games.json', import.meta.url).pathname;
const TOP = 8, PER = 2;
const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const taken = new Set(Object.values(done).flat().map(r => r.answer));
// Famous games by name (lines still come off each game's own Wikiquote page; the year is the
// first one in the page lede). The year walk then adds the most-viewed games this list missed.
const FAMOUS = ['Portal (video game)', 'Portal 2', 'Half-Life 2', 'BioShock', 'BioShock Infinite', 'The Last of Us', 'Red Dead Redemption', 'Red Dead Redemption 2', 'Mass Effect', 'Mass Effect 2', 'Halo: Combat Evolved', 'Halo 3', 'Metal Gear Solid', 'Metal Gear Solid 3: Snake Eater', 'Grand Theft Auto: San Andreas', 'Grand Theft Auto IV', 'Grand Theft Auto V', 'The Elder Scrolls V: Skyrim', 'Fallout 3', 'Fallout: New Vegas', 'Fallout 4', 'Final Fantasy VII', 'Final Fantasy X', 'Kingdom Hearts', 'The Witcher 3: Wild Hunt', 'Uncharted 2: Among Thieves', 'God of War (2018 video game)', 'Call of Duty 4: Modern Warfare', 'Call of Duty: Modern Warfare 2', 'StarCraft', 'Warcraft III: Reign of Chaos', 'World of Warcraft', 'Diablo II', 'Overwatch', 'Team Fortress 2', 'Left 4 Dead', 'Borderlands 2', 'Batman: Arkham Asylum', 'Assassin\'s Creed II', 'Deus Ex', 'Star Wars: Knights of the Old Republic', 'Undertale', 'Hades (video game)', 'Celeste (video game)', 'Disco Elysium', 'Persona 5', 'Dark Souls', 'Elden Ring', 'Cyberpunk 2077', 'Super Smash Bros. Brawl', 'Metroid Prime', 'Sonic Adventure 2', 'Crash Bandicoot', 'Spyro the Dragon', 'Super Mario 64', 'Pokémon Red and Blue', 'The Legend of Zelda: Ocarina of Time', 'The Legend of Zelda: Breath of the Wild', 'Doom (1993 video game)', 'Wolfenstein: The New Order', 'System Shock 2', 'Max Payne', 'Max Payne 3', 'Alan Wake', 'Control (video game)', 'Death Stranding', 'Detroit: Become Human', 'Heavy Rain', 'Life Is Strange', 'Silent Hill 2', 'Resident Evil 4', 'Plants vs. Zombies', 'Minecraft', 'Stardew Valley', 'Hollow Knight', 'Bastion (video game)', 'Braid (video game)', 'Monkey Island 2: LeChuck\'s Revenge', 'The Secret of Monkey Island', 'Grim Fandango', 'Half-Life'];
const key = 'famous';
if (!done[key]) {
  done[key] = [];
  for (const title of FAMOUS) {
    const wq = await api('en.wikiquote.org', { action: 'parse', page: title, prop: 'wikitext', redirects: 1 });
    const wt = wq?.parse?.wikitext; if (!wt) continue;
    const answer = wq.parse.title.replace(/\s*\(.*\)$/, '');
    const year = +((wt.replace(/\[\[File:[^\n]*/g, '').match(/\b(19[7-9]\d|20[0-2]\d)\b/) || [])[1]) || null;
    const picks = pick(lines(wt, answer), PER);
    if (picks.length && year && !taken.has(answer)) { done[key].push({ answer, year, genre: 'game', type: 'game', source: `https://en.wikiquote.org/wiki/${encodeURIComponent(wq.parse.title.replace(/ /g, '_'))}`, lines: picks }); taken.add(answer); }
    await wait(80);
  }
  fs.writeFileSync(OUT, JSON.stringify(done));
  console.log(key, FAMOUS.length, 'games', done[key].length, 'kept', done[key].reduce((n, r) => n + r.lines.length, 0), 'lines');
}
for (let year = 1980; year <= 2025; year++) {
  if (done[year]) continue;
  const c = await api('en.wikiquote.org', { action: 'query', list: 'categorymembers', cmtitle: `Category:${year} video games`, cmnamespace: 0, cmlimit: 500 });
  if (!c) { console.log(year, 'api failed, rerun to resume'); process.exit(1); }
  const games = [];
  for (const m of c.query?.categorymembers || []) {
    const answer = m.title.replace(/\s*\(.*\)$/, '');
    if (taken.has(answer)) continue;
    const wq = await api('en.wikiquote.org', { action: 'parse', page: m.title, prop: 'wikitext' });
    const wt = wq?.parse?.wikitext; if (!wt) continue;
    const wp = (wt.match(/\[\[w:([^|\]]+)/) || [])[1];
    games.push({ title: m.title, answer, wt, views: wp ? await views(wp) : 0 });
    await wait(80);
  }
  done[year] = [];
  for (const g of games.sort((a, b) => b.views - a.views).slice(0, TOP)) {
    const picks = pick(lines(g.wt, g.answer), PER);
    if (!picks.length) continue;
    done[year].push({ answer: g.answer, year, genre: 'game', type: 'game', source: `https://en.wikiquote.org/wiki/${encodeURIComponent(g.title.replace(/ /g, '_'))}`, lines: picks });
    taken.add(g.answer);
  }
  fs.writeFileSync(OUT, JSON.stringify(done));
  console.log(year, games.length, 'games', done[year].length, 'kept', done[year].reduce((n, r) => n + r.lines.length, 0), 'lines');
}
