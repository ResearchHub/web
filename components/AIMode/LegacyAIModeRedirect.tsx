'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { legacyWorkspaceHref } from './workspaceUrl';

/**
 * The workspace used to open over any page with `?ai=1`. A link from then
 * still lands on that page; this sends it on to the workspace page, open on
 * the same conversation or document. Reads the URL with `useSearchParams`,
 * so it needs a Suspense boundary above it.
 *
 * Temporary: delete once such links have aged out.
 */
export function LegacyAIModeRedirect() {
  const router = useRouter();
  const href = legacyWorkspaceHref(useSearchParams());
  useEffect(() => {
    if (href) router.replace(href);
  }, [href, router]);
  return null;
}
