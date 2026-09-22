import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

export interface FitOptions {
  /** How many items would like to show. */
  readonly itemCount: number;
  /** The narrowest an item may be laid out at. */
  readonly minItemWidth: number;
  /** Space between neighbouring items. */
  readonly gap: number;
  /**
   * Width the row spends on things that are not these items — a trailing
   * control, its gap — and that must stay visible before any item does.
   */
  readonly reservedWidth: number;
}

/** How many of the items fit side by side in `width` at their minimum size. */
export function fitCount(
  width: number,
  { itemCount, minItemWidth, gap, reservedWidth }: FitOptions
): number {
  const available = width - reservedWidth;
  if (available <= 0) return 0;
  // n items take n widths and n - 1 gaps.
  const fits = Math.floor((available + gap) / (minItemWidth + gap));
  return Math.max(0, Math.min(itemCount, fits));
}

/**
 * How many of a row's items fit the row's current content width. The row
 * decides which items those are; this only counts. Measures on mount and
 * again whenever the element resizes, so a user dragging the pane narrower
 * sees items fold away as they stop fitting.
 */
export function useFittingCount<T extends HTMLElement>(options: FitOptions) {
  const [width, setWidth] = useState<number | null>(null);
  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((element: T | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    elementRef.current = element;
    if (!element) return;

    observerRef.current = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observerRef.current.observe(element);
  }, []);

  // The observer reports after layout; measuring here as well means the
  // first paint already shows the right number of items.
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const style = getComputedStyle(element);
    const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    setWidth(element.clientWidth - padding);
  }, []);

  const { itemCount, minItemWidth, gap, reservedWidth } = options;
  const count = useMemo(
    () => (width == null ? 0 : fitCount(width, { itemCount, minItemWidth, gap, reservedWidth })),
    [width, itemCount, minItemWidth, gap, reservedWidth]
  );

  return { ref, count };
}
