// Invite links (v83): /c?c=<qids>&s=<score>&n=<name> is a challenge's own landing page. It is rendered
// here, not in the browser, so the link preview in Messages, Discord or WhatsApp says who scored what
// and shows the first line as a teaser. Play goes to /play with the same query, which challenge.js
// already understands. The same decoding as the game: Challenge.decode with Difficulty.qid.
import quotes from '../quotes.json' with { type: 'json' };
import Challenge from '../challenge.js';
import Difficulty from '../difficulty.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function page(search) {
  const ch = Challenge.decode(search, quotes, Difficulty.qid);
  const play = `/play${search}`;
  const title = ch ? `${ch.name} scored ${ch.score} on Coda. Your turn.` : 'Coda';
  const line = ch ? ch.quotes[0].quote : 'Here’s the line. Name the movie, show, game, song or book.';
  const desc = ch ? `${ch.quotes.length} lines, one go. Can you beat ${ch.score}? It starts with: “${line}”` : line;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="https://coda.jaybulb.com/og.png"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/icon.svg" type="image/svg+xml"><link rel="stylesheet" href="/brand/tokens.css">
<style>
:root{--ink:#15161a;--bg:#fff;--muted:#6e6e73}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ink:#f5f5f7;--bg:#0f1013;--muted:#a1a1a6}}
:root[data-theme="dark"]{--ink:#f5f5f7;--bg:#0f1013;--muted:#a1a1a6}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--ink);font-family:"Quip Sans",-apple-system,system-ui,sans-serif;padding:24px 16px;box-sizing:border-box}
main{max-width:480px;text-align:center}
img{display:block;margin:0 auto 16px}
h1{font-size:1.6rem;margin:0 0 16px}
blockquote{font-size:1.3rem;font-weight:600;margin:0 0 8px}
p{color:var(--muted);margin:0 0 24px}
a.play{display:inline-block;background:#ffcc00;color:#15161a;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:999px;min-height:48px;box-sizing:border-box}
</style></head><body><main>
<picture><source srcset="/brand/quip-cheer-dark.svg" media="(prefers-color-scheme: dark)"><img src="/brand/quip-cheer.svg" alt="" width="120" height="120"></picture>
<h1>${esc(title)}</h1>
${ch ? `<blockquote translate="no">“${esc(line)}”</blockquote><p>${esc(`${ch.quotes.length} lines, one go. Can you beat ${ch.score}?`)}</p>` : `<p>${esc(line)}</p>`}
<a class="play" href="${esc(play)}">${ch ? 'Take the challenge' : 'Play'}</a>
</main><script src="/i18n.js"></script></body></html>`;
}

export async function onRequestGet({ request }) {
  return new Response(page(new URL(request.url).search), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}
