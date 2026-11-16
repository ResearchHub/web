import { THEMES, hexToRgb } from '../../theme';

/**
 * The engraver's kit for the Engraved set: the paper (parchment, fibres,
 * foxing, plate mark and double rule), the ink (fine sepia line, batched
 * into one stroke per weight), hatching and cross-hatching for tone, and
 * hand-laid watercolour washes on their own layer, multiplied onto the
 * plate with granulation and a pooled edge.
 */

const T = THEMES.engraved;
export const PAPER = hexToRgb(T.ink);
export const SEPIA = hexToRgb(T.white);
export const RED = hexToRgb(T.gold);
export const BLUE = hexToRgb(T.ice);
export const OCHRE = hexToRgb(T.accent);
export type Rgb = readonly [number, number, number];

export const rgba = (c: Rgb, a: number) =>
  `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;

export const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

export const clamp = (x: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
export function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}
export const fract = (x: number) => x - Math.floor(x);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** A stateless hash in [0, 1) for integer pairs. */
export function hash2(a: number, b: number) {
  let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Seeded random numbers. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth 1D value noise in [-1, 1], periodic in `period` integer steps. */
export function noise1(x: number, seed: number, period = 1 << 20) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = hash2(((i % period) + period) % period, seed);
  const b = hash2((((i + 1) % period) + period) % period, seed);
  return (a + (b - a) * u) * 2 - 1;
}

// ---------------------------------------------------------------- ink

/**
 * Batched engraved line. Segments and polylines are collected per call
 * and stroked once, which keeps thousands of hatch lines cheap.
 */
export class Ink {
  constructor(public ctx: CanvasRenderingContext2D) {}

  begin() {
    this.ctx.beginPath();
  }

  seg(x1: number, y1: number, x2: number, y2: number) {
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
  }

  poly(pts: ArrayLike<number>, closed = false) {
    if (pts.length < 4) return;
    this.ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) this.ctx.lineTo(pts[i], pts[i + 1]);
    if (closed) this.ctx.closePath();
  }

  circle(x: number, y: number, r: number) {
    this.ctx.moveTo(x + r, y);
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
  }

  stroke(a: number, width: number, c: Rgb = SEPIA) {
    const { ctx } = this;
    ctx.strokeStyle = rgba(c, a);
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

/**
 * Chords of a circle on its shadow side: the engraver's shading for a
 * sphere. `light` is the direction the light comes from (radians, screen
 * space); `tone` 0–1 is how far round the shadow reaches; above ~0.55 a
 * second family of lines crosses the first.
 */
export function beadHatch(
  ink: Ink,
  x: number,
  y: number,
  r: number,
  light: number,
  tone: number,
  spacing: number
) {
  if (r < 1.2 || tone <= 0.02) return;
  const n = Math.max(2, Math.round((2 * r) / spacing));
  const families = tone > 0.55 ? 2 : 1;
  for (let f = 0; f < families; f++) {
    const ang = light + Math.PI / 2 + (f === 0 ? 0.55 : -0.55);
    // The chord direction, and the normal along which chords step.
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    const nx = -dy;
    const ny = dx;
    // Shadow is away from the light.
    const sx = -Math.cos(light);
    const sy = -Math.sin(light);
    const side = nx * sx + ny * sy >= 0 ? 1 : -1;
    const reach = f === 0 ? tone : (tone - 0.55) * 1.6;
    for (let k = 0; k < n; k++) {
      const d = side * r * (1 - ((k + 0.5) / n) * 2 * reach);
      if (Math.abs(d) >= r * 0.97) continue;
      if (side * d < r * (1 - 2 * reach)) continue;
      const half = Math.sqrt(r * r - d * d) * 0.92;
      const cx = x + nx * d;
      const cy = y + ny * d;
      ink.seg(cx - dx * half, cy - dy * half, cx + dx * half, cy + dy * half);
    }
  }
}

/**
 * Parallel hatching across a box, clipped to whatever path the caller has
 * set as the clip. Lines at `angle`, `spacing` px apart, slightly wavering
 * like a burin's cut.
 */
export function hatchBox(
  ink: Ink,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  angle: number,
  spacing: number,
  seed = 1
) {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const R = Math.hypot(x1 - x0, y1 - y0) / 2;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const nx = -dy;
  const ny = dx;
  const n = Math.ceil((2 * R) / spacing);
  for (let k = 0; k <= n; k++) {
    const d = -R + k * spacing + noise1(k * 0.7, seed) * spacing * 0.12;
    const px = cx + nx * d;
    const py = cy + ny * d;
    ink.seg(px - dx * R, py - dy * R, px + dx * R, py + dy * R);
  }
}

// ---------------------------------------------------------------- washes

/** A wobbly closed outline round (x, y): a brushed blot, not a circle. */
export function blotPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  seed: number,
  wobble = 0.14
) {
  // Smooth, irregular: noise at two scales round the rim, joined by curves.
  const n = 24;
  const px: number[] = [];
  const py: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k =
      1 +
      wobble * (0.7 * noise1(i * 0.35, seed, Math.round(n * 0.35)) + 0.3 * noise1(i, seed + 5, n));
    px.push(x + Math.cos(a) * rx * k);
    py.push(y + Math.sin(a) * ry * k);
  }
  ctx.moveTo((px[n - 1] + px[0]) / 2, (py[n - 1] + py[0]) / 2);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    ctx.quadraticCurveTo(px[i], py[i], (px[i] + px[j]) / 2, (py[i] + py[j]) / 2);
  }
  ctx.closePath();
}

/**
 * The wash layer: an offscreen canvas the figures paint colour onto during
 * a frame (source-over, with alpha), which is then granulated and
 * multiplied onto the plate, so overlapping washes darken like watercolour.
 */
export class WashLayer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  private grain: CanvasPattern | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  begin(pw: number, ph: number, dpr: number) {
    if (this.canvas.width !== pw || this.canvas.height !== ph) {
      this.canvas.width = pw;
      this.canvas.height = ph;
    }
    const { ctx } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, pw, ph);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
  }

  /** A blot of colour with a darker pooled edge. */
  blot(x: number, y: number, rx: number, ry: number, c: Rgb, a: number, seed: number) {
    if (a <= 0.01 || rx < 0.5) return;
    const { ctx } = this;
    ctx.beginPath();
    blotPath(ctx, x, y, rx, ry, seed);
    ctx.fillStyle = rgba(c, a * 0.75);
    ctx.fill();
    ctx.strokeStyle = rgba(c, a * 0.35);
    ctx.lineWidth = Math.max(1, Math.min(rx, ry) * 0.12);
    ctx.stroke();
  }

  /** A wash over a closed polygon, laid twice slightly off register. */
  poly(pts: ArrayLike<number>, c: Rgb, a: number, offset = 1.6) {
    if (a <= 0.01 || pts.length < 6) return;
    const { ctx } = this;
    for (let pass = 0; pass < 2; pass++) {
      const ox = pass ? offset : -offset * 0.4;
      const oy = pass ? -offset * 0.6 : offset * 0.3;
      ctx.beginPath();
      ctx.moveTo(pts[0] + ox, pts[1] + oy);
      for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i] + ox, pts[i + 1] + oy);
      ctx.closePath();
      ctx.fillStyle = rgba(c, a * 0.45);
      ctx.fill();
    }
    ctx.strokeStyle = rgba(c, a * 0.28);
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  /** Soft radial wash, for light and halos. */
  soft(x: number, y: number, r: number, c: Rgb, a: number) {
    if (a <= 0.01 || r <= 0.5) return;
    const { ctx } = this;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(c, a));
    g.addColorStop(0.55, rgba(c, a * 0.5));
    g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  /** Granulate what was painted and multiply it onto the plate. */
  apply(target: CanvasRenderingContext2D) {
    const { ctx, canvas } = this;
    if (!this.grain) this.grain = ctx.createPattern(grainTile(), 'repeat');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    if (this.grain) {
      ctx.fillStyle = this.grain;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.globalCompositeOperation = 'source-over';
    target.save();
    target.setTransform(1, 0, 0, 1, 0, 0);
    target.globalCompositeOperation = 'multiply';
    target.drawImage(canvas, 0, 0);
    target.restore();
  }
}

let grainCanvas: HTMLCanvasElement | null = null;
/** Pigment granulation: speckles darker and lighter than the wash. */
function grainTile() {
  if (grainCanvas) return grainCanvas;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const r = rng(77);
  for (let i = 0; i < 2600; i++) {
    const dark = r() < 0.6;
    g.fillStyle = dark
      ? `rgba(60,40,25,${0.05 + r() * 0.1})`
      : `rgba(255,250,235,${0.08 + r() * 0.12})`;
    const s = 0.6 + r() * 1.6;
    g.fillRect(r() * 128, r() * 128, s, s);
  }
  grainCanvas = c;
  return c;
}

// ---------------------------------------------------------------- paper

export interface PlateLabels {
  /** "Fig. 2." and the like, top left of the plate. */
  fig: string;
  /** A short engraved title beside the figure number. */
  title: string;
  /** Where the plate number sits: 'tl' (questions) or a point (hero). */
  at?: { x: number; y: number; align: CanvasTextAlign };
}

export interface PlateFrame {
  /** Inner edge of the double rule. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export function plateFrame(w: number, h: number): PlateFrame {
  const m = Math.round(Math.min(w, h) * 0.03) + 6;
  return { x0: m, y0: m, x1: w - m, y1: h - m };
}

/**
 * Paints the paper once per size: parchment with a slow tonal drift,
 * fibres, a little foxing, the plate mark pressed into it and a double
 * rule. Returned as a canvas the frame draws first.
 */
export function paintPaper(
  w: number,
  h: number,
  dpr: number,
  family: string,
  labels: PlateLabels
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * dpr));
  c.height = Math.max(1, Math.round(h * dpr));
  const g = c.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const r = rng(Math.round(w * 7 + h));

  g.fillStyle = rgba(PAPER, 1);
  g.fillRect(0, 0, w, h);
  // Tonal drift: warmer, darker towards the edges and in a few clouds.
  const edge = g.createRadialGradient(
    w * 0.55,
    h * 0.45,
    Math.min(w, h) * 0.2,
    w / 2,
    h / 2,
    Math.hypot(w, h) * 0.62
  );
  edge.addColorStop(0, 'rgba(255,250,236,0.35)');
  edge.addColorStop(1, 'rgba(150,110,60,0.16)');
  g.fillStyle = edge;
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 7; i++) {
    const x = r() * w;
    const y = r() * h;
    const rad = (0.15 + r() * 0.3) * Math.max(w, h);
    const cloud = g.createRadialGradient(x, y, 0, x, y, rad);
    cloud.addColorStop(0, `rgba(170,130,70,${0.025 + r() * 0.035})`);
    cloud.addColorStop(1, 'rgba(170,130,70,0)');
    g.fillStyle = cloud;
    g.fillRect(0, 0, w, h);
  }
  // Fibres.
  const fibres = Math.round((w * h) / 2200);
  g.lineCap = 'round';
  for (let i = 0; i < fibres; i++) {
    const x = r() * w;
    const y = r() * h;
    const len = 4 + r() * 16;
    const a = r() * Math.PI;
    g.strokeStyle =
      r() < 0.7 ? `rgba(110,80,45,${0.04 + r() * 0.06})` : `rgba(255,252,240,${0.2 + r() * 0.25})`;
    g.lineWidth = 0.4 + r() * 0.5;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(
      x + Math.cos(a) * len * 0.5 + (r() - 0.5) * 4,
      y + Math.sin(a) * len * 0.5 + (r() - 0.5) * 4,
      x + Math.cos(a) * len,
      y + Math.sin(a) * len
    );
    g.stroke();
  }
  // Foxing: a few rust spots.
  const spots = 4 + Math.round(r() * 5);
  for (let i = 0; i < spots; i++) {
    const x = r() * w;
    const y = r() * h;
    const rad = 2 + r() * 7;
    const fox = g.createRadialGradient(x, y, 0, x, y, rad);
    fox.addColorStop(0, `rgba(150,90,40,${0.12 + r() * 0.12})`);
    fox.addColorStop(0.6, 'rgba(160,100,50,0.06)');
    fox.addColorStop(1, 'rgba(160,100,50,0)');
    g.fillStyle = fox;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  // The plate mark: the area the copper plate pressed is a shade deeper,
  // with a bevelled edge (light then shadow).
  const f = plateFrame(w, h);
  const pm = Math.max(4, Math.round(Math.min(w, h) * 0.012));
  const px0 = f.x0 - pm * 1.8;
  const py0 = f.y0 - pm * 1.8;
  const px1 = f.x1 + pm * 1.8;
  const py1 = f.y1 + pm * 1.8;
  g.fillStyle = 'rgba(120,85,40,0.045)';
  g.fillRect(px0, py0, px1 - px0, py1 - py0);
  g.strokeStyle = 'rgba(255,252,242,0.7)';
  g.lineWidth = 1.2;
  g.strokeRect(px0 - 0.8, py0 - 0.8, px1 - px0 + 1.6, py1 - py0 + 1.6);
  g.strokeStyle = 'rgba(90,60,30,0.22)';
  g.lineWidth = 0.8;
  g.strokeRect(px0 + 0.6, py0 + 0.6, px1 - px0 - 1.2, py1 - py0 - 1.2);

  // The double rule.
  g.strokeStyle = rgba(SEPIA, 0.85);
  g.lineWidth = 1.1;
  g.strokeRect(f.x0 - 4, f.y0 - 4, f.x1 - f.x0 + 8, f.y1 - f.y0 + 8);
  g.lineWidth = 0.5;
  g.strokeRect(f.x0, f.y0, f.x1 - f.x0, f.y1 - f.y0);

  // The figure number and title.
  const size = Math.max(11, Math.min(17, Math.min(w, h) * 0.026));
  g.fillStyle = rgba(SEPIA, 0.9);
  g.textBaseline = 'alphabetic';
  const at = labels.at ?? { x: f.x0 + 10, y: f.y0 + size + 6, align: 'left' as CanvasTextAlign };
  g.textAlign = at.align;
  g.font = `italic ${size}px ${family}`;
  const figText = labels.fig + '  ';
  if (at.align === 'left') {
    g.fillText(figText, at.x, at.y);
    const fw = g.measureText(figText).width;
    g.font = `${size * 0.82}px ${family}`;
    g.fillStyle = rgba(SEPIA, 0.75);
    g.fillText(labels.title, at.x + fw, at.y);
  } else {
    g.font = `${size * 0.82}px ${family}`;
    g.fillStyle = rgba(SEPIA, 0.75);
    g.fillText(labels.title, at.x, at.y);
    const tw = g.measureText(labels.title).width;
    g.font = `italic ${size}px ${family}`;
    g.fillStyle = rgba(SEPIA, 0.9);
    g.fillText(labels.fig, at.x - tw - size * 0.6, at.y);
  }
  return c;
}

/** Small engraved lettering inside the figure. */
export function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  family: string,
  opts: { align?: CanvasTextAlign; italic?: boolean; alpha?: number; color?: Rgb } = {}
) {
  ctx.font = `${opts.italic === false ? '' : 'italic '}${size}px ${family}`;
  ctx.textAlign = opts.align ?? 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = rgba(opts.color ?? SEPIA, opts.alpha ?? 0.85);
  ctx.fillText(text, x, y);
}

/** The interface every engraved figure implements. */
export interface Engraving {
  still: number;
  labels: (w: number, h: number) => PlateLabels;
  draw: (f: FrameCtx, t: number) => void;
}

export interface FrameCtx {
  ctx: CanvasRenderingContext2D;
  ink: Ink;
  wash: WashLayer;
  w: number;
  h: number;
  family: string;
  frame: PlateFrame;
}

/**
 * A figure's still moment, unless `?eng-t=<seconds>` asks for another one
 * (with `orch-motion=reduce`, to check any moment of a cycle as a still).
 */
export function stillAt(t: number) {
  if (typeof window === 'undefined') return t;
  const v = new URLSearchParams(window.location.search).get('eng-t');
  return v === null || Number.isNaN(Number(v)) ? t : Number(v);
}
