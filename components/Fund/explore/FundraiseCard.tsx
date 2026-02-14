'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Fundraise } from '@/types/funding';
import { AuthorProfile } from '@/types/authorProfile';
import { cn } from '@/utils/styles';
import { Avatar } from '@/components/ui/Avatar';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { formatDeadline, isDeadlineInFuture } from '@/utils/date';
import { Clock, Target } from 'lucide-react';

interface FundraiseCardProps {
  fundraise: Fundraise & {
    title: string;
    description: string;
    authors: AuthorProfile[];
    previewImage?: string;
    grantId: number;
  };
  grantTitle?: string;
  className?: string;
}

export const FundraiseCard: FC<FundraiseCardProps> = ({
  fundraise,
  className,
}) => {
  const { showUSD } = useCurrencyPreference();

  const progressPercentage = Math.min(
    100,
    Math.max(0, (fundraise.amountRaised.rsc / fundraise.goalAmount.rsc) * 100)
  );

  const deadlineText = fundraise.endDate ? formatDeadline(fundraise.endDate) : undefined;
  const isActive = fundraise.status === 'OPEN' && 
    (fundraise.endDate ? isDeadlineInFuture(fundraise.endDate) : true);
  const isCompleted = fundraise.status === 'COMPLETED' || 
    (fundraise.status === 'OPEN' && fundraise.endDate && !isDeadlineInFuture(fundraise.endDate));

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toLocaleString();
  };

  const raisedDisplay = showUSD
    ? `$${formatAmount(fundraise.amountRaised.usd)}`
    : `${formatAmount(fundraise.amountRaised.rsc)} RSC`;

  const goalDisplay = showUSD
    ? `$${formatAmount(fundraise.goalAmount.usd)}`
    : `${formatAmount(fundraise.goalAmount.rsc)} RSC`;

  // Primary author
  const primaryAuthor = fundraise.authors[0];

  return (
    <Link
      href={`/fund/${fundraise.id}`}
      className={cn(
        'group block bg-white rounded-xl border border-gray-200 overflow-hidden',
        'transition-all duration-200 hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5',
        className
      )}
    >
      {/* Image Section */}
      <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
        {fundraise.previewImage ? (
          <Image
            src={fundraise.previewImage}
            alt={fundraise.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <Target size={40} className="text-primary-400" />
          </div>
        )}
        
        {/* Status badge - only show for completed */}
        {isCompleted && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 text-xs font-medium bg-gray-400 text-white rounded-full shadow-sm">
              Completed
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
          {fundraise.title}
        </h3>

        {/* Primary author + institution */}
        {primaryAuthor && (
          <div className="flex items-center gap-2 mb-4">
            <Avatar
              src={primaryAuthor.profileImage}
              alt={primaryAuthor.fullName}
              size="xs"
            />
            <div className="min-w-0">
              <span className="text-xs font-medium text-gray-700 truncate block">
                {primaryAuthor.fullName}
              </span>
              {primaryAuthor.headline && (
                <span className="text-xs text-gray-400 truncate block">
                  {primaryAuthor.headline}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Progress Section */}
        <div className="space-y-2">
          <div className={cn(
            'w-full rounded-lg h-2',
            isCompleted ? 'bg-gray-100' : 'bg-primary-50'
          )}>
            <div
              className={cn(
                'rounded-lg h-2 transition-all duration-300',
                isCompleted ? 'bg-gray-400' : 'bg-primary-500'
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Stats row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className={cn(
                'font-bold',
                isCompleted ? 'text-gray-500' : 'text-primary-600'
              )}>
                {raisedDisplay}
              </span>
              <span className="text-gray-400">/ {goalDisplay}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-500">
              {deadlineText && !deadlineText.includes('Ended') && (
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{deadlineText}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
