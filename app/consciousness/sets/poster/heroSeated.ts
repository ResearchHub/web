import { hexToRgb } from '../../theme';
import { INK, RGB, T, rgba, tint } from './inks';
import { clamp, phoneArt, smoothstep } from './heroKit';
import { easeInOut } from './pathKit';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate J, "Sitting": a person sitting still, cross-legged, seen
 * from the front, with the nervous system showing through as strands of
 * tubulin. Signals rise from the hands and knees, up the spine, printed
 * blue and pink a little apart; they meet in the head in register, indigo,
 * and the head sends out a ring of 13 tubulin (a microtubule's cross-section)
 * that widens and fades: a moment of experience. One every 4 s.
 */

const CYCLE = 4;
const PF = 13;
/** Rings still widening from earlier moments. */
const RINGS = 3;

type Pt = [number, number];

interface Plate {
  key: string;
  base: HTMLCanvasElement;
  /** Signal routes, extremity to head, sampled evenly. */
  routes: Pt[][];
  head: Pt;
  S: number;
}

function resample(pts: Pt[], step: number): Pt[] {
  const out: Pt[] = [pts[0]];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const seg = Math.hypot(bx - ax, by - ay);
    let d = step - carry;
    while (d <= seg) {
      out.push([ax + ((bx - ax) * d) / seg, ay + ((by - ay) * d) / seg]);
      d += step;
    }
    carry = seg - (d - step);
  }
  return out;
}

/** A smooth polyline through `pts` (quadratic midpoints), as points. */
function smooth(pts: Pt[]): Pt[] {
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const [ax, ay] = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2];
    const [bx, by] = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
    for (let k = 0; k <= 12; k++) {
      const u = k / 12;
      out.push([
        (1 - u) ** 2 * ax + 2 * (1 - u) * u * pts[i][0] + u * u * bx,
        (1 - u) ** 2 * ay + 2 * (1 - u) * u * pts[i][1] + u * u * by,
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

function bake(w: number, h: number, dpr: number): Plate {
  const wide = w >= h;
  const top = phoneArt(w, h);
  const S = wide ? clamp(Math.min(h * 0.6, w * 0.42), 220, 540) : clamp(top * 0.6, 140, 230);
  const cx = wide ? w * 0.76 : w * 0.5;
  const y0 = wide ? h * 0.24 : top * 0.36;
  const P = (x: number, y: number): Pt => [cx + x * S, y0 + y * S];
  const line = clamp(S * 0.006, 1.4, 2.8);

  const c = document.createElement('canvas');
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.lineJoin = 'round';
  g.lineCap = 'round';

  const body = new Path2D();
  body.ellipse(...P(0, 0.1), 0.08 * S, 0.095 * S, 0, 0, Math.PI * 2);
  body.rect(...P(-0.034, 0.16), 0.068 * S, 0.1 * S);
  body.moveTo(...P(-0.17, 0.27));
  body.quadraticCurveTo(...P(0, 0.215), ...P(0.17, 0.27));
  body.quadraticCurveTo(...P(0.2, 0.42), ...P(0.13, 0.56));
  body.quadraticCurveTo(...P(0.15, 0.64), ...P(0.17, 0.72));
  body.lineTo(...P(-0.17, 0.72));
  body.quadraticCurveTo(...P(-0.15, 0.64), ...P(-0.13, 0.56));
  body.quadraticCurveTo(...P(-0.2, 0.42), ...P(-0.17, 0.27));
  body.moveTo(...P(-0.45, 0.83));
  body.bezierCurveTo(...P(-0.32, 0.67), ...P(0.32, 0.67), ...P(0.45, 0.83));
  body.bezierCurveTo(...P(0.44, 0.99), ...P(-0.44, 0.99), ...P(-0.45, 0.83));

  // The body and legs: an outline round the union, then the fill.
  g.strokeStyle = INK.indigo;
  g.lineWidth = line * 2;
  g.stroke(body);
  g.fillStyle = tint(T.accent, 0.36);
  g.fill(body);
  // Shins crossing.
  g.lineWidth = line * 0.8;
  g.strokeStyle = rgba(RGB.indigo, 0.8);
  g.beginPath();
  g.moveTo(...P(-0.38, 0.86));
  g.quadraticCurveTo(...P(-0.05, 0.96), ...P(0.3, 0.9));
  g.moveTo(...P(0.37, 0.87));
  g.quadraticCurveTo(...P(0.18, 0.86), ...P(0.02, 0.9));
  g.stroke();

  // Arms in front, resting on the knees.
  const arms: Pt[][] = [-1, 1].map((sd) => [
    P(sd * 0.165, 0.29),
    P(sd * 0.235, 0.5),
    P(sd * 0.31, 0.77),
  ]);
  const armPath = (pts: Pt[]) => {
    g.beginPath();
    g.moveTo(...pts[0]);
    g.quadraticCurveTo(...pts[1], ...pts[2]);
  };
  for (const pass of [0, 1]) {
    for (const a of arms) {
      armPath(a);
      g.strokeStyle = pass ? tint(T.accent, 0.36) : INK.indigo;
      g.lineWidth = S * 0.06 + (pass ? 0 : line * 2);
      g.stroke();
    }
  }

  // The nervous system, as tubulin strands.
  const bead = clamp(S * 0.014, 3.2, 7);
  const spine: Pt[] = smooth([P(0, 0.7), P(0, 0.45), P(0, 0.25), P(0, 0.1)]);
  const routes: Pt[][] = [];
  for (const sd of [-1, 1]) {
    const arm = smooth([P(sd * 0.3, 0.765), P(sd * 0.232, 0.52), P(sd * 0.165, 0.31), P(0, 0.3)]);
    const leg = smooth([P(sd * 0.4, 0.84), P(sd * 0.2, 0.76), P(0, 0.7)]);
    const upFrom = (y: number) => spine.filter(([, py]) => py <= y);
    routes.push(resample([...arm, ...upFrom(P(0, 0.3)[1])], bead * 1.1));
    routes.push(resample([...leg, ...upFrom(P(0, 0.7)[1])], bead * 1.1));
  }
  // The head's own strands, curling in to its centre.
  const headStrands: Pt[][] = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.62;
    headStrands.push(
      resample(
        smooth([
          P(Math.cos(a) * 0.058, 0.1 + Math.sin(a) * 0.07),
          P(Math.cos(a + 0.5) * 0.03, 0.1 + Math.sin(a + 0.5) * 0.035),
          P(0, 0.1),
        ]),
        bead * 1.1
      )
    );
  }
  g.globalCompositeOperation = 'multiply';
  for (const s of [...routes, ...headStrands]) {
    s.forEach(([x, y], k) => {
      g.beginPath();
      g.arc(x, y, bead * 0.42, 0, Math.PI * 2);
      g.fillStyle = tint(T.accent, k % 2 ? 0.55 : 0.85);
      g.fill();
      g.strokeStyle = rgba(RGB.indigo, 0.35);
      g.lineWidth = 0.7;
      g.stroke();
    });
  }
  g.globalCompositeOperation = 'source-over';

  return { key: `${w}x${h}@${dpr}`, base: c, routes, head: P(0, 0.1), S };
}

export const heroSeated: PaperFigure = {
  // Signals on their way up, blue and pink apart; a ring from the last moment.
  still: 2 * CYCLE + 0.4 * CYCLE,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t, dpr) => {
      const d = Math.min(dpr, 2);
      if (!plate || plate.key !== `${w}x${h}@${d}`) plate = bake(w, h, d);
      const P = plate;
      const { S } = P;
      const n = Math.floor(t / CYCLE);
      const p = t / CYCLE - n;
      const [hx, hy] = P.head;
      // Arrival at the head at p = .55.
      const ARRIVE = 0.55;
      const flash = p < ARRIVE ? 0 : Math.exp(-((p - ARRIVE) * CYCLE) / 0.5);

      if (flash > 0.01) {
        const gr = S * 0.22;
        const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, gr);
        glow.addColorStop(0, rgba(hexToRgb(T.accent), 0.9 * flash));
        glow.addColorStop(1, rgba(hexToRgb(T.accent), 0));
        ctx.fillStyle = glow;
        ctx.fillRect(hx - gr, hy - gr, gr * 2, gr * 2);
      }
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(P.base, 0, 0, w, h);

      // Rings of 13 from this and earlier moments, widening and fading.
      for (let k = 0; k < RINGS; k++) {
        const age = (p - ARRIVE + k) * CYCLE;
        if (age < 0) continue;
        const tau = age / (CYCLE * RINGS);
        if (tau >= 1) continue;
        const R = S * (0.1 + 0.36 * easeInOut(Math.min(1, tau * 1.15)) ** 0.8);
        const a = 1 - smoothstep(0.2, 0.9, tau);
        const br = S * 0.02 * (1 - 0.3 * tau);
        const spin = (n - k) * 0.4 + tau * 0.5;
        for (let i = 0; i < PF; i++) {
          const th = (i / PF) * Math.PI * 2 + spin;
          const x = hx + Math.cos(th) * R;
          const y = hy + Math.sin(th) * R;
          ctx.beginPath();
          ctx.arc(x, y, br, 0, Math.PI * 2);
          ctx.fillStyle = tint(T.accent, (i % 2 ? 0.55 : 0.85) * a);
          ctx.fill();
          ctx.strokeStyle = rgba(RGB.indigo, 0.9 * a);
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.fillStyle = rgba(RGB.indigo, 0.85 * a);
          ctx.beginPath();
          ctx.arc(x, y, br * 0.42, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // The signals rise, blue a little ahead of pink, and meet in the head.
      const travel = easeInOut(clamp((p - 0.04) / (ARRIVE - 0.04), 0, 1));
      const apart = 1 - smoothstep(0.3, ARRIVE, p);
      const visible =
        p < ARRIVE ? smoothstep(0.02, 0.1, p) : 1 - smoothstep(ARRIVE, ARRIVE + 0.12, p);
      if (visible > 0.01) {
        for (const [col, sign] of [
          [RGB.blue, 1],
          [RGB.pink, -1],
        ] as const) {
          ctx.fillStyle = rgba(col, 0.9);
          ctx.beginPath();
          for (const r of P.routes) {
            const head = travel * (r.length - 1) + sign * apart * 2.2;
            for (let k = 0; k < 4; k++) {
              const idx = Math.round(head - k);
              if (idx < 0 || idx >= r.length) continue;
              const [x, y] = r[idx];
              const rad = S * 0.017 * (1 - k * 0.15) * visible;
              ctx.moveTo(x + rad, y);
              ctx.arc(x, y, rad, 0, Math.PI * 2);
            }
          }
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
