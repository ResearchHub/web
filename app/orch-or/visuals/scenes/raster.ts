import type { Pen } from '../pen';
import { A, B, DIM, W, hash2, smoothstep } from '../palette';
import type { Scene } from './types';

/**
 * Track 05. A spike raster: rows are neurons, ticks are spikes, time runs
 * right to left (slowed for display). Firing drifts between scattered and
 * locked to 25 ms gamma cycles (40 Hz); the summed field below oscillates
 * when they lock. Gamma cycles are shaded as synchrony rises.
 */

const NEURONS = 30;
const GAMMA_MS = 25;
const WINDOW_MS = 420;
/** Model milliseconds per second of animation. */
const SPEED = 95;
/** Synchrony period, in gamma cycles. */
const SYNC_PERIOD = 46;

function synchrony(cycle: number) {
  const p = (((cycle / SYNC_PERIOD) % 1) + 1) % 1;
  return smoothstep(0.08, 0.38, p) * (1 - smoothstep(0.68, 0.94, p));
}

function spikeTime(neuron: number, cycle: number): number | null {
  const rate = 0.34 + 0.18 * hash2(neuron, 999);
  if (hash2(neuron, cycle) > rate) return null;
  const s = synchrony(cycle);
  const locked = GAMMA_MS * 0.42 + (hash2(neuron, cycle + 7777) - 0.5) * 4;
  const free = hash2(neuron * 3 + 1, cycle) * GAMMA_MS;
  return cycle * GAMMA_MS + locked * s + free * (1 - s);
}

export const raster: Scene = {
  still: 8.6,
  draw(pen: Pen, t: number) {
    const { w, h } = pen;
    const now = t * SPEED;
    const start = now - WINDOW_MS;
    const left = w * 0.04;
    const right = w * 0.96;
    const top = h * 0.08;
    const bottom = h * 0.66;
    const rowH = (bottom - top) / NEURONS;
    const xOf = (ms: number) => left + ((ms - start) / WINDOW_MS) * (right - left);

    const c0 = Math.floor(start / GAMMA_MS) - 1;
    const c1 = Math.ceil(now / GAMMA_MS) + 1;

    pen.additive(true);
    // Gamma cycles, shaded by how locked the firing is.
    for (let c = c0; c <= c1; c++) {
      const s = synchrony(c);
      if (s < 0.05) continue;
      const peak = c * GAMMA_MS + GAMMA_MS * 0.42;
      const x = xOf(peak);
      if (x < left - 20 || x > right + 20) continue;
      const bw = ((GAMMA_MS * 0.32) / WINDOW_MS) * (right - left);
      pen.rect(x - bw / 2, top, bw, bottom - top, A, 0.07 * s);
      pen.line(x, top - 6, x, top - 2, A, 0.7 * s, 1.2);
    }

    // Spikes, and a histogram for the summed field.
    const bins = Math.round(160 * Math.max(0.5, pen.detail));
    const hist = new Float64Array(bins);
    for (let n = 0; n < NEURONS; n++) {
      const y = top + n * rowH + rowH / 2;
      for (let c = c0; c <= c1; c++) {
        const st = spikeTime(n, c);
        if (st === null || st < start || st > now) continue;
        const x = xOf(st);
        const age = (now - st) / WINDOW_MS;
        const fresh = Math.exp(-age * 18);
        pen.line(x, y - rowH * 0.36, x, y + rowH * 0.36, W, 0.72 + 0.28 * fresh, 1.3);
        if (fresh > 0.05) pen.glow(x, y, rowH * 1.8, W, 0.5 * fresh);
        const bi = Math.floor(((st - start) / WINDOW_MS) * bins);
        if (bi >= 0 && bi < bins) hist[bi] += 1;
      }
    }

    // The summed field: smoothed population rate.
    const fy = h * 0.84;
    const fh = h * 0.12;
    pen.line(left, fy, right, fy, DIM, 0.2, 1);
    const pts: number[] = [];
    const kernel = [0.06, 0.12, 0.2, 0.24, 0.2, 0.12, 0.06];
    const mean = (NEURONS * 0.43) / (GAMMA_MS / (WINDOW_MS / bins));
    for (let i = 0; i < bins; i++) {
      let v = 0;
      for (let k = 0; k < kernel.length; k++) {
        const j = i + k - 3;
        if (j >= 0 && j < bins) v += hist[j] * kernel[k];
      }
      pts.push(left + ((i + 0.5) / bins) * (right - left), fy - ((v - mean) / (mean * 3.2)) * fh);
    }
    pen.path(pts, B, 0.9, 1.5);

    // The present moment.
    pen.line(right, top - 8, right, fy + fh, W, 0.18, 1);
    pen.additive(false);
  },
};
