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
  postId: ID;
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
  const [requestedId, setRequestedId] = useState<ID>(postId);

  useEffect(() => {
    if (postId === null || postId === undefined) return;

    let cancelled = false;
    setRequestedId(postId);
    SocialShareService.generatePost(postId)
      .then((text) => {
        if (!cancelled) setResult({ postId, text, failed: false });
      })
      .catch(() => {
        if (!cancelled) setResult({ postId, text: null, failed: true });
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  // Only a result for the post currently asked about counts, so reopening on
  // another post never shows the previous post's text.
  const currentId = postId ?? requestedId;
  if (!result || result.postId !== currentId) return { text: null, failed: false };
  return { text: result.text, failed: result.failed };
}
