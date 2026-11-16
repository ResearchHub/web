'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

export interface FrameSize {
  w: number;
  h: number;
  dpr: number;
}

interface Options {
  /** The scene time the server still was drawn at; the animation starts here. */
  still: number;
  /** Device-pixel-ratio cap. */
  maxDpr?: number;
}

/**
 * Runs a figure's animation in a canvas that fills its parent. It sizes the
 * canvas, starts at the still's moment (so the live figure takes over from
 * the server still without a jump), pauses while off screen or in a hidden
 * tab, and with `prefers-reduced-motion` draws one frame and stops. Returns
 * `ready` once a frame is on the canvas, for the cross-fade. `render` returns
 * false when it could not draw, and the still stays.
 */
export function useFigureLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  render: (t: number, size: FrameSize) => boolean | void,
  { still, maxDpr = 2 }: Options
) {
  const [ready, setReady] = useState(false);
  const renderRef = useRef(render);
  renderRef.current = render;

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = canvas?.parentElement;
    if (!canvas || !box) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    // `?orch-motion=reduce` forces the reduced-motion path, for testing.
    const forceReduced =
      new URLSearchParams(window.location.search).get('orch-motion') === 'reduce';
    let reduced = forceReduced || motionQuery.matches;
    let visible = false;
    let raf = 0;
    let last = 0;
    let t = still;
    const size: FrameSize = { w: 0, h: 0, dpr: 1 };

    let drawn = false;
    const draw = () => {
      if (size.w === 0 || size.h === 0) return;
      const ok = renderRef.current(t, size) !== false;
      if (ok && !drawn) {
        drawn = true;
        setReady(true);
      }
    };

    const tick = (now: number) => {
      raf = 0;
      if (!running()) return;
      // Cap the step so a long pause does not jump the figure ahead.
      if (last) t += Math.min(0.05, (now - last) / 1000);
      last = now;
      draw();
      raf = requestAnimationFrame(tick);
    };

    const running = () => visible && !reduced && document.visibilityState === 'visible';

    const sync = () => {
      if (running()) {
        if (!raf) {
          last = 0;
          raf = requestAnimationFrame(tick);
        }
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const resize = () => {
      const rect = box.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      size.w = Math.round(rect.width);
      size.h = Math.round(rect.height);
      size.dpr = dpr;
      canvas.width = Math.max(1, Math.round(size.w * dpr));
      canvas.height = Math.max(1, Math.round(size.h * dpr));
      if (reduced) t = still;
      draw();
    };

    // Draw once now, so the first frame does not wait on the observers.
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { rootMargin: '120px 0px' }
    );
    io.observe(box);
    const onMotion = () => {
      reduced = forceReduced || motionQuery.matches;
      if (reduced) {
        t = still;
        draw();
      }
      sync();
    };
    motionQuery.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', sync);

    return () => {
      ro.disconnect();
      io.disconnect();
      motionQuery.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', sync);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [canvasRef, still, maxDpr]);

  return ready;
}
