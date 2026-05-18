import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 15;

const STRIP_HEADERS = new Set([
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
]);

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url') ?? '';

  let target: URL;
  try {
    target = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }
  if (!['http:', 'https:'].includes(target.protocol)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    });

    const contentType = upstream.headers.get('content-type') ?? 'text/html';

    // For non-HTML resources just pass them through
    if (!contentType.includes('html')) {
      const body = await upstream.arrayBuffer();
      return new NextResponse(body, {
        status: upstream.status,
        headers: { 'Content-Type': contentType },
      });
    }

    let html = await upstream.text();

    // Inject <base> so relative paths in CSS/JS/images resolve against the
    // original origin without going through this proxy
    const base = `<base href="${target.origin}/">`;
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/(<head[^>]*>)/i, `$1${base}`);
    } else {
      html = base + html;
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        // Deliberately omit X-Frame-Options and CSP so the iframe loads
      },
    });
  } catch (err) {
    console.error('Proxy error:', err);
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}
