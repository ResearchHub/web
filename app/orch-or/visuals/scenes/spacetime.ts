import type { Pen, Rgb } from '../pen';
import { A, B, DIM, W, clamp, fract, hash2, mix, smoothstep } from '../palette';
import type { Scene } from './types';

/**
 * Track 04. A mass in superposition of two places bends spacetime two ways at
 * once: two tinted grids, each dented by the mass in one of its places.
 * Penrose proposes the difference is unstable. The bar at the right
 * accumulates E_G·t/ħ, the gravitational self-energy of the difference
 * times the time elapsed; when it reaches 1 (t ≈ τ = ħ/E_G) one geometry
 * wins (white) and the other vanishes. Which one is random.
 */

const CYCLE = 8.5;
const COLLAPSE = 0.64;
const SEP = 0.34;

const split = (p: number) => smoothstep(0.06, 0.52, Math.min(p, COLLAPSE));

// ∫ split² dp up to each phase, normalised so the gauge reaches 1 at collapse.
const GAUGE_STEPS = 256;
const gaugeTable = (() => {
  const table = new Float64Array(GAUGE_STEPS + 1);
  let acc = 0;
  for (let i = 1; i <= GAUGE_STEPS; i++) {
    const p = (i / GAUGE_STEPS) * COLLAPSE;
    acc += split(p) ** 2 * (COLLAPSE / GAUGE_STEPS);
    table[i] = acc;
  }
  for (let i = 0; i <= GAUGE_STEPS; i++) table[i] /= acc;
  return table;
})();
const gauge = (p: number) =>
  p >= COLLAPSE ? 1 : gaugeTable[Math.round((p / COLLAPSE) * GAUGE_STEPS)];

function well(u: number, v: number, mu: number, mv: number) {
  const d2 = (u - mu) ** 2 + ((v - mv) * 1.15) ** 2;
  return Math.exp(-d2 / 0.05) * 0.75 + Math.exp(-d2 / 0.35) * 0.45;
}

export const spacetime: Scene = {
  still: 4.2,
  draw(pen: Pen, t: number) {
    const { w, h } = pen;
    const p = fract(t / CYCLE);
    const cycle = Math.floor(t / CYCLE);
    const winner = hash2(cycle, 41) < 0.5 ? -1 : 1;
    const collapsed = p >= COLLAPSE;
    const s = split(p);
    // After the reduction the surviving mass drifts back to centre.
    const settle = smoothstep(0.82, 0.99, p);

    const cx = w * 0.47;
    const horizon = h * 0.2;
    const planeH = h * 0.62;
    const halfW = Math.min(w * 0.46, h * 0.95);
    const depthPx = h * 0.2;
    const project = (u: number, v: number, dip: number): [number, number] => {
      const near = (v + 1) / 2; // 0 far, 1 near
      const sc = 0.55 + 0.45 * near;
      return [cx + u * halfW * sc, horizon + near * planeH + dip * depthPx * sc];
    };

    type Geometry = { mu: number; color: Rgb; alpha: number };
    const geos: Geometry[] = [];
    if (!collapsed) {
      geos.push({ mu: -SEP * s, color: A, alpha: 0.55 });
      geos.push({ mu: SEP * s, color: B, alpha: 0.55 });
    } else {
      const flash = Math.exp(-(p - COLLAPSE) * CYCLE * 2.4);
      const loser = 1 - smoothstep(COLLAPSE, COLLAPSE + 0.025, p);
      const winColor = mix(winner < 0 ? A : B, W, smoothstep(COLLAPSE, COLLAPSE + 0.05, p));
      const mu = winner * SEP * (1 - settle);
      geos.push({ mu, color: winColor, alpha: 0.6 + 0.4 * flash });
      if (loser > 0)
        geos.push({ mu: -winner * SEP, color: winner < 0 ? B : A, alpha: 0.55 * loser });
    }

    pen.additive(true);
    const nu = Math.round(46 * Math.max(0.6, pen.detail));
    const lines = 17;
    for (const g of geos) {
      // Lines of constant v (receding rows).
      for (let j = 0; j < lines; j++) {
        const v = -1 + (2 * j) / (lines - 1);
        const pts: number[] = [];
        for (let i = 0; i <= nu; i++) {
          const u = -1 + (2 * i) / nu;
          pts.push(...project(u, v, well(u, v, g.mu, 0)));
        }
        const fade = 0.3 + 0.7 * ((v + 1) / 2);
        pen.path(pts, g.color, g.alpha * fade * 0.8, 1);
      }
      // Lines of constant u.
      for (let i = 0; i < 25; i++) {
        const u = -1 + (2 * i) / 24;
        const pts: number[] = [];
        for (let j = 0; j <= nu; j++) {
          const v = -1 + (2 * j) / nu;
          pts.push(...project(u, v, well(u, v, g.mu, 0)));
        }
        pen.path(pts, g.color, g.alpha * 0.5, 1);
      }
      // The mass, resting in its dent.
      const [mx, my] = project(g.mu, 0, well(g.mu, 0, g.mu, 0));
      const r = h * 0.035;
      pen.glow(mx, my - r * 0.9, r * 4, g.color, 0.35 * g.alpha);
      pen.circle(mx, my - r * 0.9, r, g.color, 0.85 * g.alpha);
    }

    // The reduction: a ring running out across the surviving geometry.
    if (collapsed) {
      const age = (p - COLLAPSE) * CYCLE;
      const rho = age * 0.55;
      const a = Math.exp(-age * 1.4);
      const mu = winner * SEP * (1 - settle);
      const pts: number[] = [];
      for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * Math.PI * 2;
        const u = mu + Math.cos(th) * rho;
        const v = Math.sin(th) * rho;
        if (Math.abs(u) > 1 || Math.abs(v) > 1) {
          pts.push(...project(clamp(u, -1, 1), clamp(v, -1, 1), 0));
        } else pts.push(...project(u, v, well(u, v, mu, 0)));
      }
      pen.path(pts, W, a * 0.8, 1.6);
    }

    // The gauge: E_G·t/ħ accumulating towards 1.
    const gx = w * 0.95;
    const gTop = h * 0.2;
    const gBot = h * 0.82;
    const gv = collapsed ? 1 - smoothstep(COLLAPSE + 0.02, 0.8, p) : gauge(p);
    pen.line(gx, gTop, gx, gBot, DIM, 0.3, 1);
    pen.line(gx - 7, gTop, gx + 7, gTop, W, 0.7, 1.2);
    pen.line(gx, gBot, gx, gBot - (gBot - gTop) * gv, collapsed ? W : mix(A, B, 0.5), 0.9, 3);
    pen.glow(gx, gBot - (gBot - gTop) * gv, 12, collapsed ? W : mix(A, B, 0.5), 0.6);
    pen.additive(false);
  },
};
