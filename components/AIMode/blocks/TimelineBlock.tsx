'use client';

import { Check } from 'lucide-react';
import { GrantTimeline, TIMELINE_STEPS, timelineStepIndex } from '@/components/Funding/documents';
import type { TimelineStepId } from '../lib/types';

interface TimelineBlockProps {
  readonly step: TimelineStepId;
  readonly complete?: boolean;
}

/**
 * Where the program is now, dropped into the transcript whenever a step moves.
 * `step` is the one in progress; the funder should never have to ask "so what
 * stage are we at?".
 */
export const TimelineBlock = ({ step, complete = false }: TimelineBlockProps) => {
  const index = timelineStepIndex(step);
  const current = TIMELINE_STEPS[index];

  return (
    <div className="relative max-w-[620px] overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-4 shadow-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 100% 0%, rgba(99,102,241,0.10) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(59,130,246,0.06) 0%, transparent 50%)',
        }}
      />
      <div className="relative mb-5 flex items-center justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Program timeline
        </div>
        {complete ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <Check className="h-3 w-3" strokeWidth={3} />
            Complete
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700 ring-1 ring-primary-200">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
            {current.label}
            <span className="font-medium text-primary-500/80">
              · {index + 1} of {TIMELINE_STEPS.length}
            </span>
          </span>
        )}
      </div>
      <GrantTimeline currentStep={step} complete={complete} compact className="relative" />
    </div>
  );
};
