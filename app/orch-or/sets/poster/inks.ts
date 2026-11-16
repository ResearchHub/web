import { THEMES, hexToRgb } from '../../theme';

/**
 * The Poster set's inks, shared by every figure in it: the theme's colours
 * and the tints the colour fields and diagrams print in. Figures are drawn
 * on a transparent canvas multiplied onto the paper, so a mark's colour is
 * the ink it prints.
 */

export const T = THEMES.poster;

/** `hex` let down towards the paper by `k` (0 = paper, 1 = full ink). */
export function tint(hex: string, k: number) {
  const a = hexToRgb(T.ink);
  const b = hexToRgb(hex);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * k));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export const PAPER = T.ink;
export const YELLOW = tint(T.accent, 0.85);

/** CSS colour strings for the Canvas 2D figures. */
export const INK = {
  blue: T.gold,
  pink: T.ice,
  indigo: T.white,
  dim: T.dim,
  /** Knock-out fills (tubulin bodies) print in yellow, not paper. */
  knock: tint(T.accent, 0.7),
  knockLight: tint(T.accent, 0.5),
  /** The paper itself, for letters and highlights printed as gaps in the ink. */
  paper: '#fffaf2',
} as const;

/** Each ink as [r, g, b], for building rgba() strings. */
export const RGB = {
  blue: hexToRgb(T.gold),
  pink: hexToRgb(T.ice),
  indigo: hexToRgb(T.white),
  dim: hexToRgb(T.dim),
  /** The grey of a printed micrograph's relief: the body text's violet grey. */
  relief: hexToRgb(T.soft),
  /** Pink over yellow, for a neuron firing. */
  fire: hexToRgb(T.fire ?? T.ice),
} as const;

export const rgba = (c: readonly number[], a: number) =>
  `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;

/** A display face for letters inside figures (loaded by the page). */
export const LETTER_FONT = '"Bricolage Grotesque", system-ui, sans-serif';
