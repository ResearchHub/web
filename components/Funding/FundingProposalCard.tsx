'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeedEntry, FeedPostContent, AssociatedGrant } from '@/types/feed';
import { Avatar } from '@/components/ui/Avatar';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { formatCurrency } from '@/utils/currency';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { cn } from '@/utils/styles';
import { generateSlug } from '@/utils/url';
import { ProposalPeekView } from './ProposalPeekView';
import { differenceInDays } from 'date-fns';
import { Star } from 'lucide-react';

const GrantBadge: FC<{ grant: AssociatedGrant }> = ({ grant }) => {
  const href = `/grant/${grant.id}/${generateSlug(grant.shortTitle || grant.organization)}`;
  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 max-w-full text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-full px-2 py-0.5 transition-colors truncate"
    >
      <span className="truncate">{grant.shortTitle || grant.organization}</span>
    </Link>
  );
};

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

  const thumbnail = (
    <div className="relative flex-shrink-0 w-[120px] h-[90px] rounded-lg overflow-hidden bg-gray-100">
      {content.previewImage ? (
        <Image
          src={content.previewImage}
          alt={content.title}
          fill
          className="object-cover"
          sizes="120px"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <span className="text-primary-400 text-2xl font-mono">$</span>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 overflow-hidden',
        isFinished && 'opacity-75',
        className
      )}
    >
      <Link href={href} className="block hover:bg-gray-50 transition-colors">
        <div className="flex gap-3 p-3">
          {thumbnail}

          <div className="min-w-0 flex-1 flex flex-col">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {grants.map((grant) => (
                <GrantBadge key={grant.id} grant={grant} />
              ))}
              {hasReviewScore && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  {reviewScore.toFixed(1)}
                </span>
              )}
              {isEndingSoon && (
                <span className="text-[11px] font-medium text-red-600 bg-red-50 rounded-full px-2 py-0.5">
                  Ending soon
                </span>
              )}
            </div>

            <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2">
              {content.title}
            </h3>

            <div className="flex items-center justify-between gap-3 mt-auto pt-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Avatar src={author?.profileImage} alt={author?.fullName || 'Author'} size={18} />
                <span className="text-xs text-gray-500 truncate">{author?.fullName}</span>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className="text-sm font-bold font-mono text-gray-900">
                  {formatCurrency({
                    amount: goalAmount,
                    showUSD,
                    exchangeRate,
                    shorten: true,
                    skipConversion: true,
                  })}
                </span>
                <span className="text-[11px] text-gray-400 ml-1">needed</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {showActions && (
        <div
          className="py-1.5 px-3 border-t bg-gray-50 cursor-default"
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
