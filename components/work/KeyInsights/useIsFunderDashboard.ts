'use client';

import { usePathname } from 'next/navigation';

/**
 * True when the current route is the funder dashboard. Used by feed items to
 * adapt their UI (e.g. show key-insights column, hide the Apply CTA) without
 * having to prop-drill from the page through FeedContent/FeedEntryItem.
 */
export function useIsFunderDashboard(): boolean {
  const pathname = usePathname();
  return pathname?.startsWith('/fund/dashboard') ?? false;
}
