import { hexToRgb } from '../../theme';
import { hash2 } from '../../visuals/palette';
import { INK, T, rgba, tint } from './inks';
import { clamp, phoneArt, smoothstep } from './heroKit';
import { HEAD, smoothClosed } from './heroMoments';
import { drawMoment, drawWaves, gridDots, momentKind, type Dot } from './superKit';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate R, "Mind waves": hero Q inside a head. Two waves spread
 * through the brain, one printed blue, one pink, interfering (indigo where
 * the crests meet). The superposition reduces to one point, the head flares
 * there, and a moment of experience rises out through the crown and drifts
 * off towards the headline's side. Every 7 s.
 */

const CYCLE = 7;
const C0 = 0.6;
const C1 = 0.7;

interface Plate {
  key: string;
  base: HTMLCanvasElement;
  head: Path2D;
  dots: Dot[];
  cell: number;
  H: number;
  map: (x: number, y: number) => [number, number];
  s1: [number, number];
  s2: [number, number];
  f: number;
  fadeY: [number, number];
  wide: boolean;
  top: number;
}

function bake(w: number, h: number, dpr: number): Plate {
  const wide = w >= h;
  const top = phoneArt(w, h);
  const H = wide ? clamp(Math.min(h * 0.56, w * 0.38), 230, 520) : clamp(top * 0.58, 130, 210);
  const hx = wide ? w * 0.74 : w * 0.52;
  const hy = wide ? h * 0.58 : top * 0.82;
  const map = (x: number, y: number): [number, number] => [hx + x * H, hy + y * H];
  const head = smoothClosed(HEAD.map(([x, y]) => map(x, y)));
  const cell = wide ? clamp(H * 0.024, 7.5, 12) : 6.5;
  const probe = document.createElement('canvas').getContext('2d')!;
  const dots = gridDots(
    hx,
    hy,
    H * 0.9,
    cell,
    -0.3,
    (x, y) => y < hy + 0.42 * H && probe.isPointInPath(head, x, y)
  );

  const c = document.createElement('canvas');
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.lineJoin = 'round';
  g.lineCap = 'round';
  const line = clamp(H * 0.006, 1.5, 3);
  g.strokeStyle = INK.indigo;
  g.lineWidth = line;
  g.stroke(head);
  g.lineWidth = line * 0.85;
  g.beginPath();
  g.moveTo(...map(-0.225, -0.13));
  g.quadraticCurveTo(...map(-0.19, -0.15), ...map(-0.16, -0.12));
  g.stroke();

  return {
    key: `${w}x${h}@${dpr}`,
    base: c,
    head,
    dots,
    cell,
    H,
    map,
    s1: map(0.16, -0.12),
    s2: map(0.22, 0.02),
    f: wide ? clamp(H * 0.16, 48, 84) : 38,
    fadeY: [hy + 0.3 * H, hy + 0.56 * H],
    wide,
    top,
  };
}

export const heroMindWaves: PaperFigure = {
  // Waves through the brain, before they reduce; a moment from before above.
  still: CYCLE + 0.45 * CYCLE,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t, dpr) => {
      const d = Math.min(dpr, 2);
      if (!plate || plate.key !== `${w}x${h}@${d}`) plate = bake(w, h, d);
      const P = plate;
      const { H, cell } = P;
      const n = Math.floor(t / CYCLE);
      const p = t / CYCLE - n;
      const reduceAt = (id: number) =>
        P.map(-0.08 + hash2(id, 3) * 0.2, -0.32 + hash2(id, 4) * 0.18);
      const [xr, yr] = reduceAt(n);
      const c = smoothstep(C0, C1, p);
      const flash = p < C1 - 0.02 ? 0 : Math.exp(-((p - C1 + 0.02) * CYCLE) / 0.5);
      const RESTART = 0.76;
      const front = ((p - RESTART + 1) % 1) * CYCLE * H * 0.6;
      const reducing = p >= C0 && p < RESTART;
      const acc = hexToRgb(T.accent);
      const lambda = H * 0.075;

      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = tint(T.accent, 0.18 + 0.12 * flash);
      ctx.fill(P.head);
      ctx.save();
      ctx.clip(P.head);
      if (flash > 0.01) {
        const gr = H * 0.4;
        const glow = ctx.createRadialGradient(xr, yr, 0, xr, yr, gr);
        glow.addColorStop(0, rgba(acc, 0.9 * flash));
        glow.addColorStop(1, rgba(acc, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(xr - gr, yr - gr, gr * 2, gr * 2);
      }
      drawWaves(ctx, P.dots, cell, {
        s1: P.s1,
        s2: P.s2,
        lambda,
        t,
        weight: (x, y) => {
          const r = Math.min(
            Math.hypot(x - P.s1[0], y - P.s1[1]),
            Math.hypot(x - P.s2[0], y - P.s2[1])
          );
          const reached = 1 - smoothstep(front - lambda, front, r);
          const dd = Math.hypot(x - xr, y - yr);
          const pull = reducing ? Math.exp(-((dd / (H * (0.015 + 1.5 * (1 - c) ** 2))) ** 2)) : 1;
          return reached * pull * (p > C1 + 0.02 && p < RESTART ? 0 : 1);
        },
      });
      ctx.restore();
      const pointA = c * (1 - smoothstep(0.8, 0.95, p));
      if (pointA > 0.01) {
        ctx.fillStyle = INK.indigo;
        ctx.globalAlpha = pointA;
        ctx.beginPath();
        ctx.arc(xr, yr, cell * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.drawImage(P.base, 0, 0, w, h);

      // The neck fades into the paper.
      ctx.globalCompositeOperation = 'destination-out';
      const [y0, y1] = P.fadeY;
      const fade = ctx.createLinearGradient(0, y0, 0, y1);
      fade.addColorStop(0, 'rgba(0,0,0,0)');
      fade.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = fade;
      ctx.fillRect(0, y0, w, h - y0);
      ctx.globalCompositeOperation = 'multiply';

      // Moments rising out through the crown and away up to the right.
      for (let k = 2; k >= 0; k--) {
        const id = n - k;
        const age = (t - (id * CYCLE + C1 * CYCLE)) / CYCLE;
        if (age < 0 || age > 2) continue;
        const [bx, by] = reduceAt(id);
        const rise = 1 - Math.exp(-age * 1.6);
        const x = bx + rise * H * (P.wide ? 0.35 : 0.55);
        const y = by - rise * H * (P.wide ? 0.62 : 0.3);
        const alpha = smoothstep(0, 0.06, age) * (1 - smoothstep(1.1, 2, age));
        const off = (1 - smoothstep(0.03, 0.18, age)) * clamp(P.f * 0.11, 4, 8);
        drawMoment(
          ctx,
          x,
          y,
          P.f * (0.45 + 0.55 * smoothstep(0, 0.3, age)),
          momentKind(id + 5),
          alpha,
          off,
          (hash2(id, 8) - 0.5) * 0.2
        );
      }
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
