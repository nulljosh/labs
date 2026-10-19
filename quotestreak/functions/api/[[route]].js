// REST surface. Thin: every route shuffles arguments into callTool() in src/lib/tools.js,
// which functions/mcp.js also calls. No quote logic lives here.

import { callTool, ToolError, TOOL_NAMES } from '../../src/lib/tools.js';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type',
  'access-control-allow-methods': 'GET, OPTIONS',
};

const json = (body, status = 200, cache = 'public, max-age=3600') =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': cache, ...CORS },
  });

const ENDPOINTS = {
  'GET /api/genres': 'Genres and media types, with counts.',
  'GET /api/random?genre=&type=': 'One random quote with its options and answer.',
  'GET /api/search?q=&limit=&genre=&type=': 'Quotes matching a query.',
  'GET /api/daily?reveal=': "Today's Daily Quote; the answer only with reveal=true.",
  'GET /api/quotes?offset=&limit=&genre=&type=': 'The whole bank, a page at a time.',
  'POST /mcp': 'Model Context Protocol, JSON-RPC. The same tools.',
};

export async function onRequest({ request }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (request.method !== 'GET') return json({ error: 'This API is read-only; use GET.' }, 405);

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');
  const p = url.searchParams;
  const args = { genre: p.get('genre'), type: p.get('type'), q: p.get('q'), limit: p.get('limit'), offset: p.get('offset'), reveal: p.get('reveal') };

  const routes = { '/api/genres': 'list_genres', '/api/random': 'random_quote', '/api/search': 'search_quotes', '/api/daily': 'daily_quote', '/api/quotes': 'list_quotes' };
  const tool = routes[path];
  if (!tool) {
    if (path === '/api') return json({ endpoints: ENDPOINTS, tools: TOOL_NAMES });
    return json({ error: `Unknown endpoint: GET ${url.pathname}`, endpoints: ENDPOINTS }, 404);
  }

  try {
    // A random pick must not be cached, or every caller in an hour gets the same quote.
    // The daily changes at midnight UTC, so it is cached only until then.
    const out = callTool(tool, args);
    return json(out, 200, tool === 'random_quote' ? 'no-store' : tool === 'daily_quote' ? `public, max-age=${Math.min(3600, out.next_in_seconds)}` : undefined);
  } catch (err) {
    if (err instanceof ToolError) return json({ error: err.message, tool }, 400);
    throw err;
  }
}
