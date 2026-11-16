import { useRef } from 'react';
import { useFrame, type RootState } from '@react-three/fiber';
import { CanvasTexture, Color, SRGBColorSpace, type Camera, type PerspectiveCamera } from 'three';
import { THEMES } from '../../theme';

/** The clay palette, from the theme (sRGB hex, converted to linear by three). */
export const T = THEMES.clay;
export const C = {
  ink: new Color(T.ink),
  a: new Color(T.gold), // apricot: branch A, oscillation, in-step emission
  b: new Color(T.ice), // teal: branch B, anesthetic, independent emission
  w: new Color(T.white), // violet: one outcome, tubulin matter, spikes
  lilac: new Color('#b4aaf0'), // β-tubulin and resting matter
  pale: new Color('#f6f3fc'), // the sheets
  deep: new Color('#2b2368'), // negative dips
  dim: new Color(T.dim),
  accent: new Color(T.accent),
};

export const FOV = 30;

/**
 * Scene time in seconds. Starts at the figure's still moment, so the live
 * figure takes over from the captured still without a jump; with `still`
 * it stays there. Runs before the scene's own frame callback.
 */
export function useSceneTime(still: boolean, stillT: number) {
  const t = useRef(stillT);
  useFrame((_, delta) => {
    t.current = still ? stillT : t.current + Math.min(delta, 0.05);
  }, -1);
  return t;
}

/** Half the visible width and height at `dist` from the camera. */
export function extent(state: RootState, dist: number) {
  const halfH = dist * Math.tan(((FOV / 2) * Math.PI) / 180);
  const aspect = state.size.width / Math.max(1, state.size.height);
  return { halfW: halfH * aspect, halfH, aspect };
}

/** A slow, gentle turn of the camera round a target. */
export function orbit(
  camera: Camera,
  t: number,
  o: {
    dist: number;
    height: number;
    target?: [number, number, number];
    yaw?: number;
    sway?: number;
  }
) {
  const [tx, ty, tz] = o.target ?? [0, 0, 0];
  const phi = (o.yaw ?? 0) + (o.sway ?? 0.16) * Math.sin(t * 0.13);
  const flat = Math.sqrt(Math.max(0, o.dist * o.dist - o.height * o.height));
  camera.position.set(tx + flat * Math.sin(phi), ty + o.height, tz + flat * Math.cos(phi));
  camera.lookAt(tx, ty, tz);
  (camera as PerspectiveCamera).updateProjectionMatrix?.();
}

/**
 * A microtubule lattice: 13 protofilaments round a hollow 25 nm tube, a
 * 3-start helix (each protofilament is shifted 3/13 of a monomer from its
 * neighbour), α- and β-tubulin alternating along each. Units: one monomer
 * (4 nm) is 0.4; the axis is local +x.
 */
export const PF = 13;
export const MONO = 0.4;
export const TUBE_R = 1.14;
export const BEAD = 0.215;

export interface Site {
  k: number; // protofilament
  j: number; // monomer along it
  u: number; // position along the axis
  th: number; // angle round it
  alpha: boolean;
}

export function lattice(rows: number): Site[] {
  const out: Site[] = [];
  for (let k = 0; k < PF; k++) {
    for (let j = 0; j < rows; j++) {
      out.push({
        k,
        j,
        u: (j + (k * 3) / PF) * MONO,
        th: (k / PF) * Math.PI * 2,
        alpha: j % 2 === 0,
      });
    }
  }
  return out;
}

/** A soft round spot (white, alpha falling off), for glows on the light ground. */
export function softSpot() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export const tubeLength = (rows: number) => (rows - 1 + 3) * MONO;
