'use client';

import { useEffect, useRef, useState } from 'react';
import { useFigureLoop } from '../../visuals/useFigureLoop';
import type { FigureId, LiveFigureProps } from '../types';
import { anesthesia } from './anesthesia';
import { hero } from './hero';
import { Ink, WashLayer, paintPaper, plateFrame, type Engraving } from './plate';
import { raster } from './raster';
import { spacetime } from './spacetime';
import { superradiance } from './superradiance';
import { wigner } from './wigner';

/**
 * The Engraved set: each figure is a plate from an old scientific atlas,
 * cut in sepia line (hatching, cross-hatching, contours, stipple) and
 * coloured by hand in madder red and Prussian blue washes. Plain Canvas 2D;
 * d3-contour draws the isolines of the Wigner function.
 */

const FIGURES: Record<FigureId, Engraving> = {
  hero,
  anesthesia,
  superradiance,
  wigner,
  spacetime,
  raster,
};

const FALLBACK_FAMILY = 'Georgia, "Times New Roman", serif';

/** The engraved face (IM Fell English), loaded before the first lettered frame. */
function useEngravedFamily(probe: React.RefObject<HTMLDivElement | null>) {
  const [family, setFamily] = useState<string | null>(null);
  useEffect(() => {
    const el = probe.current;
    if (!el) return;
    const v = getComputedStyle(el).getPropertyValue('--font-orch-engraved').trim();
    const fam = v ? `${v}, ${FALLBACK_FAMILY}` : FALLBACK_FAMILY;
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        setFamily(fam);
      }
    };
    const timer = window.setTimeout(finish, 2500);
    if (v && document.fonts) {
      Promise.all([document.fonts.load(`italic 16px ${v}`), document.fonts.load(`16px ${v}`)])
        .then(() => document.fonts.ready)
        .then(finish, finish);
    } else finish();
    return () => window.clearTimeout(timer);
  }, [probe]);
  return family;
}

function Plate({ fig, family, onReady }: { fig: FigureId; family: string; onReady: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef<{
    ink: Ink;
    wash: WashLayer;
    paper: HTMLCanvasElement | null;
    key: string;
  } | null>(null);
  const figure = FIGURES[fig];

  const ready = useFigureLoop(
    canvasRef,
    (t, { w, h, dpr }) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return false;
      if (!state.current)
        state.current = { ink: new Ink(ctx), wash: new WashLayer(), paper: null, key: '' };
      const s = state.current;
      const key = `${w}x${h}@${dpr}`;
      if (s.key !== key) {
        s.paper = paintPaper(w, h, dpr, family, figure.labels(w, h));
        s.key = key;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(s.paper!, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      s.wash.begin(canvas.width, canvas.height, dpr);
      figure.draw({ ctx, ink: s.ink, wash: s.wash, w, h, family, frame: plateFrame(w, h) }, t);
    },
    { still: figure.still, maxDpr: 2 }
  );

  useEffect(() => {
    if (ready) onReady();
  }, [ready, onReady]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}

export default function EngravedLive({ fig, onReady }: LiveFigureProps) {
  const probe = useRef<HTMLDivElement>(null);
  const family = useEngravedFamily(probe);
  return (
    <div ref={probe} className="absolute inset-0" style={{ background: '#f1e7d0' }}>
      {family && <Plate fig={fig} family={family} onReady={onReady} />}
    </div>
  );
}
