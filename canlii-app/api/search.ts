export const config = { runtime: 'edge' };

const CANLII_BASE = 'https://api.canlii.org/v1';

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const databaseId = url.searchParams.get('databaseId');
  const type = url.searchParams.get('type') === 'legislation' ? 'legislationBrowse' : 'caseBrowse';
  const apiKey = process.env.CANLII_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'CANLII_API_KEY not configured' }), { status: 500 });
  }
  if (!databaseId) {
    return new Response(JSON.stringify({ error: 'databaseId is required' }), { status: 400 });
  }

  const offset = url.searchParams.get('offset') ?? '0';
  const resultCount = url.searchParams.get('resultCount') ?? '25';
  const q = url.searchParams.get('q');

  const params = new URLSearchParams({ api_key: apiKey, offset, resultCount });
  if (q) params.set('searchTerm', q);

  const upstream = `${CANLII_BASE}/${type}/en/${databaseId}/?${params.toString()}`;
  const res = await fetch(upstream);
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { 'content-type': 'application/json' },
  });
}
