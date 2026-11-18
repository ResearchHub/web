'use client';

import { useMemo, useRef } from 'react';
import { cn } from '@/utils/styles';
import { CanvasPen } from '../visuals/pen';
import {
  HERO_STILL_T,
  SPRITE_STRIDE,
  heroCapacity,
  heroFrame,
  heroLayout,
} from '../visuals/heroModel';
import { createSpriteRenderer, type SpriteRenderer } from '../visuals/spriteGl';
import { useFigureLoop } from '../visuals/useFigureLoop';

/**
 * The live hero microtubule. WebGL2 point sprites where available; Canvas 2D
 * otherwise (also forced with `?orch-gl=off`, for testing). Either draws the
 * same sprite list as the server still underneath it.
 */
export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const data = useMemo(() => new Float32Array(heroCapacity() * SPRITE_STRIDE), []);
  const backend = useRef<{ gl: SpriteRenderer | null; pen: CanvasPen | null } | null>(null);

  const ready = useFigureLoop(
    canvasRef,
    (t, { w, h, dpr }) => {
      const canvas = canvasRef.current;
      if (!canvas) return false;
      if (!backend.current) {
        const forceOff = new URLSearchParams(window.location.search).get('orch-gl') === 'off';
        const gl = forceOff ? null : createSpriteRenderer(canvas);
        const ctx = gl ? null : canvas.getContext('2d');
        backend.current = { gl, pen: ctx ? new CanvasPen(ctx) : null };
        canvas.dataset.renderer = gl ? 'webgl2' : ctx ? 'canvas2d' : 'none';
      }
      const n = heroFrame(data, w, h, t, heroLayout(w, h));
      const { gl, pen } = backend.current;
      if (gl) {
        gl.draw(data, n, w, h, dpr);
        return;
      }
      if (!pen) return false;
      pen.begin(w, h, dpr);
      pen.additive(true);
      for (let i = 0; i < n; i++) {
        const o = i * SPRITE_STRIDE;
        const c = [data[o + 4] * 255, data[o + 5] * 255, data[o + 6] * 255] as const;
        if (data[o + 3] > 0.5) pen.glow(data[o], data[o + 1], data[o + 2] * 0.6, c, data[o + 7]);
        else pen.circle(data[o], data[o + 1], data[o + 2] * 0.42, c, data[o + 7] * 0.9);
      }
      pen.additive(false);
    },
    { still: HERO_STILL_T, maxDpr: 2 }
  );

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        'absolute inset-0 h-full w-full bg-[var(--o-ink)] transition-opacity duration-1000',
        ready ? 'opacity-100' : 'opacity-0'
      )}
    />
  );
}
