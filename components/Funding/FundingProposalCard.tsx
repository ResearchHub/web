'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeedEntry, FeedPostContent } from '@/types/feed';
import { Avatar } from '@/components/ui/Avatar';
import { Clock } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { formatCurrency } from '@/utils/currency';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { cn } from '@/utils/styles';
import { FundraiseProgressBar } from './FundraiseProgressBar';

interface FundingProposalCardProps {
  entry: FeedEntry;
  className?: string;
}

export const FundingProposalCard: FC<FundingProposalCardProps> = ({ entry, className }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const content = entry.content as FeedPostContent;
  const fundraise = content.fundraise;

  if (!fundraise) return null;
  console.log('fundraise', fundraise);
  const isCompleted = fundraise.status === 'COMPLETED' || fundraise.status === 'CLOSED';
  const author = fundraise.createdBy?.authorProfile;
  const href = `/fund/${content.id}/${content.slug}`;

  // Calculate amounts for progress bar
  const goalAmount = showUSD ? fundraise.goalAmount.usd : fundraise.goalAmount.rsc;
  const raisedAmount = showUSD ? fundraise.amountRaised.usd : fundraise.amountRaised.rsc;

  // Format time remaining
  const timeRemaining = fundraise.endDate
    ? formatDistanceToNowStrict(new Date(fundraise.endDate), { addSuffix: false })
    : null;

  // Get education from author profile
  const education = author?.education;
  const educationDisplay =
    (author?.education?.length || 0) > 0 ? `${author?.education?.[0]?.name}` : null;

  return (
    <Link
      href={href}
      className={cn(
        'block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col',
        isCompleted && 'opacity-75',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] bg-gray-100">
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
            <span className="text-primary-400 text-4xl">$</span>
          </div>
        )}

        {/* Status badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            Completed
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 min-h-[2.5rem] mb-2 hover:text-primary-600 transition-colors">
          {content.title}
        </h3>

        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar src={author?.profileImage} alt={author?.fullName || 'Author'} size={24} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800 truncate">{author?.fullName}</p>
            {educationDisplay && (
              <p className="text-xs text-gray-500 truncate">{educationDisplay}</p>
            )}
          </div>
        </div>

        {/* Spacer to push progress bar to consistent position */}
        <div className="flex-1" />

        {/* Progress bar - always at same position due to flex layout */}
        <div className="mb-2">
          <FundraiseProgressBar
            raisedAmount={raisedAmount}
            goalAmount={goalAmount}
            isCompleted={isCompleted}
          />
        </div>

        {/* Funding info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-gray-900">
              {formatCurrency({
                amount: raisedAmount,
                showUSD,
                exchangeRate,
                shorten: true,
                skipConversion: true,
              })}
            </span>
            <span className="text-gray-400">/</span>
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

          {timeRemaining && !isCompleted && (
            <div className="flex items-center gap-1 text-gray-500">
              <Clock size={12} />
              <span className="text-xs">Ends in {timeRemaining}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions - Gray background band at bottom */}
      <div
        className="px-4 py-2 border-t border-gray-200 bg-gray-50 cursor-default"
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
    </Link>
  );
};
