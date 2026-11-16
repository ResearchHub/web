import { contours } from 'd3-contour';
import {
  BLUE,
  OCHRE,
  RED,
  fract,
  hash2,
  label,
  rgba,
  smoothstep,
  stillAt,
  type Engraving,
  type FrameCtx,
} from './plate';

/**
 * Fig. 3: the Wigner function of a "cat" state, one particle in two places
 * at once (x = ±a), engraved as a relief map. d3-contour cuts the surface
 * into level terraces, stacked in oblique view; the two hills are washed
 * madder red and Prussian blue, and the ripples between them (the
 * interference term 2·D·e^{-x²-p²}·cos(2ap)) dip below the ground where the
 * function goes negative, which the engraver marks with cross-hatching. The
 * environment (specks crossing the plate) drives the coherence D from 1 to
 * 0: the ripples level out and two plain hills remain; then it is
 * re-prepared. Timing as in the Ink set.
 */

const CYCLE = 9;
const XMAX = 4.4;
const PMAX = 2.5;
const SEP = 2.35;
const NX = 120;
const NP = 64;
const POS = Array.from({ length: 13 }, (_, i) => 0.08 + i * 0.15);
const NEG = [0.08, 0.22, 0.36, 0.5, 0.64];

function coherence(t: number) {
  const p = fract(t / CYCLE) * CYCLE;
  if (p < 1.6) return 1;
  if (p < 7.6) return Math.exp(-(p - 1.6) / 1.15);
  return smoothstep(7.6, 8.9, p);
}

function wignerAt(x: number, p: number, d: number, theta: number) {
  const g1 = Math.exp(-((x - SEP) ** 2) - p * p);
  const g2 = Math.exp(-((x + SEP) ** 2) - p * p);
  const gi = Math.exp(-x * x - p * p) * Math.cos(2 * SEP * p + theta);
  return g1 + g2 + 2 * d * gi;
}

const values = new Array<number>(NX * NP).fill(0);
const negValues = new Array<number>(NX * NP).fill(0);
const gen = contours().size([NX, NP]).smooth(true);

export const wigner: Engraving = {
  still: stillAt(2.2),
  labels: () => ({ fig: 'Fig. 3.', title: 'Wigner function of a particle in two places' }),
  draw(f: FrameCtx, t: number) {
    const { ctx, ink, wash, w, h, family } = f;
    const d = coherence(t);
    const theta = Math.sin(t * 0.5) * 0.6;

    // Oblique view: x across, p receding, value up.
    const left = w * 0.08;
    const right = w * 0.92;
    const top = h * 0.38;
    const bottom = h * 0.86;
    const amp = h * 0.19;
    const narrow = 0.2;
    const cx = (left + right) / 2;
    const project = (x: number, p: number, v: number): [number, number] => {
      const depth = (PMAX - p) / (2 * PMAX); // 0 back, 1 front
      const half = ((right - left) / 2) * (1 - narrow * (1 - depth));
      return [cx + (x / XMAX) * half, top + depth * (bottom - top) - v * amp];
    };
    const gx = (i: number) => -XMAX + ((i - 0.5) / (NX - 1)) * 2 * XMAX;
    const gp = (j: number) => -PMAX + ((j - 0.5) / (NP - 1)) * 2 * PMAX;

    for (let j = 0; j < NP; j++) {
      const p = gp(j + 0.5);
      for (let i = 0; i < NX; i++) {
        const v = wignerAt(gx(i + 0.5), p, d, theta);
        values[i + j * NX] = v;
        negValues[i + j * NX] = -v;
      }
    }

    const ringPts = (ring: number[][], level: number) => {
      const pts: number[] = [];
      for (const [a, b] of ring) {
        const [x, y] = project(gx(a), gp(b), level);
        pts.push(x, y);
      }
      return pts;
    };
    const tracePoly = (pts: number[]) => {
      ctx.moveTo(pts[0], pts[1]);
      for (let k = 2; k < pts.length; k += 2) ctx.lineTo(pts[k], pts[k + 1]);
      ctx.closePath();
    };

    // The ground: its edge and a light engraved grid.
    ink.begin();
    for (let x = -4; x <= 4; x += 1) {
      const a = project(x, PMAX, 0);
      const b = project(x, -PMAX, 0);
      ink.seg(a[0], a[1], b[0], b[1]);
    }
    for (let p = -2; p <= 2; p += 1) {
      const a = project(-XMAX, p, 0);
      const b = project(XMAX, p, 0);
      ink.seg(a[0], a[1], b[0], b[1]);
    }
    ink.stroke(0.16, 0.5);
    const c1 = project(-XMAX, PMAX, 0);
    const c2 = project(XMAX, PMAX, 0);
    const c3 = project(XMAX, -PMAX, 0);
    const c4 = project(-XMAX, -PMAX, 0);
    ink.begin();
    ink.poly([...c1, ...c2, ...c3, ...c4], true);
    ink.stroke(0.55, 0.8);
    // Fine ruling across the ground, as the engraver tones a flat plane.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(c1[0], c1[1]);
    ctx.lineTo(c2[0], c2[1]);
    ctx.lineTo(c3[0], c3[1]);
    ctx.lineTo(c4[0], c4[1]);
    ctx.closePath();
    ctx.clip();
    ink.begin();
    for (let y = c1[1]; y < c3[1]; y += 3.2) ink.seg(c4[0] - 20, y, c3[0] + 20, y);
    ink.stroke(0.1, 0.4);
    ctx.restore();

    // Negative dips: lowered below the ground and cross-hatched, deeper
    // dips hatched again, so tone deepens with depth.
    const neg = NEG.map((thr) => gen.contour(negValues, thr));
    neg.forEach((mp, li) => {
      const level = -NEG[li];
      for (const poly of mp.coordinates) {
        const pts = ringPts(poly[0], level);
        ctx.save();
        ctx.beginPath();
        tracePoly(pts);
        ctx.fillStyle = rgba([232, 220, 192], 0.9);
        ctx.fill();
        ctx.clip();
        let minx = Infinity;
        let maxx = -Infinity;
        let miny = Infinity;
        let maxy = -Infinity;
        for (let k = 0; k < pts.length; k += 2) {
          minx = Math.min(minx, pts[k]);
          maxx = Math.max(maxx, pts[k]);
          miny = Math.min(miny, pts[k + 1]);
          maxy = Math.max(maxy, pts[k + 1]);
        }
        const sp = 3.2 - li * 0.25;
        const span = maxy - miny;
        ink.begin();
        for (let x = minx - span; x < maxx + span; x += sp) {
          if (li % 2 === 0) ink.seg(x, maxy, x + span, miny);
          else ink.seg(x, miny, x + span, maxy);
        }
        ink.stroke(0.5, 0.45);
        ctx.restore();
        ink.begin();
        ink.poly(pts, true);
        ink.stroke(0.6, 0.5);
      }
    });

    // Positive terraces, lowest first: each level filled with paper (so
    // it stands over the levels below) and its edge cut in line.
    const pos = POS.map((thr) => gen.contour(values, thr));
    pos.forEach((mp, li) => {
      const level = POS[li];
      for (const poly of mp.coordinates) {
        const pts = ringPts(poly[0], level);
        ctx.beginPath();
        tracePoly(pts);
        for (let hIdx = 1; hIdx < poly.length; hIdx++) tracePoly(ringPts(poly[hIdx], level));
        const lift = Math.min(1, level / 1.6);
        ctx.fillStyle = rgba(
          [Math.round(232 + 16 * lift), Math.round(220 + 18 * lift), Math.round(193 + 30 * lift)],
          1
        );
        ctx.fill('evenodd');
        // The riser below each edge: a short vertical tick every few px,
        // drawn down to the level beneath, like an engraver's hachure.
        ink.begin();
        const step = Math.max(1, Math.round(pts.length / 2 / 140));
        for (let k = 0; k < pts.length; k += 2 * step) {
          ink.seg(pts[k], pts[k + 1], pts[k], pts[k + 1] + amp * 0.15);
        }
        ink.stroke(0.36, 0.45);
        ink.begin();
        ink.poly(pts, true);
        ink.stroke(0.5 + 0.35 * (li / POS.length), 0.55 + 0.25 * (li / POS.length));

        // Wash: each hill by its side; the ripples between are left in ink.
        let sx = 0;
        for (const [a] of poly[0]) sx += gx(a);
        sx /= poly[0].length;
        if (Math.abs(sx) > 1.1 && li < 7) {
          wash.poly(pts, sx < 0 ? RED : BLUE, 0.22 + 0.05 * li, 1.4);
        } else if (Math.abs(sx) <= 1.1 && li < 4) {
          wash.poly(pts, OCHRE, 0.12 * d, 1);
        }
      }
    });

    // The environment: specks crossing while coherence is lost.
    const rate = 1 - d;
    ink.begin();
    for (let i = 0; i < 34; i++) {
      const speed = 0.3 + hash2(i, 7) * 0.35;
      const fr = fract(t * speed + hash2(i, 3));
      const y = h * 0.2 + hash2(i, 11) * h * 0.66;
      const x = left - 30 + fr * (right - left + 60);
      const a = rate * Math.sin(Math.PI * fr);
      if (a < 0.08) continue;
      ink.seg(x - 14 * a, y, x, y);
      ink.circle(x, y, 1.1);
    }
    ink.stroke(0.7, 0.6);

    // Lettering.
    const sz = Math.max(10, Math.min(15, w * 0.019));
    const [lx, ly] = project(-SEP, -PMAX, 0);
    const [rx, ry] = project(SEP, -PMAX, 0);
    label(ctx, '−a', lx, ly + sz * 1.1, sz, family, { align: 'center' });
    label(ctx, '+a', rx, ry + sz * 1.1, sz, family, { align: 'center' });
    const [ax, ay] = project(XMAX, -PMAX, 0);
    label(ctx, 'x', ax + 8, ay, sz, family);
    const [bx, by] = project(XMAX, PMAX, 0);
    label(ctx, 'p', bx + 8, by, sz, family);
    // "interference", lettered above the plate with a leader down to the
    // ripples; it fades as they level out.
    const [, backY] = project(0, PMAX, 0);
    const [rx0, ry0] = project(0, 0.6, Math.max(0.05, 0.75 * d));
    const ly0 = Math.max(f.frame.y0 + sz * 3.2, backY - sz * 2.2);
    const ia = 0.2 + 0.65 * d;
    label(ctx, 'interference', rx0 + sz * 0.6, ly0, sz * 0.95, family, { alpha: ia });
    ink.begin();
    ink.seg(rx0 + sz * 0.3, ly0 + sz * 0.2, rx0, ry0 - 4);
    ink.stroke(0.6 * ia, 0.5);

    // Coherence, engraved as a small scale at the right.
    const gx0 = f.frame.x1 - sz * 1.6;
    const gy1 = Math.min(h * 0.42, backY - sz * 1.6);
    const gy0 = Math.max(f.frame.y0 + sz * 3.4, gy1 - h * 0.22);
    ink.begin();
    ink.seg(gx0, gy0, gx0, gy1);
    for (let k = 0; k <= 4; k++) {
      const y = gy1 - ((gy1 - gy0) * k) / 4;
      ink.seg(gx0 - 3, y, gx0 + 3, y);
    }
    ink.stroke(0.7, 0.6);
    const gy = gy1 - (gy1 - gy0) * d;
    ink.begin();
    ink.poly([gx0 - 9, gy - 4, gx0 - 4, gy, gx0 - 9, gy + 4], true);
    ink.stroke(0.9, 0.8);
    label(ctx, 'D', gx0, gy0 - sz, sz * 0.95, family, { align: 'center' });

    wash.apply(ctx);
  },
};
