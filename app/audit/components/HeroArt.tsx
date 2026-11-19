'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/styles';

/**
 * The hero's 3D figure (`art/stacks.ts`), behind the text. Its library loads
 * after the page is interactive, and the canvas fades in once the first
 * frame is drawn. With reduced motion it draws one finished frame; without
 * WebGL (or with `?audit-gl=off`) the hero is plain paper.
 */
export function HeroArt() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const q = new URLSearchParams(window.location.search);
    if (q.get('audit-gl') === 'off') return;
    const still =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      q.get('audit-motion') === 'reduce';
    const css = getComputedStyle(canvas);
    let handle: { dispose: () => void } | null = null;
    let cancelled = false;
    import('../art/stacks')
      .then(({ createStacks }) => {
        if (cancelled) return;
        handle = createStacks(canvas, {
          paper: css.getPropertyValue('--a-paper').trim(),
          red: css.getPropertyValue('--a-red').trim(),
          ink: css.getPropertyValue('--a-ink').trim(),
          still,
          onReady: () => setReady(true),
        });
      })
      .catch((error) => {
        console.warn('The audit hero figure failed to start; showing plain paper.', error);
      });
    return () => {
      cancelled = true;
      handle?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn(
        'absolute inset-0 h-full w-full transition-opacity duration-1000',
        ready ? 'opacity-100' : 'opacity-0'
      )}
    />
  );
}
