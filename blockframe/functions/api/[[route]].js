// REST surface. Thin: every route is argument-shuffling around callTool() in
// src/lib/tools.js, which functions/mcp.js also calls. No grid logic lives here.

import { callTool, ToolError, TOOL_NAMES } from '../../src/lib/tools.js';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json', ...CORS },
  });

const ENDPOINTS = {
  'GET /api/components': 'The component palette. Optional ?category=',
  'POST /api/place': '{ text?, componentId, col, row, cols?, rows? } -> { text }',
  'POST /api/render': '{ text, cols?, rows? } -> { text }',
  'POST /mcp': 'Model Context Protocol, JSON-RPC. Same three tools.',
};

const run = (name, args) => {
  try {
    return json(callTool(name, args));
  } catch (err) {
    // Bad input is the caller's to fix, so say what was wrong rather than 500ing.
    if (err instanceof ToolError) return json({ error: err.message, tool: name }, 400);
    throw err;
  }
};

export async function onRequest({ request }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');

  if (request.method === 'GET' && path === '/api/components') {
    const category = url.searchParams.get('category') ?? undefined;
    return run('list_components', { category });
  }

  if (request.method === 'POST' && (path === '/api/place' || path === '/api/render')) {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Body must be JSON.' }, 400);
    }
    return run(path === '/api/place' ? 'place_component' : 'render_wireframe', body);
  }

  if (path === '/api' || path === '/api/') return json({ endpoints: ENDPOINTS, tools: TOOL_NAMES });

  return json({ error: `Unknown endpoint: ${request.method} ${path}`, endpoints: ENDPOINTS }, 404);
}
