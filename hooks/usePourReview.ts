import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { PourReviewService } from '@/services/pourReview.service';
import type { Pour, PourReviewPuzzle } from '@/types/pourReview';

const getStorageKey = (puzzle: PourReviewPuzzle) => `pour-review-${puzzle.date}`;

function replayPours(flasks: number[], pours: Pour[]): number[] {
  const amounts = flasks.map((capacity, index) => (index === 0 ? capacity : 0));
  for (const [source, target] of pours) {
    const pouredAmount = Math.min(amounts[source], flasks[target] - amounts[target]);
    amounts[source] -= pouredAmount;
    amounts[target] += pouredAmount;
  }
  return amounts;
}

/**
 * Hook to play today's Pour Review puzzle, keeping pours across refreshes and
 * saving the solution once the user is signed in
 */
export function usePourReview() {
  const { status } = useSession();
  const [puzzle, setPuzzle] = useState<PourReviewPuzzle | null>(null);
  const [pours, setPours] = useState<Pour[]>([]);
  const [selectedFlask, setSelectedFlask] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSessionLoading = status === 'loading';
  const amounts = puzzle ? replayPours(puzzle.flasks, pours) : [];
  const measuredCount = amounts.filter((amount) => amount === puzzle?.targetAmount).length;
  const isSolved = !!puzzle && measuredCount >= puzzle.targetCount;

  useEffect(() => {
    if (isSessionLoading) return;

    const fetchPuzzle = async () => {
      try {
        const todaysPuzzle = await PourReviewService.getTodaysPuzzle();
        setPuzzle(todaysPuzzle);
        setPours(
          todaysPuzzle.solvedPours ??
            JSON.parse(localStorage.getItem(getStorageKey(todaysPuzzle)) ?? '[]')
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load today's puzzle");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPuzzle();
  }, [isSessionLoading]);

  useEffect(() => {
    if (!puzzle || !isSolved || puzzle.solvedPours || status !== 'authenticated') return;

    PourReviewService.submitResult(puzzle.id, pours)
      .then(setPuzzle)
      .catch(() => toast.error('Failed to save your result'));
  }, [puzzle, pours, isSolved, status]);

  const canPourInto = (flask: number) =>
    !!puzzle &&
    selectedFlask !== null &&
    flask !== selectedFlask &&
    amounts[flask] < puzzle.flasks[flask];

  const selectFlask = (flask: number) => {
    if (!puzzle || isSolved) return;

    if (canPourInto(flask)) {
      const nextPours: Pour[] = [...pours, [selectedFlask!, flask]];
      setPours(nextPours);
      localStorage.setItem(getStorageKey(puzzle), JSON.stringify(nextPours));
      setSelectedFlask(null);
    } else {
      setSelectedFlask(flask !== selectedFlask && amounts[flask] > 0 ? flask : null);
    }
  };

  return {
    puzzle,
    amounts,
    pours,
    selectedFlask,
    measuredCount,
    isSolved,
    isLoading,
    error,
    selectFlask,
    canPourInto,
  };
}
