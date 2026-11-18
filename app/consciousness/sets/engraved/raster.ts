import {
  BLUE,
  RED,
  SEPIA,
  hash2,
  label,
  noise1,
  rgba,
  smoothstep,
  stillAt,
  type Engraving,
  type FrameCtx,
} from './plate';

/**
 * Fig. 5: gamma synchrony, engraved as a raster. At the left, thirty
 * neurons: stippled pyramidal somata with their dendrites cut in line, each
 * sending a hairline across the plate. Each spike is an ink tick on its
 * neuron's line; the soma darkens as it fires. Time runs right to left,
 * "now" at the right edge (slowed for display). Firing drifts from
 * scattered to locked to the 25 ms gamma cycle (40 Hz) and back; as it
 * locks, each gamma cycle is washed madder red. The summed field is
 * engraved beneath in Prussian blue. Timing as in the Ink set.
 */

const NEURONS = 30;
const GAMMA_MS = 25;
const WINDOW_MS = 420;
const SPEED = 95;
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

export const raster: Engraving = {
  still: stillAt(8.6),
  labels: () => ({ fig: 'Fig. 5.', title: 'Neurons firing in step, the gamma rhythm' }),
  draw(f: FrameCtx, t: number) {
    const { ctx, ink, wash, w, h, family, frame } = f;
    const phone = w < 640;
    const sz = Math.max(10, Math.min(15, w * 0.019));
    const now = t * SPEED;
    const start = now - WINDOW_MS;

    const outerL = frame.x0 + w * 0.03;
    const right = frame.x1 - w * 0.035;
    const somaW = Math.max(40, w * (phone ? 0.12 : 0.085));
    const left = outerL + somaW;
    const top = h * (phone ? 0.17 : 0.18);
    const bottom = h * 0.63;
    const rowH = (bottom - top) / NEURONS;
    const xOf = (ms: number) => left + ((ms - start) / WINDOW_MS) * (right - left);
    const c0 = Math.floor(start / GAMMA_MS) - 1;
    const c1 = Math.ceil(now / GAMMA_MS) + 1;

    // Gamma cycles, washed as the firing locks to them: each a brushed
    // band whose edges waver.
    const bw = ((GAMMA_MS * 0.36) / WINDOW_MS) * (right - left);
    for (let c = c0; c <= c1; c++) {
      const s = synchrony(c);
      if (s < 0.05) continue;
      const x = xOf(c * GAMMA_MS + GAMMA_MS * 0.42);
      if (x < left - bw || x > right + bw) continue;
      const pts: number[] = [];
      const n = 16;
      const xl = Math.max(left, x - bw / 2);
      const xr = Math.min(right, x + bw / 2);
      if (xr - xl < 1) continue;
      for (let i = 0; i <= n; i++) {
        const y = top - 4 + ((bottom - top + 8) * i) / n;
        pts.push(xl + noise1(i * 0.6, c * 7 + 1) * 1.6, y);
      }
      for (let i = n; i >= 0; i--) {
        const y = top - 4 + ((bottom - top + 8) * i) / n;
        pts.push(xr + noise1(i * 0.6, c * 7 + 2) * 1.6, y);
      }
      wash.poly(pts, RED, 0.42 * s, 1.4);
      // A small cut mark above each locked cycle.
      ink.begin();
      ink.seg(x, top - 9, x, top - 4);
      ink.stroke(0.8 * s, 0.9);
    }

    // Neuron lines: hairlines across the plate.
    ink.begin();
    for (let n = 0; n < NEURONS; n++) {
      const y = top + n * rowH + rowH / 2;
      ink.seg(left - 2, y, right, y);
    }
    ink.stroke(0.13, 0.4);
    // The raster frame.
    ink.begin();
    ink.poly([left, top - 4, right, top - 4, right, bottom + 4, left, bottom + 4], true);
    ink.stroke(0.6, 0.6);

    // Spikes, and a histogram for the summed field.
    const bins = 160;
    const hist = new Float64Array(bins);
    const lastFire = new Float64Array(NEURONS).fill(-1e9);
    ink.begin();
    for (let n = 0; n < NEURONS; n++) {
      const y = top + n * rowH + rowH / 2;
      for (let c = c0; c <= c1; c++) {
        const st = spikeTime(n, c);
        if (st === null || st < start || st > now) continue;
        const x = xOf(st);
        ink.seg(x, y - rowH * 0.4, x, y + rowH * 0.4);
        if (st > lastFire[n]) lastFire[n] = st;
        const bi = Math.floor(((st - start) / WINDOW_MS) * bins);
        if (bi >= 0 && bi < bins) hist[bi] += 1;
      }
    }
    ink.stroke(0.92, Math.max(1.2, Math.min(1.8, w * 0.0014)));

    // Somata: little pyramids, stippled, with an apical dendrite and two
    // basal ones; darkened while freshly fired.
    const sr = Math.max(2.6, Math.min(rowH * 0.62, 7));
    for (let n = 0; n < NEURONS; n++) {
      const y = top + n * rowH + rowH / 2;
      const x = left - somaW * (n % 2 ? 0.3 : 0.62) + (hash2(n, 5) - 0.5) * somaW * 0.12;
      const fresh = Math.exp(-((now - lastFire[n]) / GAMMA_MS) * 1.4);
      const tri = [x - sr, y + sr * 0.7, x + sr, y + sr * 0.7, x + sr * 0.15, y - sr * 1.1];
      ctx.beginPath();
      ctx.moveTo(tri[0], tri[1]);
      ctx.lineTo(tri[2], tri[3]);
      ctx.lineTo(tri[4], tri[5]);
      ctx.closePath();
      ctx.fillStyle = rgba(SEPIA, 0.08 + 0.75 * fresh);
      ctx.fill();
      ink.begin();
      ink.poly(tri, true);
      // Dendrites: apical up-left, basal down-left; the axon runs right.
      const lean = (hash2(n, 9) - 0.5) * 0.6;
      ink.seg(tri[4], tri[5], tri[4] - sr * (1.6 + lean), tri[5] - rowH * 0.5);
      ink.seg(tri[0], tri[1], tri[0] - sr * 1.4, tri[1] + sr * 0.6);
      ink.seg(x - sr * 0.2, tri[1], x - sr * 0.6, tri[1] + sr * 1.1);
      ink.seg(tri[2], y, left - 2, y);
      ink.stroke(0.7, 0.5);
      // Stipple on the shadow side.
      ink.begin();
      for (let k = 0; k < 6; k++) {
        const u = hash2(n * 13 + k, 3);
        const v = hash2(n * 17 + k, 4);
        const px = x + (u - 0.2) * sr * 0.9;
        const py = y + (v - 0.1) * sr * 0.7;
        ink.circle(px, py, 0.35);
      }
      ink.stroke(0.6, 0.7);
      if (fresh > 0.15) wash.blot(x, y, sr * 1.6, sr * 1.4, RED, 0.5 * fresh, n * 3 + 1);
    }

    // The present moment: a fine rule at the right edge.
    ink.begin();
    ink.seg(right, top - 12, right, bottom + 12);
    ink.stroke(0.5, 0.6);
    label(ctx, 'now', right, top - 12 - sz * 0.7, sz * 0.9, family, { align: 'center' });
    label(ctx, 'neurons', outerL, top - 12 - sz * 0.7, sz * 0.9, family, { alpha: 0.75 });

    // The summed field: smoothed population rate, cut in blue.
    const fy = h * (phone ? 0.81 : 0.83);
    const fh = h * 0.1;
    const kernel = [0.06, 0.12, 0.2, 0.24, 0.2, 0.12, 0.06];
    const mean = (NEURONS * 0.43) / (GAMMA_MS / (WINDOW_MS / bins));
    const pts: number[] = [];
    for (let i = 0; i < bins; i++) {
      let v = 0;
      for (let k = 0; k < kernel.length; k++) {
        const j = i + k - 3;
        if (j >= 0 && j < bins) v += hist[j] * kernel[k];
      }
      const y = fy - Math.max(-1.1, Math.min(1.25, (v - mean) / (mean * 3.2))) * fh;
      pts.push(left + ((i + 0.5) / bins) * (right - left), y);
    }
    ink.begin();
    ink.seg(left, fy, right, fy);
    ink.seg(left, fy - fh * 1.2, left, fy + fh * 1.05);
    ink.stroke(0.6, 0.6);
    // Hatching between the curve and the axis, and a wash.
    ink.begin();
    for (let i = 0; i < pts.length; i += 2) ink.seg(pts[i], pts[i + 1], pts[i], fy);
    ink.stroke(0.35, 0.45, BLUE);
    wash.poly([...pts, pts[pts.length - 2], fy, pts[0], fy], BLUE, 0.35, 0.8);
    ink.begin();
    ink.poly(pts);
    ink.stroke(0.95, 1.3, BLUE);
    label(ctx, 'summed field', left + 4, fy - fh * 1.2 - sz * 0.2, sz, family);

    // Scale: one gamma cycle.
    const sx1 = right;
    const sx0 = right - (GAMMA_MS / WINDOW_MS) * (right - left);
    const sby = fy + fh * 1.05 + sz * 0.4;
    ink.begin();
    ink.seg(sx0, sby, sx1, sby);
    ink.seg(sx0, sby - 3, sx0, sby + 3);
    ink.seg(sx1, sby - 3, sx1, sby + 3);
    ink.stroke(0.8, 0.7);
    label(ctx, '25 ms', sx0 - 6, sby, sz * 0.85, family, { align: 'right', alpha: 0.75 });
    label(ctx, '← time', left + 4, sby, sz * 0.85, family, { alpha: 0.65 });

    wash.apply(ctx);
  },
};
