'use client';

import { Avatar } from '@/components/ui/Avatar';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { navigateToAuthorProfile } from '@/utils/navigation';

export interface CurrentUserBannerItem {
  id: number;
  authorProfile: {
    id?: number;
    fullName: string;
    profileImage: string;
    headline?: string;
  };
  isVerified: boolean;
  rank?: number;
  amount: number;
}

interface CurrentUserBannerProps {
  currentUser: CurrentUserBannerItem;
  amountLabel: string;
  showUSD: boolean;
  /** When "row", renders as a table row (rank, avatar, name, amount) to match the list. */
  variant?: 'banner' | 'row';
}

export function CurrentUserBanner({
  currentUser,
  amountLabel,
  showUSD,
  variant = 'banner',
}: CurrentUserBannerProps) {
  const authorId = currentUser.authorProfile?.id;
  const baseClass =
    'flex items-center gap-4 p-4 rounded-lg border border-orange-200 bg-orange-50/80 cursor-pointer hover:bg-orange-50';

  if (variant === 'row') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => authorId && navigateToAuthorProfile(authorId)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (authorId) {
              navigateToAuthorProfile(authorId);
            }
          }
        }}
        className={baseClass}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span className="font-semibold text-base w-8 text-center text-orange-600">
            {currentUser.rank ?? '—'}
          </span>
          {authorId ? (
            <AuthorTooltip authorId={authorId}>
              <Avatar
                src={currentUser.authorProfile.profileImage}
                alt={currentUser.authorProfile.fullName}
                size="md"
                authorId={authorId}
              />
            </AuthorTooltip>
          ) : (
            <Avatar
              src={currentUser.authorProfile.profileImage}
              alt={currentUser.authorProfile.fullName}
              size="md"
            />
          )}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-base font-medium text-gray-900 truncate">
                {currentUser.authorProfile.fullName}
                <span className="text-orange-600 font-medium"> (you)</span>
              </span>
              {currentUser.isVerified && <VerifiedBadge size="sm" />}
            </div>
            {currentUser.authorProfile.headline && (
              <span className="text-sm text-gray-500 line-clamp-2">
                {currentUser.authorProfile.headline}
              </span>
            )}
            <div className="block sm:!hidden mt-1">
              <CurrencyBadge
                amount={currentUser.amount}
                variant="text"
                size="md"
                label={amountLabel}
                currency={showUSD ? 'USD' : 'RSC'}
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
            amount={currentUser.amount}
            variant="text"
            size="md"
            label={amountLabel}
            currency={showUSD ? 'USD' : 'RSC'}
            textColor="text-gray-700"
            currencyLabelColor="text-gray-500"
            showIcon={true}
            showText={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => authorId && navigateToAuthorProfile(authorId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (authorId) {
            navigateToAuthorProfile(authorId);
          }
        }
      }}
      className={`${baseClass} mb-4`}
    >
      {authorId ? (
        <AuthorTooltip authorId={authorId}>
          <Avatar
            src={currentUser.authorProfile.profileImage}
            alt={currentUser.authorProfile.fullName}
            size="md"
            authorId={authorId}
          />
        </AuthorTooltip>
      ) : (
        <Avatar
          src={currentUser.authorProfile.profileImage}
          alt={currentUser.authorProfile.fullName}
          size="md"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-medium text-gray-900">{currentUser.authorProfile.fullName}</span>
          {currentUser.isVerified && <VerifiedBadge size="sm" />}
        </div>
        <p className="text-sm text-gray-600 mt-0.5">
          {currentUser.rank != null ? (
            <>
              You are ranked{' '}
              <span className="font-semibold text-orange-700">#{currentUser.rank}</span>
              {' with '}
              <CurrencyBadge
                amount={currentUser.amount}
                variant="text"
                size="xs"
                label={amountLabel}
                currency={showUSD ? 'USD' : 'RSC'}
                textColor="text-orange-700"
                currencyLabelColor="text-gray-600"
                showIcon={true}
                showText={false}
                className="inline"
              />
            </>
          ) : (
            <>
              Your total:{' '}
              <CurrencyBadge
                amount={currentUser.amount}
                variant="text"
                size="xs"
                label={amountLabel}
                currency={showUSD ? 'USD' : 'RSC'}
                textColor="text-orange-700"
                currencyLabelColor="text-gray-600"
                showIcon={true}
                showText={false}
                className="inline"
              />
            </>
          )}
        </p>
      </div>
      <div className="hidden sm:!block flex-shrink-0">
        <CurrencyBadge
          amount={currentUser.amount}
          variant="text"
          size="md"
          label={amountLabel}
          currency={showUSD ? 'USD' : 'RSC'}
          textColor="text-gray-700"
          currencyLabelColor="text-gray-500"
          showIcon={true}
          showText={false}
        />
      </div>
    </div>
  );
}
