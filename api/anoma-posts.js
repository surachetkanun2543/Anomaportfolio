// File: /api/anoma-posts.js
// Runtime: Edge (fast, low-cold-start). Returns an array of tweet IDs/objects
// that match: from:book_surachet anoma -is:retweet
// Also merges with optional static manifest at `/data/anoma-manual.json` for older posts.
// Env: X_BEARER_TOKEN (Twitter/X API v2 Bearer Token)

export const config = { runtime: 'edge' };

const HANDLE = 'book_surachet';
const QUERY = `from:${HANDLE} anoma -is:retweet`;
const MAX_ITEMS = 120; // keep up to this many
const TTL = 5 * 60; // 5 minutes cache in memory

export default async function handler(req) {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) return json({ error: 'Missing X_BEARER_TOKEN' }, 500);

  const cacheKey = `anoma:${HANDLE}`;
  const now = Date.now();

  try {
    // Ephemeral in-memory cache per edge region
    const g = (globalThis.__ANOMA_CACHE__ ||= new Map());
    const cached = g.get(cacheKey);
    if (cached && (now - cached.t) < TTL * 1000) {
      return json(cached.data, 200, { 'Cache-Control': `s-maxage=${TTL}, stale-while-revalidate=${TTL}` });
    }

    // 1) Fetch recent search from X API
    let items = [];
    let nextToken;
    do {
      const url = new URL('https://api.twitter.com/2/tweets/search/recent');
      url.searchParams.set('query', QUERY);
      url.searchParams.set('max_results', '100');
      url.searchParams.set('tweet.fields', 'created_at');
      if (nextToken) url.searchParams.set('next_token', nextToken);

      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) {
        const text = await r.text();
        // Don't fail hard — continue to manual manifest fallback
        console.warn('X API error', r.status, text);
        break;
      }
      const data = await r.json();
      const page = (data.data || []).map(tw => ({ id: tw.id, date: tw.created_at?.slice(0,10) }));
      for (const it of page) if (!items.find(x => x.id === it.id)) items.push(it);
      nextToken = data.meta?.next_token;
      if (items.length >= MAX_ITEMS) break;
    } while (nextToken);

    // 2) Merge with manual manifest served statically from /data/anoma-manual.json (optional)
    try {
      const origin = new URL(req.url).origin;
      const m = await fetch(origin + '/data/anoma-manual.json', { cache: 'no-store' });
      if (m.ok) {
        const extra = await m.json();
        for (const it of Array.isArray(extra) ? extra : []) {
          const id = typeof it === 'string' ? it : it?.id;
          const date = typeof it === 'object' ? it?.date : undefined;
          if (!id) continue;
          if (!items.find(x => x.id === id)) items.push({ id, date });
        }
      }
    } catch {}

    // Sort + trim
    items.sort((a,b) => (b.date||'').localeCompare(a.date||''));
    items = items.slice(0, MAX_ITEMS);

    g.set(cacheKey, { t: now, data: items });
    return json(items, 200, { 'Cache-Control': `s-maxage=${TTL}, stale-while-revalidate=${TTL}` });
  } catch (e) {
    return json({ error: 'Server error', detail: String(e) }, 500);
  }
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extra }
  });
}
