import { THEMES } from '../../theme';

/**
 * The micrograph's furniture, drawn on a 2D canvas over the 3D view: an
 * instrument data strip, a scale bar measured from the camera, and the
 * figures' traces and gauges. Scenes draw it from their frame callback.
 */

const T = THEMES.micrograph;

export interface Hud {
  ctx: CanvasRenderingContext2D | null;
  w: number;
  h: number;
  dpr: number;
  font: string;
  frame: number;
}

export function newHud(): Hud {
  return { ctx: null, w: 0, h: 0, dpr: 1, font: 'system-ui, sans-serif', frame: 0 };
}

/** Clears the overlay; returns the context ready to draw in CSS pixels, or null. */
export function beginHud(hud: Hud) {
  const { ctx } = hud;
  if (!ctx || hud.w === 0) return null;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(hud.dpr, 0, 0, hud.dpr, 0, 0);
  hud.frame++;
  return ctx;
}

const NICE = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000];

export interface StripOpts {
  /** Screen pixels per unit at the focal plane. */
  pxPerUnit: number;
  unit: string;
  /** Instrument mode, e.g. "SE2 · 5.00 kV". */
  mode: string;
  /** Show magnification (only meaningful for nanometre scales). */
  mag?: boolean;
  /** Where to draw: a full strip along the bottom, or a compact block. */
  place: 'strip' | 'bottom-right' | 'top-left';
  /** Extra space above the bottom edge for the compact placements. */
  lift?: number;
}

const fmtMag = (m: number) => {
  const r = Math.round(m / 1000) * 1000;
  return '×' + r.toLocaleString('en-US').replace(/,/g, ' ');
};

/** The data strip and scale bar. */
export function drawStrip(hud: Hud, ctx: CanvasRenderingContext2D, o: StripOpts) {
  const { w, h } = hud;
  const small = w < 520;
  const fs = small ? 9.5 : 10.5;
  ctx.font = `500 ${fs}px ${hud.font}`;
  ctx.textBaseline = 'middle';

  // A scale bar of a round length, 50–130 px long.
  const target = small ? 56 : 84;
  let len = NICE[0];
  for (const n of NICE) if (n * o.pxPerUnit <= target * 1.5) len = n;
  const barPx = len * o.pxPerUnit;
  const scaleLabel = `${len} ${o.unit}`;
  const mag = o.mag ? fmtMag(o.pxPerUnit * 264600) : '';
  const frame = String(hud.frame % 10000).padStart(4, '0');
  const left = [o.mode, mag].filter(Boolean).join('   ');

  if (o.place === 'strip') {
    const sh = small ? 22 : 26;
    const y = h - sh / 2;
    ctx.fillStyle = 'rgba(8,9,11,0.72)';
    ctx.fillRect(0, h - sh, w, sh);
    ctx.fillStyle = 'rgba(242,240,234,0.12)';
    ctx.fillRect(0, h - sh, w, 1);
    ctx.fillStyle = 'rgba(236,234,230,0.78)';
    ctx.textAlign = 'left';
    ctx.fillText(left, 10, y);
    ctx.textAlign = 'right';
    ctx.fillText(frame, w - 10, y);
    const fw = ctx.measureText(frame).width;
    const lx = w - 10 - fw - 18;
    ctx.fillText(scaleLabel, lx, y);
    const lw = ctx.measureText(scaleLabel).width;
    const bx = lx - lw - 8 - barPx;
    ctx.fillStyle = 'rgba(242,240,234,0.92)';
    ctx.fillRect(bx, y - 1.5, barPx, 3);
    return;
  }

  // Compact: scale bar over its label, mode line beneath.
  const right = o.place === 'bottom-right';
  const x0 = right ? w - 24 : 20;
  const yb = right ? h - (o.lift ?? 0) : (o.lift ?? 0);
  ctx.textAlign = right ? 'right' : 'left';
  ctx.fillStyle = 'rgba(242,240,234,0.92)';
  ctx.fillRect(right ? x0 - barPx : x0, yb, barPx, 3);
  ctx.fillStyle = 'rgba(236,234,230,0.8)';
  ctx.fillText(scaleLabel, x0, yb + 14);
  ctx.fillStyle = 'rgba(236,234,230,0.55)';
  ctx.fillText(`${left}   ${frame}`, x0, yb + 28);
}

/** Colours for 2D drawing. */
export const HUD_COLORS = { a: T.gold, b: T.ice, w: T.white, accent: T.accent, dim: T.dim };

/**
 * A small instrument trace panel: a dark plate with axes, and curves drawn
 * by `curves` in the plate's coordinates (x 0–1 left to right, y 0–1 up).
 */
export function tracePanel(
  hud: Hud,
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number },
  title: string,
  curves: (
    plot: (fn: (x: number) => number, color: string, upTo?: number, width?: number) => void
  ) => void
) {
  ctx.fillStyle = 'rgba(8,9,11,0.62)';
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeStyle = 'rgba(242,240,234,0.18)';
  ctx.lineWidth = 1;
  ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
  const pad = 10;
  const px = box.x + pad;
  const pw = box.w - pad * 2;
  const top = box.y + 20;
  const base = box.y + box.h - 9;
  const ph = base - top;
  ctx.font = `500 ${hud.w < 520 ? 9 : 10}px ${hud.font}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(236,234,230,0.6)';
  ctx.fillText(title, px, box.y + 11);
  ctx.strokeStyle = 'rgba(242,240,234,0.22)';
  ctx.beginPath();
  ctx.moveTo(px, base + 0.5);
  ctx.lineTo(px + pw, base + 0.5);
  ctx.stroke();
  curves((fn, color, upTo = 1, width = 1.6) => {
    if (upTo <= 0) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const n = 120;
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * Math.min(1, upTo);
      const y = fn(x);
      const sx = px + x * pw;
      const sy = base - Math.max(-0.2, Math.min(1.05, y)) * ph;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    if (upTo < 1) {
      const y = fn(upTo);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px + upTo * pw, base - y * ph, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}
