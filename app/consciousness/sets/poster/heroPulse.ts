import { hexToRgb } from '../../theme';
import { hash2 } from '../../visuals/palette';
import { RGB, T, rgba, tint } from './inks';
import { clamp, phoneArt, smoothstep } from './heroKit';
import { easeInOut } from './pathKit';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate O, "Pulse" (abstract): a stream of moments as a trace of
 * bars, like a recording, running off towards the headline. The newest bar
 * is printed twice, a blue bar and a pink bar of different heights side by
 * side: two possible moments. It settles on one height, the two inks land
 * on each other in indigo, the column flares, and the trace moves on. One
 * moment every 1.6 s.
 */

const PERIOD = 1.6;

/** The height of moment `k`'s winning and losing bars, 0..1. */
function heights(k: number) {
  const smooth = 0.5 + 0.28 * Math.sin(k * 0.37) + 0.16 * Math.sin(k * 0.91 + 1.3);
  const win = clamp(smooth + (hash2(k, 1) - 0.5) * 0.5, 0.12, 1);
  const lose = clamp(win + (hash2(k, 2) < 0.5 ? -1 : 1) * (0.25 + hash2(k, 3) * 0.35), 0.1, 1);
  return { win, lose: Math.abs(lose - win) < 0.15 ? clamp(win - 0.3, 0.1, 1) : lose };
}

export const heroPulse: PaperFigure = {
  // The newest moment still two bars.
  still: 6 * PERIOD + 0.2 * PERIOD,
  create(): PaperDraw {
    return (ctx, w, h, t) => {
      const wide = w >= h;
      const top = phoneArt(w, h);
      const cy = wide ? h * 0.5 : top * 0.64;
      const A = wide ? clamp(h * 0.27, 110, 260) : clamp(top * 0.24, 60, 100);
      const pitch = wide ? clamp(w * 0.021, 14, 28) : 13;
      const bw = pitch * 0.52;
      const xNew = wide ? w * 0.92 : w * 0.88;
      const xEnd = wide ? w * 0.56 : w * 0.02;
      const n = Math.floor(t / PERIOD);
      const p = t / PERIOD - n;
      const move = p < 0.6 ? 0 : easeInOut((p - 0.6) / 0.4);
      const settle = smoothstep(0.22, 0.42, p);
      const flash = p < 0.36 ? 0 : Math.exp(-((p - 0.36) * PERIOD) / 0.35);

      ctx.globalCompositeOperation = 'multiply';
      ctx.lineCap = 'round';
      // The baseline, in yellow.
      ctx.strokeStyle = tint(T.accent, 0.6);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xEnd, cy);
      ctx.lineTo(xNew + pitch * 1.5, cy);
      ctx.stroke();
      // The "now" column glows as a moment settles.
      const acc = hexToRgb(T.accent);
      const gl = ctx.createRadialGradient(xNew, cy, 0, xNew, cy, A * 1.1);
      gl.addColorStop(0, rgba(acc, 0.35 + 0.55 * flash));
      gl.addColorStop(1, rgba(acc, 0));
      ctx.fillStyle = gl;
      ctx.fillRect(xNew - A * 1.1, cy - A * 1.1, A * 2.2, A * 2.2);

      const count = Math.ceil((xNew - xEnd) / pitch) + 2;
      ctx.lineWidth = bw;
      for (let k = 0; k <= count; k++) {
        const id = n - k;
        const x = xNew - (k + move) * pitch;
        if (x < xEnd - pitch) continue;
        const fade = smoothstep(xEnd, xEnd + (xNew - xEnd) * 0.45, x);
        if (fade < 0.02) continue;
        const { win, lose } = heights(id);
        if (k === 0) {
          // Two bars of different heights, side by side, settling into one.
          const off = (1 - settle) * bw * 0.95;
          const hl = lose + (win - lose) * settle;
          const winIsBlue = hash2(id, 4) < 0.5;
          for (const [col, sign, hh] of [
            [RGB.blue, -1, winIsBlue ? win : hl],
            [RGB.pink, 1, winIsBlue ? hl : win],
          ] as const) {
            ctx.strokeStyle = rgba(col, 0.9);
            ctx.beginPath();
            ctx.moveTo(x + sign * off, cy - hh * A);
            ctx.lineTo(x + sign * off, cy + hh * A);
            ctx.stroke();
          }
        } else {
          // Settled moments: one indigo bar each (both inks on each other).
          for (const col of [RGB.blue, RGB.pink]) {
            ctx.strokeStyle = rgba(col, 0.9 * fade);
            ctx.beginPath();
            ctx.moveTo(x, cy - win * A);
            ctx.lineTo(x, cy + win * A);
            ctx.stroke();
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
