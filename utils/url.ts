import type { ContentType } from '@/types/work';

export const ALL_CONTENT_TYPES: readonly ContentType[] = [
  'paper',
  'post',
  'preregistration',
  'question',
  'discussion',
  'funding_request',
];

// URL path segment (first path segment) → ContentType. Aligns with app routes: /paper/, /post/, /question/, /proposal/, /fund/, /grant/
const ROUTE_SEGMENT_TO_CONTENT_TYPE: Record<string, ContentType> = {
  paper: 'paper',
  post: 'post',
  question: 'question',
  proposal: 'preregistration',
  fund: 'preregistration',
  grant: 'funding_request',
};

const SUPPORTED_ROUTE_SEGMENTS = Object.keys(ROUTE_SEGMENT_TO_CONTENT_TYPE).join(', ');

/**
 * Matches an HTTP/HTTPS URL anywhere in a string. Stops at whitespace and a
 * few characters that commonly bracket URLs in prose. The match may include
 * trailing punctuation — strip it with `trimUrlTrailingPunctuation` if you
 * need a clean URL.
 *
 * Safe to share across modules for `String.prototype.match` and
 * `String.prototype.replace`; do not use with `regex.exec` / `matchAll`
 * without recreating the regex (the `g` flag is stateful in those APIs).
 */
export const URL_REGEX = /https?:\/\/[^\s<>"'`)]+/gi;

/**
 * Strips trailing sentence/parenthesis punctuation that `URL_REGEX` greedily
 * picks up when a URL appears inline in prose (e.g. "see https://x.com." →
 * "https://x.com").
 */
export const trimUrlTrailingPunctuation = (url: string): string => url.replace(/[.,;:!?)\]]+$/, '');

/**
 * Removes all HTTP/HTTPS URLs from a text blob. Whitespace left behind is not
 * collapsed; the caller can normalize as needed.
 */
export const stripUrls = (text: string): string => text.replace(URL_REGEX, '');

/**
 * URL classification primitives. Pure functions / data — no React, no DOM.
 *
 * `classifyUrl` looks at a URL and tags it with one of a small set of "kinds"
 * so callers can decide how to render or handle it (e.g. embed it as a
 * playable card, render an inline rich link, etc.). The result is intentionally
 * lightweight (kind + url + a few optional ids) so it can flow through the
 * codebase as plain JSON.
 */
export type UrlKind = 'youtube' | 'tiktok' | 'x' | 'linkedin' | 'webpage';

/**
 * LinkedIn post IDs live in one of three URN namespaces depending on what
 * kind of object the post is (a native post, a re-share, or a generic UGC
 * object). The numeric ID alone is *not* enough to embed — `urn:li:activity:`
 * vs `urn:li:share:` vs `urn:li:ugcPost:` resolve to different posts (or
 * 404). LinkedIn share URLs encode the right namespace as a keyword
 * immediately before the ID: `…-<type>-<id>-<XYZA>`.
 */
export type LinkedInUrnType = 'activity' | 'share' | 'ugcPost';

export interface DetectedUrl {
  kind: UrlKind;
  url: string;
  videoId?: string;
  linkedinUrn?: string;
  linkedinUrnType?: LinkedInUrnType;
  tweetId?: string;
}

export function classifyUrl(url: string): DetectedUrl | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  // Restrict to web URLs so things like `mailto:`, `tel:`, `ftp:` don't end
  // up classified as embeddable webpages. The carousel + chip + paste-handler
  // all key off this, so excluding them here is enough to keep emails out of
  // the EmbedCarousel that renders below comments.
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  const host = u.hostname.replace(/^www\./, '');

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const v = u.searchParams.get('v');
    if (v) return { kind: 'youtube', url, videoId: v };
    const shorts = u.pathname.match(/^\/shorts\/([\w-]+)/);
    if (shorts) return { kind: 'youtube', url, videoId: shorts[1] };
  }
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1);
    if (id) return { kind: 'youtube', url, videoId: id };
  }
  if (host.endsWith('tiktok.com')) {
    const m = u.pathname.match(/\/video\/(\d+)/);
    if (m) return { kind: 'tiktok', url, videoId: m[1] };
    return { kind: 'tiktok', url };
  }
  if (host === 'x.com' || host === 'twitter.com' || host === 'mobile.twitter.com') {
    const m = u.pathname.match(/\/status\/(\d+)/);
    return { kind: 'x', url, tweetId: m ? m[1] : undefined };
  }
  if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) {
    // LinkedIn carries the URN type in two places:
    //   1. Explicit URN form `urn:li:<type>:<id>` (used in /feed/update/ paths).
    //   2. Share-URL slug `…/posts/<slug>-<type>-<id>-<XYZA>?…` where <type>
    //      is one of activity/share/ugcPost. Older /posts/ URLs omit the
    //      keyword and just have `…-<id>-<XYZA>`; we fall back to `activity`
    //      for those (the historical default).
    // Picking the wrong URN type is what produces a 404 in the embed
    // iframe — `urn:li:activity:<share-id>` doesn't resolve.
    const explicit = url.match(/urn:li:(activity|share|ugcPost):(\d{15,25})/i);
    const slug = url.match(/-(?:(activity|share|ugcPost)-)?(\d{15,25})-[A-Za-z0-9]+(?=\?|\/|#|$)/i);
    const id = explicit?.[2] || slug?.[2];
    const rawType = explicit?.[1] || slug?.[1];
    const linkedinUrnType: LinkedInUrnType = (() => {
      if (!rawType) return 'activity';
      const lower = rawType.toLowerCase();
      if (lower === 'ugcpost') return 'ugcPost';
      if (lower === 'share') return 'share';
      return 'activity';
    })();
    return {
      kind: 'linkedin',
      url,
      linkedinUrn: id,
      linkedinUrnType: id ? linkedinUrnType : undefined,
    };
  }
  return { kind: 'webpage', url };
}

/**
 * Scans `text` for the first URL and returns it as a `DetectedUrl`, trimming
 * trailing prose punctuation. Returns `null` if no classifiable URL is found.
 */
export function extractFirstUrl(text: string): DetectedUrl | null {
  if (!text) return null;
  const matches = text.match(URL_REGEX);
  if (!matches) return null;
  for (const raw of matches) {
    const url = trimUrlTrailingPunctuation(raw);
    const detected = classifyUrl(url);
    if (detected) return detected;
  }
  return null;
}

/** Hostname without leading www. for same-site checks. */
function hostnameWithoutWww(hostname: string): string {
  const h = hostname.toLowerCase();
  return h.startsWith('www.') ? h.slice(4) : h;
}

/**
 * Adds https:// when the string has no scheme so URL() accepts pastes like
 * `www.researchhub.com/paper/123` or `researchhub.com/paper/123`.
 */
function normalizeUrlInputForParsing(input: string): string {
  const t = input.trim();
  if (!t) return t;
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(t)) {
    return t;
  }
  return `https://${t}`;
}

function urlMatchesConfiguredSite(userUrl: URL, siteUrlString: string): boolean {
  let siteParsed: URL;
  try {
    siteParsed = new URL(siteUrlString);
  } catch {
    return userUrl.origin === siteUrlString;
  }
  if (userUrl.protocol !== siteParsed.protocol) return false;
  if (userUrl.port !== siteParsed.port) return false;
  return hostnameWithoutWww(userUrl.hostname) === hostnameWithoutWww(siteParsed.hostname);
}

export type ParsedResearchHubUrl = {
  contentType: ContentType;
  documentId: string;
};

export function validateResearchHubUrl(
  url: string
): { success: true; parsed: ParsedResearchHubUrl } | { success: false; error: string } {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return { success: false, error: 'URL is required' };
  }

  const toParse = normalizeUrlInputForParsing(trimmedUrl);

  let parsed: URL;
  try {
    parsed = new URL(toParse);
  } catch {
    return {
      success: false,
      error: 'Invalid URL format, e.g., https://researchhub.com/paper/123/...',
    };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  if (siteUrl) {
    if (!urlMatchesConfiguredSite(parsed, siteUrl)) {
      let siteOrigin: string;
      try {
        siteOrigin = new URL(siteUrl).origin;
      } catch {
        siteOrigin = siteUrl;
      }
      return {
        success: false,
        error: `URL must be from ${siteOrigin}. Received a URL from ${parsed.origin}`,
      };
    }
  }

  const segments = parsed.pathname.split('/').filter(Boolean);
  if (segments.length < 2) {
    return {
      success: false,
      error: 'URL must include a content type and ID (e.g., /paper/123/...)',
    };
  }

  const segmentRaw = segments[0].toLowerCase();
  const documentId = segments[1];

  const contentType = ROUTE_SEGMENT_TO_CONTENT_TYPE[segmentRaw];
  if (!contentType) {
    return {
      success: false,
      error: `Unsupported content type "${segmentRaw}". Supported route segments: ${SUPPORTED_ROUTE_SEGMENTS}`,
    };
  }

  if (!/^\d+$/.test(documentId)) {
    return {
      success: false,
      error: `Invalid document ID "${documentId}". Expected a numeric ID`,
    };
  }

  return { success: true, parsed: { contentType, documentId } };
}

/**
 * Converts a string to a URL-friendly slug
 * Example: "Hello World!" -> "hello-world"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens
}

/**
 * Builds a work URL from an ID and optional slug
 */
export const buildWorkUrl = ({
  id,
  contentType,
  doi,
  slug,
  tab,
}: {
  id?: string | number | null;
  contentType: ContentType;
  doi?: string | null;
  slug?: string;
  tab?: 'reviews' | 'bounties' | 'conversation';
}) => {
  let baseUrl = '';

  switch (contentType) {
    case 'post':
    case 'discussion':
      if (!id) return '#'; // Return a safe fallback for posts or discussions without ID
      baseUrl = slug ? `/post/${id}/${slug}` : `/post/${id}`;
      break;
    case 'funding_request':
      if (!id) return '#';
      baseUrl = slug ? `/grant/${id}/${slug}` : `/grant/${id}`;
      break;
    case 'preregistration':
      if (!id) return '#';
      baseUrl = slug ? `/proposal/${id}/${slug}` : `/proposal/${id}`;
      break;
    case 'question':
      if (!id) return '#'; // Return a safe fallback for questions without ID
      baseUrl = slug ? `/question/${id}/${slug}` : `/question/${id}`;
      break;
    case 'paper':
      if (id) {
        baseUrl = slug ? `/paper/${id}/${slug}` : `/paper/${id}`;
      } else if (doi) {
        baseUrl = `/paper?doi=${encodeURIComponent(doi)}`;
      } else {
        return '#'; // Return a safe fallback URL when neither id nor doi is available
      }
      break;
    default:
      // Fallback for unknown content types
      if (id) {
        baseUrl = slug ? `/paper/${id}/${slug}` : `/paper/${id}`;
      } else if (doi) {
        baseUrl = `/paper?doi=${encodeURIComponent(doi)}`;
      } else {
        return '#'; // Return a safe fallback URL when neither id nor doi is available
      }
      break;
  }

  // Append tab if provided
  if (tab) {
    baseUrl += `/${tab}`;
  }

  return baseUrl;
};

/**
 * Builds an author URL from an ID and optional name
 */
export const buildAuthorUrl = (id: string | number) => {
  return `/author/${id}`;
};

/**
 * Builds a topic URL from a slug
 */
export const buildTopicUrl = (slug: string) => {
  return `/topic/${slug}`;
};
