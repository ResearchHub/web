import { A, B, DIM, W, fract, hash2, mix, rng, smoothstep } from './palette';
import type { Rgb } from './pen';

/**
 * The hero figure: a microtubule in 3D, to scale. 13 protofilaments of
 * alternating α- and β-tubulin (4 nm each) wound as a 3-start helix around a
 * 25 nm cylinder. It is drawn twice, tinted, for a superposition of two
 * states whose difference grows along an "orchestrating" wave; then the
 * superposition reduces (a white pulse runs along the tube) and one state
 * remains. Two more microtubules sit behind, out of focus, and the
 * surroundings jitter: the warm, wet environment.
 *
 * Output is a flat sprite list in CSS pixels, which the WebGL renderer, the
 * canvas fallback and the server-drawn still all share.
 */

export const SPRITE_STRIDE = 8; // x, y, size, soft, r, g, b, a

const PROTOFILAMENTS = 13;
const MONOMER_NM = 4.1;
const RADIUS_NM = 10.6;
const CYCLE = 7.5;
const COLLAPSE = 0.74;

interface Tube {
  rows: number;
  offset: [number, number, number];
  tilt: number;
  yaw: number;
  spin: number;
  brightness: number;
  superposed: boolean;
}

// Tilts are relative to the layout's tilt.
const TUBES: Tube[] = [
  { rows: 84, offset: [0, 0, 0], tilt: 0, yaw: 0.32, spin: 0.11, brightness: 1, superposed: true },
  {
    rows: 84,
    offset: [-62, 26, -170],
    tilt: 0.07,
    yaw: 0.26,
    spin: -0.07,
    brightness: 0.34,
    superposed: false,
  },
  {
    rows: 84,
    offset: [70, -10, -330],
    tilt: -0.06,
    yaw: 0.38,
    spin: 0.05,
    brightness: 0.22,
    superposed: false,
  },
];

const r = rng(2025);
const DUST = Array.from({ length: 380 }, () => ({
  x: (r() - 0.5) * 420,
  y: (r() - 0.5) * 240,
  z: -320 + r() * 360,
  f: 0.7 + r() * 1.8,
  p: r() * 6.28,
}));

const CAMERA = 300;

export interface HeroFrameOpts {
  /** Main tube's screen position as fractions of the box. */
  anchor: [number, number];
  /** Pixels per nanometre at the focal plane. */
  scale: number;
  /** The tubes' angle in the picture plane, radians. */
  tilt: number;
  /** Lighter output for the server still. */
  still?: boolean;
  /**
   * Emit sprites back to front (dust, far tubes, then the main tube's far
   * wall before its near wall, the two states interleaved), for renderers
   * that paint opaque-ish marks over each other instead of adding light.
   */
  depthOrder?: boolean;
}

export function heroLayout(w: number, h: number): HeroFrameOpts {
  if (w < 768) {
    return { anchor: [0.5, 0.25], scale: Math.min(w / 112, h / 80), tilt: -0.5 };
  }
  return { anchor: [0.75, 0.47], scale: Math.min(w / 180, h / 92), tilt: 1.12 };
}

/**
 * Fills `out` with sprites for time `t` and returns how many were written.
 * `out` must hold `heroCapacity()` sprites.
 */
export function heroFrame(
  out: Float32Array,
  w: number,
  h: number,
  t: number,
  o: HeroFrameOpts
): number {
  let n = 0;
  const push = (x: number, y: number, size: number, soft: number, c: Rgb, a: number) => {
    if (a < 0.004) return;
    if (x < -size || x > w + size || y < -size || y > h + size) return;
    const i = n * SPRITE_STRIDE;
    out[i] = x;
    out[i + 1] = y;
    out[i + 2] = size;
    out[i + 3] = soft;
    out[i + 4] = c[0] / 255;
    out[i + 5] = c[1] / 255;
    out[i + 6] = c[2] / 255;
    out[i + 7] = a;
    n++;
  };

  const cx = w * o.anchor[0];
  const cy = h * o.anchor[1];
  const f = o.scale;

  // The superposition's life cycle.
  const p = fract(t / CYCLE);
  const cycle = Math.floor(t / CYCLE);
  const winner = hash2(cycle, 3) < 0.5 ? -1 : 1;
  const prevWinner = hash2(cycle - 1, 3) < 0.5 ? -1 : 1;
  const s = smoothstep(0.04, 0.7, p) * (1 - smoothstep(COLLAPSE, COLLAPSE + 0.015, p));
  const collapsed = p >= COLLAPSE;
  const age = collapsed ? (p - COLLAPSE) * CYCLE : 0;
  const flash = collapsed ? Math.exp(-age * 1.5) : 0;
  const pulseZ0 = (hash2(cycle, 9) - 0.5) * 160;
  const settled = mix(A, B, 0.5);
  const classical: Rgb = mix(settled, W, 0.55);

  const project = (x: number, y: number, z: number) => {
    const k = CAMERA / (CAMERA - z);
    return [cx + x * f * k, cy - y * f * k, k] as const;
  };

  const dust = () => {
    if (o.still) return;
    for (const d of DUST) {
      const x = d.x + Math.sin(t * d.f * 1.7 + d.p) * 1.6;
      const y = d.y + Math.cos(t * d.f * 1.3 + d.p) * 1.6;
      const [sx, sy, k] = project(x, y, d.z);
      const blur = Math.abs(d.z) / 150;
      push(sx, sy, 1.3 * f * k * (1 + blur * 0.5), 0.7, DIM, 0.3 / (1 + blur));
    }
  };
  if (o.depthOrder) dust();

  // Soft light along the main tube's axis.
  {
    const tube = TUBES[0];
    const L = tube.rows * MONOMER_NM;
    for (let i = 0; i <= 10; i++) {
      const z = -L / 2 + (i / 10) * L;
      const [x, y, zz] = place(tube, o.tilt, z, 0, 0);
      const [sx, sy, k] = project(x, y, zz);
      push(
        sx,
        sy,
        70 * f * k,
        1,
        collapsed ? mix(classical, W, flash) : settled,
        0.05 + 0.08 * flash
      );
    }
  }

  const tubes = TUBES.map((tube, ti) => ({ tube, ti }));
  if (o.depthOrder) tubes.reverse();
  for (const { tube, ti } of tubes) {
    if (o.still && ti > 0) continue;
    const L = tube.rows * MONOMER_NM;
    const spin = t * tube.spin;
    // Each branch's weight and colour through the cycle.
    const states: { branch: number; alpha: number; color: Rgb }[] = [];
    for (const branch of tube.superposed ? [-1, 1] : [0]) {
      let alpha = tube.brightness * 0.62;
      let color: Rgb = DIM;
      if (tube.superposed) {
        const tint = branch < 0 ? A : B;
        if (!collapsed) {
          const ramp = smoothstep(0, 0.06, p);
          if (branch === prevWinner) {
            alpha = mix1(1, 0.56, ramp);
            color = mix(classical, tint, ramp);
          } else {
            alpha = 0.56 * ramp;
            color = tint;
          }
        } else if (branch === winner) {
          alpha = 1;
          color = mix(mix(tint, W, Math.min(1, flash * 1.4)), classical, smoothstep(0.2, 1.4, age));
        } else {
          alpha = 0.56 * (1 - smoothstep(COLLAPSE, COLLAPSE + 0.02, p));
          color = tint;
        }
      }
      if (alpha >= 0.01) states.push({ branch, alpha, color });
    }

    // One tubulin monomer of one state. `half` < 0 keeps only the far wall,
    // > 0 only the near wall, 0 both.
    const monomer = (st: (typeof states)[number], row: number, pf: number, half: number) => {
      const { branch, alpha, color } = st;
      // 3-start helix: each protofilament is offset 3/13 of a monomer.
      const z = -L / 2 + row * MONOMER_NM + (pf * 3 * MONOMER_NM) / PROTOFILAMENTS;
      let theta = (pf / PROTOFILAMENTS) * Math.PI * 2 + spin;
      let radius = RADIUS_NM;
      if (branch !== 0) {
        const wave = 0.5 + 0.5 * Math.sin(z * 0.075 - t * 1.4);
        radius += branch * s * 2.1 * wave;
        theta += branch * s * 0.06 * wave;
      }
      const facing = Math.sin(theta); // +1 toward the camera
      if (half < 0 ? facing >= 0 : half > 0 && facing < 0) return;
      if (o.still && facing < -0.2) return;
      const [x, y, zz] = place(tube, o.tilt, z, theta, radius);
      const [sx, sy, k] = project(x, y, zz);
      const blur = Math.abs(zz) / 150;
      const isAlpha = row % 2 === 0;
      let a =
        (alpha * (isAlpha ? 1 : 0.55) * (0.35 + (0.65 * (facing + 1)) / 2)) / (1 + blur * 1.6);
      let c = color;
      if (collapsed && tube.superposed) {
        const front = Math.abs(Math.abs(z - pulseZ0) - age * 95);
        const pulse = Math.exp((-front * front) / 90) * Math.exp(-age * 0.9);
        a += pulse * 0.6;
        c = mix(c, W, Math.min(1, pulse));
      }
      push(sx, sy, (isAlpha ? 3.7 : 3.3) * f * k * (1 + blur * 0.5), blur > 0.8 ? 0.8 : 0.1, c, a);
    };

    if (!o.depthOrder) {
      for (const st of states)
        for (let row = 0; row < tube.rows; row++)
          for (let pf = 0; pf < PROTOFILAMENTS; pf++) monomer(st, row, pf, 0);
    } else {
      // Where the two states overlap, which one is on top alternates from
      // monomer to monomer, so neither covers the other.
      const flipped = [...states].reverse();
      for (const half of [-1, 1])
        for (let row = 0; row < tube.rows; row++)
          for (let pf = 0; pf < PROTOFILAMENTS; pf++)
            for (const st of (row + pf) & 1 ? flipped : states) monomer(st, row, pf, half);
    }
  }

  if (!o.depthOrder) dust();
  return n;
}

function mix1(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** A point on a tube (axial z, angle θ, radius) to world nanometres. */
function place(tube: Tube, tilt: number, z: number, theta: number, radius: number) {
  // Local: axis along x.
  const lx = z;
  const ly = Math.cos(theta) * radius;
  const lz = Math.sin(theta) * radius;
  // Yaw about y, so one end comes toward the camera.
  const cy = Math.cos(tube.yaw);
  const sy = Math.sin(tube.yaw);
  const x1 = lx * cy + lz * sy;
  const z1 = -lx * sy + lz * cy;
  // Tilt in the picture plane.
  const ct = Math.cos(tilt + tube.tilt);
  const st = Math.sin(tilt + tube.tilt);
  const x2 = x1 * ct - ly * st;
  const y2 = x1 * st + ly * ct;
  return [x2 + tube.offset[0], y2 + tube.offset[1], z1 + tube.offset[2]] as const;
}

export function heroCapacity() {
  let n = 11 + DUST.length;
  for (const tube of TUBES) n += tube.rows * PROTOFILAMENTS * (tube.superposed ? 2 : 1);
  return n;
}

/** The still: mid-superposition, the two states clearly apart. */
export const HERO_STILL_T = CYCLE * 0.62;
