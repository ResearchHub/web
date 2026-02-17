'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { useGrants } from '@/contexts/GrantContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { formatCurrency } from '@/utils/currency';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { cn } from '@/utils/styles';
import { ArrowRight } from 'lucide-react';

interface GrantCardProps {
  grant: FeedEntry;
}

const GrantCard: FC<GrantCardProps> = ({ grant }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const content = grant.content as FeedGrantContent;
  const grantData = content.grant;

  if (!grantData) return null;

  const amount = showUSD ? grantData.amount.usd : grantData.amount.rsc;
  const href = `/funding/${grantData.id}`;

  // Get first 3 words for display
  const shortTitle = content.title.split(' ').slice(0, 5).join(' ');
  const displayTitle = shortTitle.length < content.title.length ? `${shortTitle}...` : shortTitle;

  return (
    <Link
      href={href}
      className="group block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-primary-200 transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Image */}
        <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {content.previewImage ? (
            <Image src={content.previewImage} alt={content.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <span className="text-primary-400 text-lg">$</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
            {displayTitle}
          </h3>
          <p className="text-sm font-semibold text-primary-600">
            {formatCurrency({
              amount,
              showUSD,
              exchangeRate,
              shorten: true,
              skipConversion: true,
            })}
          </p>
        </div>

        <ArrowRight
          size={16}
          className="text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1"
        />
      </div>
    </Link>
  );
};

const GrantCardSkeleton: FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  </div>
);

interface GrantPreviewAllProps {
  className?: string;
  /** Maximum number of grants to show */
  maxGrants?: number;
}

export const GrantPreviewAll: FC<GrantPreviewAllProps> = ({ className, maxGrants = 6 }) => {
  const { grants, isLoading } = useGrants();

  const displayGrants = grants.slice(0, maxGrants);

  // Calculate total available funding
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const totalFunding = grants.reduce((sum, grant) => {
    const content = grant.content as FeedGrantContent;
    const amount = showUSD ? content.grant?.amount.usd : content.grant?.amount.rsc;
    return sum + (amount || 0);
  }, 0);

  return (
    <div className={cn('bg-primary-50/50 rounded-xl p-6 border border-primary-100', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Available Funding</h2>
          {!isLoading && grants.length > 0 && (
            <p className="text-sm text-gray-600 mt-0.5">
              {grants.length} {grants.length === 1 ? 'opportunity' : 'opportunities'} totaling{' '}
              <span className="font-semibold text-primary-600">
                {formatCurrency({
                  amount: totalFunding,
                  showUSD,
                  exchangeRate,
                  shorten: true,
                  skipConversion: true,
                })}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading ? (
          <>
            <GrantCardSkeleton />
            <GrantCardSkeleton />
            <GrantCardSkeleton />
          </>
        ) : displayGrants.length > 0 ? (
          displayGrants.map((grant) => <GrantCard key={grant.id} grant={grant} />)
        ) : (
          <div className="col-span-full py-8 text-center">
            <p className="text-gray-500">No funding opportunities available</p>
          </div>
        )}
      </div>

      {/* View all link */}
      {grants.length > maxGrants && (
        <div className="mt-4 text-center">
          <Link
            href="/funding"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all {grants.length} opportunities
          </Link>
        </div>
      )}
    </div>
  );
};
