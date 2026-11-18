import { hexToRgb } from '../../theme';
import { RGB, T, rgba, tint } from './inks';
import { PLATE_STILL, clamp, phoneArt, plateState } from './heroKit';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate L, "Moiré" (abstract): two sets of rings, one printed blue,
 * one pink, their centres apart. Where they cross they make a moiré, the
 * pattern of two things at once. On the A–C rhythm the centres slide
 * together, the rings land on each other and print indigo, one clean
 * target, and its centre flares; then they drift apart again.
 */

const RINGS = 15;

export const heroMoire: PaperFigure = {
  still: PLATE_STILL,
  create(): PaperDraw {
    return (ctx, w, h, t) => {
      const wide = w >= h;
      const top = phoneArt(w, h);
      const R = wide ? clamp(Math.min(h * 0.32, w * 0.17), 120, 270) : clamp(top * 0.32, 85, 140);
      const cx = wide ? w * 0.76 : w * 0.5;
      const cy = wide ? h * 0.5 : top * 0.64;
      const { sep, flash } = plateState(t);
      const gap = R / RINGS;
      // Apart along a slow diagonal, so the moiré turns as it opens.
      const ang = -0.5 + 0.25 * Math.sin(t * 0.13);
      const d = R * 0.17 * sep;
      const ox = Math.cos(ang) * d;
      const oy = Math.sin(ang) * d;

      // A warm ground, and the flare at the centre when they meet.
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = tint(T.accent, 0.22);
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.04, 0, Math.PI * 2);
      ctx.fill();
      const acc = hexToRgb(T.accent);
      const gr = R * (0.3 + 0.5 * flash);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
      glow.addColorStop(0, rgba(acc, 0.6 + 0.4 * flash));
      glow.addColorStop(1, rgba(acc, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(cx - gr, cy - gr, gr * 2, gr * 2);

      for (const [col, sign] of [
        [RGB.blue, -1],
        [RGB.pink, 1],
      ] as const) {
        const x = cx + sign * ox;
        const y = cy + sign * oy;
        ctx.lineWidth = gap * 0.46;
        for (let k = 1; k <= RINGS; k++) {
          ctx.strokeStyle = rgba(col, 0.88 * (1 - (k / RINGS) ** 3 * 0.55));
          ctx.beginPath();
          ctx.arc(x, y, k * gap, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = rgba(col, 0.9);
        ctx.beginPath();
        ctx.arc(x, y, gap * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
