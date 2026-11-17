'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dithering,
  DotGrid,
  GodRays,
  GrainGradient,
  MeshGradient,
} from '@paper-design/shaders-react';
import { hexToRgb } from '../../theme';
import { anesthesia } from './anesthesia';
import { createBeadRenderer, type BeadRenderer } from './beadGl';
import { decoherence } from './decoherence';
import { PAPER, T, YELLOW, tint } from './inks';
import { PaperCanvas, type PaperFigure } from './paperFigure';
import { tissue } from './tissue';
import { turing } from './turing';
import { CanvasPen } from '../../visuals/pen';
import { withPalette } from '../../visuals/palette';
import {
  HERO_STILL_T,
  SPRITE_STRIDE,
  heroCapacity,
  heroFrame,
  heroLayout,
} from '../../visuals/heroModel';
import { SCENES } from '../../visuals/scenes';
import { useFigureLoop } from '../../visuals/useFigureLoop';
import { isPosterOnly, type FigureId, type LiveFigureProps, type PosterFigureId } from '../types';
import type { HeroId } from '../heroes';
import { heroPlates } from './heroPlates';
import { heroRing } from './heroRing';
import { heroZoom } from './heroZoom';
import { heroMoments } from './heroMoments';
import { heroVase } from './heroVase';
import { heroFilm } from './heroFilm';
import { heroEye } from './heroEye';
import { heroWorld } from './heroWorld';
import { heroStrands } from './heroStrands';
import { heroSeated } from './heroSeated';
import { heroView } from './heroView';
import { heroMoire } from './heroMoire';
import { heroField } from './heroField';
import { heroMasses } from './heroMasses';
import { heroPulse } from './heroPulse';
import { heroWaves } from './heroWaves';
import { heroInterfere } from './heroInterfere';
import { heroMindWaves } from './heroMindWaves';

/**
 * The Poster set: each figure is a printed sheet. A Paper shader lays down
 * the colour field (a different one per figure, chosen for what it evokes),
 * and the figure's diagram is overprinted on it in the set's inks: the same
 * scene code as the Ink set, recoloured, with marks multiplied like ink
 * rather than added like light. A fine grain finishes the paper.
 *
 * The hero is the Ink set's microtubule, model and motion unchanged, painted
 * on the paper as lit beads (see `beadGl.ts`) in blue and pink.
 */

/**
 * The inks the diagrams print in: the theme's, except that knock-out fills
 * (tubulin bodies, the tube's cut end) print in yellow instead of paper.
 */
const PRINT = { ...T, ink2: tint(T.accent, 0.7) };

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.12 0 0 0 0 0.1 0 0 0 0 0.2 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** The colour field under each figure. Paper renders it in its own canvas. */
function Field({ fig, hero, still }: { fig: PosterFigureId; hero?: HeroId; still: boolean }) {
  const common = {
    className: 'absolute inset-0',
    minPixelRatio: 1,
    maxPixelCount: 1600 * 1000,
    frame: 4000,
  };
  const speed = (s: number) => (still ? 0 : s);
  switch (fig) {
    case 'hero':
      // Warm inks bleeding into each other: the warm, wet surroundings,
      // kept free of blue so the blue state stands out.
      return (
        <MeshGradient
          {...common}
          colors={[tint(T.accent, 0.62), PAPER, tint(T.accent, 0.28), tint(T.ice, 0.13), PAPER]}
          distortion={0.8}
          swirl={0.3}
          grainMixer={0.25}
          grainOverlay={0.15}
          speed={speed(0.22)}
        />
      );
    case 'anesthesia':
      // A slow wave in the paper, for the lattice's oscillation.
      return (
        <GrainGradient
          {...common}
          colorBack={PAPER}
          colors={[YELLOW, tint(T.ice, 0.22), PAPER]}
          shape="wave"
          softness={0.85}
          intensity={0.25}
          noise={0.3}
          scale={1.4}
          speed={speed(0.35)}
        />
      );
    case 'superradiance':
      // Light leaving the tube.
      return (
        <GodRays
          {...common}
          colorBack={PAPER}
          colorBloom={YELLOW}
          colors={[tint(T.ice, 0.55), YELLOW, tint(T.accent, 0.7), tint(T.ice, 0.36)]}
          density={0.22}
          spotty={0.3}
          midSize={0.35}
          midIntensity={0.45}
          intensity={0.32}
          bloom={0.3}
          offsetX={-0.2}
          offsetY={-0.32}
          speed={speed(0.3)}
        />
      );
    case 'wigner':
      // An even warm wash: the crowd and the two lanes carry the picture.
      return (
        <MeshGradient
          {...common}
          colors={[tint(T.accent, 0.5), PAPER, tint(T.accent, 0.3), tint(T.ice, 0.14)]}
          distortion={0.7}
          swirl={0.2}
          grainMixer={0.2}
          grainOverlay={0.1}
          speed={speed(0.12)}
        />
      );
    case 'spacetime':
      // Yellow graph paper under the bent grids.
      return (
        <DotGrid
          {...common}
          colorBack={tint(T.accent, 0.38)}
          colorFill={tint(T.gold, 0.45)}
          colorStroke={PAPER}
          size={1.6}
          gapX={22}
          gapY={22}
          strokeWidth={0}
          sizeRange={0}
          opacityRange={0}
          shape="circle"
        />
      );
    case 'turing':
      // A cool, even wash: the machine's picture carries the warmth.
      return (
        <MeshGradient
          {...common}
          colors={[tint(T.gold, 0.12), PAPER, tint(T.accent, 0.32), PAPER, tint(T.ice, 0.1)]}
          distortion={0.6}
          swirl={0.15}
          grainMixer={0.2}
          grainOverlay={0.1}
          speed={speed(0.1)}
        />
      );
    case 'raster':
      // A warm bloom under the sheet of cells.
      return (
        <GrainGradient
          {...common}
          colorBack={PAPER}
          colors={[tint(T.accent, 0.6), tint(T.ice, 0.22), PAPER]}
          shape="wave"
          softness={0.9}
          intensity={0.25}
          noise={0.25}
          scale={1.6}
          speed={speed(0.12)}
        />
      );
  }
}

/** The diagram, overprinted: the Ink set's scene in the Poster inks. */
function Print({ fig, onReady }: { fig: FigureId; onReady: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const penRef = useRef<CanvasPen | null>(null);
  const sprites = useMemo(
    () => (fig === 'hero' ? new Float32Array(heroCapacity() * SPRITE_STRIDE) : null),
    [fig]
  );
  const scene = fig === 'hero' ? null : SCENES[fig];

  const ready = useFigureLoop(
    canvasRef,
    (t, { w, h, dpr }) => {
      if (!penRef.current) {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return false;
        penRef.current = new CanvasPen(ctx, 'multiply', 0.6);
      }
      const pen = penRef.current;
      pen.begin(w, h, dpr);
      withPalette(PRINT, () => {
        if (scene) {
          scene.draw(pen, t);
          return;
        }
        if (!sprites) return;
        const n = heroFrame(sprites, w, h, t, heroLayout(w, h));
        pen.additive(true);
        for (let i = 0; i < n; i++) {
          const o = i * SPRITE_STRIDE;
          const c = [sprites[o + 4] * 255, sprites[o + 5] * 255, sprites[o + 6] * 255] as const;
          const a = sprites[o + 7];
          if (sprites[o + 3] > 0.5)
            pen.glow(sprites[o], sprites[o + 1], sprites[o + 2] * 0.5, c, a * 0.7);
          else pen.circle(sprites[o], sprites[o + 1], sprites[o + 2] * 0.42, c, a * 0.55);
        }
        pen.additive(false);
      });
    },
    { still: scene ? scene.still : HERO_STILL_T, maxDpr: 2 }
  );

  useEffect(() => {
    if (ready) onReady();
  }, [ready, onReady]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full mix-blend-multiply" />;
}

/**
 * Figures drawn for this set rather than overprinted from the Ink scenes:
 * Q1 after the Spectral figure and Q5 after the Micrograph one, both
 * reworked into the Poster's inks.
 */
const PAPER_FIGURES: Partial<Record<PosterFigureId, PaperFigure>> = {
  anesthesia,
  turing,
  wigner: decoherence,
  raster: tissue,
};

/**
 * The hero: the Ink set's microtubule, painted. Where WebGL2 is missing it
 * falls back to the flat overprint (`Print`).
 */
function Beads({ onReady, onFail }: { onReady: () => void; onFail: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<BeadRenderer | null>(null);
  const failed = useRef(false);
  const data = useMemo(() => new Float32Array(heroCapacity() * SPRITE_STRIDE), []);

  const ready = useFigureLoop(
    canvasRef,
    (t, { w, h, dpr }) => {
      if (failed.current) return false;
      if (!glRef.current) {
        const canvas = canvasRef.current;
        glRef.current = canvas ? createBeadRenderer(canvas, hexToRgb(T.accent)) : null;
        if (!glRef.current) {
          failed.current = true;
          onFail();
          return false;
        }
      }
      const gl = glRef.current;
      const n = withPalette(T, () =>
        heroFrame(data, w, h, t, { ...heroLayout(w, h), depthOrder: true })
      );
      gl.draw(data, n, w, h, dpr);
    },
    { still: HERO_STILL_T, maxDpr: 2 }
  );

  useEffect(() => {
    if (ready) onReady();
  }, [ready, onReady]);
  useEffect(() => () => glRef.current?.dispose(), []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}

/** The hero candidates drawn as paper figures (`beads` is the WebGL one). */
const HERO_FIGURES: Partial<Record<HeroId, PaperFigure>> = {
  a: heroPlates,
  b: heroRing,
  c: heroZoom,
  d: heroMoments,
  e: heroVase,
  f: heroFilm,
  g: heroEye,
  h: heroWorld,
  i: heroStrands,
  j: heroSeated,
  k: heroView,
  l: heroMoire,
  m: heroField,
  n: heroMasses,
  o: heroPulse,
  p: heroWaves,
  q: heroInterfere,
  r: heroMindWaves,
};

export default function PosterLive({
  fig,
  hero = 'beads',
  still,
  onReady,
}: Omit<LiveFigureProps, 'fig'> & { fig: PosterFigureId }) {
  const [flat, setFlat] = useState(false);
  const onFail = useCallback(() => setFlat(true), []);
  return (
    <div className="absolute inset-0 isolate overflow-hidden" style={{ background: PAPER }}>
      <Field fig={fig} hero={hero} still={still} />
      {fig === 'hero' && HERO_FIGURES[hero] ? (
        <PaperCanvas figure={HERO_FIGURES[hero]} onReady={onReady} />
      ) : fig === 'hero' && !flat ? (
        <Beads onReady={onReady} onFail={onFail} />
      ) : PAPER_FIGURES[fig] ? (
        <PaperCanvas figure={PAPER_FIGURES[fig]} onReady={onReady} />
      ) : isPosterOnly(fig) ? null : (
        <Print fig={fig} onReady={onReady} />
      )}
      <div
        className="pointer-events-none absolute inset-0 opacity-60 mix-blend-multiply"
        style={{ backgroundImage: GRAIN }}
      />
    </div>
  );
}
