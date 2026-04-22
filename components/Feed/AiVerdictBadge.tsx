'use client';

import { FC } from 'react';
import { Gem } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Tooltip } from '@/components/ui/Tooltip';
import type { OverallRating } from '@/types/aiPeerReview';

interface AiVerdictBadgeProps {
  rating: OverallRating | null;
  className?: string;
}

/**
 * Surfaces the automated review verdict only when it landed in the top tier.
 * Lower verdicts render nothing — we don't want to publicly tag a proposal as
 * "good" or "poor" since those reads are easy to misinterpret as a final call.
 */
export const AiVerdictBadge: FC<AiVerdictBadgeProps> = ({ rating, className }) => {
  if (rating !== 'excellent') return null;
  return (
    <Tooltip
      content="Automated quality check rated this proposal in the top tier."
      width="w-64"
      position="top"
    >
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700',
          className
        )}
      >
        <Gem size={11} />
        Top rated
      </span>
    </Tooltip>
  );
};
