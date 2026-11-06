'use client';

import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Flask } from '@/components/PourReview/Flask';
import type { PourReviewPuzzle } from '@/types/pourReview';
import { formatDate } from '@/utils/date';

const HOW_TO_STEPS = [
  ['Tap a flask', 'to pick it up.'],
  ['Tap another', 'to pour. It flows until one is empty or the other is full.'],
  ['Hit the target', 'in as few pours as possible.'],
];

interface PourReviewIntroProps {
  puzzle: PourReviewPuzzle;
  onPlay: () => void;
}

export function PourReviewIntro({ puzzle, onPlay }: PourReviewIntroProps) {
  const currentStreak = puzzle.stats?.currentStreak;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      <span className="text-[11px] font-bold uppercase tracking-wider text-primary-500">
        ResearchHub Daily
      </span>
      <div className="mb-3.5 mt-4 drop-shadow-[0_16px_24px_rgba(57,113,255,0.25)]">
        <Flask capacity={4} amount={3} width={96} hasBubbles />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Pour Review</h1>
      <p className="mt-2.5 max-w-xs text-gray-600">
        Measure out exactly the right amount in as few pours as you can.
      </p>
      <p className="mt-3.5 text-sm font-semibold text-gray-500">
        No. {puzzle.number} · {formatDate(puzzle.date, 'dddd, MMMM D')}
      </p>
      {!!currentStreak && (
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
          <Flame size={14} strokeWidth={2.4} />
          {currentStreak}-day streak
        </span>
      )}
      <Button size="lg" className="mt-6 w-full" onClick={onPlay}>
        Play today&apos;s puzzle
      </Button>
      <ol className="mt-5 w-full space-y-2.5 rounded-2xl bg-gray-100 p-4 text-left text-sm text-gray-600">
        {HOW_TO_STEPS.map(([action, detail], index) => (
          <li key={action} className="flex items-start gap-3">
            <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-white text-xs font-extrabold text-primary-500 ring-[1.5px] ring-inset ring-primary-200">
              {index + 1}
            </span>
            <span>
              <b className="text-gray-900">{action}</b> {detail}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-xs text-gray-400">New puzzle every day at midnight ET</p>
    </div>
  );
}
