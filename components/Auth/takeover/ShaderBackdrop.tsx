'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/utils/styles';
import { BACKDROP_MAX_PIXEL_RATIO, BACKDROP_SHADERS, type BackdropId } from './backdropShaders';
import { createShaderRenderer, type ShaderRenderer } from './shaderRenderer';

/** About 30 frames a second is plenty for motion this slow. */
const FRAME_INTERVAL_MS = 32;

interface ShaderBackdropProps {
  backdrop: BackdropId;
  /** `panel` fills the left of the desktop takeover; `band` is the strip above the form on small screens. */
  layout: 'panel' | 'band';
  className?: string;
}

/**
 * One of the takeover's animated backdrops, drawn live with WebGL2. Without
 * WebGL2 the dark ground shows instead; with reduced motion the first frame
 * holds still.
 */
export function ShaderBackdrop({ backdrop, layout, className }: ShaderBackdropProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // A fresh canvas per run, since disposing loses the WebGL context for good.
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    host.appendChild(canvas);

    let renderer: ShaderRenderer | null = null;
    try {
      renderer = createShaderRenderer(canvas, BACKDROP_SHADERS[backdrop], {
        layout: layout === 'band' ? 1 : 0,
        maxPixelRatio: BACKDROP_MAX_PIXEL_RATIO[backdrop],
      });
    } catch (error) {
      console.error('Sign-in backdrop failed to start:', error);
    }
    if (!renderer) {
      canvas.remove();
      return;
    }

    const active = renderer;
    active.render(0);

    let frame = 0;
    let resizeObserver: ResizeObserver | null = null;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      resizeObserver = new ResizeObserver(() => active.render(0));
      resizeObserver.observe(canvas);
    } else {
      const start = performance.now();
      let drawnAt = start;
      const tick = (now: number) => {
        frame = requestAnimationFrame(tick);
        if (now - drawnAt < FRAME_INTERVAL_MS) return;
        drawnAt = now;
        active.render((now - start) / 1000);
      };
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      active.dispose();
      canvas.remove();
    };
  }, [backdrop, layout]);

  return (
    <div
      ref={hostRef}
      className={cn('overflow-hidden bg-[#02040c]', className)}
      data-backdrop={backdrop}
      aria-hidden="true"
    />
  );
}
