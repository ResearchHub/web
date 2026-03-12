'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeedEntry, FeedPostContent } from '@/types/feed';
import { Avatar } from '@/components/ui/Avatar';
import { GrantBadge } from '@/components/ui/GrantBadge';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { formatCurrency } from '@/utils/currency';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { cn } from '@/utils/styles';
import { ProposalPeekView } from './ProposalPeekView';
import { Tooltip } from '@/components/ui/Tooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { differenceInDays } from 'date-fns';
import { Star } from 'lucide-react';

interface FundingProposalCardProps {
  entry: FeedEntry;
  className?: string;
  showActions?: boolean;
}

export const FundingProposalCard: FC<FundingProposalCardProps> = ({
  entry,
  className,
  showActions = true,
}) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasBeenExpanded, setHasBeenExpanded] = useState(false);

  const content = entry.content as FeedPostContent;
  const fundraise = content.fundraise;
  const grants = entry.associatedGrants ?? [];

  if (!fundraise) return null;

  const isCompleted = fundraise.status === 'COMPLETED';
  const isClosed = fundraise.status === 'CLOSED';
  const author = fundraise.createdBy?.authorProfile;
  const href = `/proposal/${content.id}/${content.slug}`;

  const goalAmount = showUSD ? fundraise.goalAmount.usd : fundraise.goalAmount.rsc;
  const isFinished = isCompleted || isClosed;

  const daysRemaining = fundraise.endDate
    ? differenceInDays(new Date(fundraise.endDate), new Date())
    : null;
  const isEndingSoon =
    !isFinished && daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;

  const reviewScore = entry.metrics?.reviewScore;
  const hasReviewScore = reviewScore !== undefined && reviewScore > 0;

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 overflow-hidden',
        isFinished && 'opacity-75',
        className
      )}
    >
      <div className="flex flex-wrap p-3 gap-3">
        <div className="min-w-0 flex-1 basis-60 flex flex-col">
          <Link href={href} className="block hover:bg-gray-50 transition-colors -m-3 p-3">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {grants.map((grant) => (
                <GrantBadge key={grant.id} grant={grant} size="md" />
              ))}
              {hasReviewScore && (
                <Tooltip
                  content={
                    <PeerReviewTooltip
                      reviews={content.reviews ?? []}
                      averageScore={reviewScore}
                      href={href}
                    />
                  }
                  width="w-72"
                  delay={200}
                >
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-full px-2.5 py-1 transition-colors cursor-pointer">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    {reviewScore.toFixed(1)}
                  </span>
                </Tooltip>
              )}
              {isEndingSoon && (
                <span className="text-xs font-medium text-red-600 bg-red-50 rounded-full px-2.5 py-1">
                  Ending soon
                </span>
              )}
            </div>

            <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2">
              {content.title}
            </h3>

            <div className="flex items-center gap-1.5 mt-auto pt-1.5">
              <Avatar src={author?.profileImage} alt={author?.fullName || 'Author'} size={18} />
              <span className="text-xs text-gray-500 truncate">{author?.fullName}</span>
            </div>
          </Link>

          {showActions && (
            <div
              className="pt-3 pb-1.5 cursor-default"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <FeedItemActions
                metrics={entry.metrics}
                feedContentType={entry.contentType}
                votableEntityId={content.id}
                relatedDocumentId={content.id.toString()}
                relatedDocumentContentType="post"
                userVote={entry.userVote}
                href={href}
                hideCommentButton={true}
                hideReportButton={true}
                showPeerReviews={true}
                relatedDocumentUnifiedDocumentId={content.unifiedDocumentId}
                onExpand={() => {
                  setIsExpanded((prev) => !prev);
                  setHasBeenExpanded(true);
                }}
                isExpanded={isExpanded}
              />
            </div>
          )}
        </div>

        <div className="relative w-[190px] flex-shrink-0 self-stretch min-h-[100px] rounded-lg overflow-hidden bg-gray-100">
          {content.previewImage ? (
            <Image
              src={content.previewImage}
              alt={content.title}
              fill
              className="object-cover"
              sizes="190px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <span className="text-primary-400 text-2xl font-mono">$</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-primary-600/85 backdrop-blur-sm px-2.5 py-1.5 flex items-center justify-center gap-1 rounded-b-lg">
            <span className="text-sm font-bold font-mono text-white">
              {formatCurrency({
                amount: goalAmount,
                showUSD,
                exchangeRate,
                shorten: true,
                skipConversion: true,
              })}
            </span>
            <span className="text-[11px] text-white/80 font-medium">needed</span>
          </div>
        </div>
      </div>

      {hasBeenExpanded && (
        <div className={isExpanded ? '' : 'hidden'}>
          <ProposalPeekView
            postId={content.id}
            slug={content.slug}
            fundraise={fundraise}
            title={content.title}
          />
        </div>
      )}
    </div>
  );
};
