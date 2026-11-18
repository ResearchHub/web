import {
  BLUE,
  RED,
  beadHatch,
  clamp,
  label,
  rgba,
  rng,
  smoothstep,
  stillAt,
  type Engraving,
  type FrameCtx,
  type Rgb,
} from './plate';

/**
 * Fig. 2: superradiance in a microtubule, engraved. The tube lies on its
 * side with its cut end open: 13 protofilaments round the hollow core. Each
 * tubulin carries tryptophan. First the tryptophans emit on their own:
 * scattered small blue flashes, and the trace beneath decays slowly. Then
 * an excitation runs along the tube, every site pulses in step (red) and
 * they emit together: one burst, cut as radiating rays, N times brighter
 * and N times shorter. The trace keeps both curves. Schematic; timing as in
 * the Ink set.
 */

const CYCLE = 10;
const PF = 13;
const IND_START = 0.3;
const IND_TAU = 1.3;
const WAVE_START = 4.6;
const WAVE_DUR = 0.7;
const BURST = 5.6;
const BURST_TAU = 0.26;
const TRACE_T = 3;

const r = rng(1013);
const SITES: { k: number; j: number; emit: number }[] = [];
for (let k = 0; k < PF; k++) {
  for (let j = 0; j < 40; j++) {
    SITES.push({ k, j, emit: IND_START - Math.log(1 - r() * 0.98) * IND_TAU });
  }
}

const indCurve = (tau: number) => (tau < 0 ? 0 : 0.3 * Math.exp(-tau / IND_TAU));
const burstCurve = (tau: number) =>
  tau < -0.06 ? 0 : tau < 0 ? 0.95 * smoothstep(-0.06, 0, tau) : 0.95 * Math.exp(-tau / BURST_TAU);

export const superradiance: Engraving = {
  still: stillAt(5.8),
  labels: () => ({ fig: 'Fig. 2.', title: 'Tryptophan light in a microtubule' }),
  draw(f: FrameCtx, t: number) {
    const { ctx, ink, wash, w, h, family, frame } = f;
    const tc = ((t % CYCLE) + CYCLE) % CYCLE;
    const out = 1 - smoothstep(CYCLE - 0.8, CYCLE - 0.1, tc);
    const phone = w < 640;

    const R = Math.min(h * 0.14, w * (phone ? 0.13 : 0.1));
    const cy = h * (phone ? 0.36 : 0.37);
    const skew = 0.5;
    const x0 = frame.x0 + w * 0.06 + R * skew * 1.2;
    const len = frame.x1 - w * 0.06 - x0;
    const s = len / Math.round(len / (R * 0.3));
    const mr = s * 0.4;
    const roll = 0.25;
    const project = (u: number, th: number) => {
      const z = Math.cos(th);
      return { x: x0 + u - skew * R * z, y: cy + R * Math.sin(th), z };
    };
    const traceTop = h * 0.6;

    const front = x0 + clamp((tc - WAVE_START) / WAVE_DUR) * len;
    const inPhase = tc >= WAVE_START && tc < BURST + 0.9;
    const pulse = 0.5 + 0.5 * Math.sin((tc - WAVE_START) * Math.PI * 2 * 2.2);
    const flash = tc >= BURST ? Math.exp(-(tc - BURST) / BURST_TAU) : 0;
    const build = smoothstep(WAVE_START, BURST, tc) * (tc < BURST ? 1 : 0);
    const settle = 1 - smoothstep(BURST + 0.5, BURST + 1.4, tc);

    // The burst: rays cut outward from the tube, kept within the plate
    // above the trace, and a red bloom round the tube.
    const age = tc - BURST;
    const mx = x0 + len * 0.5 - skew * R * 0.5;
    if (age > -0.05 && age < 2) {
      const reach = smoothstep(-0.05, 0.3, age);
      const fade = 1 - smoothstep(0.5, 2, age);
      ctx.save();
      ctx.beginPath();
      ctx.rect(frame.x0 + 4, frame.y0 + 46, frame.x1 - frame.x0 - 8, traceTop - frame.y0 - 46 - 18);
      ctx.clip();
      ink.begin();
      const n = 72;
      const ex = len * 0.5 + R * 0.9;
      const ey = R * 1.45;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + 0.03;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const k = 1 / Math.sqrt((ca * ca) / (ex * ex) + (sa * sa) / (ey * ey));
        const long = i % 3 === 0 ? 1 : i % 3 === 1 ? 0.55 : 0.75;
        const r1 = k + R * (0.35 + 0.75 * long) * reach;
        ink.seg(mx + ca * k, cy + sa * k, mx + ca * r1, cy + sa * r1);
      }
      ink.stroke(0.75 * fade * out, 0.6);
      ctx.restore();
      wash.blot(
        mx,
        cy,
        Math.min(ex * 1.02, (frame.x1 - frame.x0) / 2 - 8),
        ey * 1.05,
        RED,
        0.3 * fade * reach * out,
        31
      );
    }

    // The tube's far end: an ellipse, faint.
    const ell = (cx: number, rx: number, ry: number) => {
      const pts: number[] = [];
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        pts.push(cx - rx * Math.cos(a), cy + ry * Math.sin(a));
      }
      return pts;
    };
    ink.begin();
    ink.poly(ell(x0 + len, skew * R * 1.12, R * 1.12));
    ink.stroke(0.35 * out, 0.6);

    // The cylinder's edges, and long lines along its lower flank in shadow.
    ink.begin();
    ink.seg(x0, cy - R * 1.12, x0 + len, cy - R * 1.12);
    ink.seg(x0, cy + R * 1.12, x0 + len, cy + R * 1.12);
    ink.stroke(0.7 * out, 0.85);
    ink.begin();
    for (let i = 0; i < 12; i++) {
      const a = 0.35 + (i / 11) * 1.2;
      const y = cy + R * 1.12 * Math.sin(a);
      ink.seg(x0 - skew * R * Math.cos(a), y, x0 + len - skew * R * Math.cos(a), y);
    }
    ink.stroke(0.2 * out, 0.45);

    // Near wall: tryptophan sites on the tubulin beads.
    const beads: { x: number; y: number; rad: number; tone: number; a: boolean }[] = [];
    for (const site of SITES) {
      const th = (site.k / PF) * Math.PI * 2 + roll;
      const u = s * 0.6 + site.j * s + (((site.k * 3) / PF) % 1) * s;
      if (u > len - s * 0.4) continue;
      const p = project(u, th);
      if (p.z < 0.05) continue;
      const rad = mr * (0.75 + 0.3 * p.z);
      const tone = clamp(0.2 + 0.5 * smoothstep(-0.4, 1, Math.sin(th)) + 0.3 * (1 - p.z));
      beads.push({ x: p.x, y: p.y, rad, tone, a: site.j % 2 === 0 });
      const lum = (0.55 + 0.45 * p.z) * out;

      // On its own: a small blue flash and a few short rays.
      const ageI = tc - site.emit;
      if (ageI >= 0 && ageI < 0.55 && tc < WAVE_START) {
        const fI = 1 - ageI / 0.55;
        wash.blot(
          p.x,
          p.y,
          rad * (1.05 + 0.4 * fI),
          rad * (1.05 + 0.4 * fI),
          BLUE,
          0.85 * fI * lum,
          site.k * 41 + site.j
        );
        ink.begin();
        for (let q = 0; q < 8; q++) {
          const a = (q / 8) * Math.PI * 2 + 0.2;
          ink.seg(
            p.x + Math.cos(a) * rad * 1.35,
            p.y + Math.sin(a) * rad * 1.35,
            p.x + Math.cos(a) * rad * (1.5 + 1.3 * fI),
            p.y + Math.sin(a) * rad * (1.5 + 1.3 * fI)
          );
        }
        ink.stroke(0.7 * fI * lum, 0.5);
      }
      // In step: lit as the excitation passes, all at one phase.
      if (inPhase && p.x <= front) {
        const lit = smoothstep(front, front - len * 0.1, p.x);
        const a = ((0.25 + 0.45 * pulse * (0.4 + build)) * (1 - flash) * lit + flash) * settle;
        wash.blot(
          p.x,
          p.y,
          rad * 1.18,
          rad * 1.18,
          RED,
          Math.min(0.8, a) * lum,
          site.k * 59 + site.j
        );
      }
    }
    for (const b of beads) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.rad, 0, Math.PI * 2);
      ctx.fillStyle = rgba([243, 234, 213], out);
      ctx.fill();
    }
    ink.begin();
    for (const b of beads) ink.circle(b.x, b.y, b.rad);
    ink.stroke(0.75 * out, 0.6);
    ink.begin();
    for (const b of beads) {
      beadHatch(ink, b.x, b.y, b.rad, -1.9, b.tone, Math.max(1.5, b.rad * 0.28));
      if (b.a && b.rad > 3) ink.circle(b.x - b.rad * 0.12, b.y - b.rad * 0.14, b.rad * 0.15);
    }
    ink.stroke(0.55 * out, 0.42);

    // The open end: the hollow core (hatched dark) and the 13 strands
    // round it, end on.
    const core = ell(x0, skew * R * 0.72, R * 0.72);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(core[0], core[1]);
    for (let i = 2; i < core.length; i += 2) ctx.lineTo(core[i], core[i + 1]);
    ctx.closePath();
    ctx.fillStyle = rgba([226, 212, 182], out);
    ctx.fill();
    ctx.clip();
    ink.begin();
    for (let y = cy - R; y < cy + R; y += 2.4) ink.seg(x0 - R, y + R * 0.2, x0 + R, y - R * 0.2);
    ink.stroke(0.45 * out, 0.45);
    ctx.restore();
    ink.begin();
    ink.poly(core);
    ink.poly(ell(x0, skew * R * 1.12, R * 1.12));
    ink.stroke(0.75 * out, 0.75);
    const rimR = Math.min(mr * 1.3, R * 0.24);
    for (let k = 0; k < PF; k++) {
      const th = (k / PF) * Math.PI * 2 + roll;
      const p = project(0, th);
      const px = x0 - skew * R * 0.92 * Math.cos(th);
      const py = cy + R * 0.92 * Math.sin(th);
      ctx.beginPath();
      ctx.arc(px, py, rimR, 0, Math.PI * 2);
      ctx.fillStyle = rgba([243, 234, 213], out);
      ctx.fill();
      ink.begin();
      ink.circle(px, py, rimR);
      ink.stroke(0.85 * out, 0.65);
      ink.begin();
      beadHatch(ink, px, py, rimR, -1.9, 0.32 + 0.2 * (1 - p.z) * 0.5, 2.1);
      ink.stroke(0.55 * out, 0.45);
    }

    // Lettering.
    const sz = Math.max(10, Math.min(15, w * 0.019));
    label(ctx, 'open end', x0, cy + R * 1.12 + sz * 1.2, sz * 0.9, family, {
      align: 'center',
      alpha: 0.7 * out,
    });

    // The trace: intensity against time, both curves on one pair of axes.
    const left = w * 0.1;
    const right = w * 0.9;
    const base = h * 0.88;
    const height = h * 0.25;
    const xOf = (tau: number) => left + (clamp(tau, 0, TRACE_T) / TRACE_T) * (right - left);
    ink.begin();
    ink.seg(left, base, right, base);
    ink.seg(left, base, left, base - height * 1.05);
    for (let k = 0; k <= 6; k++) {
      const x = left + ((right - left) * k) / 6;
      ink.seg(x, base, x, base + 4);
    }
    ink.stroke(0.7 * out, 0.6);
    const n = 120;
    const curve = (fn: (tau: number) => number, upTo: number, colour: Rgb, from = 0) => {
      if (upTo <= from) return null;
      const pts: number[] = [];
      for (let i = 0; i <= n; i++) {
        const tau = from + ((upTo - from) * i) / n;
        pts.push(xOf(tau), base - fn(tau) * height);
      }
      ink.begin();
      ink.poly(pts);
      ink.stroke(0.9 * out, 1.1, colour);
      // Hatched beneath, and washed.
      ink.begin();
      for (let i = 0; i <= n; i += 2) ink.seg(pts[i * 2], pts[i * 2 + 1], pts[i * 2], base);
      ink.stroke(0.3 * out, 0.45, colour);
      wash.poly([...pts, xOf(upTo), base, xOf(from), base], colour, 0.4 * out, 0.8);
      return pts;
    };
    curve(indCurve, Math.min(TRACE_T, tc - IND_START), BLUE);
    curve(burstCurve, Math.min(TRACE_T, tc - BURST), RED, -0.06);

    if (tc - IND_START > 0.6)
      label(ctx, 'on their own', xOf(1.6), base - indCurve(1.6) * height - sz * 1.2, sz, family, {
        alpha: 0.85 * out,
      });
    if (tc - BURST > 0.05)
      label(ctx, 'in step', xOf(0.05) + sz * 0.6, base - height * 0.9, sz, family, {
        alpha: 0.85 * out,
      });
    label(ctx, 'time →', right, base + sz * 1.3, sz * 0.9, family, { align: 'right', alpha: 0.7 });
    label(ctx, 'light', left + 5, base - height * 1.05, sz * 0.9, family, {
      align: 'left',
      alpha: 0.7,
    });

    wash.apply(ctx);
  },
};
