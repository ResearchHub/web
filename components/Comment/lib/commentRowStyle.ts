'use client';

import { useSearchParams } from 'next/navigation';
import { isProduction } from '@/utils/featureFlags';

/**
 * How a thread draws each comment: `card`, the bordered feed card it has always used,
 * or `feed`, the homepage's activity row. Temporary: each tab moves to `feed` on its
 * own, and the switch goes once they all have.
 */
export type CommentRowStyle = 'card' | 'feed';

/** `?commentCards=feed` previews the activity row on any tab, on any host but production. */
const PREVIEW_PARAM = 'commentCards';

/** The style a tab asked for, unless the preview parameter overrides it. */
export function useCommentRowStyle(tabStyle: CommentRowStyle = 'card'): CommentRowStyle {
  const searchParams = useSearchParams();
  if (searchParams?.get(PREVIEW_PARAM) === 'feed' && !isProduction()) {
    return 'feed';
  }
  return tabStyle;
}
