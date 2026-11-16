import type { Pen } from '../pen';
import { A, B, DIM, INK2, W, clamp, rng, smoothstep } from '../palette';
import type { Scene } from './types';

/**
 * Track 03. A stretch of microtubule wall, unrolled: rows are protofilaments,
 * α- and β-tubulin alternate along each row, and each row is shifted by the
 * lattice's helical offset. A collective oscillation runs through it
 * (modelled, slowed for display). Anesthetic molecules drift in, settle in
 * pockets between α and β, and damp the oscillation nearby; then wash out.
 * The trace below sums the lattice.
 */

const CYCLE = 14;
const ROWS = 7;
const MOLECULES = 16;
const FREQ = 1.4;

const r = rng(303);
const molecules = Array.from({ length: MOLECULES }, (_, i) => ({
  // Fractions of the lattice box; resolved to pixels at draw time.
  site: r(),
  row: Math.floor(r() * ROWS),
  fromX: r(),
  fromTop: r() < 0.5,
  toX: r(),
  toTop: r() < 0.5,
  enter: 1.4 + i * 0.36 + r() * 0.3,
  leave: 8.6 + i * 0.16 + r() * 0.4,
  wob: r() * 6.28,
}));
const TRAVEL = 1.9;

function occupancy(m: (typeof molecules)[number], tc: number) {
  return (
    smoothstep(m.enter + TRAVEL - 0.35, m.enter + TRAVEL, tc) *
    (1 - smoothstep(m.leave, m.leave + 0.35, tc))
  );
}

function globalAmplitude(tc: number) {
  let occ = 0;
  for (const m of molecules) occ += occupancy(m, tc);
  return 1 - 0.86 * (occ / MOLECULES);
}

export const anesthesia: Scene = {
  still: 7.4,
  draw(pen: Pen, t: number) {
    const { w, h } = pen;
    const tc = ((t % CYCLE) + CYCLE) % CYCLE;
    const top = h * 0.17;
    const bottom = h * 0.63;
    const left = w * 0.04;
    const right = w * 0.96;
    // The wall is seen side-on: rows sit on a cylinder, so rows near its
    // edges crowd together and dim, as the far protofilaments would.
    const mid = (top + bottom) / 2;
    const rcyl = (bottom - top) / 2;
    const rr = rcyl * 0.16;
    const step = rr * 2.35;
    const shift = step * 0.23;
    const cols = Math.floor((right - left) / step) + 2;
    const rowAngle = (row: number) => -1.05 + (2.1 * row) / (ROWS - 1);
    const rowY = (row: number) => mid + rcyl * 0.92 * Math.sin(rowAngle(row));
    const rowFacing = (row: number) => Math.cos(rowAngle(row));

    // The cylinder's silhouette.
    pen.additive(true);
    pen.line(left - rr, mid - rcyl * 1.04, right + rr, mid - rcyl * 1.04, W, 0.16, 1);
    pen.line(left - rr, mid + rcyl * 1.04, right + rr, mid + rcyl * 1.04, W, 0.16, 1);
    pen.additive(false);

    // Where each molecule is, and its pocket.
    const placed = molecules.map((m) => {
      const col = Math.floor(m.site * (cols / 2 - 2)) * 2 + 1;
      const px = left + col * step + m.row * shift - (cols * shift) / 2 + step * 0.5;
      const py = rowY(m.row);
      const sx = left + m.fromX * (right - left);
      const sy = m.fromTop ? -10 : h * 0.72;
      const ex = left + m.toX * (right - left);
      const ey = m.toTop ? -10 : h * 0.72;
      const at = (time: number) => {
        let x: number;
        let y: number;
        let vis = 1;
        if (time < m.enter) return null;
        if (time < m.enter + TRAVEL) {
          const f = smoothstep(0, 1, (time - m.enter) / TRAVEL);
          x = sx + (px - sx) * f + Math.sin(time * 5 + m.wob) * 6 * (1 - f);
          y = sy + (py - sy) * f + Math.cos(time * 4 + m.wob) * 5 * (1 - f);
          vis = smoothstep(0, 0.25, (time - m.enter) / TRAVEL);
        } else if (time < m.leave) {
          x = px + Math.sin(time * 9 + m.wob) * 0.8;
          y = py + Math.cos(time * 8 + m.wob) * 0.8;
        } else if (time < m.leave + TRAVEL) {
          const f = smoothstep(0, 1, (time - m.leave) / TRAVEL);
          x = px + (ex - px) * f + Math.sin(time * 5 + m.wob) * 6 * f;
          y = py + (ey - py) * f + Math.cos(time * 4 + m.wob) * 5 * f;
          vis = 1 - smoothstep(0.75, 1, f);
        } else return null;
        return { x, y, vis };
      };
      return { m, px, py, at, occ: occupancy(m, tc) };
    });

    // The lattice: monomers, with the oscillation's glow.
    const omega = Math.PI * 2 * FREQ;
    const k = (Math.PI * 2) / (w * 0.45);
    const sigma2 = (rr * 3.4) ** 2;
    // Back rows first, so the rows facing us sit on top.
    const order = Array.from({ length: ROWS }, (_, i) => i).sort(
      (p, q) => rowFacing(p) - rowFacing(q)
    );
    for (const row of order) {
      const y = rowY(row);
      for (let c = 0; c < cols; c++) {
        const x = left + c * step + row * shift - (cols * shift) / 2;
        if (x < left - rr || x > right + rr) continue;
        let damp = 0;
        for (const p of placed) {
          if (p.occ <= 0) continue;
          const d2 = (x - p.px) ** 2 + (y - p.py) ** 2;
          damp += p.occ * Math.exp(-d2 / sigma2);
        }
        const amp = clamp(1 - 0.92 * damp, 0.06, 1);
        const b = amp * (0.5 + 0.5 * Math.sin(omega * t - k * x));
        const alpha = c % 2 === 0;
        const face = rowFacing(row);
        const mr = rr * (0.62 + 0.38 * face);
        const lum = 0.35 + 0.65 * face;
        pen.additive(false);
        pen.circle(x, y, mr, INK2, 1);
        pen.additive(true);
        pen.glow(x, y, mr * 2, A, (0.06 + 0.42 * b) * lum);
        pen.ring(x, y, mr * 0.9, W, (alpha ? 0.55 : 0.28) * lum, 1);
        if (alpha) pen.circle(x, y, mr * 0.2, W, 0.4 * lum);
      }
    }

    // Molecules, with short trails.
    for (const p of placed) {
      for (let s = 5; s >= 0; s--) {
        const q = p.at(tc - s * 0.045);
        if (!q) continue;
        const fade = (1 - s / 6) * q.vis;
        if (s === 0) {
          pen.glow(q.x, q.y, rr * 1.2, B, 0.55 * fade);
          pen.circle(q.x, q.y, Math.max(2, rr * 0.22), B, 0.95 * fade);
        } else {
          pen.circle(q.x, q.y, Math.max(1, rr * 0.12), B, 0.28 * fade);
        }
      }
    }

    // The summed trace.
    const ty = h * 0.82;
    const th = h * 0.1;
    const window = 5;
    const n = Math.round(240 * pen.detail);
    const tl = left;
    const tr = right;
    pen.line(tl, ty, tr, ty, DIM, 0.22, 1);
    const pts: number[] = [];
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      const tt = t - window + f * window;
      const ttc = ((tt % CYCLE) + CYCLE) % CYCLE;
      const v = globalAmplitude(ttc) * Math.sin(omega * tt);
      pts.push(tl + f * (tr - tl), ty - v * th);
    }
    pen.path(pts, A, 0.9, 1.5);
    const g = globalAmplitude(tc);
    pen.glow(tr, ty - g * Math.sin(omega * t) * th, 10, A, 0.7);
    pen.additive(false);
  },
};
