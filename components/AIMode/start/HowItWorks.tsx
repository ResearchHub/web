'use client';

import { useEffect, useRef } from 'react';
import {
  ChevronDown,
  HandCoins,
  Megaphone,
  Route,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/styles';

/** The road from this conversation to funded science, for a funder. */
const RFP_STEPS: readonly {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly detail: string;
}[] = [
  { icon: Megaphone, title: 'Publish your RFP', detail: 'Set the scope, budget, and aim.' },
  {
    icon: Users,
    title: 'Researchers submit proposals',
    detail: 'We notify scientists who match your call.',
  },
  // The star is Peer Review's own, from the app's navigation.
  { icon: Star, title: 'Peer review', detail: 'Reviewers assess rigor and feasibility.' },
  { icon: HandCoins, title: 'Delegate the funds', detail: 'Choose which proposals get funded.' },
];

interface HowItWorksCardProps {
  readonly expanded: boolean;
  readonly onToggle: () => void;
  /** The id of the steps it opens. */
  readonly controls: string;
  readonly className?: string;
}

/**
 * Beside the concierge card, in its shape: opens the steps from this draft
 * to funded science underneath the pair.
 */
export function HowItWorksCard({ expanded, onToggle, controls, className }: HowItWorksCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={controls}
      className={cn(
        'group flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-primary-200 hover:bg-primary-50/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
        expanded ? 'border-primary-200' : 'border-gray-200',
        className
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Route className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-[0.07em] text-gray-500">
          How it works
        </span>
        <span className="block text-sm font-medium text-gray-900">
          From draft to funded science in four steps.
        </span>
      </span>
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:text-primary-700',
          expanded && 'rotate-180'
        )}
        aria-hidden="true"
      />
    </button>
  );
}

interface HowItWorksStepsProps {
  readonly id: string;
  readonly className?: string;
}

/**
 * The four steps, each with its icon, this conversation's first and in
 * colour; a connector runs icon to icon. Across the panel in four columns,
 * so it fills the width the two cards above it span; down it on a phone.
 */
export function HowItWorksSteps({ id, className }: HowItWorksStepsProps) {
  // On a phone they open below the fold: bring them up to where they were asked for.
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  return (
    <ol
      ref={ref}
      id={id}
      aria-label="How it works"
      className={cn(
        'flex flex-col rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 scroll-mb-24 tablet:grid tablet:grid-cols-4 tablet:py-5 animate-in fade-in slide-in-from-top-1 duration-200',
        className
      )}
    >
      {RFP_STEPS.map((step, index) => {
        const current = index === 0;
        const last = index === RFP_STEPS.length - 1;
        const Icon = step.icon;
        return (
          <li key={step.title} className="flex gap-3 tablet:flex-col tablet:gap-2.5">
            {/* The icon, and the connector to the next step: down the column
                on a phone, across to the next icon wider than that. */}
            <div className="flex w-8 shrink-0 flex-col items-center tablet:w-auto tablet:flex-row">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  current
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-200 bg-white text-gray-500'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              {!last && (
                <span
                  aria-hidden="true"
                  className="my-1 w-px flex-1 bg-gray-200 tablet:mx-2 tablet:my-0 tablet:h-px tablet:w-auto"
                />
              )}
            </div>
            <div
              className={cn(
                'flex min-w-0 flex-col gap-0.5 pt-1.5 tablet:pr-4 tablet:pt-0',
                !last && 'pb-4 tablet:pb-0'
              )}
            >
              <span
                className={cn(
                  'text-[13px] font-semibold',
                  current ? 'text-gray-900' : 'text-gray-700'
                )}
              >
                {step.title}
                {current && <span className="sr-only">(this conversation)</span>}
              </span>
              <span className="text-xs leading-relaxed text-gray-500">{step.detail}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
