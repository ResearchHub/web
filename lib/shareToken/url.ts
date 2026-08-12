import { SHARE_TOKEN_PARAM } from './constants';

/**
 * Removes the share token from a URL.
 *
 * Anything that leaves the page — social shares, analytics payloads — must go
 * through this, or a private proposal's token travels with it.
 *
 * @param url - An absolute URL, or one relative to the current origin.
 * @returns The URL without its `st` parameter, in the same shape it came in.
 */
export function stripShareToken(url: string): string {
  try {
    const parsed = new URL(url, globalThis.location?.origin);
    if (!parsed.searchParams.has(SHARE_TOKEN_PARAM)) {
      return url;
    }
    parsed.searchParams.delete(SHARE_TOKEN_PARAM);
    return url.startsWith('http') ? parsed.toString() : `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

/**
 * Appends a share token to a path, so a link keeps working for a visitor whose
 * only credential is the token.
 */
export function withShareToken(url: string, shareToken?: string | null): string {
  if (!shareToken) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${SHARE_TOKEN_PARAM}=${encodeURIComponent(shareToken)}`;
}
