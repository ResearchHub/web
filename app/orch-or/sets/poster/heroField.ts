import { hexToRgb } from '../../theme';
import { hash2 } from '../../visuals/palette';
import { RGB, T, rgba, tint } from './inks';
import { clamp, phoneArt, smoothstep } from './heroKit';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate M, "Field" (abstract): a microtubule's lattice laid flat
 * and spread into a field of tubulin. Every tubulin carries a blue and a
 * pink mark that wander about it on their own: no two agree, many states at
 * once. Then, from one point, agreement spreads: inside a widening circle
 * the marks fall onto each other and print indigo, until the whole field
 * holds one state and flares; then it loosens again. Every 9 s.
 */

const CYCLE = 9;

interface Bead {
  x: number;
  y: number;
  /** 0..1 from the field's centre to its edge, for the fade. */
  e: number;
  phase: number;
  speed: number;
  beta: boolean;
}

interface Plate {
  key: string;
  beads: Bead[];
  cell: number;
  angle: number;
  seed: [number, number];
  reach: number;
  cx: number;
  cy: number;
}

function bake(w: number, h: number): Plate {
  const wide = w >= h;
  const top = phoneArt(w, h);
  const cx = wide ? w * 0.77 : w * 0.5;
  const cy = wide ? h * 0.5 : top * 0.64;
  const rx = wide ? Math.min(w * 0.21, h * 0.38) : w * 0.48;
  const ry = wide ? h * 0.34 : top * 0.34;
  const cell = wide ? clamp(Math.min(w, h) * 0.024, 13, 22) : 12;
  const angle = -0.38;
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const beads: Bead[] = [];
  const span = Math.ceil((Math.max(rx, ry) * 1.6) / cell);
  for (let i = -span; i <= span; i++)
    for (let j = -span; j <= span; j++) {
      // Rows of tubulin along the slant, each row 3/13 of a bead along.
      const along = (i + (j * 3) / 13) * cell;
      const across = j * cell * 0.86;
      const x = cx + along * ca - across * sa;
      const y = cy + along * sa + across * ca;
      const e = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (e > 1) continue;
      beads.push({
        x,
        y,
        e,
        phase: hash2(i, j) * Math.PI * 2,
        speed: 0.5 + hash2(j, i) * 0.9,
        beta: (i & 1) === 1,
      });
    }
  return {
    key: `${w}x${h}`,
    beads,
    cell,
    angle,
    seed: [cx - rx * 0.3, cy + ry * 0.2],
    reach: Math.max(rx, ry) * 1.6,
    cx,
    cy,
  };
}

export const heroField: PaperFigure = {
  // Agreement spreading through part of the field.
  still: CYCLE + CYCLE * 0.42,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t) => {
      if (!plate || plate.key !== `${w}x${h}`) plate = bake(w, h);
      const P = plate;
      const n = Math.floor(t / CYCLE);
      const p = t / CYCLE - n;
      // The front of agreement: grows 0.15–0.62, holds, then all loosens.
      const front = smoothstep(0.15, 0.62, p) * P.reach;
      const loosen = smoothstep(0.78, 0.98, p);
      const flash = p < 0.62 ? 0 : Math.exp(-((p - 0.62) * CYCLE) / 0.6);
      // Each cycle starts from a different point.
      const sx = P.seed[0] + (hash2(n, 1) - 0.5) * P.cell * 10;
      const sy = P.seed[1] + (hash2(n, 2) - 0.5) * P.cell * 8;
      const { cell } = P;

      ctx.globalCompositeOperation = 'multiply';
      if (flash > 0.01) {
        const gr = P.reach * 0.6;
        const glow = ctx.createRadialGradient(P.cx, P.cy, 0, P.cx, P.cy, gr);
        glow.addColorStop(0, rgba(hexToRgb(T.accent), 0.55 * flash));
        glow.addColorStop(1, rgba(hexToRgb(T.accent), 0));
        ctx.fillStyle = glow;
        ctx.fillRect(P.cx - gr, P.cy - gr, gr * 2, gr * 2);
      }

      // The tubulin, fading towards the field's edge.
      const ca = Math.cos(P.angle);
      const sa = Math.sin(P.angle);
      const fadeOf = (b: Bead) => 1 - smoothstep(0.55, 1, b.e);
      for (const beta of [false, true]) {
        ctx.fillStyle = tint(T.accent, beta ? 0.42 : 0.66);
        ctx.beginPath();
        for (const b of P.beads) {
          if (b.beta !== beta) continue;
          const r = cell * 0.4 * (0.35 + 0.65 * fadeOf(b));
          ctx.moveTo(b.x + r * 1.1 * ca, b.y + r * 1.1 * sa);
          ctx.ellipse(b.x, b.y, r * 1.1, r * 0.86, P.angle, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // The marks: each pair wanders apart until the front reaches it.
      const band = cell * 6;
      for (const [col, sign] of [
        [RGB.blue, 1],
        [RGB.pink, -1],
      ] as const) {
        ctx.fillStyle = rgba(col, 0.9);
        ctx.beginPath();
        for (const b of P.beads) {
          const f = fadeOf(b);
          if (f < 0.05) continue;
          const dist = Math.hypot(b.x - sx, b.y - sy);
          const agree = Math.max(0, Math.min(1, (front - dist) / band + 1)) * (1 - loosen);
          const a = b.phase + t * b.speed;
          const off = cell * 0.46 * (1 - agree);
          const x = b.x + sign * Math.cos(a) * off;
          const y = b.y + sign * Math.sin(a) * off;
          const r = cell * (0.15 + 0.06 * agree) * f;
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
