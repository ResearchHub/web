import type { Pen } from '../pen';
import { A, B, DIM, INK, W, fract, hash2, mix, smoothstep } from '../palette';
import type { Scene } from './types';

/**
 * Track 02. The Wigner function of a "cat" state: one particle in two places
 * (x = ±a) at once, drawn as a ridgeline surface. The two peaks are the two
 * branches; the ripples between them are the interference term
 * 2·D·e^{-x²-p²}·cos(2ap), which has negative dips no classical
 * distribution can have. The environment drives D from 1 to 0
 * (decoherence): the ripples flatten and an ordinary either-or remains.
 * Environment particles streak through while it happens.
 */

const CYCLE = 9;
const ROWS = 46;
const COLS = 150;
const XMAX = 4.6;
const PMAX = 2.5;
const SEP = 2.35;

/** Coherence D(t): full, decaying, then re-prepared. */
function coherence(t: number) {
  const p = fract(t / CYCLE) * CYCLE;
  if (p < 1.6) return 1;
  if (p < 7.6) return Math.exp(-(p - 1.6) / 1.15);
  return smoothstep(7.6, 8.9, p);
}

function wignerAt(x: number, p: number, d: number, theta: number) {
  const g1 = Math.exp(-((x - SEP) ** 2) - p * p);
  const g2 = Math.exp(-((x + SEP) ** 2) - p * p);
  const gi = Math.exp(-x * x - p * p) * Math.cos(2 * SEP * p + theta);
  return g1 + g2 + 2 * d * gi;
}

const pts = new Float64Array(COLS * 2 + 4);
const GRADIENT = [A, W, B] as const;

export const wigner: Scene = {
  still: 2.5,
  draw(pen: Pen, t: number) {
    const { w, h } = pen;
    const d = coherence(t);
    const theta = Math.sin(t * 0.5) * 0.6;
    const left = w * 0.06;
    const right = w * 0.94;
    const top = h * 0.3;
    const bottom = h * 0.9;
    // Fewer rows and samples for the server-drawn still, to keep it light.
    const rows = Math.max(24, Math.round(ROWS * Math.sqrt(pen.detail)));
    const cols = Math.max(48, Math.round(COLS * pen.detail));
    const rowGap = (bottom - top) / (rows - 1);
    const amp = Math.min(h * 0.2, rowGap * 12);
    // A slight perspective: the back rows are narrower.
    const narrow = 0.16;

    // Environment: particles crossing during decoherence.
    pen.additive(true);
    const rate = 1 - d;
    for (let i = 0; i < 26; i++) {
      const speed = 0.35 + hash2(i, 7) * 0.4;
      const f = fract(t * speed + hash2(i, 3));
      const y = top - h * 0.08 + hash2(i, 11) * (bottom - top + h * 0.12);
      const x = left - 30 + f * (right - left + 60);
      const a = rate * 0.55 * Math.sin(Math.PI * f);
      if (a > 0.01) {
        pen.line(x - 18, y, x, y, DIM, a * 0.6, 1);
        pen.circle(x, y, 1.4, W, a);
      }
    }
    pen.additive(false);

    for (let j = 0; j < rows; j++) {
      // Back (p = +PMAX) at the top, front at the bottom.
      const p = PMAX - (2 * PMAX * j) / (rows - 1);
      const depth = j / (rows - 1);
      const half = ((right - left) / 2) * (1 - narrow * (1 - depth));
      const cx = (left + right) / 2;
      const base = top + j * rowGap;
      let k = 0;
      for (let i = 0; i < cols; i++) {
        const x = -XMAX + (2 * XMAX * i) / (cols - 1);
        const v = wignerAt(x, p, d, theta);
        pts[k++] = cx + (x / XMAX) * half;
        pts[k++] = base - v * amp;
      }
      // Close down to the baseline so the fill hides the rows behind.
      pts[k++] = cx + half;
      pts[k++] = base + rowGap * 2;
      pts[k++] = cx - half;
      pts[k++] = base + rowGap * 2;
      const fade = 0.35 + 0.65 * depth;
      pen.path(pts.subarray(0, k), W, 0, 0, { fill: INK, fillAlpha: 1, closed: true });
      pen.path(pts.subarray(0, cols * 2), mix(W, A, 0.2), 0.82 * fade, 1.1, {
        gradient: GRADIENT,
      });
    }
  },
};
