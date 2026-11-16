import { hexToRgb } from '../../theme';
import { hash2 } from '../../visuals/palette';
import { INK, RGB, T, rgba, tint } from './inks';
import { clamp, phoneArt, smoothstep } from './heroKit';
import { HEAD, smoothClosed } from './heroMoments';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate I, "Orchestrated": a person whose inside is microtubules.
 * A bust in profile, facing the headline, drawn as strands of tubulin
 * running up from the chest through the neck and fanning out in the brain.
 * Signals run along the strands each in its own time, printed blue and pink
 * out of register: many states, no one there yet. Then they fall into step
 * (the "orchestrated" of Orch OR), reach the brain together, print indigo
 * in register, and the head lights up: a moment of experience. They scatter
 * again; the next one builds.
 */

const CYCLE = 6.5;
const STRANDS = 24;

/** The bust: D's head with shoulders and chest (height units, origin as HEAD). */
const BUST: [number, number][] = (() => {
  const i0 = HEAD.findIndex(([x, y]) => x === 0.27 && y === 0.48);
  const i1 = HEAD.findIndex(([x, y]) => x === -0.05 && y === 0.48);
  return [
    ...HEAD.slice(0, i0),
    [0.27, 0.46],
    [0.36, 0.6],
    [0.58, 0.68],
    [0.72, 0.82],
    [0.78, 1.0],
    [0.8, 1.2],
    [0.2, 1.3],
    [-0.4, 1.2],
    [-0.38, 0.95],
    [-0.3, 0.74],
    [-0.12, 0.62],
    [-0.06, 0.46],
    ...HEAD.slice(i1 + 1),
  ];
})();

type Pt = [number, number];

/** An open Catmull–Rom curve through `pts`, resampled every `step`. */
function strand(pts: Pt[], step: number): Pt[] {
  const fine: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < 24; k++) {
      const t = k / 24;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 *
        (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      fine.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  fine.push(pts[pts.length - 1]);
  const out: Pt[] = [fine[0]];
  let carry = 0;
  for (let i = 1; i < fine.length; i++) {
    const [ax, ay] = fine[i - 1];
    const [bx, by] = fine[i];
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

interface Plate {
  key: string;
  base: HTMLCanvasElement;
  strands: Pt[][];
  bead: number;
  brain: [number, number, number];
  bust: Path2D;
  fadeY: [number, number];
}

function bake(w: number, h: number, dpr: number): Plate {
  const wide = w >= h;
  const top = phoneArt(w, h);
  const H = wide ? clamp(Math.min(h * 0.47, w * 0.32), 200, 470) : clamp(top * 0.5, 110, 200);
  const hx = wide ? w * 0.7 : w * 0.45;
  const hy = wide ? h * 0.17 + 0.5 * H : top * 0.3 + 0.5 * H;
  const map = ([x, y]: Pt): Pt => [hx + x * H, hy + y * H];
  const bust = smoothClosed(BUST.map(map));
  const bead = clamp(H * 0.026, 5, 11);

  // The strands: from across the chest, gathered through the neck, fanned
  // out through the brain.
  const strands: Pt[][] = [];
  for (let i = 0; i < STRANDS; i++) {
    const f = (i + 0.5) / STRANDS;
    const j = hash2(i, 4) - 0.5;
    const start: Pt = [-0.3 + f * 1.02 + j * 0.04, 1.25];
    const chest: Pt = [-0.16 + f * 0.62 + j * 0.03, 0.84];
    const neck: Pt = [0.0 + f * 0.2, 0.42];
    const base: Pt = [-0.02 + f * 0.24, 0.08];
    // Fan: across the cranium from forehead to the back of the head.
    const a = Math.PI * (1.05 + f * 0.95) + j * 0.12;
    const rr = 0.2 + hash2(i, 9) * 0.1;
    const end: Pt = [0.07 + Math.cos(a) * rr * 1.2, -0.17 + Math.sin(a) * rr];
    const mid: Pt = [(base[0] + end[0]) / 2 + j * 0.05, (base[1] + end[1]) / 2 + 0.02];
    strands.push(strand([start, chest, neck, base, mid, end].map(map), bead * 1.05));
  }

  const c = document.createElement('canvas');
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const line = clamp(H * 0.007, 1.4, 3);
  g.fillStyle = tint(T.accent, 0.2);
  g.fill(bust);
  g.save();
  g.clip(bust);
  g.globalCompositeOperation = 'multiply';
  for (const s of strands) {
    s.forEach(([x, y], k) => {
      const [nx, ny] = s[Math.min(s.length - 1, k + 1)];
      const [px, py] = s[Math.max(0, k - 1)];
      const ang = Math.atan2(ny - py, nx - px);
      g.beginPath();
      g.ellipse(x, y, bead * 0.5, bead * 0.36, ang, 0, Math.PI * 2);
      g.fillStyle = tint(T.accent, k % 2 ? 0.5 : 0.8);
      g.fill();
      g.strokeStyle = rgba(RGB.indigo, 0.42);
      g.lineWidth = 0.8;
      g.stroke();
    });
  }
  g.restore();
  g.strokeStyle = INK.indigo;
  g.lineWidth = line;
  g.lineJoin = 'round';
  g.stroke(bust);
  // The eye, open.
  g.lineCap = 'round';
  g.lineWidth = line * 0.85;
  g.beginPath();
  g.moveTo(...map([-0.225, -0.13]));
  g.quadraticCurveTo(...map([-0.19, -0.15]), ...map([-0.16, -0.12]));
  g.stroke();

  return {
    key: `${w}x${h}@${dpr}`,
    base: c,
    strands,
    bead,
    brain: [...map([0.07, -0.2]), H * 0.42],
    bust,
    fadeY: [hy + 0.78 * H, hy + 1.12 * H],
  };
}

/** How far the strands have fallen into step (0 each on its own, 1 together). */
function orchestra(t: number) {
  const n = Math.floor(t / CYCLE);
  const p = t / CYCLE - n;
  const together = smoothstep(0.08, 0.55, p);
  // The moment: the signals reach the brain together at p = .6.
  const flash = p < 0.6 ? 0 : Math.exp(-((p - 0.6) * CYCLE) / 0.55);
  return { p, together, flash };
}

export const heroStrands: PaperFigure = {
  // Falling into step, not there yet: blue and pink apart.
  still: CYCLE + 0.36 * CYCLE,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t, dpr) => {
      const d = Math.min(dpr, 2);
      if (!plate || plate.key !== `${w}x${h}@${d}`) plate = bake(w, h, d);
      const P = plate;
      const { p, together, flash } = orchestra(t);

      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(P.base, 0, 0, w, h);

      // The head lights up at the moment.
      if (flash > 0.01) {
        const [gx, gy, gr] = P.brain;
        const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr * (0.9 + 0.4 * flash));
        glow.addColorStop(0, rgba(hexToRgb(T.accent), 0.85 * flash));
        glow.addColorStop(1, rgba(hexToRgb(T.accent), 0));
        ctx.save();
        ctx.clip(P.bust);
        ctx.fillStyle = glow;
        ctx.fillRect(gx - gr * 1.4, gy - gr * 1.4, gr * 2.8, gr * 2.8);
        ctx.restore();
      }

      // The signals: a short run of marked tubulin per strand. On its own
      // each runs at its own pace; falling into step they all reach the
      // brain at the moment. Blue and pink a bead or two apart until then.
      const sync = smoothstep(0.02, 0.6, p);
      for (const [col, sign] of [
        [RGB.blue, -1],
        [RGB.pink, 1],
      ] as const) {
        ctx.fillStyle = rgba(col, 0.9);
        ctx.beginPath();
        P.strands.forEach((s, i) => {
          const own = (t / (3.2 + hash2(i, 2) * 2.4) + hash2(i, 3)) % 1;
          // [where along the strand, size, beads apart]
          const runs: [number, number, number][] =
            p < 0.6
              ? [[own * (1 - together) + sync * together, 1, 1.6 * (1 - together)]]
              : [
                  [1, 1 - smoothstep(0.6, 0.76, p), 0],
                  [own, smoothstep(0.72, 0.95, p), 1.6],
                ];
          for (const [u, size, off] of runs) {
            if (size < 0.02) continue;
            const head = u * (s.length - 1) + sign * off;
            for (let k = 0; k < 6; k++) {
              const idx = Math.round(head - k);
              if (idx < 0 || idx >= s.length) continue;
              const r = P.bead * 0.46 * (1 - k * 0.12) * size;
              const [x, y] = s[idx];
              ctx.moveTo(x + r, y);
              ctx.arc(x, y, r, 0, Math.PI * 2);
            }
          }
        });
        ctx.fill();
      }

      // The bust fades out below the chest.
      ctx.globalCompositeOperation = 'destination-out';
      const [y0, y1] = P.fadeY;
      const fade = ctx.createLinearGradient(0, y0, 0, y1);
      fade.addColorStop(0, 'rgba(0,0,0,0)');
      fade.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = fade;
      ctx.fillRect(0, y0, w, h - y0);
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
