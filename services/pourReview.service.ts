import { ApiClient } from './client';
import { transformPourReviewPuzzle, type Pour, type PourReviewPuzzle } from '@/types/pourReview';

export class PourReviewService {
  private static readonly BASE_PATH = '/api/pour_review';

  /**
   * Gets today's puzzle, with the user's solution and stats when signed in
   * @throws {ApiError} When the request fails
   */
  static async getTodaysPuzzle(): Promise<PourReviewPuzzle> {
    const response = await ApiClient.get<any>(`${this.BASE_PATH}/puzzles/today/`);
    return transformPourReviewPuzzle(response);
  }

  /**
   * Saves the signed-in user's solution and returns the puzzle with refreshed stats
   * @throws {ApiError} When the pours do not solve the puzzle or were already saved
   */
  static async submitResult(puzzleId: number, pours: Pour[]): Promise<PourReviewPuzzle> {
    const response = await ApiClient.post<any>(`${this.BASE_PATH}/results/`, {
      puzzle: puzzleId,
      pours,
    });
    return transformPourReviewPuzzle(response);
  }
}
