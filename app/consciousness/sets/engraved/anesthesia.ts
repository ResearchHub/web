import {
  BLUE,
  RED,
  SEPIA,
  beadHatch,
  clamp,
  label,
  noise1,
  rgba,
  rng,
  smoothstep,
  stillAt,
  type Engraving,
  type FrameCtx,
} from './plate';

/**
 * Fig. 1: anaesthetics and the microtubule wall, engraved. A stretch of the
 * wall is drawn side-on as a cylinder of tubulin beads (α marked with a
 * dot, β plain), shaded from above. A collective oscillation runs along it
 * as a travelling madder-red wash. Anaesthetic molecules, washed Prussian
 * blue, drift in along stippled paths, settle in pockets and damp the
 * oscillation where they sit; then wash out again. Beneath, the summed
 * oscillation is traced on a ruled strip like a kymograph, its envelope
 * dashed. Modelled and slowed for display; timing as in the Ink set.
 */

const CYCLE = 14;
const ROWS = 7;
const MOLECULES = 16;
const FREQ = 1.4;
const TRAVEL = 1.9;

const r = rng(303);
const molecules = Array.from({ length: MOLECULES }, (_, i) => ({
  site: r(),
  row: Math.floor(r() * ROWS),
  fromX: r(),
  fromTop: r() < 0.5,
  toX: r(),
  toTop: r() < 0.5,
  enter: 1.4 + i * 0.36 + r() * 0.3,
  leave: 8.6 + i * 0.16 + r() * 0.4,
  wob: r() * 6.28,
}));

function occupancy(m: (typeof molecules)[number], tc: number) {
  return (
    smoothstep(m.enter + TRAVEL - 0.35, m.enter + TRAVEL, tc) *
    (1 - smoothstep(m.leave, m.leave + 0.35, tc))
  );
}

function globalAmplitude(tc: number) {
  let occ = 0;
  for (const m of molecules) occ += occupancy(m, tc);
  return 1 - 0.86 * (occ / MOLECULES);
}

export const anesthesia: Engraving = {
  still: stillAt(7.4),
  labels: () => ({ fig: 'Fig. 1.', title: 'Anaesthetic molecules in the microtubule wall' }),
  draw(f: FrameCtx, t: number) {
    const { ctx, ink, wash, w, h, family, frame } = f;
    const tc = ((t % CYCLE) + CYCLE) % CYCLE;
    const phone = w < 640;
    const sz = Math.max(10, Math.min(15, w * 0.019));

    const top = h * (phone ? 0.2 : 0.21);
    const bottom = h * (phone ? 0.58 : 0.6);
    const mid = (top + bottom) / 2;
    const rcyl = Math.min((bottom - top) / 2, w * 0.22);
    const rr = rcyl * 0.16;
    const left = frame.x0 + Math.max(w * 0.05, rr * 1.6 + 10);
    const right = frame.x1 - Math.max(w * 0.05, rr * 1.6 + 10);
    const step = rr * 2.35;
    const shift = step * 0.23;
    const cols = Math.floor((right - left) / step) + 2;
    const rowAngle = (row: number) => -1.05 + (2.1 * row) / (ROWS - 1);
    const rowY = (row: number) => mid + rcyl * 0.92 * Math.sin(rowAngle(row));
    const rowFacing = (row: number) => Math.cos(rowAngle(row));

    // Where each molecule is, and its pocket.
    const placed = molecules.map((m) => {
      const col = Math.floor(m.site * (cols / 2 - 2)) * 2 + 1;
      const px = left + col * step + m.row * shift - (cols * shift) / 2 + step * 0.5;
      const py = rowY(m.row);
      const sx = left + m.fromX * (right - left);
      const sy = m.fromTop ? frame.y0 + 44 : h * 0.7;
      const ex = left + m.toX * (right - left);
      const ey = m.toTop ? frame.y0 + 44 : h * 0.7;
      const at = (time: number) => {
        let x: number;
        let y: number;
        let vis = 1;
        if (time < m.enter) return null;
        if (time < m.enter + TRAVEL) {
          const k = smoothstep(0, 1, (time - m.enter) / TRAVEL);
          x = sx + (px - sx) * k + Math.sin(time * 5 + m.wob) * 6 * (1 - k);
          y = sy + (py - sy) * k + Math.cos(time * 4 + m.wob) * 5 * (1 - k);
          vis = smoothstep(0, 0.25, (time - m.enter) / TRAVEL);
        } else if (time < m.leave) {
          x = px + Math.sin(time * 9 + m.wob) * 0.6;
          y = py + Math.cos(time * 8 + m.wob) * 0.6;
        } else if (time < m.leave + TRAVEL) {
          const k = smoothstep(0, 1, (time - m.leave) / TRAVEL);
          x = px + (ex - px) * k + Math.sin(time * 5 + m.wob) * 6 * k;
          y = py + (ey - py) * k + Math.cos(time * 4 + m.wob) * 5 * k;
          vis = 1 - smoothstep(0.75, 1, k);
        } else return null;
        return { x, y, vis };
      };
      return { m, px, py, at, occ: occupancy(m, tc) };
    });

    // The cylinder: its two edges, and long lines along the lower flank
    // (in shadow), closer towards the edge, which the beads stand over.
    ink.begin();
    ink.seg(left - rr * 1.5, mid - rcyl * 1.06, right + rr * 1.5, mid - rcyl * 1.06);
    ink.seg(left - rr * 1.5, mid + rcyl * 1.06, right + rr * 1.5, mid + rcyl * 1.06);
    ink.stroke(0.75, 0.9);
    ink.begin();
    for (let i = 0; i < 14; i++) {
      const a = 0.25 + (i / 13) * 1.3;
      const y = mid + rcyl * 1.06 * Math.sin(a);
      ink.seg(left - rr * 1.5, y, right + rr * 1.5, y);
    }
    ink.stroke(0.22, 0.45);
    ink.begin();
    for (let i = 0; i < 6; i++) {
      const a = 1.0 + (i / 5) * 0.5;
      const y = mid - rcyl * 1.06 * Math.sin(a);
      ink.seg(left - rr * 1.5, y, right + rr * 1.5, y);
    }
    ink.stroke(0.1, 0.4);
    // The ends: broken off, as a draughtsman marks a length that runs on.
    for (const [x, seed] of [
      [left - rr * 1.5, 3],
      [right + rr * 1.5, 8],
    ] as const) {
      const pts: number[] = [];
      for (let i = 0; i <= 20; i++) {
        const y = mid - rcyl * 1.06 + (rcyl * 2.12 * i) / 20;
        pts.push(x + noise1(i * 0.9, seed) * rr * 0.45, y);
      }
      ink.begin();
      ink.poly(pts);
      ink.stroke(0.6, 0.7);
    }

    // The lattice, back rows first.
    const omega = Math.PI * 2 * FREQ;
    const k = (Math.PI * 2) / (w * 0.45);
    const sigma2 = (rr * 3.4) ** 2;
    const order = Array.from({ length: ROWS }, (_, i) => i).sort(
      (p, q) => rowFacing(p) - rowFacing(q)
    );
    const fills: {
      x: number;
      y: number;
      mr: number;
      face: number;
      tone: number;
      alpha: boolean;
    }[] = [];
    for (const row of order) {
      const y = rowY(row);
      const ang = rowAngle(row);
      for (let c = 0; c < cols; c++) {
        const x = left + c * step + row * shift - (cols * shift) / 2;
        if (x < left - rr || x > right + rr) continue;
        let damp = 0;
        for (const p of placed) {
          if (p.occ <= 0) continue;
          const d2 = (x - p.px) ** 2 + (y - p.py) ** 2;
          damp += p.occ * Math.exp(-d2 / sigma2);
        }
        const amp = clamp(1 - 0.92 * damp, 0.04, 1);
        const b = amp * (0.5 + 0.5 * Math.sin(omega * t - k * x));
        const face = rowFacing(row);
        const mr = rr * (0.62 + 0.38 * face);
        // Shaded from above: the lower rows, turned away, are darker.
        const tone = clamp(0.28 + 0.45 * smoothstep(-0.6, 1, Math.sin(ang)) + 0.2 * (1 - face));
        fills.push({ x, y, mr, face, tone, alpha: c % 2 === 0 });
        // The oscillation's wash, a little off the bead as a colourist would.
        wash.blot(
          x + mr * 0.12,
          y - mr * 0.08,
          mr * (1.05 + 0.35 * b),
          mr * (1.0 + 0.3 * b),
          RED,
          (0.06 + 0.62 * b) * (0.45 + 0.55 * face),
          row * 97 + c
        );
      }
    }
    // Beads: paper fill, outline, shadow hatch, α dots.
    for (const b of fills) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.mr, 0, Math.PI * 2);
      ctx.fillStyle = rgba([243, 234, 213], 0.6 + 0.4 * b.face);
      ctx.fill();
    }
    ink.begin();
    for (const b of fills) ink.circle(b.x, b.y, b.mr);
    ink.stroke(0.78, 0.65);
    ink.begin();
    for (const b of fills) {
      beadHatch(ink, b.x, b.y, b.mr, -2.0, b.tone, Math.max(1.5, b.mr * 0.24));
      if (b.alpha) ink.circle(b.x - b.mr * 0.12, b.y - b.mr * 0.14, Math.max(0.8, b.mr * 0.16));
    }
    ink.stroke(0.55, 0.42);

    // Anaesthetic molecules: a small three-atom glyph, washed blue, each
    // trailing a stippled path.
    const ms = Math.max(2.2, rr * 0.26);
    for (const p of placed) {
      ink.begin();
      for (let s = 1; s <= 9; s++) {
        const q = p.at(tc - s * 0.07);
        if (!q || q.vis < 0.1) continue;
        ink.circle(q.x, q.y, 0.55);
      }
      ink.stroke(0.55, 0.9);
      const q = p.at(tc);
      if (!q) continue;
      const rot = p.m.wob + tc * 0.6;
      const atoms: [number, number][] = [];
      for (let a = 0; a < 3; a++) {
        const th = rot + (a / 3) * Math.PI * 2;
        atoms.push([q.x + Math.cos(th) * ms * 1.1, q.y + Math.sin(th) * ms * 1.1]);
      }
      // A pocket halo where it has settled.
      wash.blot(q.x, q.y, ms * 3.2, ms * 3.0, BLUE, 0.22 * p.occ * q.vis, p.m.row * 13 + 7);
      wash.blot(q.x, q.y, ms * 2.0, ms * 2.0, BLUE, 0.7 * q.vis, p.m.row * 31 + 3);
      ink.begin();
      for (let a = 0; a < 3; a++) {
        const [ax, ay] = atoms[a];
        const [bx, by] = atoms[(a + 1) % 3];
        ink.seg(ax, ay, bx, by);
      }
      ink.stroke(0.85 * q.vis, 0.8);
      for (const [ax, ay] of atoms) {
        ctx.beginPath();
        ctx.arc(ax, ay, ms * 0.62, 0, Math.PI * 2);
        ctx.fillStyle = rgba([243, 234, 213], q.vis);
        ctx.fill();
      }
      ink.begin();
      for (const [ax, ay] of atoms) {
        ink.circle(ax, ay, ms * 0.62);
        beadHatch(ink, ax, ay, ms * 0.62, -2, 0.6, 1.3);
      }
      ink.stroke(0.85 * q.vis, 0.55);
    }

    // Lettering on the wall: α, β, and one settled molecule.
    const frontRow = 3;
    const fy = rowY(frontRow);
    let c0 = 0;
    while (left + c0 * step + frontRow * shift - (cols * shift) / 2 < left + rr) c0++;
    if (c0 % 2) c0++;
    const ax = left + c0 * step + frontRow * shift - (cols * shift) / 2;
    const lead = (x0: number, y0: number, x1: number, y1: number) => {
      ink.begin();
      ink.seg(x0, y0, x1, y1);
      ink.stroke(0.6, 0.5);
    };
    const ly = mid - rcyl * 1.06 - sz * 1.1;
    lead(ax, fy - rr * 0.7, ax - sz * 0.2, ly + sz * 0.5);
    label(ctx, 'α', ax - sz * 0.2, ly, sz, family, { align: 'center' });
    lead(ax + step, fy - rr * 0.7, ax + step + sz * 0.2, ly + sz * 0.5);
    label(ctx, 'β', ax + step + sz * 0.2, ly, sz, family, { align: 'center' });
    const settled = placed
      .filter((p) => p.occ > 0.9)
      .sort((a, b) => b.px - a.px)
      .find((p) => p.px < right - w * 0.12);
    if (settled) {
      const tx = settled.px + rr * 1.4;
      const tyl = mid + rcyl * 1.06 + sz * 1.2;
      lead(settled.px + ms, settled.py + ms, tx, tyl - sz * 0.5);
      label(ctx, 'anaesthetic', tx + 3, tyl, sz, family, { alpha: 0.85 * settled.occ });
    }

    // The summed oscillation, traced on a ruled strip.
    const ty = h * (phone ? 0.78 : 0.8);
    const th = h * 0.085;
    const sTop = ty - th * 1.35;
    const sBot = ty + th * 1.35;
    ctx.fillStyle = rgba([233, 222, 196], 0.55);
    ctx.fillRect(left, sTop, right - left, sBot - sTop);
    ink.begin();
    for (let y = sTop + 4; y < sBot; y += 4) ink.seg(left, y, right, y);
    ink.stroke(0.1, 0.4);
    ink.begin();
    ink.poly([left, sTop, right, sTop, right, sBot, left, sBot], true);
    ink.stroke(0.7, 0.7);
    ink.begin();
    ink.seg(left, ty, right, ty);
    ink.stroke(0.3, 0.5);
    // Second marks along the bottom edge.
    const window = 5;
    ink.begin();
    for (let s = 0; s <= window; s++) {
      const x = right - ((right - left) * s) / window;
      ink.seg(x, sBot, x, sBot + 4);
    }
    ink.stroke(0.7, 0.6);

    const n = 260;
    const pts: number[] = [];
    const env: number[] = [];
    const envLow: number[] = [];
    for (let i = 0; i <= n; i++) {
      const fr = i / n;
      const tt = t - window + fr * window;
      const ttc = ((tt % CYCLE) + CYCLE) % CYCLE;
      const g = globalAmplitude(ttc);
      const x = left + fr * (right - left);
      pts.push(x, ty - g * Math.sin(omega * tt) * th);
      env.push(x, ty - g * th);
      envLow.push(x, ty + g * th);
    }
    // Envelope, dashed; a light wash between it.
    const band: number[] = [...env];
    for (let i = envLow.length - 2; i >= 0; i -= 2) band.push(envLow[i], envLow[i + 1]);
    wash.poly(band, RED, 0.14, 0.8);
    ctx.setLineDash([3, 3]);
    ink.begin();
    ink.poly(env);
    ink.poly(envLow);
    ink.stroke(0.45, 0.6);
    ctx.setLineDash([]);
    ink.begin();
    ink.poly(pts);
    ink.stroke(0.95, 1.3, RED);
    ink.begin();
    ink.poly(pts);
    ink.stroke(0.35, 0.5, SEPIA);
    // The stylus at the present moment.
    const g = globalAmplitude(tc);
    const sy = ty - g * Math.sin(omega * t) * th;
    ink.begin();
    ink.poly([right, sy, right + sz * 0.9, sy - sz * 0.35, right + sz * 0.9, sy + sz * 0.35], true);
    ink.stroke(0.85, 0.7);

    label(ctx, 'summed oscillation', left + 4, sTop - sz * 0.9, sz, family);
    label(ctx, '1 s', right - (right - left) / window / 2, sBot + sz * 1.1, sz * 0.85, family, {
      align: 'center',
      alpha: 0.7,
    });

    wash.apply(ctx);
  },
};
