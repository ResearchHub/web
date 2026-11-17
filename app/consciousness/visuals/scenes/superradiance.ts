import type { Pen, Rgb } from '../pen';
import { A, B, DIM, INK2, W, clamp, rng, smoothstep } from '../palette';
import type { Scene } from './types';

/**
 * Quantum states in microtubules: superradiance, as a scientist would sketch
 * it. A microtubule seen from the side, its cut end open so the ring of 13
 * protofilaments around the hollow core shows. Each tubulin carries
 * tryptophan.
 *
 * First the tryptophans emit independently: scattered, dim flashes, and the
 * trace below decays slowly (blue). Then an excitation spreads along the
 * tube, every site oscillates in step, and they emit together: one bright,
 * fast burst (gold), N times brighter and N times shorter. The trace keeps
 * both curves, so the comparison stays on screen. Schematic: numbers of
 * sites and timings are illustrative.
 */

const CYCLE = 10;
const PF = 13; // protofilaments
const IND_START = 0.3; // independent emission begins
const IND_TAU = 1.3; // independent lifetime (display seconds)
const WAVE_START = 4.6; // excitation spreads along the tube
const WAVE_DUR = 0.7;
const BURST = 5.6; // collective emission
const BURST_TAU = 0.26;
const TRACE_T = 3; // seconds shown on the trace

interface Site {
  k: number; // protofilament
  j: number; // monomer along it
  emit: number; // independent emission time
}

const r = rng(1013);
// Enough monomers for the longest layout; trimmed per frame by length.
const SITES: Site[] = [];
for (let k = 0; k < PF; k++) {
  for (let j = 0; j < 40; j++) {
    SITES.push({ k, j, emit: IND_START - Math.log(1 - r() * 0.98) * IND_TAU });
  }
}

const indCurve = (tau: number) => (tau < 0 ? 0 : 0.3 * Math.exp(-tau / IND_TAU));
const burstCurve = (tau: number) =>
  tau < -0.06 ? 0 : tau < 0 ? 0.95 * smoothstep(-0.06, 0, tau) : 0.95 * Math.exp(-tau / BURST_TAU);

export const superradiance: Scene = {
  still: 5.8,
  draw(pen: Pen, t: number) {
    const { w, h } = pen;
    const tc = ((t % CYCLE) + CYCLE) % CYCLE;
    // Everything fades out together before the loop restarts.
    const out = 1 - smoothstep(CYCLE - 0.8, CYCLE - 0.1, tc);

    // The tube: axis horizontal, viewed a little from the left so the cut
    // end shows as an ellipse. Tubulin monomers are beads on its surface,
    // bright on the near wall and faint on the far one.
    const R = Math.min(h * 0.19, w * 0.135);
    const cy = h * 0.34;
    const skew = 0.42;
    const x0 = w * 0.08 + R * skew + R * 0.2;
    const len = w * 0.95 - x0;
    const s = R * 0.3; // one tubulin monomer, 4 nm against a 25 nm tube
    const mr = s * 0.34;
    const roll = 0.25;
    const project = (u: number, th: number) => {
      const z = Math.cos(th);
      return { x: x0 + u - skew * R * z, y: cy + R * Math.sin(th), z };
    };
    const tailOf = (u: number) => 1 - smoothstep(len * 0.62, len, u);

    // Collective state.
    const front = x0 + clamp((tc - WAVE_START) / WAVE_DUR) * len;
    const inPhase = tc >= WAVE_START && tc < BURST + 0.9;
    const pulse = 0.5 + 0.5 * Math.sin((tc - WAVE_START) * Math.PI * 2 * 2.2);
    const flash = tc >= BURST ? Math.exp(-(tc - BURST) / BURST_TAU) : 0;
    const build = smoothstep(WAVE_START, BURST, tc) * (tc < BURST ? 1 : 0);
    const settle = 1 - smoothstep(BURST + 0.5, BURST + 0.9, tc);

    pen.additive(true);
    const beads = (near: boolean) => {
      for (const site of SITES) {
        const th = (site.k / PF) * Math.PI * 2 + roll;
        const u = site.j * s + (site.k * 3 * s) / PF;
        if (u > len) continue;
        const p = project(u, th);
        if (p.z >= 0 !== near) continue;
        const depth = 0.5 + 0.5 * p.z; // 0 far, 1 near
        const lum = (0.15 + 0.85 * depth * depth) * tailOf(u) * out;
        if (lum <= 0.01) continue;
        const isAlpha = site.j % 2 === 0;
        const rad = mr * (0.75 + 0.35 * depth);
        pen.circle(p.x, p.y, rad, W, (isAlpha ? 0.62 : 0.36) * lum);

        // On its own: each site flashes on its own clock.
        const age = tc - site.emit;
        if (age >= 0 && age < 0.45 && tc < WAVE_START) {
          const f = 1 - age / 0.45;
          pen.glow(p.x, p.y, rad * 5, B, 0.9 * f * lum);
          pen.circle(p.x, p.y, rad * 0.8, B, f * lum);
        }

        // In step: lit by the passing excitation, all at one phase.
        if (inPhase && p.x <= front) {
          const lit = smoothstep(front, front - len * 0.1, p.x);
          const a = ((0.18 + 0.3 * pulse * (0.4 + build)) * (1 - flash) * lit + flash) * settle;
          pen.glow(p.x, p.y, rad * (3 + 1.5 * flash), A, a * lum * (1 - 0.45 * flash));
          pen.circle(p.x, p.y, rad * 0.9, A, Math.min(1, a * 1.4) * lum);
        }
      }
    };

    // Far wall, then the outline, the cut end and the near wall on top.
    beads(false);
    const edge = (sign: number) => {
      const steps = 24;
      for (let i = 0; i < steps; i++) {
        const u1 = (len * i) / steps;
        const u2 = (len * (i + 1)) / steps;
        const y = cy + sign * R * 1.08;
        pen.line(x0 + u1, y, x0 + u2, y, W, 0.22 * tailOf(u2) * out, 1);
      }
    };
    edge(-1);
    edge(1);

    // The cut end: 13 protofilaments round the hollow core.
    const ell = (rx: number, ry: number, c: Rgb, a: number, width: number) => {
      const pts: number[] = [];
      for (let i = 0; i <= 64; i++) {
        const t2 = (i / 64) * Math.PI * 2;
        pts.push(x0 - rx * Math.cos(t2), cy + ry * Math.sin(t2));
      }
      pen.path(pts, c, a, width, { closed: true });
    };
    ell(skew * R * 1.08, R * 1.08, W, 0.3 * out, 1);
    ell(skew * R * 0.78, R * 0.78, W, 0.14 * out, 1);
    for (let k = 0; k < PF; k++) {
      const th = (k / PF) * Math.PI * 2 + roll;
      const p = project(0, th);
      pen.additive(false);
      pen.circle(p.x, p.y, mr * 1.5, INK2, out);
      pen.additive(true);
      pen.ring(p.x, p.y, mr * 1.5, W, 0.9 * out, 1.4);
      pen.circle(p.x, p.y, mr * 0.45, W, 0.6 * out);
    }

    beads(true);

    // The burst: the whole tube flares and one wavefront leaves it.
    if (flash > 0.01) {
      pen.additive(true);
      for (let i = 0; i <= 8; i++) {
        const x = x0 + (len * 0.7 * i) / 8;
        pen.glow(x, cy, R * 2.2, A, 0.14 * flash * out);
      }
      const age = tc - BURST;
      const grow = age * w * 0.4;
      const pts: number[] = [];
      for (let i = 0; i <= 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        pts.push(
          x0 + len * 0.36 + Math.cos(a) * (len * 0.42 + grow),
          cy + Math.sin(a) * (R * 1.25 + grow * 0.6)
        );
      }
      pen.path(pts, A, 0.5 * Math.exp(-age / 0.35) * out, 1.2, { closed: true });
    }

    // The trace: emitted intensity against time, both curves on one axis.
    pen.additive(true);
    const left = w * 0.08;
    const right = w * 0.95;
    const base = h * 0.92;
    const height = h * 0.24;
    const xOf = (tau: number) => left + (clamp(tau, 0, TRACE_T) / TRACE_T) * (right - left);
    pen.line(left, base, right, base, DIM, 0.4 * out, 1);
    pen.line(left, base, left, base - height * 1.05, DIM, 0.4 * out, 1);
    const n = Math.round(160 * pen.detail);
    const curve = (
      f: (tau: number) => number,
      upTo: number,
      color: Rgb,
      alpha: number,
      from = 0
    ) => {
      if (upTo <= from) return;
      const pts: number[] = [];
      for (let i = 0; i <= n; i++) {
        const tau = from + ((upTo - from) * i) / n;
        pts.push(xOf(tau), base - f(tau) * height);
      }
      pen.path(pts, color, alpha * out, 1.6);
      const end = Math.min(upTo, TRACE_T);
      if (upTo < TRACE_T) pen.glow(xOf(end), base - f(end) * height, 9, color, 0.8 * out);
    };
    curve(indCurve, Math.min(TRACE_T, tc - IND_START), B, 0.95);
    curve(burstCurve, Math.min(TRACE_T, tc - BURST), A, 0.95, -0.06);
    pen.additive(false);
  },
};
