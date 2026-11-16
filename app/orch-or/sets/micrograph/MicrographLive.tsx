'use client';

import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { DepthOfField, EffectComposer, N8AO, Noise, Vignette } from '@react-three/postprocessing';
import { THEMES } from '../../theme';
import type { FigureId, LiveFigureProps } from '../types';
import { newHud, type Hud } from './hud';
import { DIST_PHONE, DIST_WIDE, Hero } from './Hero';
import { Anesthesia } from './Anesthesia';
import { Superradiance } from './Superradiance';
import { Wigner } from './Wigner';
import { Spacetime } from './Spacetime';
import { Raster } from './Raster';

/**
 * The Micrograph set: each figure looks like a false-colour electron
 * micrograph. Specimens are modelled in three.js (React Three Fiber) and
 * shaded like secondary-electron imaging (bright rims, dark faces), with
 * ambient occlusion (N8AO), film noise and a vignette from postprocessing.
 * Colour is painted on only where it carries meaning. An instrument data
 * strip, a scale bar measured from the camera, and any traces are drawn on
 * a 2D canvas over the view.
 */

const T = THEMES.micrograph;

export interface SceneProps {
  still: boolean;
  hud: Hud;
}

const SCENES: Record<FigureId, ComponentType<SceneProps>> = {
  hero: Hero,
  anesthesia: Anesthesia,
  superradiance: Superradiance,
  wigner: Wigner,
  spacetime: Spacetime,
  raster: Raster,
};

/** Tells the layer once frames are on screen; in still mode, renders a few. */
function Ready({ still, onReady }: { still: boolean; onReady: () => void }) {
  const invalidate = useThree((s) => s.invalidate);
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    frames.current++;
    if (still && frames.current < 4) requestAnimationFrame(() => invalidate());
    if (!done.current && frames.current >= 3) {
      done.current = true;
      requestAnimationFrame(() => onReady());
    }
  });
  return null;
}

export default function MicrographLive({ fig, still, onReady }: LiveFigureProps) {
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<Hud>(newHud());
  const [phone, setPhone] = useState(false);
  const [tall, setTall] = useState(false);

  useEffect(() => {
    const canvas = overlayRef.current;
    const box = canvas?.parentElement;
    if (!canvas || !box) return;
    const hud = hudRef.current;
    hud.ctx = canvas.getContext('2d');
    const family = getComputedStyle(box).getPropertyValue('--font-orch-micrograph').trim();
    if (family) hud.font = family;
    const resize = () => {
      const r = box.getBoundingClientRect();
      hud.dpr = Math.min(window.devicePixelRatio || 1, 2);
      hud.w = Math.round(r.width);
      hud.h = Math.round(r.height);
      canvas.width = Math.max(1, Math.round(hud.w * hud.dpr));
      canvas.height = Math.max(1, Math.round(hud.h * hud.dpr));
      setPhone(hud.w < 520);
      setTall(hud.w < 768 && hud.w / Math.max(1, hud.h) <= 1.05);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  const Scene = SCENES[fig];
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: T.ink }}>
      <Canvas
        flat
        dpr={[1, 2]}
        frameloop={still ? 'demand' : 'always'}
        gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
        camera={{ fov: 28, near: 2, far: 5000, position: [0, 0, 300] }}
        onCreated={({ gl }) => gl.setClearColor(T.ink, 1)}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Scene still={still} hud={hudRef.current} />
        <Ready still={still} onReady={onReady} />
        <EffectComposer multisampling={phone ? 0 : 4}>
          <N8AO
            halfRes
            quality={phone ? 'performance' : 'low'}
            aoRadius={7}
            distanceFalloff={1.2}
            intensity={2.6}
            color="black"
          />
          {fig === 'hero' ? (
            <DepthOfField
              focusDistance={tall ? DIST_PHONE : DIST_WIDE}
              focusRange={90}
              bokehScale={8}
            />
          ) : (
            <></>
          )}
          <Noise premultiply opacity={0.55} />
          <Vignette offset={0.28} darkness={0.62} />
        </EffectComposer>
      </Canvas>
      <canvas ref={overlayRef} className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
  );
}
