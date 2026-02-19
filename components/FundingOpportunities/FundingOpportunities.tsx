'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { Icon } from '@/components/ui/icons/Icon';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import {
  useFundingOpportunities,
  FundingOpportunity,
} from '@/contexts/FundingOpportunitiesContext';
import { buildWorkUrl } from '@/utils/url';

const FundingOpportunitySkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={`funding-skeleton-${i}`}
        className="grid grid-cols-[40px_1fr_auto] gap-x-3 items-center px-1 py-2 rounded-md"
      >
        <div className="w-10 h-10 bg-gray-200 rounded-md" />
        <div className="space-y-1.5">
          <div className="h-3.5 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-3.5 bg-gray-200 rounded w-14 justify-self-end" />
      </div>
    ))}
  </div>
);

export const FundingOpportunitiesSkeleton = () => (
  <div>
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-start gap-2">
        <Icon name="fund" size={20} className="text-primary-600 mt-0.5 flex-shrink-0" />
        <h2 className="font-semibold text-gray-900">Funding Opportunities</h2>
      </div>
      <div className="text-xs text-gray-700 flex items-center gap-0.5 mt-1">
        View All
        <ChevronRight className="w-3 h-3" />
      </div>
    </div>
    <FundingOpportunitySkeleton />
  </div>
);

function OpportunityRow({
  opportunity,
  showUSD,
  showImage,
}: {
  readonly opportunity: FundingOpportunity;
  readonly showUSD: boolean;
  readonly showImage: boolean;
}) {
  const href = buildWorkUrl({
    id: opportunity.id,
    slug: opportunity.slug,
    contentType: 'funding_request',
  });

  return (
    <Link
      href={href}
      className="grid grid-cols-[40px_1fr_auto] gap-x-3 items-center px-1 py-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
    >
      {/* Image (only first item) */}
      <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
        {showImage ? (
          opportunity.previewImage ? (
            <Image
              src={opportunity.previewImage}
              alt={opportunity.title}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Icon name="fund" size={18} className="text-gray-400" />
            </div>
          )
        ) : null}
      </div>

      {/* Title + Organization */}
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate leading-tight">
          {opportunity.title}
        </p>
        {opportunity.organization && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{opportunity.organization}</p>
        )}
      </div>

      {/* Amount */}
      <div className="flex-shrink-0 text-right flex items-center">
        <CurrencyBadge
          amount={opportunity.amountRsc}
          variant="text"
          size="sm"
          currency={showUSD ? 'USD' : 'RSC'}
          shorten={true}
          showIcon={true}
          showText={showUSD}
          textColor="text-orange-500"
          className="justify-end"
        />
      </div>
    </Link>
  );
}

export const FundingOpportunities = () => {
  const { opportunities, isLoading, error, fetchData } = useFundingOpportunities();
  const { showUSD } = useCurrencyPreference();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-2">
          <Icon name="fund" size={20} className="text-primary-600 mt-0.5 flex-shrink-0" />
          <h2 className="font-semibold text-gray-900">Funding Opportunities</h2>
        </div>
        <Link
          href="/fund"
          className="text-xs text-gray-700 hover:underline flex items-center gap-0.5 mt-1"
        >
          View All
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <FundingOpportunitySkeleton />
      ) : error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : opportunities.length > 0 ? (
        <div className="space-y-1">
          {opportunities.map((opp, index) => (
            <OpportunityRow
              key={opp.id}
              opportunity={opp}
              showUSD={showUSD}
              showImage={index === 0}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mt-4 text-center">
          No open funding opportunities right now.
        </p>
      )}
    </div>
  );
};
