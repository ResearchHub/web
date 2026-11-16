import { hexToRgb } from '../../theme';
import { hash2 } from '../../visuals/palette';
import { INK, RGB, T, rgba, tint } from './inks';
import { clamp, phoneArt, smoothstep } from './heroKit';
import { GLYPHS, glyph, type Glyph } from './heroMoments';
import { cubicTrack, easeInOut, trackAt, type Track } from './pathKit';
import { printFonts } from './type';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate F, "Film": experience as a film running through the
 * present. The strip's edges are a microtubule's lattice, tubulin beads in
 * two yellows where a film has sprocket holes. Frames still to come hold two
 * possible pictures at once, one printed blue, one pink. At the gate marked
 * "now" one picture wins: the other plate fades and the winner prints in
 * both inks, indigo, one moment of experience. Past frames run on, settled,
 * and fade. One frame every 2.4 s, against the theory's ~40 a second.
 */

const PERIOD = 2.4;
/** Frames drawn either side of the gate. */
const AHEAD = 3;
const BEHIND = 3;

interface Plate {
  key: string;
  track: Track;
  gate: number;
  /** Frame window across and along the strip, and the slot pitch. */
  fw: number;
  fh: number;
  pitch: number;
  wide: boolean;
}

function bake(w: number, h: number): Plate {
  const wide = w >= h;
  const top = phoneArt(w, h);
  const fw = wide ? clamp(Math.min(h * 0.17, w * 0.14), 90, 165) : clamp(top * 0.33, 76, 124);
  const fh = fw * 0.74;
  const pitch = fh + fw * 0.2;
  // Wide: a strip falling down the right half, curving towards the text
  // below it. Phone: across the top of the screen, right to left.
  const track = wide
    ? cubicTrack(
        [w * 0.88, -h * 0.25],
        [w * 0.85, h * 0.25],
        [w * 0.81, h * 0.68],
        [w * 0.52, h * 1.3]
      )
    : cubicTrack(
        [w * 1.6, top * 0.5],
        [w * 0.9, top * 0.72],
        [w * 0.4, top * 0.6],
        [-w * 0.7, top * 0.68]
      );
  // The gate sits where the strip crosses the middle of the art.
  const target = wide ? h * 0.52 : w * 0.56;
  let gate = 0;
  let best = Infinity;
  track.pts.forEach(([x, y], i) => {
    const dd = Math.abs((wide ? y : x) - target);
    if (dd < best) {
      best = dd;
      gate = track.len[i];
    }
  });
  return { key: `${w}x${h}`, track, gate, fw, fh, pitch, wide };
}

/** Each frame's two possible pictures and which of them is seen. */
function frameOf(id: number) {
  const n = GLYPHS.length;
  const i = Math.floor(hash2(id, 3) * n);
  const j = (i + 1 + Math.floor(hash2(id, 5) * (n - 1))) % n;
  return { a: GLYPHS[i] as Glyph, b: GLYPHS[j] as Glyph, winA: hash2(id, 11) < 0.5 };
}

/** The strip advances one frame per period: hold, decide at the gate, move on. */
function filmState(t: number) {
  const n = Math.floor(t / PERIOD);
  const p = t / PERIOD - n;
  const adv = p < 0.62 ? 0 : easeInOut((p - 0.62) / 0.38);
  // The frame at the gate decides between p .26 and .42.
  const c = smoothstep(0.26, 0.42, p);
  const flash = p < 0.36 ? 0 : Math.exp(-((p - 0.36) * PERIOD) / 0.45);
  return { n, p, adv, c, flash };
}

export const heroFilm: PaperFigure = {
  // A frame at the gate still holding both pictures.
  still: 3 * PERIOD + 0.16 * PERIOD,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t) => {
      if (!plate || plate.key !== `${w}x${h}`) plate = bake(w, h);
      const P = plate;
      const { fw, fh, pitch } = P;
      const { n, adv, c, flash } = filmState(t);
      const sw = fw * 1.46;
      const margin = (sw - fw) / 2;
      const gp = trackAt(P.track, P.gate);
      const line = clamp(fw * 0.024, 1.3, 2.6);

      // A warm light behind the gate when a frame settles.
      if (flash > 0.01) {
        const gr = fw * 1.3;
        const glow = ctx.createRadialGradient(gp.x, gp.y, 0, gp.x, gp.y, gr);
        glow.addColorStop(0, rgba(hexToRgb(T.accent), 0.75 * flash));
        glow.addColorStop(1, rgba(hexToRgb(T.accent), 0));
        ctx.fillStyle = glow;
        ctx.fillRect(gp.x - gr, gp.y - gr, gr * 2, gr * 2);
      }

      // Future frames first, so the settled ones print over them.
      for (let k = -AHEAD; k <= BEHIND + 1; k++) {
        const id = n - k;
        // Slots from the gate: negative still to come, positive past.
        const s = k + adv;
        const alpha =
          smoothstep(-AHEAD + 0.4, -AHEAD + 1.8, s) * (1 - smoothstep(BEHIND - 1.4, BEHIND, s));
        if (alpha < 0.01) continue;
        const at = trackAt(P.track, P.gate + s * pitch);
        const near = Math.exp(-(s * s) / 0.6);
        const sc = 1 + 0.12 * near;
        // 0 = both pictures, 1 = one picture.
        const decided = k > 0 ? 1 : k === 0 ? c : 0;
        const f = frameOf(id);

        ctx.save();
        ctx.translate(at.x, at.y);
        ctx.rotate(at.a - Math.PI / 2);
        ctx.scale(sc, sc);

        // The strip's cell: yellow film, a paper window.
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = tint(T.accent, 0.32 * alpha);
        ctx.fillRect(-sw / 2, -pitch / 2 - 0.5, sw, pitch + 1);
        ctx.fillStyle = rgba([255, 250, 242], alpha);
        ctx.beginPath();
        ctx.roundRect(-fw / 2, -fh / 2, fw, fh, fw * 0.06);
        ctx.fill();

        ctx.globalCompositeOperation = 'multiply';
        // Sprocket edges: tubulin beads, alpha and beta, along both sides.
        const nb = 4;
        for (const side of [-1, 1]) {
          for (let j = 0; j < nb; j++) {
            const bx = side * (fw / 2 + margin / 2);
            const by = -pitch / 2 + ((j + 0.5) * pitch) / nb;
            ctx.beginPath();
            ctx.ellipse(bx, by, margin * 0.3, (pitch / nb) * 0.4, 0, 0, Math.PI * 2);
            ctx.fillStyle = tint(T.accent, (j % 2 ? 0.55 : 0.85) * alpha);
            ctx.fill();
            ctx.strokeStyle = rgba(RGB.indigo, 0.55 * alpha);
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
        ctx.strokeStyle = rgba(RGB.indigo, 0.35 * alpha);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-fw / 2, -fh / 2, fw, fh, fw * 0.06);
        ctx.stroke();

        // The pictures, upright on the page whatever the strip's angle.
        ctx.rotate(-(at.a - Math.PI / 2));
        ctx.lineWidth = line / sc;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        const r = fh * 0.4;
        const win = f.winA ? f.a : f.b;
        const lose = f.winA ? f.b : f.a;
        // Out of register while undecided.
        const off = (1 - decided) * clamp(fw * 0.03, 2, 4);
        const plates: [readonly number[], Glyph, number, number][] = [
          // ink, picture, alpha, offset sign
          [f.winA ? RGB.blue : RGB.pink, win, 1, f.winA ? -1 : 1],
          [f.winA ? RGB.pink : RGB.blue, lose, 1 - decided, f.winA ? 1 : -1],
          [f.winA ? RGB.pink : RGB.blue, win, decided, f.winA ? 1 : -1],
        ];
        for (const [col, kind, a, sign] of plates) {
          if (a < 0.01) continue;
          ctx.save();
          ctx.translate(sign * off, sign * off * 0.5);
          ctx.strokeStyle = rgba(col, 0.95 * a * alpha);
          ctx.beginPath();
          glyph(ctx, kind, r);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      }

      // The gate: corner marks round the present frame, and its name.
      ctx.globalCompositeOperation = 'multiply';
      ctx.save();
      ctx.translate(gp.x, gp.y);
      ctx.rotate(gp.a - Math.PI / 2);
      const gx = sw / 2 + fw * 0.07;
      const gy = fh / 2 + fw * 0.17;
      const arm = fw * 0.16;
      ctx.strokeStyle = INK.indigo;
      ctx.lineWidth = clamp(fw * 0.02, 1.6, 2.6);
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (const sx of [-1, 1])
        for (const sy of [-1, 1]) {
          ctx.moveTo(sx * gx, sy * (gy - arm));
          ctx.lineTo(sx * gx, sy * gy);
          ctx.lineTo(sx * (gx - arm), sy * gy);
        }
      ctx.stroke();
      ctx.restore();

      const fonts = printFonts(ctx.canvas);
      const size = clamp(fw * 0.11, 11, 14);
      ctx.fillStyle = INK.indigo;
      ctx.font = `600 ${size}px ${fonts.body}`;
      ctx.textBaseline = 'middle';
      if (P.wide) {
        // Outside the strip, on the side away from the text.
        ctx.textAlign = 'left';
        ctx.fillText('now', gp.x + gx + fw * 0.12, gp.y);
      } else {
        ctx.textAlign = 'center';
        ctx.fillText('now', gp.x, gp.y + gx + fw * 0.14);
      }
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
