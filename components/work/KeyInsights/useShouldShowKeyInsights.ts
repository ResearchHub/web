'use client';

import { usePathname } from 'next/navigation';

/**
 * Funder-facing key-insights are only shown on the funder dashboard.
 * Reads URL state instead of prop-drilling through FeedContent/FeedEntryItem.
 */
export function useShouldShowKeyInsights(): boolean {
  const pathname = usePathname();
  return pathname?.startsWith('/fund/dashboard') ?? false;
}
