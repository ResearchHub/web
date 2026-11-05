'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** How close to the bottom counts as "reading the latest" for auto-follow. */
const NEAR_BOTTOM_PX = 90;

export interface JumpToLatest<T extends HTMLElement> {
  /** Attach to the scrolling container. */
  readonly scrollRef: React.RefObject<T | null>;
  /** Attach as the container's onScroll. */
  readonly handleScroll: () => void;
  /** False once the reader has scrolled up out of the follow zone. */
  readonly isAtBottom: boolean;
  /** Scroll to the end and resume following. */
  readonly jumpToLatest: () => void;
  /**
   * Pin the container to its end if the reader was near it. Call from an
   * effect keyed on whatever grows the content (new messages, stream deltas).
   */
  readonly follow: () => void;
}

interface UseJumpToLatestOptions {
  /** Resume following (and hide the jump affordance) whenever this changes — a chat switch. */
  readonly resetKey?: unknown;
}

/**
 * Sticky-bottom scrolling for a transcript: follows new content while the
 * reader is at the end, never yanks the view once they scroll up to re-read,
 * and reports when a "jump to latest" affordance should show.
 */
export function useJumpToLatest<T extends HTMLElement = HTMLDivElement>({
  resetKey,
}: UseJumpToLatestOptions = {}): JumpToLatest<T> {
  const scrollRef = useRef<T | null>(null);
  const nearBottomRef = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
  }, []);

  const handleScroll = useCallback(() => {
    const atBottom = measure();
    nearBottomRef.current = atBottom;
    setIsAtBottom(atBottom);
  }, [measure]);

  useEffect(() => {
    nearBottomRef.current = true;
    setIsAtBottom(true);
  }, [resetKey]);

  const follow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (nearBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    } else {
      // Content grew while the reader was up the page: the affordance is
      // the only way they learn there is something new below.
      setIsAtBottom(measure());
    }
  }, [measure]);

  const jumpToLatest = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current = true;
    setIsAtBottom(true);
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);

  return { scrollRef, handleScroll, isAtBottom, jumpToLatest, follow };
}
