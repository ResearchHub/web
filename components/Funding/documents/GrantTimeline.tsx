'use client';

import { Check } from 'lucide-react';
import { cn } from '@/utils/styles';
import { TIMELINE_STEPS, timelineStepIndex, type TimelineStepId } from './types';

interface GrantTimelineProps {
  /** The step in progress. Everything before it is done. */
  readonly currentStep: TimelineStepId;
  /** Every step done, including the current one. */
  readonly complete?: boolean;
  /** Tighter spacing and smaller type, for use inside a chat transcript. */
  readonly compact?: boolean;
  readonly className?: string;
}

/**
 * Where a funding program is in its life: a gradient track that fills as steps
 * complete, with the step in progress glowing at the fill's edge. Deliberately
 * linear, since the demo's program only ever moves forward.
 */
export const GrantTimeline = ({
  currentStep,
  complete = false,
  compact = false,
  className,
}: GrantTimelineProps) => {
  const stepCount = TIMELINE_STEPS.length;
  const currentIndex = timelineStepIndex(currentStep);
  // The track runs between the first and last node centres, so its inset on
  // each side is half a column and progress is measured in columns.
  const inset = `${50 / stepCount}%`;
  const progress = complete ? 1 : currentIndex / (stepCount - 1);
  const nodeSize = compact ? 22 : 26;

  return (
    <div className={cn('relative w-full', className)} aria-label="Program timeline">
      <div
        aria-hidden="true"
        className="absolute h-1 rounded-full bg-gray-100"
        style={{ left: inset, right: inset, top: nodeSize / 2 - 2 }}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-[width] duration-700 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <ol className="relative flex w-full items-start">
        {TIMELINE_STEPS.map((step, index) => {
          const isDone = complete || index < currentIndex;
          const isCurrent = !complete && index === currentIndex;

          return (
            <li key={step.id} className="flex min-w-0 flex-1 flex-col items-center">
              <div
                className={cn(
                  'relative flex items-center justify-center rounded-full transition-colors',
                  isDone && 'bg-gradient-to-br from-primary-500 to-indigo-500 text-white shadow-sm',
                  isCurrent &&
                    'bg-white text-primary-600 ring-2 ring-primary-500 shadow-[0_0_0_6px_rgba(99,102,241,0.14)]',
                  !isDone && !isCurrent && 'bg-white ring-2 ring-gray-200'
                )}
                style={{ width: nodeSize, height: nodeSize }}
              >
                {isCurrent && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary-400/30" />
                )}
                {isDone && (
                  <Check className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} strokeWidth={3} />
                )}
                {isCurrent && (
                  <span className="relative h-2 w-2 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500" />
                )}
              </div>

              <div
                className={cn(
                  'max-w-full truncate px-1 text-center',
                  compact ? 'mt-2 text-[11px]' : 'mt-2.5 text-xs',
                  isCurrent
                    ? 'font-semibold text-primary-700'
                    : isDone
                      ? 'font-medium text-gray-700'
                      : 'font-medium text-gray-400'
                )}
              >
                {step.label}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
