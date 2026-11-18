import { INK, RGB, T, rgba, tint } from './inks';
import { clamp, phoneArt, smoothstep } from './heroKit';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate E, "Face or vase": the figure psychologists use for
 * conscious perception. Two faces in profile, one printed blue, one pink,
 * or the vase between them; the picture holds both, but you see one at a
 * time. Here the vase is a microtubule, its tubulin lattice wrapped round
 * the vase like a surface of revolution. The print slowly trades emphasis:
 * the faces, then the vase, with a wave running up its lattice. An analogy
 * for experience settling on one reading, not a claim about the physics.
 */

const FLIP = 14;
const PF = 13;

/** The vase's half-width down its height (y from −0.5 to 0.5, units of height). */
const EDGE: [number, number][] = [
  [-0.5, 0.29],
  [-0.4, 0.21],
  [-0.3, 0.16],
  [-0.22, 0.15],
  [-0.17, 0.162],
  [-0.12, 0.142],
  [-0.04, 0.07],
  [0.0, 0.118],
  [0.05, 0.106],
  [0.08, 0.092],
  [0.11, 0.108],
  [0.145, 0.086],
  [0.195, 0.13],
  [0.25, 0.104],
  [0.33, 0.18],
  [0.42, 0.215],
  [0.5, 0.29],
];

/** Half-width at `y`: a smooth curve through EDGE (non-uniform Catmull–Rom). */
function halfWidth(y: number) {
  const n = EDGE.length;
  if (y <= EDGE[0][0]) return EDGE[0][1];
  if (y >= EDGE[n - 1][0]) return EDGE[n - 1][1];
  let i = 0;
  while (EDGE[i + 1][0] < y) i++;
  const [y1, v1] = EDGE[i];
  const [y2, v2] = EDGE[i + 1];
  const [y0, v0] = EDGE[Math.max(0, i - 1)];
  const [y3, v3] = EDGE[Math.min(n - 1, i + 2)];
  const m1 = (v2 - v0) / (y2 - y0 || 1);
  const m2 = (v3 - v1) / (y3 - y1 || 1);
  const dy = y2 - y1;
  const t = (y - y1) / dy;
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * v1 +
    (t3 - 2 * t2 + t) * dy * m1 +
    (-2 * t3 + 3 * t2) * v2 +
    (t3 - t2) * dy * m2
  );
}

interface Bead {
  x: number;
  y: number;
  rx: number;
  ry: number;
  /** Facing the viewer, 0..1 (cos of the angle round the vase). */
  face: number;
  beta: boolean;
  /** Height in the vase, −0.5..0.5. */
  v: number;
}

interface Plate {
  key: string;
  cx: number;
  cy: number;
  V: number;
  half: number;
  vase: Path2D;
  left: Path2D;
  right: Path2D;
  /** The two profile edges, for the shared outline. */
  edgeL: Path2D;
  edgeR: Path2D;
  rimTop: [number, number, number];
  rimBase: [number, number, number];
  beads: Bead[];
}

function bake(w: number, h: number): Plate {
  const wide = w >= h;
  const top = phoneArt(w, h);
  const V = wide ? clamp(Math.min(h * 0.68, w * 0.52), 260, 680) : clamp(top * 0.86, 170, 340);
  const cx = wide ? w * 0.78 : w * 0.5;
  const cy = wide ? h * 0.52 : top * 0.5;
  // The faces reach this far from the axis, then fade.
  const half = V * (wide ? 0.42 : 0.5);
  const STEPS = 160;
  const edge = (side: 1 | -1) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= STEPS; i++) {
      const v = -0.5 + i / STEPS;
      pts.push([cx + side * halfWidth(v) * V, cy + v * V]);
    }
    return pts;
  };
  const L = edge(-1);
  const R = edge(1);
  const line = (pts: [number, number][], p = new Path2D()) => {
    pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
    return p;
  };
  const vase = line([...L, ...R.slice().reverse()]);
  vase.closePath();
  const left = line(L);
  left.lineTo(cx - half, cy + V / 2);
  left.lineTo(cx - half, cy - V / 2);
  left.closePath();
  const right = line(R);
  right.lineTo(cx + half, cy + V / 2);
  right.lineTo(cx + half, cy - V / 2);
  right.closePath();

  // The tubulin lattice, wrapped round the vase: 13 strands, each set 3/13
  // of a monomer lower than the last (the 3-start helix).
  const mono = V * (wide ? 0.028 : 0.034);
  const beads: Bead[] = [];
  const rows = Math.ceil(V / mono) + 2;
  for (let p = 0; p < PF; p++) {
    const th = (p / PF) * Math.PI * 2 + 0.11;
    const face = Math.cos(th);
    if (face < 0.06) continue;
    for (let r = -1; r < rows; r++) {
      const y = cy - V / 2 + (r + (3 * p) / PF) * mono;
      const v = (y - cy) / V;
      if (v < -0.49 || v > 0.49) continue;
      const hw = halfWidth(v) * V;
      beads.push({
        x: cx + Math.sin(th) * hw,
        y,
        rx: ((hw * Math.PI * 2) / PF) * 0.42 * face,
        ry: mono * 0.44,
        face,
        beta: r % 2 === 0,
        v,
      });
    }
  }
  beads.sort((a, b) => a.face - b.face);
  return {
    key: `${w}x${h}`,
    cx,
    cy,
    V,
    half,
    vase,
    left,
    right,
    edgeL: line(L),
    edgeR: line(R),
    rimTop: [cx, cy - V / 2, halfWidth(-0.5) * V],
    rimBase: [cx, cy + V / 2, halfWidth(0.5) * V],
    beads,
  };
}

/** 1 = the faces, 0 = the vase; holds each for a while, eases between. */
function reading(t: number) {
  const p = (((t % FLIP) + FLIP) % FLIP) / FLIP;
  // faces 0–.38, to vase .38–.5, vase .5–.88, back .88–1
  if (p < 0.38) return { faces: 1, p };
  if (p < 0.5) return { faces: 1 - smoothstep(0.38, 0.5, p), p };
  if (p < 0.88) return { faces: 0, p };
  return { faces: smoothstep(0.88, 1, p), p };
}

export const heroVase: PaperFigure = {
  // Turning from the faces to the vase: both readable.
  still: FLIP * 0.43,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t) => {
      if (!plate || plate.key !== `${w}x${h}`) plate = bake(w, h);
      const P = plate;
      const { faces, p } = reading(t);
      const vase = 1 - faces;
      const { V } = P;

      // The faces: two flat blocks of ink, one per plate.
      ctx.globalCompositeOperation = 'multiply';
      const a = 0.2 + 0.7 * faces;
      ctx.fillStyle = rgba(RGB.blue, a);
      ctx.fill(P.left);
      ctx.fillStyle = rgba(RGB.pink, a);
      ctx.fill(P.right);

      // The vase: paper, then the lattice.
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = tint(T.accent, 0.04 + 0.26 * vase);
      ctx.fill(P.vase);
      ctx.save();
      ctx.clip(P.vase);
      ctx.globalCompositeOperation = 'multiply';
      // A wave of marks up the lattice while the vase is the reading.
      const wave = 0.62 - ((p - 0.46) / 0.42) * 1.24;
      const latt = 0.1 + 0.9 * vase;
      const rim = rgba(RGB.indigo, 0.75 * latt);
      for (const b of P.beads) {
        const shade = 0.35 + 0.65 * b.face;
        const m = vase * Math.exp(-(((b.v - wave) / 0.05) ** 2));
        ctx.fillStyle = tint(T.accent, (b.beta ? 0.5 : 0.78) * shade * latt);
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, Math.max(0.6, b.rx), b.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        if (m > 0.05) {
          ctx.fillStyle = rgba(RGB.indigo, 0.8 * m);
          ctx.fill();
        }
        if (b.rx > 1.6) {
          ctx.strokeStyle = rim;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      ctx.restore();
      ctx.globalCompositeOperation = 'multiply';

      // Rim and foot: what makes the middle read as a vase.
      ctx.strokeStyle = rgba(RGB.indigo, 0.2 + 0.7 * vase);
      ctx.lineWidth = clamp(V * 0.005, 1.4, 2.6);
      for (const [x, y, r] of [P.rimTop, P.rimBase]) {
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.16, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // The shared edge: each face's outline in its own ink, printing
      // indigo where they meet the vase.
      ctx.lineWidth = clamp(V * 0.0055, 1.5, 3);
      ctx.lineJoin = 'round';
      ctx.strokeStyle = INK.indigo;
      ctx.stroke(P.edgeL);
      ctx.stroke(P.edgeR);
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
