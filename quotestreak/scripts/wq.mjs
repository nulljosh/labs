// Shared Wikiquote helpers for the harvest scripts (v7 games onward; the v5 film and v6 TV
// harvests are one-shot and keep their own copies).
export const UA = { 'user-agent': 'quotestreak-harvest/1 (trommatic@icloud.com)' };
export const wait = (ms) => new Promise(r => setTimeout(r, ms));
export async function get(u) {
  for (let i = 0; i < 4; i++) {
    try { const r = await fetch(u, { headers: UA }); if (r.ok) return await r.json(); if (r.status === 404) return null; } catch {}
    await wait(1500 * (i + 1));
  }
  return null;
}
export const api = (host, p) => get(`https://${host}/w/api.php?format=json&formatversion=2&` + new URLSearchParams(p));
export const clean = (s) => s.replace(/<ref[^>]*>.*?<\/ref>/g, '').replace(/<[^>]+>/g, ' ').replace(/\{\{w\|([^}|]*)(?:\|[^}]*)?\}\}/g, '$1').replace(/\{\{[^}]*\}\}/g, '')
  .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1').replace(/'{2,}/g, '').replace(/\[[^\]]*\]/g, '').replace(/\([^)]*\)/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&hellip;/g, '…')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/^[-–—]\s*/, '').replace(/\s+/g, ' ').trim();
export async function views(title) {
  const t = encodeURIComponent(title.replace(/ /g, '_'));
  const d = await get(`https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${t}/monthly/2025010100/2025123100`);
  return (d?.items || []).reduce((n, i) => n + i.views, 0);
}
const SKIP = /^(dialogue|quotes?|taglines?|cast|see also|external links|about|characters?|plot|misc|trivia|references|opening|ending|credits|other|main|reviews?|reception|description|chapter|act|level|mission|part|others?|end|game over|intro|prologue|epilogue|narrator|various|unsorted|loading|tips?|achievements?|trophies)\b/i;
// Memorable single lines: "* line" under a character heading, or a standalone
// ":'''Name''': line" with no reply. Drops lines that name the work itself.
export function lines(wt, work) {
  const out = [], name = work.toLowerCase(), words = name.split(/\W+/).filter(w => w.length >= 4);
  const keep = (who, t) => who && who.length <= 30 && t.length >= 40 && t.length <= 130 && !/[\[\]{}|]/.test(t)
    && !t.toLowerCase().includes(name) && !words.some(w => t.toLowerCase().includes(w)) && (t.match(/[a-z]/g) || []).length >= 25;
  let heading = null;
  for (const raw of wt.split('\n')) {
    const h = raw.match(/^={2,4}\s*(.+?)\s*={2,4}\s*$/);
    if (h) { const t = clean(h[1]); heading = SKIP.test(t) || t.length > 30 || /\d/.test(t) ? null : t; continue; }
    const star = raw.match(/^\*\s+(.+)/);
    if (star) { const t = clean(star[1]).replace(/^["“]|["”]$/g, ''); if (keep(heading, t)) out.push({ quote: t, character: heading }); }
  }
  for (const b of wt.split(/\n\s*\n|<hr[^>]*>|\{\{line\}\}|\n(?==)/)) {
    const ls = b.split('\n').filter(l => /^[:*]/.test(l));
    if (ls.length !== 1) continue;
    const m = ls[0].match(/^:+\s*'''(.+?)'''\s*:?\s*(.+)$/);
    if (!m) continue;
    const who = clean(m[1]).replace(/:$/, ''), t = clean(m[2]).replace(/^:\s*/, '');
    if (keep(who, t)) out.push({ quote: t, character: who });
  }
  return out;
}
export function pick(found, per) {
  const seen = new Set(), picks = [];
  for (const l of found.sort((a, b) => Math.abs(a.quote.length - 80) - Math.abs(b.quote.length - 80)))
    if (!seen.has(l.character) && picks.length < per) { seen.add(l.character); picks.push(l); }
  return picks;
}
