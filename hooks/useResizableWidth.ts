'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type ResizeAnchor = 'left' | 'right';

export interface UseResizableWidthOptions {
  /** localStorage key the settled width persists under. */
  readonly storageKey: string;
  readonly min: number;
  readonly max: number;
  /** Width before anything is stored, or a function of the viewport width. */
  readonly defaultWidth: number | ((viewportWidth: number) => number);
  /**
   * Which viewport edge the pane hangs from. A left-anchored pane's divider
   * sits on its right, so a pointer at `clientX` means a width of `clientX`;
   * a right-anchored pane's width is `innerWidth - clientX`.
   */
  readonly anchor: ResizeAnchor;
}

export interface ResizableWidth {
  readonly width: number;
  /** True while a pointer drag is in flight — hosts suspend width transitions. */
  readonly isResizing: boolean;
  readonly startResize: () => void;
  /** Keyboard resize by a pointer-space delta: moving the divider right is positive. */
  readonly nudgeWidth: (deltaX: number) => void;
}

/**
 * A pane width the user can drag, persisted per browser.
 *
 * The drag maps pointer position to width according to the anchor, clamps to
 * [min, max], and writes to storage only once the gesture settles. Reading
 * storage happens after mount so a server render never mismatches.
 */
export function useResizableWidth({
  storageKey,
  min,
  max,
  defaultWidth,
  anchor,
}: UseResizableWidthOptions): ResizableWidth {
  const clamp = useCallback(
    (value: number) => Math.min(max, Math.max(min, Math.round(value))),
    [min, max]
  );
  const [width, setWidth] = useState(() => (typeof defaultWidth === 'number' ? defaultWidth : min));
  const [hydrated, setHydrated] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const defaultWidthRef = useRef(defaultWidth);
  defaultWidthRef.current = defaultWidth;

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(storageKey));
    if (Number.isFinite(stored) && stored > 0) {
      setWidth(clamp(stored));
    } else {
      const fallback = defaultWidthRef.current;
      setWidth(clamp(typeof fallback === 'number' ? fallback : fallback(window.innerWidth)));
    }
    setHydrated(true);
  }, [storageKey, clamp]);

  // Bounds can move (the viewport shrank, a neighbour grew): keep the width
  // inside them without waiting for the next gesture.
  useEffect(() => {
    setWidth((current) => clamp(current));
  }, [clamp]);

  const startResize = useCallback(() => setIsResizing(true), []);

  const nudgeWidth = useCallback(
    (deltaX: number) => {
      setWidth((current) => clamp(anchor === 'left' ? current + deltaX : current - deltaX));
    },
    [anchor, clamp]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMove = (event: PointerEvent) => {
      event.preventDefault();
      setWidth(clamp(anchor === 'left' ? event.clientX : window.innerWidth - event.clientX));
    };
    const stopResize = () => setIsResizing(false);

    // The drag crosses text, which would otherwise select under the cursor
    // and swap to an I-beam halfway through.
    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopResize);
    window.addEventListener('pointercancel', stopResize);

    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopResize);
      window.removeEventListener('pointercancel', stopResize);
    };
  }, [isResizing, anchor, clamp]);

  // Persist only once a gesture settles, so a drag doesn't write on every frame.
  useEffect(() => {
    if (!hydrated || isResizing) return;
    window.localStorage.setItem(storageKey, String(width));
  }, [hydrated, isResizing, width, storageKey]);

  return { width, isResizing, startResize, nudgeWidth };
}
