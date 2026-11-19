'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFigureLoop } from '../../visuals/useFigureLoop';
import { printFonts } from './type';

/**
 * A Poster figure drawn straight to Canvas 2D: `create()` returns a draw
 * function with its own caches (baked layers, say), called each frame with
 * the context already scaled to CSS pixels and cleared.
 */
export type PaperDraw = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  dpr: number
) => void;

export interface PaperFigure {
  /** The representative moment: the captured still and the reduced-motion frame. */
  still: number;
  create(): PaperDraw;
}

/**
 * Runs a `PaperFigure` in a canvas multiplied onto the paper like ink. Some
 * figures set words in the page's fonts, so it starts once they have
 * loaded (the still shows until then).
 */
export function PaperCanvas(props: { figure: PaperFigure; onReady: () => void }) {
  const probe = useRef<HTMLSpanElement>(null);
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let live = true;
    const el = probe.current;
    // The faces may be unused elsewhere on the screen (the gallery), so ask
    // for them by name rather than waiting on whatever the page loads.
    const { display, body } = el ? printFonts(el) : { display: '', body: '' };
    const loads = [display, body].filter(Boolean).map((f) => document.fonts.load(`600 16px ${f}`));
    Promise.all(loads)
      .catch(() => undefined)
      .then(() => live && setFontsReady(true));
    return () => {
      live = false;
    };
  }, []);
  return fontsReady ? <PaperLoop {...props} /> : <span ref={probe} hidden />;
}

function PaperLoop({ figure, onReady }: { figure: PaperFigure; onReady: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draw = useMemo(() => figure.create(), [figure]);
  // `?orch-t=<seconds>` starts (or, with reduced motion, freezes) the figure
  // at that moment, for checking frames.
  const [start] = useState(() => {
    const v = Number(new URLSearchParams(window.location.search).get('orch-t'));
    return Number.isFinite(v) && v > 0 ? v : figure.still;
  });

  const ready = useFigureLoop(
    canvasRef,
    (t, { w, h, dpr }) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return false;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      draw(ctx, w, h, t, dpr);
    },
    { still: start, maxDpr: 2 }
  );

  useEffect(() => {
    if (ready) onReady();
  }, [ready, onReady]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full mix-blend-multiply" />;
}
