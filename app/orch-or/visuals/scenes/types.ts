import type { Pen } from '../pen';

/**
 * A figure: a pure function of time, so a still frame and the animation are
 * the same drawing. Seeded randomness only.
 */
export interface Scene {
  /** The representative moment drawn for stills and with reduced motion. */
  still: number;
  draw(pen: Pen, t: number): void;
}
