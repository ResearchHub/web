'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { LeaderboardRank } from './LeaderboardRank';
import type { LeaderboardListItemBase } from './leaderboardList.types';
import { cn } from '@/utils/styles';

interface LeaderboardListRowProps {
  item: LeaderboardListItemBase;
  rank: number;
  amountLabel: string;
  currency: 'USD' | 'RSC';
  showUSD: boolean;
  isHighlighted: boolean;
  showYouLabel?: boolean;
}

export function LeaderboardListRow({
  item,
  rank,
  amountLabel,
  currency,
  showUSD,
  isHighlighted,
  showYouLabel,
}: LeaderboardListRowProps) {
  const authorId = item.authorProfile?.id;
  const rowClassName = cn(
    'flex items-center justify-between p-4 rounded-lg border',
    authorId && 'cursor-pointer',
    isHighlighted ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' : 'hover:bg-gray-100'
  );
  const content = (
    <>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <LeaderboardRank rank={rank} />
        {authorId ? (
          <AuthorTooltip authorId={authorId}>
            <Avatar
              src={item.authorProfile.profileImage}
              alt={item.authorProfile.fullName}
              size="md"
              authorId={authorId}
            />
          </AuthorTooltip>
        ) : (
          <Avatar
            src={item.authorProfile.profileImage}
            alt={item.authorProfile.fullName}
            size="md"
          />
        )}
        <div className="flex flex-col min-w-0">
          {authorId ? (
            <AuthorTooltip authorId={authorId}>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-900 truncate">
                  {item.authorProfile.fullName}
                  {showYouLabel && <span className="text-orange-600 font-medium"> (you)</span>}
                </span>
                {item.isVerified && <VerifiedBadge size="sm" />}
              </div>
            </AuthorTooltip>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-base font-medium text-gray-900 truncate">
                {item.authorProfile.fullName}
                {showYouLabel && <span className="text-orange-600 font-medium"> (you)</span>}
              </span>
              {item.isVerified && <VerifiedBadge size="sm" />}
            </div>
          )}
          {item.authorProfile.headline && (
            <span className="text-sm text-gray-500 line-clamp-2">
              {item.authorProfile.headline}
            </span>
          )}
          <div className="block sm:!hidden">
            <CurrencyBadge
              amount={item.amount}
              variant="text"
              size="md"
              label={amountLabel}
              currency={currency}
              textColor="text-gray-700"
              currencyLabelColor="text-gray-500"
              showIcon={true}
              showText={false}
              className="px-0"
            />
          </div>
        </div>
      </div>
      <div className="hidden sm:!block">
        <CurrencyBadge
          amount={item.amount}
          variant="text"
          size="md"
          label={amountLabel}
          currency={currency}
          textColor="text-gray-700"
          currencyLabelColor="text-gray-500"
          showIcon={true}
          showText={false}
        />
      </div>
    </>
  );

  if (authorId) {
    return (
      <Link href={`/author/${authorId}`} className={rowClassName}>
        {content}
      </Link>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}
