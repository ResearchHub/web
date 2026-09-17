'use client';

import { ClipboardCheck, HandCoins, Megaphone, Users, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/styles';

export interface FundingTimelineStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

/**
 * The lifecycle of a request for proposal from the funder's side, in order.
 * Every surface that explains how funding works reads from here so the
 * sequence and the wording stay in one place.
 */
export const FUNDING_TIMELINE_STEPS: FundingTimelineStep[] = [
  {
    id: 'publish',
    title: 'Publish your RFP',
    description: 'Set the scope, budget, and deadline.',
    icon: Megaphone,
  },
  {
    id: 'proposals',
    title: 'Experts submit proposals',
    description: 'We notify scientists who match your call.',
    icon: Users,
  },
  {
    id: 'review',
    title: 'Open peer review',
    description: 'Reviewers assess rigor and feasibility.',
    icon: ClipboardCheck,
  },
  {
    id: 'delegate',
    title: 'Delegate the funds',
    description: 'Choose which proposals get funded.',
    icon: HandCoins,
  },
];

interface FundingTimelineProps {
  className?: string;
}

/**
 * Vertical timeline of the RFP lifecycle: a continuous rail with one icon
 * node per step and a title plus a single line under each. The first node is
 * filled to read as "you are here" for a funder about to publish.
 */
export function FundingTimeline({ className }: FundingTimelineProps) {
  return (
    <ol className={cn('flex flex-col', className)}>
      {FUNDING_TIMELINE_STEPS.map((step, index) => {
        const isFirst = index === 0;
        const isLast = index === FUNDING_TIMELINE_STEPS.length - 1;
        const StepIcon = step.icon;

        return (
          <li key={step.id} className="flex gap-4">
            <div className="flex w-8 flex-shrink-0 flex-col items-center">
              <span
                className={cn(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                  isFirst
                    ? 'bg-rhBlue-600 text-white ring-4 ring-rhBlue-100'
                    : 'border-2 border-rhBlue-200 bg-white text-rhBlue-600'
                )}
              >
                <StepIcon className="h-4 w-4" aria-hidden="true" />
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn('w-0.5 flex-1 bg-rhBlue-200', isFirst && 'mt-1')}
                />
              )}
            </div>
            <div className={cn('min-w-0 pt-1.5', !isLast && 'pb-5')}>
              <div className="text-[15px] font-semibold leading-[1.3] text-gray-900">
                {step.title}
              </div>
              <div className="mt-0.5 text-sm leading-[1.5] text-gray-500">{step.description}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
