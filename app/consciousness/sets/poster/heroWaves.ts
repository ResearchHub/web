import { hexToRgb } from '../../theme';
import { hash2 } from '../../visuals/palette';
import { INK, RGB, T, rgba, tint } from './inks';
import { clamp, phoneArt, smoothstep } from './heroKit';
import { glyph, type Glyph } from './heroMoments';
import { easeInOut } from './pathKit';
import { drawMoment, momentKind } from './superKit';
import { printFonts } from './type';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate P, "Superposition", drawn as Orch OR has it. A tubulin in a
 * microtubule is in two states at once: two wave packets ride along the
 * microtubule, one printed blue, one pink, each carrying the moment it would
 * be (a sun, a bird...). As the two pull apart the superposition grows
 * unstable and reduces: one packet vanishes, the survivor pulls into an
 * indigo spike, and its moment takes the second ink and rises away. Every 7 s.
 * The microtubule is drawn as one: a hollow tube of 13 protofilaments of
 * alternating α and β tubulin, staggered along a helix, turning slowly.
 */

const CYCLE = 7;
const C0 = 0.6;
const C1 = 0.66;
/** How far each packet ends up from the middle (share of the length). */
const SPREAD = 0.2;
/** Where the separation starts from: nearly together. */
const SPREAD0 = 0.015;

interface Layout {
  x0: number;
  x1: number;
  /** The microtubule's axis. */
  cy: number;
  A: number;
  f: number;
  rise: number;
  /** The microtubule's radius. */
  tubeR: number;
  label: number;
}

function layout(w: number, h: number): Layout {
  const top = phoneArt(w, h);
  if (w >= h) {
    const A = clamp(h * 0.12, 56, 110);
    return {
      x0: w * 0.56,
      x1: w * 0.985,
      cy: h * 0.56,
      A,
      f: clamp(Math.min(h * 0.12, w * 0.085), 56, 100),
      rise: h * 0.18,
      tubeR: A * 0.44,
      label: 12,
    };
  }
  const A = clamp(top * 0.09, 24, 38);
  return {
    x0: w * 0.03,
    x1: w * 0.97,
    cy: top * 0.76,
    A,
    f: clamp(top * 0.13, 36, 50),
    rise: top * 0.09,
    tubeR: A * 0.68,
    label: 10.5,
  };
}

/** This cycle's two possibilities and which one is seen. */
function cycleOf(n: number) {
  const a = momentKind(Math.floor(hash2(n, 1) * 70));
  let b = momentKind(Math.floor(hash2(n, 2) * 70));
  if (b === a) b = momentKind(Math.floor(hash2(n, 2) * 70) + 3);
  return { a, b, blueWins: hash2(n, 3) < 0.5 };
}

/** A possible picture: a frame and its glyph in one ink only. */
function ghost(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  f: number,
  kind: Glyph,
  col: readonly number[],
  alpha: number,
  rot: number
) {
  if (alpha < 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = rgba([255, 250, 242], 0.9 * alpha);
  ctx.beginPath();
  ctx.roundRect(-f / 2, -f / 2, f, f, f * 0.14);
  ctx.fill();
  ctx.globalCompositeOperation = 'multiply';
  ctx.strokeStyle = rgba(col, 0.95 * alpha);
  ctx.lineWidth = clamp(f * 0.032, 1.2, 2.6);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.roundRect(-f / 2, -f / 2, f, f, f * 0.14);
  glyph(ctx, kind, f * 0.36);
  ctx.stroke();
  ctx.restore();
}

/** Fades a thing out towards both ends of the strip. */
const ends = (x: number, x0: number, x1: number) => {
  const m = (x1 - x0) * 0.09;
  return smoothstep(x0, x0 + m, x) * (1 - smoothstep(x1 - m, x1, x));
};

/** Protofilaments round a microtubule. */
const PF = 13;

/**
 * The microtubule, side on: 13 protofilaments round a hollow core, each a
 * chain of α (pale) and β (deep) tubulin. Neighbouring protofilaments are
 * staggered by 3/13 of a monomer, the lattice's three-start helix, and the
 * tube turns slowly about its axis. The far wall prints faintly through.
 */
function drawTube(ctx: CanvasRenderingContext2D, Lt: Layout, t: number) {
  const { x0, x1, cy, tubeR: R } = Lt;
  // A tubulin monomer is about 4 nm long; the tube is about 25 nm across.
  const d = (2 * R * 4) / 25;
  const turn = t * 0.12;
  const alpha = hexToRgb(tint(T.accent, 0.5));
  const beta = hexToRgb(tint(T.accent, 0.95));
  const fils = Array.from({ length: PF }, (_, k) => {
    const phi = (k / PF) * Math.PI * 2 + turn;
    return { k, y: Math.sin(phi), z: Math.cos(phi) };
  }).sort((a, b) => a.z - b.z);
  for (const { k, y, z } of fils) {
    const front = z > 0;
    // Height on the page: the strip a protofilament covers, foreshortened.
    const ry = Math.max(R * (Math.PI / PF) * Math.abs(z) * 0.92, R * 0.035);
    const rx = d * 0.44;
    const shade = front ? 0.55 + 0.45 * z : 0.22;
    // The helix: each protofilament starts 3/13 of a monomer on from the last.
    const off = (((k * 3) / PF) * d) % (2 * d);
    for (let i = -2, x = x0 - 2 * d + off; x <= x1 + d; i++, x += d) {
      const e = ends(x, x0, x1);
      if (e < 0.03) continue;
      ctx.fillStyle = rgba((i & 1) === 0 ? alpha : beta, e * shade);
      ctx.beginPath();
      ctx.ellipse(x, cy + y * R, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // The tube's outline, as hairlines fading at both ends.
  const wall = ctx.createLinearGradient(x0, 0, x1, 0);
  wall.addColorStop(0, rgba(RGB.indigo, 0));
  wall.addColorStop(0.09, rgba(RGB.indigo, 0.32));
  wall.addColorStop(0.91, rgba(RGB.indigo, 0.32));
  wall.addColorStop(1, rgba(RGB.indigo, 0));
  ctx.strokeStyle = wall;
  ctx.lineWidth = 1;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x0, cy + s * R * 1.08);
    ctx.lineTo(x1, cy + s * R * 1.08);
    ctx.stroke();
  }
}

export const heroWaves: PaperFigure = {
  // The two states apart, just before it reduces.
  still: CYCLE + 0.5 * CYCLE,
  create(): PaperDraw {
    return (ctx, w, h, t) => {
      const Lt = layout(w, h);
      const { x0, x1, cy, A, f } = Lt;
      const L = x1 - x0;
      const mid = (x0 + x1) / 2;
      const n = Math.floor(t / CYCLE);
      const p = t / CYCLE - n;
      const cyc = cycleOf(n);

      // The packets: in together, pulling apart, then one wins.
      const appear = smoothstep(0, 0.12, p);
      const sep = easeInOut(clamp((p - 0.06) / (C0 - 0.06), 0, 1));
      const c = smoothstep(C0, C1, p);
      const spread = L * (SPREAD0 + (SPREAD - SPREAD0) * sep);
      const sigma = L * 0.085;
      const centre = (isBlue: boolean) => (isBlue ? mid - spread : mid + spread);
      const winX = centre(cyc.blueWins);
      const ampOf = (isBlue: boolean) => A * appear * (isBlue === cyc.blueWins ? 1 : 1 - c);
      const width = (isBlue: boolean) => (isBlue === cyc.blueWins ? sigma * (1 - 0.9 * c) : sigma);
      const env = (x: number, isBlue: boolean) =>
        Math.exp(-(((x - centre(isBlue)) / width(isBlue)) ** 2));
      const live = 1 - smoothstep(C1, C1 + 0.06, p);
      const flash = p < C1 - 0.02 ? 0 : Math.exp(-((p - C1 + 0.02) * CYCLE) / 0.45);
      const acc = hexToRgb(T.accent);

      ctx.globalCompositeOperation = 'multiply';

      // The band: where the tubulin could be, the two packets' reach together.
      const STEPS = 240;
      const bandAt = (x: number) =>
        (ampOf(true) * env(x, true) + ampOf(false) * env(x, false)) * 0.8 * live;
      if (live > 0.01) {
        ctx.fillStyle = tint(T.accent, 0.2);
        ctx.beginPath();
        for (let i = 0; i <= STEPS; i++) {
          const x = x0 + (L * i) / STEPS;
          if (i) ctx.lineTo(x, cy - bandAt(x));
          else ctx.moveTo(x, cy - bandAt(x));
        }
        for (let i = STEPS; i >= 0; i--) {
          const x = x0 + (L * i) / STEPS;
          ctx.lineTo(x, cy + bandAt(x));
        }
        ctx.closePath();
        ctx.fill();
      }

      drawTube(ctx, Lt, t);

      // The two waves, riding the microtubule.
      ctx.lineWidth = clamp(A * 0.028, 1.6, 3);
      ctx.lineJoin = 'round';
      for (const [col, isBlue, k, om] of [
        [RGB.blue, true, 13, 3.1],
        [RGB.pink, false, 10, 2.6],
      ] as const) {
        const a = ampOf(isBlue) * live;
        if (a < 0.5) continue;
        const kk = (Math.PI * 2 * k) / L;
        ctx.strokeStyle = rgba(col, 0.92 * Math.min(1, live * 1.5));
        ctx.beginPath();
        const reach = width(isBlue) * 2.6;
        const c0 = centre(isBlue);
        const xa = Math.max(x0, c0 - reach);
        const xb = Math.min(x1, c0 + reach);
        for (let i = 0; i <= 120; i++) {
          const x = xa + ((xb - xa) * i) / 120;
          const y = cy - a * env(x, isBlue) * Math.cos(kk * (x - mid) - om * t);
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.stroke();
      }

      // The reduction: a flare and an indigo spike where the winner was.
      if (flash > 0.01) {
        const gr = A * 1.7;
        const glow = ctx.createRadialGradient(winX, cy, 0, winX, cy, gr);
        glow.addColorStop(0, rgba(acc, 0.85 * flash));
        glow.addColorStop(1, rgba(acc, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(winX - gr, cy - gr, gr * 2, gr * 2);
      }
      const frameY = cy - A * 1.25 - f * 0.62;
      const spike = c * (1 - smoothstep(0.78, 0.92, p));
      if (spike > 0.01) {
        ctx.strokeStyle = rgba(RGB.indigo, spike);
        ctx.lineWidth = clamp(A * 0.045, 2, 4);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(winX, cy + A * 0.35);
        ctx.lineTo(winX, frameY + f * 0.5);
        ctx.stroke();
        ctx.fillStyle = INK.indigo;
        ctx.globalAlpha = spike;
        ctx.beginPath();
        ctx.arc(winX, cy, clamp(A * 0.06, 3, 6), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Labels at the strip's left end, where nothing else is drawn.
      const fonts = printFonts(ctx.canvas);
      ctx.font = `500 ${Lt.label}px ${fonts.body}`;
      ctx.fillStyle = rgba(RGB.indigo, 0.6);
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('Microtubule', x0 + L * 0.06, cy + Lt.tubeR * 1.08 + Lt.label + 6);

      // The pictures: two possibilities riding their packets.
      const bob = (isBlue: boolean) => Math.sin(t * 1.7 + (isBlue ? 0 : 2)) * A * 0.06;
      for (const isBlue of [true, false]) {
        const wins = isBlue === cyc.blueWins;
        const alpha = appear * (wins ? (p < C0 ? 1 : 0) : 1 - c);
        ghost(
          ctx,
          centre(isBlue),
          frameY + bob(isBlue),
          f * 0.92,
          isBlue ? cyc.a : cyc.b,
          isBlue ? RGB.blue : RGB.pink,
          alpha,
          isBlue ? -0.06 : 0.06
        );
      }
      // The moment: the winner's picture in both inks, rising and fading,
      // carrying on into the start of the next cycle.
      for (const [id, age] of [
        [n, p - C0],
        [n - 1, p + 1 - C0],
      ] as const) {
        if (age < 0 || age > 0.75) continue;
        const cc = cycleOf(id);
        const blue = cc.blueWins;
        const xw = mid + (blue ? -1 : 1) * L * SPREAD;
        const settle = smoothstep(0, C1 - C0, age);
        const up = easeInOut(clamp((age - 0.12) / 0.6, 0, 1));
        const alpha = 1 - smoothstep(0.45, 0.75, age);
        const off = (1 - settle) * clamp(f * 0.1, 3, 7);
        const sc = 0.92 + 0.12 * smoothstep(0.02, 0.15, age);
        const y = frameY + bob(blue) * (1 - settle) - up * Lt.rise;
        drawMoment(
          ctx,
          xw,
          y,
          f * sc,
          blue ? cc.a : cc.b,
          alpha,
          off,
          (blue ? -0.06 : 0.06) * (1 - settle)
        );
      }
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
