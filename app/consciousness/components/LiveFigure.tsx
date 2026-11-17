'use client';

import { useRef } from 'react';
import { cn } from '@/utils/styles';
import type { SceneId } from '../data/content';
import { CanvasPen } from '../visuals/pen';
import { SCENES } from '../visuals/scenes';
import { useFigureLoop } from '../visuals/useFigureLoop';

/** The animated version of a figure, drawn over its server-rendered still. */
export default function LiveFigure({ sceneId }: { sceneId: SceneId }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const penRef = useRef<CanvasPen | null>(null);
  const scene = SCENES[sceneId];

  const ready = useFigureLoop(
    canvasRef,
    (t, { w, h, dpr }) => {
      if (!penRef.current) {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return false;
        penRef.current = new CanvasPen(ctx);
      }
      penRef.current.begin(w, h, dpr);
      scene.draw(penRef.current, t);
    },
    { still: scene.still }
  );

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        'absolute inset-0 h-full w-full bg-[var(--o-ink)] transition-opacity duration-700',
        ready ? 'opacity-100' : 'opacity-0'
      )}
    />
  );
}
