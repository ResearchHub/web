'use client';

import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { FigureId, LiveFigureProps } from '../types';
import { FOV, T } from './common';
import { ClayHero } from './Hero';
import { ClayAnesthesia } from './Anesthesia';
import { ClaySuperradiance } from './Superradiance';
import { ClayWigner } from './Wigner';
import { ClaySpacetime } from './Spacetime';
import { ClayRaster } from './Raster';

export interface ClaySceneProps {
  still: boolean;
}

const SCENES: Record<FigureId, (p: ClaySceneProps) => React.JSX.Element> = {
  hero: ClayHero,
  anesthesia: ClayAnesthesia,
  superradiance: ClaySuperradiance,
  wigner: ClayWigner,
  spacetime: ClaySpacetime,
  raster: ClayRaster,
};

/** Figures that bring their own lights (and, for the hero, shadows). */
const OWN_LIGHTS: Partial<Record<FigureId, true>> = { hero: true, wigner: true };

/** A soft studio: sky and floor bounce, a warm key, a cool fill and a rim. */
function Studio() {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#c9b8ea', 1.35]} />
      <directionalLight position={[5, 8, 6]} intensity={2.1} color="#fff6ee" />
      <directionalLight position={[-7, 2, 4]} intensity={0.7} color="#e4ecff" />
      <directionalLight position={[0, 4, -8]} intensity={1.1} color="#ffffff" />
    </>
  );
}

/**
 * Tells the layer the figure is on screen after the first frames. For a
 * still it asks for a few frames (contact shadows settle), then stops.
 */
function Ready({ still, onReady }: { still: boolean; onReady: () => void }) {
  const n = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => {
    n.current++;
    if (still && n.current < 4) invalidate();
    if (n.current === (still ? 4 : 2)) onReady();
  });
  return null;
}

/**
 * The Clay set: each figure is a small model in soft matte clay, lit in a
 * lavender studio and turning slowly. React Three Fiber over three.js.
 */
export default function ClayLive({ fig, still, onReady }: LiveFigureProps) {
  const Scene = SCENES[fig];
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0 }}
      dpr={[1, 2]}
      flat
      shadows={fig === 'hero' ? 'percentage' : false}
      frameloop={still ? 'demand' : 'always'}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: FOV, near: 0.1, far: 200, position: [0, 0, 20] }}
    >
      <color attach="background" args={[T.ink]} />
      {!OWN_LIGHTS[fig] && <Studio />}
      <Scene still={still} />
      <Ready still={still} onReady={onReady} />
    </Canvas>
  );
}
