import {
  BLUE,
  OCHRE,
  RED,
  SEPIA,
  clamp,
  fract,
  hash2,
  label,
  mixRgb,
  rgba,
  smoothstep,
  stillAt,
  type Engraving,
  type FrameCtx,
  type Ink,
  type Rgb,
} from './plate';

/**
 * Fig. 4: one mass in two places bends spacetime two ways at once. The
 * sheet is engraved twice, in madder-red and Prussian-blue line, each dented
 * by the mass in one of its places; the dents are toned by closer ruling
 * and washed. The column at the right fills with E_G·t/ħ; at 1 (t ≈ ħ/E_G)
 * Penrose proposes one geometry wins: it is re-cut in sepia and the other
 * fades. Which one is random, with equal odds. Timing as in the Ink set.
 */

const CYCLE = 8.5;
const COLLAPSE = 0.64;
const SEP = 0.34;

const split = (p: number) => smoothstep(0.06, 0.52, Math.min(p, COLLAPSE));
const GAUGE_STEPS = 256;
const gaugeTable = (() => {
  const table = new Float64Array(GAUGE_STEPS + 1);
  let acc = 0;
  for (let i = 1; i <= GAUGE_STEPS; i++) {
    const p = (i / GAUGE_STEPS) * COLLAPSE;
    acc += split(p) ** 2 * (COLLAPSE / GAUGE_STEPS);
    table[i] = acc;
  }
  for (let i = 0; i <= GAUGE_STEPS; i++) table[i] /= acc;
  return table;
})();
const gauge = (p: number) =>
  p >= COLLAPSE ? 1 : gaugeTable[Math.round((p / COLLAPSE) * GAUGE_STEPS)];

function well(u: number, v: number, mu: number) {
  const d2 = (u - mu) ** 2 + (v * 1.15) ** 2;
  return Math.exp(-d2 / 0.05) * 0.75 + Math.exp(-d2 / 0.35) * 0.45;
}

/**
 * An engraved sphere: rings round the highlight (upper left), set closer
 * and cut heavier as they reach the shadow side, so the form turns; a few
 * crossing strokes in the deepest shadow, and the outline.
 */
function engraveSphere(
  ctx: CanvasRenderingContext2D,
  ink: Ink,
  x: number,
  y: number,
  r: number,
  alpha: number
) {
  const hx = x - r * 0.38;
  const hy = y - r * 0.42;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  const bands = [
    { from: 0.32, to: 0.75, gap: 0.16, width: 0.35, a: 0.45 },
    { from: 0.75, to: 1.15, gap: 0.1, width: 0.5, a: 0.65 },
    { from: 1.15, to: 1.65, gap: 0.07, width: 0.7, a: 0.85 },
  ];
  for (const b of bands) {
    ink.begin();
    for (let rho = b.from; rho < b.to; rho += b.gap) ink.circle(hx, hy, rho * r);
    ink.stroke(b.a * alpha, b.width);
  }
  // Crossing strokes in the core shadow, away from the highlight.
  ctx.beginPath();
  ctx.arc(hx, hy, r * 1.3, 0, Math.PI * 2);
  ctx.rect(x + r * 2, y - r * 2, -r * 4, r * 4);
  ctx.clip('evenodd');
  ink.begin();
  for (let k = -8; k <= 8; k++) {
    const d = k * r * 0.11;
    ink.seg(x - r + d, y + r, x + r + d, y - r);
  }
  ink.stroke(0.4 * alpha, 0.4);
  ctx.restore();
  ink.begin();
  ink.circle(x, y, r);
  ink.stroke(0.9 * alpha, 0.9);
}

interface Geometry {
  mu: number;
  colour: Rgb;
  alpha: number;
  name: string;
  winner: boolean;
}

export const spacetime: Engraving = {
  still: stillAt(4.2),
  labels: () => ({ fig: 'Fig. 4.', title: 'One mass in two places, two curvatures of space' }),
  draw(f: FrameCtx, t: number) {
    const { ctx, ink, wash, w, h, family } = f;
    const p = fract(t / CYCLE);
    const cycle = Math.floor(t / CYCLE);
    const winner = hash2(cycle, 41) < 0.5 ? -1 : 1;
    const collapsed = p >= COLLAPSE;
    const s = split(p);
    const settle = smoothstep(0.82, 0.99, p);
    const age = collapsed ? (p - COLLAPSE) * CYCLE : 0;

    const cx = w * 0.46;
    const horizon = h * 0.24;
    const planeH = h * 0.56;
    const halfW = Math.min(w * 0.4, h * 0.8);
    const depthPx = h * 0.2;
    const project = (u: number, v: number, dip: number): [number, number] => {
      const near = (v + 1) / 2;
      const sc = 0.55 + 0.45 * near;
      return [cx + u * halfW * sc, horizon + near * planeH + dip * depthPx * sc];
    };

    const geos: Geometry[] = [];
    if (!collapsed) {
      geos.push({ mu: -SEP * s, colour: RED, alpha: 1, name: 'A', winner: false });
      geos.push({ mu: SEP * s, colour: BLUE, alpha: 1, name: 'B', winner: false });
    } else {
      const loser = 1 - smoothstep(0, 0.9, age);
      const ink = smoothstep(0, 1.2, age);
      const win = winner < 0 ? RED : BLUE;
      if (loser > 0.01)
        geos.push({
          mu: -winner * SEP,
          colour: winner < 0 ? BLUE : RED,
          alpha: loser,
          name: winner < 0 ? 'B' : 'A',
          winner: false,
        });
      geos.push({
        mu: winner * SEP * (1 - settle),
        colour: mixRgb(win, SEPIA, ink),
        alpha: 1,
        name: winner < 0 ? 'A' : 'B',
        winner: true,
      });
    }
    // Before the split, the sheet is one: a single sepia geometry.
    const single = !collapsed && s < 0.02;

    const nu = 52;
    for (const g of geos) {
      const lineCol: Rgb = single ? SEPIA : g.colour;
      const a = g.alpha * (single ? 0.75 : 0.7);
      // Rows (constant v), and between them, where the dent is deep,
      // closer ruling for tone.
      ink.begin();
      for (let j = 0; j < 17; j++) {
        const v = -1 + (2 * j) / 16;
        const pts: number[] = [];
        for (let i = 0; i <= nu; i++) {
          const u = -1 + (2 * i) / nu;
          pts.push(...project(u, v, well(u, v, g.mu)));
        }
        ink.poly(pts);
      }
      ink.stroke(a, g.winner ? 0.9 : 0.7, lineCol);
      ink.begin();
      for (let j = 0; j < 64; j++) {
        const v = -1 + (2 * (j + 0.5)) / 64;
        let open = false;
        for (let i = 0; i <= nu * 2; i++) {
          const u = -1 + i / nu;
          const dv = well(u, v, g.mu);
          // Tone only the far wall of the dent (facing away from the light).
          const slope = well(u, v + 0.02, g.mu) - dv;
          const shade = dv > 0.22 && slope > 0.002;
          const [x, y] = project(u, v, dv);
          if (shade && !open) {
            ctx.moveTo(x, y);
            open = true;
          } else if (shade) ctx.lineTo(x, y);
          else open = false;
        }
      }
      ink.stroke(a * 0.55, 0.45, lineCol);
      // Columns (constant u).
      ink.begin();
      for (let i = 0; i < 25; i++) {
        const u = -1 + (2 * i) / 24;
        const pts: number[] = [];
        for (let j = 0; j <= nu; j++) {
          const v = -1 + (2 * j) / nu;
          pts.push(...project(u, v, well(u, v, g.mu)));
        }
        ink.poly(pts);
      }
      ink.stroke(a * 0.7, g.winner ? 0.75 : 0.55, lineCol);

      // The dent's wash.
      if (!single) {
        const [dx, dy] = project(g.mu, 0.05, well(g.mu, 0.05, g.mu) * 0.7);
        const washA = g.winner ? 0.42 * (1 - smoothstep(0.3, 1.5, age)) : 0.42 * g.alpha * s;
        wash.blot(
          dx,
          dy,
          halfW * 0.21,
          planeH * 0.12,
          g.winner ? (winner < 0 ? RED : BLUE) : g.colour,
          washA,
          g.name === 'A' ? 5 : 9
        );
      }

      // The mass, an engraved sphere resting in its dent.
      const [mx, my] = project(g.mu, 0, well(g.mu, 0, g.mu));
      const r = h * 0.042;
      const sy = my - r * 0.85;
      ctx.beginPath();
      ctx.arc(mx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = rgba([241, 231, 208], 0.95 * g.alpha);
      ctx.fill();
      engraveSphere(ctx, ink, mx, sy, r, g.alpha);
      if (!single) {
        wash.blot(
          mx,
          sy,
          r * 1.1,
          r * 1.1,
          g.winner ? (winner < 0 ? RED : BLUE) : g.colour,
          0.55 * (g.winner ? 1 - smoothstep(0.3, 1.5, age) : g.alpha),
          g.name === 'A' ? 13 : 17
        );
        label(ctx, g.name, mx, sy - r - 12, h * 0.024, family, {
          align: 'center',
          alpha: g.alpha * 0.9,
        });
      }
    }

    // The reduction, cut as a dashed ring running out over the survivor.
    if (collapsed && age < 2.2) {
      const mu = winner * SEP * (1 - settle);
      const rho = age * 0.5;
      const pts: number[] = [];
      for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * Math.PI * 2;
        const u = clamp(mu + Math.cos(th) * rho, -1, 1);
        const v = clamp(Math.sin(th) * rho, -1, 1);
        pts.push(...project(u, v, well(u, v, mu)));
      }
      ctx.setLineDash([4, 4]);
      ink.begin();
      ink.poly(pts);
      ink.stroke(Math.exp(-age * 1.2), 0.9);
      ctx.setLineDash([]);
    }

    // The gauge: a glass column filling with E_G·t/ħ.
    const sz = Math.max(10, Math.min(15, w * 0.019));
    const gx = f.frame.x1 - Math.max(30, w * 0.06);
    const gTop = h * 0.22;
    const gBot = h * 0.78;
    const gw = Math.max(7, w * 0.012);
    const gv = collapsed ? 1 - smoothstep(COLLAPSE + 0.02, 0.8, p) : gauge(p);
    const level = gBot - (gBot - gTop) * gv;
    ctx.save();
    ctx.beginPath();
    ctx.rect(gx - gw, level, gw * 2, gBot - level);
    ctx.clip();
    ink.begin();
    for (let y = gBot; y > level; y -= 2.4) ink.seg(gx - gw, y, gx + gw, y);
    ink.stroke(0.75, 0.5);
    ctx.restore();
    wash.poly([gx - gw, level, gx + gw, level, gx + gw, gBot, gx - gw, gBot], OCHRE, 0.5, 0.8);
    ink.begin();
    ink.seg(gx - gw, gTop, gx - gw, gBot);
    ink.seg(gx + gw, gTop, gx + gw, gBot);
    ink.seg(gx - gw, gBot, gx + gw, gBot);
    for (let k = 0; k <= 4; k++) {
      const y = gBot - ((gBot - gTop) * k) / 4;
      ink.seg(gx + gw, y, gx + gw + (k % 2 ? 4 : 7), y);
    }
    ink.stroke(0.85, 0.75);
    label(ctx, '1', gx + gw + 11, gTop, sz, family, { italic: false });
    label(ctx, '0', gx + gw + 11, gBot, sz, family, { italic: false });
    // E_G·t/ħ, with G as a subscript.
    ctx.font = `italic ${sz}px ${family}`;
    const ew = ctx.measureText('E').width;
    ctx.font = `italic ${sz * 0.68}px ${family}`;
    const gw2 = ctx.measureText('G').width;
    ctx.font = `italic ${sz}px ${family}`;
    const rest = ' t / ħ';
    const total = ew + gw2 + ctx.measureText(rest).width;
    const lx = gx - total / 2;
    const ly = gTop - sz * 1.5;
    label(ctx, 'E', lx, ly, sz, family);
    label(ctx, 'G', lx + ew, ly + sz * 0.3, sz * 0.68, family);
    label(ctx, rest, lx + ew + gw2, ly, sz, family);

    wash.apply(ctx);
  },
};
