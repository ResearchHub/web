'use client';

import { useState } from 'react';
import { BarChart3, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { Flask } from '@/components/PourReview/Flask';
import { PourReviewIntro } from '@/components/PourReview/PourReviewIntro';
import { PourReviewResultsModal } from '@/components/modals/PourReviewResultsModal';
import { usePourReview } from '@/hooks/usePourReview';
import { cn } from '@/utils/styles';

const EYEBROW_CLASS = 'text-[11px] font-bold uppercase tracking-wider text-gray-500';
const FLASK_WIDTH_BY_COUNT: Record<number, number> = { 3: 124, 4: 92 };

export function PourReviewGame() {
  const {
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
  } = usePourReview();
  const [hasStarted, setHasStarted] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(true);

  if (isLoading) {
    return <Loader size="lg" className="mx-auto mt-24" />;
  }

  if (!puzzle) {
    return <p className="mt-24 text-center text-gray-500">{error}</p>;
  }

  if (!hasStarted && !pours.length) {
    return <PourReviewIntro puzzle={puzzle} onPlay={() => setHasStarted(true)} />;
  }

  const { flasks, targetAmount, targetCount, par } = puzzle;
  const poursOverPar = pours.length - par;
  const isOverPar = poursOverPar > 0;

  return (
    <div className="mx-auto max-w-md">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">
          Pour Review <span className="font-semibold text-gray-500">#{puzzle.number}</span>
        </h1>
        {isSolved && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsResultsOpen(true)}
            aria-label="View results"
          >
            <BarChart3 size={20} />
          </Button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-[20px] bg-primary-50 px-5 py-4">
        <div>
          <div className={EYEBROW_CLASS}>Target</div>
          <div className="text-[32px] font-extrabold leading-tight text-gray-900">
            {targetCount > 1 && `${targetCount} × `}
            {targetAmount} mL
          </div>
          {targetCount === 1 ? (
            <div className="mt-0.5 text-sm text-gray-600">in any flask</div>
          ) : (
            <div className="mt-1.5 flex gap-1.5">
              {Array.from({ length: targetCount }, (_, dose) => (
                <span
                  key={dose}
                  className={cn(
                    'flex items-center gap-1 rounded-full border-[1.5px] px-2 py-1 text-xs font-bold',
                    dose < measuredCount
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-dashed border-primary-200 text-gray-500'
                  )}
                >
                  {dose < measuredCount && <Check size={12} strokeWidth={3.4} />}
                  {targetAmount} mL
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 whitespace-nowrap border-l border-primary-200 pl-5 text-right">
          <div className={EYEBROW_CLASS}>Pours</div>
          <div className="text-[32px] font-extrabold leading-tight">
            <span className={isOverPar ? 'text-red-600' : 'text-gray-900'}>{pours.length}</span>
            <span className="text-gray-400"> / {par}</span>
          </div>
          <div
            className={cn('mt-0.5 text-sm', isOverPar ? 'font-bold text-red-600' : 'text-gray-600')}
          >
            {isOverPar ? `${poursOverPar} over par` : `par ${par}`}
          </div>
        </div>
      </div>

      <div className="mt-14 flex justify-center text-gray-600">
        {isSolved ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
            <Check size={14} strokeWidth={3} />
            {targetAmount} mL measured
          </span>
        ) : selectedFlask === null ? (
          'Tap a flask to pick it up'
        ) : (
          <span>
            Pour the <b className="text-gray-900">{flasks[selectedFlask]} mL</b> flask into…
          </span>
        )}
      </div>

      <div className="relative flex items-end justify-evenly px-2 pt-8">
        <div className="absolute inset-x-3.5 bottom-[38px] h-2.5 rounded-md bg-primary-100" />
        {flasks.map((capacity, flask) => {
          const amount = amounts[flask];
          const isMeasured = amount === targetAmount;
          const isSelected = flask === selectedFlask;
          const flaskWidth = FLASK_WIDTH_BY_COUNT[flasks.length] * (capacity / flasks[0]) ** 0.45;

          return (
            <button
              key={flask}
              type="button"
              onClick={() => selectFlask(flask)}
              aria-label={`${amount} of ${capacity} mL`}
              className={cn(
                'relative flex flex-col items-center rounded-[20px] border-2 border-dashed border-transparent px-2 pt-2.5',
                canPourInto(flask) && 'border-primary-200 bg-primary-50/70',
                isSelected && 'border-solid border-primary-500 bg-primary-50'
              )}
            >
              <div
                className={cn(
                  'leading-none',
                  isMeasured && 'drop-shadow-[0_0_16px_rgba(57,113,255,0.55)]'
                )}
              >
                <Flask
                  capacity={capacity}
                  amount={amount}
                  width={Math.round(flaskWidth)}
                  hasBubbles={isSolved && isMeasured}
                />
              </div>
              <div className="flex h-[46px] items-center gap-1 whitespace-nowrap">
                <b
                  className={cn(
                    'text-xl font-extrabold',
                    isSelected || isMeasured ? 'text-primary-500' : 'text-gray-900'
                  )}
                >
                  {amount}
                </b>
                <span className="text-[13px] font-semibold text-gray-500">/ {capacity} mL</span>
                {isMeasured && <Check size={16} strokeWidth={3} className="text-green-600" />}
              </div>
            </button>
          );
        })}
      </div>

      <PourReviewResultsModal
        isOpen={isSolved && isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        puzzle={puzzle}
        pourCount={pours.length}
      />
    </div>
  );
}
