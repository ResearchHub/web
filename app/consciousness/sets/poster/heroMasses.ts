import { hexToRgb } from '../../theme';
import { INK, RGB, T, rgba, tint } from './inks';
import { clamp, phoneArt, smoothstep } from './heroKit';
import { easeInOut } from './pathKit';
import { printFonts } from './type';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate N, "Two places" (abstract): Penrose's objective reduction
 * drawn as plainly as it can be. One mass, printed blue and pink in
 * register (indigo), splits into two places at once: the blue copy goes one
 * way, the pink the other. A ring round them is a clock: the further apart
 * the copies, the faster it fills (τ ≈ ℏ/E_G). When it is full the state
 * reduces: both copies land in one of the two places, indigo again, with a
 * flare. Which place differs each time. Every 7 s.
 */

const CYCLE = 7;

function state(t: number) {
  const n = Math.floor(t / CYCLE);
  const p = t / CYCLE - n;
  // Back to the middle as one, split, apart, reduce to one side, hold.
  const SPLIT = 0.14;
  const REDUCE = 0.8;
  let apart = 0;
  if (p >= SPLIT && p < REDUCE) apart = easeInOut(Math.min(1, (p - SPLIT) / 0.42));
  // The clock fills faster the further apart: an accelerating curve.
  const clock = p < SPLIT ? 0 : p < REDUCE ? ((p - SPLIT) / (REDUCE - SPLIT)) ** 2.2 : 1;
  const land = smoothstep(REDUCE, REDUCE + 0.05, p);
  const home = 1 - easeInOut(Math.min(1, p / SPLIT));
  const flash = p < REDUCE ? 0 : Math.exp(-((p - REDUCE) * CYCLE) / 0.45);
  return { n, p, apart, clock, land, home, flash, REDUCE };
}

export const heroMasses: PaperFigure = {
  // Far apart, the clock nearly full.
  still: CYCLE + 0.66 * CYCLE,
  create(): PaperDraw {
    return (ctx, w, h, t) => {
      const wide = w >= h;
      const top = phoneArt(w, h);
      const U = wide ? clamp(Math.min(h * 0.3, w * 0.19), 120, 270) : clamp(top * 0.29, 80, 120);
      const cx = wide ? w * 0.775 : w * 0.5;
      const cy = wide ? h * 0.48 : top * 0.66;
      const { n, p, apart, clock, land, home, flash, REDUCE } = state(t);
      const r = U * 0.3;
      const D = U * 0.5;
      // This time's outcome, and where the last one left the mass.
      const side = (k: number) => (((k * 7 + 3) % 5) % 2 ? 1 : -1);
      const ang = -0.35;
      const ux = Math.cos(ang);
      const uy = Math.sin(ang);
      const lastX = side(n - 1) * D;
      const base = home * lastX;
      let bx = base + apart * D;
      let px = base - apart * D;
      if (p >= REDUCE) {
        const to = side(n) * D;
        bx = D + (to - D) * land;
        px = -D + (to + D) * land;
      }

      ctx.globalCompositeOperation = 'multiply';
      // The clock: a ring, filling.
      const CR = U * 0.95;
      ctx.strokeStyle = rgba(RGB.indigo, 0.18);
      ctx.lineWidth = clamp(U * 0.012, 1.5, 3);
      ctx.beginPath();
      ctx.arc(cx, cy, CR, 0, Math.PI * 2);
      ctx.stroke();
      if (clock > 0 && p < REDUCE + 0.08) {
        ctx.strokeStyle = rgba(RGB.indigo, 0.9 * (1 - smoothstep(REDUCE, REDUCE + 0.08, p)));
        ctx.lineWidth = clamp(U * 0.03, 3, 8);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, CR, -Math.PI / 2, -Math.PI / 2 + clock * Math.PI * 2);
        ctx.stroke();
      }
      // Ticks round the clock.
      ctx.strokeStyle = rgba(RGB.indigo, 0.35);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2;
        const l = i % 5 ? U * 0.025 : U * 0.05;
        ctx.moveTo(cx + Math.cos(a) * (CR + U * 0.035), cy + Math.sin(a) * (CR + U * 0.035));
        ctx.lineTo(
          cx + Math.cos(a) * (CR + U * 0.035 + l),
          cy + Math.sin(a) * (CR + U * 0.035 + l)
        );
      }
      ctx.stroke();

      // The flare where the mass lands.
      const acc = hexToRgb(T.accent);
      if (flash > 0.01) {
        const fx = cx + side(n) * D * ux;
        const fy = cy + side(n) * D * uy;
        const gr = r * 2.6;
        const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, gr);
        glow.addColorStop(0, rgba(acc, 0.9 * flash));
        glow.addColorStop(1, rgba(acc, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(fx - gr, fy - gr, gr * 2, gr * 2);
      }
      // The line between the two places: E_G grows with it.
      if (apart > 0.05 && p < REDUCE + 0.04) {
        ctx.strokeStyle = rgba(RGB.indigo, 0.5 * Math.min(1, apart * 2));
        ctx.lineWidth = 1.3;
        ctx.setLineDash([2, 5]);
        ctx.beginPath();
        ctx.moveTo(cx + px * ux, cy + px * uy);
        ctx.lineTo(cx + bx * ux, cy + bx * uy);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // The mass: a yellow body under each copy, the two inks over it.
      ctx.globalCompositeOperation = 'source-over';
      for (const x of [bx, px]) {
        ctx.fillStyle = tint(T.accent, 0.6);
        ctx.beginPath();
        ctx.arc(cx + x * ux, cy + x * uy, r * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      // Paper under the inks, so they print clean, not over yellow.
      ctx.fillStyle = '#fffaf2';
      ctx.beginPath();
      for (const x of [bx, px]) {
        ctx.moveTo(cx + x * ux + r, cy + x * uy);
        ctx.arc(cx + x * ux, cy + x * uy, r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.globalCompositeOperation = 'multiply';
      for (const [col, x] of [
        [RGB.blue, bx],
        [RGB.pink, px],
      ] as const) {
        ctx.fillStyle = rgba(col, 0.88);
        ctx.beginPath();
        ctx.arc(cx + x * ux, cy + x * uy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // The one formula, quietly.
      const fonts = printFonts(ctx.canvas);
      const size = clamp(U * 0.07, 11, 15);
      ctx.fillStyle = INK.indigo;
      ctx.globalAlpha = 0.85;
      ctx.font = `500 ${size}px ${fonts.body}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      const main = 'τ ≈ ℏ / E';
      const sub = 'G';
      const wm = ctx.measureText(main).width;
      ctx.font = `500 ${size * 0.68}px ${fonts.body}`;
      const ws = ctx.measureText(sub).width;
      const x0 = cx - (wm + ws) / 2;
      const y0 = cy + CR + U * 0.14 + size;
      ctx.font = `500 ${size}px ${fonts.body}`;
      ctx.fillText(main, x0, y0);
      ctx.font = `500 ${size * 0.68}px ${fonts.body}`;
      ctx.fillText(sub, x0 + wm + 1, y0 + size * 0.22);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
