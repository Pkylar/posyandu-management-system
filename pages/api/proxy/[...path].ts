import type { NextApiRequest, NextApiResponse } from 'next';

//const BACKEND_BASE = 'http://157.66.34.203/agriapp/api/web/v1';
const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://157.66.34.2031/agriapp/api/web/v1';

function buildTargetUrl(pathSegments: string[] | string, query: any) {
  const path = Array.isArray(pathSegments) ? pathSegments.join('/') : String(pathSegments || '');
  const url = new URL(`${BACKEND_BASE}/${path}`);
  // append query params except the catch-all `path`
  for (const key of Object.keys(query || {})) {
    if (key === 'path') continue;
    const val = query[key];
    if (Array.isArray(val)) {
      val.forEach((v) => url.searchParams.append(key, String(v)));
    } else if (val != null) {
      url.searchParams.append(key, String(val));
    }
  }
  return url.toString();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   console.log("🔥 PROXY HIT:", req.method, req.url);
  try {
    const path = req.query.path || [];
    const target = buildTargetUrl(path as string[] | string, req.query);

    // Prepare headers to forward (omit host and origin)
    const forwardHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      const key = k.toLowerCase();
      if (!v) continue;
      if (key === 'host' || key === 'origin' || key === 'referer' || key === 'connection') continue;
      // Next.js types allow string | string[] | undefined
      forwardHeaders[key] = Array.isArray(v) ? v.join(',') : String(v);
    }

    // Prepare body for non-GET methods
    let body: any = undefined;
    if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
      const contentType = (req.headers['content-type'] || '').toString();
      if (contentType.includes('application/json')) {
        body = JSON.stringify(req.body ?? {});
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        if (typeof req.body === 'string') body = req.body;
        else body = new URLSearchParams(req.body as Record<string, any>).toString();
      } else {
        // fallback: try JSON
        try { body = JSON.stringify(req.body ?? {}); } catch { body = undefined; }
      }
    }

    const resp = await fetch(target, {
      method: req.method,
      headers: forwardHeaders,
      body,
    });

    // copy status and selected headers
    res.status(resp.status);
    const contentType = resp.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);

    const buffer = Buffer.from(await resp.arrayBuffer());
    res.send(buffer);
  } catch (err: any) {
    console.error('proxy error', err);
    res.status(500).json({ ok: false, message: err?.message || 'Proxy error' });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
