/**
 * A minimal drawing surface the page's figures are written against. Two
 * backends implement it: `CanvasPen` (the live, animated figure) and `SvgPen`
 * (the server-rendered still that shows before the script loads, and when
 * it cannot run). Because both draw the same scene function, the still is
 * the same picture as the animation, frozen at the scene's `still` time.
 *
 * Coordinates are CSS pixels of the figure box. Stroke widths are CSS pixels
 * on screen in both backends.
 */

export type Rgb = readonly [number, number, number];

export interface PathOpts {
  closed?: boolean;
  /** Fill colour, drawn before the stroke. */
  fill?: Rgb;
  fillAlpha?: number;
  /** Horizontal stroke gradient across the whole figure: left, middle, right. */
  gradient?: readonly [Rgb, Rgb, Rgb];
  dash?: readonly number[];
}

export interface Pen {
  readonly w: number;
  readonly h: number;
  /** 1 for the live canvas; lower for the server still, so scenes can draw fewer marks. */
  readonly detail: number;
  /** Additive light: overlapping marks brighten, like fluorescence. */
  additive(on: boolean): void;
  rect(x: number, y: number, w: number, h: number, c: Rgb, a: number): void;
  circle(x: number, y: number, r: number, c: Rgb, a: number): void;
  ring(x: number, y: number, r: number, c: Rgb, a: number, width: number): void;
  /** A soft radial glow of radius r. */
  glow(x: number, y: number, r: number, c: Rgb, a: number): void;
  line(x1: number, y1: number, x2: number, y2: number, c: Rgb, a: number, width: number): void;
  /** `pts` is a flat [x0, y0, x1, y1, ...] list. */
  path(pts: ArrayLike<number>, c: Rgb, a: number, width: number, opts?: PathOpts): void;
}

export const rgba = (c: Rgb, a: number) =>
  `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;

/** Canvas 2D backend. No GPU API needed. */
export class CanvasPen implements Pen {
  w = 0;
  h = 0;
  readonly detail = 1;
  private sprites = new Map<string, HTMLCanvasElement>();
  private gradients = new Map<string, CanvasGradient>();

  /**
   * `light` is how additive marks combine: 'lighter' (light on a dark
   * ground) by default; the Poster set uses 'multiply', like overprinted ink,
   * with `glowGain` below 1 so soft glows print as tints, not smudges.
   */
  constructor(
    private ctx: CanvasRenderingContext2D,
    private light: GlobalCompositeOperation = 'lighter',
    private glowGain = 1
  ) {}

  /** Sets the figure size and clears it. Call at the start of each frame. */
  begin(w: number, h: number, dpr: number) {
    if (w !== this.w) this.gradients.clear();
    this.w = w;
    this.h = h;
    const { ctx } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  additive(on: boolean) {
    this.ctx.globalCompositeOperation = on ? this.light : 'source-over';
  }

  rect(x: number, y: number, w: number, h: number, c: Rgb, a: number) {
    if (a <= 0.002) return;
    this.ctx.fillStyle = rgba(c, a);
    this.ctx.fillRect(x, y, w, h);
  }

  circle(x: number, y: number, r: number, c: Rgb, a: number) {
    if (a <= 0.002 || r <= 0) return;
    const { ctx } = this;
    ctx.fillStyle = rgba(c, a);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ring(x: number, y: number, r: number, c: Rgb, a: number, width: number) {
    if (a <= 0.002 || r <= 0) return;
    const { ctx } = this;
    ctx.strokeStyle = rgba(c, a);
    ctx.lineWidth = width;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  glow(x: number, y: number, r: number, c: Rgb, a: number) {
    if (a <= 0.002 || r <= 0.2) return;
    const key = c.join(',');
    let sprite = this.sprites.get(key);
    if (!sprite) {
      sprite = document.createElement('canvas');
      sprite.width = sprite.height = 64;
      const g = sprite.getContext('2d')!;
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, rgba(c, 1));
      grad.addColorStop(0.25, rgba(c, 0.55));
      grad.addColorStop(0.6, rgba(c, 0.12));
      grad.addColorStop(1, rgba(c, 0));
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      this.sprites.set(key, sprite);
    }
    const { ctx } = this;
    ctx.globalAlpha = Math.min(1, a * this.glowGain);
    ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = 1;
  }

  line(x1: number, y1: number, x2: number, y2: number, c: Rgb, a: number, width: number) {
    if (a <= 0.002) return;
    const { ctx } = this;
    ctx.strokeStyle = rgba(c, a);
    ctx.lineWidth = width;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  path(pts: ArrayLike<number>, c: Rgb, a: number, width: number, opts: PathOpts = {}) {
    if (pts.length < 4) return;
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    if (opts.closed) ctx.closePath();
    if (opts.fill) {
      ctx.fillStyle = rgba(opts.fill, opts.fillAlpha ?? 1);
      ctx.fill();
    }
    if (a <= 0.002 || width <= 0) return;
    if (opts.gradient) {
      const key = opts.gradient.map((g) => g.join(',')).join('|');
      let grad = this.gradients.get(key);
      if (!grad) {
        grad = ctx.createLinearGradient(0, 0, this.w, 0);
        grad.addColorStop(0.2, rgba(opts.gradient[0], 1));
        grad.addColorStop(0.5, rgba(opts.gradient[1], 1));
        grad.addColorStop(0.8, rgba(opts.gradient[2], 1));
        this.gradients.set(key, grad);
      }
      ctx.strokeStyle = grad;
      ctx.globalAlpha = Math.min(1, a);
    } else {
      ctx.strokeStyle = rgba(c, a);
    }
    ctx.lineWidth = width;
    ctx.setLineDash(opts.dash ? [...opts.dash] : []);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
