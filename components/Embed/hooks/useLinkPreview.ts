'use client';

import { useEffect, useState } from 'react';
import type { PreviewData } from '../types';

/**
 * Module-level dedup cache for link previews. The same URL is rendered in
 * multiple places on a typical comment page (the inline `<InlineRichLink>`
 * chip, the carousel `<Embed>` card, and the tooltip's nested `<Embed>`),
 * so without this every URL would trigger N parallel fetches per mount —
 * even though the API response is identical. The browser HTTP cache
 * deduplicates *cold* requests but not the in-flight `useEffect`s
 * themselves, so this cache also collapses the React/setState churn.
 *
 * The cached promise resolves once and is shared by every subsequent
 * subscriber. Entries are kept for the page's lifetime (no eviction):
 * payloads are KB-sized, the underlying API sets a 24h Cache-Control,
 * and a full reload starts fresh — so unbounded growth isn't a concern.
 * Both successful responses and `null` ("no preview") are cached as the
 * canonical answer for that URL.
 */
const previewCache = new Map<string, Promise<PreviewData | null>>();

function fetchPreview(url: string): Promise<PreviewData | null> {
  const existing = previewCache.get(url);
  if (existing) return existing;
  const promise = fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (d && !d.error ? (d as PreviewData) : null))
    .catch(() => null);
  previewCache.set(url, promise);
  return promise;
}

export function useLinkPreview(url: string, enabled = true) {
  const [data, setData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setIsLoading(true);
    fetchPreview(url)
      .then((d) => {
        if (cancelled) return;
        if (d) setData(d);
      })
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [url, enabled]);

  return { data, isLoading };
}
