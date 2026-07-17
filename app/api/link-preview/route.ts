import { NextRequest, NextResponse } from 'next/server';
import { LinkPreviewService, InvalidUrlError } from '@/services/linkPreview.service';

export const runtime = 'edge';

// 24h CDN cache for full previews. 1h for host-only fallbacks (so a failing
// upstream gets a retry chance sooner) and for invalid-URL errors (so a
// caller spamming `?url=garbage` hits the CDN instead of re-invoking the
// function on every request).
const SUCCESS_CACHE = 'public, max-age=86400, s-maxage=86400';
const FALLBACK_CACHE = 'public, max-age=3600';
const ERROR_CACHE = 'public, max-age=3600, s-maxage=3600';

export async function GET(request: NextRequest) {
  // Same-site gate via Fetch Metadata (preferred over an Origin/Referer
  // check because Chrome doesn't send `Origin` on same-origin GETs, so the
  // naive header check would block all our own traffic). All modern
  // browsers — Chrome 76+, Firefox 90+, Safari 16+, Edge 79+ — set
  // `sec-fetch-site` on every fetch, and JS can't override it (it's a
  // forbidden header name). We accept `same-origin` (our own pages) and
  // `same-site` (any researchhub.com subdomain); cross-site / missing
  // header / `none` (direct nav) are rejected. Not a security control on
  // its own — a determined attacker can spoof it from a non-browser
  // client — just a cheap filter for the long tail of low-effort abuse.
  // Intentionally not cached: the response depends on the request header,
  // not the URL, so a cached 403 would poison the entry for legit callers.
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite !== 'same-origin' && fetchSite !== 'same-site') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) {
    return NextResponse.json(
      { error: 'url required' },
      { status: 400, headers: { 'cache-control': ERROR_CACHE } }
    );
  }

  let result;
  try {
    result = await LinkPreviewService.get(url);
  } catch (err) {
    if (err instanceof InvalidUrlError) {
      return NextResponse.json(
        { error: err.message },
        { status: 400, headers: { 'cache-control': ERROR_CACHE } }
      );
    }
    throw err;
  }

  return NextResponse.json(result.data, {
    headers: { 'cache-control': result.isFallback ? FALLBACK_CACHE : SUCCESS_CACHE },
  });
}
