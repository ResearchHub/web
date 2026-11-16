import {
  BLUE,
  RED,
  SEPIA,
  beadHatch,
  clamp,
  hash2,
  label,
  mixRgb,
  rgba,
  smoothstep,
  stillAt,
  type Engraving,
  type FrameCtx,
  type Rgb,
} from './plate';

/**
 * Plate I: a microtubule in perspective, engraved. 13 protofilaments of
 * alternating α- and β-tubulin wound as a 3-start helix round a hollow
 * core, which shows at the open near end. Each bead is cut as a sphere:
 * an outline and chords of hatching on its shadow side.
 *
 * The cycle: one inked tube splits into two copies, pushed apart by a wave
 * running along the tube (two states at once). Both stay crisp engravings;
 * each bead is hand-coloured inside its line, madder red in one copy and
 * Prussian blue in the other. The nearer copy is cut over the farther one,
 * whose lines break where it passes behind. Then one copy is chosen (equal
 * odds), settles back to the axis, and its colour gives way to plain ink
 * from where the choice began; the other copy fades.
 */

/** Displacement of a copy from the axis at lx: [across, towards the eye]. */
type Offset = (lx: number) => readonly [number, number];
const NONE: Offset = () => [0, 0];
const FILL: Rgb = [244, 236, 216];

const PF = 13;
const NM = 4.1; // monomer length, nm
const R = 10.6; // tube radius to the monomer centres, nm
const BEAD = 2.05; // drawn monomer radius, nm
const CYCLE = 9.5;
const SPLIT0 = 0.9;
const SPLIT1 = 2.4;
const COLLAPSE = 6.4;
const CAMERA = 330;
const LIGHT = (() => {
  const v = [-0.55, 0.6, 0.6];
  const n = Math.hypot(v[0], v[1], v[2]);
  return v.map((x) => x / n) as [number, number, number];
})();

interface Layout {
  cx: number;
  cy: number;
  f: number;
  tilt: number;
  yaw: number;
  rows: number;
  phone: boolean;
}

function layout(w: number, h: number): Layout {
  const phone = w < 768;
  const rows = phone ? 34 : 40;
  const L = rows * NM;
  const yaw = 0.72;
  // The rectangle the subject owns: the right of a wide hero (the text is
  // on the left), the top of a phone hero (the text is below).
  // It may run a little off the plate: larger and more confident.
  const [rx0, ry0, rx1, ry1] = phone ? [0.1, 0.12, 1.04, 0.46] : [0.5, 0.05, 1.04, 0.9];
  const box = { x0: rx0 * w, y0: ry0 * h, x1: rx1 * w, y1: ry1 * h };
  const tilt = Math.atan2(box.y1 - box.y0, box.x1 - box.x0) * (phone ? 0.75 : 1.05);
  // Project the tube at unit scale, then fit its bounds (with room for the
  // two copies' spread) into the box.
  const unit: Layout = { cx: 0, cy: 0, f: 1, tilt, yaw, rows, phone };
  const project = projector(unit);
  let minx = Infinity;
  let miny = Infinity;
  let maxx = -Infinity;
  let maxy = -Infinity;
  for (const lx of [-L / 2, L / 2]) {
    for (let i = 0; i < 16; i++) {
      const th = (i / 16) * Math.PI * 2;
      const p = project(lx, Math.cos(th) * R * 1.75, Math.sin(th) * R * 1.2);
      minx = Math.min(minx, p.x);
      maxx = Math.max(maxx, p.x);
      miny = Math.min(miny, p.y);
      maxy = Math.max(maxy, p.y);
    }
  }
  const f = Math.min((box.x1 - box.x0) / (maxx - minx), (box.y1 - box.y0) / (maxy - miny));
  return {
    cx: (box.x0 + box.x1) / 2 - ((minx + maxx) / 2) * f,
    cy: (box.y0 + box.y1) / 2 - ((miny + maxy) / 2) * f,
    f,
    tilt,
    yaw,
    rows,
    phone,
  };
}

interface Bead {
  x: number;
  y: number;
  z: number;
  r: number;
  tone: number;
  alpha: boolean;
  lx: number;
  facing: number;
}

/** Local tube coordinates (lx along the axis, ly/lz across) to screen. */
function projector(o: Layout) {
  const cyw = Math.cos(o.yaw);
  const syw = Math.sin(o.yaw);
  const ct = Math.cos(o.tilt);
  const st = Math.sin(o.tilt);
  return (lx: number, ly: number, lz: number) => {
    const x1 = lx * cyw + lz * syw;
    const z1 = -lx * syw + lz * cyw;
    const x2 = x1 * ct - ly * st;
    const y2 = x1 * st + ly * ct;
    const k = CAMERA / (CAMERA - z1);
    return { x: o.cx + x2 * o.f * k, y: o.cy - y2 * o.f * k, z: z1, k };
  };
}

/** World-space normal of the tube surface at angle th, for lighting. */
function normalOf(o: Layout, th: number) {
  const ly = Math.cos(th);
  const lz = Math.sin(th);
  const x1 = lz * Math.sin(o.yaw);
  const z1 = lz * Math.cos(o.yaw);
  const ct = Math.cos(o.tilt);
  const st = Math.sin(o.tilt);
  return [x1 * ct - ly * st, x1 * st + ly * ct, z1] as const;
}

function beadsFor(o: Layout, t: number, offset: Offset): Bead[] {
  const project = projector(o);
  const L = o.rows * NM;
  const spin = t * 0.05;
  const out: Bead[] = [];
  for (let row = -1; row < o.rows; row++) {
    for (let pf = 0; pf < PF; pf++) {
      // A flat cut at both ends, so the near end is a clean ring.
      const lx = -L / 2 + row * NM + (pf * 3 * NM) / PF;
      if (lx < -L / 2 - 0.01 || lx > L / 2) continue;
      const th = (pf / PF) * Math.PI * 2 + spin;
      const n = normalOf(o, th);
      if (n[2] < -0.18 && lx > -L / 2 + 3 * NM) continue; // the far wall is hidden
      const [oy, oz] = offset(lx);
      const p = project(lx, Math.cos(th) * R + oy, Math.sin(th) * R + oz);
      const lit = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
      out.push({
        x: p.x,
        y: p.y,
        z: p.z + n[2] * 0.01,
        r: BEAD * o.f * p.k,
        tone: clamp(0.85 - lit * 0.95 + (n[2] < 0.15 ? 0.25 : 0) + (row % 2 === 0 ? 0.22 : 0)),
        alpha: row % 2 === 0,
        lx,
        facing: n[2],
      });
    }
  }
  out.sort((a, b) => a.z - b.z);
  return out;
}

/** Long lines down the shadow side of the cylinder, giving it form. */
function cylinderHatch(f: FrameCtx, o: Layout, offset: Offset, a: number) {
  if (a <= 0.01) return;
  const project = projector(o);
  const L = o.rows * NM;
  const { ink } = f;
  ink.begin();
  const lines = 12;
  for (let j = 0; j < lines; j++) {
    // Angles round the lower, shadowed flank (facing away from the light).
    const th = -Math.PI / 2 - 0.15 + (j / (lines - 1)) * 1.25;
    const pts: number[] = [];
    for (let i = 0; i <= 30; i++) {
      const lx = -L / 2 + (i / 30) * L;
      const [oy, oz] = offset(lx);
      const p = project(lx, Math.cos(th) * R * 1.1 + oy, Math.sin(th) * R * 1.1 + oz);
      pts.push(p.x, p.y);
    }
    ink.poly(pts);
  }
  ink.stroke(0.3 * a, 0.5);
}

/**
 * One copy, bead by bead from the back: a paper fill hand-coloured inside
 * the line (a touch off register, pooling darker on the shadow side), then
 * the bead's outline, its shadow hatching and the α mark. Each bead's fill
 * covers what is behind it, so lines break cleanly where beads pass in
 * front, within a copy and across copies.
 */
function drawCopy(
  f: FrameCtx,
  beads: Bead[],
  opts: { tint: Rgb | null; tintAt: (b: Bead) => number; weight: (b: Bead) => number }
) {
  const { ctx, ink } = f;
  for (const b of beads) {
    const k = opts.tint ? opts.tintAt(b) : 0;
    const pool = 0.55 + 0.45 * b.tone;
    const blot = 0.82 + 0.3 * hash2(Math.round(b.lx * 7), Math.round(b.x));
    const fill = k > 0.01 ? mixRgb(FILL, opts.tint!, Math.min(0.7, 0.46 * k * pool * blot)) : FILL;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * 1.04, 0, Math.PI * 2);
    ctx.fillStyle = rgba(FILL, 1);
    ctx.fill();
    if (k > 0.01) {
      ctx.beginPath();
      ctx.arc(b.x + b.r * 0.1, b.y - b.r * 0.07, b.r * 0.98, 0, Math.PI * 2);
      ctx.fillStyle = rgba(fill, 1);
      ctx.fill();
    }
    const wgt = opts.weight(b);
    ink.begin();
    ink.circle(b.x, b.y, b.r);
    ink.stroke(0.88, 0.62 + 0.3 * wgt);
    ink.begin();
    beadHatch(ink, b.x, b.y, b.r, -2.3, Math.min(1, b.tone * 0.95), Math.max(1.4, b.r * 0.24));
    if (b.alpha && b.r > 2.5) ink.circle(b.x - b.r * 0.12, b.y - b.r * 0.12, b.r * 0.16);
    ink.stroke(0.62 + 0.2 * wgt, 0.45 + 0.1 * wgt);
  }
}

/** The lumen at the open near end: an ellipse cut in close cross-hatching. */
function drawLumen(f: FrameCtx, o: Layout, offset: Offset, a: number) {
  if (a <= 0.01) return;
  const { ctx, ink } = f;
  const project = projector(o);
  const L = o.rows * NM;
  const lx = -L / 2 + NM * 0.5;
  const [oy, oz] = offset(lx);
  const pts: number[] = [];
  let minx = Infinity;
  let miny = Infinity;
  let maxx = -Infinity;
  let maxy = -Infinity;
  for (let i = 0; i < 40; i++) {
    const th = (i / 40) * Math.PI * 2;
    const p = project(lx, Math.cos(th) * R * 0.66 + oy, Math.sin(th) * R * 0.66 + oz);
    pts.push(p.x, p.y);
    minx = Math.min(minx, p.x);
    maxx = Math.max(maxx, p.x);
    miny = Math.min(miny, p.y);
    maxy = Math.max(maxy, p.y);
  }
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath();
  ctx.fillStyle = rgba([214, 198, 166], a);
  ctx.fill();
  ctx.clip();
  const sp = Math.max(1.6, (maxx - minx) * 0.05);
  ink.begin();
  for (let k = minx - (maxy - miny); k < maxx + (maxy - miny); k += sp) {
    ink.seg(k, miny, k + (maxy - miny) * 0.7, maxy);
  }
  ink.stroke(0.75 * a, 0.55);
  ink.begin();
  for (let k = minx - (maxy - miny); k < maxx + (maxy - miny); k += sp * 1.15) {
    ink.seg(k + (maxy - miny) * 0.7, miny, k, maxy);
  }
  ink.stroke(0.6 * a, 0.5);
  ctx.restore();
  ink.begin();
  ink.poly(pts, true);
  ink.stroke(0.9 * a, 0.9);
}

export const hero: Engraving = {
  still: stillAt(4.6),
  labels: (w, h) => {
    const m = Math.round(Math.min(w, h) * 0.03) + 6;
    return {
      fig: 'Pl. I.',
      title: 'Microtubule, in two states at once',
      at: { x: w < 768 ? m + 14 : w * 0.47, y: m + (w < 768 ? 40 : 34), align: 'left' },
    };
  },
  draw(f, t) {
    const { ctx, w, h, frame } = f;
    const o = layout(w, h);
    const tc = ((t % CYCLE) + CYCLE) % CYCLE;
    const cycle = Math.floor(t / CYCLE);
    const winner = hash2(cycle, 3) < 0.5 ? -1 : 1;
    const s = smoothstep(SPLIT0, SPLIT1, tc) * (tc < COLLAPSE ? 1 : 0);
    const collapsed = tc >= COLLAPSE;
    const age = collapsed ? tc - COLLAPSE : 0;
    const settle = smoothstep(0, 1.1, age); // the winner returns to the axis
    const loserFade = 1 - smoothstep(0.05, 0.9, age);
    const L = o.rows * NM;
    const z0 = (hash2(cycle, 9) - 0.5) * L * 0.7; // where the choice begins
    const front = age * 70; // ink spreading along the tube, nm per second
    const amp = R * 1.25;

    ctx.save();
    ctx.beginPath();
    ctx.rect(frame.x0, frame.y0, frame.x1 - frame.x0, frame.y1 - frame.y0);
    ctx.clip();

    // Before the split: one tube, inked, uncoloured.
    if (!collapsed && s < 0.02) {
      cylinderHatch(f, o, NONE, 1);
      drawLumen(f, o, NONE, 1);
      drawCopy(f, beadsFor(o, t, NONE), { tint: null, tintAt: () => 0, weight: () => 1 });
    } else {
      // Which state is nearer the eye alternates by cycle; the nearer one is
      // also pushed a little towards the viewer, so it is cut over the other.
      const nearBranch = hash2(cycle, 5) < 0.5 ? -1 : 1;
      const at = collapsed ? t - age : t;
      const copies = [-1, 1]
        .map((branch) => {
          const isWin = collapsed && branch === winner;
          const isLose = collapsed && branch !== winner;
          const k = collapsed ? (isWin ? 1 - settle : 1) : s;
          const depth = (branch === nearBranch ? 1 : -1) * R * 0.7;
          const offset: Offset = (lx) => [
            branch * k * amp * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(lx * 0.055 - at * 1.25))),
            k * depth,
          ];
          return { branch, isWin, isLose, offset, alpha: isLose ? loserFade : 1 };
        })
        .filter((c) => c.alpha > 0.01);
      copies.sort((a, b) => (a.branch === nearBranch ? 1 : 0) - (b.branch === nearBranch ? 1 : 0));
      if (collapsed) copies.sort((a, b) => Number(a.isWin) - Number(b.isWin));

      const colourIn = smoothstep(SPLIT0, SPLIT1, tc);
      for (const c of copies) {
        const inked = (b: Bead) =>
          c.isWin ? smoothstep(front, front - 25, Math.abs(b.lx - z0)) : 0;
        ctx.save();
        ctx.globalAlpha = c.alpha;
        cylinderHatch(f, o, c.offset, 1);
        drawLumen(f, o, c.offset, 1);
        drawCopy(f, beadsFor(o, t, c.offset), {
          tint: c.branch < 0 ? RED : BLUE,
          tintAt: (b) => (collapsed ? (c.isWin ? 1 - inked(b) : 1) : colourIn),
          weight: (b) => (c.isWin ? 0.5 + 0.5 * inked(b) : 0.5),
        });
        ctx.restore();
      }
    }
    ctx.restore();

    // Scale bar and engraved lettering.
    const fam = f.family;
    const sz = Math.max(10, Math.min(14, Math.min(w, h) * 0.018));
    const bar = 25 * o.f * 0.98;
    const bx = o.phone ? frame.x0 + 14 : w * 0.47;
    const by = o.phone ? frame.y0 + 64 : frame.y0 + 64;
    const { ink } = f;
    ink.begin();
    ink.seg(bx, by, bx + bar, by);
    ink.seg(bx, by - 4, bx, by + 4);
    ink.seg(bx + bar, by - 4, bx + bar, by + 4);
    ink.stroke(0.8, 0.8);
    label(ctx, '25 nm', bx + bar + 8, by, sz, fam);

    // The open end, named, with a fine leader to the lumen.
    const project = projector(o);
    const end = project(-L / 2, 0, 0);
    // Wide: out to the left. Phone: the end is near the left rule, so the
    // leader drops below it instead.
    const out = o.phone
      ? { x: end.x + sz * 0.6, y: end.y + sz * 7.5 }
      : { x: end.x - sz * 6.5, y: end.y + sz * 2.2 };
    const from = o.phone ? 0.6 : 0.28;
    ink.begin();
    ink.seg(end.x + (out.x - end.x) * from, end.y + (out.y - end.y) * from, out.x, out.y);
    ink.stroke(0.6, 0.5);
    if (o.phone) label(ctx, 'lumen', out.x + 4, out.y + sz * 0.3, sz * 0.95, fam, { alpha: 0.75 });
    else
      label(ctx, 'lumen', out.x - 4, out.y + sz * 0.5, sz * 0.95, fam, {
        align: 'right',
        alpha: 0.75,
      });
  },
};
