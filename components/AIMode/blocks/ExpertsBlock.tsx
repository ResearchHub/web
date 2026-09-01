'use client';

import { Check, Clock } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { INVITED_EXPERTS } from '../lib/experts';

interface ExpertsBlockProps {
  readonly heading?: string;
}

/**
 * The first updates checkpoint: who the assistant invited to submit a proposal,
 * before a single proposal exists. It is the beat that shows the funder work
 * happening on his behalf while there is nothing yet to decide.
 */
export const ExpertsBlock = ({ heading }: ExpertsBlockProps) => {
  const accepted = INVITED_EXPERTS.filter((expert) => expert.accepted).length;

  return (
    <div className="mt-4 max-w-[620px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-3.5 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {heading ?? 'Experts invited'}
        </span>
        <span className="text-xs text-gray-500">
          {accepted} of {INVITED_EXPERTS.length} accepted
        </span>
      </div>

      <div>
        {INVITED_EXPERTS.map((expert) => (
          <div
            key={expert.name}
            className="flex items-center gap-3 border-t border-gray-100 px-3.5 py-2.5 first:border-t-0"
          >
            <Avatar src={expert.avatarUrl} alt={expert.name} size="sm" disableTooltip />

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-gray-900">{expert.name}</div>
              <div className="truncate text-xs text-gray-500">
                {expert.axis} · {expert.affiliation}
              </div>
            </div>

            {expert.accepted ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                <Check className="h-3 w-3" />
                Accepted
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-gray-500">
                <Clock className="h-3 w-3" />
                Invited
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
