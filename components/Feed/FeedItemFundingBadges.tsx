'use client';

import { FC } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { TaxDeductibleBadge } from '@/components/ui/TaxDeductibleBadge';
import { FundraiseStatus } from '@/types/funding';
import type { Review } from '@/types/feed';

interface FeedItemFundingBadgesProps {
  reviewScore?: number;
  reviews?: Review[];
  href: string;
  isNonprofit?: boolean;
  fundraiseStatus?: FundraiseStatus;
  variant?: 'default' | 'overlay';
}

const overlayBadge = 'bg-black/50 backdrop-blur-sm border border-white/20';

export const FeedItemFundingBadges: FC<FeedItemFundingBadgesProps> = ({
  reviewScore,
  reviews,
  href,
  isNonprofit,
  fundraiseStatus,
  variant = 'default',
}) => {
  const hasReviewScore = reviewScore !== undefined && reviewScore > 0;
  const isCompleted = fundraiseStatus === 'COMPLETED';
  const isOverlay = variant === 'overlay';

  if (!hasReviewScore && !isNonprofit && !isCompleted) return null;

  return (
    <div className="flex items-center gap-1.5">
      {hasReviewScore && (
        <Tooltip
          content={
            <PeerReviewTooltip reviews={reviews ?? []} averageScore={reviewScore} href={href} />
          }
          position="top"
          width="w-[320px]"
        >
          <span
            className={`inline-flex items-center gap-1 cursor-help rounded-md px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
              isOverlay
                ? `${overlayBadge} text-white`
                : 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Star size={11} className="fill-amber-400 text-amber-400" />
            {reviewScore.toFixed(1)}
          </span>
        </Tooltip>
      )}

      {isCompleted ? (
        <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium bg-emerald-500 text-white border border-emerald-400">
          <CheckCircle size={12} className="text-white" />
          Funded
        </span>
      ) : (
        isNonprofit && (
          <TaxDeductibleBadge size="sm" variant={isOverlay ? 'overlay' : 'default'} showTooltip />
        )
      )}
    </div>
  );
};
