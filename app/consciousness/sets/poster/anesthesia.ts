import { rng, smoothstep } from '../../visuals/palette';
import { INK, LETTER_FONT, RGB, rgba } from './inks';
import type { PaperFigure } from './paperFigure';

/**
 * Q1, anesthesia, after the Spectral set's figure, printed. A stretch of
 * microtubule wall, unrolled: rows are protofilaments, α and β tubulin
 * alternate along each row, each row shifted by the lattice's helical
 * offset. A collective oscillation runs through it as a travelling wave,
 * printed as a blue halftone that swells under each crest and tints the
 * beads it passes (modelled, slowed for display). Anesthetic molecules,
 * pink discs marked "A", drift in and settle in pockets between α and β,
 * damping the wave around them; once a few have bound, the whole
 * oscillation collapses within a fraction of a second, and the trace below
 * (the summed lattice, standing for consciousness) drops to a flat line.
 * When they wash out, it returns.
 */

const CYCLE = 14;
const ROWS = 9;
const N = 16;
const FREQ = 1.4;
const TAU = Math.PI * 2;
/** Bound molecules at which the collapse starts and is complete. */
const COLLAPSE_FROM = 1.4;
const COLLAPSE_TO = 2.9;
/** After this (cycle seconds) the molecules are leaving. */
const WASH_OUT = 8.5;

const r = rng(303);
const MOLS = Array.from({ length: N }, (_, i) => ({
  site: r(),
  row: Math.floor(r() * ROWS),
  fromX: r(),
  fromTop: r() < 0.5,
  toX: r(),
  toTop: r() < 0.5,
  enter: 1.2 + i * 0.36 + r() * 0.3,
  leave: 8.8 + i * 0.16 + r() * 0.4,
  wob: r() * 6.28,
}));

const ease = (x: number) => smoothstep(0, 1, x);
const cyc = (t: number) => ((t % CYCLE) + CYCLE) % CYCLE;

const settledAt = (m: (typeof MOLS)[number], tc: number) =>
  smoothstep(m.enter + 1.2, m.enter + 1.6, tc) * (1 - smoothstep(m.leave, m.leave + 0.5, tc));

/**
 * 0 = awake, 1 = the oscillation has collapsed: steeply as the first few
 * molecules bind, more gently as the last ones wash out.
 */
function collapse(tc: number) {
  let bound = 0;
  for (const m of MOLS) bound += settledAt(m, tc);
  return tc < WASH_OUT ? smoothstep(COLLAPSE_FROM, COLLAPSE_TO, bound) : smoothstep(0, 4.5, bound);
}

// Per-frame scratch.
const MX = new Float32Array(N);
const MY = new Float32Array(N);
const MP = new Float32Array(N);
const MS = new Float32Array(N);

export const anesthesia: PaperFigure = {
  still: 4.1,
  create() {
    return (ctx, w, h, t) => {
      const tc = cyc(t);
      const top = h * 0.08;
      const bottom = h * 0.62;
      const rowH = (bottom - top) / ROWS;
      const pitch = rowH * 0.95;
      const x0 = w * 0.04;
      const cols = Math.floor((w - 2 * x0) / pitch / 2) - 1;
      const awake = 1 - 0.94 * collapse(tc);

      // Where each molecule is, how present, how settled.
      MOLS.forEach((m, i) => {
        const j = 2 * Math.floor(m.site * cols) + 1;
        const px = x0 + (j + (m.row * 3) / 13) * pitch;
        const py = top + (m.row + 0.5) * rowH;
        const sx = m.fromX * w;
        const sy = m.fromTop ? -20 : bottom + 30;
        const ex = m.toX * w;
        const ey = m.toTop ? -20 : bottom + 30;
        const a = ease((tc - m.enter) / 1.5);
        const b = ease((tc - m.leave) / 1.4);
        const wobble = (1 - a + b) * 10 * Math.sin(tc * 1.7 + m.wob);
        MX[i] = sx + (px - sx) * a + (ex - px) * b;
        MY[i] = sy + (py - sy) * a + (ey - py) * b + wobble;
        MP[i] =
          smoothstep(m.enter - 0.2, m.enter + 0.4, tc) *
          (1 - smoothstep(m.leave + 0.9, m.leave + 1.4, tc));
        MS[i] = settledAt(m, tc);
      });
      const reach = pitch * pitch * 5.5;
      const amp = (x: number, y: number) => {
        let d = 0;
        for (let i = 0; i < N; i++) {
          if (MS[i] < 0.01) continue;
          const dx = x - MX[i];
          const dy = y - MY[i];
          d += MS[i] * Math.exp(-(dx * dx + dy * dy) / reach);
        }
        return awake * (1 - 0.9 * Math.min(1, d));
      };
      const fadeX = (x: number) =>
        smoothstep(x0 - pitch, x0 + pitch * 2, x) *
        (1 - smoothstep(w - x0 - pitch * 2, w - x0 + pitch, x));

      // The oscillation as a halftone under the lattice: dots swell with
      // the wave, on a staggered screen like a print's.
      const cell = Math.max(4.5, pitch * 0.34);
      ctx.fillStyle = rgba(RGB.blue, 0.42);
      ctx.beginPath();
      for (let gy = 0, y = top - rowH * 0.3; y < bottom + rowH * 0.3; gy++, y += cell * 0.87) {
        for (let x = x0 + (gy % 2) * cell * 0.5; x < w - x0; x += cell) {
          const kf = (y - top) / rowH - 0.5;
          const phase = TAU * (FREQ * t - ((x - x0) / pitch - (kf * 3) / 13) * 0.085) + kf * 0.35;
          const f = Math.pow(0.5 + 0.5 * Math.cos(phase), 3) * amp(x, y) * fadeX(x);
          const rad = cell * 0.44 * Math.sqrt(f);
          if (rad < 0.3) continue;
          ctx.moveTo(x + rad, y);
          ctx.arc(x, y, rad, 0, TAU);
        }
      }
      ctx.fill();

      // The wall: tubulin beads, yellow knock-outs ringed in indigo, tinted
      // blue as a crest passes through them.
      for (let k = 0; k < ROWS; k++) {
        const yc = top + (k + 0.5) * rowH;
        for (let j = -1; j <= cols * 2 + 2; j++) {
          const x = x0 + (j + (k * 3) / 13) * pitch;
          const fx = fadeX(x);
          if (fx < 0.02) continue;
          const isA = (j & 1) === 0;
          const br = pitch * (isA ? 0.34 : 0.3);
          const phase = TAU * (FREQ * t - (j + (k * 3) / 13) * 0.085) + k * 0.35;
          const crest = 0.5 + 0.5 * Math.cos(phase);
          const glow = crest * crest * amp(x, yc);
          ctx.globalAlpha = fx;
          ctx.fillStyle = isA ? INK.knock : INK.knockLight;
          ctx.beginPath();
          ctx.arc(x, yc, br, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = rgba(RGB.indigo, 0.55);
          ctx.lineWidth = 0.9;
          ctx.stroke();
          // A crest prints as a solid blue core that swells and shrinks.
          const core = br * 0.68 * Math.sqrt(glow);
          if (core > 0.4) {
            ctx.fillStyle = INK.blue;
            ctx.beginPath();
            ctx.arc(x, yc, core, 0, TAU);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;

      // The anesthetic: pink discs marked "A". A dashed ring shows the
      // reach of each one that has bound.
      const mr = pitch * 0.38;
      ctx.font = `800 ${Math.round(mr * 1.35)}px ${LETTER_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < N; i++) {
        if (MP[i] < 0.01) continue;
        if (MS[i] > 0.02) {
          ctx.strokeStyle = rgba(RGB.pink, MS[i] * 0.7);
          ctx.lineWidth = 1;
          ctx.setLineDash([2.5, 3]);
          ctx.beginPath();
          ctx.arc(MX[i], MY[i], pitch * 0.82, 0, TAU);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.globalAlpha = MP[i];
        ctx.fillStyle = INK.pink;
        ctx.beginPath();
        ctx.arc(MX[i], MY[i], mr, 0, TAU);
        ctx.fill();
        ctx.fillStyle = INK.paper;
        ctx.fillText('A', MX[i], MY[i] + mr * 0.06);
        ctx.globalAlpha = 1;
      }

      // The trace: the summed oscillation over the last 3 s, now at the
      // right. It stands for consciousness, and drops flat as the
      // oscillation collapses.
      const tl = w * 0.06;
      const tr = w * 0.94;
      const base = h * 0.82;
      const th = h * 0.09;
      ctx.strokeStyle = rgba(RGB.indigo, 0.35);
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(tl, base);
      ctx.lineTo(tr, base);
      ctx.stroke();
      const STEPS = Math.max(120, Math.round((tr - tl) / 2));
      ctx.strokeStyle = INK.blue;
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      let hy = base;
      for (let s = 0; s <= STEPS; s++) {
        const f = s / STEPS;
        const tau = t - 3 * (1 - f);
        const A = 1 - 0.97 * collapse(cyc(tau));
        const y = base - th * A * Math.cos(TAU * FREQ * tau);
        const x = tl + f * (tr - tl);
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        hy = y;
      }
      ctx.stroke();
      ctx.fillStyle = INK.blue;
      ctx.beginPath();
      ctx.arc(tr, hy, 3, 0, TAU);
      ctx.fill();
    };
  },
};
