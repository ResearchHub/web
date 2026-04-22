/**
 * LinkPreview service.
 *
 * Server-only: fetches external URLs (X/Twitter, YouTube, TikTok, generic OG)
 * to build a link-preview response. Must not be imported from client components —
 * consume via the `/api/link-preview` route instead.
 *
 * Edge-runtime safe: uses only fetch, URL, AbortSignal, and regex.
 */

export interface PreviewResponse {
  url: string;
  siteName?: string;
  title?: string;
  description?: string;
  image?: string;
  html?: string;
  authorName?: string;
  authorImage?: string;
}

export class InvalidUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUrlError';
  }
}

const META_REGEX =
  /<meta\s+(?:[^>]*?\s+)?(?:property|name)=["']([^"']+)["']\s+(?:[^>]*?\s+)?content=["']([^"']*)["']/gi;
const META_REGEX_REVERSED =
  /<meta\s+(?:[^>]*?\s+)?content=["']([^"']*)["']\s+(?:[^>]*?\s+)?(?:property|name)=["']([^"']+)["']/gi;
const TITLE_REGEX = /<title[^>]*>([^<]+)<\/title>/i;

// We only need <head>. Cap bytes read from the network; typical heads are < 10KB.
const HEAD_BYTE_CAP = 32_000;

function extractMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {};
  let m;
  while ((m = META_REGEX.exec(html))) meta[m[1].toLowerCase()] = m[2];
  while ((m = META_REGEX_REVERSED.exec(html))) meta[m[2].toLowerCase()] = m[1];
  return meta;
}

/**
 * Streams the response body and stops as soon as `</head>` is seen or
 * HEAD_BYTE_CAP bytes have been buffered. Avoids downloading the full page.
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
      const headEnd = buf.search(/<\/head\s*>/i);
      if (headEnd !== -1) {
        buf = buf.slice(0, headEnd);
        break;
      }
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
      html: d.html,
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
    const res = await fetch(url, {
      headers: {
        'user-agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(6000),
    });
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
      siteName: meta['og:site_name'] || parsed.hostname.replace(/^www\./, ''),
      title: meta['og:title'] || meta['twitter:title'] || titleTag || parsed.hostname,
      description: meta['og:description'] || meta['twitter:description'] || meta['description'],
      image: abs(meta['og:image'] || meta['twitter:image'], url),
    };
  } catch {
    return null;
  }
}

export interface GetPreviewResult {
  data: PreviewResponse;
  /** True when no upstream provider returned data and we fell back to a host-only stub. */
  isFallback: boolean;
}

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
