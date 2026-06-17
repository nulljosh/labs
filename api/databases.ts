export const config = { runtime: 'edge' };

const CANLII_BASE = 'https://api.canlii.org/v1';

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') === 'legislation' ? 'legislationBrowse' : 'caseBrowse';
  const apiKey = process.env.CANLII_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'CANLII_API_KEY not configured' }), { status: 500 });
  }

  const upstream = `${CANLII_BASE}/${type}/en/?api_key=${apiKey}`;
  const res = await fetch(upstream);
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { 'content-type': 'application/json' },
  });
}
