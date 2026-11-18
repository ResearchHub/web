import { LETTER_FONT } from './inks';

/**
 * Type inside the Poster figures: the page's own faces (Bricolage Grotesque
 * for numbers and display words, Geist for labels), read from the CSS the
 * page already loads, and a small run renderer for powers of ten, since the
 * display face has no superscript minus.
 */

let cache: { display: string; body: string } | null = null;

export function printFonts(el: Element) {
  if (cache) return cache;
  const cs = getComputedStyle(el);
  const display = cs.getPropertyValue('--font-orch-poster').trim();
  cache = {
    display: display ? `${display}, system-ui, sans-serif` : LETTER_FONT,
    body: cs.fontFamily || 'system-ui, sans-serif',
  };
  return cache;
}

/** A piece of text; `sup` raises it and sets it smaller (an exponent). */
export type Run = { text: string; sup?: boolean };

const SUP_SCALE = 0.62;
const SUP_RISE = 0.42;

function runFont(font: string, size: number, run: Run) {
  return font.replace('{size}', `${run.sup ? size * SUP_SCALE : size}px`);
}

export function measureRuns(
  ctx: CanvasRenderingContext2D,
  runs: Run[],
  font: string,
  size: number
) {
  let wsum = 0;
  for (const r of runs) {
    ctx.font = runFont(font, size, r);
    wsum += ctx.measureText(r.text).width;
  }
  return wsum;
}

/**
 * Draws `runs` on one baseline. `font` is a CSS font with `{size}` where the
 * size goes, e.g. `600 {size} family`.
 */
export function drawRuns(
  ctx: CanvasRenderingContext2D,
  runs: Run[],
  x: number,
  y: number,
  font: string,
  size: number,
  align: 'left' | 'center' | 'right' = 'left'
) {
  const total = measureRuns(ctx, runs, font, size);
  let cx = align === 'left' ? x : align === 'center' ? x - total / 2 : x - total;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (const r of runs) {
    ctx.font = runFont(font, size, r);
    ctx.fillText(r.text, cx, r.sup ? y - size * SUP_RISE : y);
    cx += ctx.measureText(r.text).width;
  }
  return total;
}

/** "10^exp" as runs, with a true minus sign. */
export const pow10 = (exp: number): Run[] => [
  { text: '10' },
  { text: exp < 0 ? `−${-exp}` : String(exp), sup: true },
];
