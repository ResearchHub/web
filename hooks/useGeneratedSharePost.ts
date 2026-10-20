'use client';

import { useEffect, useState } from 'react';
import { SocialShareService } from '@/services/socialShare.service';
import { ID } from '@/types/root';

const POLL_INTERVAL_MS = 1500;
// Past this the modal keeps the title; the post is still cached for next time.
const POLL_TIMEOUT_MS = 60_000;

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
 * set, polling while a worker writes it. A missing `postId` keeps the last
 * result, so a closing modal does not flash back to loading.
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
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    // A worker writes the post, so ask again until it is ready or we give up.
    const poll = async () => {
      try {
        const text = await SocialShareService.requestPost(postId);
        if (cancelled) return;
        if (text !== null) {
          setResult({ text, failed: false });
        } else if (Date.now() >= deadline) {
          setResult({ text: null, failed: true });
        } else {
          timer = setTimeout(() => void poll(), POLL_INTERVAL_MS);
        }
      } catch {
        if (!cancelled) setResult({ text: null, failed: true });
      }
    };
    // poll handles its own errors.
    void poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [postId]);

  if (!result) return { text: null, failed: false };
  return { text: result.text, failed: result.failed };
}
