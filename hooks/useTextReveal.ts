'use client';

import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from './useMediaQuery';

/**
 * Characters shown so far, per reveal key. Module-level so a text that
 * continues under a different component — streamed narration becoming the
 * settled answer of the same turn — picks up where it left off instead of
 * typing out again. Only turns seen live in this session get an entry, so a
 * transcript loaded from history renders in full at once.
 */
const progress = new Map<string, number>();

/** Floor on the pace, in characters per millisecond: a short, fully-known text. */
const MIN_CHARS_PER_MS = 0.3;
/** Share of the backlog revealed per 16ms, so a stream never trails far. */
const CATCH_UP_SHARE_PER_FRAME = 0.12;
const FRAME_MS = 16;

/** The answer's key: what narration writes to and the settled bubble reads. */
export const answerRevealKey = (executionId: number): string => `execution:${executionId}/answer`;
export const narrationRevealKey = (executionId: number, itemId: string): string =>
  `execution:${executionId}/narration/${itemId}`;

/** Register a key as revealing from zero, unless it already has progress. */
export function markRevealable(key: string): void {
  if (!progress.has(key)) progress.set(key, 0);
}

export function isRevealable(key: string): boolean {
  return progress.has(key);
}

/**
 * Reveals `text` a few characters per frame, like an answer being typed. With
 * a null `key` the whole text shows at once. Progress persists under `key`
 * and, when given, is mirrored to `carryTo`, so the component that later
 * renders the same text under that key starts where this one stopped. Honours
 * reduced-motion by showing everything immediately.
 */
export function useTextReveal(text: string, key: string | null, carryTo?: string): string {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)') === true;
  const animate = key != null && !reducedMotion;
  const [shown, setShown] = useState(() =>
    animate ? Math.min(progress.get(key) ?? 0, text.length) : text.length
  );
  const shownRef = useRef(shown);
  const keyRef = useRef(key);

  useEffect(() => {
    if (!animate) {
      shownRef.current = text.length;
      setShown(text.length);
      return;
    }
    if (keyRef.current !== key) {
      keyRef.current = key;
      shownRef.current = progress.get(key) ?? 0;
    }
    // A refetch can replace the text with a shorter one; never show past the end.
    shownRef.current = Math.min(shownRef.current, text.length);
    setShown(shownRef.current);
    if (shownRef.current >= text.length) return;

    // Paced by the clock, not the frame count, so a throttled tab reveals at
    // the same speed and simply skips ahead between frames.
    let frame = 0;
    let last = performance.now();
    let fractional = 0;
    const tick = (now: number) => {
      const elapsed = Math.min(now - last, 250);
      last = now;
      const backlog = text.length - shownRef.current;
      const perMs = Math.max(MIN_CHARS_PER_MS, (backlog * CATCH_UP_SHARE_PER_FRAME) / FRAME_MS);
      fractional += elapsed * perMs;
      const step = Math.floor(fractional);
      fractional -= step;
      if (step > 0) {
        shownRef.current = Math.min(text.length, shownRef.current + step);
        progress.set(key, shownRef.current);
        if (carryTo) progress.set(carryTo, shownRef.current);
        setShown(shownRef.current);
      }
      if (shownRef.current < text.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, key, carryTo, animate]);

  return animate ? text.slice(0, shown) : text;
}
