'use client';

import { useEffect, useState } from 'react';
import { SocialShareService } from '@/services/socialShare.service';
import { ID } from '@/types/root';

interface UseGeneratedSharePostResult {
  /** The AI-written post, or null while it is being written or after a failure. */
  text: string | null;
  /** Generation failed; callers fall back to their own text. */
  failed: boolean;
}

interface Result {
  text: string | null;
  failed: boolean;
}

/**
 * Fetches the AI-written share post for a proposal or RFP while `postId` is
 * set. A missing `postId` keeps the last result, so a closing modal does not
 * flash back to loading.
 */
export function useGeneratedSharePost(postId: ID): UseGeneratedSharePostResult {
  const [result, setResult] = useState<Result | null>(null);
  const [prevPostId, setPrevPostId] = useState<ID>(postId);

  // Every new request, including reopening on the same post, starts from
  // loading: the post may have changed, so the last draft must not be shared.
  // Reset during render so the stale draft never paints.
  if (postId !== prevPostId) {
    setPrevPostId(postId);
    if (postId !== null && postId !== undefined) setResult(null);
  }

  useEffect(() => {
    if (postId === null || postId === undefined) return;

    let cancelled = false;
    SocialShareService.generatePost(postId)
      .then((text) => {
        if (!cancelled) setResult({ text, failed: false });
      })
      .catch(() => {
        if (!cancelled) setResult({ text: null, failed: true });
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (!result) return { text: null, failed: false };
  return { text: result.text, failed: result.failed };
}
