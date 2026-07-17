/**
 * LinkPreview service.
 *
 * Server-only: fetches external URLs (X/Twitter, YouTube, TikTok, generic OG)
 * to build a link-preview response. Must not be imported from client components —
 * consume via the `/api/link-preview` route instead.
 *
 * Edge-runtime safe: uses only fetch, URL, AbortSignal, and regex.
 *
 * SSRF posture: this endpoint is unauthenticated and reachable by any client,
 * so the request URL is treated as untrusted. Before every outbound fetch we
 * reject any host that is an IP literal (no legitimate user pastes raw IPs
 * as link-preview targets, so we don't bother distinguishing public from
 * private) or matches a short list of named cloud-metadata / mDNS targets
 * (see `isPrivateOrInternalHost`). The generic OG fetcher also walks
 * redirects manually and re-applies the same check on each `Location`, so
 * an attacker cannot bypass it by serving a public URL that 302s to
 * `169.254.169.254`.
 *
 * This is hostname-only defense in depth: an attacker who controls a public
 * DNS record can still resolve `evil.com` to a private IP (DNS rebinding).
 * Closing that requires Node runtime + `dns.lookup` to pin the resolved IP;
 * see services/linkPreview.service.ts SSRF discussion for the tradeoff.
 */

// =============================================================================
// Public types
// =============================================================================

export interface PreviewResponse {
  url: string;
  siteName?: string;
  title?: string;
  description?: string;
  image?: string;
  authorName?: string;
}

export interface GetPreviewResult {
  data: PreviewResponse;
  /** True when no upstream provider returned data and we fell back to a host-only stub. */
  isFallback: boolean;
}

export class InvalidUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUrlError';
  }
}

// =============================================================================
// Constants
// =============================================================================

// Cap bytes read from the network. Frameworks like Next.js App Router stream
// React metadata (<title>, <meta og:*>) *after* </head> via React 19's
// streaming-metadata pattern. On heavy data-fetching pages — e.g. a populated
// ResearchHub proposal — `generateMetadata` resolves only after the awaited
// server data, pushing og:title past byte 120KB on a ~1.1MB page. 192KB gives
// us headroom for those cases while still short-circuiting multi-MB downloads.
// In practice we exit far earlier via the og:title fast-path below.
const HEAD_BYTE_CAP = 192_000;

const MAX_REDIRECT_HOPS = 5;

// `<meta property|name="X" content="Y">` and the reversed-attribute form some
// CMSes emit. Used together to populate a flat key→value map of og:* / twitter:*
// metadata. Both regexes carry the `g` flag and are intentionally stateless
// across modules — only `exec` inside `extractMeta` touches their `lastIndex`.
const META_REGEX =
  /<meta\s+(?:[^>]*?\s+)?(?:property|name)=["']([^"']+)["']\s+(?:[^>]*?\s+)?content=["']([^"']*)["']/gi;
const META_REGEX_REVERSED =
  /<meta\s+(?:[^>]*?\s+)?content=["']([^"']*)["']\s+(?:[^>]*?\s+)?(?:property|name)=["']([^"']+)["']/gi;
const TITLE_REGEX = /<title[^>]*>([^<]+)<\/title>/i;
// Detect either an og:title or twitter:title meta tag — used to stop reading
// early on traditional static pages where metadata lives in <head>.
const TITLE_META_REGEX = /<meta[^>]*(?:property|name)=["'](?:og:title|twitter:title)["']/i;

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

// Several CDN-protected sites (Wikipedia, Washington Post, Cloudflare-fronted
// pages) block the historical `facebookexternalhit/1.1` UA we used here with a
// 403, even though they happily serve `og:` meta to a real browser. A current
// desktop Chrome UA gets us through those gates without hurting the sites that
// previously *required* a social-bot UA — LinkedIn, for example, still
// returns a login-wall HTML page that contains the same `og:title` we want.
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// =============================================================================
// HTML / URL parsing helpers
// =============================================================================

function extractMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {};
  let m;
  while ((m = META_REGEX.exec(html))) meta[m[1].toLowerCase()] = m[2];
  while ((m = META_REGEX_REVERSED.exec(html))) meta[m[2].toLowerCase()] = m[1];
  return meta;
}

/**
 * Streams the response body and stops as soon as we've seen an og:title or
 * twitter:title (the fast path for static pages) or HEAD_BYTE_CAP bytes have
 * been buffered. Intentionally does NOT bail at `</head>` — frameworks like
 * Next.js App Router emit `<title>` / `<meta og:*>` *after* `</head>` via
 * React's streaming-metadata flow, so closing the head doesn't mean the meta
 * is gone. The browser's parser hoists those tags back into <head> at parse
 * time; we just need to keep reading.
 */
async function readHead(res: Response): Promise<string> {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: false });
  let buf = '';
  let bytes = 0;
  try {
    while (bytes < HEAD_BYTE_CAP) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      buf += decoder.decode(value, { stream: true });
      if (TITLE_META_REGEX.test(buf)) break;
    }
    buf += decoder.decode();
  } finally {
    // Cancel the rest of the body so the underlying connection can be released.
    reader.cancel().catch(() => {});
  }
  return buf;
}

function abs(maybeUrl: string | undefined, base: string): string | undefined {
  if (!maybeUrl) return undefined;
  try {
    return new URL(maybeUrl, base).toString();
  } catch {
    return undefined;
  }
}

/**
 * Decodes HTML entities (named like `&amp;`, decimal like `&#39;`, hex like
 * `&#x27;`) iteratively so doubly-encoded values (e.g. LinkedIn's
 * `&amp;#39;` for an apostrophe) collapse to the original character.
 *
 * Edge-runtime safe: pure regex + String.fromCodePoint, no DOMParser.
 */
function decodeHtmlEntities(input: string | undefined): string | undefined {
  if (!input) return input;
  let s = input;
  for (let i = 0; i < 4; i++) {
    if (!/&(#x?[0-9a-f]+|[a-z]+);/i.test(s)) break;
    s = s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (full, body: string) => {
      if (body.startsWith('#x') || body.startsWith('#X')) {
        const code = parseInt(body.slice(2), 16);
        return Number.isFinite(code) ? String.fromCodePoint(code) : full;
      }
      if (body.startsWith('#')) {
        const code = parseInt(body.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : full;
      }
      const named = NAMED_ENTITIES[body.toLowerCase()];
      return named ?? full;
    });
  }
  return s;
}

// =============================================================================
// SSRF guard
// =============================================================================

/**
 * Returns true if `hostname` (a WHATWG `URL.hostname` value) is something we
 * refuse to fetch as part of a link preview.
 *
 * Two cheap, conservative checks:
 *
 *   1. **No IP literals.** The WHATWG URL parser normalizes every IPv4
 *      encoding (decimal `2130706433`, octal `0177.0.0.1`, hex `0x7f000001`,
 *      short forms) into dotted-quad and wraps IPv6 in brackets *before* we
 *      see `hostname`. So `^\d+\.\d+\.\d+\.\d+$` catches all IPv4 literals
 *      and `startsWith('[')` catches all IPv6 literals — including the
 *      IPv6 transition mechanisms (6to4 / Teredo / NAT64) that fool
 *      hand-rolled range tables. Users don't paste raw IPs as link-preview
 *      targets, so the UX cost is effectively zero.
 *
 *   2. **No well-known internal names.** `.local` is mDNS (RFC 6762);
 *      `.internal` is the de-facto AWS/GCP VPC suffix; `localhost` and
 *      `metadata.google.internal` are the obvious cloud-metadata names.
 */
export function isPrivateOrInternalHost(hostname: string): boolean {
  if (!hostname) return true;
  const h = hostname.toLowerCase().replace(/\.$/, '');

  if (h.startsWith('[')) return true;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) return true;

  if (h === 'localhost' || h === 'metadata' || h === 'metadata.google.internal') return true;
  if (h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return true;

  return false;
}

/**
 * Outcome of `fetchWithRedirectGuard`. We explicitly enumerate the blocked
 * reasons so the type itself documents *why* a fetch can fail to produce a
 * response — readers don't have to grep the function body to find out.
 *
 * Note that `response` may still carry a 4xx/5xx — callers should check
 * `response.ok` themselves. The "ok" here means we successfully completed
 * the redirect walk to a final, non-3xx URL that passed every SSRF check.
 */
type GuardedFetchResult =
  | { kind: 'ok'; response: Response }
  | { kind: 'blocked'; reason: 'invalid-url' | 'blocked-host' | 'too-many-hops' };

/**
 * `fetch` wrapper that walks redirects manually, applying
 * `isPrivateOrInternalHost` to every hop's hostname before issuing the
 * request. Closes the SSRF redirect-bypass that `redirect: 'follow'`
 * leaves open (attacker-controlled public URL → 302 → internal IP).
 *
 * The caller's `init.signal` (if any) is shared across every hop, so a
 * timeout placed there bounds the *total* walk, not each hop individually.
 */
async function fetchWithRedirectGuard(
  initialUrl: string,
  init: RequestInit
): Promise<GuardedFetchResult> {
  let current = initialUrl;
  for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop++) {
    let parsed: URL;
    try {
      parsed = new URL(current);
    } catch {
      return { kind: 'blocked', reason: 'invalid-url' };
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { kind: 'blocked', reason: 'invalid-url' };
    }
    if (isPrivateOrInternalHost(parsed.hostname)) {
      return { kind: 'blocked', reason: 'blocked-host' };
    }

    const response = await fetch(current, { ...init, redirect: 'manual' });

    // 3xx with a Location header → continue walking. We drain the body so the
    // underlying connection can be released back to the runtime's pool.
    if (response.status >= 300 && response.status < 400) {
      const loc = response.headers.get('location');
      response.body?.cancel().catch(() => {});
      if (!loc) return { kind: 'ok', response };
      try {
        current = new URL(loc, current).toString();
      } catch {
        return { kind: 'blocked', reason: 'invalid-url' };
      }
      continue;
    }

    return { kind: 'ok', response };
  }
  return { kind: 'blocked', reason: 'too-many-hops' };
}

// =============================================================================
// Per-provider fetchers
// =============================================================================

async function fetchXOEmbed(url: string): Promise<PreviewResponse | null> {
  try {
    const oembed = `https://publish.twitter.com/oembed?omit_script=true&hide_thread=true&url=${encodeURIComponent(url)}`;
    const res = await fetch(oembed, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const d = await res.json();
    const textMatch = d.html?.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const title = textMatch
      ? textMatch[1].replace(/<[^>]+>/g, '').slice(0, 180)
      : d.author_name || 'Post on X';
    return {
      url,
      siteName: 'X',
      title,
      description: d.author_name ? `@${d.author_url?.split('/').pop() ?? ''}` : undefined,
      authorName: d.author_name,
    };
  } catch {
    return null;
  }
}

async function fetchYouTubeOEmbed(url: string): Promise<PreviewResponse | null> {
  try {
    const oembed = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
    const res = await fetch(oembed, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const d = await res.json();
    return {
      url,
      siteName: 'YouTube',
      title: d.title,
      description: d.author_name,
      image: d.thumbnail_url,
      authorName: d.author_name,
    };
  } catch {
    return null;
  }
}

async function fetchTikTokOEmbed(url: string): Promise<PreviewResponse | null> {
  try {
    const oembed = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembed, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const d = await res.json();
    return {
      url,
      siteName: 'TikTok',
      title: d.title || d.author_name || 'TikTok',
      description: d.author_name ? `@${d.author_unique_id ?? d.author_name}` : undefined,
      image: d.thumbnail_url,
      authorName: d.author_name,
    };
  } catch {
    return null;
  }
}

async function fetchGenericOG(url: string): Promise<PreviewResponse | null> {
  try {
    const result = await fetchWithRedirectGuard(url, {
      headers: {
        'user-agent': BROWSER_USER_AGENT,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(6000),
    });
    if (result.kind === 'blocked') return null;
    const res = result.response;
    if (!res.ok) return null;
    // Skip non-HTML responses — no point streaming binary / JSON.
    const contentType = res.headers.get('content-type') || '';
    if (contentType && !/text\/html|application\/xhtml\+xml/i.test(contentType)) return null;

    const head = await readHead(res);
    const meta = extractMeta(head);
    const titleTag = head.match(TITLE_REGEX)?.[1];
    const parsed = new URL(url);
    return {
      url,
      // Decode all human-visible fields. Site authors (notably LinkedIn) often
      // double-encode special chars in og:title — e.g. `I&amp;#39;ve` for
      // `I've` — and React would render the entities verbatim otherwise.
      siteName: decodeHtmlEntities(meta['og:site_name'] || parsed.hostname.replace(/^www\./, '')),
      title: decodeHtmlEntities(
        meta['og:title'] || meta['twitter:title'] || titleTag || parsed.hostname
      ),
      description: decodeHtmlEntities(
        meta['og:description'] || meta['twitter:description'] || meta['description']
      ),
      image: abs(meta['og:image'] || meta['twitter:image'], url),
    };
  } catch {
    return null;
  }
}

// =============================================================================
// Public service
// =============================================================================

export class LinkPreviewService {
  /**
   * Validates the URL and returns a preview for it.
   * Throws InvalidUrlError for malformed or non-http(s) URLs.
   * Always resolves to a PreviewResponse — falls back to a host-only stub when
   * no upstream provider returns usable data.
   */
  static async get(rawUrl: string): Promise<GetPreviewResult> {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      throw new InvalidUrlError('invalid url');
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new InvalidUrlError('invalid protocol');
    }
    // SSRF guard — reject the obvious internal targets up front so even the
    // oEmbed providers (which receive `url` as a query param) never see them.
    // The generic OG path applies the same check again on every redirect hop.
    if (isPrivateOrInternalHost(parsed.hostname)) {
      throw new InvalidUrlError('blocked host');
    }

    const host = parsed.hostname.replace(/^www\./, '');
    const url = parsed.toString();
    let data: PreviewResponse | null = null;

    if (host === 'x.com' || host === 'twitter.com' || host === 'mobile.twitter.com') {
      data = await fetchXOEmbed(url);
    } else if (host.endsWith('tiktok.com')) {
      data = await fetchTikTokOEmbed(url);
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
      data = await fetchYouTubeOEmbed(url);
    } else {
      data = await fetchGenericOG(url);
    }

    if (!data) {
      return {
        data: { url, siteName: host, title: host },
        isFallback: true,
      };
    }

    return { data, isFallback: false };
  }
}
