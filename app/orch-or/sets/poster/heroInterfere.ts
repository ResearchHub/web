import { hexToRgb } from '../../theme';
import { hash2 } from '../../visuals/palette';
import { INK, T, rgba, tint } from './inks';
import { clamp, phoneArt, smoothstep } from './heroKit';
import { drawMoment, drawWaves, gridDots, momentKind, type Dot } from './superKit';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate Q, "Interference": two waves spreading from two points,
 * one printed blue, one pink, as halftone. Where their crests meet the dots
 * overprint indigo, and the interference pattern appears out of the
 * overlap. Then the state reduces: the whole pattern pulls into a single
 * point, which flares, and a moment of experience rises out of it. The
 * waves start again. Every 7 s.
 */

const CYCLE = 7;
const C0 = 0.6;
const C1 = 0.7;

interface Plate {
  key: string;
  dots: Dot[];
  cell: number;
  cx: number;
  cy: number;
  R: number;
  s1: [number, number];
  s2: [number, number];
  f: number;
  wide: boolean;
}

function bake(w: number, h: number): Plate {
  const wide = w >= h;
  const top = phoneArt(w, h);
  const R = wide ? clamp(Math.min(h * 0.36, w * 0.21), 140, 300) : clamp(top * 0.31, 85, 130);
  const cx = wide ? w * 0.77 : w * 0.5;
  const cy = wide ? h * 0.54 : top * 0.7;
  const cell = wide ? clamp(R * 0.05, 9, 15) : 8;
  const dots = gridDots(cx, cy, R * 1.5, cell, -0.3, (x, y) => Math.hypot(x - cx, y - cy) < R);
  // The two sources, close together on the field's lower left.
  const sx = cx - R * 0.55;
  const sy = cy + R * 0.25;
  const gap = R * 0.22;
  return {
    key: `${w}x${h}`,
    dots,
    cell,
    cx,
    cy,
    R,
    s1: [sx - gap * 0.35, sy - gap * 0.94],
    s2: [sx + gap * 0.35, sy + gap * 0.94],
    f: wide ? clamp(R * 0.3, 50, 88) : 40,
    wide,
  };
}

export const heroInterfere: PaperFigure = {
  // The pattern fully formed, before it reduces.
  still: CYCLE + 0.45 * CYCLE,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t) => {
      if (!plate || plate.key !== `${w}x${h}`) plate = bake(w, h);
      const P = plate;
      const n = Math.floor(t / CYCLE);
      const p = t / CYCLE - n;
      const { cx, cy, R, cell } = P;
      // The point it reduces to: somewhere in the field's upper right half.
      const xr = cx + (0.05 + hash2(n, 3) * 0.4) * R;
      const yr = cy + (hash2(n, 4) - 0.65) * R * 0.6;
      const c = smoothstep(C0, C1, p);
      const flash = p < C1 - 0.02 ? 0 : Math.exp(-((p - C1 + 0.02) * CYCLE) / 0.5);
      // Fronts spreading from the sources at the start of each cycle.
      const RESTART = 0.76;
      const front = ((p - RESTART + 1) % 1) * CYCLE * R * 0.75;
      const reducing = p >= C0 && p < RESTART;
      const acc = hexToRgb(T.accent);

      ctx.globalCompositeOperation = 'multiply';
      // A warm ground for the field.
      ctx.fillStyle = tint(T.accent, 0.16);
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.02, 0, Math.PI * 2);
      ctx.fill();

      const lambda = R * 0.2;
      drawWaves(ctx, P.dots, cell, {
        s1: P.s1,
        s2: P.s2,
        lambda,
        t,
        weight: (x, y) => {
          const edge = 1 - smoothstep(R * 0.72, R, Math.hypot(x - cx, y - cy));
          const r = Math.min(
            Math.hypot(x - P.s1[0], y - P.s1[1]),
            Math.hypot(x - P.s2[0], y - P.s2[1])
          );
          const reached = 1 - smoothstep(front - lambda, front, r);
          // Pulling into one point.
          const d = Math.hypot(x - xr, y - yr);
          const pull = reducing ? Math.exp(-((d / (R * (0.02 + 2 * (1 - c) ** 2))) ** 2)) : 1;
          return edge * reached * pull * (p > C1 + 0.02 && p < RESTART ? 0 : 1);
        },
      });

      // The sources.
      ctx.fillStyle = INK.indigo;
      for (const s of [P.s1, P.s2]) {
        ctx.beginPath();
        ctx.arc(s[0], s[1], cell * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // The reduction: a flare and an indigo point.
      if (flash > 0.01) {
        const gr = R * 0.5;
        const glow = ctx.createRadialGradient(xr, yr, 0, xr, yr, gr);
        glow.addColorStop(0, rgba(acc, 0.9 * flash));
        glow.addColorStop(1, rgba(acc, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(xr - gr, yr - gr, gr * 2, gr * 2);
      }
      const pointA = c * (1 - smoothstep(0.8, 0.95, p));
      if (pointA > 0.01) {
        ctx.fillStyle = INK.indigo;
        ctx.globalAlpha = pointA;
        ctx.beginPath();
        ctx.arc(xr, yr, cell * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // The moments that came out of the last reductions.
      for (let k = 2; k >= 0; k--) {
        const id = n - k;
        const age = (t - (id * CYCLE + C1 * CYCLE)) / CYCLE;
        if (age < 0 || age > 2) continue;
        const bx = cx + (0.05 + hash2(id, 3) * 0.4) * R;
        const by = cy + (hash2(id, 4) - 0.65) * R * 0.6;
        const rise = 1 - Math.exp(-age * 1.8);
        const x = bx + rise * R * 0.1;
        const y = by - P.f * 0.2 - rise * R * (P.wide ? 0.7 : 0.45);
        const alpha = smoothstep(0, 0.06, age) * (1 - smoothstep(1.1, 2, age));
        const off = (1 - smoothstep(0.03, 0.18, age)) * clamp(P.f * 0.11, 4, 8);
        drawMoment(
          ctx,
          x,
          y,
          P.f * (0.6 + 0.4 * smoothstep(0, 0.25, age)),
          momentKind(id + 3),
          alpha,
          off,
          (hash2(id, 8) - 0.5) * 0.2
        );
      }
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
