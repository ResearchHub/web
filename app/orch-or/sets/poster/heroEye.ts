import { hexToRgb } from '../../theme';
import { hash2 } from '../../visuals/palette';
import { INK, RGB, T, rgba, tint } from './inks';
import { clamp, phoneArt, smoothstep } from './heroKit';
import { easeInOut } from './pathKit';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate G, "Eye": someone looking. The iris is a microtubule seen
 * end-on, the ring of 13 tubulins from hero B round a dark core (the pupil).
 * Every tubulin carries a blue and a pink mark turned apart round the ring:
 * two states at once. The eye moves the way eyes do, in jumps; each time it
 * lands on something the marks turn into register and print indigo, one
 * moment of seeing, then drift apart again. Now and then it blinks.
 */

const PF = 13;
const PERIOD = 3.2;
/** Every this many fixations, a blink. */
const BLINK_EVERY = 4;

interface Plate {
  key: string;
  cx: number;
  cy: number;
  E: number;
}

function bake(w: number, h: number): Plate {
  const wide = w >= h;
  const top = phoneArt(w, h);
  const E = wide ? clamp(Math.min(w * 0.34, h * 0.6), 250, 520) : clamp(w * 0.68, 210, 310);
  return {
    key: `${w}x${h}`,
    cx: wide ? w * 0.76 : w * 0.5,
    cy: wide ? h * 0.5 : top * 0.66,
    E,
  };
}

/** Where the eye looks during fixation `n`, in units of the eye's width. */
function gaze(n: number): [number, number] {
  // Mostly towards the headline, on its left.
  return [-0.075 + (hash2(n, 1) - 0.6) * 0.11, (hash2(n, 2) - 0.5) * 0.05];
}

function eyeState(t: number) {
  const n = Math.floor(t / PERIOD);
  const p = t / PERIOD - n;
  // The jump to the new target: quick, at the start of the period.
  const jump = smoothstep(0, 0.045, p);
  const [x0, y0] = gaze(n - 1);
  const [x1, y1] = gaze(n);
  // The marks: apart, turning into register after landing, held, apart.
  let sep: number;
  if (p < 0.06) sep = 1;
  else if (p < 0.22) sep = 1 - easeInOut((p - 0.06) / 0.16);
  else if (p < 0.56) sep = 0;
  else sep = easeInOut((p - 0.56) / 0.4);
  const flash = p < 0.22 ? 0 : Math.exp(-((p - 0.22) * PERIOD) / 0.45);
  // A blink rides on some jumps (0 = shut).
  const bp =
    (((t + PERIOD * 0.02) % (PERIOD * BLINK_EVERY)) + PERIOD * BLINK_EVERY) %
    (PERIOD * BLINK_EVERY);
  const open = bp < 0.26 ? Math.abs(Math.cos((bp / 0.26) * Math.PI * 0.5 * 2)) ** 0.7 : 1;
  return {
    gx: x0 + (x1 - x0) * jump,
    gy: y0 + (y1 - y0) * jump,
    sep: Math.min(1, Math.max(0, sep)),
    flash,
    open,
  };
}

type Pt = [number, number];
const lerp = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

export const heroEye: PaperFigure = {
  // Between two fixations: the marks apart, two states at once.
  still: 2 * PERIOD + 0.8 * PERIOD,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t) => {
      if (!plate || plate.key !== `${w}x${h}`) plate = bake(w, h);
      const { cx, cy, E } = plate;
      const { gx, gy, sep, flash, open } = eyeState(t);
      const P = (x: number, y: number): Pt => [cx + x * E, cy + y * E];

      // The opening: corners, and the lids' control points.
      const L = P(-0.5, 0.035);
      const R = P(0.5, -0.015);
      const lo1 = P(-0.2, 0.29);
      const lo2 = P(0.24, 0.26);
      // Shut, the upper lid lies just above the lower one.
      const up1 = lerp(P(-0.2, 0.25), P(-0.22, -0.37), open);
      const up2 = lerp(P(0.24, 0.22), P(0.22, -0.35), open);
      const opening = new Path2D();
      opening.moveTo(...L);
      opening.bezierCurveTo(...up1, ...up2, ...R);
      opening.bezierCurveTo(...lo2, ...lo1, ...L);
      opening.closePath();

      const line = clamp(E * 0.0065, 1.6, 3.2);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // A warm light round the eye when it lands.
      if (flash > 0.01) {
        const gr = E * 0.5;
        const [ix, iy] = P(gx, gy);
        const glow = ctx.createRadialGradient(ix, iy, 0, ix, iy, gr);
        glow.addColorStop(0, rgba(hexToRgb(T.accent), 0.5 * flash));
        glow.addColorStop(1, rgba(hexToRgb(T.accent), 0));
        ctx.fillStyle = glow;
        ctx.fillRect(ix - gr, iy - gr, gr * 2, gr * 2);
      }

      // The lid above the opening, up to the crease: a yellow band.
      const cL = P(-0.4, -0.04);
      const cR = P(0.46, -0.08);
      const crease = new Path2D();
      crease.moveTo(...cL);
      crease.bezierCurveTo(...P(-0.2, -0.43), ...P(0.24, -0.43), ...cR);
      const band = new Path2D();
      band.moveTo(...L);
      band.bezierCurveTo(...up1, ...up2, ...R);
      band.lineTo(...cR);
      band.bezierCurveTo(...P(0.24, -0.43), ...P(-0.2, -0.43), ...cL);
      band.closePath();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = tint(T.accent, 0.4);
      ctx.fill(band);
      // A little shade under the lower lid.
      ctx.fillStyle = tint(T.accent, 0.14);
      ctx.beginPath();
      ctx.moveTo(...L);
      ctx.bezierCurveTo(...lo1, ...lo2, ...R);
      ctx.bezierCurveTo(...P(0.26, 0.34), ...P(-0.2, 0.37), ...L);
      ctx.fill();

      // The eyeball, inside the opening.
      ctx.save();
      ctx.clip(opening);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#fffaf2';
      ctx.fill(opening);
      ctx.globalCompositeOperation = 'multiply';
      // The upper lid's shadow on the eye.
      const sh = ctx.createLinearGradient(0, cy - E * 0.3, 0, cy - E * 0.05);
      sh.addColorStop(0, rgba(RGB.indigo, 0.16));
      sh.addColorStop(1, rgba(RGB.indigo, 0));
      ctx.fillStyle = sh;
      ctx.fill(opening);

      const [ix, iy] = P(gx, gy);
      const IR = E * 0.215;
      // The iris: a yellow disc with fine radial fibres.
      ctx.fillStyle = tint(T.accent, 0.5);
      ctx.beginPath();
      ctx.arc(ix, iy, IR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = rgba(RGB.indigo, 0.18);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2 + hash2(i, 9) * 0.05;
        const r0 = IR * (0.42 + hash2(i, 4) * 0.12);
        ctx.moveTo(ix + Math.cos(a) * r0, iy + Math.sin(a) * r0);
        ctx.lineTo(ix + Math.cos(a) * IR * 0.97, iy + Math.sin(a) * IR * 0.97);
      }
      ctx.stroke();
      ctx.strokeStyle = rgba(RGB.indigo, 0.85);
      ctx.lineWidth = line * 0.8;
      ctx.beginPath();
      ctx.arc(ix, iy, IR, 0, Math.PI * 2);
      ctx.stroke();

      // The ring of 13: tubulins round the core, alpha and beta.
      const ringR = IR * 0.66;
      const br = IR * 0.22;
      for (let k = 0; k < PF; k++) {
        const a = (k / PF) * Math.PI * 2 - Math.PI / 2;
        const x = ix + Math.cos(a) * ringR;
        const y = iy + Math.sin(a) * ringR;
        ctx.fillStyle = tint(T.accent, k % 2 ? 0.62 : 0.88);
        ctx.beginPath();
        ctx.arc(x, y, br, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = rgba(RGB.indigo, 0.8);
        ctx.lineWidth = Math.max(1, line * 0.55);
        ctx.stroke();
      }

      // The two plates: a blue and a pink mark on each tubulin, turned apart.
      const phi = (Math.PI / PF) * 0.45 * sep;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#fffaf2';
      ctx.beginPath();
      for (let k = 0; k < PF; k++)
        for (const sign of [1, -1]) {
          const a = (k / PF) * Math.PI * 2 - Math.PI / 2 + sign * phi;
          const x = ix + Math.cos(a) * ringR;
          const y = iy + Math.sin(a) * ringR;
          ctx.moveTo(x + br * 0.5, y);
          ctx.arc(x, y, br * 0.5, 0, Math.PI * 2);
        }
      ctx.fill();
      ctx.globalCompositeOperation = 'multiply';
      for (const [col, sign] of [
        [RGB.blue, 1],
        [RGB.pink, -1],
      ] as const) {
        ctx.fillStyle = rgba(col, 0.92);
        ctx.beginPath();
        for (let k = 0; k < PF; k++) {
          const a = (k / PF) * Math.PI * 2 - Math.PI / 2 + sign * phi;
          const x = ix + Math.cos(a) * ringR;
          const y = iy + Math.sin(a) * ringR;
          ctx.moveTo(x + br * 0.45, y);
          ctx.arc(x, y, br * 0.45, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // The pupil: the tube's hollow core, a little smaller when it lands.
      const pr = IR * 0.35 * (1 - 0.08 * flash);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = INK.indigo;
      ctx.beginPath();
      ctx.arc(ix, iy, pr, 0, Math.PI * 2);
      ctx.fill();
      // Catchlight.
      ctx.fillStyle = '#fffaf2';
      ctx.beginPath();
      ctx.ellipse(ix - pr * 0.42, iy - pr * 0.44, pr * 0.3, pr * 0.24, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Outlines: the lids, the crease, a few lashes.
      ctx.globalCompositeOperation = 'multiply';
      ctx.strokeStyle = INK.indigo;
      ctx.lineWidth = line;
      ctx.beginPath();
      ctx.moveTo(...L);
      ctx.bezierCurveTo(...up1, ...up2, ...R);
      ctx.stroke();
      ctx.lineWidth = line * 0.7;
      ctx.strokeStyle = rgba(RGB.indigo, 0.75);
      ctx.beginPath();
      ctx.moveTo(...L);
      ctx.bezierCurveTo(...lo1, ...lo2, ...R);
      ctx.stroke();
      ctx.strokeStyle = rgba(RGB.indigo, 0.6);
      ctx.stroke(crease);

      // Lashes on the outer half of the upper lid.
      const bez = (u: number): Pt => {
        const a = (1 - u) ** 3;
        const b = 3 * (1 - u) ** 2 * u;
        const c = 3 * (1 - u) * u * u;
        const d = u ** 3;
        return [
          a * L[0] + b * up1[0] + c * up2[0] + d * R[0],
          a * L[1] + b * up1[1] + c * up2[1] + d * R[1],
        ];
      };
      ctx.strokeStyle = INK.indigo;
      ctx.lineWidth = line * 0.75;
      ctx.beginPath();
      for (let i = 0; i < 9; i++) {
        const u = 0.3 + i * 0.08;
        const [x, y] = bez(u);
        const [x2, y2] = bez(u + 0.01);
        // Outward normal (up), leaning towards the outer corner.
        let nx = y2 - y;
        let ny = -(x2 - x);
        const nl = Math.hypot(nx, ny) || 1;
        nx /= nl;
        ny /= nl;
        if (ny > 0) {
          nx = -nx;
          ny = -ny;
        }
        const len = E * (0.035 + 0.025 * Math.sin((i / 8) * Math.PI)) * (0.4 + 0.6 * open);
        const lean = -0.25 + i * 0.1;
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(
          x + nx * len * 0.6,
          y + ny * len * 0.6,
          x + (nx + lean) * len,
          y + (ny + lean * 0.15) * len
        );
      }
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
