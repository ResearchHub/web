import type { PosterOnlySceneId, SceneId } from '../data/content';
import type { HeroId } from './heroes';

/** The six figures every set draws: the hero and one per question (Q1, Q3–Q6). */
export type FigureId = 'hero' | SceneId;

/** Figures only the Poster set draws (Q2); the other sets show its version. */
export const POSTER_ONLY: PosterOnlySceneId[] = ['turing'];
export type PosterFigureId = FigureId | PosterOnlySceneId;
export const isPosterOnly = (fig: string): fig is PosterOnlySceneId =>
  (POSTER_ONLY as string[]).includes(fig);

export const FIGURE_IDS: FigureId[] = [
  'hero',
  'anesthesia',
  'superradiance',
  'wigner',
  'spacetime',
  'raster',
];

/**
 * What a set's live module renders: one figure filling its (positioned)
 * parent. `still` asks for a single frame at the set's still moment and no
 * loop (used to capture the static fallback images). `onReady` is called
 * once the first frame is on screen, so the layer can fade in over the
 * static image.
 */
export interface LiveFigureProps {
  fig: FigureId;
  /** Which hero candidate to draw (Poster only). */
  hero?: HeroId;
  still: boolean;
  onReady: () => void;
}
