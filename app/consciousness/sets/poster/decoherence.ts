import { clamp, rng, smoothstep } from '../../visuals/palette';
import { INK, RGB, rgba } from './inks';
import type { PaperDraw, PaperFigure } from './paperFigure';
import { drawRuns, pow10, printFonts, type Run } from './type';

/**
 * Q4, decoherence: two published estimates on one clock.
 *
 * Two lanes share one time ruler, from a femtosecond to a second on a log
 * scale (each tick ten times the last). In each lane the same quantum state
 * starts out in two places at once: a blue and a pink copy, joined by indigo
 * rungs (their coherence, the "both at once"). As time runs along the ruler
 * the state leaves a trail; around it, water molecules jostle (warm, wet,
 * crowded). The rungs fade where the environment has destroyed the
 * superposition, and from there the state is in one place only: an
 * ordinary state. In the top lane that happens at about 10⁻¹³ s (Tegmark
 * 2000); in the bottom lane at 10⁻⁵ to 10⁻⁴ s (Hagan, Hameroff and
 * Tuszyński 2002). The gap between them, eight to nine powers of ten, is
 * marked on the ruler as unmeasured. A dashed line marks the ~25 ms the
 * theory first needed.
 *
 * Even-handed by construction: the two lanes are drawn alike, and which copy
 * survives alternates between them each cycle. The fade follows the actual
 * decay, exp(−t/τ), plotted on the log axis.
 */

const CYCLE = 13;
const LG0 = -15;
const LG1 = 0;
const SWEEP_START = 1.3;
const SWEEP_DUR = 7.5; // 0.5 s of animation per power of ten
const THEORY_LG = Math.log10(0.025);

interface Lane {
  label: string;
  short: string;
  lgTau: number;
  range: [number, number] | null;
  value: Run[];
}

const LANES: Lane[] = [
  {
    label: 'Tegmark’s estimate (2000)',
    short: 'Tegmark (2000)',
    lgTau: -13,
    range: null,
    value: [...pow10(-13), { text: ' s' }],
  },
  {
    label: 'Hagan, Hameroff & Tuszyński’s estimate (2002)',
    short: 'Hagan, Hameroff & Tuszyński (2002)',
    lgTau: -4.5,
    range: [-5, -4],
    value: [...pow10(-5), { text: '–' }, ...pow10(-4), { text: ' s' }],
  },
];

const lgAt = (tc: number) => LG0 + clamp((tc - SWEEP_START) / SWEEP_DUR) * (LG1 - LG0);
const tcAt = (lg: number) => SWEEP_START + ((lg - LG0) / (LG1 - LG0)) * SWEEP_DUR;
/** Coherence left at time 10^lg for a lifetime 10^lgTau: exp(−t/τ). */
const coherence = (lg: number, lgTau: number) => Math.exp(-Math.pow(10, lg - lgTau));

interface Molecule {
  x: number;
  y: number;
  rot: number;
  f: [number, number, number];
  p: [number, number, number];
}

interface Plate {
  key: string;
  mol: Molecule[];
}

function bake(w: number, h: number, top: number, bottom: number): Plate {
  const r = rng(4242);
  const gap = clamp(w * 0.05, 19, 34);
  const mol: Molecule[] = [];
  for (let y = top + gap * 0.4; y < bottom; y += gap * 0.86) {
    for (let x = gap * 0.3; x < w; x += gap) {
      mol.push({
        x: x + (r() - 0.5) * gap * 0.9,
        y: y + (r() - 0.5) * gap * 0.7,
        rot: r() * Math.PI * 2,
        f: [1.6 + r() * 1.6, 2.3 + r() * 1.9, 0.9 + r() * 1.2],
        p: [r() * 7, r() * 7, r() * 7],
      });
    }
  }
  return { key: `${w}x${h}`, mol };
}

export const decoherence: PaperFigure = {
  still: 10.2,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t) => {
      const fonts = printFonts(ctx.canvas);
      const tc = ((t % CYCLE) + CYCLE) % CYCLE;
      const round = Math.floor(t / CYCLE);
      const fade = smoothstep(0, 0.6, tc) * (1 - smoothstep(CYCLE - 0.7, CYCLE, tc));
      const narrow = w < 520;

      // ---- layout
      const L = w * 0.06;
      const R = w * 0.94;
      const xOf = (lg: number) => L + ((lg - LG0) / (LG1 - LG0)) * (R - L);
      const axisY = h * (narrow ? 0.79 : 0.8);
      const laneY = [h * 0.3, h * 0.6];
      const d = clamp(h * 0.042, 8, 19); // half the distance between the two places
      const rad = d * 0.6;
      const small = clamp(w * 0.017, 10, 13);
      const valueSize = clamp(h * 0.052, 15, 27);
      const unit = clamp(w / 640, 0.62, 1.4);
      const headLg = lgAt(tc);

      if (!plate || plate.key !== `${w}x${h}`) plate = bake(w, h, h * 0.06, axisY - 12);

      ctx.globalAlpha = fade;

      // ---- the crowd: water molecules jostling, behind everything
      const ro = clamp(w * 0.0052, 1.9, 3.6);
      ctx.fillStyle = rgba(RGB.indigo, 0.12);
      for (const m of plate.mol) {
        const jx = ro * 1.7 * (Math.sin(t * m.f[0] + m.p[0]) + 0.5 * Math.sin(t * m.f[1] + m.p[1]));
        const jy = ro * 1.7 * (Math.cos(t * m.f[1] + m.p[2]) + 0.5 * Math.sin(t * m.f[0] + m.p[1]));
        const rot = m.rot + 0.7 * Math.sin(t * m.f[2] + m.p[0]);
        const x = m.x + jx;
        const y = m.y + jy;
        ctx.beginPath();
        ctx.arc(x, y, ro, 0, Math.PI * 2);
        for (const s of [-1, 1]) {
          const a = rot + s * 0.91;
          const hx = x + Math.cos(a) * ro * 1.15;
          const hy = y + Math.sin(a) * ro * 1.15;
          ctx.moveTo(hx + ro * 0.62, hy);
          ctx.arc(hx, hy, ro * 0.62, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // Clear the crowd from behind the words and the lanes' cores.
      const knock = (x: number, y: number, ww: number, hh: number) => {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, ww, hh, 4);
        ctx.fill();
        ctx.restore();
      };
      for (const y of laneY) knock(L - rad * 2, y - d * 0.55, R - L + rad * 4, d * 1.1);

      // ---- the time the theory first needed (~25 ms, one gamma cycle)
      const xt = xOf(THEORY_LG);
      ctx.save();
      ctx.strokeStyle = rgba(RGB.indigo, 0.45);
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(xt, h * 0.1);
      ctx.lineTo(xt, axisY);
      ctx.stroke();
      ctx.restore();
      const theoryText = narrow
        ? 'Orch OR first needed ~25 ms'
        : 'What Orch OR first needed: ~25 ms';
      ctx.font = `500 ${small}px ${fonts.body}`;
      const tw = ctx.measureText(theoryText).width;
      knock(xt - tw - 10, h * 0.1 - small - 2, tw + 8, small + 7);
      ctx.fillStyle = rgba(RGB.relief, 0.95);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(theoryText, xt - 6, h * 0.1 + 1);

      // ---- the two lanes
      LANES.forEach((lane, li) => {
        const y = laneY[li];
        const yA = y - d; // the blue copy
        const yB = y + d; // the pink copy
        // Which copy is left once it decoheres; alternates, and differs
        // between the lanes, so neither colour is the answer.
        const keepA = (round + li) % 2 === 0;
        const x0 = xOf(LG0);
        const xh = xOf(headLg);

        // Lane label, above.
        const ly = y - d - rad - valueSize - h * 0.035;
        ctx.font = `500 ${small}px ${fonts.body}`;
        const text = narrow ? lane.short : lane.label;
        const lw = ctx.measureText(text).width;
        knock(L - 4, ly - small, lw + 8, small + 6);
        ctx.fillStyle = rgba(RGB.relief, 1);
        ctx.textAlign = 'left';
        ctx.fillText(text, L, ly);

        // The value: a pin (or a bracket for a range) and the number.
        const vx = lane.range ? (xOf(lane.range[0]) + xOf(lane.range[1])) / 2 : xOf(lane.lgTau);
        const vy = y - d - rad - 6 * unit;
        ctx.strokeStyle = INK.indigo;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        if (lane.range) {
          const a = xOf(lane.range[0]);
          const b = xOf(lane.range[1]);
          ctx.moveTo(a, vy + 4);
          ctx.lineTo(a, vy);
          ctx.lineTo(b, vy);
          ctx.lineTo(b, vy + 4);
        } else {
          ctx.moveTo(vx, vy + 4);
          ctx.lineTo(vx, vy - 1);
        }
        ctx.stroke();
        const vfont = `650 {size} ${fonts.display}`;
        ctx.fillStyle = INK.indigo;
        drawRuns(ctx, lane.value, vx, vy - 5 * unit, vfont, valueSize, 'center');

        // Dotted drop from the estimate to the ruler.
        ctx.save();
        ctx.strokeStyle = rgba(RGB.indigo, 0.32);
        ctx.lineWidth = 1;
        ctx.setLineDash([1.5, 3.5]);
        ctx.beginPath();
        for (const lg of lane.range ?? [lane.lgTau]) {
          ctx.moveTo(xOf(lg), yB + rad + 4);
          ctx.lineTo(xOf(lg), axisY - 3);
        }
        ctx.stroke();
        ctx.restore();

        // The trail up to now: two rails (two places) and rungs between
        // them (both at once), fading as coherence is lost.
        const seg = 3;
        const railW = 2.2 * unit;
        ctx.lineCap = 'butt';
        for (let x = x0; x < xh; x += seg) {
          const x2 = Math.min(xh, x + seg);
          const lg = LG0 + ((x - L) / (R - L)) * (LG1 - LG0);
          const c = coherence(lg, lane.lgTau);
          const aA = keepA ? 1 : c;
          const aB = keepA ? c : 1;
          if (c > 0.02) {
            // The "both at once": a band between the two places.
            ctx.fillStyle = rgba(RGB.indigo, 0.1 * c);
            ctx.fillRect(x, yA, x2 - x + 0.3, yB - yA);
          }
          ctx.lineWidth = railW;
          if (aA > 0.02) {
            ctx.strokeStyle = rgba(RGB.blue, aA);
            ctx.beginPath();
            ctx.moveTo(x, yA);
            ctx.lineTo(x2 + 0.4, yA);
            ctx.stroke();
          }
          if (aB > 0.02) {
            ctx.strokeStyle = rgba(RGB.pink, aB);
            ctx.beginPath();
            ctx.moveTo(x, yB);
            ctx.lineTo(x2 + 0.4, yB);
            ctx.stroke();
          }
        }
        const rungGap = clamp(w * 0.0085, 3.6, 6.5);
        ctx.lineWidth = 1.15 * unit;
        for (let x = x0 + rungGap; x < xh - rad * 0.8; x += rungGap) {
          const lg = LG0 + ((x - L) / (R - L)) * (LG1 - LG0);
          const c = coherence(lg, lane.lgTau);
          if (c < 0.02) continue;
          ctx.strokeStyle = rgba(RGB.indigo, 0.82 * c);
          ctx.beginPath();
          ctx.moveTo(x, yA + railW);
          ctx.lineTo(x, yB - railW);
          ctx.stroke();
        }
        ctx.lineCap = 'round';

        // The state now: two copies while coherent, one once it is not.
        const c = coherence(headLg, lane.lgTau);
        const discs: [number, readonly number[], number][] = [
          [yA, RGB.blue, keepA ? 1 : c],
          [yB, RGB.pink, keepA ? c : 1],
        ];
        // Rungs between the copies.
        if (c > 0.02) {
          ctx.strokeStyle = rgba(RGB.indigo, 0.82 * c);
          ctx.lineWidth = 1.15 * unit;
          for (const dx of [-rad * 0.45, 0, rad * 0.45]) {
            ctx.beginPath();
            ctx.moveTo(xh + dx, yA + rad * 0.7);
            ctx.lineTo(xh + dx, yB - rad * 0.7);
            ctx.stroke();
          }
        }
        for (const [yy, col, a] of discs) {
          if (a < 0.02) continue;
          ctx.fillStyle = rgba(col, 0.95 * a);
          ctx.beginPath();
          ctx.arc(xh, yy, rad, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = rgba([255, 250, 242], 0.85 * a);
          ctx.beginPath();
          ctx.arc(xh - rad * 0.32, yy - rad * 0.32, rad * 0.24, 0, Math.PI * 2);
          ctx.fill();
        }
        // The moment the crowd wins: one ring where the copies were.
        const tHit = tcAt(lane.lgTau);
        const age = tc - tHit;
        if (age > 0 && age < 0.9) {
          const k = age / 0.9;
          ctx.strokeStyle = rgba(RGB.indigo, 0.5 * (1 - k));
          ctx.lineWidth = 1.4 * unit;
          ctx.beginPath();
          ctx.ellipse(
            xh,
            y,
            rad * 1.4 + k * d * 1.6,
            d + rad * 1.2 + k * d * 1.2,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
      });

      // Words on the long lane, once the trail has reached them.
      if (!narrow) {
        const y = laneY[1];
        ctx.font = `italic 500 ${small * 0.95}px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(RGB.relief, 0.9);
        const xBoth = xOf(-9.5);
        if (xOf(headLg) > xBoth + 30) {
          const tw2 = ctx.measureText('both places at once').width;
          knock(xBoth - tw2 / 2 - 4, y + d + rad + 3, tw2 + 8, small + 6);
          ctx.fillText('both places at once', xBoth, y + d + rad + small + 3);
        }
        const xOne = xOf(-1.6) - (xOf(-1.6) - xOf(-4)) / 2;
        if (xOf(headLg) > xOne + 30) {
          const tw3 = ctx.measureText('one place: ordinary').width;
          knock(xOne - tw3 / 2 - 4, y + d + rad + 3, tw3 + 8, small + 6);
          ctx.fillText('one place: ordinary', xOne, y + d + rad + small + 3);
        }
      }

      // ---- the ruler
      ctx.strokeStyle = INK.indigo;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(L, axisY);
      ctx.lineTo(R, axisY);
      ctx.stroke();
      ctx.lineWidth = 1;
      for (let lg = LG0; lg <= LG1; lg++) {
        const major = lg % 3 === 0;
        ctx.beginPath();
        ctx.moveTo(xOf(lg), axisY);
        ctx.lineTo(xOf(lg), axisY + (major ? 6 : 3.5));
        ctx.stroke();
      }
      const names: Record<number, string> = {
        [-15]: '1 fs',
        [-12]: '1 ps',
        [-9]: '1 ns',
        [-6]: '1 µs',
        [-3]: '1 ms',
        [0]: '1 s',
      };
      ctx.font = `500 ${small}px ${fonts.body}`;
      ctx.fillStyle = rgba(RGB.relief, 1);
      ctx.textBaseline = 'top';
      for (const [lg, name] of Object.entries(names)) {
        const x = xOf(Number(lg));
        ctx.textAlign = Number(lg) === LG0 ? 'left' : Number(lg) === LG1 ? 'right' : 'center';
        ctx.fillText(name, Number(lg) === LG0 ? x - 2 : Number(lg) === LG1 ? x + 2 : x, axisY + 9);
      }
      // Where "now" is on the ruler.
      const xn = xOf(headLg);
      ctx.fillStyle = INK.indigo;
      ctx.beginPath();
      ctx.moveTo(xn, axisY - 1);
      ctx.lineTo(xn - 4.5, axisY - 8);
      ctx.lineTo(xn + 4.5, axisY - 8);
      ctx.closePath();
      ctx.fill();

      // The open question: the span between the two estimates.
      const ga = xOf(LANES[0].lgTau);
      const gb = xOf(LANES[1].lgTau);
      const gy = axisY + 9 + small + h * 0.035;
      ctx.strokeStyle = INK.indigo;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(ga, gy - 4);
      ctx.lineTo(ga, gy);
      ctx.lineTo(gb, gy);
      ctx.lineTo(gb, gy - 4);
      ctx.stroke();
      const gapRuns: Run[] = narrow
        ? [
            { text: '10' },
            { text: '8', sup: true },
            { text: '–10' },
            { text: '9', sup: true },
            { text: '× apart. Never measured.' },
          ]
        : [
            { text: 'A gap of 10' },
            { text: '8', sup: true },
            { text: '–10' },
            { text: '9', sup: true },
            { text: '×. Nobody has measured it in a neuron.' },
          ];
      ctx.fillStyle = INK.indigo;
      drawRuns(
        ctx,
        gapRuns,
        (ga + gb) / 2,
        gy + small + 5,
        `600 {size} ${fonts.body}`,
        small,
        'center'
      );

      ctx.globalAlpha = 1;
      ctx.textBaseline = 'alphabetic';
    };
  },
};
