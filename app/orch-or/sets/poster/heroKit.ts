import { clamp, rng, smoothstep } from '../../visuals/palette';

/**
 * What the Poster hero candidates share.
 *
 * The idea common to all three: a two-ink print. A part printed twice, once
 * in blue and once in pink, a little out of register, is a state that is
 * two things at once. When the two plates slide into register the overlap
 * prints indigo (ResearchHub blue × the pink, multiplied, is about #34176f:
 * the page's indigo), one ordinary outcome. That happens once every
 * `PLATE_CYCLE` seconds; the rest of the time the plates drift apart and
 * hold, breathing slightly. The plates part and meet symmetrically, so
 * neither colour is the one that wins.
 */

export const PLATE_CYCLE = 11;

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export interface PlateState {
  /** 0 = in register, 1 = fully apart. */
  sep: number;
  /** The flare after a collapse, 1 → 0. */
  flash: number;
  /** Seconds since the last collapse. */
  since: number;
}

export function plateState(t: number): PlateState {
  const tc = ((t % PLATE_CYCLE) + PLATE_CYCLE) % PLATE_CYCLE;
  let sep: number;
  if (tc < 1.4) sep = 0;
  else if (tc < 5) sep = easeInOut((tc - 1.4) / 3.6);
  else if (tc < 10.3) sep = 1 - 0.07 * (0.5 - 0.5 * Math.cos(((tc - 5) / 5.3) * Math.PI * 2));
  else {
    const k = (tc - 10.3) / 0.7;
    sep = 1 - k * k * k;
  }
  return { sep, flash: tc < 2 ? Math.exp(-tc / 0.5) : 0, since: tc };
}

/** A moment with the plates apart, for the captured still. */
export const PLATE_STILL = 7.2;

/**
 * On a phone the hero's art fills the top of the hero, above the headline
 * (about 40% of the screen); the hero itself can be much taller. Returns
 * that area's height.
 */
export const phoneArt = (w: number, h: number) => Math.min(h, w * 2.16) * 0.4;

// ------------------------------------------------------------- tubes

/** A tapering tube along a polyline: `pts` [x0, y0, x1, y1, …], widths at its ends. */
export interface Tube {
  pts: number[];
  w0: number;
  w1: number;
}

export const widthAt = (tube: Tube, i: number) => {
  const n = tube.pts.length / 2 - 1;
  return tube.w0 + (tube.w1 - tube.w0) * (n ? i / n : 0);
};

/**
 * Strokes tubes segment by segment with round caps, so the union of the
 * segments is a smooth tapering tube. Drawn twice by callers: once wide in
 * the outline ink, then the fill on top, which leaves one clean outline
 * round the whole branching shape.
 */
export function strokeTubes(
  g: CanvasRenderingContext2D,
  tubes: Tube[],
  style: string,
  extra: number,
  map: (x: number, y: number) => [number, number],
  scale: number
) {
  g.strokeStyle = style;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (const tube of tubes) {
    const n = tube.pts.length / 2;
    for (let i = 0; i < n - 1; i++) {
      const [x0, y0] = map(tube.pts[i * 2], tube.pts[i * 2 + 1]);
      const [x1, y1] = map(tube.pts[i * 2 + 2], tube.pts[i * 2 + 3]);
      g.lineWidth = Math.max(0.6, widthAt(tube, i + 0.5) * scale + extra);
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1, y1);
      g.stroke();
    }
  }
}

// ------------------------------------------------------------- a neuron

export interface Neuron {
  /** Dendrites and axon, in units where the cell body is about 1.4 wide. */
  tubes: Tube[];
  /** The cell body, a rounded triangle, as a closed polygon. */
  soma: number[];
  /** The apical trunk from its tip down to the soma, then the axon. */
  spikePath: number[];
  /** Tube indices that are dendrites (they hold the printed microtubules). */
  dendrites: number[];
}

/**
 * A pyramidal neuron, the commonest cell of the cortex: a triangular cell
 * body, one long apical dendrite rising to a tuft, side branches, a skirt of
 * basal dendrites, and a thin axon leaving downward. Seeded, so the live
 * figure and its captured still agree.
 */
export function pyramidal(seed: number, lean = 0.12): Neuron {
  const r = rng(seed);
  const tubes: Tube[] = [];
  const dendrites: number[] = [];
  const walk = (x: number, y: number, heading: number, len: number, wiggle: number, pull = 0) => {
    const step = 0.11;
    const steps = Math.max(4, Math.round(len / step));
    const pts = [x, y];
    let h = heading;
    let turn = 0;
    for (let i = 0; i < steps; i++) {
      turn = turn * 0.75 + (r() - 0.5) * wiggle;
      h += turn + (heading - h) * pull;
      x += Math.cos(h) * step;
      y += Math.sin(h) * step;
      pts.push(x, y);
    }
    return pts;
  };
  const add = (t: Tube, dendrite = true) => {
    if (dendrite) dendrites.push(tubes.length);
    tubes.push(t);
    return t;
  };
  const up = -Math.PI / 2 + lean;

  // Apical dendrite and its side branches and tuft.
  const apical = add({ pts: walk(0, -0.55, up, 6.2, 0.05, 0.08), w0: 0.5, w1: 0.16 });
  const an = apical.pts.length / 2;
  for (const [f, side, len] of [
    [0.2, -1, 2.0],
    [0.33, 1, 2.3],
    [0.5, -1, 1.8],
    [0.62, 1, 1.6],
  ] as const) {
    const i = Math.floor(an * f);
    const w = widthAt(apical, i) * 0.55;
    add({
      pts: walk(apical.pts[i * 2], apical.pts[i * 2 + 1], up + side * (0.9 + r() * 0.3), len, 0.16),
      w0: w,
      w1: 0.06,
    });
  }
  const tx = apical.pts[an * 2 - 2];
  const ty = apical.pts[an * 2 - 1];
  for (const a of [-0.7, -0.15, 0.45]) {
    add({ pts: walk(tx, ty, up + a, 1.4 + r() * 0.6, 0.2), w0: 0.15, w1: 0.05 });
  }

  // Basal dendrites, each with a fork.
  for (const a of [0.3, 0.95, 2.2, 2.85]) {
    const sx = Math.cos(a) * 0.55;
    const sy = 0.22 + Math.sin(a) * 0.3;
    const len = 1.9 + r() * 0.9;
    const b = add({ pts: walk(sx, sy, a, len, 0.2, 0.05), w0: 0.3, w1: 0.07 });
    const bi = Math.floor((b.pts.length / 2) * (0.4 + r() * 0.2));
    add({
      pts: walk(b.pts[bi * 2], b.pts[bi * 2 + 1], a + (r() < 0.5 ? -0.6 : 0.6), len * 0.5, 0.25),
      w0: 0.14,
      w1: 0.05,
    });
  }

  // Axon: thin, straight, downward.
  const axon = add(
    { pts: walk(0.02, 0.5, Math.PI / 2 - lean * 0.4, 6.5, 0.03, 0.1), w0: 0.13, w1: 0.09 },
    false
  );

  // Cell body: a rounded triangle, apex up.
  const corners: [number, number][] = [
    [0, -0.85],
    [0.7, 0.48],
    [-0.7, 0.48],
  ];
  const soma: number[] = [];
  for (let i = 0; i < 3; i++) {
    const [ax, ay] = corners[i];
    const [bx, by] = corners[(i + 1) % 3];
    for (let k = 0; k < 12; k++) {
      const f = k / 12;
      // Bulge each side outward a little.
      const mx = ax + (bx - ax) * f;
      const my = ay + (by - ay) * f;
      const nx = -(by - ay);
      const ny = bx - ax;
      const nl = Math.hypot(nx, ny);
      const bulge = Math.sin(f * Math.PI) * 0.12;
      soma.push(mx - (nx / nl) * bulge, my - (ny / nl) * bulge);
    }
  }

  const spikePath: number[] = [];
  for (let i = an - 1; i >= 0; i--) spikePath.push(apical.pts[i * 2], apical.pts[i * 2 + 1]);
  spikePath.push(0, 0);
  spikePath.push(...axon.pts);
  return { tubes, soma, spikePath, dendrites };
}

/** Lengths along a polyline, for running a pulse along it. */
export function cumulative(pts: number[], map: (x: number, y: number) => [number, number]) {
  const out = [0];
  let [px, py] = map(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) {
    const [x, y] = map(pts[i], pts[i + 1]);
    out.push(out[out.length - 1] + Math.hypot(x - px, y - py));
    px = x;
    py = y;
  }
  return out;
}

export { clamp, smoothstep };
