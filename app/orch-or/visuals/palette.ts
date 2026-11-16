import type { Rgb } from './pen';

import { THEME, hexToRgb, type Theme } from '../theme';

/**
 * One palette for every figure, taken from the page theme (`../theme.ts`).
 * Two tints stand for the two branches of a superposition: gold and ice,
 * equally bright, so neither side reads as the "right" one. White is a
 * single, classical outcome.
 */
export const A: Rgb = hexToRgb(THEME.gold); // branch A
export const B: Rgb = hexToRgb(THEME.ice); // branch B
export const W: Rgb = hexToRgb(THEME.white); // one outcome, ordinary matter
export const DIM: Rgb = hexToRgb(THEME.dim); // environment, scaffolding
export const INK: Rgb = hexToRgb(THEME.ink); // the page
export const INK2: Rgb = hexToRgb(THEME.ink2); // knock-out fills over the figure

const SLOTS = [A, B, W, DIM, INK, INK2] as unknown as number[][];

/**
 * Runs `fn` (a synchronous draw) with the figure colours taken from another
 * set's theme, then restores them. Scenes read the shared colour arrays at
 * draw time, so swapping their values in place recolours every scene without
 * threading a palette through each one. Used by the Poster set, which prints
 * the original diagrams in its own inks.
 */
export function withPalette<T>(theme: Theme, fn: () => T): T {
  const next = [theme.gold, theme.ice, theme.white, theme.dim, theme.ink, theme.ink2].map(hexToRgb);
  const saved = SLOTS.map((slot) => [...slot]);
  SLOTS.forEach((slot, i) => slot.splice(0, 3, ...next[i]));
  try {
    return fn();
  } finally {
    SLOTS.forEach((slot, i) => slot.splice(0, 3, ...saved[i]));
  }
}

export const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/** Seeded random numbers, so the server still and the live figure agree. */
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

/** A stateless hash in [0, 1) for (a, b) integer pairs. */
export function hash2(a: number, b: number) {
  let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export const clamp = (x: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));

export function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

export const fract = (x: number) => x - Math.floor(x);
