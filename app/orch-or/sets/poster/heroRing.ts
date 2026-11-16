import { hexToRgb } from '../../theme';
import { RGB, T, rgba, tint } from './inks';
import { PLATE_STILL, clamp, phoneArt, plateState } from './heroKit';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate B, "Ring of 13": looking straight down a microtubule. The
 * near ring is the tube's cut end, 13 tubulins round a hollow core; behind
 * it the rings recede into a tunnel, each protofilament set a little deeper
 * than the last (the lattice's 3-start helix), alpha and beta tubulin in two
 * yellows. The state of the front rings is printed twice, a blue and a pink
 * mark on every tubulin, turned out of register: two states at once. Every
 * 11 s the marks turn into register and print indigo, one outcome, and the
 * far end of the tunnel flares.
 */

const PF = 13;
const LAYERS = 15;
const MARKED = 1;
const DEPTH = 0.12;

interface Disc {
  x: number;
  y: number;
  r: number;
  s: number;
  k: number;
  theta: number;
  cx: number;
  cy: number;
  R: number;
}

interface Plate {
  key: string;
  base: HTMLCanvasElement;
  marked: Disc[];
  core: [number, number, number];
}

function bake(w: number, h: number, dpr: number): Plate {
  const wide = w >= h;
  // On a phone the art has the top of the hero, above the headline.
  const top = phoneArt(w, h);
  const R = wide
    ? clamp(Math.min(h * 0.29, w * 0.2), 110, 330)
    : clamp(Math.min(w * 0.34, top * 0.36), 70, 200);
  const cx = wide ? w * 0.735 : w * 0.53;
  const cy = wide ? h * 0.52 : top * 0.56;
  const vx = cx - R * 0.34;
  const vy = cy - R * 0.22;

  const discs: Disc[] = [];
  for (let k = 0; k < LAYERS; k++)
    for (let n = 0; n < PF; n++) {
      // Dimer rings (two monomers apart), each strand set 3/13 of a
      // monomer deeper than the last: the 3-start helix.
      const z = 2 * k + (3 * n) / PF;
      const s = 1 / (1 + z * DEPTH);
      const rcx = vx + (cx - vx) * s;
      const rcy = vy + (cy - vy) * s;
      const theta = (n / PF) * Math.PI * 2 - Math.PI / 2 + 0.12;
      discs.push({
        x: rcx + Math.cos(theta) * R * s,
        y: rcy + Math.sin(theta) * R * s,
        r: R * 0.232 * s,
        s,
        k,
        theta,
        cx: rcx,
        cy: rcy,
        R: R * s,
      });
    }
  discs.sort((a, b) => a.s - b.s);

  const c = document.createElement('canvas');
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  for (const d of discs) {
    // Far rings fade into the paper.
    const fade = Math.pow(d.s, 1.3);
    g.fillStyle = tint(T.accent, (d.k % 2 ? 0.48 : 0.74) * (0.35 + 0.65 * fade));
    g.beginPath();
    g.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = rgba(RGB.indigo, 0.92 * fade * fade);
    g.lineWidth = Math.max(0.5, 2 * d.s);
    g.stroke();
    // A paper highlight, as on the beads in the questions' figures.
    g.fillStyle = rgba([255, 250, 242], 0.8 * fade);
    g.beginPath();
    g.arc(d.x - d.r * 0.36, d.y - d.r * 0.36, d.r * 0.2, 0, Math.PI * 2);
    g.fill();
  }
  return {
    key: `${w}x${h}@${dpr}`,
    base: c,
    marked: discs.filter((d) => d.k < MARKED),
    core: [vx + (cx - vx) * 0.12, vy + (cy - vy) * 0.12, R * 0.9],
  };
}

export const heroRing: PaperFigure = {
  still: PLATE_STILL,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t, dpr) => {
      const d = Math.min(dpr, 2);
      if (!plate || plate.key !== `${w}x${h}@${d}`) plate = bake(w, h, d);
      const { sep, flash } = plateState(t);

      // The far end of the tunnel: a warm light, flaring at a collapse.
      const [gx, gy, gr] = plate.core;
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr * (1 + flash));
      const acc = hexToRgb(T.accent);
      glow.addColorStop(0, rgba(acc, 0.55 + 0.4 * flash));
      glow.addColorStop(1, rgba(acc, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(gx - gr * 2, gy - gr * 2, gr * 4, gr * 4);

      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(plate.base, 0, 0, w, h);

      // The two plates: a blue and a pink mark on each front tubulin,
      // turned apart round the ring, overprinting indigo in register.
      const phi = (Math.PI / PF) * 0.42 * sep;
      // Paper under the marks, so the inks print clean, not over yellow.
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#fffaf2';
      ctx.beginPath();
      for (const m of plate.marked)
        for (const sign of [1, -1]) {
          const a = m.theta + sign * phi;
          const x = m.cx + Math.cos(a) * m.R;
          const y = m.cy + Math.sin(a) * m.R;
          const r = m.r * 0.47;
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
      ctx.fill();
      ctx.globalCompositeOperation = 'multiply';
      for (const [col, sign] of [
        [RGB.blue, 1],
        [RGB.pink, -1],
      ] as const) {
        ctx.fillStyle = rgba(col, 0.92);
        ctx.beginPath();
        for (const m of plate.marked) {
          const a = m.theta + sign * phi;
          const x = m.cx + Math.cos(a) * m.R;
          const y = m.cy + Math.sin(a) * m.R;
          const r = m.r * 0.43;
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
