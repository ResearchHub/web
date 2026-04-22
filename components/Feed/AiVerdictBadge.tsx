'use client';

import { FC } from 'react';
import { Gem } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Tooltip } from '@/components/ui/Tooltip';
import type { OverallRating } from '@/types/aiPeerReview';

interface AiVerdictBadgeProps {
  rating: OverallRating | null;
  className?: string;
  size?: 'default' | 'sm';
}

/**
 * Surfaces the automated review verdict only when it landed in the top tier.
 * Lower verdicts render nothing — we don't want to publicly tag a proposal as
 * "good" or "poor" since those reads are easy to misinterpret as a final call.
 */
export const AiVerdictBadge: FC<AiVerdictBadgeProps> = ({
  rating,
  className,
  size = 'default',
}) => {
  if (rating !== 'excellent') return null;
  const isSmall = size === 'sm';
  return (
    <Tooltip
      content="Automated quality check rated this proposal in the top tier."
      width="w-64"
      position="top"
    >
      <span
        className={cn(
          'inline-flex items-center rounded-md border border-green-200 bg-green-50 font-medium text-green-700',
          isSmall ? 'gap-0.5 px-1.5 py-0 text-[10px]' : 'gap-1 px-2 py-0.5 text-[11px]',
          className
        )}
      >
        <Gem size={isSmall ? 9 : 11} />
        Top rated
      </span>
    </Tooltip>
  );
};
