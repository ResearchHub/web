import { hexToRgb } from '../../theme';
import { INK, RGB, T, rgba, tint } from './inks';
import {
  PLATE_STILL,
  clamp,
  phoneArt,
  cumulative,
  plateState,
  pyramidal,
  strokeTubes,
  widthAt,
  type Neuron,
} from './heroKit';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate A, "Two plates": a pyramidal neuron printed once, in
 * indigo outline over a yellow knock-out, and the microtubules inside its
 * dendrites printed twice, in blue and in pink, out of register: two states
 * at once. Every 11 s the two plates slide into register and print as one
 * indigo (blue × pink), the paper flares yellow, and a pulse runs down the
 * apical dendrite and out along the axon: what Orch OR proposes, that the
 * collapse shapes what the neuron does. Two fainter neurons behind, for the
 * tissue. Only the microtubules are doubled; the cell itself is classical.
 */

interface Placed {
  n: Neuron;
  x: number;
  y: number;
  u: number;
  main: boolean;
}

interface Plate {
  key: string;
  base: HTMLCanvasElement;
  blue: HTMLCanvasElement;
  pink: HTMLCanvasElement;
  main: Placed;
  spike: { pts: [number, number][]; len: number[]; width: number };
  /** Plate offset at full separation (CSS px), and the flare's centre. */
  off: [number, number];
  glow: [number, number, number];
}

const MAIN = pyramidal(7, 0.14);
const BACK_A = pyramidal(19, -0.25);
const BACK_B = pyramidal(31, 0.3);

function canvas(w: number, h: number, dpr: number) {
  const c = document.createElement('canvas');
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { c, g };
}

function layout(w: number, h: number): Placed[] {
  if (w >= h) {
    const u = clamp(h * 0.088, 36, 110);
    return [
      { n: BACK_A, x: w * 0.95, y: h * 0.2, u: u * 0.55, main: false },
      { n: BACK_B, x: w * 0.5, y: h * 0.92, u: u * 0.6, main: false },
      { n: MAIN, x: w * 0.72, y: h * 0.6, u, main: true },
    ];
  }
  const top = phoneArt(w, h);
  const u = clamp(Math.min(w * 0.08, top * 0.105), 18, 60);
  return [
    { n: BACK_A, x: w * 0.1, y: top * 0.25, u: u * 0.55, main: false },
    { n: BACK_B, x: w * 0.93, y: top * 0.82, u: u * 0.5, main: false },
    { n: MAIN, x: w * 0.54, y: top * 0.68, u, main: true },
  ];
}

function bake(w: number, h: number, dpr: number): Plate {
  const placed = layout(w, h);
  const base = canvas(w, h, dpr);
  const g = base.g;
  for (const p of placed) {
    const map = (x: number, y: number): [number, number] => [p.x + x * p.u, p.y + y * p.u];
    const line = p.main ? INK.indigo : rgba(RGB.indigo, 0.3);
    const fill = p.main ? INK.knock : tint(T.accent, 0.38);
    const extra = p.main ? clamp(p.u * 0.04, 2, 3.4) : 1.6;
    const somaPath = new Path2D();
    for (let i = 0; i < p.n.soma.length; i += 2) {
      const [x, y] = map(p.n.soma[i], p.n.soma[i + 1]);
      if (i) somaPath.lineTo(x, y);
      else somaPath.moveTo(x, y);
    }
    somaPath.closePath();
    // Outline everything, then fill over it: one clean outline round the cell.
    strokeTubes(g, p.n.tubes, line, extra, map, p.u);
    g.strokeStyle = line;
    g.lineWidth = extra;
    g.lineJoin = 'round';
    g.stroke(somaPath);
    strokeTubes(g, p.n.tubes, fill, 0, map, p.u);
    g.fillStyle = fill;
    g.fill(somaPath);
    // Nucleus.
    const [nx, ny] = map(0, 0.05);
    g.strokeStyle = p.main ? rgba(RGB.indigo, 0.55) : rgba(RGB.indigo, 0.2);
    g.lineWidth = p.main ? 1.3 : 1;
    g.beginPath();
    g.arc(nx, ny, p.u * 0.3, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = p.main ? rgba(RGB.indigo, 0.5) : rgba(RGB.indigo, 0.2);
    g.beginPath();
    g.arc(nx + p.u * 0.08, ny - p.u * 0.06, p.u * 0.08, 0, Math.PI * 2);
    g.fill();
  }

  // The microtubules in the main cell's dendrites: beaded lines along each
  // dendrite, three abreast where it is wide enough, drawn once per ink.
  const main = placed[placed.length - 1];
  const map = (x: number, y: number): [number, number] => [
    main.x + x * main.u,
    main.y + y * main.u,
  ];
  const plates = [hexToRgb(T.gold), hexToRgb(T.ice)].map((rgb) => {
    const p = canvas(w, h, dpr);
    p.g.strokeStyle = rgba(rgb, 0.95);
    p.g.fillStyle = rgba(rgb, 0.95);
    return p;
  });
  const bead = clamp(main.u * 0.022, 0.9, 2);
  const pitch = bead * 3.1;
  for (const ti of main.n.dendrites) {
    const tube = main.n.tubes[ti];
    const n = tube.pts.length / 2;
    for (const lane of [-1, 0, 1]) {
      let carry = 0;
      for (let i = 0; i < n - 1; i++) {
        const wpx = widthAt(tube, i) * main.u;
        if (wpx < (lane ? 13 : 5)) break;
        const [x0, y0] = map(tube.pts[i * 2], tube.pts[i * 2 + 1]);
        const [x1, y1] = map(tube.pts[i * 2 + 2], tube.pts[i * 2 + 3]);
        const dx = x1 - x0;
        const dy = y1 - y0;
        const len = Math.hypot(dx, dy) || 1;
        const o = lane * wpx * 0.26;
        const ox = (-dy / len) * o;
        const oy = (dx / len) * o;
        for (const p of plates) {
          p.g.lineWidth = bead * 0.75;
          p.g.beginPath();
          p.g.moveTo(x0 + ox, y0 + oy);
          p.g.lineTo(x1 + ox, y1 + oy);
          p.g.stroke();
        }
        for (let s = carry; s < len; s += pitch) {
          const f = s / len;
          for (const p of plates) {
            p.g.beginPath();
            p.g.arc(x0 + dx * f + ox, y0 + dy * f + oy, bead, 0, Math.PI * 2);
            p.g.fill();
          }
          carry = s + pitch - len;
        }
      }
    }
  }

  const pts = [] as [number, number][];
  for (let i = 0; i < main.n.spikePath.length; i += 2)
    pts.push(map(main.n.spikePath[i], main.n.spikePath[i + 1]));
  const off = clamp(main.u * 0.075, 3, 8);
  const [gx, gy] = map(0.6, -3);
  return {
    key: `${w}x${h}@${dpr}`,
    base: base.c,
    blue: plates[0].c,
    pink: plates[1].c,
    main,
    spike: { pts, len: cumulative(main.n.spikePath, map), width: main.u * 0.22 },
    off: [off, off * 0.35],
    glow: [gx, gy, main.u * 4.2],
  };
}

export const heroPlates: PaperFigure = {
  still: PLATE_STILL,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t, dpr) => {
      const d = Math.min(dpr, 2);
      if (!plate || plate.key !== `${w}x${h}@${d}`) plate = bake(w, h, d);
      const { sep, flash, since } = plateState(t);

      // The flare at a collapse: the paper warms where the plates met.
      if (flash > 0.01) {
        const [gx, gy, gr] = plate.glow;
        const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        glow.addColorStop(0, rgba(hexToRgb(T.accent), 0.75 * flash));
        glow.addColorStop(1, rgba(hexToRgb(T.accent), 0));
        ctx.fillStyle = glow;
        ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
      }
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(plate.base, 0, 0, w, h);
      const ox = plate.off[0] * sep;
      const oy = plate.off[1] * sep;
      ctx.drawImage(plate.blue, -ox, -oy, w, h);
      ctx.drawImage(plate.pink, ox, oy, w, h);
      ctx.globalCompositeOperation = 'source-over';

      // After the collapse, a pulse down the apical dendrite and the axon.
      const run = since - 0.25;
      if (run > 0 && run < 2.2) {
        const { pts, len, width } = plate.spike;
        const total = len[len.length - 1];
        const head = (run / 1.9) * total;
        const tail = width * 7;
        ctx.lineCap = 'round';
        for (let i = 0; i < pts.length - 1; i++) {
          const dd = head - len[i];
          if (dd < 0 || dd > tail) continue;
          const a = (1 - dd / tail) * 0.75 * (1 - Math.max(0, run - 1.7) / 0.5);
          ctx.strokeStyle = rgba(RGB.indigo, a);
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(pts[i][0], pts[i][1]);
          ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
          ctx.stroke();
        }
      }
    };
  },
};
