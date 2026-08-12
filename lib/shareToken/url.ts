import { SHARE_TOKEN_PARAM } from './constants';

/** Removes the share token from a URL before it leaves the page. */
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

export function withShareToken(url: string, shareToken?: string | null): string {
  if (!shareToken) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${SHARE_TOKEN_PARAM}=${encodeURIComponent(shareToken)}`;
}
