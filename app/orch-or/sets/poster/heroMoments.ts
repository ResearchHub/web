import { hexToRgb } from '../../theme';
import { hash2 } from '../../visuals/palette';
import { INK, RGB, T, rgba, tint } from './inks';
import { clamp, phoneArt, smoothstep } from './heroKit';
import { brain } from './heroZoom';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate D, "Moments": the consciousness half of the theory. A head
 * in profile, facing the headline, the brain showing through. Orch OR
 * proposes that each collapse in the brain's microtubules is a moment of
 * experience, and that consciousness is a stream of them. So moments form
 * in the brain, each a small framed picture (a sun, a bird, a wave…),
 * printed first twice, blue and pink out of register (not yet decided),
 * then snapping into register as one indigo picture (one moment), and the
 * stream carries them up and away. One moment every 2.4 s, where the
 * theory has about forty a second.
 */

const PERIOD = 2.4;
const SLOTS = 10;

/** The head in profile facing left, height 1, points round the outline. */
export const HEAD: [number, number][] = [
  [0.04, -0.5],
  [0.2, -0.47],
  [0.33, -0.38],
  [0.4, -0.22],
  [0.4, -0.05],
  [0.34, 0.1],
  [0.27, 0.2],
  [0.25, 0.32],
  [0.27, 0.48],
  [0.31, 0.66],
  [0.12, 0.7],
  [-0.05, 0.66],
  [-0.05, 0.48],
  [-0.08, 0.3],
  [-0.16, 0.25],
  [-0.215, 0.205],
  [-0.235, 0.155],
  [-0.24, 0.115],
  [-0.225, 0.09],
  [-0.25, 0.065],
  [-0.248, 0.03],
  [-0.268, 0.0],
  [-0.322, -0.04],
  [-0.285, -0.13],
  [-0.262, -0.195],
  [-0.278, -0.25],
  [-0.262, -0.335],
  [-0.2, -0.42],
  [-0.1, -0.48],
];

/** A closed smooth path through `pts` (Catmull–Rom as cubic Béziers). */
export function smoothClosed(pts: [number, number][]) {
  const p = new Path2D();
  const n = pts.length;
  p.moveTo(...pts[0]);
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[(i - 1 + n) % n];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % n];
    const [x3, y3] = pts[(i + 2) % n];
    p.bezierCurveTo(
      x1 + (x2 - x0) / 6,
      y1 + (y2 - y0) / 6,
      x2 - (x3 - x1) / 6,
      y2 - (y3 - y1) / 6,
      x2,
      y2
    );
  }
  p.closePath();
  return p;
}

// ------------------------------------------------------------- percepts

export const GLYPHS = ['sun', 'bird', 'wave', 'flower', 'note', 'leaf', 'star'] as const;
export type Glyph = (typeof GLYPHS)[number];

/** Adds a small picture of `kind` to the current path, centred, radius `r`. */
export function glyph(g: CanvasRenderingContext2D, kind: Glyph, r: number) {
  switch (kind) {
    case 'sun':
      g.moveTo(r * 0.3, 0);
      g.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        g.moveTo(Math.cos(a) * r * 0.48, Math.sin(a) * r * 0.48);
        g.lineTo(Math.cos(a) * r * 0.68, Math.sin(a) * r * 0.68);
      }
      break;
    case 'bird':
      for (const [x, y, k] of [
        [-0.08, 0.12, 1],
        [0.36, -0.32, 0.55],
      ]) {
        g.moveTo((x - 0.5 * k) * r, (y - 0.02 * k) * r);
        g.quadraticCurveTo((x - 0.26 * k) * r, (y - 0.3 * k) * r, x * r, y * r);
        g.quadraticCurveTo(
          (x + 0.26 * k) * r,
          (y - 0.3 * k) * r,
          (x + 0.5 * k) * r,
          (y - 0.02 * k) * r
        );
      }
      break;
    case 'wave':
      for (const y0 of [-0.22, 0.06, 0.34]) {
        for (let i = 0; i <= 24; i++) {
          const x = -0.68 + (1.36 * i) / 24;
          const y = y0 + 0.11 * Math.sin(x * Math.PI * 1.6 + y0 * 4);
          if (i) g.lineTo(x * r, y * r);
          else g.moveTo(x * r, y * r);
        }
      }
      break;
    case 'flower': {
      const cy = -0.2;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(a) * r * 0.24;
        const py = (cy + Math.sin(a) * 0.24) * r;
        g.moveTo(px + Math.cos(a) * r * 0.16, py + Math.sin(a) * r * 0.16);
        g.ellipse(px, py, r * 0.16, r * 0.1, a, 0, Math.PI * 2);
      }
      g.moveTo(0, (cy + 0.1) * r);
      g.quadraticCurveTo(r * 0.06, r * 0.35, 0, r * 0.66);
      g.moveTo(r * 0.02, r * 0.42);
      g.quadraticCurveTo(r * 0.3, r * 0.26, r * 0.36, r * 0.36);
      break;
    }
    case 'note':
      for (const [x, y] of [
        [-0.32, 0.38],
        [0.3, 0.26],
      ]) {
        g.moveTo((x + 0.15) * r, y * r);
        g.ellipse(x * r, y * r, r * 0.15, r * 0.1, -0.4, 0, Math.PI * 2);
        g.moveTo((x + 0.14) * r, (y - 0.04) * r);
        g.lineTo((x + 0.14) * r, (y - 0.68) * r);
      }
      g.moveTo(-0.18 * r, -0.3 * r);
      g.lineTo(0.44 * r, -0.42 * r);
      g.moveTo(-0.18 * r, -0.2 * r);
      g.lineTo(0.44 * r, -0.32 * r);
      break;
    case 'leaf':
      g.moveTo(-0.5 * r, 0.48 * r);
      g.quadraticCurveTo(-0.56 * r, -0.44 * r, 0.52 * r, -0.5 * r);
      g.quadraticCurveTo(0.5 * r, 0.44 * r, -0.5 * r, 0.48 * r);
      g.moveTo(-0.62 * r, 0.6 * r);
      g.lineTo(0.28 * r, -0.26 * r);
      break;
    case 'star':
      for (let i = 0; i <= 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const rr = (i % 2 ? 0.27 : 0.64) * r;
        if (i) g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr + r * 0.05);
        else g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr + r * 0.05);
      }
      break;
  }
}

// ------------------------------------------------------------- layout

interface Plate {
  key: string;
  base: HTMLCanvasElement;
  /** The stream, sampled: points and arc length. */
  path: [number, number][];
  len: number[];
  f0: number;
  gap: number;
  birth: [number, number];
  H: number;
}

function bake(w: number, h: number, dpr: number): Plate {
  const wide = w >= h;
  const top = phoneArt(w, h);
  const H = wide ? clamp(Math.min(h * 0.5, w * 0.33), 220, 540) : clamp(top * 0.64, 140, 300);
  const hx = wide ? w * 0.7 : w * 0.25;
  const hy = wide ? h * 0.64 : top * 0.7;
  const map = ([x, y]: [number, number]): [number, number] => [hx + x * H, hy + y * H];

  const c = document.createElement('canvas');
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);

  const head = smoothClosed(HEAD.map(map));
  const line = clamp(H * 0.006, 1.5, 3);
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.fillStyle = tint(T.accent, 0.42);
  g.fill(head);
  g.strokeStyle = INK.indigo;
  g.lineWidth = line;
  g.stroke(head);

  // The brain, showing through the skull.
  g.save();
  g.clip(head);
  g.translate(hx + 0.07 * H, hy - 0.235 * H);
  g.globalAlpha = 0.9;
  brain(g, 0.28 * H);
  g.restore();

  // Ear and eye.
  g.strokeStyle = INK.indigo;
  g.lineWidth = line * 0.85;
  g.beginPath();
  g.moveTo(...map([0.13, -0.01]));
  g.bezierCurveTo(...map([0.21, -0.06]), ...map([0.25, 0.09]), ...map([0.18, 0.15]));
  g.quadraticCurveTo(...map([0.15, 0.17]), ...map([0.14, 0.12]));
  g.stroke();
  g.beginPath();
  g.moveTo(...map([-0.225, -0.13]));
  g.quadraticCurveTo(...map([-0.19, -0.15]), ...map([-0.16, -0.12]));
  g.stroke();

  // The neck fades into the paper.
  g.globalCompositeOperation = 'destination-out';
  const fade = g.createLinearGradient(0, hy + 0.36 * H, 0, hy + 0.66 * H);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = fade;
  g.fillRect(0, hy + 0.36 * H, w, H);
  g.globalCompositeOperation = 'source-over';

  // The stream: out of the brain, up through the crown and away.
  const birth = map([0.06, -0.26]);
  const p1 = map([0.1, wide ? -0.78 : -0.66]);
  const end: [number, number] = wide ? [w + 0.3 * H, hy - 0.88 * H] : [w + 0.3 * H, top * 0.12];
  const p2: [number, number] = wide ? map([0.7, -1.02]) : map([0.75, -0.75]);
  const path: [number, number][] = [];
  const len: number[] = [];
  for (let i = 0; i <= 240; i++) {
    const u = i / 240;
    const a = (1 - u) ** 3;
    const b = 3 * (1 - u) ** 2 * u;
    const cc = 3 * (1 - u) * u * u;
    const d = u ** 3;
    const pt: [number, number] = [
      a * birth[0] + b * p1[0] + cc * p2[0] + d * end[0],
      a * birth[1] + b * p1[1] + cc * p2[1] + d * end[1],
    ];
    len.push(i ? len[i - 1] + Math.hypot(pt[0] - path[i - 1][0], pt[1] - path[i - 1][1]) : 0);
    path.push(pt);
  }
  const f0 = H * (wide ? 0.15 : 0.17);
  return {
    key: `${w}x${h}@${dpr}`,
    base: c,
    path,
    len,
    f0,
    gap: f0 * 1.28,
    birth,
    H,
  };
}

function along(p: Plate, d: number): [number, number] {
  const { path, len } = p;
  if (d <= 0) return path[0];
  let lo = 0;
  let hi = len.length - 1;
  if (d >= len[hi]) {
    // Past the end: carry on in a straight line.
    const [ax, ay] = path[hi - 1];
    const [bx, by] = path[hi];
    const k = (d - len[hi]) / (len[hi] - len[hi - 1]);
    return [bx + (bx - ax) * k, by + (by - ay) * k];
  }
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (len[m] < d) lo = m;
    else hi = m;
  }
  const k = (d - len[lo]) / (len[hi] - len[lo] || 1);
  return [
    path[lo][0] + (path[hi][0] - path[lo][0]) * k,
    path[lo][1] + (path[hi][1] - path[lo][1]) * k,
  ];
}

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** One moment's cycle: forms (plates apart), snaps into register, moves on. */
function momentState(t: number) {
  const n = Math.floor(t / PERIOD);
  const p = t / PERIOD - n;
  const adv = p < 0.58 ? 0 : easeInOut((p - 0.58) / 0.42);
  const sep = p < 0.36 ? 1 : p < 0.46 ? 1 - Math.pow((p - 0.36) / 0.1, 3) : 0;
  const appear = smoothstep(0, 0.14, p);
  const flash = p < 0.46 ? 0 : Math.exp(-((p - 0.46) * PERIOD) / 0.4);
  return { n, p, adv, sep, appear, flash };
}

export const heroMoments: PaperFigure = {
  // A moment forming, its two plates apart.
  still: 3 * PERIOD + 0.3 * PERIOD,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t, dpr) => {
      const d = Math.min(dpr, 2);
      if (!plate || plate.key !== `${w}x${h}@${d}`) plate = bake(w, h, d);
      const P = plate;
      const { n, adv, sep, appear, flash } = momentState(t);

      if (flash > 0.01) {
        const [gx, gy] = P.birth;
        const gr = P.H * 0.42;
        const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        glow.addColorStop(0, rgba(hexToRgb(T.accent), 0.8 * flash));
        glow.addColorStop(1, rgba(hexToRgb(T.accent), 0));
        ctx.fillStyle = glow;
        ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
      }
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(P.base, 0, 0, w, h);

      // The stream's track.
      const dist = (s: number) => P.gap * (s + 0.06 * s * s);
      ctx.strokeStyle = rgba(RGB.indigo, 0.32);
      ctx.lineWidth = 1.4;
      ctx.setLineDash([1.5, 6]);
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const [x, y] = along(P, dist(0.55) + (i / 60) * dist(SLOTS));
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Oldest first, so the newer moments print over the older ones.
      for (let k = SLOTS; k >= 0; k--) {
        const id = n - k;
        const s = k + adv;
        const fresh = k === 0;
        const alpha = (1 - smoothstep(5, 9.5, s)) * (fresh ? appear : 1);
        if (alpha < 0.01) continue;
        const f = P.f0 * (0.74 + 0.26 * smoothstep(0, 1.2, s)) * (1 + 0.05 * Math.max(0, s - 1));
        const [x, y] = along(P, dist(s));
        const rot = (hash2(id, 7) - 0.5) * 0.18;
        const kind = GLYPHS[((id % GLYPHS.length) + GLYPHS.length) % GLYPHS.length];
        const off = fresh ? sep * clamp(f * 0.11, 4, 9) : 0;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = rgba([255, 250, 242], 0.94 * alpha);
        ctx.beginPath();
        ctx.roundRect(-f / 2, -f / 2, f, f, f * 0.14);
        ctx.fill();
        ctx.globalCompositeOperation = 'multiply';
        ctx.lineWidth = clamp(f * 0.032, 1.2, 2.6);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        for (const [col, sign] of [
          [RGB.blue, -1],
          [RGB.pink, 1],
        ] as const) {
          ctx.save();
          ctx.translate(sign * off, sign * off * 0.4);
          ctx.strokeStyle = rgba(col, 0.95 * alpha);
          ctx.beginPath();
          ctx.roundRect(-f / 2, -f / 2, f, f, f * 0.14);
          glyph(ctx, kind, f * 0.36);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      }
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
