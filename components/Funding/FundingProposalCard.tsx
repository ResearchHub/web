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
  const href = `/fund/${content.id}/${content.slug}`;

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

  const statusBadge = isEndingSoon ? (
    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
      Ending soon
    </div>
  ) : null;

  const imageBlock = (aspectClass: string) => (
    <div
      className={cn(
        'relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-100',
        aspectClass
      )}
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
      {statusBadge}
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
      {imageBlock('aspect-[16/9]')}

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
          className="py-1.5 px-2 border-t border-gray-100 cursor-default"
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
