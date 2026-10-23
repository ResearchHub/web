'use client';

import { FC } from 'react';
import { CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

interface FoundationAwardedBadgeProps {
  /** `md` heads a review card; `sm` sits on a byline's name line. */
  size?: 'md' | 'sm';
}

/**
 * "Awarded": the ResearchHub Foundation's editors reviewed and approved this review.
 * Decide whether to show it with `isFoundationAssessedReview`.
 */
export const FoundationAwardedBadge: FC<FoundationAwardedBadgeProps> = ({ size = 'md' }) => (
  <Tooltip
    content={
      <div className="flex items-start gap-3 text-left">
        <CheckCircle className="h-10 w-10 text-green-600" />
        <div>Reviewed and approved by the ResearchHub Foundation Editor Team.</div>
      </div>
    }
    position="top"
    width="w-[320px]"
  >
    {size === 'md' ? (
      <Badge variant="success" className="gap-1 border-green-600 cursor-pointer gap-1.5 py-1">
        <CheckCircle className="h-4 w-4" />
        Awarded
      </Badge>
    ) : (
      <Badge
        variant="success"
        className="cursor-default gap-1 rounded-md px-1.5 py-0 text-xs font-medium leading-5"
      >
        <CheckCircle className="h-3 w-3" />
        Awarded
      </Badge>
    )}
  </Tooltip>
);
