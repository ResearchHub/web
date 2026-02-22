'use client';

import { useRouter } from 'next/navigation';
import { KeyboardEvent } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { LeaderboardRank } from './LeaderboardRank';
import type { LeaderboardListItemBase } from './leaderboardList.types';
import { useDeviceType } from '@/hooks/useDeviceType';
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
  const router = useRouter();
  const deviceType = useDeviceType();
  const authorId = item.authorProfile?.id;
  const href = authorId ? `/author/${authorId}` : undefined;

  const isDesktop = deviceType === 'desktop';

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, [role="button"], input, select, textarea');
    if (isInteractive || !href) return;

    if (e.button === 1) {
      window.open(href, '_blank');
      return;
    }
    if (e.button === 0) {
      if (e.metaKey || e.ctrlKey) {
        window.open(href, '_blank');
      } else {
        router.push(href, { scroll: false });
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!href) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      router.push(href, { scroll: false });
    }
  };

  const rowClassName = cn(
    'flex items-center justify-between p-4 rounded-lg border',
    authorId && 'cursor-pointer',
    isHighlighted && 'bg-orange-50 border-orange-200',
    authorId && (isHighlighted ? 'md:hover:!bg-orange-100' : 'md:hover:!bg-gray-100')
  );

  const renderName = () => (
    <div className="flex items-center gap-1">
      <span className="text-base font-medium text-gray-900 truncate">
        {item.authorProfile.fullName}
        {showYouLabel && <span className="text-orange-600 font-medium"> (you)</span>}
      </span>
      {item.isVerified && <VerifiedBadge size="sm" />}
    </div>
  );

  const content = (
    <>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <LeaderboardRank rank={rank} />
        {authorId && isDesktop ? (
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
            authorId={authorId || undefined}
          />
        )}
        <div className="flex flex-col min-w-0">
          {authorId && isDesktop ? (
            <AuthorTooltip authorId={authorId}>{renderName()}</AuthorTooltip>
          ) : (
            renderName()
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
      <div
        className={rowClassName}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onAuxClick={(e) => {
          if (e.button === 1 && href) {
            e.preventDefault();
            window.open(href, '_blank');
          }
        }}
        role="link"
        tabIndex={0}
        aria-label={`View ${item.authorProfile?.fullName ?? 'author'} profile`}
      >
        {content}
      </div>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}
