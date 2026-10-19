// Embed (v85): today's Daily Quote as a small card any site can put in an iframe:
//   <iframe src="https://coda.jaybulb.com/embed" width="360" height="420" style="border:0"></iframe>
// Rendered here from the game's own daily walk, so it matches /play and /api/daily. A pick shows right
// or wrong in place; the link opens the full game. ?theme=dark or light overrides the system scheme.
import quotes from '../quotes.json' with { type: 'json' };
import Daily from '../daily.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function card(theme) {
  const day = Daily.dayNumber(), q = Daily.quoteFor(day, quotes);
  const t = theme === 'dark' || theme === 'light' ? ` data-theme="${theme}"` : '';
  return `<!doctype html><html lang="en"${t}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Coda Daily Quote</title><link rel="stylesheet" href="/brand/tokens.css">
<style>
:root{--ink:#15161a;--bg:#fff;--card:#f5f5f7;--muted:#6e6e73;--good:#248a3d;--bad:#d70015}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ink:#f5f5f7;--bg:#0f1013;--card:#1c1d22;--muted:#a1a1a6;--good:#34c759;--bad:#ff453a}}
:root[data-theme="dark"]{--ink:#f5f5f7;--bg:#0f1013;--card:#1c1d22;--muted:#a1a1a6;--good:#34c759;--bad:#ff453a}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Quip Sans",-apple-system,system-ui,sans-serif;padding:16px;box-sizing:border-box}
header{display:flex;align-items:center;gap:8px;font-weight:700;font-size:.9rem}header img{width:24px;height:24px;border-radius:6px}
blockquote{font-size:1.15rem;font-weight:600;margin:14px 0}
button{display:block;width:100%;text-align:left;font:inherit;font-weight:600;padding:12px 14px;margin:0 0 8px;border:0;border-radius:12px;background:var(--card);color:var(--ink);cursor:pointer;min-height:44px}
button.right{background:var(--good);color:#fff}button.wrong{background:var(--bad);color:#fff}
p{color:var(--muted);font-size:.9rem;margin:8px 0}a{color:var(--ink)}
</style></head><body>
<header><img src="/icon.svg" alt="">Coda · Daily Quote #${day}</header>
<blockquote translate="no">“${esc(q.quote)}”</blockquote>
<div id="o">${q.options.map((o) => `<button>${esc(o)}</button>`).join('')}</div>
<p id="r" aria-live="polite"></p>
<p><a href="/play?daily" target="_blank" rel="noopener">Play more on Coda</a></p>
<script>
const answer = ${JSON.stringify(q.answer).replace(/</g, '\\u003c')};
document.getElementById('o').onclick = (e) => {
  const b = e.target.closest('button'); if (!b || document.querySelector('button.right')) return;
  for (const x of document.querySelectorAll('#o button')) if (x.textContent === answer) x.className = 'right';
  if (b.textContent !== answer) b.className = 'wrong';
  document.getElementById('r').textContent = b.textContent === answer ? 'Right.' : 'Not quite. It was ' + answer + '.';
};
</script><script src="/i18n.js"></script></body></html>`;
}

export async function onRequestGet({ request }) {
  return new Response(card(new URL(request.url).searchParams.get('theme')), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': `public, max-age=${Math.min(3600, Math.ceil(Daily.msUntilNext() / 1000))}`,
      'content-security-policy': 'frame-ancestors *' },
  });
}
