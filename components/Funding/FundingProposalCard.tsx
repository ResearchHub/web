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

  const isCompleted = fundraise.status === 'COMPLETED' || fundraise.status === 'CLOSED';
  const author = content.authors?.[0] || content.createdBy;
  const href = `/fund/${content.id}/${content.slug}`;

  // Calculate progress
  const goalAmount = showUSD ? fundraise.goalAmount.usd : fundraise.goalAmount.rsc;
  const raisedAmount = showUSD ? fundraise.amountRaised.usd : fundraise.amountRaised.rsc;
  const progressPercent = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;

  // Format time remaining
  const timeRemaining = fundraise.endDate
    ? formatDistanceToNowStrict(new Date(fundraise.endDate), { addSuffix: false })
    : null;

  return (
    <Link
      href={href}
      className={cn(
        'block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow',
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
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 mb-2 hover:text-primary-600 transition-colors">
          {content.title}
        </h3>

        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar src={author?.profileImage} alt={author?.fullName || 'Author'} size={24} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800 truncate">{author?.fullName}</p>
            {author?.headline && (
              <p className="text-xs text-gray-500 truncate">{author.headline}</p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isCompleted ? 'bg-green-500' : 'bg-primary-500'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
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

        {/* Actions */}
        <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.preventDefault()}>
          <FeedItemActions
            metrics={entry.metrics}
            feedContentType={entry.contentType}
            votableEntityId={content.id}
            relatedDocumentId={content.id.toString()}
            relatedDocumentContentType="post"
            userVote={entry.userVote}
            href={href}
            hideCommentButton={false}
            hideReportButton={true}
            showPeerReviews={false}
          />
        </div>
      </div>
    </Link>
  );
};
