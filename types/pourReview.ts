import { createTransformer } from './transformer';

/** A pour from one flask into another, as [source, target] flask indexes. */
export type Pour = [number, number];

export interface PourReviewStats {
  played: number;
  currentStreak: number;
  bestStreak: number;
  parRate: number;
}

export interface PourReviewPuzzle {
  id: number;
  number: number;
  date: string;
  flasks: number[];
  targetAmount: number;
  targetCount: number;
  par: number;
  parRate: number;
  solvedPours: Pour[] | null;
  stats: PourReviewStats | null;
}

const transformPourReviewStats = createTransformer<any, PourReviewStats>((raw) => ({
  played: raw.played,
  currentStreak: raw.current_streak,
  bestStreak: raw.best_streak,
  parRate: raw.par_rate,
}));

export const transformPourReviewPuzzle = createTransformer<any, PourReviewPuzzle>((raw) => ({
  id: raw.id,
  number: raw.number,
  date: raw.date,
  flasks: raw.flasks,
  targetAmount: raw.target_amount,
  targetCount: raw.target_count,
  par: raw.par,
  parRate: raw.par_rate,
  solvedPours: raw.solved_pours,
  stats: raw.stats ? transformPourReviewStats(raw.stats) : null,
}));
