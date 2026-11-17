import { hexToRgb } from '../../theme';
import { INK, RGB, T, rgba, tint } from './inks';
import { clamp, phoneArt, smoothstep } from './heroKit';
import { HEAD, smoothClosed } from './heroMoments';
import { easeInOut } from './pathKit';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate H, "Inner world": the world as you experience it, inside
 * a head. The scene is printed as a halftone whose dots are tubulin, set in
 * a microtubule's rows. Two plates print two possible scenes at once, a
 * sunny field in blue and a moonlit sea in pink, their screens out of
 * register. Then one scene wins: the other plate's dots take the winner's
 * shape and slide into register, and the head holds one world, in indigo.
 * The next time the other scene wins.
 */

const CYCLE = 9;

/** The head's box in its own units (height 1). */
const BOX = { x0: -0.36, x1: 0.44, y0: -0.54, y1: 0.5 };

type Scene = (g: CanvasRenderingContext2D) => void;

/** Ink as a grey: 0 = paper, 1 = full. */
const grey = (k: number) => {
  const v = Math.round(255 * (1 - k));
  return `rgb(${v},${v},${v})`;
};

/** Background ink: a fine screen of small dots, so the head reads as a window. */
const BG = 0.06;

/** A sunny field: the sun and its rays over a hill. */
const field: Scene = (g) => {
  g.fillStyle = grey(BG);
  g.fillRect(BOX.x0, BOX.y0, 1, 1.2);
  const [sx, sy] = [0.17, -0.22];
  g.fillStyle = grey(0.92);
  g.beginPath();
  g.arc(sx, sy, 0.1, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = grey(0.92);
  g.lineWidth = 0.04;
  g.lineCap = 'round';
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    g.moveTo(sx + Math.cos(a) * 0.15, sy + Math.sin(a) * 0.15);
    g.lineTo(sx + Math.cos(a) * 0.22, sy + Math.sin(a) * 0.22);
  }
  g.stroke();
  g.fillStyle = grey(0.8);
  g.beginPath();
  g.moveTo(BOX.x0, 0.2);
  g.quadraticCurveTo(-0.02, -0.02, BOX.x1, 0.14);
  g.lineTo(BOX.x1, BOX.y1);
  g.lineTo(BOX.x0, BOX.y1);
  g.fill();
};

/** A moonlit sea: a crescent moon, stars, waves. */
const sea: Scene = (g) => {
  g.fillStyle = grey(BG);
  g.fillRect(BOX.x0, BOX.y0, 1, 1.2);
  const [mx, my] = [-0.03, -0.27];
  g.fillStyle = grey(0.92);
  g.beginPath();
  g.arc(mx, my, 0.14, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = grey(BG);
  g.beginPath();
  g.arc(mx + 0.07, my - 0.04, 0.12, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = grey(0.92);
  for (const [x, y, r] of [
    [0.24, -0.36, 0.028],
    [0.31, -0.16, 0.022],
    [0.12, -0.08, 0.02],
    [-0.2, -0.12, 0.022],
  ]) {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  g.strokeStyle = grey(0.88);
  g.lineWidth = 0.042;
  g.lineCap = 'round';
  for (const [y0, ph] of [
    [0.05, 0],
    [0.15, 1.6],
    [0.25, 3.1],
  ]) {
    g.beginPath();
    for (let x = BOX.x0; x <= BOX.x1; x += 0.01) {
      const y = y0 + 0.026 * Math.sin(x * 22 + ph);
      if (x === BOX.x0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
};

interface Dot {
  x: number;
  y: number;
  /** Ink of each scene here, 0..1. */
  a: number;
  b: number;
  beta: boolean;
}

interface Plate {
  key: string;
  head: Path2D;
  base: HTMLCanvasElement;
  dots: Dot[];
  cell: number;
  angle: number;
  H: number;
  hx: number;
  hy: number;
  wide: boolean;
}

function render(scene: Scene, H: number, s: number) {
  const W = Math.ceil((BOX.x1 - BOX.x0) * H * s);
  const Hh = Math.ceil((BOX.y1 - BOX.y0) * H * s);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = Hh;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.setTransform(H * s, 0, 0, H * s, -BOX.x0 * H * s, -BOX.y0 * H * s);
  g.fillStyle = '#fff';
  g.fillRect(BOX.x0, BOX.y0, 2, 2);
  scene(g);
  return { data: g.getImageData(0, 0, W, Hh).data, W, Hh };
}

function bake(w: number, h: number, dpr: number): Plate {
  const wide = w >= h;
  const top = phoneArt(w, h);
  const H = wide ? clamp(Math.min(h * 0.6, w * 0.42), 240, 560) : clamp(top * 0.7, 140, 260);
  const hx = wide ? w * 0.76 : w * 0.53;
  const hy = wide ? h * 0.5 : top * 0.7;
  const map = ([x, y]: [number, number]): [number, number] => [hx + x * H, hy + y * H];
  const head = smoothClosed(HEAD.map(map));

  // The halftone: rows of tubulin at a slant, sampled from both scenes.
  const cell = clamp(H * 0.019, 5.5, 10);
  const angle = -0.42;
  const S = 0.4;
  const A = render(field, H, S);
  const B = render(sea, H, S);
  const sample = (img: ReturnType<typeof render>, x: number, y: number) => {
    const u = Math.round(((x - hx) / H - BOX.x0) * H * S);
    const v = Math.round(((y - hy) / H - BOX.y0) * H * S);
    if (u < 0 || v < 0 || u >= img.W || v >= img.Hh) return 0;
    return 1 - img.data[(v * img.W + u) * 4] / 255;
  };
  const probe = document.createElement('canvas').getContext('2d')!;
  const dots: Dot[] = [];
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const span = Math.ceil((H * 1.4) / cell);
  for (let i = -span; i <= span; i++)
    for (let j = -span; j <= span; j++) {
      // Rows along the slant; each row set a third of a cell along (a helix).
      const along = (i + j / 3) * cell;
      const across = j * cell * 0.92;
      const x = hx + along * ca - across * sa;
      const y = hy + along * sa + across * ca;
      if (y > hy + 0.62 * H || !probe.isPointInPath(head, x, y)) continue;
      dots.push({ x, y, a: sample(A, x, y), b: sample(B, x, y), beta: (i & 1) === 1 });
    }

  // The head's paper and the outline, baked.
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
  return { key: `${w}x${h}@${dpr}`, head, base: c, dots, cell, angle, H, hx, hy, wide };
}

/** 0 = two scenes, 1 = one; and which scene wins this cycle. */
function worldState(t: number) {
  const n = Math.floor(t / CYCLE);
  const p = t / CYCLE - n;
  let one: number;
  if (p < 0.42) one = 0;
  else if (p < 0.52) one = easeInOut((p - 0.42) / 0.1);
  else if (p < 0.84) one = 1;
  else one = 1 - easeInOut((p - 0.84) / 0.16);
  const flash = p < 0.5 ? 0 : Math.exp(-((p - 0.5) * CYCLE) / 0.5);
  return { one, flash, fieldWins: n % 2 === 0 };
}

export const heroWorld: PaperFigure = {
  // Two scenes at once, the plates apart.
  still: CYCLE * 0.3,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t, dpr) => {
      const d = Math.min(dpr, 2);
      if (!plate || plate.key !== `${w}x${h}@${d}`) plate = bake(w, h, d);
      const P = plate;
      const { one, flash, fieldWins } = worldState(t);
      const { cell, H } = P;

      // A faint yellow in the head, warmer when one world settles.
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = tint(T.accent, 0.16 + 0.1 * flash);
      ctx.fill(P.head);
      if (flash > 0.01) {
        const [gx, gy] = [P.hx + 0.05 * H, P.hy - 0.18 * H];
        const gr = H * 0.45;
        const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        glow.addColorStop(0, rgba(hexToRgb(T.accent), 0.55 * flash));
        glow.addColorStop(1, rgba(hexToRgb(T.accent), 0));
        ctx.save();
        ctx.clip(P.head);
        ctx.fillStyle = glow;
        ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
        ctx.restore();
      }

      // Out of register: the pink screen half a cell off, drifting a little.
      const drift = 0.5 + 0.12 * Math.sin(t * 0.7);
      const ox = (1 - one) * cell * drift * Math.cos(P.angle + 1.1);
      const oy = (1 - one) * cell * drift * Math.sin(P.angle + 1.1);
      const rMax = cell * 0.56;
      const ca = Math.cos(P.angle) * 1.15;
      const sa = Math.sin(P.angle) * 1.15;
      ctx.save();
      ctx.clip(P.head);
      for (const [col, isBlue] of [
        [RGB.blue, true],
        [RGB.pink, false],
      ] as const) {
        // Blue prints the field, pink the sea; the loser's plate takes on
        // the winner's picture as the world settles.
        const own = isBlue ? 'a' : 'b';
        const other = isBlue ? 'b' : 'a';
        const winnerIsOwn = isBlue === fieldWins;
        const k = winnerIsOwn ? 0 : one;
        ctx.fillStyle = rgba(col, 0.9);
        ctx.beginPath();
        const dx = isBlue ? 0 : ox;
        const dy = isBlue ? 0 : oy;
        for (const dot of P.dots) {
          const ink = dot[own] * (1 - k) + dot[other] * k;
          if (ink < 0.03) continue;
          const r = rMax * Math.sqrt(ink) * (dot.beta ? 0.86 : 1);
          const x = dot.x + dx;
          const y = dot.y + dy;
          ctx.moveTo(x + r * ca, y + r * sa);
          ctx.ellipse(x, y, r * 1.15, r * 0.88, P.angle, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.restore();

      ctx.drawImage(P.base, 0, 0, w, h);

      // The neck fades into the paper.
      ctx.globalCompositeOperation = 'destination-out';
      const y0 = P.hy + 0.26 * H;
      const fade = ctx.createLinearGradient(0, y0, 0, P.hy + 0.5 * H);
      fade.addColorStop(0, 'rgba(0,0,0,0)');
      fade.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = fade;
      ctx.fillRect(0, y0, w, H);
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
