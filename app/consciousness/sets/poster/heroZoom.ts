import { hexToRgb } from '../../theme';
import { INK, RGB, T, rgba, tint } from './inks';
import {
  PLATE_STILL,
  clamp,
  cumulative,
  phoneArt,
  plateState,
  pyramidal,
  strokeTubes,
} from './heroKit';
import type { PaperDraw, PaperFigure } from './paperFigure';
import { printFonts } from './type';

/**
 * Hero candidate C, "Powers of ten": four loupes stepping down in scale,
 * each zooming into a marked spot in the one before. The brain; a neuron
 * in its cortex; a microtubule inside the neuron's dendrite; one tubulin
 * dimer of that microtubule, printed twice in blue and pink, out of
 * register (two states at once), snapping into register as one indigo
 * outcome every 11 s, when the neuron fires. The chain the page asks
 * researchers to test, in one picture.
 */

interface Loupe {
  x: number;
  y: number;
  r: number;
  /** The spot zoomed into, inside this loupe, in loupe units (r = 1). */
  mark: [number, number, number] | null;
  label: string;
}

const NEURON = pyramidal(7, 0.1);
/** The neuron's scale and vertical shift in its loupe. */
const NEURON_U = 0.17;
const NEURON_Y = 1.3;
/** Where the neuron loupe's mark sits: on the apical dendrite. */
const APICAL_MARK: [number, number, number] = (() => {
  const pts = NEURON.tubes[0].pts;
  const i = Math.floor((pts.length / 2) * 0.62);
  return [pts[i * 2] * NEURON_U, (pts[i * 2 + 1] + NEURON_Y) * NEURON_U, 0.1];
})();
const TAU = Math.PI * 2;

function layout(w: number, h: number): Loupe[] {
  const names = ['Brain · 15 cm', 'Neuron · 20 µm', 'Microtubule · 25 nm', 'Tubulin · 8 nm'];
  const marks: Loupe['mark'][] = [[0.3, -0.5, 0.1], APICAL_MARK, [0.08, 0.05, 0.16], null];
  if (w >= h) {
    const u = h;
    const spots: [number, number, number][] = [
      [0.68 * w, 0.31 * h, Math.min(0.175 * u, 0.13 * w)],
      [0.895 * w, 0.4 * h, Math.min(0.13 * u, 0.095 * w)],
      [0.69 * w, 0.71 * h, Math.min(0.13 * u, 0.095 * w)],
      [0.9 * w, 0.73 * h, Math.min(0.115 * u, 0.085 * w)],
    ];
    return spots.map(([x, y, r], i) => ({ x, y, r, mark: marks[i], label: names[i] }));
  }
  const top = phoneArt(w, h);
  const spots: [number, number, number][] = [
    [0.3 * w, 0.34 * top, Math.min(0.215 * w, 0.27 * top)],
    [0.77 * w, 0.3 * top, Math.min(0.16 * w, 0.2 * top)],
    [0.3 * w, 0.78 * top, Math.min(0.145 * w, 0.18 * top)],
    [0.75 * w, 0.76 * top, Math.min(0.14 * w, 0.175 * top)],
  ];
  return spots.map(([x, y, r], i) => ({ x, y, r, mark: marks[i], label: names[i] }));
}

/** Outer tangents between two circles: two segments [x1, y1, x2, y2]. */
function tangents(ax: number, ay: number, ar: number, bx: number, by: number, br: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const d = Math.hypot(dx, dy);
  const base = Math.atan2(dy, dx);
  const a = Math.acos(clamp((ar - br) / d, -1, 1));
  return [1, -1].map((s) => {
    const t = base + s * a;
    return [
      ax + Math.cos(t) * ar,
      ay + Math.sin(t) * ar,
      bx + Math.cos(t) * br,
      by + Math.sin(t) * br,
    ];
  });
}

// ------------------------------------------------------------- contents

/** A brain from the side, facing left, in units of the loupe radius. */
export function brain(g: CanvasRenderingContext2D, s: number) {
  const P = (x: number, y: number): [number, number] => [x * s, y * s];
  const cerebrum = new Path2D();
  const m = (x: number, y: number) => cerebrum.moveTo(...P(x, y));
  const q = (cx: number, cy: number, x: number, y: number) =>
    cerebrum.quadraticCurveTo(...P(cx, cy), ...P(x, y));
  m(-0.8, 0.08);
  q(-0.88, -0.32, -0.6, -0.5);
  q(-0.38, -0.66, -0.08, -0.64);
  q(0.3, -0.66, 0.55, -0.44);
  q(0.8, -0.24, 0.76, 0.04);
  q(0.74, 0.2, 0.58, 0.22);
  q(0.3, 0.3, 0.06, 0.3);
  q(-0.2, 0.42, -0.4, 0.26);
  q(-0.5, 0.14, -0.56, 0.16);
  q(-0.72, 0.24, -0.8, 0.08);
  cerebrum.closePath();
  const cerebellum = new Path2D();
  cerebellum.ellipse(...P(0.5, 0.33), 0.26 * s, 0.14 * s, -0.12, 0, TAU);
  const stem = new Path2D();
  stem.moveTo(...P(0.18, 0.3));
  stem.quadraticCurveTo(...P(0.22, 0.55), ...P(0.3, 0.74));
  stem.lineTo(...P(0.42, 0.72));
  stem.quadraticCurveTo(...P(0.36, 0.5), ...P(0.38, 0.3));
  stem.closePath();

  g.lineJoin = 'round';
  for (const [path, fill] of [
    [stem, tint(T.accent, 0.5)],
    [cerebellum, tint(T.accent, 0.58)],
    [cerebrum, INK.knock],
  ] as const) {
    g.fillStyle = fill;
    g.fill(path);
    g.strokeStyle = INK.indigo;
    g.lineWidth = 1.6;
    g.stroke(path);
  }
  // Folds: the lateral and central sulci, and a few gyri.
  g.save();
  g.clip(cerebrum);
  g.strokeStyle = rgba(RGB.indigo, 0.7);
  g.lineWidth = 1.3;
  g.lineCap = 'round';
  const curve = (pts: number[]) => {
    g.beginPath();
    g.moveTo(...P(pts[0], pts[1]));
    for (let i = 2; i < pts.length; i += 4)
      g.quadraticCurveTo(...P(pts[i], pts[i + 1]), ...P(pts[i + 2], pts[i + 3]));
    g.stroke();
  };
  curve([-0.5, 0.14, -0.2, 0.02, 0.18, -0.06, 0.36, -0.14, 0.42, -0.04]);
  curve([0.06, -0.66, -0.02, -0.4, -0.08, -0.18, -0.12, -0.06, -0.06, 0.0]);
  g.strokeStyle = rgba(RGB.indigo, 0.42);
  g.lineWidth = 1.1;
  curve([-0.66, -0.3, -0.5, -0.22, -0.36, -0.36, -0.3, -0.46, -0.22, -0.56]);
  curve([-0.7, -0.06, -0.52, -0.06, -0.42, -0.2, -0.3, -0.24, -0.2, -0.1]);
  curve([0.2, -0.58, 0.14, -0.4, 0.22, -0.3, 0.32, -0.22, 0.46, -0.3]);
  curve([0.6, -0.36, 0.52, -0.2, 0.6, -0.06]);
  curve([-0.2, 0.18, 0.0, 0.12, 0.2, 0.16, 0.36, 0.1, 0.5, 0.14]);
  curve([0.28, -0.46, 0.36, -0.34, 0.5, -0.4]);
  g.restore();
  // Folia of the cerebellum.
  g.save();
  g.clip(cerebellum);
  g.strokeStyle = rgba(RGB.indigo, 0.45);
  g.lineWidth = 1;
  for (let i = 1; i < 6; i++) {
    g.beginPath();
    g.ellipse(
      ...P(0.5, 0.33 + 0.1),
      (0.3 - i * 0.02) * s,
      (0.06 + i * 0.03) * s,
      -0.12,
      Math.PI * 1.05,
      Math.PI * 1.95
    );
    g.stroke();
  }
  g.restore();
}

/** A pyramidal neuron, centred a little below the middle. */
function neuron(g: CanvasRenderingContext2D, s: number) {
  const u = s * NEURON_U;
  const map = (x: number, y: number): [number, number] => [x * u, (y + NEURON_Y) * u];
  strokeTubes(g, NEURON.tubes, INK.indigo, 2.2, map, u);
  const soma = new Path2D();
  for (let i = 0; i < NEURON.soma.length; i += 2) {
    const [x, y] = map(NEURON.soma[i], NEURON.soma[i + 1]);
    if (i) soma.lineTo(x, y);
    else soma.moveTo(x, y);
  }
  soma.closePath();
  g.strokeStyle = INK.indigo;
  g.lineWidth = 2.2;
  g.stroke(soma);
  strokeTubes(g, NEURON.tubes, INK.knock, 0, map, u);
  g.fillStyle = INK.knock;
  g.fill(soma);
  g.strokeStyle = rgba(RGB.indigo, 0.55);
  g.lineWidth = 1;
  g.beginPath();
  g.arc(...map(0, 0.05), u * 0.3, 0, TAU);
  g.stroke();
}

/** A microtubule from the side: 13 strands of beads, a 3-start lattice. */
function microtubule(g: CanvasRenderingContext2D, s: number) {
  const ang = -0.42;
  const R = s * 0.3;
  const bead = R * 0.15;
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const at = (u: number, v: number): [number, number] => [u * ca - v * sa, u * sa + v * ca];
  const beads: [number, number, number, number][] = [];
  for (let n = 0; n < 13; n++) {
    const th = (n / 13) * TAU + 0.2;
    const depth = Math.cos(th);
    const v = Math.sin(th) * R;
    for (let j = -16; j <= 16; j++) {
      const u = j * bead * 2.05 + (n * 3 * bead * 2.05) / 13;
      if (Math.abs(u) > s * 1.2) continue;
      beads.push([u, v, depth, j & 1]);
    }
  }
  beads.sort((a, b) => a[2] - b[2]);
  for (const [u, v, depth, beta] of beads) {
    const [x, y] = at(u, v);
    const near = depth > 0;
    const k = near ? 0.55 + 0.45 * depth : 0.3;
    g.fillStyle = tint(T.accent, (beta ? 0.5 : 0.74) * (near ? 1 : 0.6));
    g.beginPath();
    g.arc(x, y, bead * (near ? 1 : 0.92), 0, TAU);
    g.fill();
    g.strokeStyle = rgba(RGB.indigo, 0.9 * k);
    g.lineWidth = 1.1;
    g.stroke();
    if (near && depth > 0.3) {
      g.fillStyle = rgba([255, 250, 242], 0.75 * depth);
      g.beginPath();
      g.arc(x - bead * 0.35, y - bead * 0.35, bead * 0.22, 0, TAU);
      g.fill();
    }
  }
}

// ------------------------------------------------------------- the figure

interface Plate {
  key: string;
  base: HTMLCanvasElement;
  loupes: Loupe[];
  spike: { pts: [number, number][]; len: number[]; width: number; clip: Loupe };
}

function bake(w: number, h: number, dpr: number, font: { display: string; body: string }): Plate {
  const loupes = layout(w, h);
  const c = document.createElement('canvas');
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Zoom lines first, under the loupes.
  g.save();
  g.strokeStyle = rgba(RGB.indigo, 0.5);
  g.lineWidth = 1;
  g.setLineDash([3, 4]);
  for (let i = 0; i < loupes.length - 1; i++) {
    const a = loupes[i];
    const b = loupes[i + 1];
    if (!a.mark) continue;
    const [mx, my, mr] = a.mark;
    for (const [x1, y1, x2, y2] of tangents(
      a.x + mx * a.r,
      a.y + my * a.r,
      mr * a.r,
      b.x,
      b.y,
      b.r
    )) {
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
    }
  }
  g.restore();

  const draws = [brain, neuron, microtubule, null];
  loupes.forEach((l, i) => {
    // Paper inside, a ring round it.
    g.save();
    g.beginPath();
    g.arc(l.x, l.y, l.r, 0, TAU);
    g.fillStyle = '#fffaf2';
    g.fill();
    g.clip();
    g.translate(l.x, l.y);
    draws[i]?.(g, l.r);
    g.restore();
    g.strokeStyle = INK.indigo;
    g.lineWidth = 1.8;
    g.beginPath();
    g.arc(l.x, l.y, l.r, 0, TAU);
    g.stroke();
    // The spot the next loupe zooms into.
    if (l.mark) {
      const [mx, my, mr] = l.mark;
      g.strokeStyle = INK.indigo;
      g.lineWidth = 1.3;
      g.beginPath();
      g.arc(l.x + mx * l.r, l.y + my * l.r, mr * l.r, 0, TAU);
      g.stroke();
    }
    // Label: a pill on the bottom of the ring.
    const size = clamp(l.r * 0.11, 10, 13.5);
    g.font = `600 ${size}px ${font.body}`;
    const tw = g.measureText(l.label).width;
    const py = l.y + l.r;
    g.fillStyle = '#fffaf2';
    g.strokeStyle = INK.indigo;
    g.lineWidth = 1.2;
    g.beginPath();
    g.roundRect(l.x - tw / 2 - size * 0.7, py - size * 0.95, tw + size * 1.4, size * 1.9, size);
    g.fill();
    g.stroke();
    g.fillStyle = INK.indigo;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(l.label, l.x, py + size * 0.04);
  });

  // The neuron's spike path, in page coordinates.
  const nl = loupes[1];
  const u = nl.r * NEURON_U;
  const map = (x: number, y: number): [number, number] => [nl.x + x * u, nl.y + (y + NEURON_Y) * u];
  const pts: [number, number][] = [];
  for (let i = 0; i < NEURON.spikePath.length; i += 2)
    pts.push(map(NEURON.spikePath[i], NEURON.spikePath[i + 1]));
  return {
    key: `${w}x${h}@${dpr}`,
    base: c,
    loupes,
    spike: { pts, len: cumulative(NEURON.spikePath, map), width: u * 0.24, clip: nl },
  };
}

export const heroZoom: PaperFigure = {
  still: PLATE_STILL,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t, dpr) => {
      const d = Math.min(dpr, 2);
      if (!plate || plate.key !== `${w}x${h}@${d}`) plate = bake(w, h, d, printFonts(ctx.canvas));
      const { sep, flash, since } = plateState(t);
      const L = plate.loupes[3];

      // The flare round the last loupe at a collapse.
      if (flash > 0.01) {
        const gr = L.r * 2.2;
        const glow = ctx.createRadialGradient(L.x, L.y, L.r * 0.6, L.x, L.y, gr);
        glow.addColorStop(0, rgba(hexToRgb(T.accent), 0.8 * flash));
        glow.addColorStop(1, rgba(hexToRgb(T.accent), 0));
        ctx.fillStyle = glow;
        ctx.fillRect(L.x - gr, L.y - gr, gr * 2, gr * 2);
      }
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(plate.base, 0, 0, w, h);

      // The tubulin dimer, printed twice.
      const r = L.r * 0.27;
      const off = L.r * 0.13 * sep;
      ctx.save();
      ctx.beginPath();
      ctx.arc(L.x, L.y, L.r - 1, 0, TAU);
      ctx.clip();
      for (const [col, sx] of [
        [RGB.blue, -1],
        [RGB.pink, 1],
      ] as const) {
        const ox = sx * off * 0.8;
        const oy = sx * off * 0.6;
        ctx.fillStyle = rgba(col, 0.9);
        ctx.beginPath();
        ctx.arc(L.x + ox - r * 0.86, L.y + oy + r * 0.3, r, 0, TAU);
        ctx.arc(L.x + ox + r * 0.86, L.y + oy - r * 0.3, r, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';
      // The question, while the two prints are apart.
      if (sep > 0.3) {
        const size = clamp(L.r * 0.34, 18, 40);
        const fonts = printFonts(ctx.canvas);
        ctx.font = `700 ${size}px ${fonts.display}`;
        ctx.fillStyle = rgba(RGB.indigo, Math.min(1, (sep - 0.3) / 0.4));
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('?', L.x + L.r * 0.62, L.y - L.r * 0.38);
      }

      // The neuron fires after the collapse.
      const run = since - 0.25;
      if (run > 0 && run < 2.2) {
        const { pts, len, width, clip } = plate.spike;
        const total = len[len.length - 1];
        const head = (run / 1.9) * total;
        const tail = width * 7;
        ctx.save();
        ctx.beginPath();
        ctx.arc(clip.x, clip.y, clip.r - 1, 0, TAU);
        ctx.clip();
        ctx.lineCap = 'round';
        for (let i = 0; i < pts.length - 1; i++) {
          const dd = head - len[i];
          if (dd < 0 || dd > tail) continue;
          ctx.strokeStyle = rgba(
            RGB.indigo,
            (1 - dd / tail) * 0.75 * (1 - Math.max(0, run - 1.7) / 0.5)
          );
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(pts[i][0], pts[i][1]);
          ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
          ctx.stroke();
        }
        ctx.restore();
      }
    };
  },
};
