import { clamp, hash2, smoothstep } from '../../visuals/palette';
import { hexToRgb } from '../../theme';
import { INK, RGB, rgba } from './inks';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Q5, from microtubule to mind, after the Spectral set's figure, printed.
 * Neurons as cells in a sheet of tissue (a jittered Voronoi tiling): each
 * cell a membrane outline and one neuron drawn for looks rather than
 * anatomy (a round body, swaying, forking dendrites, a long axon) whose
 * neurites reach into the neighbouring cells, printed pink. A neuron prints
 * red when it fires (a spike). Firing drifts
 * from scattered into locked gamma cycles and back; when locked, a band of
 * blue sweeps across the sheet once per cycle. Below, the summed field in
 * pink: ragged while firing is scattered, a clean oscillation once locked,
 * with the gamma cycles shaded in blue.
 *
 * The rhythm is slowed a hundred times, so one 25 ms gamma cycle (40 Hz)
 * takes 2.5 s on screen: the sheet pulses at 0.4 Hz, each cell fires at most once
 * per cycle, and every flash rises and fades over about a second.
 * (The Spectral and earlier Poster figures ran at 2.8 and 3.8 Hz.)
 */

const GAMMA = 25; // ms
const SPEED = 10; // model ms per second: 40 Hz shown at 0.4 Hz
const SYNC_PERIOD = 16; // gamma cycles from scattered to locked and back
const WINDOW = 260; // ms of summed field shown
const ATTACK = 2.6; // ms for a flash to rise
const DECAY = 8; // ms for it to fade (e-fold)
const TAU = Math.PI * 2;

function synchrony(cycle: number) {
  const p = (((cycle / SYNC_PERIOD) % 1) + 1) % 1;
  return smoothstep(0.08, 0.36, p) * (1 - smoothstep(0.68, 0.94, p));
}

/** When cell n fires in a gamma cycle (model ms), or null. Locked spikes are delayed with x. */
function spikeTime(n: number, cycle: number, sweep: number): number | null {
  const rate = 0.3 + 0.16 * hash2(n, 999);
  if (hash2(n, cycle) > rate) return null;
  const s = synchrony(cycle);
  const locked = GAMMA * 0.42 + (hash2(n, cycle + 7777) - 0.5) * 4 + sweep;
  const free = hash2(n * 3 + 1, cycle) * GAMMA;
  return cycle * GAMMA + locked * s + free * (1 - s);
}

function fieldAt(ms: number) {
  const cyc = Math.floor(ms / GAMMA);
  const f = ms / GAMMA - cyc;
  const s = synchrony(cyc) + (synchrony(cyc + 1) - synchrony(cyc)) * f;
  const k = Math.floor(ms / 6);
  const u = ms / 6 - k;
  const n1 = hash2(k, 5);
  const n2 = hash2(k + 1, 5);
  const ragged = n1 + (n2 - n1) * (u * u * (3 - 2 * u)) - 0.5;
  return s * Math.cos(TAU * (ms / GAMMA - 0.54)) * 0.9 + (1 - s) * ragged * 0.55;
}

// ------------------------------------------------------------ the tiling

type Pt = [number, number];

interface Cell {
  id: number;
  soma: Pt;
  poly: Pt[];
  path: Path2D;
  /** Fades the sheet out at its top and bottom edges. */
  edge: number;
  /** Delay of the locked spike across the sheet (ms). */
  sweep: number;
  /** The neuron: body and tapering, branching neurites as one filled shape. */
  neuron: Path2D;
  /** Mottling of the cell's yellow. */
  tone: number;
}

interface Plate {
  key: string;
  cells: Cell[];
  base: HTMLCanvasElement;
  /** The neurons, printed over the gamma halftone so it never muddies them. */
  nerves: HTMLCanvasElement;
  somaR: number;
  cs: number;
}

/** Keeps the part of `poly` on the seed's side of the bisector with `q`. */
function clip(poly: Pt[], p: Pt, q: Pt): Pt[] {
  const mx = (p[0] + q[0]) / 2;
  const my = (p[1] + q[1]) / 2;
  const nx = q[0] - p[0];
  const ny = q[1] - p[1];
  const side = (v: Pt) => (v[0] - mx) * nx + (v[1] - my) * ny;
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const sa = side(a);
    const sb = side(b);
    if (sa <= 0) out.push(a);
    if (sa * sb < 0) {
      const k = sa / (sa - sb);
      out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
    }
  }
  return out;
}

function layout(w: number, h: number) {
  const top = h * 0.04;
  const bottom = h * 0.7;
  const cs = (bottom - top) / clamp(4.6 * (w / h) * 0.75, 3.5, 4.8);
  return { top, bottom, cs };
}

function bake(w: number, h: number, dpr: number): Plate {
  const { top, bottom, cs } = layout(w, h);
  const cols = Math.ceil(w / cs) + 1;
  const rows = Math.ceil((bottom - top) / cs) + 1;
  const seed = (i: number, j: number): Pt => [
    (i + 0.2 + 0.6 * hash2(i * 13 + 5, j * 7 + 11)) * cs,
    top + (j + 0.2 + 0.6 * hash2(i * 17 + 3, j * 29 + 1)) * cs,
  ];
  const cells: Cell[] = [];
  for (let j = -1; j <= rows; j++)
    for (let i = -1; i <= cols; i++) {
      const p = seed(i, j);
      if (p[0] < -cs * 0.6 || p[0] > w + cs * 0.6) continue;
      if (p[1] < top - cs * 0.9 || p[1] > bottom + cs * 0.9) continue;
      let poly: Pt[] = [
        [p[0] - cs * 2, p[1] - cs * 2],
        [p[0] + cs * 2, p[1] - cs * 2],
        [p[0] + cs * 2, p[1] + cs * 2],
        [p[0] - cs * 2, p[1] + cs * 2],
      ];
      for (let dj = -2; dj <= 2; dj++)
        for (let di = -2; di <= 2; di++) {
          if (!di && !dj) continue;
          poly = clip(poly, p, seed(i + di, j + dj));
        }
      const path = new Path2D();
      poly.forEach((v, k) => (k ? path.lineTo(v[0], v[1]) : path.moveTo(v[0], v[1])));
      path.closePath();
      const edge =
        smoothstep(top - cs * 0.4, top + cs * 0.5, p[1]) *
        (1 - smoothstep(bottom - cs * 0.6, bottom + cs * 0.3, p[1]));
      const id = (i + 3) * 131 + (j + 3) * 7;
      const neuron = growNeuron(p, cs, cs * 0.075, id);
      cells.push({
        id,
        soma: p,
        poly,
        path,
        edge,
        sweep: (p[0] / w) * 7,
        neuron,
        tone: 0.75 + 0.25 * hash2(id, 3),
      });
    }

  const somaR = cs * 0.12;
  const base = document.createElement('canvas');
  base.width = Math.round(w * dpr);
  base.height = Math.round(h * dpr);
  const g = base.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const knock = hexToRgb(INK.knock);
  for (const c of cells) {
    if (c.edge < 0.02) continue;
    // The cell: a yellow knock-out tile, like the tubulin beads in Q1 and Q2.
    g.fillStyle = rgba(knock, 0.9 * c.tone * c.edge);
    g.fill(c.path);
    // Membrane: a paper gap between cells, with the indigo printed a hair
    // out of register.
    g.strokeStyle = PAPER_RGB;
    g.lineWidth = 2.2;
    g.stroke(c.path);
    g.save();
    g.translate(0.7, 0.6);
    g.strokeStyle = rgba(RGB.indigo, 0.42 * c.edge);
    g.lineWidth = 0.9;
    g.stroke(c.path);
    g.restore();
  }
  // The neurons over the sheet, reaching across into their neighbours: each
  // darkest at its body and paling out along its neurites.
  const nerves = document.createElement('canvas');
  nerves.width = base.width;
  nerves.height = base.height;
  const n = nerves.getContext('2d')!;
  n.setTransform(dpr, 0, 0, dpr, 0, 0);
  for (const c of cells) {
    if (c.edge < 0.02) continue;
    const [sx, sy] = c.soma;
    const shade = n.createRadialGradient(sx, sy, somaR * 0.5, sx, sy, cs * 0.9);
    shade.addColorStop(0, rgba(RGB.pink, 0.7 * c.edge));
    shade.addColorStop(0.35, rgba(RGB.pink, 0.42 * c.edge));
    shade.addColorStop(1, rgba(RGB.pink, 0.14 * c.edge));
    n.fillStyle = shade;
    n.fill(c.neuron);
  }
  return { key: `${w}x${h}@${dpr}`, cells, base, nerves, somaR, cs };
}

const PAPER_RGB = INK.paper;

/**
 * One neurite as a filled ribbon: it leaves at angle `a`, curls by `curl`
 * radians over its length and tapers from `hw0` to `hw1` (half-widths),
 * flared at the base like a brush stroke. Forks `depth` more times.
 */
function neurite(
  path: Path2D,
  x: number,
  y: number,
  a: number,
  len: number,
  hw0: number,
  hw1: number,
  curl: number,
  depth: number,
  seed: number,
  sway = 0
) {
  const N = 18;
  const left: Pt[] = [];
  const right: Pt[] = [];
  let px = x;
  let py = y;
  let ang = a;
  const ds = len / N;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const hw = hw1 + (hw0 - hw1) * Math.pow(1 - u, 2.4);
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    left.push([px + nx * hw, py + ny * hw]);
    right.push([px - nx * hw, py - ny * hw]);
    if (i < N) {
      px += Math.cos(ang) * ds;
      py += Math.sin(ang) * ds;
      // A steady curl plus an S-shaped sway: rises, then turns back.
      ang += (curl + sway * Math.PI * Math.cos(Math.PI * 2 * u)) / N;
    }
  }
  path.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i <= N; i++) path.lineTo(left[i][0], left[i][1]);
  // A round tip.
  path.arc(px, py, hw1, ang + Math.PI / 2, ang - Math.PI / 2, true);
  for (let i = N; i >= 0; i--) path.lineTo(right[i][0], right[i][1]);
  path.closePath();
  if (depth <= 0) return;
  // Fork: two branches curling apart, one a little longer than the other.
  const spread = 0.34 + 0.26 * hash2(seed, 1);
  for (const side of [-1, 1]) {
    const h = hash2(seed, side + 5);
    if (depth <= 2 && h < 0.3) continue;
    neurite(
      path,
      px,
      py,
      ang + side * spread,
      len * (0.5 + 0.28 * h),
      hw1,
      Math.max(0.25, hw1 * 0.4),
      side * (0.2 + 0.5 * hash2(seed, side + 9)),
      depth - 1,
      seed * 7 + side + 3,
      (hash2(seed, side + 13) - 0.5) * 0.5
    );
  }
}

/**
 * A neuron drawn for looks rather than anatomy: a soft oval body, three or
 * four dendrites that flare out of it, sway, taper and fork twice, and one
 * long, fine axon that sweeps off in an S. They reach past the membrane into
 * the neighbouring cells, so the sheet reads as one woven network.
 */
function growNeuron(p: Pt, cs: number, somaR: number, id: number): Path2D {
  const path = new Path2D();
  const rot = hash2(id, 41) * TAU;
  const rx = somaR * 1.3;
  const ry = somaR * 1.05;
  path.moveTo(p[0] + rx * Math.cos(rot), p[1] + rx * Math.sin(rot));
  path.ellipse(p[0], p[1], rx, ry, rot, 0, TAU, true);
  const at = (a: number): [number, number] => [
    p[0] + Math.cos(a) * somaR * 0.45,
    p[1] + Math.sin(a) * somaR * 0.45,
  ];
  const n = hash2(id, 43) < 0.5 ? 4 : 5;
  // The dendrites, on the side away from the axon.
  for (let k = 0; k < n; k++) {
    const a = rot + Math.PI + ((k + 0.5) / n - 0.5) * Math.PI * 1.35 + (hash2(id, k) - 0.5) * 0.45;
    const len = cs * (0.2 + 0.08 * hash2(id, k + 50));
    const curl = (hash2(id, k + 90) - 0.5) * 1.8;
    const sway = (hash2(id, k + 70) - 0.5) * 0.9;
    neurite(path, ...at(a), a, len, somaR * 0.55, somaR * 0.13, curl, 3, id * 31 + k, sway);
  }
  // The axon: long, fine, one gentle S, with a small fork at its end.
  const ax = rot + (hash2(id, 47) - 0.5) * 0.4;
  neurite(
    path,
    ...at(ax),
    ax,
    cs * (0.62 + 0.2 * hash2(id, 48)),
    somaR * 0.32,
    somaR * 0.08,
    (hash2(id, 49) - 0.5) * 0.6,
    1,
    id * 17 + 5,
    0.35 * (hash2(id, 46) < 0.5 ? -1 : 1)
  );
  return path;
}

/** A flash's strength `age` model ms after its spike: a soft rise, a slow fade. */
const flashAt = (age: number) =>
  age < 0 ? 0 : smoothstep(0, ATTACK, age) * Math.exp(-Math.max(0, age - ATTACK) / DECAY);

export const tissue: PaperFigure = {
  still: 21.8,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t, dpr) => {
      const d = Math.min(dpr, 2);
      if (!plate || plate.key !== `${w}x${h}@${d}`) plate = bake(w, h, d);
      const { cells, somaR, cs } = plate;
      const now = t * SPEED;
      const cyc = Math.floor(now / GAMMA);
      const s = synchrony(cyc);
      const pitch = clamp(cs / 6.5, 3.4, 6.5);

      ctx.drawImage(plate.base, 0, 0, w, h);

      for (const c of cells) {
        if (c.edge < 0.02) continue;
        // Gamma: a band of blue sweeping across the sheet once per cycle.
        const ph = 0.5 + 0.5 * Math.cos(TAU * (now / GAMMA - 0.42 - c.sweep / GAMMA - 0.1));
        const gam = s * Math.pow(ph, 6) * c.edge;
        if (gam > 0.08) {
          // Printed as a blue halftone that swells with the band.
          const [x, y] = c.soma;
          const span = cs * 0.95;
          ctx.save();
          ctx.clip(c.path);
          ctx.fillStyle = rgba(RGB.blue, 0.32);
          ctx.beginPath();
          const r = pitch * 0.42 * gam;
          for (let gy = Math.floor((y - span) / pitch) * pitch; gy < y + span; gy += pitch)
            for (let gx = Math.floor((x - span) / pitch) * pitch; gx < x + span; gx += pitch) {
              const ox = gx + ((gy / pitch) % 2 ? pitch / 2 : 0);
              ctx.moveTo(ox + r, gy);
              ctx.arc(ox, gy, r, 0, TAU);
            }
          ctx.fill();
          ctx.restore();
          ctx.strokeStyle = rgba(RGB.blue, 0.5 * gam);
          ctx.lineWidth = 1.4;
          ctx.stroke(c.path);
        }
      }

      ctx.drawImage(plate.nerves, 0, 0, w, h);

      for (const c of cells) {
        if (c.edge < 0.02) continue;
        // Spike: the neuron prints red (pink over yellow) with a red bloom
        // around its body, then fades back to pink.
        let f = 0;
        for (let k = 0; k < 2; k++) {
          const st = spikeTime(c.id, cyc - k, c.sweep);
          if (st !== null) f = Math.max(f, flashAt(now - st));
        }
        f *= c.edge;
        if (f < 0.02) continue;
        const [x, y] = c.soma;
        const reach = cs * (0.32 + 0.3 * f);
        const glow = ctx.createRadialGradient(x, y, somaR * 0.5, x, y, reach);
        glow.addColorStop(0, rgba(RGB.fire, 0.32 * f));
        glow.addColorStop(1, rgba(RGB.fire, 0));
        ctx.save();
        ctx.clip(c.path);
        ctx.fillStyle = glow;
        ctx.fillRect(x - reach, y - reach, reach * 2, reach * 2);
        ctx.restore();
        ctx.fillStyle = rgba(RGB.fire, 0.9 * f);
        ctx.fill(c.neuron);
      }

      // ---- the summed field, the gamma cycles shaded under it
      const tl = w * 0.05;
      const tr = w * 0.95;
      const base = h * 0.86;
      const amp = h * 0.065;
      const start = now - WINDOW;
      const cw = (GAMMA / WINDOW) * (tr - tl);
      for (let c = Math.floor(start / GAMMA) - 1; c <= cyc + 1; c++) {
        const sc = synchrony(c);
        if (sc < 0.05) continue;
        const x = tl + ((c * GAMMA + GAMMA * 0.54 - start) / WINDOW) * (tr - tl);
        const half = cw * 0.18;
        if (x - half < tl || x + half > tr) continue;
        ctx.fillStyle = rgba(RGB.blue, 0.14 * sc);
        ctx.fillRect(x - half, base - amp * 1.5, half * 2, amp * 3);
      }
      ctx.strokeStyle = rgba(RGB.indigo, 0.32);
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(tl, base);
      ctx.lineTo(tr, base);
      ctx.stroke();
      ctx.strokeStyle = INK.pink;
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      const steps = Math.ceil((tr - tl) / 2);
      let hy = base;
      for (let i = 0; i <= steps; i++) {
        const x = tl + (i / steps) * (tr - tl);
        hy = base - amp * fieldAt(start + (i / steps) * WINDOW);
        if (i === 0) ctx.moveTo(x, hy);
        else ctx.lineTo(x, hy);
      }
      ctx.stroke();
      ctx.fillStyle = INK.pink;
      ctx.beginPath();
      ctx.arc(tr, hy, 3, 0, TAU);
      ctx.fill();
    };
  },
};
