import { hash2 } from '../../visuals/palette';
import { RGB, rgba } from './inks';
import { clamp } from './heroKit';
import { GLYPHS, glyph, type Glyph } from './heroMoments';

/**
 * What the superposition heroes (P, Q, R) share: the framed "moment" from
 * hero D, and a halftone of two interfering waves.
 */

export const momentKind = (id: number): Glyph =>
  GLYPHS[((id % GLYPHS.length) + GLYPHS.length) % GLYPHS.length];

/**
 * A moment of experience: a small framed picture printed in both inks in
 * register (indigo); `off` pushes the plates apart (blue up-left, pink
 * down-right) while it is still forming.
 */
export function drawMoment(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  f: number,
  kind: Glyph,
  alpha: number,
  off = 0,
  rot = 0
) {
  if (alpha < 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = rgba([255, 250, 242], 0.95 * alpha);
  ctx.beginPath();
  ctx.roundRect(-f / 2, -f / 2, f, f, f * 0.14);
  ctx.fill();
  ctx.globalCompositeOperation = 'multiply';
  ctx.lineWidth = clamp(f * 0.032, 1.2, 2.6);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const [col, sign] of [
    [RGB.blue, -1],
    [RGB.pink, 1],
  ] as const) {
    ctx.save();
    ctx.translate(sign * off, sign * off * 0.4);
    ctx.strokeStyle = rgba(col, 0.95 * alpha);
    ctx.beginPath();
    ctx.roundRect(-f / 2, -f / 2, f, f, f * 0.14);
    glyph(ctx, kind, f * 0.36);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

export interface Dot {
  x: number;
  y: number;
}

/** A slanted square grid of points inside `inside`, spacing `cell`. */
export function gridDots(
  cx: number,
  cy: number,
  span: number,
  cell: number,
  angle: number,
  inside: (x: number, y: number) => boolean
): Dot[] {
  const out: Dot[] = [];
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const n = Math.ceil(span / cell);
  for (let i = -n; i <= n; i++)
    for (let j = -n; j <= n; j++) {
      const x = cx + i * cell * ca - j * cell * sa;
      const y = cy + i * cell * sa + j * cell * ca;
      if (inside(x, y)) out.push({ x, y });
    }
  return out;
}

export interface Waves {
  /** The two sources, one per ink. */
  s1: [number, number];
  s2: [number, number];
  /** Wavelength and the time. */
  lambda: number;
  t: number;
  /** Extra weight per dot, 0..1 (fronts, edges, the collapse). */
  weight: (x: number, y: number) => number;
}

/**
 * The two waves as halftone: each ink prints the crests of its own wave
 * (dots grow where the wave is high), so where both crest the dots overlap
 * and print indigo: the interference pattern, drawn by the overprint.
 */
export function drawWaves(ctx: CanvasRenderingContext2D, dots: Dot[], cell: number, wv: Waves) {
  const k = (Math.PI * 2) / wv.lambda;
  const omega = 2.2;
  const rMax = cell * 0.5;
  for (const [col, src, shift] of [
    [RGB.blue, wv.s1, -0.16],
    [RGB.pink, wv.s2, 0.16],
  ] as const) {
    ctx.fillStyle = rgba(col, 0.88);
    ctx.beginPath();
    for (const d of dots) {
      const wgt = wv.weight(d.x, d.y);
      if (wgt < 0.02) continue;
      const r = Math.hypot(d.x - src[0], d.y - src[1]);
      const v = 0.5 + 0.5 * Math.cos(k * r - omega * wv.t);
      const rad = rMax * Math.sqrt(v) * wgt;
      if (rad < 0.35) continue;
      // The pink screen sits a fraction of a cell off the blue one.
      const x = d.x + shift * cell;
      const y = d.y - shift * cell * 0.5;
      ctx.moveTo(x + rad, y);
      ctx.arc(x, y, rad, 0, Math.PI * 2);
    }
    ctx.fill();
  }
}

/** A place for the collapse this cycle, near the middle of an area. */
export function collapseAt(
  n: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): [number, number] {
  return [cx + (hash2(n, 21) - 0.5) * 2 * rx, cy + (hash2(n, 22) - 0.5) * 2 * ry];
}
