'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeedEntry, FeedPostContent } from '@/types/feed';
import { Avatar } from '@/components/ui/Avatar';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { formatCurrency } from '@/utils/currency';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { cn } from '@/utils/styles';
import { FundraiseProgressBar } from './FundraiseProgressBar';
import { differenceInDays } from 'date-fns';
import { Star } from 'lucide-react';

interface ProposalBadgeProps {
  children: React.ReactNode;
  className?: string;
}

const ProposalBadge: FC<ProposalBadgeProps> = ({ children, className }) => (
  <div
    className={cn(
      'bg-white/95  text-gray-900 text-[12px] border  border-white font-semibold px-2.5 py-1 rounded-full shadow-sm',
      className
    )}
  >
    {children}
  </div>
);

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

  const content = entry.content as FeedPostContent;
  const fundraise = content.fundraise;

  if (!fundraise) return null;

  const isCompleted = fundraise.status === 'COMPLETED';
  const isClosed = fundraise.status === 'CLOSED';
  const author = fundraise.createdBy?.authorProfile;
  const href = `/proposal/${content.id}/${content.slug}`;

  const goalAmount = showUSD ? fundraise.goalAmount.usd : fundraise.goalAmount.rsc;
  const isFinished = isCompleted || isClosed;
  const raisedAmount = isFinished
    ? goalAmount
    : showUSD
      ? fundraise.amountRaised.usd
      : fundraise.amountRaised.rsc;

  const daysRemaining = fundraise.endDate
    ? differenceInDays(new Date(fundraise.endDate), new Date())
    : null;
  const isEndingSoon =
    !isFinished && daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;

  const reviewScore = entry.metrics?.reviewScore;
  const hasReviewScore = reviewScore !== undefined && reviewScore > 0;

  const imageBlock = (aspectClass: string) => (
    <div
      className={cn('relative bg-gray-100 rounded-lg rounded-b-none overflow-hidden', aspectClass)}
    >
      {content.previewImage ? (
        <Image
          src={content.previewImage}
          alt={content.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <span className="text-primary-400 text-3xl font-mono">$</span>
        </div>
      )}
      <div className="absolute top-2 left-2 flex gap-1.5">
        {hasReviewScore && (
          <ProposalBadge className="flex items-center gap-1">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            {reviewScore.toFixed(1)}
          </ProposalBadge>
        )}
        {isEndingSoon && <ProposalBadge>Ending soon</ProposalBadge>}
      </div>
    </div>
  );

  const fundingRow = (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 min-w-0">
        <FundraiseProgressBar
          raisedAmount={raisedAmount}
          goalAmount={goalAmount}
          isCompleted={isCompleted}
          isClosed={isClosed}
        />
      </div>
      <div className="flex-shrink-0 flex items-baseline gap-1 text-xs font-mono">
        <span className="font-bold text-gray-900">
          {formatCurrency({
            amount: raisedAmount,
            showUSD,
            exchangeRate,
            shorten: true,
            skipConversion: true,
          })}
        </span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500">
          {formatCurrency({
            amount: goalAmount,
            showUSD,
            exchangeRate,
            shorten: true,
            skipConversion: true,
          })}
        </span>
      </div>
    </div>
  );

  return (
    <Link
      href={href}
      className={cn(
        'relative block rounded-xl flex flex-col border border-gray-200 overflow-hidden hover:bg-gray-50 transition-colors',
        isFinished && 'opacity-75',
        className
      )}
    >
      {imageBlock('aspect-[4/3]')}

      <div className="px-3 pt-2 pb-2 flex-1 flex gap-2">
        <div className="flex-shrink-0 pt-0.5">
          <Avatar src={author?.profileImage} alt={author?.fullName || 'Author'} size={24} />
        </div>
        <div className="min-w-0 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-3 mb-0.5">
            {content.title}
          </h3>
          <span className="text-xs text-gray-500 truncate">{author?.fullName}</span>
          <div className="flex-1" />
          {fundingRow}
        </div>
      </div>

      {showActions && (
        <div
          className="py-1.5 px-2 border-t bg-gray-50 cursor-default"
          onClick={(e) => e.preventDefault()}
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
          />
        </div>
      )}
    </Link>
  );
};
