'use client';

import { useSearchParams } from 'next/navigation';
import { isProduction } from '@/utils/featureFlags';

/**
 * How a thread draws each comment: `feed`, the homepage's activity row, which every
 * tab now uses, or `card`, the bordered feed card from before. Temporary: the switch
 * goes once `feed` has settled in.
 */
export type CommentRowStyle = 'card' | 'feed';

/** `?commentCards=feed` previews the activity row on any tab, on any host but production. */
const PREVIEW_PARAM = 'commentCards';

/** The style a tab asked for, unless the preview parameter overrides it. */
export function useCommentRowStyle(tabStyle: CommentRowStyle = 'feed'): CommentRowStyle {
  const searchParams = useSearchParams();
  if (searchParams?.get(PREVIEW_PARAM) === 'feed' && !isProduction()) {
    return 'feed';
  }
  return tabStyle;
}
